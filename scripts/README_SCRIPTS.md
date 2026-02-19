# 🛠️ Scripts de Automação

Scripts para facilitar deploy, backup e manutenção dos clientes.

---

## 📋 Índice

1. [Provisionamento Automático](#1-provisionamento-automático)
2. [Backup Local](#2-backup-local)
3. [Backup Automático (GitHub Actions)](#3-backup-automático-github-actions)

---

## 1. Provisionamento Automático

**Arquivo:** `scripts/provision_client.js`

**O que faz:** Cria um cliente novo do zero em ~2 minutos (vs 20min manual).

**Etapas automatizadas:**
- ✅ Cria banco de dados no Neon
- ✅ Roda migrations + seed com dados customizados
- ✅ Cria Application no Coolify (Docker build via API)
- ✅ Configura todas as 12 env vars automaticamente
- ✅ Configura domínio + SSL (Let's Encrypt)
- ✅ Salva credenciais em `clients/nome-cliente.json`

### Setup Inicial (uma vez só)

**Windows PowerShell:**
```powershell
# 1. API Key do Neon
# Acesse: https://console.neon.tech/app/settings/api-keys → Generate new API key
$env:NEON_API_KEY="neon_api_xxx"

# 2. API Key do Coolify
# Acesse: Coolify Dashboard → Settings → API → Generate Token
$env:COOLIFY_API_KEY="coolify-token-xxx"
$env:COOLIFY_BASE_URL="https://coolify.seudominio.com.br"
$env:COOLIFY_SERVER_UUID="server-uuid-aqui"
$env:COOLIFY_PROJECT_UUID="project-uuid-aqui"

# 3. Repositório GitHub (seu repo privado)
$env:GITHUB_REPO="https://github.com/seu-usuario/restaurant-template"

# 4. Domínio base para subdomínios dos clientes
$env:BASE_DOMAIN="seudominio.com.br"

# 5. Credenciais Cloudinary (mesmas para todos clientes)
# Acesse: https://console.cloudinary.com → Dashboard → Product Environment Settings
$env:CLOUDINARY_CLOUD_NAME="dmebhvwpo"
$env:CLOUDINARY_API_KEY="123456789"
$env:CLOUDINARY_API_SECRET="AbCdEfGh12345"
```

**Linux/Mac:**
```bash
export NEON_API_KEY="neon_api_xxx"
export COOLIFY_API_KEY="coolify-token-xxx"
export COOLIFY_BASE_URL="https://coolify.seudominio.com.br"
export COOLIFY_SERVER_UUID="server-uuid-aqui"
export COOLIFY_PROJECT_UUID="project-uuid-aqui"
export GITHUB_REPO="https://github.com/seu-usuario/restaurant-template"
export BASE_DOMAIN="seudominio.com.br"
export CLOUDINARY_CLOUD_NAME="dmebhvwpo"
export CLOUDINARY_API_KEY="123456789"
export CLOUDINARY_API_SECRET="AbCdEfGh12345"
```

> 💡 **Dica:** Salve essas variáveis em um arquivo `scripts/.env.local` e rode `source scripts/.env.local` antes de usar.

### Usar

```bash
node scripts/provision_client.js
```

**O script vai perguntar:**
1. Nome do cliente (ex: `pizzaria-napoli`)
2. Tipo de seed (`restaurante`, `hamburgueria`, `confeitaria`)
3. Email do admin
4. Senha do admin
5. Plano (`essential` ou `professional`)
6. Região do Neon (`us-west-2`, `us-east-2`, `eu-central-1`)
7. Domínio customizado (opcional — default: `nome-cliente.seudominio.com.br`)

**Output esperado:**
```
✅ PROVISIONAMENTO CONCLUÍDO COM SUCESSO!

🌐 URL do site:     https://pizzaria-napoli.seudominio.com.br
🔐 Painel admin:    https://pizzaria-napoli.seudominio.com.br/admin
📧 Email:           dono@napoli.com
🔑 Senha:           NapoliSenha123!
📦 Plano:           professional
🚀 Coolify App:     https://coolify.seudominio.com.br/project/xxx
```

**Arquivo criado:** `clients/pizzaria-napoli.json` com todas as informações (Neon, Coolify, credenciais).

> 📝 **Fallback Manual:** Se a API do Coolify não estiver disponível, siga o guia manual no [deploy_client.md](../.agent/workflows/deploy_client.md) (Opção B).

---

## 2. Backup Local

**Arquivo:** `scripts/backup_all_clients.sh`

**O que faz:** Cria dumps de todos os bancos de dados dos clientes usando `pg_dump`.

**Backups salvos em:** `$HOME/restaurant-backups/YYYY-MM-DD/cliente.dump`

### Setup Inicial

1. **Instalar PostgreSQL client:**

   **Windows:** https://www.postgresql.org/download/windows/ (só o client, não precisa do servidor)
   
   **Linux:**
   ```bash
   sudo apt install postgresql-client
   ```
   
   **Mac:**
   ```bash
   brew install postgresql
   ```

2. **Editar o script:**

   Abra `scripts/backup_all_clients.sh` e adicione seus clientes na array `CLIENTS`:

   ```bash
   CLIENTS=(
     "restaurante-saborarte|postgresql://user:pass@ep-xxx-pooler.neon.tech/neondb?sslmode=require"
     "pizzaria-napoli|postgresql://user:pass@ep-yyy-pooler.neon.tech/neondb?sslmode=require"
   )
   ```

   > 💡 Para pegar a connection string: Neon Dashboard → seu projeto → Connection Details → Pooled connection

### Usar Manualmente

```bash
bash scripts/backup_all_clients.sh
```

**Output esperado:**
```
🗄️  BACKUP AUTOMÁTICO - 2026-02-13
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Backup: restaurante-saborarte
   ✅ Sucesso! Tamanho: 1.2M

📦 Backup: pizzaria-napoli
   ✅ Sucesso! Tamanho: 850K

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ BACKUP CONCLUÍDO
Sucesso:   2 clientes
Salvos em: /home/user/restaurant-backups/2026-02-13
```

### Automação (Windows Task Scheduler)

1. Abra **Task Scheduler** (Agendador de Tarefas)
2. **Create Task** → aba **General**:
   - Name: `Restaurant Backup`
   - Run whether user is logged on or not
3. Aba **Triggers** → New:
   - Weekly, Sunday, 3:00 AM
4. Aba **Actions** → New:
   - Program: `C:\Program Files\Git\bin\bash.exe`
   - Arguments: `F:\VSCode\Landpage\scripts\backup_all_clients.sh`
5. OK → Digite sua senha do Windows

**Agora o backup roda todo domingo às 3am automaticamente.**

### Restaurar um Backup

```bash
pg_restore -d "postgresql://connection-string-do-neon" backup.dump
```

> ⚠️ **Atenção:** Isso **sobrescreve** o banco de produção. Teste em um projeto Neon separado primeiro!

---

## 3. Backup Automático (GitHub Actions)

**Arquivo:** `.github/workflows/backup.yml`

**O que faz:** Roda backup semanal **na nuvem** via GitHub Actions (grátis, até 2000 min/mês).

**Vantagens:**
- ✅ Não precisa deixar PC ligado
- ✅ Usa Neon Branching (instant, point-in-time)
- ✅ Grátis (plano free do GitHub)
- ✅ Histórico de backups no Neon Console

### Setup Inicial

1. **Gerar API Key do Neon:**
   - Acesse: https://console.neon.tech/app/settings/api-keys
   - Generate new API key → copie

2. **Adicionar Secret no GitHub:**
   - Seu repo → Settings → Secrets and variables → Actions
   - New repository secret:
     - Name: `NEON_API_KEY`
     - Value: [cola a API key]

3. **Editar `.github/workflows/backup.yml`:**

   Adicione os Project IDs dos seus clientes:

   ```yaml
   CLIENTS=(
     "ep-ancient-pond-af1vq6j6"  # restaurante-saborarte
     "ep-cool-forest-a8k3jf9s"   # pizzaria-napoli
   )
   ```

   > 💡 Para pegar o Project ID: Neon Dashboard → seu projeto → olhe na URL: `https://console.neon.tech/app/projects/ep-xxx`

4. **Commit e push:**

   ```bash
   git add .github/workflows/backup.yml
   git commit -m "ci: adicionar backup automático semanal"
   git push origin main
   ```

### Como Funciona

- ✅ **Toda semana:** domingo às 3am UTC (0h BRT)
- ✅ **Cria branch** no Neon (tipo snapshot do banco)
- ✅ **Nomeia:** `backup-20260213`, `backup-20260220`, etc
- ✅ **Mantém 4 últimos** (deleta os mais antigos)

### Usar Manualmente

GitHub repo → **Actions** → **Weekly Database Backup** → **Run workflow**

### Restaurar um Backup

1. Acesse https://console.neon.tech
2. Selecione o projeto do cliente
3. **Branches** → veja a lista de backups (`backup-YYYYMMDD`)
4. Clique no backup desejado → **Restore**
5. Escolha: substituir `main` OU criar branch nova

> 💡 **Dica:** Crie branch nova para testar antes de substituir produção.

---

## 📊 Comparação de Métodos

| Método | Custo | Setup | Automação | Restauração |
|--------|-------|-------|-----------|-------------|
| **GitHub Actions** | Grátis | 5 min | Semanal | 1 clique (Neon Console) |
| **Backup Local** | Grátis | 10 min | Task Scheduler | CLI (`pg_restore`) |
| **Neon Manual** | Grátis | - | Manual | 1 clique |

**Recomendação:**
- ✅ **Primeiros 5 clientes:** Só Neon rollback (6h no passado) + GitHub Actions
- ✅ **10+ clientes:** Adicionar backup local mensal (redundância)

---

## ❓ FAQ

**P: E se eu esquecer de adicionar um cliente no script de backup?**

R: Ele não vai ser backupado automaticamente. Recomendo manter uma planilha (Notion/Airtable) com todos os clientes e conferir mensalmente.

**P: Backup local ou GitHub Actions?**

R: **GitHub Actions** (mais simples). Backup local só se você quiser redundância extra.

**P: Quantos backups o Neon mantém?**

R: No plano Free: sem limite de branches, mas cada branch conta para o storage total (0.5GB). GitHub Actions limpa automaticamente (mantém 4).

**P: Posso restaurar para um banco diferente?**

R: Sim! Use `pg_restore -d "outra-connection-string" backup.dump` ou crie um novo projeto Neon e restore lá.

---

**Suporte:** Se algum script falhar, abra issue no GitHub ou entre em contato.
