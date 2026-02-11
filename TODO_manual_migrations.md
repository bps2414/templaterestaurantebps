# 📋 TODO — Migrações Manuais Pendentes

> **⚠️ NÃO fazer git push/merge. Trabalhar somente no filesystem local.**

## 🔴 Crítico (antes de ir para produção)

- [ ] **Stripe**: Criar produtos e preços no Stripe Dashboard e atualizar `stripePriceId` nos planos (seed ou migration)
- [ ] **Stripe**: Configurar webhook endpoint no Stripe Dashboard apontando para `/api/billing/webhook`
- [ ] **JWT Secret**: Gerar um secret seguro para produção (mínimo 64 caracteres aleatórios)
- [ ] **HTTPS**: Configurar TLS/SSL (Nginx reverse proxy ou similar)
- [ ] **SendGrid**: Criar conta, verificar domínio, obter API key
- [ ] **Variáveis de ambiente**: Nunca commitar `.env` — usar secrets do provedor (Railway, Fly.io, etc.)

## 🟡 Importante

- [ ] **Redis Store**: Descomentar e configurar o Redis store no rate-limiter (`server/src/middlewares/rateLimit.ts`)
- [ ] **Email Templates**: Criar templates HTML para emails transacionais (verificação, reset, convite)
- [ ] **Storage S3**: Implementar `S3StorageAdapter` para uploads em produção
- [ ] **CORS Origins**: Atualizar origins permitidos em `server/src/app.ts` para domínio de produção
- [ ] **Sentry/Logging**: Integrar monitoramento de erros (placeholder existe em `errorHandler.ts`)
- [ ] **Token em localStorage**: Migrar para httpOnly cookies em produção (⚠️ risco XSS com localStorage)

## 🟢 Melhorias

- [ ] **Admin Panel**: Expandir painel admin com mais funcionalidades (gráficos, filtros avançados)
- [ ] **Testes E2E**: Adicionar testes end-to-end com Playwright ou Cypress
- [ ] **CI/CD**: Configurar pipeline (GitHub Actions, etc.)
- [ ] **Rate Limiting**: Ajustar limites por plano do cliente
- [ ] **Webhooks**: Adicionar mais handlers (dispute, refund, etc.)
- [ ] **API Docs**: Gerar documentação Swagger/OpenAPI
- [ ] **i18n**: Internacionalização (suporte a múltiplos idiomas)
- [ ] **PWA**: Adicionar manifest.json e service worker
- [ ] **2FA**: Autenticação de dois fatores
- [ ] **Password Policy**: Validação avançada de senhas (zxcvbn)

## 📁 Estrutura de Arquivos Criada

```
f:\VSCode\Landpage\
├── index.html (atualizado — CTAs apontam para register.html)
├── login.html (NOVO)
├── register.html (NOVO)
├── dashboard.html (NOVO)
├── scripts.js (atualizado — newsletter via API)
├── docker-compose.yml (NOVO)
├── docker-compose.dev.yml (NOVO)
├── saas_migration_report.md (NOVO)
├── TODO_manual_migrations.md (NOVO)
├── backup_before_saas/ (backup da landing page original)
│
└── server/ (NOVO — todo o backend)
    ├── package.json
    ├── tsconfig.json
    ├── jest.config.ts
    ├── .eslintrc.json
    ├── .prettierrc
    ├── .env.example
    ├── .env (dev — não commitar)
    ├── Dockerfile
    ├── .dockerignore
    │
    ├── prisma/
    │   ├── schema.prisma (10 modelos)
    │   └── seed.ts (3 planos + admin + org)
    │
    └── src/
        ├── index.ts (bootstrap)
        ├── app.ts (Express config)
        │
        ├── prisma/
        │   └── client.ts (singleton)
        │
        ├── types/
        │   └── index.ts (interfaces)
        │
        ├── utils/
        │   ├── validators.ts (Zod schemas)
        │   └── errors.ts (AppError hierarchy)
        │
        ├── services/
        │   ├── authService.ts
        │   ├── stripeService.ts
        │   ├── mailService.ts
        │   └── storageService.ts
        │
        ├── middlewares/
        │   ├── auth.ts
        │   ├── errorHandler.ts
        │   ├── rateLimit.ts
        │   └── validate.ts
        │
        ├── routes/
        │   ├── auth.ts
        │   ├── users.ts
        │   ├── orgs.ts
        │   ├── billing.ts
        │   ├── admin.ts
        │   ├── newsletter.ts
        │   └── plans.ts
        │
        └── __tests__/
            ├── auth.test.ts
            └── billing.test.ts
```

## ⏱️ Timeline Sugerida

1. **Dia 1**: Subir Docker, rodar migrations, testar fluxo completo local
2. **Dia 2**: Configurar Stripe (modo teste), testar checkout + webhooks
3. **Dia 3**: Configurar SendGrid, testar emails
4. **Dia 4**: Revisar segurança, testes, deploy em staging
5. **Dia 5**: Go-live (após testes de aceitação)

---

*Último update: ${new Date().toISOString().split('T')[0]}*
