# 🍽 Restaurant Template SaaS

**Sistema interno** para criação e entrega de sites profissionais personalizados para restaurantes. Inclui painel administrativo completo, cardápio digital, galeria de fotos, integração WhatsApp e infraestrutura segura para produção.

> ⚠️ **Este projeto é de uso interno** e não deve ser distribuído como template público sem adaptação contratual.

---

## 📊 Status & Veredicto

| Critério | Nota |
|---|---|
| Técnica | **8/10** |
| Segurança | **8/10** |
| UX | **7/10** |
| **Produção** | ✅ **SAFE TO SELL** |

**Data da auditoria:** 2026-02-13  
**Confiança:** 85% — Backend auditado integralmente. Zero blockers CRITICAL ou HIGH.

**3 ações imediatas pós-deploy:**
1. Definir `JWT_SECRET` forte no host (sem isso o servidor recusa iniciar em produção via `process.exit(1)`)
2. Configurar `CORS_ORIGINS` e `APP_URL` com o domínio final
3. Executar `prisma migrate deploy` + `prisma db seed` no primeiro deploy

---

## 🏗 Arquitetura: Single Branch & Static Injection

O projeto opera em **uma única branch (`main`)**. Não existem branches de longa duração para temas.

### Conceito Fundamental

```
themes/{tema}/  →  [select-theme.js]  →  public/  →  Express serve estático
     SOURCE              BUILD              OUTPUT
```

- **Fonte da Verdade:** `themes/{tema}/` — TODAS as edições de frontend (HTML, CSS, JS) são feitas aqui
- **Build Artifact:** `public/` — Gerado automaticamente pelo script de build
- **Mecanismo:** "Static Injection" — O script limpa `public/` e copia `themes/{THEME}` para dentro
- **Seleção de tema:** Via variável de ambiente `THEME` (padrão: `restaurante`)

### 🚫 Regras Críticas

1. **NUNCA editar `public/` diretamente** — Mudanças serão perdidas no próximo build
2. **SEMPRE editar em `themes/{tema}/`** — E depois rodar o build
3. **Cross-Theme Fixes:** Se corrigir um bug em `themes/restaurante/index.html`, verificar e aplicar em `themes/hamburgueria/index.html` também

### Script de Build: `scripts/select-theme.js`

```javascript
const THEME = process.env.THEME || 'restaurante';
// 1. Limpa public/ (preserva .gitkeep)
// 2. Copia recursivamente themes/{THEME}/ → public/
```

### Fluxo de Trabalho

1. Edite em `themes/{tema}/`
2. Teste rodando `THEME={tema} npm run dev`
3. Para deploy, o pipeline seleciona o tema via env var

---

## 🛠 Tech Stack

| Camada | Tecnologia |
|---|---|
| **Frontend** | HTML5, Tailwind CSS (CDN), Vanilla JS |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL 14+ (Neon) + Prisma ORM |
| **Auth** | JWT (access + refresh tokens) com rotation |
| **Upload** | Multer (validação estrita) + Cloudinary (CDN) |
| **Pagamento** | Stripe Checkout (opcional) |
| **Segurança** | Helmet, Rate Limit, CORS, Zod, CSRF |
| **Logger** | Winston (arquivos + console) + Morgan |
| **Container** | Docker + Docker Compose |
| **Infra** | Render (Web Service), Neon (DB), Cloudinary (images) |

### Dependências Principais (server/package.json v2.0.0)

**Core:** express, @prisma/client, jsonwebtoken, bcryptjs, cloudinary, zod, helmet, express-rate-limit, multer, winston, morgan, cookie-parser, cors, compression, uuid

**Dev:** typescript, ts-node-dev, prisma, jest, supertest, eslint, prettier, cross-env

**Engine:** Node.js >= 18.0.0

---

## 📁 Estrutura de Arquivos

