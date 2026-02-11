# 🍽 Sistema Base para Sites de Restaurantes

**Sistema interno** para criação e entrega de sites profissionais personalizados para restaurantes. Inclui painel administrativo completo, cardápio digital, galeria de fotos, integração WhatsApp e infraestrutura segura para produção.

> ⚠️ **Este projeto é de uso interno** e não deve ser distribuído como template público sem adaptação contratual.

---

## 📌 Visão Geral

Este sistema serve como **base técnica** para a criação de sites personalizados entregues a clientes do setor gastronômico. Cada nova instância é configurada individualmente com:

- Domínio próprio do cliente
- Banco de dados isolado
- Credenciais únicas de acesso
- Conteúdo totalmente customizado

**O cliente recebe:**
- Site publicado em seu domínio
- Acesso ao painel administrativo (`/admin`)
- Treinamento para gerenciar conteúdo

**O cliente NÃO recebe:**
- Código-fonte
- Acesso ao repositório
- Documentação técnica interna

---

## 🏗 Arquitetura Técnica

### Stack Principal

| Camada         | Tecnologia                           |
|----------------|--------------------------------------|
| **Frontend**   | HTML5, Tailwind CSS, Vanilla JS      |
| **Backend**    | Node.js, Express.js, TypeScript      |
| **Database**   | PostgreSQL 14 + Prisma ORM           |
| **Auth**       | JWT (access + refresh tokens)        |
| **Upload**     | Multer (validação estrita)           |
| **Pagamento**  | Stripe Checkout (opcional)           |
| **Segurança**  | Helmet, Rate Limit, CORS, Zod        |
| **Logger**     | Winston (arquivos + console)         |
| **Container**  | Docker + Docker Compose              |

### Funcionalidades

