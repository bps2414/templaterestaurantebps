# 🎯 EXEMPLOS PRÁTICOS — GESTÃO DE PLANOS

## 📋 CENÁRIOS REAIS DE USO

---

## 1️⃣ CLIENTE NOVO: PLANO ESSENTIAL

### Situação
Novo cliente contrata o template. Você quer dar acesso básico sem features PRO.

### PowerShell
```powershell
# Fazer deploy com plano Essential (padrão)
cd F:\VSCode\Landpage
git add .
git commit -m "Deploy para cliente X - Plano Essential"
git push origin main

# Render vai fazer deploy automático
# Aguardar 5-10 minutos

# Verificar se está rodando
Invoke-RestMethod -Uri "https://cliente-x.onrender.com/healthz"

# Rodar seed inicial (se necessário via Render Shell)
# cd server
# PLAN=essential npx prisma db seed
```

### Resultado
- ✅ Site funcional completo
- ❌ Sem logo personalizada
- ❌ Sem cor da marca
- ❌ Sem seção de equipe
- ❌ Sem QR Code

---

## 2️⃣ UPGRADE: ESSENTIAL → PROFESSIONAL

### Situação
Cliente pagou plano PRO. Você precisa liberar todas as features.

### PowerShell
```powershell
# Obter DATABASE_URL do Render
# Dashboard → PostgreSQL → Connection String (External)
$DATABASE_URL = "postgresql://user:pass@dpg-xxxxx.render.com:5432/dbname"

# Atualizar plano
psql $DATABASE_URL -c "UPDATE site_config SET value = 'professional' WHERE key = 'site_plan';"

# Verificar via API
Invoke-RestMethod -Uri "https://cliente-x.onrender.com/api/plan"

# Resultado esperado:
# {
#   "plan": "professional",
#   "isProfessional": true,
#   "features": { "customLogo": true, ... }
# }
```

### Resultado
- ✅ Todas as features liberadas
- ✅ Admin pode adicionar membros da equipe
- ✅ Admin pode configurar logo, cor, favicon
- ✅ Admin pode gerar QR Code
- ✅ **SEM RESTART DO SERVIDOR NECESSÁRIO**

---

## 3️⃣ TESTE LOCAL: ALTERNAR PLANOS

### PowerShell Local
```powershell
# Iniciar servidor local
cd F:\VSCode\Landpage\server
npm run dev

# Em outro terminal: Conectar ao DB local
$LOCAL_DB = "postgresql://postgres:postgres@localhost:5432/landpage"

# Testar Essential
psql $LOCAL_DB -c "UPDATE site_config SET value = 'essential' WHERE key = 'site_plan';"

# Abrir admin e verificar
start http://localhost:3000/admin.html

# Testar Professional
psql $LOCAL_DB -c "UPDATE site_config SET value = 'professional' WHERE key = 'site_plan';"

# Fazer logout/login no admin para ver mudança
```

---

## 4️⃣ VERIFICAR PLANO ATUAL DE UM CLIENTE

### PowerShell
```powershell
# Via API (público)
$plan = Invoke-RestMethod -Uri "https://cliente-x.onrender.com/api/plan"
Write-Host "Plano atual: $($plan.data.plan)"

# Via SQL
$DATABASE_URL = "postgresql://..."
psql $DATABASE_URL -c "SELECT value FROM site_config WHERE key = 'site_plan';"
```

---

## 5️⃣ DOWNGRADE: PROFESSIONAL → ESSENTIAL

### Situação
Cliente não pagou e precisa voltar para Essential.

### ⚠️ IMPORTANTE
Dados PRO (team_members, logo_url, etc) **NÃO SÃO DELETADOS**, apenas ficam inacessíveis.

### PowerShell
```powershell
$DATABASE_URL = "postgresql://..."

# Downgrade
psql $DATABASE_URL -c "UPDATE site_config SET value = 'essential' WHERE key = 'site_plan';"

# Verificar
Invoke-RestMethod -Uri "https://cliente-x.onrender.com/api/plan"
```

### Resultado
- ✅ Site continua funcionando
- ❌ Features PRO bloqueadas
- ⚠️ Dados PRO permanecem no banco (podem ser restaurados)

---

## 6️⃣ SEED INICIAL COM PLANO ESPECÍFICO

### PowerShell (Render Shell)
```bash
# Render Dashboard → Web Service → Shell

# Essential (padrão)
cd server
PLAN=essential npx prisma db seed

# Professional
cd server
PLAN=professional npx prisma db seed
```

### Local
```powershell
cd F:\VSCode\Landpage\server

# Essential
$env:PLAN = "essential"
npx prisma db seed

# Professional
$env:PLAN = "professional"
npx prisma db seed
```

---

