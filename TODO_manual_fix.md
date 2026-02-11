# 📋 TODO — Manual Fixes Required

**Data:** 2025-02-10  
**Prioridade:** Itens que requerem ação manual antes de ir para produção  

---

## 🔴 CRÍTICO — Fazer antes de deploy

### 1. Executar Prisma Migration
```bash
cd server
npx prisma migrate dev --name security_hardening
```
> O schema foi modificado extensivamente. A migration precisa ser criada e aplicada.

### 2. JWT_SECRET em Produção
- **Onde:** `.env` → `JWT_SECRET`
- **Atual:** `'dev-secret-replace-me'` (fallback hardcoded em `authService.ts`)
- **Ação:** Gerar secret forte: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- **NUNCA** usar o fallback em produção

### 3. Stripe Keys Reais
- **Onde:** `.env` → `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Atual:** `'sk_test_placeholder'`
- **Ação:** Configurar keys reais do Stripe Dashboard

### 4. CORS_ORIGINS em Produção
- **Onde:** `.env` → `CORS_ORIGINS`
- **Ação:** Definir domínios permitidos: `CORS_ORIGINS=https://fluxpay.com.br,https://app.fluxpay.com.br`
- **Atual:** Fallback para `http://localhost:3000` apenas

---

## 🟡 ALTO — Fazer para segurança em produção

### 5. Redis Store para Rate Limiting
- **Onde:** `server/src/middlewares/rateLimit.ts`
- **Problema:** Rate limiting usa memory store (não compartilhado entre instâncias)
- **Ação:** Configurar `ioredis` + `rate-limit-redis` (dependências já instaladas)
```typescript
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL);
const store = new RedisStore({ sendCommand: (...args) => redisClient.call(...args) });
```

### 6. Refresh Token Hash-Only Lookup
- **Onde:** `authService.ts` → `refreshTokens()`
- **Problema:** Ainda busca por `refreshToken` raw (backwards compat). Ideal: buscar apenas por `refreshTokenHash`
- **Ação:** Após migration e período de transição, alterar:
```typescript
// De:
const session = await prisma.session.findUnique({ where: { refreshToken } });
// Para:
const hash = hashRefreshToken(currentRefreshToken);
const session = await prisma.session.findFirst({ where: { refreshTokenHash: hash } });
```
- **Pré-requisito:** Adicionar `@@index([refreshTokenHash])` no schema

### 7. SendGrid / Email Service
- **Onde:** `server/src/services/mailService.ts`
- **Problema:** Emails não são enviados (console.log placeholder)
- **Ação:** Configurar `SENDGRID_API_KEY` no `.env` e descomentar o envio real

### 8. Email Verification Token
- **Onde:** `server/src/routes/auth.ts` linha ~37
- **Problema:** Usa `'verify-token-placeholder'` em vez do token real do user
- **Ação:** Passar `user.emailVerifyToken` para o mailService

---

## 🟢 MÉDIO — Melhorias recomendadas

### 9. Sentry Integration
- **Onde:** `server/src/app.ts`
- **Problema:** Import de Sentry é placeholder (não configurado)
- **Ação:** `npm install @sentry/node` e configurar `SENTRY_DSN` no `.env`

### 10. localStorage → httpOnly Cookies
- **Onde:** `login.html`, `register.html`, `dashboard.html`
- **Problema:** Access/refresh tokens armazenados em localStorage (XSS-accessible)
- **Status:** Aceitável para MVP, mas em produção migrar para httpOnly cookies
- **Complexidade:** Alta — requer mudanças no auth middleware e frontend

### 11. Subscription Status como Enum
- **Onde:** `authService.ts` → `register()`, `seed.ts`
- **Problema:** `status: 'ACTIVE'` como string em vez de `SubscriptionStatus.ACTIVE`
- **Ação:** Importar e usar o enum do Prisma

### 12. CSS/JS Minification Real
- **Onde:** `styles.min.css`, `scripts.min.js`
- **Problema:** Atualmente são cópias simples (não minificados de verdade)
- **Ação:** Configurar build tool (esbuild, terser, cssnano) ou CI/CD step

### 13. WebP Fallback Review
- **Onde:** `index.html`
- **Problema:** `<picture>` tags já existem mas validar que as imagens WebP reais existem
- **Ação:** Gerar versões WebP das imagens com `sharp` ou `cwebp`

---

## ℹ️ Notas

- **Backup disponível em:** `./backup_before_security_ui/` com manifest.txt (57 arquivos)
- **Não foi feito:** git commit/push/merge/tag (conforme solicitado)
- **Build status:** TypeScript ✅ 0 errors | Jest ✅ 19/19 pass | npm audit ✅ 0 vulns
