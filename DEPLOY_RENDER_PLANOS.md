# 🚀 GUIA COMPLETO: DEPLOY NO RENDER + GESTÃO DE PLANOS

**Data:** 12/02/2026  
**Projeto:** Restaurant Landing Page SaaS  

---

## 📦 1. DEPLOY NO RENDER (VIA POWERSHELL)

### 1.1. Pré-requisitos
```powershell
# Verificar se está na pasta correta
cd F:\VSCode\Landpage

# Verificar status do Git
git status

# Ver último commit
git log --oneline -1
```

---

### 1.2. Commit e Push das Mudanças

```powershell
# Adicionar TODAS as mudanças do sistema de planos
git add .

# Commit com mensagem descritiva
git commit -m "feat: Sistema de planos Essential/Professional implementado

- Adiciona middleware de validação de plano
- Protege features PRO (logo, brand color, favicon, team, QR code)
- Gating no admin panel com badges e overlays
- Frontend condicional em about.html
- Seeds com variável PLAN
- Endpoint /api/plan para consulta pública"

# Push para o GitHub (isso triggará o deploy automático no Render)
git push origin main
```

---

### 1.3. Acompanhar Deploy no Render

```powershell
# Abrir o dashboard do Render no browser
start https://dashboard.render.com/

# OU ver logs via Render CLI (se instalado)
# render logs -f
```

**Passos no Dashboard:**
1. Entre em **Dashboard → Web Services → [Seu Serviço]**
2. Aguarde o build (5-10 min)
3. Verifique os logs:
   - ✅ "Build successful"
   - ✅ "Deploy successful"
   - ✅ Servidor rodando na porta 3000

---

### 1.4. Forçar Rebuild Manualmente (se necessário)

Se o deploy automático não triggar:

```powershell
# Via PowerShell com API do Render (requer API key)
$RENDER_API_KEY = "rnd_xxxxxxxxxxxxx"  # Sua API key
$SERVICE_ID = "srv-xxxxxxxxxxxxx"       # ID do seu web service

$headers = @{
    "Authorization" = "Bearer $RENDER_API_KEY"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "https://api.render.com/v1/services/$SERVICE_ID/deploys" `
    -Method POST `
    -Headers $headers `
    -Body '{"clearCache":"clear"}'
```

**OU pelo Dashboard:**
1. Dashboard → Web Service → **Manual Deploy**
2. Escolha branch `main`
3. Clique **"Deploy latest commit"**

---

## 💾 2. ALTERAR PLANO DO SITE NO BANCO DE DADOS

### 2.1. Via Render Dashboard (PostgreSQL)

```powershell
# Abrir o banco no Render
start https://dashboard.render.com/

# Navegue até: Dashboard → PostgreSQL → [Seu Database] → Connect
```

**No Browser (Render SQL Editor):**

1. Clique na aba **"Shell"** ou **"SQL Editor"**
2. Cole e execute:

```sql
-- Ver plano atual
SELECT * FROM site_config WHERE key = 'site_plan';

-- Atualizar para Professional
UPDATE site_config 
SET value = 'professional' 
WHERE key = 'site_plan';

-- Confirmar mudança
SELECT * FROM site_config WHERE key = 'site_plan';
```

---

### 2.2. Via PowerShell com psql (conexão direta)

```powershell
# Obter DATABASE_URL do Render
# Dashboard → PostgreSQL → [Database] → Connection String (External)
$DATABASE_URL = "postgresql://user:pass@dpg-xxxxx.render.com:5432/dbname"

# Instalar psql (se não tiver)
# winget install PostgreSQL.PostgreSQL

# Conectar ao banco
psql $DATABASE_URL

# OU executar query diretamente
psql $DATABASE_URL -c "UPDATE site_config SET value = 'professional' WHERE key = 'site_plan';"
```

---

### 2.3. Via PowerShell com curl (API REST alternativa)

Se você criasse um endpoint admin para alteração de plano:

```powershell
# NOTA: Este endpoint NÃO existe ainda. Precisaria criar.
$API_URL = "https://seusite.onrender.com"
$ADMIN_TOKEN = "seu_jwt_token"

