# 🚀 GUIA COMPLETO — Do Teste Local ao Cliente Final

> **Projeto:** Restaurant Template (Express + Prisma + PostgreSQL)  
> **Última atualização:** 12/02/2026  
> **Auditoria:** Ver [UPDATE.md](UPDATE.md) para relatório completo (nota 8.5/10 técnica, 7.5/10 comercial)  
> **Leia na ordem. Cada passo depende do anterior.**

> ✅ **Fase 0 concluída!** Todas as correções obrigatórias já foram feitas (debug logs removidos, Cloudinary integrado, Winston logger, validação WhatsApp, onboarding, preview, backup script). Pule direto para a Etapa 1.

---

## 📋 ÍNDICE — Siga na ordem, sem pular

| # | Etapa | Tempo estimado |
|---|-------|----------------|
| [0](#0--fase-0--correções-obrigatórias-da-auditoria) | ✅ ~~Correções obrigatórias~~ (concluído) | ~~3-4 h~~ |
| [1](#1--consertar-o-que-falta-antes-de-subir) | Consertar o que falta (obrigatório) | ~10 min |
| [2](#2--testar-tudo-localmente) | Testar tudo localmente | ~15 min |
| [3](#3--preparar-o-repositório-github) | Preparar repositório GitHub | ~10 min |
| [4](#4--criar-banco-de-dados-neon) | Criar banco de dados (Neon) | ~5 min |
| [5](#5--criar-web-service-render) | Criar Web Service (Render) | ~10 min |
| [6](#6--testar-em-produção) | Testar em produção | ~10 min |
| [7](#7--entregar-para-o-cliente) | Entregar para o cliente | ~15 min |
| [8](#8--clonar-para-novo-cliente) | Clonar para novo cliente | ~10 min |
| [9](#9--manutenção-e-updates) | Manutenção e updates | referência |
| [10](#10--se-algo-der-errado) | Se algo der errado | referência |

---

## 0 — Fase 0 — Correções Obrigatórias da Auditoria

> 🔴 **FAÇA ISSO PRIMEIRO.** Sem essas correções, o produto não está pronto para vender.
> 
> Detalhes completos: [UPDATE.md](UPDATE.md) — Fase 0

### 0.1 — Remover debug logs de produção

**Por quê:** Os `console.log` vazam tokens CSRF parciais, origins, headers e nomes de arquivo nos logs do Render. Um atacante pode usar essa informação.

**Arquivos para limpar:**

1. `server/src/middlewares/csrf.ts` — Remover o bloco `console.log('🔒 CSRF validation:', {...})` dentro de `csrfVerifyToken`
2. `server/src/app.ts` — Remover `console.log('🔐 Allowed origins:', ...)` e `console.log('🌐 CORS check:', ...)`
3. `server/src/routes/upload.ts` — Remover os `console.log('🔍 Validating file:...')`, `console.log('✅ Validation result:...')`, `console.log('❌ BLOCKED:...')`, `console.log('✅ ALLOWED:...')`

### 0.2 — Remover campo `debug` da resposta CSRF 403

**Por quê:** A resposta `{ success: false, error: 'CSRF token missing', debug: { hasCookie, hasHeader } }` expõe informação interna.

**No arquivo `server/src/middlewares/csrf.ts`**, trocar:
```typescript
// DE:
return res.status(403).json({
    success: false,
    error: 'CSRF token missing',
    debug: { hasCookie: !!tokenFromCookie, hasHeader: !!tokenFromHeader }
});

// PARA:
return res.status(403).json({
    success: false,
    error: 'CSRF token missing'
});
```

### 0.3 — Integrar Cloudinary para uploads

**Por quê:** O Render (Free E Starter) reinicia o filesystem no redeploy. Todas as imagens do cliente **desaparecem**. Cloudinary é gratuito (25GB/mês) e persiste as imagens.

**Passos:**
1. Criar conta em https://cloudinary.com (Free)
2. `cd server && npm install cloudinary`
3. Adicionar env vars no `.env` e no Render:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Modificar `server/src/middlewares/upload.ts` para enviar ao Cloudinary após validação de magic bytes
5. Modificar rotas de dishes, gallery e upload para salvar URLs do Cloudinary no banco
6. Testar: subir imagem → verificar que URL retornada é `https://res.cloudinary.com/...`
7. Commit e push

> 💡 **Dica:** Manter a validação de magic bytes ANTES do upload para Cloudinary. Assim, arquivos maliciosos são rejeitados antes de consumir bandwidth.

---

## 1 — Consertar o que falta antes de subir

Seu projeto está 90% pronto. Faltam **4 correções pequenas** que são obrigatórias antes de colocar online. São coisas de 2 minutos cada.

### 1.1 — Criar `.gitignore` na raiz do projeto

Hoje só existe `.gitignore` dentro de `server/`. Sem isso, se você criar um `.env` na raiz ou algum backup pesado, ele vai pro GitHub.

Crie o arquivo `f:\VSCode\Landpage\.gitignore` com:

```
# === Ambiente ===
.env
.env.local
.env.production

# === Node ===
node_modules/
dist/

# === Uploads do usuário ===
server/assets/uploads/*
!server/assets/uploads/.gitkeep

# === OS ===
.DS_Store
Thumbs.db
desktop.ini

# === IDE ===
.vscode/
.idea/
*.swp

# === Logs ===
*.log
npm-debug.log*

# === Backups (não enviar ao GitHub) ===
backup_before_saas/
backup_before_security_phase1/
backup_before_security_ui/

# === Testes/relatórios locais ===
tests/
report/
migration_logs/
```

### 1.2 — Aplicar `uploadLimiter` na rota de upload

O rate limiter de upload está **criado** (`rateLimit.ts`) mas nunca foi **ligado** na rota. Sem isso, alguém pode fazer spam de upload.

Abra `server/src/app.ts` e troque esta linha:

```typescript
// DE:
app.use('/api/upload', csrfVerifyToken, apiLimiter, uploadRoutes);

// PARA:
app.use('/api/upload', csrfVerifyToken, uploadLimiter, uploadRoutes);
```

E adicione `uploadLimiter` no import lá em cima:

```typescript
// DE:
import { apiLimiter, authLimiter } from './middlewares/rateLimit';

// PARA:
import { apiLimiter, authLimiter, uploadLimiter } from './middlewares/rateLimit';
```

### 1.3 — Remover arquivos legados da raiz

Na raiz do projeto existem arquivos antigos (do SaaS/FluxPay) que **não fazem parte** do template de restaurante e vão confundir:

- `login.html`, `register.html`, `dashboard.html` — páginas antigas que referenciam endpoints que não existem mais
- `scripts.js`, `scripts.min.js`, `styles.css`, `styles.min.css`, `index.html` — duplicatas antigas
- `found_entries.json` — arquivo de debug

**O que fazer:** mova todos para a pasta `backup_before_saas/` (que já existe) ou delete:

```
login.html
register.html
dashboard.html
scripts.js
scripts.min.js
styles.css
styles.min.css
index.html
found_entries.json
```

> **Dica:** NÃO delete as pastas `public/` e `server/`. O template real está lá dentro.

### 1.4 — Seed: trocar senha hardcoded por variável de ambiente

No arquivo `server/prisma/seed.ts`, a senha do admin está fixa como `admin123`. Isso é OK para demo, mas para cada cliente você quer poder mudar.

Troque a linha:

```typescript
// DE:
const passwordHash = await bcrypt.hash('admin123', 12);

// PARA:
const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
const passwordHash = await bcrypt.hash(adminPassword, 12);
```

E faça o mesmo com o email:

```typescript
// DE:
where: { email: 'admin@restaurante.com' },

// PARA:
const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@restaurante.com';
// ...
where: { email: adminEmail },
```

Assim, quando for instalar para um cliente, você roda:

```bash
SEED_ADMIN_EMAIL="dono@pizzaria.com" SEED_ADMIN_PASSWORD="SenhaForte123!" npx prisma db seed
```

---

## 2 — Testar tudo localmente

Antes de subir para produção, teste no seu computador para garantir que tudo funciona.

### 2.1 — Subir o banco de dados local

**Opção A: Com Docker (recomendado)**

1. **Certifique-se que o Docker Desktop está rodando:**
   - Abra o Docker Desktop (ícone da baleia azul)
   - Aguarde até aparecer "Docker Desktop is running" (verde)
   - Se não tiver instalado: https://www.docker.com/products/docker-desktop

2. **No terminal, na raiz do projeto:**

```bash
docker-compose up -d postgres
```

Isso sobe só o PostgreSQL local. Espere uns 10 segundos.

**Erros comuns:**
- `docker daemon is not running` → Abra o Docker Desktop e aguarde inicializar
- `the attribute 'version' is obsolete` → Aviso, pode ignorar (não afeta funcionamento)

---

**Opção B: Sem Docker — Usar Neon diretamente para testes**

Se não quiser instalar Docker, use o Neon (mesmo que vai usar em produção) para testar localmente:

1. **Crie o projeto no Neon** (siga a [Etapa 4](#4--criar-banco-de-dados-neon))
2. **Copie a DATABASE_URL** do Neon
3. **Pule para a etapa 2.2** e use a URL do Neon no seu `.env` local

> ⚠️ **Importante:** Se usar Neon para dev local, as migrações e seeds vão direto para o banco de produção. Recomendo criar **2 projetos no Neon**: um para `dev` e outro para `production`.

### 2.2 — Configurar o `.env` do servidor

Dentro de `server/`, crie (ou confirme que existe) o arquivo `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/restaurant_template?schema=public"
JWT_SECRET="qualquer-coisa-longa-para-desenvolvimento-local-123456"
PORT=3000
NODE_ENV="development"
APP_URL="http://localhost:3000"
CORS_ORIGINS="http://localhost:3000"
```

### 2.3 — Instalar, gerar, migrar, seedar e rodar

```bash
cd server
npm ci
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Deve aparecer:
```
🍽  Restaurant Template server running on http://localhost:3000
```

### 2.4 — Checklist de teste local (faça todos)

Abra o navegador e teste cada item. Marque ✅ quando passar:

| # | Teste | Como testar | Esperado |
|---|-------|-------------|----------|
| 1 | Health check | Acesse `http://localhost:3000/healthz` | JSON com `"status": "ok"` |
| 2 | Página inicial | Acesse `http://localhost:3000` | Página do restaurante com dados do seed |
| 3 | Menu | Acesse `http://localhost:3000/menu` | Lista de pratos com preços |
| 4 | Galeria | Acesse `http://localhost:3000/gallery` | Página de galeria |
| 5 | Sobre | Acesse `http://localhost:3000/about` | Página sobre o restaurante |
| 6 | Contato | Acesse `http://localhost:3000/contact` | Página de contato |
| 7 | Login admin | Acesse `http://localhost:3000/admin`, faça login com `admin@restaurante.com` / `admin123` | Painel admin carrega |
| 8 | Criar prato | No painel admin, crie um prato novo | Prato aparece na lista e no menu |
| 9 | Upload imagem | No admin, suba uma imagem JPG/PNG (< 2MB) | Imagem aparece no prato |
| 10 | Upload bloqueado | Tente subir um .exe renomeado para .jpg | Erro: upload rejeitado |
| 11 | Carrinho | No menu, adicione itens ao carrinho | Carrinho mostra itens e total correto |
| 12 | WhatsApp | Finalize pedido no carrinho | Abre WhatsApp com mensagem formatada |
| 13 | XSS test | No console do navegador, cole: `localStorage.setItem('restaurant_cart', JSON.stringify([{id:'x',name:'<img src=x onerror=alert(1)>',image:'',price:1,quantity:1}])); location.reload();` | **Nenhum alert**. Nome aparece como texto, não como HTML |
| 14 | Rate limit | Tente fazer login 11x com senha errada | Mensagem "Muitas tentativas" |

Se **todos passaram** → pode ir para a próxima etapa.

Se algum falhou → **pare e corrija** antes de continuar.

---

## 3 — Preparar o repositório GitHub

### 3.1 — Confirmar que `.gitignore` está funcionando

Depois de criar o `.gitignore` da raiz (etapa 1.1), verifique:

```bash
# Na raiz do projeto
git status
```

Os arquivos `.env`, `node_modules/`, `dist/`, as pastas de backup e `report/` **NÃO devem aparecer** na lista. Se aparecerem, o `.gitignore` não está funcionando — confira o caminho.

### 3.2 — Estrutura que deve ir para o GitHub

```
📦 Seu repositório deve ter:
├── public/               ← Frontend (HTML + JS)
│   ├── index.html
│   ├── menu.html
│   ├── gallery.html
│   ├── about.html
│   ├── contact.html
│   ├── admin.html
│   ├── buy.html
│   ├── buy-success.html
│   └── js/
│       ├── app.js
│       ├── cart.js
│       ├── cartUI.js
│       ├── orderModal.js
│       ├── whatsappFormatter.js
│       ├── a11y.js
│       ├── mobile.js
│       └── performance.js
├── server/               ← Backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .gitignore
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   └── src/
│       ├── app.ts
│       ├── index.ts
│       ├── routes/
│       ├── middlewares/
│       ├── services/
│       ├── utils/
│       ├── prisma/
│       └── types/
├── .env.example          ← Exemplo de variáveis (SEM segredos)
├── .gitignore            ← O que você criou na etapa 1.1
├── docker-compose.yml    ← Para dev local
├── docker-compose.dev.yml
├── README.md
└── preview.png
```

> **Os arquivos de report/, backup_*, migration_logs/, tests/ ficam FORA do GitHub** (o `.gitignore` cuida disso).

### 3.3 — Criar repositório e fazer push

```bash
# Na raiz do projeto
git init    # (se ainda não fez)
git add .
git commit -m "Template Restaurante v1.0 — pronto para produção"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/restaurant-template.git
git push -u origin main
```

> **Repositório PRIVADO** — você está vendendo isso, não dê de graça.

---

## 4 — Criar banco de dados (Neon)

### Por que Neon e não o PostgreSQL do Render?

- Neon tem **plano gratuito** generoso (0.5 GB, branching)
- É PostgreSQL puro (mesma coisa que o Prisma espera)
- Fica **separado** do Render → se mudar de hosting, o banco continua

### Passo a passo

1. Acesse **https://neon.tech** → Crie conta (pode usar GitHub)
2. **Create Project** → nome: `restaurante-saborarte` (ou nome do cliente)
3. Região: escolha a mais próxima dos clientes (ex: `São Paulo` ou `US East`)
4. Depois de criado, vá em **Dashboard → Connection Details**
5. **IMPORTANTE:** Copie **DUAS** connection strings:

   **A) Pooled connection (para DATABASE_URL):**
   - Clique em **Pooled connection**
   - Copie a string completa (tem `-pooler` no meio):
   ```
   postgresql://neondb_owner:AbCdEf123@ep-cool-name-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   - Essa URL **com `-pooler`** é usada pelo app em produção (otimiza conexões)

   **B) Direct connection (para DIRECT_URL):**
   - Clique em **Direct connection** (ou **Unpooled connection**)
   - Copie a string completa (SEM `-pooler`):
   ```
   postgresql://neondb_owner:AbCdEf123@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   - Essa URL **sem `-pooler`** é necessária para migrations (Prisma precisa de advisory locks)
   - ⚠️ **IMPORTANTE:** Se a URL tiver `.c-2.` ou `.c-3.` no hostname (ex: `ep-xxx.c-2.us-west-2`), **REMOVA** essa parte! Use apenas `ep-xxx.us-west-2`

6. **GUARDE as duas strings.** Você vai precisar de ambas no Render.

> **Por que duas URLs?**  
> - **Pooled** = gerencia até 10 mil conexões simultâneas (perfeito para app em produção)  
> - **Direct** = conexão única, necessária para migrations (o comando `prisma migrate deploy` precisa dessa)

> **Dica:** Para cada novo cliente, você cria um **novo projeto** no Neon. Assim cada restaurante tem seu banco isolado.

### 4.2 — Popular o banco de dados (seed) — FAÇA AGORA!

🔴 **IMPORTANTE:** Rode o seed **ANTES** de criar o Render. Assim o banco já está pronto quando o site subir.

**📋 PASSO A PASSO:**

1. **Abra o PowerShell** e vá para a pasta server:
```powershell
cd F:\VSCode\Landpage\server
```

2. **Cole e edite o comando abaixo** com os dados do seu cliente:

```powershell
# 🎯 SUBSTITUA:
# <URL_NEON_DIRECT> = URL direta do Neon (SEM -pooler)
# <TIPO> = hamburgueria OU pizzaria
# <EMAIL> = email do admin (ex: dono@burger.com)
# <SENHA> = senha forte (mínimo 8 caracteres, 1 maiúscula, 1 número)
# <PLANO> = essential OU professional

$env:DATABASE_URL="<URL_NEON_DIRECT>" ; $env:SEED_TYPE="<TIPO>" ; $env:SEED_ADMIN_EMAIL="<EMAIL>" ; $env:SEED_ADMIN_PASSWORD="<SENHA>" ; $env:PLAN="<PLANO>" ; npx prisma migrate deploy ; npx prisma db seed
```

**✅ EXEMPLOS PRONTOS (copie e edite):**

```powershell
# Exemplo 1: Hamburgueria Essential (básico)
$env:DATABASE_URL="postgresql://neondb_owner:npg_72sUuBqyIFYf@ep-holy-king-akhv0drx.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require" ; $env:SEED_TYPE="hamburgueria" ; $env:SEED_ADMIN_EMAIL="bryanpsouza123@gmail.com" ; $env:SEED_ADMIN_PASSWORD="14072010reyna" ; $env:PLAN="essential" ; npx prisma migrate deploy ; npx prisma db seed

# Exemplo 2: Pizzaria Professional (completo)
$env:DATABASE_URL="postgresql://neondb_owner:XyZ789@ep-name.us-east-2.aws.neon.tech/neondb?sslmode=require" ; $env:SEED_TYPE="pizzaria" ; $env:SEED_ADMIN_EMAIL="dono@pizza.com" ; $env:SEED_ADMIN_PASSWORD="Pizza2026!" ; $env:PLAN="professional" ; npx prisma migrate deploy ; npx prisma db seed

# Exemplo 3: Restaurante genérico Professional
$env:DATABASE_URL="postgresql://neondb_owner:npg_82APcKbrmCUY@ep-aged-hall-afx02gbc-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require" ; $env:SEED_TYPE="restaurante" ; $env:SEED_ADMIN_EMAIL="bryanpsouza123@gmail.com" ; $env:SEED_ADMIN_PASSWORD="14072010raze" ; $env:PLAN="professional" ; npx prisma migrate deploy ; npx prisma db seed
```

3. **Pressione Enter** e aguarde:
```
✅ 3 migrations aplicadas
✅ Admin: dono@burger.com
✅ Plano: essential
✅ 10 pratos criados
🎉 Seed concluído
```

4. **Limpe as variáveis** (para não conflitar com seu .env local):
```powershell
Remove-Item Env:\DATABASE_URL
```

**📊 Diferença entre os planos:**

| Recurso | Essential (FREE) | Professional (PRO) |
|---------|------------------|---------------------|
| Pratos e categorias | ✅ | ✅ |
| Galeria de fotos | ✅ | ✅ |
| Configurações básicas | ✅ | ✅ |
| **Logo customizada** | ❌ | ✅ |
| **Cor da marca** | ❌ | ✅ |
| **Favicon customizado** | ❌ | ✅ |
| **Seção de equipe** | ❌ | ✅ |

> 💡 **Dica comercial:** Cobre R$ 150-250 pelo plano Essential, R$ 350-500 pelo Professional.

**🔄 Tipos de seed disponíveis:**

| Valor de SEED_TYPE | Resultado | Pratos de exemplo |
|--------------------|-----------|-------------------|
| `restaurante` ou **não definir** | Seed genérico de restaurante (padrão) | Bruschetta, Risoto de Funghi, Filé ao Madeira, Tiramisu |
| `pizzaria` | Seed de pizzaria | Margherita, Calabresa, Quatro Queijos, Esfihas |
| `hamburgueria` | Seed de hamburgueria | X-Burger, Smash Burger, Bacon Burger, Combos |

**Exemplo sem SEED_TYPE (usa padrão = restaurante genérico):**
```powershell
$env:DATABASE_URL="..." ; $env:SEED_ADMIN_EMAIL="dono@restaurante.com" ; $env:SEED_ADMIN_PASSWORD="Senha123!" ; $env:PLAN="essential" ; npx prisma migrate deploy ; npx prisma db seed
```

**Exemplo com restaurante explícito:**
```powershell
$env:DATABASE_URL="..." ; $env:SEED_TYPE="restaurante" ; $env:SEED_ADMIN_EMAIL="dono@bistrô.com" ; $env:SEED_ADMIN_PASSWORD="Senha123!" ; $env:PLAN="professional" ; npx prisma migrate deploy ; npx prisma db seed
```

---

**🗑️ RESETAR E POPULAR DO ZERO:**

Se você já rodou seed antes e quer **apagar tudo** e recomeçar (ex: mudou de pizzaria para hamburgueria, ou resetou credenciais):

**🔴 IMPORTANTE: Entre na pasta server PRIMEIRO!**

**🔴🔴 CRÍTICO: Use URL DIRECT (SEM `-pooler`)!**

```powershell
# 1. Entre na pasta server (OBRIGATÓRIO)
cd F:\VSCode\Landpage\server

# 2. DEPOIS rode o reset (⚠️ APAGA TUDO E RECRIA DO ZERO)
# ⚠️ ATENÇÃO: Use a URL **DIRECT** (SEM -pooler) do Neon!
$env:DATABASE_URL="<URL_NEON_DIRECT_SEM_POOLER>" ; $env:SEED_TYPE="hamburgueria" ; $env:SEED_ADMIN_EMAIL="novo@email.com" ; $env:SEED_ADMIN_PASSWORD="NovaSenha!" ; $env:PLAN="professional" ; npx prisma migrate reset --force
```

**Exemplo completo com valores reais:**
```powershell
cd F:\VSCode\Landpage\server

# ⚠️ NOTE: URL SEM -pooler (direct connection)
$env:DATABASE_URL="postgresql://neondb_owner:npg_ABC123@ep-name.us-west-2.aws.neon.tech/neondb?sslmode=require" ; $env:SEED_TYPE="hamburgueria" ; $env:SEED_ADMIN_EMAIL="esqueceeotrem@gmail.com" ; $env:SEED_ADMIN_PASSWORD="NovaSenha!" ; $env:PLAN="essential" ; npx prisma migrate reset --force
```

**❌ ERRADO (NÃO funciona):**
```powershell
# Se a URL tiver -pooler, o reset VAI FALHAR silenciosamente!
$env:DATABASE_URL="postgresql://...@ep-name-pooler.us-west-2.aws.neon.tech/..." ; ...
                                         ^^^^^^^ NÃO USE ESTA URL!
```

**✅ CERTO:**
```powershell
# URL sem -pooler = funciona
$env:DATABASE_URL="postgresql://...@ep-name.us-west-2.aws.neon.tech/..." ; ...
                                     ^^^^^^^ SEM -pooler
```

> ⚠️ **ATENÇÃO:** `prisma migrate reset --force` **APAGA TODOS OS DADOS** do banco (pratos, categorias, fotos, configs). Use apenas:
> - Setup inicial
> - Mudança de tipo de seed (pizzaria → hamburgueria)
> - Cliente cancelou e vai reusar banco para outro
> 
> **NUNCA use** em banco com dados reais do cliente em produção!

> 💾 **Importante:** Salve o comando num bloco de notas com os dados de cada cliente para reusar depois (ex: para redeploy ou troubleshooting).

---

## 5 — Criar Web Service (Render)

### 5.1 — Criar o serviço

1. Acesse **https://dashboard.render.com** → Crie conta (pode usar GitHub)
2. Clique em **New +** → **Web Service**
3. **Connect a repository** → se primeira vez, clique em **Configure account** para conectar o GitHub
4. Selecione o repositório `restaurant-template` (ou nome que você deu)
5. Clique em **Connect**

### 5.2 — Configurar o serviço (ATENÇÃO aos detalhes!)

Na tela de configuração, preencha **exatamente assim**:

| Campo | Valor | ⚠️ Importante |
|-------|-------|---------------|
| **Name** | `restaurante-saborarte` (ou nome do cliente, sem espaços) | Esse nome vira a URL: `https://restaurante-saborarte.onrender.com` |
| **Region** | `Oregon (US West)` ou mesma do Neon | Escolha região mais próxima dos clientes finais |
| **Branch** | `main` | O Render vai monitorar esse branch para redeploys automáticos |
| **Root Directory** | `server` | 🔴 **CRÍTICO** — é onde está o `package.json` do backend |
| **Runtime** | `Node` | Render detecta automaticamente, mas confirme que está Node |
| **Build Command** | `npm ci --include=dev && npx prisma generate && npm run build` | Instala deps, gera Prisma Client, compila TypeScript |
| **Start Command** | `sh scripts/start.sh` | 🔴 **IMPORTANTE** — Script que roda migrations + seed (se necessário) + inicia servidor. Lida com timeouts do Neon gracefully |
| **Instance Type** | `Free` (para testar) ou `Starter` ($7/mês para produção) | Free dorme após 15 min de inatividade, Starter fica sempre ligado |

> **⚠️ CUIDADO:** Se o **Root Directory** não for `server`, o build vai falhar com `Cannot find module 'package.json'`. O Render precisa entrar na pasta `server/` antes de rodar `npm ci`.

### 5.3 — Auto-Deploy (recomendado)

Logo abaixo das configurações, você verá:

**Auto-Deploy:** ✅ `Yes` (deixe marcado)

Isso faz deploy automático toda vez que você fizer `git push` para a branch `main`. Muito útil para correções rápidas.

### 5.4 — Variáveis de Ambiente (TODAS necessárias!)

**ANTES de clicar em "Create Web Service"**, role até **Environment Variables** e clique em **Add Environment Variable**.

Adicione **TODAS** as variáveis abaixo (uma por uma):

#### 🔴 Variáveis OBRIGATÓRIAS (sem elas o site não funciona):

| Key | Value | Como obter |
|-----|-------|------------|
| `DATABASE_URL` | `postgresql://user:pass@ep-xxx-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require` | 1. Vá no [Neon Dashboard](https://console.neon.tech) → seu projeto<br>2. **Connection Details** → **Connection string**<br>3. **Pooled connection** (com `-pooler` na URL)<br>4. Copie e cole aqui |
| `DIRECT_URL` | `postgresql://user:pass@ep-xxx.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require` | 1. Mesmo lugar do DATABASE_URL<br>2. Mas agora copie **Unpooled connection** (SEM `-pooler`)<br>3. **IMPORTANTE:** Prisma precisa dessa URL para migrations (advisory locks) |
| `JWT_SECRET` | `gerado aleatoriamente` | Rode no terminal local:<br>`node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"`<br>Copie o resultado (64 caracteres aleatórios) |
| `NODE_ENV` | `production` | Ativa modo produção (HTTPS redirect, HSTS, rate limit, sem CORS permissivo) |
| `APP_URL` | `https://restaurante-saborarte.onrender.com` | Substitua `restaurante-saborarte` pelo **Name** que você escolheu na etapa 5.2 |
| `CORS_ORIGINS` | `https://restaurante-saborarte.onrender.com` | Mesma URL do APP_URL (permite frontend acessar backend) |
| `PORT` | `3000` | Render usa internamente, mas o app será acessado pela porta 443 (HTTPS) |
| `CLOUDINARY_CLOUD_NAME` | `dmebhvwpo` (exemplo) | 1. Vá em [Cloudinary Dashboard](https://console.cloudinary.com)<br>2. Canto superior esquerdo: **Product Environment Settings**<br>3. Copie o **Cloud name** |
| `CLOUDINARY_API_KEY` | `123456789012345` (exemplo) | Mesmo lugar, copie **API Key** |
| `CLOUDINARY_API_SECRET` | `AbCdEfGh1234567890` (exemplo) | Mesmo lugar, clique em **API Secret** → **Show** → copie |
| `CLOUDINARY_FOLDER_PREFIX` | `restaurante_saborarte` | Nome único para organizar uploads deste cliente (use letras, números e underscore apenas) |

#### 📊 Variáveis OPCIONAIS (para clientes específicos):

| Key | Value | Quando usar |
|-----|-------|-------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Se o restaurante aceitar pagamentos online (Stripe) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Para validar webhooks do Stripe |
| `SENDGRID_API_KEY` | `SG.xyz...` | Se quiser enviar emails transacionais (confirmações, etc) |

> **💡 Dica:** Para cada novo cliente, gere um **JWT_SECRET novo** e crie um **CLOUDINARY_FOLDER_PREFIX único**. NUNCA reutilize entre sites.

### 5.5 — Criar o serviço

Depois de adicionar **TODAS** as variáveis obrigatórias, clique em **Create Web Service** no final da página.

O Render vai:
1. Clonar o repositório do GitHub
2. Entrar na pasta `server/` (Root Directory)
3. Rodar o **Build Command** (leva ~2-3 minutos)
4. Se build passar, rodar o **Start Command**
5. Provisionar certificado SSL automático (HTTPS)

**Acompanhe os logs em tempo real** na aba **Logs** do painel. Você vai ver:

```
==> Cloning from https://github.com/seu-usuario/restaurant-template...
==> Running 'npm ci --include=dev && npx prisma generate && npm run build'
...
==> Build successful 🎉
==> Deploying...
==> Running 'npx prisma migrate deploy && node dist/index.js'
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "neondb"
3 migrations found in prisma/migrations
Applying migration `20250101000000_init`
Applying migration `20250110000000_add_config`
Applying migration `20250112000000_security`
The following migrations have been applied:
✅ 3 migrations applied

🍽️  Restaurant Template server running on http://localhost:3000
```

Quando aparecer `Restaurant Template server running` → **está no ar!**

### 5.6 — Testar se subiu

A URL do seu site é: `https://[nome-que-voce-escolheu].onrender.com`

Teste rapidamente:
- `https://SEU_APP.onrender.com/healthz` → deve retornar `{"status":"ok"}`
- `https://SEU_APP.onrender.com` → deve carregar a página inicial **COM DADOS** (você já rodou o seed na Etapa 4.2)
- `https://SEU_APP.onrender.com/admin` → faça login com as credenciais que você definiu no seed

✅ Se tudo funcionar, pule direto para a **Etapa 6 — Testar em produção**.

---

## 6 — Testar em produção

Substitua `SEU_APP` pelo nome do seu serviço no Render.

### 6.1 — Testes rápidos via browser

| Teste | URL | Esperado |
|-------|-----|----------|
| Health | `https://SEU_APP.onrender.com/healthz` | `{"status":"ok",...}` |
| Home | `https://SEU_APP.onrender.com` | Página do restaurante |
| Menu | `https://SEU_APP.onrender.com/menu` | Pratos do seed |
| Admin | `https://SEU_APP.onrender.com/admin` | Tela de login |

### 6.2 — Testes via terminal (opcional, para confirmar)

```bash
# Health check
curl -s https://SEU_APP.onrender.com/healthz

# Pegar token CSRF (necessário para login)
curl -s -c cookies.txt https://SEU_APP.onrender.com/api/csrf-token

# Ver categorias (endpoint público)
curl -s https://SEU_APP.onrender.com/api/categories
```

### 6.3 — Teste funcional completo

Repita a mesma checklist da etapa 2.4, mas usando a URL do Render em vez de localhost.

### 6.4 — Verificar SSL

Acesse `https://SEU_APP.onrender.com` — o cadeado 🔒 deve aparecer no navegador. O Render provisiona SSL automaticamente.

---

## 7 — Entregar para o cliente

### 7.1 — O que o cliente recebe

Envie por email/WhatsApp para o dono do restaurante:

---

**Assunto: Seu site está no ar! 🎉**

Olá [Nome],

Seu site já está funcionando:

🌐 **Site público:** https://[dominio].onrender.com
🔐 **Painel admin:** https://[dominio].onrender.com/admin

**Credenciais de acesso:**
- Email: `[email que você definiu no seed]`
- Senha: `[senha que você definiu no seed]`
- ⚠️ **Troque a senha no primeiro acesso** — clique em "🔑 Alterar Senha" na barra lateral do painel

**Requisitos da nova senha:**
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula, 1 minúscula e 1 número

**O que você pode fazer no painel admin:**
- Adicionar, editar e remover pratos do cardápio
- Organizar categorias
- Subir fotos dos pratos (JPG/PNG, até 2MB)
- Gerenciar a galeria de fotos
- Configurar nome, endereço, telefone e WhatsApp

Agende uma call de 15 minutos comigo e eu te mostro tudo!

---

### 7.2 — Domínio customizado (quando o cliente tiver)

1. No Render → seu serviço → **Settings → Custom Domains**
2. Adicione `www.restaurantedocliente.com.br`
3. O Render mostra os registros DNS (CNAME)
4. O cliente (ou você) configura no provedor de domínio (Registro.br, GoDaddy, etc.)
5. Propagação leva 5-60 minutos
6. Render provisiona SSL automaticamente

Depois de apontar o domínio, atualize as variáveis no Render:

```
APP_URL = https://www.restaurantedocliente.com.br
CORS_ORIGINS = https://www.restaurantedocliente.com.br
```

---

## 8 — Clonar para novo cliente

### Modelo: 1 repo, N instâncias

Você **não precisa** duplicar o código para cada cliente. Use o **mesmo repositório** e crie instâncias separadas:

```
                    ┌─────────────────┐
                    │   GitHub Repo   │
                    │  (branch main)  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼────┐  ┌─────▼──────┐  ┌────▼────────┐
     │   Render    │  │   Render   │  │   Render    │
     │ Sabor&Arte  │  │  Pizzaria  │  │  Sushi Bar  │
     │ (instância) │  │ (instância)│  │ (instância) │
     └──────┬──────┘  └─────┬──────┘  └──────┬──────┘
            │               │                │
     ┌──────▼──────┐  ┌─────▼──────┐  ┌──────▼──────┐
     │  Neon DB    │  │  Neon DB   │  │  Neon DB    │
     │ saborarte   │  │  pizzaria  │  │  sushibar   │
     └─────────────┘  └────────────┘  └─────────────┘
```

### Passo a passo para cada novo cliente

**Tempo total: ~15 minutos**

#### A) Banco de dados

1. Neon → **New Project** → nome do cliente (ex: `pizzaria-napoli`)
2. Copie a `DIRECT_URL` (unpooled connection)

#### B) Popular o banco

```powershell
cd F:\VSCode\Landpage\server

# Cole e edite:
$env:DATABASE_URL="<URL_NEON_DIRECT>" ; $env:SEED_TYPE="pizzaria" ; $env:SEED_ADMIN_EMAIL="dono@napoli.com" ; $env:SEED_ADMIN_PASSWORD="Napoli2026!" ; $env:PLAN="professional" ; npx prisma migrate deploy ; npx prisma db seed
```

#### C) Web Service no Render

1. Render → **New → Web Service** → mesmo repo do GitHub
2. Configure igual a Etapa 5.2 (mude só o **Name**)
3. **Environment variables:** cole a `DATABASE_URL` (pooled) + gere novo `JWT_SECRET` + `CLOUDINARY_FOLDER_PREFIX` único
4. Deploy

#### D) Testar

Acesse `https://pizzaria-napoli.onrender.com/admin` e faça login.

#### E) Domínio (se tiver)

Mesmo processo da etapa 7.2.

---

## 9 — Manutenção e updates

### Atualizar o código (todos os clientes recebem)

```bash
# No seu computador
cd f:\VSCode\Landpage
# faça suas alterações
git add .
git commit -m "feat: nova funcionalidade X"
git push origin main
```

O Render detecta o push e **redeploy automaticamente** em todos os serviços conectados ao mesmo repo/branch.

> ⚠️ Se quiser controlar quais clientes recebem a atualização, use branches diferentes (ex: `main`, `cliente-vip`) e conecte cada serviço Render a uma branch diferente.

### Backup do banco (por cliente)

Se quiser fazer backup manual:

```bash
# Precisa ter psql instalado localmente
pg_dump "postgresql://...connection-string-do-neon..." -Fc -f backup-cliente-2026-02-11.dump
```

Neon também tem backup automático no plano pago.

### Ver logs de um serviço

Render → serviço → **Logs** → logs em tempo real

### Reiniciar um serviço

Render → serviço → **Manual Deploy → Deploy latest commit**

---

## 10 — Se algo der errado

### Erro no build do Render

**Sintomas:** Build falha, serviço não sobe.

**Passos:**
1. Render → Logs → procure a linha vermelha de erro
2. Erros comuns:

| Erro | Causa | Solução |
|------|-------|---------|
| `Cannot find module` | Dependência faltando | Verifique se `Root Directory` é `server` |
| `prisma generate failed` | schema.prisma ausente | Confira que `prisma/` está no repo |
| `ECONNREFUSED` ao migrar | DATABASE_URL errada | Confira a variável no painel do Render |
| `JWT_SECRET is required` | Variável faltando | Adicione no Environment do Render |

### Erro após deploy (serviço caiu)

1. Render → Shell:
```bash
node dist/index.js
```
Vai mostrar o erro exato.

2. Se for `Cannot connect to database`:
   - Vá no Neon e confira se o banco está ativo
   - Copie novamente a connection string
   - Atualize `DATABASE_URL` no Render

### Plano Free do Render: serviço "dorme"

O plano Free desliga o serviço após 15 min sem tráfego. Quando alguém acessa, leva ~30 segundos para "acordar".

**Soluções:**
- **Plano Starter** ($7/mês) → serviço fica sempre ligado (recomendado para clientes)
- **Cron externo** → Use https://cron-job.org para pingar o serviço a cada 14 min (veja instruções detalhadas abaixo)

#### Como configurar o workaround (Cron-Job.org) — Passo a passo

**Tempo:** 5 minutos | **Custo:** $0 para sempre

1. **Acesse https://cron-job.org** → Clique em **Sign up** (canto superior direito)
   - Pode usar email ou login com Google/GitHub
   - Plano Free permite até 50 cron jobs (mais que suficiente)

2. **Após login**, clique em **Cronjobs** (menu lateral) → **Create cronjob**

3. **Preencha o formulário:**

   | Campo | Valor | Explicação |
   |-------|-------|------------|
   | **Title** | `Render Keep-Alive - [Nome do Cliente]` | Nome descritivo para você lembrar |
   | **URL** | `https://SEU_APP.onrender.com/healthz` | ⚠️ Substitua `SEU_APP` pela URL real do Render |
   | **Execution schedule** | Selecione **Every 14 minutes** | Render dorme após 15 min → pingamos 1 min antes |
   | **Enable** | ✅ Marcado | Ativa o cron job |
   | **Save responses** | Opcional | Se quiser ver histórico de respostas |

4. **Salve** → O cron job começa imediatamente

5. **Confirmação:**
   - Volte para **Dashboard** no cron-job.org
   - Você verá o job na lista com status **Enabled**
   - Após alguns minutos, clique no job → aba **History**
   - Deve aparecer requests com **Status 200** (sucesso)

**Exemplo de configuração para 3 clientes:**

```
✅ Render Keep-Alive - Sabor & Arte
   URL: https://saborarte.onrender.com/healthz
   Every 14 minutes

✅ Render Keep-Alive - Pizzaria Napoli  
   URL: https://pizzaria-napoli.onrender.com/healthz
   Every 14 minutes

✅ Render Keep-Alive - Sushi Bar Sakura
   URL: https://sushibar-sakura.onrender.com/healthz
   Every 14 minutes
```

**Importante:**
- ⚠️ Isso NÃO funciona 100% do tempo — às vezes o Render ainda dorme por updates deles
- ✅ Mas na prática mantém o serviço acordado ~95% do tempo
- ⚠️ **Não é profissional** para clientes pagantes — use Render Starter ($7/mês) nesses casos
- ✅ É OK para demos, testes e primeiros clientes (enquanto valida o negócio)

**Alternativa: Endpoint customizado** (opcional)

Se quiser evitar que o `/healthz` apareça nos logs toda hora, crie um endpoint específico:

```typescript
// Em server/src/app.ts, adicione antes das rotas:
app.get('/ping', (_req, res) => res.sendStatus(204)); // 204 = No Content
```

E configure o cron-job.org para pingar `/ping` em vez de `/healthz`.

---

## 📊 Resumo de custos

> Veja análise completa de custos e lucros em [UPDATE.md](UPDATE.md) e [GUIA_VENDAS_E_CUSTOMIZACAO.md](GUIA_VENDAS_E_CUSTOMIZACAO.md)

| Item | Free | Produção |
|------|------|----------|
| Render Web Service | $0 (dorme) | $7/mês (sempre ligado) |
| Neon PostgreSQL | $0 (0.5GB) | $19/mês (mais espaço — raramente necessário) |
| Cloudinary (uploads) | $0 (25GB/mês) | $89/mês (nunca vai precisar) |
| Domínio .com.br | — | ~R$40/ano |
| **Total mensal** | **$0** | **~$7/mês** (Render Starter + Neon Free + Cloudinary Free) |
| **Cobrar do cliente** | — | **R$100-200/mês** (sua margem: ~R$60-160) |

---

## ✅ Checklist final — Antes de entregar o primeiro cliente

Faça na ordem e marque cada item:

**Fase 0 (Auditoria):**
- [ ] Debug logs removidos de `csrf.ts`, `app.ts`, `upload.ts`
- [ ] Campo `debug` removido da resposta CSRF 403
- [ ] Cloudinary integrado e testado (uploads persistem no redeploy)

**Setup:**
- [ ] Etapa 1.1 — `.gitignore` na raiz criado
- [ ] Etapa 1.2 — `uploadLimiter` aplicado em `app.ts`
- [ ] Etapa 1.3 — Arquivos legados removidos da raiz
- [ ] Etapa 1.4 — Seed com variáveis de ambiente
- [ ] Etapa 2 — Todos os 14 testes locais passaram
- [ ] Etapa 3 — Repo no GitHub (privado)
- [ ] Etapa 4 — Banco criado no Neon
- [ ] Etapa 5 — Web Service criado no Render (**Starter** para cliente real)
- [ ] Etapa 5.2 — Todas as variáveis de ambiente preenchidas (incluindo Cloudinary)
- [ ] Etapa 5.4 — Seed rodou com sucesso
- [ ] Etapa 6 — Todos os testes de produção passaram
- [ ] Etapa 7 — Email/WhatsApp enviado ao cliente com credenciais

**Validação:**
- [ ] Upload de imagem funciona e persiste após redeploy
- [ ] Nenhum `console.log` de debug aparece nos logs do Render
- [ ] CSRF 403 não retorna campo `debug`

---

## 🧠 Perguntas frequentes

**P: Preciso saber Docker para usar o Render?**
R: Não. O Render usa o `package.json` diretamente. O Dockerfile é útil apenas se quiser deploy via Docker em outro lugar (VPS, AWS, etc.).

**P: Posso usar o PostgreSQL do Render em vez do Neon?**
R: Sim! Render tem PostgreSQL embutido. Mas o plano Free expira em 90 dias. Neon Free não expira. Por isso recomendo Neon.

**P: E se o cliente quiser mudar as cores/layout?**
R: Hoje o layout usa Tailwind CDN com cores fixas no HTML. Para trocar cores por cliente, seria necessário editar os HTMLs. Uma melhoria futura seria colocar as cores no banco (SiteConfig) e aplicar via CSS custom properties.

**P: Quantos clientes posso ter no mesmo repositório?**
R: Quantos quiser. Cada cliente é uma instância independente (Render + Neon), usando o mesmo código. Se um dia o código divergir muito entre clientes, aí sim crie branches separadas.

**P: E se eu quiser cobrar mensalidade do cliente?**
R: Cobre pelo menos o custo de infra ($7-26/mês) + sua margem. Muitos cobram R$50-200/mês por manutenção do site de restaurante.

**P: Como fazer upgrade de um cliente de Essential para Professional?**

Você tem **2 opções** (escolha a mais fácil para você):

---

**OPÇÃO 1: Via Neon SQL Editor (MAIS RÁPIDO — recomendado)**

1. **Acesse https://console.neon.tech** → Faça login
2. **Selecione o projeto** do cliente (ex: `restaurante-saborarte`)
3. **Clique em "SQL Editor"** (menu lateral esquerdo)
4. **Cole e execute este comando:**

```sql
UPDATE site_configs 
SET value = 'professional' 
WHERE key = 'site_plan';
```

5. **Clique em "Run"** (ou pressione Ctrl+Enter)
6. Deve aparecer: `✅ UPDATE 1` (1 linha atualizada)

**✅ Pronto!** O cliente agora tem acesso ao Plano Professional.

> **💡 Dica:** Se o comando der erro `relation "site_configs" does not exist`, primeiro descubra o nome correto da tabela rodando:
> ```sql
> SELECT tablename FROM pg_tables WHERE schemaname = 'public';
> ```
> ⚠️ **Copie APENAS o comando de dentro do bloco de código** (sem o `>` da citação).
> 
> Procure a tabela relacionada a configurações (pode ser `SiteConfig`, `site_config`, `site_configs`, etc.) e use esse nome exato no comando UPDATE.

---

**OPÇÃO 2: Via Prisma Studio (se preferir interface gráfica local)**

1. **No seu computador**, abra o PowerShell e rode:

```powershell
cd F:\VSCode\Landpage\server
$env:DATABASE_URL="<URL_NEON_DIRECT_DO_CLIENTE>"
npx prisma studio
```

2. **No navegador que abrir**, vá em `SiteConfig`
3. **Procure a linha** com `key = "site_plan"`
4. **Clique no campo `value`** e mude de `"essential"` para `"professional"`
5. **Clique em "Save 1 change"** (botão verde no topo)

---

**⚠️ IMPORTANTE:** Depois do upgrade, o cliente precisa:
1. **Fazer logout** do painel admin
2. **Fazer login novamente**
3. Agora vai ver as novas funcionalidades (logo, cor da marca, favicon, seção de equipe)

**🔄 Para fazer downgrade** (Professional → Essential), use o mesmo processo mas mude `value` para `"essential"`.
