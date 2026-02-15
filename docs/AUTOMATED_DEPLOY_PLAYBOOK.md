# 🤖 AUTOMATED DEPLOY PLAYBOOK

> **Documento Mestre para o Agente (Eu)**
> Este arquivo descreve exatamente como eu devo usar as ferramentas MCP para realizar o deploy completo de um novo cliente, substituindo o trabalho manual do `CHECKLIST_CLIENTE.md`.

---

## 1. Coleta de Dados do Cliente
**Input necessário do usuário:**
- `NOME_CLIENTE` (ex: "pizzaria-do-joao")
- `TIPO_NEGOCIO` ("restaurante", "pizzaria", "hamburgueria")
- `EMAIL_ADMIN` (ex: "contato@joao.com")
- `SENHA_ADMIN` (ex: "Mudar123!")
- `PLANO` ("essential" ou "professional")

---

## 2. Criação do Banco de Dados (Neon MCP)

**Ferramenta:** `mcp-server-neon.create_project`

```json
{
  "name": "restaurante-[NOME_CLIENTE]",
  "region_id": "aws-us-west-2"
}
```

**Output esperado:**
- `project_id`
- `branch_id`
- `connection_string` (Pooled) -> **Usar como `DATABASE_URL` no Render**
- `connection_string` (Direct) -> **Usar como `DATABASE_URL` local para o seed**

> ⚠️ **Atenção:** O Neon devolve `sslmode=require`. Certifique-se de que a string usada no Prisma local também tenha isso.

---

## 3. Seed do Banco de Dados (Execução Local)

**Ferramenta:** `run_command` (Terminal Local)

**Passo 3.1: Configurar Variáveis Temporárias e Rodar Migration**
Eu não altero o `.env` do projeto. Eu passo as variáveis *inline* ou configuro a sessão do terminal.

```powershell
# Windows PowerShell
$env:DATABASE_URL="[DIRECT_CONNECTION_STRING_DO_PASSO_2]"
npx prisma migrate deploy
```

**Passo 3.2: Rodar Seed**

```powershell
$env:DATABASE_URL="[DIRECT_CONNECTION_STRING_DO_PASSO_2]"
$env:SEED_ADMIN_EMAIL="[EMAIL_ADMIN]"
$env:SEED_ADMIN_PASSWORD="[SENHA_ADMIN]"
$env:SEED_TYPE="[TIPO_NEGOCIO]" # restaurante | hamburgueria | pizzaria
$env:PLAN="[PLANO]" # essential | professional

npx prisma db seed
```

---

## 4. Deploy da Aplicação (Render MCP)

**Ferramenta:** `render.create_service`

**Payload:**
```json
{
  "serviceId": null, // Criar novo
  "type": "web_service",
  "name": "restaurante-[NOME_CLIENTE]",
  "ownerId": "[SEU_OWNER_ID]", // Pegar via render.list_services se não souber
  "repo": "https://github.com/bps2414/templaterestaurantebps",
  "branch": "main",
  "region": "oregon",
  "buildCommand": "npm ci --include=dev && npx prisma generate && npm run build",
  "startCommand": "sh scripts/start.sh",
  "plan": "free", // ou "starter"
  "envVars": [
    { "key": "DATABASE_URL", "value": "[POOLED_CONNECTION_STRING_DO_PASSO_2]" },
    { "key": "Direct_URL", "value": "[DIRECT_CONNECTION_STRING_DO_PASSO_2]" },
    { "key": "NODE_ENV", "value": "production" },
    { "key": "JWT_SECRET", "value": "[GERAR_HASH_ALEATORIO]" },
    { "key": "CLOUDINARY_CLOUD_NAME", "value": "dmebhvwpo" },
    { "key": "CLOUDINARY_API_KEY", "value": "448539967934699" },
    { "key": "CLOUDINARY_API_SECRET", "value": "[PERGUNTAR_USER_OU_USAR_EXISTENTE]" },
    { "key": "CLOUDINARY_FOLDER_PREFIX", "value": "restaurante-[NOME_CLIENTE]" },
    { "key": "APP_URL", "value": "https://restaurante-[NOME_CLIENTE].onrender.com" },
    { "key": "CORS_ORIGINS", "value": "https://restaurante-[NOME_CLIENTE].onrender.com" }
  ],
  "autoDeploy": true
}
```

> **Nota:** O `Direct_URL` não é estritamente necessário para o app rodar (ele usa o pooled), mas é bom deixar configurado caso precise rodar migrations remotas no futuro via console do Render.

---

## 5. Validação Final

1. **Ping URL:** `GET https://restaurante-[NOME_CLIENTE].onrender.com/healthz` (esperar 200 OK)
2. **Login Test:** `POST /api/auth/login` com as credenciais do Admin.

---

## Resumo do Fluxo "Zero Touch"

1. **User:** "Cria pra mim a Pizzaria do Luigi"
2. **Eu:**
   - Crio Neon (`restaurante-luigi`) -> Pego URL.
   - Rodo `prisma migrate` + `seed` localmente apontando pro Neon.
   - Crio Render (`restaurante-luigi`) com Env Vars injetadas.
3. **Eu:** "Pronto! Aqui está o link e a senha."

