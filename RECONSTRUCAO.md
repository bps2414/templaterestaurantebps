# 🏗️ RECONSTRUÇÃO.md — Guia Completo para Recriar o Projeto do Zero

> **Objetivo:** Recriar este sistema de templates para restaurantes do zero absoluto, apenas com uma pasta vazia e o conhecimento da stack.

---

## 📋 ÍNDICE

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Estrutura de Arquivos](#3-estrutura-de-arquivos)
4. [Prompt Inicial (Master Prompt)](#4-prompt-inicial-master-prompt)
5. [Plano de Ataque (Ordem de Implementação)](#5-plano-de-ataque-ordem-de-implementação)
6. [Checklist de Conclusão](#6-checklist-de-conclusão)
7. [Recursos e Referências](#7-recursos-e-referências)

---

## 1. Visão Geral do Projeto

**Nome:** Sistema Base para Sites de Restaurantes (Restaurant Template SaaS)

**Tipo:** Sistema interno para criação e venda de sites profissionais personalizados para restaurantes

**Funcionalidades principais:**
- Landing page responsiva (home, menu, galeria, sobre, contato)
- Painel administrativo completo (CRUD de pratos, categorias, galeria, configurações)
- Autenticação JWT (access + refresh tokens)
- Sistema de planos (Essential gratuito vs Professional pago)
- Upload seguro de imagens com Cloudinary
- Integração WhatsApp para pedidos
- API REST completa
- Sistema de onboarding para novos clientes
- Feature flags para habilitar/desabilitar funcionalidades por plano

**Modelo comercial:**
- Você hospeda tudo (Render + Neon + Cloudinary)
- Cliente recebe apenas acesso ao painel admin
- Personalização via interface gráfica (logo, cores, textos, pratos)
- Sem acesso ao código-fonte

---

## 2. Stack Tecnológica

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x
- **Linguagem:** TypeScript (strict mode)
- **ORM:** Prisma 5.x
- **Banco de Dados:** PostgreSQL 14+
- **Autenticação:** JWT (jsonwebtoken)
- **Validação:** Zod
- **Upload:** Multer + Cloudinary SDK
- **Logger:** Winston
- **Segurança:** Helmet, express-rate-limit, bcrypt
- **Email:** SendGrid (opcional)

### Frontend
- **HTML5 semântico**
- **CSS:** Tailwind CSS 3.x (via CDN para prototipagem rápida)
- **JavaScript:** Vanilla ES6+ (sem frameworks)
- **Ícones:** Lucide Icons (via CDN)

### DevOps
- **Container:** Docker + Docker Compose
- **CI/CD:** GitHub Actions (opcional)
- **Hospedagem:** Render (backend) + Neon (PostgreSQL) + Cloudinary (imagens)
- **Monitoramento:** Winston logs + health check endpoint

### Desenvolvimento
- **Gerenciador de Pacotes:** npm
- **Linting:** ESLint + Prettier
- **Testes:** (não implementado, mas recomendado Jest + Supertest)

---

## 3. Estrutura de Arquivos

```
restaurant-template/
├── .env.example                 # Template de variáveis de ambiente
├── .gitignore
├── docker-compose.yml           # Produção
├── docker-compose.dev.yml       # Desenvolvimento local
├── README.md
├── GUIA_COMPLETO_DEPLOY.md     # Guia de deploy passo a passo
│
├── docs/                        # Documentação
│   ├── keep/
│   │   ├── README-repo.md      # Documentação completa do repo
│   │   ├── final_verdict.md    # Relatório de auditoria
│   │   ├── GUIA_COMPLETO_DEPLOY.md
│   │   ├── GUIA_VENDAS_E_CUSTOMIZACAO.md
│   │   ├── PLANOS_COMERCIAIS.md
│   │   └── UPDATE.md           # Changelog de melhorias
│   ├── WORKFLOW_VIBECODAR.md   # Metodologia de desenvolvimento com IA
│   └── archive/                # Documentação antiga
│
├── public/                      # Frontend (servido como estático)
│   ├── index.html              # Home
│   ├── menu.html               # Cardápio
│   ├── gallery.html            # Galeria
│   ├── about.html              # Sobre nós
│   ├── contact.html            # Contato
│   ├── admin.html              # Painel administrativo
│   ├── buy.html                # Página de compra (opcional)
│   ├── buy-success.html        # Confirmação de compra
│   └── js/
│       ├── app.js              # Lógica compartilhada (API client, auth)
│       ├── cart.js             # Carrinho de compras
│       ├── cartUI.js           # Interface do carrinho
│       ├── orderModal.js       # Modal de finalização
│       ├── whatsappFormatter.js # Formatação de mensagens WhatsApp
│       ├── a11y.js             # Acessibilidade (teclado, reduced-motion)
│       └── performance.js      # Lazy loading, IntersectionObserver
│
├── server/                      # Backend
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   │
│   ├── prisma/
│   │   ├── schema.prisma       # Schema do banco (modelos)
│   │   ├── seed.ts             # Dados iniciais (admin, pratos exemplo)
│   │   └── migrations/         # Migrações SQL
│   │
│   ├── src/
│   │   ├── index.ts            # Entry point (inicia servidor)
│   │   ├── app.ts              # Configuração Express (middlewares, rotas)
│   │   │
│   │   ├── routes/             # Rotas da API
│   │   │   ├── auth.ts         # Login, logout, refresh token
│   │   │   ├── categories.ts  # CRUD categorias
│   │   │   ├── dishes.ts       # CRUD pratos
│   │   │   ├── gallery.ts      # CRUD galeria
│   │   │   ├── config.ts       # Configurações do site (nome, telefone, cores)
│   │   │   ├── aboutContent.ts # Conteúdo da página Sobre (PRO only)
│   │   │   ├── upload.ts       # Upload de imagens (Cloudinary)
│   │   │   ├── checkout.ts     # Stripe checkout (opcional)
│   │   │   └── plan.ts         # Retorna plano ativo do cliente
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.ts         # Verifica JWT e extrai userId
│   │   │   ├── csrf.ts         # Proteção CSRF com double-submit
│   │   │   ├── errorHandler.ts # Tratamento global de erros
│   │   │   ├── rateLimit.ts    # Rate limiting (4 camadas)
│   │   │   ├── upload.ts       # Configuração Multer + validação
│   │   │   ├── validate.ts     # Validação Zod de request bodies
│   │   │   └── requireFeature.ts # Bloqueia rotas se plano não tem feature
│   │   │
│   │   ├── services/
│   │   │   └── authService.ts  # Lógica de autenticação (bcrypt, JWT)
│   │   │
│   │   ├── utils/
│   │   │   ├── errors.ts       # Classes de erro personalizadas
│   │   │   ├── logger.ts       # Winston logger
│   │   │   └── validators.ts   # Validações reutilizáveis
│   │   │
│   │   └── types/
│   │       └── index.ts        # Types TypeScript customizados
│   │
│   └── assets/
│       └── uploads/            # Uploads temporários (migrados para Cloudinary)
│
├── scripts/                     # Scripts auxiliares
│   ├── backup.sh               # Backup de banco de dados
│   └── restore.sh              # Restauração de backup
│
└── roadmap/                     # Planejamento de produto
    ├── roadmap.md              # Roadmap 90 dias
    └── github_issues.md        # Templates de issues
```

---

## 4. Prompt Inicial (Master Prompt)

> **Cole este prompt em uma IA de código (GitHub Copilot, Claude, ChatGPT) para iniciar o projeto do zero.**

```markdown
Você é um arquiteto de software sênior especializado em Node.js, Express, TypeScript, Prisma e frontend vanilla JavaScript.

OBJETIVO:
Criar do zero um sistema completo de gerenciamento de sites para restaurantes. Este é um sistema INTERNO para criar instâncias personalizadas para clientes (multi-tenancy por instância, não por banco de dados compartilhado).

STACK OBRIGATÓRIA:
- Backend: Node.js 18+, Express 4.x, TypeScript (strict mode)
- ORM: Prisma 5.x + PostgreSQL 14+
- Autenticação: JWT (access + refresh tokens, bcrypt 12 rounds)
- Validação: Zod para input validation
- Upload: Multer + Cloudinary SDK
- Logger: Winston (arquivos + console)
- Segurança: Helmet, express-rate-limit, CORS configurável
- Frontend: HTML5 + Tailwind CSS (CDN) + Vanilla JS (ES6+)
- Container: Docker + Docker Compose

FUNCIONALIDADES PRINCIPAIS:

**Backend (Express API):**
1. Autenticação JWT com refresh tokens rotativos
2. CRUD completo:
   - Pratos (name, description, price, category, image, available)
   - Categorias (name, order)
   - Galeria (title, imageUrl, order)
   - Configurações do site (nome, telefone, endereço, cores, logo, favicon)
   - Conteúdo dinâmico "Sobre" (features, team) — apenas para plano Professional
3. Sistema de planos (ClientFeatures):
   - Essential (gratuito): menu, galeria, config básico
   - Professional (pago): + logo customizada, cores, favicon, conteúdo Sobre
4. Upload seguro com validação MIME + magic bytes + Cloudinary
5. Rate limiting em 4 camadas (API global, auth, upload, checkout)
6. CSRF protection (double-submit pattern)
7. Middleware `requireFeature` que bloqueia rotas se plano não tem acesso
8. Health check endpoint `/healthz`
9. Logs estruturados (Winston) em `logs/combined.log` e `logs/error.log`

**Frontend (Vanilla JS):**
1. Páginas HTML:
   - `index.html` — Home (hero, features, CTA)
   - `menu.html` — Cardápio (filtro por categoria, adicionar ao carrinho)
   - `gallery.html` — Galeria de fotos (grid responsivo, lightbox)
   - `about.html` — Sobre o restaurante (dinâmico via API)
   - `contact.html` — Contato (form + mapa Google Maps embed)
   - `admin.html` — Painel admin (login, CRUD completo)
2. Carrinho de compras (localStorage):
   - Adicionar/remover itens
   - Calcular total
   - Finalizar pedido via WhatsApp (formatação automática)
3. Autenticação no admin:
   - Login com CSRF token
   - Refresh token automático
   - Logout seguro
4. Interface do painel admin:
   - Dashboard com onboarding ("Primeiros Passos")
   - CRUD de pratos (com preview de imagem)
   - CRUD de categorias (ordenação drag-and-drop ou input manual)
   - CRUD de galeria
   - Configurações gerais (nome, telefone, WhatsApp, endereço)
   - Configurações avançadas (logo, cores, favicon) — apenas Professional
   - Botão "Visualizar Site" (abre em nova aba)
   - Alterar senha
5. Acessibilidade:
   - Navegação por teclado (Tab, Enter, Esc)
   - ARIA labels em modais e formulários
   - Suporte a `prefers-reduced-motion`
   - Focus trap em modais
6. Performance:
   - Lazy loading de imagens
   - IntersectionObserver para fade-in de seções
   - Debounce em buscas

**Banco de Dados (Prisma Schema):**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  password     String
  tokenVersion Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Category {
  id     String  @id @default(uuid())
  name   String
  order  Int     @default(0)
  dishes Dish[]

  @@index([order])
}

model Dish {
  id          String   @id @default(uuid())
  name        String
  description String?
  price       Float
  imageUrl    String?
  available   Boolean  @default(true)
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([categoryId])
  @@index([available])
}

model GalleryImage {
  id        String   @id @default(uuid())
  title     String?
  imageUrl  String
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([order])
}

model SiteConfig {
  id          String   @id @default(uuid())
  key         String   @unique
  value       String
  updatedAt   DateTime @updatedAt
}

model ClientFeatures {
  id            String   @id @default(uuid())
  clientId      String   @unique @default("default-client")
  plan          String   @default("essential") // "essential" | "professional"
  customLogo    Boolean  @default(false)
  customColor   Boolean  @default(false)
  customFavicon Boolean  @default(false)
  aboutContent  Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Variáveis de Ambiente (.env.example):**
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/restaurant_db"

# JWT
JWT_SECRET="TROCAR_POR_SECRET_FORTE_ALEATORIO"
JWT_ACCESS_EXP="2h"
JWT_REFRESH_EXP="30d"

# Server
PORT=3000
NODE_ENV="development"
APP_URL="http://localhost:3000"
CORS_ORIGINS="http://localhost:3000"

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
UPLOAD_MAX_SIZE_MB=2

# Admin inicial
ADMIN_EMAIL="admin@restaurante.com"
ADMIN_PASSWORD="admin123"

# Plano (essential ou professional)
PLAN="essential"
```

**Seed (Dados Iniciais):**
1. Criar usuário admin com email/senha do `.env`
2. Criar 3 categorias padrão (Entradas, Pratos Principais, Sobremesas)
3. Criar 10 pratos de exemplo (3-4 por categoria)
4. Criar configurações padrão:
   - `site_name` → "Restaurante Modelo"
   - `site_phone` → "+55 11 99999-9999"
   - `whatsapp_number` → "+5511999999999"
   - `site_address` → "Rua Exemplo, 123 - São Paulo, SP"
   - `site_description` → "Descrição padrão"
   - `primary_color` → "#d97706" (amber-600)
5. Criar entrada em `ClientFeatures` de acordo com variável `PLAN` do .env

**Segurança Obrigatória:**
- Helmet com CSP configurado
- Rate limiting:
  - Global: 100 req/15min
  - Auth: 5 req/15min
  - Upload: 10 req/hour
  - Checkout: 10 req/hour
- CSRF double-submit pattern (token em localStorage + cookie httpOnly)
- Validação de upload:
  - MIME type check
  - Magic bytes validation
  - Tamanho máximo 2MB
  - Extensões permitidas: jpg, jpeg, png, webp
- Passwords: bcrypt 12 rounds
- JWT: rotação de refresh tokens (incrementa `tokenVersion` no logout)
- Input sanitization: Zod schemas em todas as rotas
- Path traversal protection em uploads

**Docker Compose (produção):**
```yaml
version: '3.8'
services:
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: restaurant_db
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"
    restart: unless-stopped
  
  app:
    build: ./server
    ports:
      - "3000:3000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/restaurant_db
      JWT_SECRET: ${JWT_SECRET}
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
      NODE_ENV: production
    volumes:
      - ./server/assets/uploads:/app/assets/uploads
      - ./server/logs:/app/logs
    restart: unless-stopped

volumes:
  db_data:
```

**ORDEM DE IMPLEMENTAÇÃO:**

**Fase 1: Setup Base (2-3h)**
1. Criar estrutura de pastas
2. Inicializar `package.json` com dependências
3. Configurar TypeScript (`tsconfig.json`)
4. Criar `.env.example`
5. Setup Prisma (schema + migrations)
6. Criar seed script

**Fase 2: Backend Core (4-5h)**
1. `src/index.ts` — Entry point (inicializa servidor)
2. `src/app.ts` — Configuração Express (middlewares globais)
3. `src/utils/logger.ts` — Winston logger
4. `src/utils/errors.ts` — Classes de erro personalizadas
5. `src/middlewares/errorHandler.ts` — Error handler global
6. `src/middlewares/rateLimit.ts` — Rate limiting (4 instâncias)
7. Health check route: `GET /healthz`

**Fase 3: Autenticação (3-4h)**
1. `src/services/authService.ts` — bcrypt, JWT generation/verification
2. `src/middlewares/auth.ts` — Middleware `authenticateToken`
3. `src/middlewares/csrf.ts` — CSRF protection
4. `src/routes/auth.ts`:
   - `POST /api/auth/login` (retorna access + refresh tokens + CSRF)
   - `POST /api/auth/refresh` (renova access token)
   - `POST /api/auth/logout` (incrementa tokenVersion)
   - `PUT /api/auth/password` (troca senha, requer auth)

**Fase 4: CRUD Backend (5-6h)**
1. `src/middlewares/validate.ts` — Middleware de validação Zod
2. `src/utils/validators.ts` — Schemas Zod reutilizáveis
3. `src/routes/categories.ts` — CRUD categorias
4. `src/routes/dishes.ts` — CRUD pratos
5. `src/routes/gallery.ts` — CRUD galeria
6. `src/routes/config.ts` — GET/PUT configurações (SiteConfig)
7. `src/routes/plan.ts` — `GET /api/plan` (retorna plano ativo)

**Fase 5: Upload (2-3h)**
1. `src/middlewares/upload.ts` — Configuração Multer + validação
2. `src/routes/upload.ts`:
   - `POST /api/upload` (valida + envia para Cloudinary)
   - Retorna `{ success: true, url: "https://cloudinary.com/..." }`

**Fase 6: Feature Flags (2h)**
1. `src/middlewares/requireFeature.ts` — Middleware que verifica `ClientFeatures`
2. Aplicar em rotas PRO:
   - `PUT /api/config` (logo, favicon, cores)
   - `GET /api/about` e `PUT /api/about` (conteúdo Sobre)

**Fase 7: Frontend Base (3-4h)**
1. Criar estrutura HTML das 6 páginas principais
2. Incluir Tailwind CSS via CDN
3. Criar `public/js/app.js`:
   - Classe `API` para chamadas (fetch wrapper com CSRF)
   - Classe `Auth` para login/logout/refresh
   - Função `fetchConfig()` para carregar configurações
4. Implementar navegação responsiva (mobile menu)

**Fase 8: Painel Admin (6-8h)**
1. `admin.html` — Layout com sidebar e área de conteúdo
2. Tela de login (autenticação com CSRF)
3. Dashboard (onboarding "Primeiros Passos")
4. CRUD Pratos:
   - Listar pratos (tabela)
   - Modal criar/editar (form + upload de imagem)
   - Deletar com confirmação
5. CRUD Categorias (similar)
6. CRUD Galeria (similar)
7. Configurações Gerais (form com save button)
8. Configurações Avançadas (PRO only):
   - Upload logo
   - Upload favicon
   - Color picker para `primary_color`
   - Exibir mensagem se plano é Essential
9. Botão "Visualizar Site" (abre `index.html` em nova aba)
10. Alterar Senha (modal com confirmação)

**Fase 9: Páginas Públicas (4-5h)**
1. `index.html` — Hero + Features + CTA
2. `menu.html`:
   - Carregar categorias e pratos da API
   - Filtro por categoria (tabs ou dropdown)
   - Botão "Adicionar ao Carrinho" (salva em localStorage)
3. `gallery.html` — Grid de imagens + lightbox simples (modal fullscreen)
4. `about.html`:
   - Carregar conteúdo dinâmico (`GET /api/about`)
   - Fallback para texto estático se plano é Essential
5. `contact.html` — Form + Google Maps embed
6. Carrinho de compras:
   - `cart.js` — Lógica (add, remove, calcular total)
   - `cartUI.js` — Renderização (ícone com badge, modal)
   - `orderModal.js` — Modal de finalização (lista itens, total, botão WhatsApp)
   - `whatsappFormatter.js` — Formatar mensagem (URL encode)

**Fase 10: Acessibilidade & Performance (2-3h)**
1. `a11y.js`:
   - Trap focus em modais
   - Suporte a `Esc` para fechar modais
   - Suporte a `Enter` em elementos clicáveis
   - Detectar `prefers-reduced-motion` e desabilitar animações
2. `performance.js`:
   - Lazy loading de imagens (`loading="lazy"`)
   - IntersectionObserver para fade-in de seções
   - Debounce em inputs de busca

**Fase 11: Docker & Deploy (2h)**
1. Criar `Dockerfile` no `server`
2. Criar `docker-compose.yml` (db + app)
3. Criar `docker-compose.dev.yml` (com volumes para hot reload)
4. Testar build local

**Fase 12: Documentação (2-3h)**
1. `README.md` — Instruções de instalação, uso e deploy
2. `GUIA_COMPLETO_DEPLOY.md` — Passo a passo para Render + Neon + Cloudinary
3. `.env.example` bem comentado
4. Comentários no código (JSDoc/TSDoc nos pontos críticos)

**REGRAS IMPORTANTES:**
- **NÃO usar frameworks frontend** (React, Vue, etc.) — apenas Vanilla JS
- **TypeScript em strict mode** — sem `any` desnecessários
- **Validação obrigatória** em todas as rotas (Zod schemas)
- **Logs estruturados** (Winston) em todas as operações críticas
- **Error handling consistente** (usar classes de erro customizadas)
- **CSRF em todas as mutations** (POST, PUT, DELETE)
- **Testes manuais obrigatórios** após cada fase
- **Commits semânticos** (feat:, fix:, docs:, refactor:, etc.)

**ENTREGÁVEIS FINAIS:**
- [ ] Projeto funcional localmente (`npm run dev`)
- [ ] Migrations aplicadas (`npx prisma migrate dev`)
- [ ] Seed rodando sem erros (`npx prisma db seed`)
- [ ] Login no admin funcionando
- [ ] CRUD completo de pratos, categorias e galeria
- [ ] Carrinho + WhatsApp funcionando
- [ ] Feature flags bloqueando rotas PRO corretamente
- [ ] Docker Compose buildando e rodando
- [ ] README completo
- [ ] Zero erros TypeScript (`npx tsc --noEmit`)

**PRÓXIMOS PASSOS (após MVP):**
- Implementar testes automatizados (Jest + Supertest)
- CI/CD com GitHub Actions
- Monitoramento com Sentry
- Analytics (Google Analytics ou Plausible)
- Sistema de cupons/promoções (feature PRO)
- Relatórios de vendas (dashboard analytics)

Comece pela **Fase 1** e implemente cada fase completamente antes de avançar. Sempre valide cada fase com testes manuais antes de prosseguir.
```

---

## 5. Plano de Ataque (Ordem de Implementação)

### 🎯 Resumo Executivo

**Tempo total estimado:** 40-50 horas de desenvolvimento focado

**Priorização:**
1. **Crítico** (Fases 1-5): Setup + Backend + Auth + CRUD + Upload → **20h**
2. **Importante** (Fases 6-8): Feature Flags + Frontend + Admin → **18h**
3. **Complementar** (Fases 9-12): Páginas públicas + A11y + Docker + Docs → **12h**

---

### Fase 1: Setup Base (2-3h)

**Objetivo:** Criar estrutura de pastas e configurar ferramentas

**Tarefas:**
1. Criar estrutura de diretórios
2. `npm init` no `server/` e instalar dependências:
   ```bash
   npm install express prisma @prisma/client bcrypt jsonwebtoken zod helmet express-rate-limit cors multer cloudinary winston dotenv
   npm install -D typescript @types/node @types/express @types/bcrypt @types/jsonwebtoken @types/cors @types/multer ts-node nodemon
   ```
3. Criar `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "commonjs",
       "lib": ["ES2020"],
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "resolveJsonModule": true
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules", "dist"]
   }
   ```
4. Criar `.env.example`
5. `npx prisma init` e criar `schema.prisma`
6. Criar migration: `npx prisma migrate dev --name init`

**Checklist:**
- [ ] Estrutura de pastas criada
- [ ] Dependências instaladas
- [ ] TypeScript configurado
- [ ] Prisma inicializado
- [ ] Migration criada

---

### Fase 2: Backend Core (4-5h)

**Objetivo:** Configurar Express, middlewares globais e logger

**Arquivos principais:**
1. `src/utils/logger.ts` — Winston logger
2. `src/utils/errors.ts` — Classes de erro personalizadas
3. `src/middlewares/errorHandler.ts` — Error handler global
4. `src/middlewares/rateLimit.ts` — Rate limiting (4 instâncias)
5. `src/app.ts` — Configuração Express (middlewares globais)
6. `src/index.ts` — Entry point (inicializa servidor)

**Checklist:**
- [ ] Logger funcionando (Winston)
- [ ] Error handler global implementado
- [ ] Rate limiting configurado
- [ ] Helmet + CORS configurados
- [ ] Health check respondendo (`/healthz`)
- [ ] Servidor iniciando com `npm run dev`

---

### Fase 3: Autenticação (3-4h)

**Objetivo:** Implementar login, logout, refresh token e CSRF

**Arquivos:**
1. `src/services/authService.ts` (geração/verificação JWT, bcrypt)
2. `src/middlewares/auth.ts` (middleware `authenticateToken`)
3. `src/middlewares/csrf.ts` (double-submit pattern)
4. `src/routes/auth.ts`:
   - `POST /api/auth/login`
   - `POST /api/auth/refresh`
   - `POST /api/auth/logout`
   - `PUT /api/auth/password`

**Checklist:**
- [ ] `authService.ts` implementado
- [ ] Middleware `authenticateToken` funcional
- [ ] CSRF middleware implementado
- [ ] Rotas de auth funcionando
- [ ] Testado manualmente com Postman/Insomnia

---

### Fase 4: CRUD Backend (5-6h)

**Objetivo:** Implementar todas as rotas de CRUD

**Arquivos:**
1. `src/middlewares/validate.ts` — Validação Zod
2. `src/utils/validators.ts` — Schemas Zod
3. `src/routes/categories.ts` — CRUD categorias
4. `src/routes/dishes.ts` — CRUD pratos
5. `src/routes/gallery.ts` — CRUD galeria
6. `src/routes/config.ts` — GET/PUT configurações
7. `src/routes/plan.ts` — GET plano ativo

**Checklist:**
- [ ] Validação Zod implementada
- [ ] CRUD categorias funcionando
- [ ] CRUD pratos funcionando
- [ ] CRUD galeria funcionando
- [ ] Configurações (GET/PUT) funcionando
- [ ] Endpoint `/api/plan` retornando plano correto

---

### Fase 5: Upload (2-3h)

**Objetivo:** Upload seguro com Cloudinary

**Arquivos:**
1. `src/middlewares/upload.ts` — Multer + validação (MIME, magic bytes)
2. `src/routes/upload.ts` — `POST /api/upload`

**Checklist:**
- [ ] Validação MIME + magic bytes implementada
- [ ] Upload para Cloudinary funcionando
- [ ] Retorna URL pública
- [ ] Limite de 2MB respeitado

---

### Fase 6: Feature Flags (2h)

**Objetivo:** Bloquear rotas PRO para plano Essential

**Arquivos:**
1. `src/middlewares/requireFeature.ts`
2. Aplicar middleware em rotas PRO

**Checklist:**
- [ ] Middleware `requireFeature` implementado
- [ ] Rotas PRO retornando 403 para Essential
- [ ] Rotas PRO permitidas para Professional

---

### Fase 7: Frontend Base (3-4h)

**Objetivo:** Criar estrutura HTML e classe API

**Arquivos:**
1. Páginas HTML: `index.html`, `menu.html`, `gallery.html`, `about.html`, `contact.html`, `admin.html`
2. `public/js/app.js`:
   - Classe `API` (fetch wrapper com CSRF)
   - Classe `Auth` (login/logout/refresh)
   - Função `fetchConfig()`

**Checklist:**
- [ ] 6 páginas HTML criadas
- [ ] Tailwind CSS incluído via CDN
- [ ] Classe `API` funcionando
- [ ] Classe `Auth` funcionando
- [ ] Navegação responsiva implementada

---

### Fase 8: Painel Admin (6-8h)

**Objetivo:** Interface completa de administração

**Páginas do admin:**
1. Login
2. Dashboard (onboarding)
3. CRUD Pratos
4. CRUD Categorias
5. CRUD Galeria
6. Configurações Gerais
7. Configurações Avançadas (PRO)
8. Alterar Senha

**Checklist:**
- [ ] Tela de login funcionando
- [ ] Dashboard com onboarding
- [ ] CRUD Pratos (listar, criar, editar, deletar)
- [ ] CRUD Categorias
- [ ] CRUD Galeria
- [ ] Configurações Gerais (form + save)
- [ ] Configurações Avançadas (PRO only)
- [ ] Botão "Visualizar Site" funcionando
- [ ] Alterar Senha funcionando

---

### Fase 9: Páginas Públicas (4-5h)

**Objetivo:** Implementar frontend do site

**Páginas:**
1. `index.html` — Hero + Features + CTA
2. `menu.html` — Cardápio com filtro + carrinho
3. `gallery.html` — Grid + lightbox
4. `about.html` — Conteúdo dinâmico (API)
5. `contact.html` — Form + mapa

**Checklist:**
- [ ] Home com hero + CTA
- [ ] Menu carregando da API
- [ ] Filtro por categoria funcionando
- [ ] Carrinho (adicionar, remover, visualizar)
- [ ] Finalizar pedido via WhatsApp
- [ ] Galeria com lightbox
- [ ] Sobre com conteúdo dinâmico
- [ ] Formulário de contato

---

### Fase 10: Acessibilidade & Performance (2-3h)

**Objetivo:** Melhorar UX e performance

**Arquivos:**
1. `public/js/a11y.js` — Navegação por teclado, focus trap
2. `public/js/performance.js` — Lazy loading, IntersectionObserver

**Checklist:**
- [ ] Navegação por teclado funcionando
- [ ] Modais fecham com `Esc`
- [ ] Suporte a `prefers-reduced-motion`
- [ ] Lazy loading de imagens
- [ ] Fade-in com IntersectionObserver

---

### Fase 11: Docker & Deploy (2h)

**Objetivo:** Containerizar aplicação

**Arquivos:**
1. `server/Dockerfile`
2. `docker-compose.yml`
3. `docker-compose.dev.yml`

**Checklist:**
- [ ] Dockerfile buildando corretamente
- [ ] Docker Compose (produção) funcionando
- [ ] Docker Compose (dev) com hot reload

---

### Fase 12: Documentação (2-3h)

**Objetivo:** Documentar tudo

**Arquivos:**
1. `README.md`
2. `GUIA_COMPLETO_DEPLOY.md`
3. Comentários JSDoc/TSDoc no código

**Checklist:**
- [ ] README completo (instalação, uso, deploy)
- [ ] Guia de deploy (Render + Neon + Cloudinary)
- [ ] `.env.example` bem comentado
- [ ] Código com comentários nos pontos críticos

---

## 6. Checklist de Conclusão

### ✅ Backend

- [ ] TypeScript compilando sem erros (`npx tsc --noEmit`)
- [ ] Todas as migrations aplicadas
- [ ] Seed rodando sem erros
- [ ] Todas as rotas testadas manualmente (Postman/Insomnia)
- [ ] Rate limiting testado (5 logins seguidos devem bloquear)
- [ ] CSRF testado (request sem CSRF token deve falhar)
- [ ] Upload testado (arquivo >2MB deve ser rejeitado)
- [ ] Feature flags testados (Essential não acessa rotas PRO)
- [ ] Logs sendo gerados em `logs/combined.log`

### ✅ Frontend

- [ ] Login no admin funcionando
- [ ] CRUD completo de pratos, categorias e galeria
- [ ] Configurações salvando corretamente
- [ ] Carrinho de compras funcionando
- [ ] Pedido via WhatsApp formatado corretamente
- [ ] Conteúdo dinâmico (Sobre) carregando da API
- [ ] Navegação responsiva (mobile, tablet, desktop)
- [ ] Acessibilidade testada (Tab, Enter, Esc)
- [ ] Performance testada (lazy loading, fade-in)

### ✅ DevOps

- [ ] Docker Compose buildando e rodando localmente
- [ ] `.env.example` completo
- [ ] README.md com instruções claras
- [ ] Guia de deploy completo

### ✅ Segurança

- [ ] Senhas hasheadas com bcrypt (12 rounds)
- [ ] JWT com expiração configurada
- [ ] CSRF em todas as mutations
- [ ] Rate limiting em 4 camadas
- [ ] Upload validado (MIME + magic bytes)
- [ ] Helmet configurado com CSP
- [ ] CORS configurado corretamente
- [ ] Logs estruturados (Winston)

---

## 7. Recursos e Referências

### 📚 Documentação Oficial

- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Zod](https://zod.dev/)
- [Cloudinary](https://cloudinary.com/documentation)
- [Winston](https://github.com/winstonjs/winston)
- [Helmet](https://helmetjs.github.io/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### 🛠️ Ferramentas Úteis

- [Postman](https://www.postman.com/) — Testar APIs
- [Insomnia](https://insomnia.rest/) — Alternativa ao Postman
- [Prisma Studio](https://www.prisma.io/studio) — Interface gráfica para banco de dados
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [VSCode](https://code.visualstudio.com/) — Editor recomendado

### 📖 Guias de Referência

- [JWT Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

### 🎓 Tutoriais Complementares

- [Building a REST API with Node.js and Express](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs)
- [Prisma + PostgreSQL Tutorial](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgres)
- [JWT Authentication Tutorial](https://jwt.io/introduction)
- [Cloudinary Upload Tutorial](https://cloudinary.com/documentation/upload_images)

---

## 🎯 Próximos Passos Após MVP

1. **Testes Automatizados:**
   - Jest para testes unitários
   - Supertest para testes de integração
   - Coverage mínimo de 70%

2. **CI/CD:**
   - GitHub Actions para deploy automático
   - Lint + Tests + Build em PR
   - Deploy automático para staging

3. **Monitoramento:**
   - Sentry para error tracking
   - Logtail ou Papertrail para logs centralizados
   - UptimeRobot para health checks

4. **Analytics:**
   - Google Analytics ou Plausible
   - Dashboard de métricas (pageviews, conversões)

5. **Features Adicionais:**
   - Sistema de cupons/promoções (PRO)
   - Relatórios de vendas (PRO)
   - Integração com delivery (iFood, Rappi)
   - Programa de fidelidade

6. **Otimizações:**
   - Redis para cache de configurações
   - CDN para static assets
   - Image optimization automática (Cloudinary transformations)
   - Compressão Gzip/Brotli

---

## 📝 Notas Finais

- **Versionamento:** Use commits semânticos (feat:, fix:, docs:, refactor:)
- **Branches:** `main` (produção), `develop` (staging), `feature/*` (features)
- **Code Review:** Sempre revise antes de fazer merge para `main`
- **Backups:** Configure backups automáticos do banco (Neon tem isso nativamente)
- **Documentação:** Mantenha README e guias atualizados

---

## 💡 Como Usar Este Guia

1. **Para recriar o projeto completo:** Cole o "Prompt Inicial (Master Prompt)" da seção 4 em uma IA de código e siga as fases sequencialmente.

2. **Para entender a arquitetura:** Leia as seções 1-3 para ter uma visão geral do projeto, stack e estrutura.

3. **Para implementar uma feature específica:** Consulte a fase correspondente no "Plano de Ataque" (seção 5).

4. **Para validar o projeto:** Use os checklists da seção 6 para verificar se tudo está funcionando corretamente.

---

**Boa sorte na reconstrução! 🚀**

---

**Este documento foi gerado automaticamente para replicação do projeto.**  
**Versão:** 1.0.0  
**Data:** 13 de Fevereiro de 2026
