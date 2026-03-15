---
agent: agent
---
---
description: Deploy completo no Vercel — coleta todas as ENVs, configura Neon DB (pooler + direct), seleciona tema, roda migrations e seeds. Do zero ao ar.
---

# /deploy-vercel — Deploy Completo no Vercel

$ARGUMENTS

---

## Propósito

Este workflow guia o deploy completo de um cliente no Vercel, cobrindo:
- Coleta de todas as variáveis de ambiente necessárias
- Configuração do Neon DB (URL com pooler + URL direta para migrations)
- Seleção de tema (restaurante | hamburgueria | pizzaria | confeitaria)
- Configuração do `vercel.json` para Express + static assets
- Deploy via Vercel CLI
- Execução de migrations (`prisma migrate deploy`)
- Execução do seed correto para o tema escolhido
- Validação final do site ao vivo

---

## 🛑 GATE: Coleta de Informações

> **PARE AQUI. Antes de qualquer ação, colete as respostas abaixo do usuário.**

Faça exatamente estas perguntas (pode ser em bloco único):

```
Vou precisar das seguintes informações para o deploy. Responda tudo de uma vez:

1. 📛 NOME DO CLIENTE / PROJETO (usado como nome no Vercel, ex: restaurante-joao)
2. 🎨 TEMA: restaurante | hamburgueria | pizzaria | confeitaria
3. 🗄️ NEON DB — URL COM POOLER (começa com postgres://...@...pooler.neon.tech/...)
4. 🗄️ NEON DB — URL SEM POOLER / DIRECT (começa com postgres://...@...neon.tech/... SEM "pooler" no host)
5. 🔐 JWT_SECRET (string aleatória forte, mín. 32 chars — ou digita "gerar" para eu criar um)
6. ☁️ CLOUDINARY_CLOUD_NAME
7. ☁️ CLOUDINARY_API_KEY
8. ☁️ CLOUDINARY_API_SECRET
9. ☁️ CLOUDINARY_FOLDER_PREFIX (ex: restaurante-joao)
10. 🌐 DOMÍNIO FINAL (ex: restaurantejoao.com.br — ou "usar domínio vercel" se não tiver ainda)
11. 💳 STRIPE_SECRET_KEY (opcional — deixe em branco se não usar pagamentos)
12. 💳 STRIPE_WEBHOOK_SECRET (opcional — deixe em branco se não usar pagamentos)
13. 📧 EMAIL DO ADMIN (para seed — ex: admin@restaurantejoao.com.br)
14. 🔑 SENHA DO ADMIN (para seed — ou digita "gerar" para eu criar uma segura)
```

---

## Fase 0 — Preparação Local

### 0.1 — Verificar pré-requisitos

```bash
# Vercel CLI instalado?
vercel --version

# Node.js >= 18?
node --version

# ts-node disponível?
cd server && npx ts-node --version
```

Se Vercel CLI não estiver instalado:
```bash
npm install -g vercel
```

### 0.2 — Gerar JWT_SECRET (se pedido)

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### 0.3 — Gerar senha segura do admin (se pedido)

```bash
node -e "
const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
const pwd = Array.from({length: 16}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
console.log('Senha gerada:', pwd);
"
```

---

## Fase 1 — Configurar `vercel.json`

> O `vercel.json` já existe na raiz do projeto. Estrutura correta (não alterar):

```json
{
  "version": 2,
  "buildCommand": "cd server && npm ci --include=dev && npx prisma generate && npm run build",
  "outputDirectory": "public",
  "functions": {
    "api/index.js": {
      "includeFiles": "../server/dist/**,../server/node_modules/.prisma/**,../public/**",
      "maxDuration": 30
    }
  },
  "rewrites": [
    { "source": "/api/:path*",   "destination": "/api/index" },
    { "source": "/sitemap.xml",  "destination": "/api/index" },
    { "source": "/robots.txt",   "destination": "/api/index" },
    { "source": "/healthz",      "destination": "/api/index" },
    { "source": "/ping",         "destination": "/api/index" },
    { "source": "/",             "destination": "/api/index" },
    { "source": "/menu",         "destination": "/api/index" },
    { "source": "/gallery",      "destination": "/api/index" },
    { "source": "/about",        "destination": "/api/index" },
    { "source": "/contact",      "destination": "/api/index" },
    { "source": "/privacy",      "destination": "/api/index" },
    { "source": "/admin",        "destination": "/api/index" }
  ]
}
```