```
├── themes/                        # ✅ FONTE DA VERDADE (frontend)
│   ├── restaurante/               #   Tema padrão
│   │   ├── index.html             #   Landing page
│   │   ├── menu.html              #   Cardápio digital
│   │   ├── gallery.html           #   Galeria de fotos
│   │   ├── about.html             #   Página Sobre
│   │   ├── contact.html           #   Contato
│   │   ├── admin.html             #   Painel administrativo
│   │   ├── privacy.html           #   Privacidade
│   │   ├── favicon.svg            #   Ícone
│   │   └── js/                    #   JavaScript client-side
│   │       ├── app.js             #   Lógica principal + hydration
│   │       ├── cart.js            #   Carrinho de compras
│   │       └── admin.js           #   Lógica do painel admin
│   └── hamburgueria/              #   Tema alternativo (mesma estrutura)
│
├── public/                        # 🚫 GERADO (não editar!)
│   └── ...                        #   Cópia do tema ativo
│
├── server/                        # Backend
│   ├── src/
│   │   ├── app.ts                 # Configuração Express (middlewares, rotas, static)
│   │   ├── index.ts               # Entry point
│   │   ├── routes/                # Rotas da API
│   │   │   ├── auth.ts            #   Login/logout/refresh/change-password
│   │   │   ├── categories.ts      #   CRUD categorias
│   │   │   ├── dishes.ts          #   CRUD pratos (com upload)
│   │   │   ├── gallery.ts         #   CRUD galeria (com upload)
│   │   │   ├── config.ts          #   Configurações do site (key-value)
│   │   │   ├── aboutContent.ts    #   Conteúdo da página Sobre
│   │   │   ├── upload.ts          #   Upload genérico
│   │   │   ├── plan.ts            #   Consulta de plano ativo
│   │   │   └── checkout.ts        #   Stripe checkout (venda de template)
│   │   ├── middlewares/
│   │   │   ├── auth.ts            #   JWT middleware
│   │   │   ├── csrf.ts            #   Double Submit Cookie + timingSafeEqual
│   │   │   ├── upload.ts          #   Multer config + magic bytes
│   │   │   ├── errorHandler.ts    #   Error handler central
│   │   │   ├── rateLimit.ts       #   Rate limiters (auth, api, upload)
│   │   │   ├── plan.ts            #   Plan gating middleware
│   │   │   └── validate.ts        #   Zod validation middleware
│   │   ├── services/
│   │   │   └── authService.ts     #   Lógica JWT, brute force tracker
│   │   ├── utils/
│   │   │   ├── errors.ts          #   Classes de erro (AppError, etc.)
│   │   │   ├── logger.ts          #   Winston config
│   │   │   └── validators.ts      #   Validações Zod reutilizáveis
│   │   └── types/
│   │       └── index.ts           #   TypeScript type definitions
│   ├── prisma/
│   │   ├── schema.prisma          #   Schema do banco
│   │   ├── seed.ts                #   Router de seed (por SEED_TYPE)
│   │   ├── seed-hamburgueria.ts   #   Seed tema hamburgueria
│   │   ├── seed-pizzaria.ts       #   Seed tema pizzaria
│   │   └── seed-confeitaria.ts    #   Seed tema confeitaria
│   ├── scripts/
│   │   ├── change-plan.ts         #   Alterar plano de um cliente
│   │   ├── backup.ts              #   Export/import JSON do banco
│   │   └── start.sh               #   Script de start para Render
│   ├── Dockerfile                 # Container de produção
│   ├── package.json               # Scripts npm + deps
│   ├── tsconfig.json              # TypeScript config
│   └── .env.example               # Template de variáveis
│
├── scripts/                       # Scripts de automação
│   ├── select-theme.js            # Build: injeta tema em public/
│   ├── provision_client.js        # Provisionamento automático (Neon + Render)
│   ├── preflight.ps1              # Checagem pré-deploy
│   ├── backup_all_clients.sh      # Backup pg_dump de todos os clientes
│   └── restore_doc.sh             # Restauração de backup
│
├── docs/                          # Documentação
│   ├── keep/                      # Docs permanentes
│   │   ├── README-repo.md         # Documentação técnica completa
│   │   ├── GUIA_COMPLETO_DEPLOY.md# Guia de deploy passo a passo
│   │   ├── PLANOS_COMERCIAIS.md   # Planos Básico/PRO detalhados
│   │   ├── GUIA_VENDAS_E_CUSTOMIZACAO.md # Vendas e customização
│   │   ├── CHECKLIST_CLIENTE.md   # Checklist para novo cliente
│   │   ├── final_verdict.md       # Veredicto: SAFE TO SELL
│   │   └── ...
│   ├── CURRENT_ARCHITECTURE_DUMP.md # Dump de arquitetura (NotebookLM)
│   ├── DATABASE_SCHEMA.md         # Schema documentado
│   └── ...
│
├── .github/workflows/             # CI/CD
│   └── backup.yml                 # Backup semanal via GitHub Actions
│
├── docker-compose.yml             # Deploy produção
├── docker-compose.dev.yml         # Deploy desenvolvimento
└── README.md                      # Este arquivo
```

---

## 🎨 Temas Disponíveis

### Frontend (themes/)

| Tema | Design | Fonte | Cor Principal | Status |
|---|---|---|---|---|
| `restaurante` | Restaurante genérico | Playfair Display | `#ee7620` (laranja) | ✅ Pronto |
| `hamburgueria` | Hamburgueria | Barlow Condensed | `#DC2626` (vermelho) | ✅ Pronto |

### Seeds de Dados (server/prisma/)

| Seed | SEED_TYPE | Categorias | Pratos | Imagens |
|---|---|---|---|---|
| `seed.ts` | `restaurante` | Entradas, Principais, Sobremesas, Bebidas | ~15 pratos | URLs Unsplash |
| `seed-hamburgueria.ts` | `hamburgueria` | Hambúrgueres, Acompanhamentos, Bebidas, Sobremesas | ~15 pratos | URLs Unsplash |
| `seed-pizzaria.ts` | `pizzaria` | Pizzas Tradicionais, Especiais, Bebidas | ~15 pratos | URLs Unsplash |
| `seed-confeitaria.ts` | `confeitaria` | Bolos, Tortas, Doces | ~15 pratos | URLs Unsplash |

### Paleta de Cores (Tailwind config inline)

**Restaurante:**
```js
brand: { 400: '#f19244', 500: '#ee7620', 600: '#d95c16' }
dark:  { 700: '#242440', 800: '#1a1a2e', 900: '#0f0f1a' }
```

**Hamburgueria:**
```js
brand: { 400: '#EF4444', 500: '#DC2626', 600: '#B91C1C' }
dark:  { 700: '#242440', 800: '#1a1a2e', 900: '#0f0f1a' }
```