## 7️⃣ SCRIPT AUTOMATIZADO: GESTÃO DE MÚLTIPLOS CLIENTES

### PowerShell
```powershell
# Criar array de clientes
$clientes = @(
    @{ Nome = "Pizzaria X"; URL = "https://pizzaria-x.onrender.com"; DB = "postgresql://..."; Plano = "essential" },
    @{ Nome = "Burger Y"; URL = "https://burger-y.onrender.com"; DB = "postgresql://..."; Plano = "professional" },
    @{ Nome = "Restaurante Z"; URL = "https://restaurante-z.onrender.com"; DB = "postgresql://..."; Plano = "professional" }
)

# Processar cada cliente
foreach ($cliente in $clientes) {
    Write-Host "`nProcessando: $($cliente.Nome)" -ForegroundColor Cyan
    
    # Atualizar plano
    psql $cliente.DB -c "UPDATE site_config SET value = '$($cliente.Plano)' WHERE key = 'site_plan';"
    
    # Verificar via API
    $plan = Invoke-RestMethod -Uri "$($cliente.URL)/api/plan"
    
    if ($plan.data.plan -eq $cliente.Plano) {
        Write-Host "✅ $($cliente.Nome): Plano $($cliente.Plano) configurado" -ForegroundColor Green
    } else {
        Write-Host "❌ $($cliente.Nome): ERRO ao configurar plano" -ForegroundColor Red
    }
}
```

---

## 8️⃣ MONITORAMENTO: VERIFICAR PLANOS DE TODOS OS CLIENTES

### PowerShell
```powershell
$clientes = @(
    @{ Nome = "Pizzaria X"; DB = "postgresql://..." },
    @{ Nome = "Burger Y"; DB = "postgresql://..." }
)

Write-Host "`n📊 RELATÓRIO DE PLANOS" -ForegroundColor Cyan
Write-Host "=" * 50

foreach ($cliente in $clientes) {
    $plano = psql $cliente.DB -t -c "SELECT value FROM site_config WHERE key = 'site_plan';" | Out-String
    $plano = $plano.Trim()
    
    $cor = if ($plano -eq "professional") { "Green" } else { "Yellow" }
    Write-Host "$($cliente.Nome): " -NoNewline
    Write-Host "$plano" -ForegroundColor $cor
}
```

---

## 9️⃣ TESTE DE BYPASS (SEGURANÇA)

### Tentar burlar proteção (deve falhar)
```powershell
# Setup
$API_URL = "https://cliente-essential.onrender.com"
$TOKEN = "seu_jwt_admin_token"

# Tentar enviar logo_url no Essential
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    logo_url = "https://evil.com/logo.png"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$API_URL/api/config" `
        -Method PUT `
        -Headers $headers `
        -Body $body
    
    Write-Host "❌ FALHA DE SEGURANÇA: Conseguiu enviar logo_url!" -ForegroundColor Red
} catch {
    Write-Host "✅ SEGURANÇA OK: Bloqueado como esperado" -ForegroundColor Green
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Gray
}
```

---

## 🔟 BACKUP DOS DADOS PRO ANTES DE DOWNGRADE

### PowerShell
```powershell
$DATABASE_URL = "postgresql://..."

# Exportar dados PRO para JSON
$team = psql $DATABASE_URL -t -c "SELECT value FROM site_config WHERE key = 'team_members';" | Out-String
$logo = psql $DATABASE_URL -t -c "SELECT value FROM site_config WHERE key = 'logo_url';" | Out-String
$brand = psql $DATABASE_URL -t -c "SELECT value FROM site_config WHERE key = 'brand_color';" | Out-String

# Salvar backup
$backup = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    team_members = $team.Trim()
    logo_url = $logo.Trim()
    brand_color = $brand.Trim()
} | ConvertTo-Json

$backup | Out-File "backup_pro_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"

Write-Host "✅ Backup salvo!" -ForegroundColor Green

# Agora pode fazer downgrade com segurança
psql $DATABASE_URL -c "UPDATE site_config SET value = 'essential' WHERE key = 'site_plan';"
```

---

## 📋 REFERÊNCIAS RÁPIDAS

| Ação | Comando |
|------|---------|
| Ver plano atual | `psql $DB -c "SELECT * FROM site_config WHERE key = 'site_plan';"` |
| Essential → Pro | `psql $DB -c "UPDATE site_config SET value = 'professional' WHERE key = 'site_plan';"` |
| Pro → Essential | `psql $DB -c "UPDATE site_config SET value = 'essential' WHERE key = 'site_plan';"` |
| Verificar via API | `Invoke-RestMethod -Uri "$URL/api/plan"` |
| Healthcheck | `Invoke-RestMethod -Uri "$URL/healthz"` |

---

**Última atualização:** 12/02/2026