> **Como funciona:**
> - `buildCommand` usa `npm ci --include=dev` para instalar devDependencies (necessário para `tsc`)
> - `npm run build` em `server/package.json` já executa `select-theme.js` E `tsc` na sequência correta
> - `api/index.js` é o entry point serverless que envolve o Express app
> - `outputDirectory: public` serve os assets estáticos via CDN do Vercel
> - O Build Command no painel do Vercel ficará **bloqueado/cinza** — isso é normal, o `vercel.json` tem prioridade

> ⚠️ **Não preencher** "Build Command" nem "Output Directory" no painel — o `vercel.json` controla tudo.
> ⚠️ **Root Directory** no painel deve ficar em **branco** (raiz do projeto).

> ⚠️ **Nota sobre uploads:** No Vercel o filesystem é efêmero. O sistema já usa Cloudinary para imagens — isso é correto. Nunca dependa do disco local em produção.

---

## Fase 2 — Verificar que `public/` tem o tema correto

> O `public/` é populado automaticamente durante o deploy pelo `select-theme.js` via `npm run build`.
> Localmente, para confirmar que está sincronizado:

```powershell
# PowerShell (Windows)
Get-ChildItem public\ | Select-Object Name
Get-ChildItem themes\<TEMA>\ | Select-Object Name
# Os dois devem listar os mesmos arquivos
```

Se quiser forçar o sync local:
```bash
THEME=<TEMA> node scripts/select-theme.js
```

---

## Fase 3 — Configurar Variáveis de Ambiente no Vercel

### 3.1 — Login no Vercel

```bash
vercel login
```

### 3.2 — Linkar o projeto (primeira vez)

```bash
vercel link
# Responda:
#   Set up and deploy? → Y
#   Which scope? → selecione sua conta
#   Link to existing project? → N (na primeira vez)
#   Project name → <NOME_DO_CLIENTE>
#   Directory? → ./  (raiz)
```

### 3.3 — Adicionar TODAS as ENVs via Painel ou CLI

**Opção A — Painel do Vercel (recomendado):** Settings → Environment Variables → Add

**Opção B — CLI:**
```bash
vercel env add DATABASE_URL production
```

**Bloco completo de ENVs (substituir valores antes de colar no painel):**

```env
# === DATABASE (Neon) ===
DATABASE_URL=postgresql://neondb_owner:<SENHA>@<EP>-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DIRECT_URL=postgresql://neondb_owner:<SENHA>@<EP>.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# === AUTH ===
# Gerar com: node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
JWT_SECRET=<gerado_com_comando_acima>

# === APP ===
NODE_ENV=production
PORT=3000
THEME=restaurante
# Preencher DEPOIS do primeiro deploy com a URL real:
APP_URL=https://<NOME>.vercel.app
CORS_ORIGINS=https://<NOME>.vercel.app

# === CLOUDINARY ===
CLOUDINARY_CLOUD_NAME=dmebhvwpo
CLOUDINARY_API_KEY=448539967934699
CLOUDINARY_API_SECRET=<do painel cloudinary>
CLOUDINARY_FOLDER_PREFIX=<nome-do-cliente>

# === STRIPE (opcional — omitir se não usar) ===
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> ⚠️ `APP_URL` e `CORS_ORIGINS`: configure com a URL provisória antes do deploy. Após ter a URL final, atualize e faça redeploy.

### 3.4 — Verificar todas as ENVs registradas

```bash
vercel env ls production
```

**Checklist de ENVs obrigatórias:**
- [x] `DATABASE_URL` — com `-pooler` para runtime
- [x] `DIRECT_URL` — sem `-pooler`, para migrations
- [x] `JWT_SECRET` — gerado com `crypto.randomBytes(64).toString('base64')`
- [x] `THEME`
- [x] `NODE_ENV=production`
- [x] `APP_URL`
- [x] `CORS_ORIGINS`
- [x] `CLOUDINARY_CLOUD_NAME`
- [x] `CLOUDINARY_API_KEY`
- [x] `CLOUDINARY_API_SECRET`
- [x] `CLOUDINARY_FOLDER_PREFIX`

---

## Fase 4 — Deploy

### 4.1 — Deploy em produção

```bash
vercel --prod
```

Aguardar a conclusão. O output deve mostrar:
```
✅  Production: https://<NOME_DO_CLIENTE>.vercel.app
```

Salvar essa URL — será o `APP_URL` definitivo (se não tiver domínio próprio).

### 4.2 — Atualizar APP_URL e CORS_ORIGINS (se necessário)

Se a URL do Vercel for diferente do que foi configurado no passo 3.3:

```bash
vercel env rm APP_URL production
vercel env add APP_URL production
# Cole a URL definitiva: https://<hash>.vercel.app

