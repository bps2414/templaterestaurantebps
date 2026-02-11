# 🔄 Migration Report — FluxPay SaaS MVP

**Data:** 2025-02-10  
**Escopo:** Todas as mudanças de schema, rotas, serviços e configuração  
**Status:** ✅ Concluído  

---

## 1. Prisma Schema Migrations Necessárias

> ⚠️ **AÇÃO MANUAL REQUERIDA**: Após essas mudanças, execute:
> ```bash
> npx prisma migrate dev --name security_hardening
> ```

### 1.1 Enum `AuditAction` — 5 novos valores

```diff
+ INVITE_SENT
+ INVITE_ACCEPTED
+ CHECKOUT_INITIATED
+ ADMIN_USER_UPDATE
+ MEMBER_REMOVED
```

### 1.2 Model `User` — 3 novos campos

```diff
+ stripeCustomerId  String?   @unique
+ failedLoginAttempts Int     @default(0)
+ lockedUntil       DateTime?
```

### 1.3 Model `AuditLog` — 3 novos campos + relação

```diff
+ organizationId String?
+ details        Json?
+ organization   Organization? @relation(...)
```

### 1.4 Model `Invite` — rename campo

```diff
- senderId    String
+ invitedById String
```
> ⚠️ Requer data migration se houver dados existentes

### 1.5 Model `NewsletterSubscriber` — 2 novos campos

```diff
+ name   String?
+ active Boolean @default(true)
```

### 1.6 Model `Session` — 1 novo campo

```diff
+ refreshTokenHash String?
```

---

## 2. Rotas Modificadas

### 2.1 `plans.ts` — Reescrito Completamente

| Campo Antigo | Campo Correto |
|-------------|---------------|
| `slug` | `key` |
| `price` | `priceMonthly` |
| `active` | `isActive` |
| `maxMembers` | `maxUsers` |
| `stripePriceId` | `stripePriceIdMonthly` / `stripePriceIdAnnual` |

Adicionado: `priceFormatted`, `priceAnnualFormatted`, `hasStripePrice`, rota `/:key` para busca por key.

### 2.2 `billing.ts` — Checkout Reescrito

- **Antes**: Chamava `stripeService.getOrCreateCustomer(email, name, customerId)` com 3 args
- **Depois**: Chamava `stripeService.getOrCreateCustomer(organizationId)` — service gerencia tudo internamente
- **Antes**: Construía checkout session manualmente com `customerId`, `priceId`, `metadata`
- **Depois**: Delega para `stripeService.createCheckoutSession({ organizationId, planKey, isAnnual, ... })`
- **Payment queries**: `subscription: { organizationId }` → `organizationId` (relação direta)

### 2.3 `users.ts` — Password Field Fix

```diff
- user.password
+ user.passwordHash

- data: { password: hashed }
+ data: { passwordHash: hashed }
```

### 2.4 `orgs.ts` — Plan Lookup Fix

```diff
- plan.slug: 'starter'
+ plan.key: 'starter'
```

### 2.5 `admin.ts` — Payment Include Fix

```diff
- include: { subscription: { include: { organization: true, plan: true } } }
+ include: { organization: true }
```

---

## 3. Serviços Modificados

### 3.1 `authService.ts`

- **Imports**: +`crypto`, +`logger`
- **hashRefreshToken()**: Nova função usando SHA-256
- **generateAccessToken()**: Fix tipo `SignOptions` para `@types/jsonwebtoken@9.x`
- **login()**: +Account lockout (5 tentativas → 15min bloqueio)
- **createSession()**: Armazena `refreshTokenHash` além do `refreshToken`

### 3.2 `stripeService.ts` — Sem mudanças

O stripeService já estava correto. As rotas foram alinhadas à sua API.

---

## 4. Configuração

### 4.1 `app.ts`

| Mudança | Detalhe |
|---------|---------|
| Trust proxy | `app.set('trust proxy', 1)` |
| Helmet | HSTS 1yr+preload, CSP Stripe domains, referrer-policy |
| HPP | `hpp()` middleware adicionado |
| CORS | Origins dinâmicos via `CORS_ORIGINS` env |
| Morgan | Saída via Winston stream |
| Body limit | 10MB → 1MB |
| Dotfiles | `deny` em static serving |
| X-CSRF-Token | Removido dos CORS headers (csurf removido) |

### 4.2 `errorHandler.ts`

- `console.error` → Winston `logger.warn` / `logger.error`

### 4.3 `tsconfig.json`

- Removido `prisma/seed.ts` do `include` (fora do `rootDir`)

### 4.4 `jest.config.ts`

- Fix: `setupFilesAfterSetup` → `setupFilesAfterEnv`
- `resetMocks: true` → `false` (preserva mock implementations)

---

## 5. Dependências

### Adicionadas
| Pacote | Versão | Razão |
|--------|--------|-------|
| `winston` | ^3.x | Logging estruturado |
| `hpp` | ^0.2.x | HTTP Parameter Pollution protection |
| `@types/hpp` | ^0.2.x | TypeScript types |

### Removidas
| Pacote | Razão |
|--------|-------|
| `csurf` | Deprecated, vuln em `cookie` dependency |

---

## 6. Testes

### Modificados
| Arquivo | Mudança |
|---------|---------|
| `auth.test.ts` | Mock `mockPrisma: any`, callback `cb: any`; test "orgName missing" → "password lacks uppercase" |
| `billing.test.ts` | Mock data atualizada para novos campos (`key`, `priceMonthly`, etc.); `mockPrisma: any`; stripeService mock `sessionId` em vez de `id` |

### Resultado
```
Test Suites: 2 passed, 2 total
Tests:       19 passed, 19 total
TypeScript:  0 errors
```