Para mudar a paleta, editar os valores `brand` e `dark` nos `<script>` de Tailwind config dentro dos HTMLs do tema.

---

## ✅ Funcionalidades Implementadas

- ✅ **Painel Admin** — CRUD completo de pratos, categorias, galeria e configurações
- ✅ **Onboarding Guiado** — Modal "Primeiros Passos" para novos admins (auto-detecção de progresso)
- ✅ **Preview ao Vivo** — Botão para visualizar o site em nova aba direto do admin
- ✅ **Cardápio Digital** — Categorias com filtros, preços e fotos
- ✅ **Galeria de Fotos** — Upload com lightbox e navegação por teclado
- ✅ **WhatsApp Integrado** — Botão flutuante + pedidos diretos + validação de número
- ✅ **Upload Seguro** — 2MB max, MIME whitelist, magic bytes, UUID filenames, Cloudinary CDN
- ✅ **Autenticação Robusta** — JWT + refresh token, brute force protection, token rotation
- ✅ **CSRF Protection** — Double Submit Cookie com `crypto.timingSafeEqual`
- ✅ **Segurança Hardened** — Helmet, Rate Limit, CORS, Zod, XSS sanitization
- ✅ **Logger Estruturado** — Winston (console + arquivo em produção)
- ✅ **Backup/Restore** — Script JSON para export/import de dados
- ✅ **SEO Ready** — Meta tags dinâmicas, Open Graph, Schema.org
- ✅ **100% Responsivo** — Mobile-first design
- ✅ **Planos SaaS** — Básico vs PRO com feature gating
- ✅ **Carrinho de Compras** — Carrinho com cálculo de total (WhatsApp checkout)
- ✅ **Provisionamento Automático** — Script que cria Neon DB + Render Service em ~2min

---

## 🗄️ Schema do Banco de Dados

**Database:** PostgreSQL (Neon)  
**ORM:** Prisma  
**Conexão:** pooled (produção) / direct (migrations)

### Modelos

#### 1. `AdminUser` (tabela: `admin_users`)
Armazena o admin do restaurante.
- `id`: UUID (PK)
- `email`: String único (login)
- `passwordHash`: BCrypt hash
- `name`: String
- `role`: Enum (`ADMIN` | `EDITOR`)
- `tokenVersion`: Int — para invalidar todas as sessões após troca de senha
- `createdAt` / `updatedAt`: timestamps

#### 2. `Session` (tabela: `sessions`)
Gerencia logins ativos (JWT Refresh Tokens).
- `id`: UUID (PK)
- `userId`: FK → AdminUser
- `refreshToken`: String
- `refreshTokenHash`: String único (SHA-256)
- `userAgent` / `ipAddress`: opcionais
- `expiresAt`: DateTime
- **Nota:** Token roubado pode ser revogado deletando a row ou incrementando `AdminUser.tokenVersion`

#### 3. `Category` (tabela: `categories`)
Categorias do cardápio (ex: "Pizzas", "Bebidas").
- `id`: UUID (PK)
- `name`: String único
- `slug`: String único (URL-friendly)
- `sortOrder`: Int (ordenação customizada)
- `image`: String? (imagem de capa opcional)
- `active`: Boolean (toggle de visibilidade)
- **Relação:** Um para muitos com `Dish`

#### 4. `Dish` (tabela: `dishes`)
Itens do cardápio.
- `id`: UUID (PK)
- `name` / `slug`: identificadores
- `description`: String?
- `price`: Int (**em centavos**, ex: 1000 = R$ 10,00)
- `image`: String? (URL Cloudinary)
- `featured`: Boolean (destaque na home)
- `active`: Boolean
- `categoryId`: FK → Category
- `sortOrder`: Int
- **Index:** `(categoryId, active)` para queries otimizadas

#### 5. `SiteConfig` (tabela: `site_config`)
Key-Value store para conteúdo dinâmico do site.
- `key`: String (PK) — ex: `hero_title`, `whatsapp_number`, `colors_primary`
- `value`: String
- **Uso:** Frontend busca via `/api/config` para customizar visual sem código

#### 6. `GalleryImage` (tabela: `gallery_images`)
Imagens da galeria do restaurante.
- `id`: UUID (PK)
- `src`: String (URL Cloudinary)
- `alt`: String? (acessibilidade)
- `sortOrder`: Int
- `active`: Boolean

#### 7. `TemplatePurchase` (tabela: `template_purchases`)
Registros de vendas do template (se vendendo o SaaS em si).
- `id`: UUID (PK)
- `email` / `name`: comprador
- `stripeSessionId` / `stripePaymentId`: links com Stripe
- `amount`: Int (centavos)
- `currency`: String (default: `brl`)
- `status`: String (`pending` | `paid`)

### Relacionamentos
- **One-to-Many:** `Category` → `Dish` (uma categoria tem muitos pratos)
- **One-to-Many:** `AdminUser` → `Session` (um admin tem muitas sessões)

### Schema Prisma Completo

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model AdminUser {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  name         String
  role         Role      @default(ADMIN)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  tokenVersion Int       @default(0)
  sessions     Session[]
  @@map("admin_users")
}

model Session {
  id               String    @id @default(uuid())
  userId           String
  refreshToken     String
  refreshTokenHash String    @unique
  userAgent        String?
  ipAddress        String?
  expiresAt        DateTime
  createdAt        DateTime  @default(now())
  user             AdminUser @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("sessions")
}