vercel env rm CORS_ORIGINS production
vercel env add CORS_ORIGINS production
# Mesma URL

# Re-deploy para aplicar
vercel --prod
```

---

## Fase 5 — Migrations + Seed (Neon DB)

> Executar **localmente** via PowerShell, usando a `DIRECT_URL` (sem pooler) para ambos.
> As migrations e o seed devem ser rodados **antes** do deploy estar disponível ao público.

### 5.1 — Rodar migrations + seed (único bloco PowerShell)

```powershell
cd F:\VSCode\Landpage\server

# Substitua os valores antes de colar:
$env:DATABASE_URL="postgresql://neondb_owner:<SENHA>@<EP>.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
$env:DIRECT_URL="postgresql://neondb_owner:<SENHA>@<EP>.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
$env:SEED_TYPE="restaurante"        # restaurante | hamburgueria | pizzaria | confeitaria
$env:SEED_ADMIN_EMAIL="admin@cliente.com"
$env:SEED_ADMIN_PASSWORD="SenhaForte2026!"
$env:PLAN="professional"            # essential | professional
npx prisma migrate deploy
npx prisma db seed
```

Saída esperada:
```
All migrations have been successfully applied.

🎉 Seed RESTAURANTE concluído!
📦 Plano: PROFESSIONAL
📋 Credenciais Admin:
   Email: admin@cliente.com
   Senha: ***
```

### 5.2 — Limpar variáveis de ambiente

```powershell
Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:\DIRECT_URL -ErrorAction SilentlyContinue
Remove-Item Env:\SEED_TYPE -ErrorAction SilentlyContinue
Remove-Item Env:\SEED_ADMIN_EMAIL -ErrorAction SilentlyContinue
Remove-Item Env:\SEED_ADMIN_PASSWORD -ErrorAction SilentlyContinue
Remove-Item Env:\PLAN -ErrorAction SilentlyContinue
```

> **Se travar em "advisory lock"** (Neon free tier): aguardar 30s e rodar `npx prisma migrate deploy` novamente.

> ⚠️ Use sempre a URL **sem `-pooler`** para migrations e seed. A URL com `-pooler` só vai para `DATABASE_URL` no Vercel (runtime).

### 5.3 — Resetar banco do zero (se necessário)

```powershell
# ⚠️ APAGA TODOS OS DADOS — use só em setup inicial ou troca de tema
$env:DATABASE_URL="<URL_SEM_POOLER>"
$env:DIRECT_URL="<URL_SEM_POOLER>"
$env:SEED_TYPE="restaurante"
$env:SEED_ADMIN_EMAIL="admin@cliente.com"
$env:SEED_ADMIN_PASSWORD="SenhaForte2026!"
$env:PLAN="professional"
npx prisma migrate reset --force
```

### 5.4 — Verificar dados no banco (opcional)

```powershell
$env:DATABASE_URL="<URL_SEM_POOLER>"
npx prisma studio
```

Verificar:
- Tabela `admin_users`: 1 registro com o email configurado
- Tabela `categories`: categorias do tema
- Tabela `dishes`: pratos populados
- Tabela `site_config`: configurações do site (nome, endereço, horários, redes sociais)

---

## Fase 6 — (Removida — incorporada na Fase 5)

---

## Fase 7 — Configurar Domínio (Opcional)

Se o cliente tem domínio próprio:

```bash
vercel domains add restaurantejoao.com.br
```

Configurar DNS no registrador de domínio:
```
Tipo: CNAME
Nome: @ (ou www)
Valor: cname.vercel-dns.com
TTL: 3600
```

Verificar certificado SSL (automático pelo Vercel):
```bash
vercel domains inspect restaurantejoao.com.br
```

---

## Fase 8 — Validação Final

### 8.1 — Checklist de validação (executar manualmente)

```
🌐 FRONTEND
  [ ] Site abre sem erros no browser: https://<URL_DEPLOY>
  [ ] Tema correto está sendo exibido (cores, logo, nome)
  [ ] Menu carrega com categorias e pratos do seed
  [ ] Galeria carrega imagens
  [ ] Página "Sobre" e "Contato" funcionam