- ✅ **Painel Admin** — CRUD completo de pratos, categorias, galeria e configurações
- ✅ **Cardápio Digital** — Categorias com filtros, preços e fotos
- ✅ **Galeria de Fotos** — Upload com lightbox e navegação
- ✅ **WhatsApp Integrado** — Botão flutuante + pedidos diretos
- ✅ **Upload Seguro** — 2MB max, MIME whitelist, UUID filenames
- ✅ **Autenticação Robusta** — JWT + refresh token, brute force protection
- ✅ **Segurança Hardened** — Ver seção [Segurança](#-segurança)
- ✅ **SEO Ready** — Meta tags, semântica HTML5
- ✅ **100% Responsivo** — Mobile-first design

---

## 🧑‍💼 Processo Interno para Novo Cliente

### 1. Preparar Ambiente

```bash
# Duplicar projeto base
cp -r Landpage cliente-restaurante-xyz
cd cliente-restaurante-xyz
```

### 2. Criar Banco de Dados

```sql
CREATE DATABASE restaurante_xyz;
CREATE USER user_xyz WITH ENCRYPTED PASSWORD 'senha_forte_aqui';
GRANT ALL PRIVILEGES ON DATABASE restaurante_xyz TO user_xyz;
```

### 3. Configurar Variáveis de Ambiente

```bash
cd server
cp .env.example .env
```

Editar `.env` com dados do cliente:

```env
# Database (único para este cliente)
DATABASE_URL="postgresql://user_xyz:senha@host:5432/restaurante_xyz"

# JWT (gerar novo secret por cliente)
JWT_SECRET="<rodar: openssl rand -base64 64>"
JWT_ACCESS_EXP="2h"
JWT_REFRESH_EXP="30d"

# Servidor
PORT=3000
NODE_ENV="production"

# URLs (domínio do cliente)
APP_URL="https://restaurante-xyz.com.br"
CORS_ORIGINS="https://restaurante-xyz.com.br"

# Admin Inicial
ADMIN_EMAIL="admin@restaurante-xyz.com.br"
ADMIN_PASSWORD="senha_temporaria_123"
```

> ⚠️ **Gerar JWT_SECRET único por cliente:** `openssl rand -base64 64`

### 4. Instalar Dependências

```bash
npm install
```

### 5. Aplicar Migrações

```bash
npx prisma migrate deploy
npx prisma db seed
```

### 6. Criar Usuário Admin

O seed já cria o admin com as credenciais do `.env`, mas **troque a senha** no primeiro acesso.

### 7. Configurar Domínio

- Apontar DNS do cliente para o servidor
- Configurar HTTPS (Let's Encrypt / Cloudflare)
- Testar certificado SSL

### 8. Deploy

```bash
docker compose up -d
```

Ou usando PM2:

```bash
npm run build
pm2 start dist/index.js --name restaurante-xyz
pm2 save
```

### 9. Configurar Conteúdo Inicial

Acessar `/admin` e preencher:

- **Configurações:** Nome, slogan, endereço, telefone, WhatsApp
- **Categorias:** Ex: Entradas, Pratos Principais, Sobremesas
- **Pratos:** Adicionar 5-10 pratos iniciais com fotos
- **Galeria:** Adicionar 10-15 fotos do estabelecimento

### 10. Entregar ao Cliente

- Enviar credenciais de acesso ao painel (`/admin`)
- Fornecer guia simplificado de uso (não técnico)
- Realizar treinamento básico (15-30 min)
- Configurar suporte contínuo (se aplicável)

---

## 🔐 Segurança

Este sistema implementa **hardening profissional** baseado em auditoria completa. Ver [security_audit.md](security_audit.md) para detalhes.

### Proteções Implementadas

#### Autenticação
- ✅ **Brute Force Protection:** 5 tentativas → bloqueio de 15 minutos por IP
- ✅ **Timing Attack Prevention:** Bcrypt dummy hash quando usuário não existe
- ✅ **Refresh Token Hashing:** SHA-256 no banco (não o token cru)
- ✅ **Limite de Sessões:** Máximo 5 sessões ativas por usuário
- ✅ **JWT_SECRET Validation:** Servidor não inicia em produção com secret padrão
- ✅ **Session Cleanup:** Limpeza automática de sessões expiradas (cron 1h)

#### HTTP & Headers
- ✅ **Helmet Hardened:** CSP, HSTS (1 ano + preload), frameAncestors, Permissions-Policy
- ✅ **HTTPS Redirect:** Automático em produção
- ✅ **Security Headers:** X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- ✅ **CORS Restritivo:** Origem exata, métodos limitados, maxAge 600s

#### Rate Limiting
- ✅ **Auth Endpoints:** 10 requests / 15 min
- ✅ **API Geral:** 100 requests / 15 min
- ✅ **Upload:** 30 requests / hora
- ✅ **Key Generator:** Baseado em IP (compatível com proxies)

#### Upload & Arquivos
- ✅ **MIME Whitelist:** Set estrito (`image/jpeg`, `image/png`, `image/webp`, `image/gif`)
- ✅ **Extension Whitelist:** Validação dupla (MIME + extensão)
- ✅ **Path Traversal Blocked:** Rejeita `..`, `\\`, caracteres null em `/uploads`
- ✅ **Filename Sanitization:** UUID + extensão, sem caracteres especiais
- ✅ **Tamanho Limitado:** 2MB por arquivo, 1 arquivo + 10 campos por request

#### Input Validation
- ✅ **Zod Validation:** Todas as rotas de escrita validam tipos e tamanhos
- ✅ **XSS Sanitization:** Valores de config removem `<script>`, event handlers, `javascript:`
- ✅ **Email Normalization:** Lowercase + trim antes de buscar no banco

#### Error Handling
- ✅ **Stack Trace:** Nunca exposto ao cliente (apenas em logs internos)
- ✅ **Mensagens Genéricas:** Erros 500 retornam "Erro interno do servidor"
- ✅ **Tratamento Específico:** Multer, Prisma, Zod, CORS, JSON parse

#### Logs
- ✅ **PII Protection:** Email, senhas, tokens nunca aparecem em logs de produção
- ✅ **Morgan Sanitizado:** Formato customizado sem headers de autenticação
- ✅ **Metadata Limitada:** path, method, IP (sem body/headers completos)

---

## 🚀 Deploy em Produção

### Checklist Obrigatório

Antes de colocar qualquer instância no ar:

- [ ] **JWT_SECRET único e forte** (64 bytes, base64)
- [ ] **Credenciais admin** alteradas do valor padrão
- [ ] **DATABASE_URL** com SSL e connection pooling (PgBouncer)
- [ ] **CORS_ORIGIN** definido com domínio exato do cliente
- [ ] **HTTPS configurado** (certificado válido)
- [ ] **Backup automático** do PostgreSQL configurado
- [ ] **Monitoramento** de uptime e erros (opcional mas recomendado)
- [ ] **Stripe** configurado com chaves de produção (se aplicável)
- [ ] **Porta do PostgreSQL** não exposta publicamente (apenas localhost)

### Docker Compose (Recomendado)

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

### Nginx (Reverse Proxy)

Exemplo de configuração:

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

## 💼 Modelo Comercial

### O que o cliente compra:

- ✅ Site funcional publicado em seu domínio
- ✅ Acesso ao painel administrativo (`/admin`)
- ✅ Treinamento básico de uso
- ✅ Suporte técnico (conforme contrato)
- ✅ Atualizações de conteúdo (pelo próprio cliente via admin)

### O que o cliente NÃO compra:

- ❌ Código-fonte do sistema
- ❌ Acesso ao repositório Git
- ❌ Infraestrutura de hospedagem (pode ou não estar incluída)
- ❌ Direito de revender ou duplicar

### Fluxo de Receita

Este sistema pode ser monetizado via:

1. **Venda única** — Valor fixo por site entregue
2. **Mensalidade** — Hosting + suporte + atualizações
3. **Upsells** — Funcionalidades extras (delivery, reservas, etc.)
4. **Stripe Checkout** — Template já inclui rota para vender acesso ao código (se desejado)

---

## 📁 Estrutura do Projeto

```
├── server/                    # Backend
│   ├── src/
│   │   ├── app.ts             # Configuração Express
│   │   ├── index.ts           # Entry point
│   │   ├── routes/            # Rotas da API
│   │   │   ├── auth.ts        # Login/logout/refresh
│   │   │   ├── categories.ts  # CRUD categorias
│   │   │   ├── dishes.ts      # CRUD pratos
│   │   │   ├── gallery.ts     # CRUD galeria
│   │   │   ├── config.ts      # Configurações do site
│   │   │   ├── checkout.ts    # Stripe checkout
│   │   │   └── upload.ts      # Upload de imagens
│   │   ├── middlewares/
│   │   │   ├── auth.ts        # JWT middleware
│   │   │   ├── upload.ts      # Multer config
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimit.ts
│   │   │   └── validate.ts
│   │   ├── services/
│   │   │   └── authService.ts # Lógica de autenticação
│   │   ├── utils/
│   │   │   ├── errors.ts
│   │   │   ├── logger.ts
│   │   │   └── validators.ts
│   │   └── types/
│   │       └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma      # Schema do banco
│   │   └── seed.ts            # Dados iniciais
│   ├── assets/uploads/        # Imagens enviadas
│   └── package.json
│
├── public/                    # Frontend (servido como estático)
│   ├── index.html             # Home
│   ├── menu.html              # Cardápio
│   ├── gallery.html           # Galeria
│   ├── about.html             # Sobre
│   ├── contact.html           # Contato
│   ├── admin.html             # Painel admin
│   └── js/app.js              # JavaScript compartilhado
│
├── docker-compose.yml         # Deploy produção
├── docker-compose.dev.yml     # Deploy desenvolvimento
├── security_audit.md          # Relatório de segurança
└── README.md                  # Este arquivo
```

---

## 📄 API Endpoints

### Auth
| Método | Rota                  | Acesso  | Descrição            |
|--------|----------------------|---------|----------------------|
| POST   | `/api/auth/login`    | Público | Login admin          |
| POST   | `/api/auth/refresh`  | Público | Renovar access token |
| POST   | `/api/auth/logout`   | Público | Encerrar sessão      |
| GET    | `/api/auth/me`       | Admin   | Dados do admin       |

### Dishes (Pratos)
| Método | Rota                     | Acesso  | Descrição              |
|--------|--------------------------|---------|------------------------|
| GET    | `/api/dishes`            | Público | Listar ativos          |
| GET    | `/api/dishes/featured`   | Público | Listar destaques       |
| GET    | `/api/dishes/all`        | Admin   | Listar todos           |
| POST   | `/api/dishes`            | Admin   | Criar prato (multipart)|
| PUT    | `/api/dishes/:id`        | Admin   | Atualizar prato        |
| DELETE | `/api/dishes/:id`        | Admin   | Excluir prato          |

### Categories (Categorias)
| Método | Rota                     | Acesso  | Descrição               |
|--------|--------------------------|---------|-------------------------|
| GET    | `/api/categories`        | Público | Listar ativas (+ pratos)|
| GET    | `/api/categories/all`    | Admin   | Listar todas            |
| POST   | `/api/categories`        | Admin   | Criar categoria         |
| PUT    | `/api/categories/:id`    | Admin   | Atualizar categoria     |
| DELETE | `/api/categories/:id`    | Admin   | Excluir categoria       |

### Gallery (Galeria)
| Método | Rota                  | Acesso  | Descrição            |
|--------|----------------------|---------|----------------------|
| GET    | `/api/gallery`       | Público | Listar imagens       |
| GET    | `/api/gallery/all`   | Admin   | Listar todas         |
| POST   | `/api/gallery`       | Admin   | Upload imagem        |
| PUT    | `/api/gallery/:id`   | Admin   | Atualizar metadata   |
| DELETE | `/api/gallery/:id`   | Admin   | Excluir imagem       |

### Config (Configurações)
| Método | Rota                | Acesso  | Descrição               |
|--------|---------------------|---------|-------------------------|
| GET    | `/api/config`       | Público | Obter configurações     |
| PUT    | `/api/config`       | Admin   | Atualizar configurações |
| GET    | `/api/config/keys`  | Admin   | Listar chaves válidas   |

---

## ⚙️ Painel Administrativo

O painel (`/admin`) permite ao cliente gerenciar todo o conteúdo:

### Funcionalidades

- **Pratos:** Criar, editar, excluir. Upload de foto, definir preço, categoria, destaque.
- **Categorias:** Organizar cardápio, definir ordem de exibição.
- **Galeria:** Upload de fotos do restaurante, adicionar descrições.
- **Configurações:** Nome, slogan, endereço, telefone, WhatsApp, horários, redes sociais, textos da home.

### Acesso

- URL: `https://dominio-do-cliente.com/admin`
- Credenciais: Definidas no `.env` inicial (alterar no primeiro acesso)

---

## 🎨 Personalização

### Cores

As cores principais são definidas via Tailwind config (inline em cada HTML):

```js
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          400: '#f19244',  // Laranja claro
          500: '#ee7620',  // Laranja principal
          600: '#d95c16',  // Laranja escuro
        },
        dark: {
          700: '#242440',
          800: '#1a1a2e',
          900: '#0f0f1a',  // Background
        }
      }
    }
  }
};
```

Para mudar a paleta de um cliente, editar os valores `brand` e `dark` nos arquivos HTML.

### Conteúdo Dinâmico

Todo o conteúdo textual é gerenciado via API `/api/config` e pode ser alterado pelo cliente no painel admin **sem tocar no código**.

---

## 🛠 Requisitos de Desenvolvimento

- **Node.js** 18+
- **PostgreSQL** 14+
- **Docker** (opcional)
- **npm** ou **yarn**

### Setup Local (para testes)

```bash
cd server
npm install
cp .env.example .env
# Editar .env com DATABASE_URL local
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Acesso local:
- Site: http://localhost:3000
- Admin: http://localhost:3000/admin
- Login: `admin@restaurante.com` / `admin123`

---

## 📊 Variáveis de Ambiente

| Variável                | Descrição                                | Exemplo                       |
|-------------------------|------------------------------------------|-------------------------------|
| `DATABASE_URL`          | URL de conexão PostgreSQL                | `postgresql://user:pass@...`  |
| `JWT_SECRET`            | Secret para JWT (64 bytes base64)        | `openssl rand -base64 64`     |
| `JWT_ACCESS_EXP`        | Expiração access token                   | `2h`                          |
| `JWT_REFRESH_EXP`       | Expiração refresh token                  | `30d`                         |
| `PORT`                  | Porta do servidor                        | `3000`                        |
| `NODE_ENV`              | Ambiente (`development`/`production`)    | `production`                  |
| `APP_URL`               | URL base da aplicação                    | `https://cliente.com.br`      |
| `CORS_ORIGINS`          | Origens permitidas (vírgula separada)    | `https://cliente.com.br`      |
| `ADMIN_EMAIL`           | Email do admin inicial                   | `admin@cliente.com.br`        |
| `ADMIN_PASSWORD`        | Senha do admin inicial (trocar depois!)  | `senha_temporaria_123`        |
| `STRIPE_SECRET_KEY`     | Chave Stripe (opcional)                  | `sk_live_...`                 |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook Stripe (opcional)      | `whsec_...`                   |
| `TEMPLATE_PRICE_CENTS`  | Preço em centavos (opcional, para venda) | `29700`                       |

---

## 📞 Suporte Interno

Para questões técnicas durante o setup de novo cliente:

1. Revisar [security_audit.md](security_audit.md) para detalhes de segurança
2. Verificar logs do servidor: `docker compose logs -f app`
3. Confirmar banco: `docker compose exec db psql -U postgres`
4. Testar API: `curl http://localhost:3000/api/config`

---

## ⚠️ Avisos Importantes

- **Não distribuir** este código-fonte para clientes ou terceiros sem contrato específico
- **Não versionar** arquivos `.env` com credenciais reais
- **Não expor** a porta do PostgreSQL publicamente (apenas localhost)
- **Sempre gerar** `JWT_SECRET` único por cliente
- **Sempre trocar** credenciais admin padrão no primeiro acesso
- **Sempre configurar** HTTPS antes de colocar no ar

---

<p align="center">
  <strong>Sistema Base — Uso Interno</strong><br>
  Feito com ❤️ e ☕
</p>