model Category {
  id        String   @id @default(uuid())
  name      String   @unique
  slug      String   @unique
  sortOrder Int      @default(0)
  image     String?
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  dishes    Dish[]
  @@map("categories")
}

model Dish {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  description String?
  price       Int
  image       String?
  featured    Boolean  @default(false)
  active      Boolean  @default(true)
  categoryId  String
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  @@index([categoryId, active])
  @@map("dishes")
}

model SiteConfig {
  key   String @id
  value String
  @@map("site_config")
}

model GalleryImage {
  id        String   @id @default(uuid())
  src       String
  alt       String?
  sortOrder Int      @default(0)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  @@map("gallery_images")
}

model TemplatePurchase {
  id              String   @id @default(uuid())
  email           String
  name            String?
  stripeSessionId String?  @unique
  stripePaymentId String?
  amount          Int
  currency        String   @default("brl")
  status          String   @default("pending")
  createdAt       DateTime @default(now())
  @@map("template_purchases")
}

enum Role {
  ADMIN
  EDITOR
}
```

---

## 📄 API Endpoints

### Auth

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/auth/login` | Público | Login admin |
| POST | `/api/auth/refresh` | Público | Renovar access token |
| POST | `/api/auth/logout` | Público | Encerrar sessão |
| GET | `/api/auth/me` | Admin | Dados do admin logado |
| PUT | `/api/auth/change-password` | Admin | Alterar senha (invalida todas sessões) |

### Dishes (Pratos)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/dishes` | Público | Listar pratos ativos |
| GET | `/api/dishes/featured` | Público | Listar pratos destaque |
| GET | `/api/dishes/all` | Admin | Listar todos (incluindo inativos) |
| POST | `/api/dishes` | Admin | Criar prato (multipart/form-data) |
| PUT | `/api/dishes/:id` | Admin | Atualizar prato |
| DELETE | `/api/dishes/:id` | Admin | Excluir prato |

### Categories (Categorias)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/categories` | Público | Listar ativas (com pratos) |
| GET | `/api/categories/all` | Admin | Listar todas |
| POST | `/api/categories` | Admin | Criar categoria |
| PUT | `/api/categories/:id` | Admin | Atualizar categoria |
| DELETE | `/api/categories/:id` | Admin | Excluir categoria |

### Gallery (Galeria)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/gallery` | Público | Listar imagens ativas |
| GET | `/api/gallery/all` | Admin | Listar todas |
| POST | `/api/gallery` | Admin | Upload imagem |
| PUT | `/api/gallery/:id` | Admin | Atualizar metadata |
| DELETE | `/api/gallery/:id` | Admin | Excluir imagem |

### Config (Configurações do Site)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/config` | Público | Obter configurações (filtra keys PRO se plano ≠ professional) |
| PUT | `/api/config` | Admin | Atualizar configurações |
| GET | `/api/config/keys` | Admin | Listar chaves válidas |

### About Content

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/about-content` | Público | Obter conteúdo da página Sobre |
| PUT | `/api/about-content` | Admin | Atualizar conteúdo Sobre |

### Upload

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/upload` | Admin | Upload genérico de imagem (Cloudinary) |

### Plan

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/plan` | Público | Consultar plano ativo |

### CSRF

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/csrf-token` | Público | Obter token CSRF (cookie + body) |

### Frontend-Backend Integration (Hydration)

O frontend busca `/api/config` para "hidratar" o HTML com dados dinâmicos:

```javascript
// public/js/app.js (gerado de themes/{tema}/js/app.js)
async function loadConfig() {
    const data = await api(`/config?_=${Date.now()}`);
    if (data) {
        siteConfig = validateConfig(data);
        applyConfig(); // Atualiza DOM: document.title, meta tags, hero, etc.
    }
    document.body.classList.add('config-loaded'); // FOUC prevention fade-in
}

function applyConfig() {
    setText('nav-brand', siteConfig.restaurant_name);
    setHeroTitle('hero-title', siteConfig.hero_title);
    // ... Aplica WhatsApp, Social Links, Colors, etc.
}
```

---

## ⚙️ Painel Administrativo

Acessível em `/admin`. O frontend é um SPA dentro do `admin.html`.

### Funcionalidades

- **Pratos:** Criar, editar, excluir. Upload de foto, definir preço, categoria, destaque
- **Categorias:** Organizar cardápio, definir ordem de exibição
- **Galeria:** Upload de fotos do restaurante, adicionar descrições
- **Configurações:** Nome, slogan, endereço, telefone, WhatsApp, horários, redes sociais, textos da home
- **Alterar Senha:** Botão "🔑 Alterar Senha" na sidebar. Exige senha atual + nova senha (mín. 8 chars, maiúscula, minúscula e número). Invalida todas as sessões após troca
- **Onboarding:** Modal "Primeiros Passos" detecta automaticamente o progresso do admin

### Acesso

- URL: `https://dominio-do-cliente.com/admin`
- Credenciais padrão: Definidas no seed com `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD`
- ⚠️ **O cliente deve trocar a senha no primeiro acesso** pelo botão 🔑 na sidebar

---

## 🔐 Segurança (Detalhada)