🔐 ADMIN PANEL
  [ ] https://<URL_DEPLOY>/admin.html abre o painel
  [ ] Login funciona com email/senha do seed
  [ ] CRUD de pratos funciona (criar, editar, deletar)
  [ ] Upload de imagem funciona (usa Cloudinary)
  [ ] Logout limpa a sessão

🔌 API
  [ ] GET https://<URL_DEPLOY>/api/categories → retorna array
  [ ] GET https://<URL_DEPLOY>/api/dishes → retorna array
  [ ] GET https://<URL_DEPLOY>/api/config → retorna configurações

📱 MOBILE
  [ ] Site é responsivo no mobile (Chrome DevTools)
  [ ] Menu hambúrguer funciona
```

### 8.2 — Testar health check da API

```bash
curl https://<URL_DEPLOY>/api/categories
# Deve retornar JSON com as categorias do seed
```

### 8.3 — Verificar logs no Vercel (se houver erros)

```bash
vercel logs --follow
```

---

## 🧯 Troubleshooting Comum

| Problema | Causa | Solução |
|----------|-------|---------|
| `PrismaClientInitializationError` | `DATABASE_URL` incorreta ou com pooler no `DIRECT_URL` | Verifique: pooler URL → `DATABASE_URL`, direct URL → `DIRECT_URL` |
| `Function timeout exceeded` | Query lenta no Neon (cold start) | Normal no free tier. Aumentar `maxDuration` no `vercel.json` |
| `CORS error` no browser | `CORS_ORIGINS` diferente do domínio real | Atualizar `CORS_ORIGINS` com a URL exata do deploy |
| `Cannot find module` no deploy | `prisma generate` não rodou no build | Verificar `buildCommand` no `vercel.json` inclui `npx prisma generate` |
| Tema errado no deploy | `THEME` env incorreta | Verificar `vercel env ls production` e re-deploy |
| Upload de imagem falha | Credenciais Cloudinary erradas | Testar no Cloudinary Console com as mesmas chaves |
| Admin login retorna 401 | Seed não rodou ou rodou com email diferente | Verificar tabela `admin_users` no Prisma Studio |
| Advisory lock timeout (Neon) | Conexão concorrente bloqueou | Aguardar 30-60s e rodar `migrate deploy` novamente |

---

## 📋 Resumo de ENVs por Categoria

```env
# === DATABASE (Neon) ===
# Runtime: URL COM pooler
DATABASE_URL=postgresql://neondb_owner:<SENHA>@<EP>-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
# Migrations/Seed: URL SEM pooler
DIRECT_URL=postgresql://neondb_owner:<SENHA>@<EP>.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# === AUTH ===
# Gerar com: node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
JWT_SECRET=<64-char-base64-string>

# === APP ===
NODE_ENV=production
PORT=3000
THEME=restaurante        # restaurante | hamburgueria | pizzaria | confeitaria
APP_URL=https://<NOME>.vercel.app
CORS_ORIGINS=https://<NOME>.vercel.app

# === CLOUDINARY ===
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>
CLOUDINARY_FOLDER_PREFIX=<nome-do-cliente>

# === STRIPE (opcional) ===
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> **Não é necessário** definir `VERCEL` manualmente — o Vercel injeta automaticamente essa variável em todos os deploys.

---

## ✅ Critérios de Conclusão

O deploy está **completo e validado** quando:

1. `vercel --prod` retornou URL de produção sem erros de build
2. `npx prisma migrate deploy` aplicou todas as migrations sem erro
3. `npx prisma db seed` executou com sucesso (sem `PrismaClientKnownRequestError`)
4. Variáveis de ambiente temporárias foram limpas no PowerShell (`Remove-Item Env:\...`)
5. Site abre no browser com tema correto
6. Login de admin funciona
7. API `/api/categories` retorna dados reais
8. Upload de imagem via admin funciona (Cloudinary)

---

> 💡 **Dica de segurança:** Nunca commite `DATABASE_URL`, `DIRECT_URL` ou outras secrets. Use apenas variáveis de ambiente na sessão PowerShell e limpe-as ao terminar. As secrets ficam apenas no painel do Vercel.