$headers = @{
    "Authorization" = "Bearer $ADMIN_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    plan = "professional"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$API_URL/api/admin/plan" `
    -Method PUT `
    -Headers $headers `
    -Body $body
```

---

## 🔧 3. VERIFICAR MUDANÇA DE PLANO

### 3.1. Teste via Browser
```powershell
# Abrir site
start https://seusite.onrender.com

# Fazer login no admin
start https://seusite.onrender.com/admin.html
```

**Verificações:**
- [x] Badge no sidebar mostra "⭐ Profissional"
- [x] Tabs "Sobre / Equipe" e "QR Code" sem badge PRO
- [x] Seção Team liberada (sem overlay)
- [x] Campos PRO config habilitados

---

### 3.2. Teste via API
```powershell
# Verificar plano via endpoint público
Invoke-RestMethod -Uri "https://seusite.onrender.com/api/plan"

# Resultado esperado (Professional):
# {
#   "success": true,
#   "data": {
#     "plan": "professional",
#     "isProfessional": true,
#     "features": {
#       "customLogo": true,
#       "brandColor": true,
#       "teamSection": true,
#       "qrCode": true,
#       "favicon": true
#     }
#   }
# }
```

---

## 🎯 4. WORKFLOWS COMUNS

### 4.1. Cliente Novo (Plano Essential)
```powershell
# 1. Deploy no Render
git push origin main

# 2. Aguardar build

# 3. Rodar seed (Render Shell ou via startup)
# Dashboard → Web Service → Shell
cd server
PLAN=essential npx prisma db seed

# 4. Cliente acessa site com plano Essential
```

---

### 4.2. Upgrade Essential → Professional
```powershell
# 1. Conectar ao banco
psql $DATABASE_URL

# 2. Executar SQL
UPDATE site_config SET value = 'professional' WHERE key = 'site_plan';

# 3. Verificar no admin (não precisa restart)
# Frontend recarrega plano automaticamente ao fazer login
```

---

### 4.3. Downgrade Professional → Essential
```powershell
# 1. AVISO: Features PRO ficam ocultas mas NÃO são deletadas
psql $DATABASE_URL

# 2. Executar SQL
UPDATE site_config SET value = 'essential' WHERE key = 'site_plan';

# 3. Dados PRO (team_members, logo, etc) permanecem no DB
#    mas ficam inacessíveis via API e UI
```

---

## 📊 5. MONITORAMENTO PÓS-DEPLOY

### 5.1. Verificar Logs
```powershell
# Via Render Dashboard
start "https://dashboard.render.com/"

# Ou via CLI
# render logs --tail 100 --service [service-id]
```

---

### 5.2. Healthcheck
```powershell
# Verificar se servidor está UP
Invoke-RestMethod -Uri "https://seusite.onrender.com/healthz"

# Resultado esperado:
# {
#   "status": "ok",
#   "timestamp": "2026-02-12T...",
#   "uptime": 123.45
# }
```

---

## 🛠️ 6. TROUBLESHOOTING

### ❌ Deploy falhou
```powershell
# 1. Ver logs no Render Dashboard
# 2. Verificar se package.json está correto
# 3. Verificar variáveis de ambiente (DATABASE_URL, JWT_SECRET, etc)

# 4. Rebuild forçado
# Dashboard → Manual Deploy → Clear cache → Deploy
```

---

### ❌ Plano não mudou após UPDATE SQL
```powershell
# 1. Verificar se query foi executada
psql $DATABASE_URL -c "SELECT * FROM site_config WHERE key = 'site_plan';"

# 2. Limpar cache do browser (Ctrl+Shift+R)

# 3. Fazer logout e login novamente no admin
#    (fetchPlanInfo() roda no login)
```

---

### ❌ Erro "relation site_config does not exist"
```powershell
# Rodar migrations
cd server
npx prisma migrate deploy

# Depois rodar seed
PLAN=essential npx prisma db seed
```

---

## 🔐 7. VARIÁVEIS DE AMBIENTE NO RENDER

**Dashboard → Web Service → Environment → Environment Variables**

| Variável | Valor | Obrigatório |
|---|---|---|
| `DATABASE_URL` | (Internal URL do PostgreSQL) | ✅ |
| `JWT_SECRET` | (string aleatória segura) | ✅ |
| `NODE_ENV` | `production` | ✅ |
| `APP_URL` | `https://seusite.onrender.com` | ✅ |
| `CLOUDINARY_CLOUD_NAME` | (seu cloud name) | ✅ |
| `CLOUDINARY_API_KEY` | (sua API key) | ✅ |
| `CLOUDINARY_API_SECRET` | (seu secret) | ✅ |
| `PLAN` | `essential` ou `professional` | ⚠️ (apenas para seed inicial) |

---

## 📝 8. SCRIPT COMPLETO: DEPLOY + ATUALIZAR PLANO

```powershell
# ================================
# SCRIPT COMPLETO DE DEPLOY
# ================================

# Configurar variáveis
$DATABASE_URL = "postgresql://user:pass@host:5432/db"
$SITE_URL = "https://seusite.onrender.com"
$NEW_PLAN = "professional"  # ou "essential"

Write-Host "🚀 Iniciando deploy completo..." -ForegroundColor Cyan

# 1. Commit e Push
Write-Host "`n📦 Fazendo commit..." -ForegroundColor Yellow
git add .
git commit -m "Deploy: Atualização do sistema"
git push origin main

Write-Host "✅ Push concluído. Aguardando deploy no Render..." -ForegroundColor Green
Write-Host "   Acesse: https://dashboard.render.com/ para acompanhar" -ForegroundColor Gray

# 2. Aguardar deploy (estimativa 5-10 min)
Write-Host "`n⏳ Aguardando 5 minutos para deploy..." -ForegroundColor Yellow
Start-Sleep -Seconds 300

# 3. Verificar se site está UP
Write-Host "`n🔍 Verificando healthcheck..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$SITE_URL/healthz" -ErrorAction Stop
    Write-Host "✅ Site está UP! Status: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Site não respondeu. Verifique logs no Render." -ForegroundColor Red
    exit 1
}