### Autenticação
- ✅ **Brute Force Protection:** 5 tentativas → bloqueio de 15 minutos por IP
- ✅ **Timing Attack Prevention:** Bcrypt dummy hash quando usuário não existe
- ✅ **Limite de Sessões:** Máximo 5 sessões ativas por usuário
- ✅ **JWT_SECRET Validation:** Servidor não inicia em produção com secret padrão (`process.exit(1)`)
- ✅ **Session Cleanup:** Limpeza automática de sessões expiradas (cron 1h)
- ✅ **Token Version:** Invalidação imediata de todos os JWTs após troca de senha
- ✅ **Refresh Token:** Hash SHA-256 no banco

### CSRF
- ✅ **Double Submit Cookie:** Token gerado em `/api/csrf-token`
- ✅ **Timing Safe Compare:** `crypto.timingSafeEqual` para comparação
- ✅ **Aplicado em:** PUT `/api/config`, `/api/dishes`, `/api/gallery`, `/api/categories`, `/api/about-content`, `/api/upload`
- ✅ **Stripe Webhook isento:** Verificação própria via signature

### HTTP & Headers
- ✅ **Helmet Hardened:** CSP, HSTS (1 ano + preload), frameAncestors, Permissions-Policy
- ✅ **HTTPS Redirect:** Automático em produção
- ✅ **Security Headers:** X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- ✅ **CORS Restritivo:** Origem exata, métodos limitados, maxAge 600s

### Rate Limiting
- ✅ **Auth Endpoints:** 10 requests / 15 min
- ✅ **API Geral:** 100 requests / 15 min
- ✅ **Upload:** 30 requests / hora
- ✅ **Key Generator:** Baseado em IP (compatível com proxies)

### Upload & Arquivos
- ✅ **MIME Whitelist:** Set estrito (`image/jpeg`, `image/png`, `image/webp`, `image/gif`)
- ✅ **Extension Whitelist:** Validação dupla (MIME + extensão)
- ✅ **Magic Bytes Validation:** Verifica assinatura binária do arquivo (impede .exe renomeado para .jpg)
- ✅ **Path Traversal Blocked:** Rejeita `..`, `\\`, caracteres null em `/uploads`
- ✅ **Filename Sanitization:** UUID + extensão, sem caracteres especiais
- ✅ **Tamanho Limitado:** 2MB por arquivo, 1 arquivo + 10 campos por request
- ✅ **Cloudinary:** Upload persistente para CDN (não efêmero)

### Input Validation
- ✅ **Zod Validation:** Todas as rotas de escrita validam tipos e tamanhos
- ✅ **XSS Sanitization:** Valores de config removem `<script>`, event handlers, `javascript:`
- ✅ **Email Normalization:** Lowercase + trim antes de buscar no banco

### Error Handling
- ✅ **Stack Trace:** Nunca exposto ao cliente (apenas logs internos)
- ✅ **Mensagens Genéricas:** Erros 500 retornam "Erro interno do servidor"
- ✅ **Tratamento Específico:** Multer, Prisma, Zod, CORS, JSON parse

### Logs
- ✅ **PII Protection:** Email, senhas, tokens nunca aparecem em logs de produção
- ✅ **Morgan Sanitizado:** Formato customizado sem headers de autenticação
- ✅ **Metadata Limitada:** path, method, IP (sem body/headers completos)

### Plan Gating
- ✅ **Config GET:** Filtra keys PRO (`logo_url`, `brand_color`, `favicon_url`) quando plano ≠ `professional`
- ✅ **Config PUT:** Bloqueia escrita em keys PRO com `ForbiddenError`
- ✅ **SiteConfig oculto:** key `site_plan` nunca é retornada na API pública

---

## 📊 Variáveis de Ambiente

| Variável | Descrição | Exemplo | Obrigatório |
|---|---|---|---|
| `DATABASE_URL` | URL conexão PostgreSQL (pooled) | `postgresql://user:pass@host/db?sslmode=require` | ✅ |
| `DIRECT_URL` | URL direta PostgreSQL (migrations) | `postgresql://user:pass@host/db` | ✅ |
| `JWT_SECRET` | Secret JWT (64 bytes base64) | `openssl rand -base64 64` | ✅ |
| `JWT_ACCESS_EXP` | Expiração access token | `2h` | |
| `JWT_REFRESH_EXP` | Expiração refresh token | `30d` | |
| `PORT` | Porta do servidor | `3000` | |
| `NODE_ENV` | Ambiente | `development` / `production` | ✅ |
| `APP_URL` | URL base da aplicação | `https://cliente.com.br` | ✅ |
| `CORS_ORIGINS` | Origens CORS (vírgula separada) | `https://cliente.com.br` | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloud name Cloudinary | `meu-cloud` | ✅ |
| `CLOUDINARY_API_KEY` | API key Cloudinary | `123456789` | ✅ |
| `CLOUDINARY_API_SECRET` | API secret Cloudinary | `AbCdEf...` | ✅ |
| `CLOUDINARY_FOLDER_PREFIX` | Prefixo das pastas no Cloudinary | `restauranteteste` | |
| `THEME` | Tema ativo para build | `restaurante` / `hamburgueria` | |
| `SEED_TYPE` | Tipo de seed para popular DB | `restaurante` / `hamburgueria` / `pizzaria` / `confeitaria` | |
| `SEED_ADMIN_EMAIL` | Email admin no seed | `admin@restaurante.com` | |
| `SEED_ADMIN_PASSWORD` | Senha admin no seed | `admin123` | |
| `STRIPE_SECRET_KEY` | Chave Stripe (opcional) | `sk_live_...` | |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook Stripe | `whsec_...` | |
| `PLAN` | Plano do cliente | `essential` / `professional` | |

