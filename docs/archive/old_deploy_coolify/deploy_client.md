---
description: Automates the full deployment process for a new client (Neon + Seed + Coolify VPS)
---

# Deploy de Novo Cliente — Coolify (VPS Self-Hosted)

> **Pré-requisito**: Coolify instalado e configurado na VPS. Caso contrário, ver [DEPLOY_VPS_CHECKLIST.md](../../docs/DEPLOY_VPS_CHECKLIST.md).

---

## 0. Pré-requisitos do Operador

Antes de iniciar, confirme:

| Requisito | Verificação |
|-----------|-------------|
| Coolify instalado na VPS | `https://coolify.seudominio.com.br` acessível |
| Domínio base configurado | DNS Wildcard `*.seudominio.com.br` → IP da VPS |
| GitHub repo conectado ao Coolify | Source configurado no Coolify |
| Variáveis do operador definidas | `COOLIFY_API_KEY`, `NEON_API_KEY`, credenciais Cloudinary |

---

## 1. Coletar Dados do Cliente

Perguntar ao usuário:

| Campo | Exemplo | Obrigatório |
|-------|---------|:-----------:|
| `CLIENT_NAME` | `lampiao-burguer` | ✅ |
| `BUSINESS_TYPE` | `restaurante` / `hamburgueria` / `confeitaria` | ✅ |
| `ADMIN_EMAIL` | `admin@lampiao.com` | ✅ |
| `ADMIN_PASSWORD` | (min 8 chars) | ✅ |
| `PLAN` | `essential` / `professional` | ✅ |
| `CUSTOM_DOMAIN` (opcional) | `www.lampiaoburger.com.br` | ⬡ |

---

## 2. Criar Projeto Neon

- Use `mcp-server-neon.create_project` com `name: [CLIENT_NAME]`.
- **Salvar**:
  - `POOLED_URL` (connection string com `-pooler`)
  - `DIRECT_URL` (connection string sem pooler — para migrations)

---

## 3. Seed do Banco de Dados (execução local)

Rodar em `f:\VSCode\Landpage\server`:

```powershell
$env:DATABASE_URL="[DIRECT_URL]"
$env:DIRECT_URL="[DIRECT_URL]"
$env:SEED_ADMIN_EMAIL="[ADMIN_EMAIL]"
$env:SEED_ADMIN_PASSWORD="[ADMIN_PASSWORD]"
$env:SEED_TYPE="[BUSINESS_TYPE]"
$env:PLAN="[PLAN]"

npx prisma migrate deploy
npx prisma db seed
```

✅ Confirmar que seed rodou sem erros.

---

## 4. Deploy no Coolify

### Opção A: Via Coolify API (Recomendada — Automação)

Usar o script `node scripts/provision_client.js` que automatiza:
1. Criação do Application no Coolify (Docker build)
2. Configuração de env vars
3. Deploy automático
4. Configuração de domínio + SSL

**Variáveis necessárias no ambiente do operador:**
```powershell
$env:COOLIFY_API_KEY="seu-token"
$env:COOLIFY_BASE_URL="https://coolify.seudominio.com.br"
$env:COOLIFY_SERVER_UUID="server-uuid-aqui"
$env:COOLIFY_PROJECT_UUID="project-uuid-aqui"
```

### Opção B: Via Dashboard Coolify (Manual — Fallback)

1. **Acessar**: `https://coolify.seudominio.com.br`
2. **Novo Resource** → Application → GitHub (Private Repository)
3. **Configurar Build**:
   - Repository: `bps2414/templaterestaurantebps`
   - Branch: `main`
   - Build Pack: **Docker**
   - Dockerfile Location: `server/Dockerfile`
   - Docker Build Context: `/` (raiz do repo)
   - Port: `3000`

4. **Configurar Env Vars** (12 variáveis):

   | Variável | Valor |
   |----------|-------|
   | `DATABASE_URL` | [POOLED_URL do Step 2] |
   | `DIRECT_URL` | [DIRECT_URL do Step 2] |
   | `JWT_SECRET` | Gerar: `node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"` |
   | `NODE_ENV` | `production` |
   | `THEME` | [BUSINESS_TYPE] |
   | `APP_URL` | `https://[CLIENT_NAME].seudominio.com.br` |
   | `CORS_ORIGINS` | `https://[CLIENT_NAME].seudominio.com.br` |
   | `PORT` | `3000` |
   | `CLOUDINARY_CLOUD_NAME` | `dmebhvwpo` |
   | `CLOUDINARY_API_KEY` | `448539967934699` |
   | `CLOUDINARY_API_SECRET` | `1XICB1VlrYJGz2Wh-EOraAOsehM` |
   | `CLOUDINARY_FOLDER_PREFIX` | [CLIENT_NAME] |

   > ⚠️ Se o cliente tiver domínio customizado, ajustar `APP_URL` e `CORS_ORIGINS` para esse domínio.

5. **Configurar Domínio**:
   - Padrão: `[CLIENT_NAME].seudominio.com.br`
   - Customizado (opcional): `www.dominiodocliente.com.br`
   - SSL: Let's Encrypt (automático pelo Coolify)

6. **Health Check** (na aba Health Check do Coolify):
   - Path: `/healthz`
   - Port: `3000`
   - Interval: `30s`
   - Timeout: `10s`
   - Retries: `3`
   - Start Period: `60s` (aguardar migrations)

7. **Deploy** → Clicar "Deploy" e monitorar logs.

---

## 5. Verificação Pós-Deploy

| Check | Comando/URL | Esperado |
|-------|-------------|----------|
| Health | `curl https://[CLIENT_NAME].seudominio.com.br/healthz` | `{"status":"ok","database":"connected"}` |
| Home | Abrir no browser | Landing page renderizada |
| Admin | `https://[CLIENT_NAME].seudominio.com.br/admin` | Tela de login |
| Login | Email + senha do seed | Dashboard admin |
| SSL | Checar cadeado no browser | Certificado Let's Encrypt válido |
| Logs | Dashboard Coolify → Application → Logs | Sem erros |

---

## 6. Informar o Cliente

Enviar ao cliente:

```
🌐 URL do site:     https://[CLIENT_NAME].seudominio.com.br
🔐 Painel admin:    https://[CLIENT_NAME].seudominio.com.br/admin
📧 Email:           [ADMIN_EMAIL]
🔑 Senha:           [ADMIN_PASSWORD]
📦 Plano:           [PLAN]

⚠️ Troque sua senha no primeiro login!
```