# 4. Atualizar plano no banco
Write-Host "`n💾 Atualizando plano para: $NEW_PLAN" -ForegroundColor Yellow
$query = "UPDATE site_config SET value = '$NEW_PLAN' WHERE key = 'site_plan';"
psql $DATABASE_URL -c $query

# 5. Verificar via API
Write-Host "`n🔍 Verificando plano via API..." -ForegroundColor Yellow
$planInfo = Invoke-RestMethod -Uri "$SITE_URL/api/plan"
Write-Host "✅ Plano atual: $($planInfo.data.plan)" -ForegroundColor Green
Write-Host "   Features PRO: $($planInfo.data.isProfessional)" -ForegroundColor Gray

# 6. Abrir admin
Write-Host "`n🌐 Abrindo admin panel..." -ForegroundColor Yellow
Start-Process "$SITE_URL/admin.html"

Write-Host "`n🎉 Deploy concluído com sucesso!" -ForegroundColor Cyan
Write-Host "   Site: $SITE_URL" -ForegroundColor Gray
Write-Host "   Plano: $NEW_PLAN" -ForegroundColor Gray
```

---

## ✅ CHECKLIST FINAL

- [ ] Código commitado e pusheado
- [ ] Deploy automático completado no Render
- [ ] Healthcheck retorna status "ok"
- [ ] Plano atualizado no banco via SQL
- [ ] API `/api/plan` retorna plano correto
- [ ] Admin panel mostra badge correto
- [ ] Features PRO liberadas/bloqueadas conforme esperado
- [ ] Site público funciona sem erros
- [ ] Logs sem erros críticos

---

## 📞 SUPORTE

**Em caso de dúvidas:**
1. Verifique logs no Render Dashboard
2. Consulte [AUDITORIA_PLANOS.md](AUDITORIA_PLANOS.md) para detalhes técnicos
3. Revise variáveis de ambiente
4. Teste localmente antes de deploy

---

**Última atualização:** 12/02/2026