---

## 🚀 Quick Start (Desenvolvimento Local)

```bash
# 1. Instalar dependências
cd server && npm install

# 2. Configurar ambiente
cp .env.example .env
# Editar .env com DATABASE_URL, JWT_SECRET, Cloudinary, etc.

# 3. Rodar migrations e seed
npx prisma migrate dev
npx prisma db seed

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

**Acesso local:**
- Site: http://localhost:3000
- Admin: http://localhost:3000/admin
- Login padrão: `admin@restaurante.com` / `admin123`

### Comandos npm Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor dev com hot-reload (ts-node-dev) |
| `npm run build` | Build: select-theme + tsc |
| `npm run start` | Rodar build de produção |
| `npm run select-theme` | Injetar tema selecionado em public/ |
| `npm run prisma:migrate` | Criar migration (dev) |
| `npm run prisma:migrate:deploy` | Aplicar migrations (produção) |
| `npm run prisma:seed` | Popular banco com dados iniciais |
| `npm run prisma:studio` | UI visual do banco (Prisma Studio) |
| `npm run prisma:generate` | Gerar Prisma Client |
| `npm run test` | Rodar testes (Jest) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run backup` | Exportar banco em JSON |
| `npm run backup:restore` | Importar banco de JSON |
| `npm run change-plan` | Alterar plano de um cliente |
| `npm run dev:confeitaria` | Dev com tema confeitaria |
| `npm run seed:confeitaria` | Seed dados confeitaria |

---

## 🚀 Deploy em Produção

### Checklist Obrigatório

- [ ] **JWT_SECRET único e forte** (64 bytes, base64) — `openssl rand -base64 64`
- [ ] **Credenciais admin** alteradas do valor padrão
- [ ] **DATABASE_URL** com SSL e connection pooling
- [ ] **CORS_ORIGINS** definido com domínio exato
- [ ] **HTTPS configurado** (certificado válido)
- [ ] **Cloudinary** configurado
- [ ] **Backup automático** configurado
- [ ] **Stripe** configurado com chaves de produção (se aplicável)

### Docker Compose

```bash
docker compose up -d
```

Inclui:
- **app:** Node.js (porta 3000)
- **db:** PostgreSQL 14 (porta 5432, apenas localhost)

### PM2 (Alternativa)

```bash
npm run build
pm2 start dist/index.js --name cliente-xyz
pm2 startup
pm2 save
```

### Render (Recomendado para SaaS)

Deploy automatizado via `provision_client.js` que:
1. Cria banco de dados no Neon
2. Roda migrations + seed
3. Cria Web Service no Render
4. Configura todas as env vars
5. Salva credenciais em `clients/nome-cliente.json`

### Nginx (Reverse Proxy)

```nginx
server {
    server_name restaurante-xyz.com.br;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/restaurante-xyz.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/restaurante-xyz.com.br/privkey.pem;
}

server {
    if ($host = restaurante-xyz.com.br) {
        return 301 https://$host$request_uri;
    }
    listen 80;
    server_name restaurante-xyz.com.br;
    return 404;
}
```

---

## 🛠 Scripts de Automação

### 1. Provisionamento Automático (`scripts/provision_client.js`)

**O que faz:** Cria um cliente novo do zero em ~2 minutos (vs 20min manual).

**Etapas automatizadas:**
- ✅ Cria banco de dados no Neon
- ✅ Roda migrations + seed com dados customizados
- ✅ Cria Web Service no Render
- ✅ Configura todas as env vars automaticamente
- ✅ Salva credenciais em `clients/nome-cliente.json`

**Setup (variáveis necessárias):**
```powershell
$env:NEON_API_KEY="neon_api_xxx"
$env:RENDER_API_KEY="rnd_xxx"
$env:GITHUB_REPO="https://github.com/seu-usuario/restaurant-template"
$env:CLOUDINARY_CLOUD_NAME="dmebhvwpo"
$env:CLOUDINARY_API_KEY="123456789"
$env:CLOUDINARY_API_SECRET="AbCdEfGh12345"
```

**Uso:**
```bash
node scripts/provision_client.js
```

O script pergunta: nome do cliente, tipo de seed, email admin, senha admin, plano, região Neon.

### 2. Backup Local (`scripts/backup_all_clients.sh`)

Cria dumps pg_dump de todos os bancos dos clientes. Salvos em `$HOME/restaurant-backups/YYYY-MM-DD/`.

### 3. Backup Automático (`.github/workflows/backup.yml`)

- Roda toda semana (domingo 3am UTC) via GitHub Actions
- Cria branch no Neon (snapshot do banco)
- Mantém os 4 últimos backups (auto-cleanup)
- Grátis (plano free GitHub + Neon branching)

### 4. Preflight (`scripts/preflight.ps1`)

Checagem pré-deploy: linting, types, testes, build.

### 5. Select Theme (`scripts/select-theme.js`)

Injeta tema em `public/`. Usado no build e dev.

---

## 🧑‍💼 Processo de Novo Cliente (Passo a Passo)

### Opção A: Automático (Recomendado)

```bash
# Configurar env vars de API uma vez
node scripts/provision_client.js
# Seguir prompts interativos
```

