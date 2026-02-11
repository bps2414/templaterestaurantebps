# 🚀 FluxPay — SaaS Migration Report

> **⚠️ NÃO fazer git push/merge. Trabalhar somente no filesystem local.**

## Resumo da Migração

A landing page estática do FluxPay foi transformada em um MVP SaaS funcional completo, pronto para rodar localmente com Docker.

## Arquitetura

```
FluxPay MVP
├── Frontend (HTML/CSS/JS estáticos)
│   ├── index.html (landing page atualizada)
│   ├── login.html (autenticação)
│   ├── register.html (criação de conta)
│   └── dashboard.html (painel SPA)
│
├── Backend (Node.js + Express + TypeScript)
│   ├── Prisma ORM (PostgreSQL)
│   ├── JWT Auth (access + refresh token rotation)
│   ├── Stripe Billing (checkout + webhooks)
│   ├── SendGrid (emails transacionais)
│   └── Rate Limiting (express-rate-limit)
│
└── Infraestrutura (Docker)
    ├── PostgreSQL 15
    ├── Redis 7
    └── Node.js 18
```

## Stack Tecnológico

| Camada       | Tecnologia                        |
|-------------|-----------------------------------|
| Runtime     | Node.js 18+                       |
| Framework   | Express 4.x                       |
| Linguagem   | TypeScript 5.x                    |
| ORM         | Prisma 5.x                        |
| Banco       | PostgreSQL 15                     |
| Cache       | Redis 7                           |
| Auth        | JWT (access 15min + refresh 30d)  |
| Pagamento   | Stripe (Checkout + Webhooks)      |
| Email       | SendGrid (fallback dev: console)  |
| Validação   | Zod                               |
| Segurança   | Helmet, CORS, bcrypt (12 rounds)  |
| Testes      | Jest + Supertest                   |
| Container   | Docker + docker-compose           |

## Modelos de Dados (Prisma)

1. **User** — Usuários com role (ADMIN/OWNER/MEMBER)
2. **Organization** — Empresas/tenants
3. **OrgMember** — Relação N:N User↔Organization com role
4. **Plan** — Planos SaaS (Starter/Pro/Business)
5. **Subscription** — Assinaturas ativas
6. **Payment** — Histórico de pagamentos
7. **Session** — Sessões JWT com refresh token
8. **Invite** — Convites de equipe com token+expiração
9. **AuditLog** — Log de auditoria de ações
10. **NewsletterSubscriber** — Inscritos na newsletter

## Endpoints da API

### Auth (`/api/auth`)
- `POST /register` — Criar conta (rate limited)
- `POST /login` — Login (rate limited)
- `POST /refresh` — Renovar tokens
- `POST /logout` — Logout
- `GET /verify?token=` — Verificar email
- `POST /forgot` — Esqueci minha senha
- `POST /reset` — Resetar senha
- `GET /me` — Dados do usuário logado

### Users (`/api/users`)
- `GET /me` — Perfil do usuário
- `PATCH /me` — Atualizar perfil
- `PATCH /me/password` — Alterar senha

### Organizations (`/api/orgs`)
- `GET /` — Listar orgs do usuário
- `POST /` — Criar organização
- `GET /:orgId` — Detalhes da org
- `POST /:orgId/invite` — Convidar membro
- `GET /invite/accept?token=` — Aceitar convite
- `DELETE /:orgId/members/:userId` — Remover membro

### Billing (`/api/billing`)
- `POST /create-checkout-session` — Iniciar pagamento
- `POST /webhook` — Webhook do Stripe
- `GET /status/:orgId` — Status de cobrança
- `GET /payments/:orgId` — Histórico de pagamentos

### Admin (`/api/admin`) — Requer role ADMIN
- `GET /dashboard` — Dashboard administrativo
- `GET /users` — Listar todos os usuários
- `GET /users/:userId` — Detalhes do usuário
- `PATCH /users/:userId` — Editar usuário
- `GET /orgs` — Listar todas as orgs
- `GET /audit` — Audit log
- `GET /newsletter` — Inscritos newsletter

### Newsletter (`/api/newsletter`)
- `POST /subscribe` — Inscrever na newsletter (rate limited)
- `POST /unsubscribe` — Desinscrever

### Plans (`/api/plans`)
- `GET /` — Listar planos ativos (público)
- `GET /:slug` — Detalhes do plano

### Health
- `GET /healthz` — Health check

## Planos Configurados (seed)

| Plano    | Preço    | Membros | Stripe |
|----------|----------|---------|--------|
| Starter  | R$ 0,00  | 1       | —      |
| Pro      | R$ 97,00 | 10      | Configurar |
| Business | R$ 297,00| 50      | Configurar |

## Usuário Admin (seed)

- **Email:** admin@fluxpay.com.br
- **Senha:** Admin@123456
- **Role:** ADMIN

## Como Rodar

### 1. Subir infraestrutura (PostgreSQL + Redis)
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Instalar dependências
```bash
cd server
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Editar .env com suas credenciais
```

### 4. Rodar migrations e seed
```bash
npm run prisma:migrate
npm run prisma:seed
```

### 5. Iniciar servidor (dev)
```bash
npm run dev
```

### 6. Acessar
- Landing Page: http://localhost:3000
- Login: http://localhost:3000/login.html
- Dashboard: http://localhost:3000/dashboard.html

## Segurança

- Senhas: bcrypt com 12 salt rounds
- JWT: Access token (15min) + Refresh token rotation (30d)
- CSRF: Refresh token em httpOnly cookie + SameSite=Strict
- XSS: Helmet CSP headers
- Rate Limiting: 100 req/15min (API), 10 req/15min (auth)
- Input: Validação Zod em todas as entradas
- Prisma: Queries parametrizadas (sem SQL injection)

## Testes

```bash
cd server
npm test
```

Cobertura: `npm test -- --coverage`

## Próximos Passos (TODO)

Veja [TODO_manual_migrations.md](./TODO_manual_migrations.md) para lista completa.

---

*Relatório gerado automaticamente durante a migração SaaS.*
*Data: ${new Date().toISOString().split('T')[0]}*