### Opção B: Manual

#### 1. Preparar Ambiente
```bash
cp -r Landpage cliente-restaurante-xyz
cd cliente-restaurante-xyz
```

#### 2. Criar Banco de Dados (Neon)
Via dashboard ou CLI.

#### 3. Configurar `.env`
```bash
cd server && cp .env.example .env
```

Preencher com dados do cliente:
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
JWT_SECRET="<openssl rand -base64 64>"
APP_URL="https://restaurante-xyz.com.br"
CORS_ORIGINS="https://restaurante-xyz.com.br"
SEED_ADMIN_EMAIL="admin@restaurante-xyz.com.br"
SEED_ADMIN_PASSWORD="senha_temporaria_123"
CLOUDINARY_CLOUD_NAME="xxx"
CLOUDINARY_API_KEY="xxx"
CLOUDINARY_API_SECRET="xxx"
NODE_ENV="production"
```

> ⚠️ **JWT_SECRET único por cliente:** `openssl rand -base64 64`

#### 4. Instalar Dependências
```bash
npm install
```

#### 5. Aplicar Migrações + Seed
```bash
npx prisma migrate deploy
npx prisma db seed
```

#### 6. Deploy
```bash
docker compose up -d
# ou
npm run build && pm2 start dist/index.js --name restaurante-xyz
```

#### 7. Configurar Domínio
- Apontar DNS para o servidor
- Configurar HTTPS (Let's Encrypt / Cloudflare)

#### 8. Configurar Conteúdo Inicial
Acessar `/admin` e preencher:
- Configurações: Nome, slogan, endereço, telefone, WhatsApp
- Categorias: Entradas, Pratos Principais, Sobremesas
- Pratos: 5-10 pratos iniciais com fotos
- Galeria: 10-15 fotos do estabelecimento

#### 9. Entregar ao Cliente
- Enviar credenciais de acesso ao painel (`/admin`)
- Fornecer guia simplificado de uso
- Treinamento básico (15-30 min)
- ⚠️ Cliente deve trocar a senha no primeiro acesso

---

## 💼 Modelo Comercial & Planos

### Modelo de Receita

- **Plano Básico ("Presença Digital"):** R$ 147/mês
- **Plano PRO ("Gestão Completa"):** R$ 297/mês
- **Setup único:** R$ 197 (ambos os planos)

### Custo Operacional por Cliente

| Item | Custo |
|---|---|
| Render (hosting) | ~R$ 0-35/mês (free tier ou starter) |
| Neon (database) | ~R$ 0-10/mês (free tier generoso) |
| Cloudinary (imagens) | ~R$ 0-30/mês (free tier até 25GB) |
| Domínio (.com.br) | ~R$ 40/ano |
| SSL | Gratuito (Let's Encrypt) |
| **Total por cliente** | **~R$ 10-15/mês** |
| **Margem bruta** | **90%+** |

### Tabela Comparativa

| Feature | Básico | PRO |
|---|---|---|
| **Site & Cardápio** | | |
| Landing page completa | ✅ | ✅ |
| Cardápio digital | ✅ (50 pratos) | ✅ (ilimitado) |
| Categorias | ✅ (8) | ✅ (ilimitado) |
| Galeria de fotos | ✅ (20) | ✅ (50) |
| Páginas institucionais | ✅ | ✅ |
| WhatsApp integration | ✅ | ✅ |
| SEO básico | ✅ | ✅ |
| 100% Responsivo | ✅ | ✅ |
| **Identidade Visual** | | |
| Logo personalizado | ❌ | ✅ |
| Favicon | ❌ | ✅ |
| Cores customizáveis | ❌ | ✅ |
| Seção de valores/diferenciais | ❌ | ✅ (6 cards) |
| Página de equipe | ❌ | ✅ (10 membros) |
| **Marketing** | | |
| QR Code personalizado | ❌ | ✅ |
| Google Analytics | ❌ | ✅ |
| Meta tags avançadas | ❌ | ✅ |
| Footer customizável | ❌ | ✅ |
| **Gestão** | | |
| Painel admin | ✅ (1 usuário) | ✅ (5 usuários) |
| CRUD completo | ✅ | ✅ |
| Backup sob demanda | ❌ | ✅ |
| Relatórios | ❌ | ✅ |
| **Suporte** | | |
| Treinamento gravado | ✅ | ✅ |
| Suporte por e-mail | ✅ (48h) | ✅ (2h úteis) |
| Consultoria mensal | ❌ | ✅ (30min) |
| **Custo** | | |
| Mensalidade | **R$ 147** | **R$ 297** |
| Setup único | **R$ 197** | **R$ 197** |

### Diferenciação Técnica

- Mesma base de código para ambos os planos
- Feature gating via flag no banco: `site_plan = 'professional'`
- Deploy único para todos os clientes
- Script `change-plan.ts` para alterar planos

### O Cliente Recebe

- ✅ Site publicado em seu domínio
- ✅ Acesso ao painel administrativo (`/admin`)
- ✅ Treinamento de uso

### O Cliente NÃO Recebe

- ❌ Código-fonte
- ❌ Acesso ao repositório
- ❌ Documentação técnica interna

---

## 🌱 Seeding Strategy

O seeding é controlado pela variável `SEED_TYPE`. O arquivo `seed.ts` age como router:

```typescript
async function main() {
    const seedType = (process.env.SEED_TYPE || 'restaurante').toLowerCase().trim();
    switch (seedType) {
        case 'hamburgueria': await seedHamburgueria(); break;
        case 'pizzaria':     await seedPizzaria();     break;
        case 'confeitaria':  await seedConfeitaria();  break;
        case 'restaurante':
        default:             await seedRestaurante();   break;
    }
}
```

Cada seed inclui:
- **Admin padrão** (email/senha configuráveis via env)
- **Categorias** apropriadas ao tema
- **Pratos** com nomes, descrições, preços e imagens Unsplash
- **SiteConfig** com todas as chaves pré-configuradas
- **Galeria** com imagens de exemplo

---

## 💰 Projeção Financeira

### Cenário Conservador (1 ano)

| Período | Básico | PRO | MRR |
|---|---|---|---|
| Mês 1-3 | 5 | 0 | R$ 735 |
| Mês 4-6 | 15 | 3 | R$ 3.096 |
| Mês 7-9 | 25 | 8 | R$ 6.051 |
| Mês 10-12 | 35 | 15 | R$ 9.600 |

- **ARR Ano 1:** ~R$ 58.000
- **Custo operacional:** ~R$ 6.000 (R$ 500/mês)
- **Lucro líquido:** ~R$ 52.000

### Cenário Otimista

- **Mês 12:** 50 Básico + 20 PRO → MRR R$ 13.290
- **ARR:** ~R$ 160.000

### Escalabilidade

- 1 VPS suporta 50-100 clientes
- PostgreSQL compartilhado ou individual (Neon)
- Cloudinary escala automaticamente
- Esforço manutenção: ~2h/semana para 50 clientes

---

## 🚀 Roadmap de Features Futuras

### Muito Fácil (15min-1h)
- Logo customizável (30min)
- Favicon personalizado (15min)
- Google Analytics (20min)
- Cor primária customizável (45min)

### Fácil (2h-4h)
- Footer customizável (2h)
- Múltiplos admins CRUD (4h)
- Backup manual via admin (2h)
- Relatório básico no dashboard (3h)

### Médio (6h-12h)
- Sistema de promoções/banners (10h)
- Horário de funcionamento estruturado (8h)
- Cardápio em PDF (8h)
- Estatísticas de visitantes (12h)

### Evitar Por Enquanto
- ❌ Sistema de pedidos interno (complexidade alta)
- ❌ Sistema de reservas (equivalente a Resy/OpenTable)
- ❌ Multi-idioma (3x custo de manutenção)
- ❌ App mobile nativo (stack separada)

---

## 🎨 Personalização

### Cores

As cores são definidas via Tailwind config inline nos HTMLs:

```js
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: { 400: '#f19244', 500: '#ee7620', 600: '#d95c16' },
        dark:  { 700: '#242440', 800: '#1a1a2e', 900: '#0f0f1a' }
      }
    }
  }
};
```

Para customizar: editar `brand` e `dark` nos HTMLs de `themes/{tema}/`.

### Conteúdo Dinâmico

Todo conteúdo textual é managed via API `/api/config` e alterável pelo cliente no admin **sem código**:
- Nome do restaurante, slogan, descrição
- Endereço, telefone, e-mail, WhatsApp
- Horário de funcionamento
- Links de redes sociais
- Textos de hero e about

---

## ⚠️ Avisos Importantes

- **Não distribuir** código-fonte para clientes sem contrato
- **Não versionar** arquivos `.env` com credenciais reais
- **Não expor** porta PostgreSQL publicamente
- **Sempre gerar** `JWT_SECRET` único por cliente
- **Sempre trocar** credenciais admin padrão
- **Sempre configurar** HTTPS antes de produção
- **Sempre editar** em `themes/`, nunca em `public/`
- **Sempre aplicar** cross-theme fixes em todos os temas

---

## 📚 Documentação Complementar

| Documento | Descrição |
|---|---|
| [README-repo.md](docs/keep/README-repo.md) | Documentação técnica original completa |
| [GUIA_COMPLETO_DEPLOY.md](docs/keep/GUIA_COMPLETO_DEPLOY.md) | Deploy passo a passo: local → produção → cliente |
| [PLANOS_COMERCIAIS.md](docs/keep/PLANOS_COMERCIAIS.md) | Planos detalhados com roadmap e projeções |
| [GUIA_VENDAS_E_CUSTOMIZACAO.md](docs/keep/GUIA_VENDAS_E_CUSTOMIZACAO.md) | Como vender, preços, FAQ de vendas |
| [CHECKLIST_CLIENTE.md](docs/keep/CHECKLIST_CLIENTE.md) | Checklist para onboarding de novo cliente |
| [final_verdict.md](docs/keep/final_verdict.md) | Auditoria de segurança: SAFE TO SELL |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Schema do banco documentado |
| [CURRENT_ARCHITECTURE_DUMP.md](docs/CURRENT_ARCHITECTURE_DUMP.md) | Dump de arquitetura single-branch |
| [README_SCRIPTS.md](scripts/README_SCRIPTS.md) | Documentação dos scripts de automação |

---

<p align="center">
  <strong>Restaurant Template SaaS — Sistema Base Interno</strong><br>
  Versão 2.0.0 | Última atualização: 2026-02-17<br>
  Feito com ❤️ e ☕
</p>
