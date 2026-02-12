# 🏛️ VERDICT — AUDITORIA FINAL CONDENSADA

**Projeto:** Restaurant Template SaaS (Landing Page + Admin + API)  
**Stack:** Express.js · TypeScript · Prisma · PostgreSQL · Vanilla JS  
**Data:** 2026-02-12  
**Auditor:** Senior Fullstack Auditor (Node/Express/TS, Prisma, Frontend JS)  
**Branch auditada:** `main`

---

## RESUMO EXECUTIVO

O projeto possui postura de segurança **acima da média** para um template SaaS: JWT com token rotation + tokenVersion, upload com validação tripla (MIME + extensão + magic bytes), rate limiting em 3 camadas, bcrypt 12 rounds, Stripe com verificação de assinatura. O sistema de planos (essential/professional) funciona corretamente no backend com proteção em 3 camadas, mas apresenta **3 issues HIGH** corrigíveis com patches pequenos: CSRF ausente em PUT de config/about-content, `throw new Error` retornando 500 ao invés de 403 na validação de plan, e `GET /api/config` vazando dados PRO para público. Nenhum bloqueador CRÍTICO encontrado.

---

## 🟢 VEREDITO: **GO** (condicional — corrigir HIGHs antes de produção)

**Justificativa:** Não há secrets commitados no repositório, não há armazenamento de cartão/PII, não há endpoint público de criação de admin, não há upload executável permitido. Os 3 HIGHs são corrigíveis em <1h com patches de poucas linhas.

---

## NOTAS

| Dimensão | Nota | Justificativa |
|----------|------|---------------|
| **Técnica** | **8.5** / 10 | Arquitetura limpa, Zod validation, Prisma ORM (sem SQL injection), seeds consistentes. Falta: testes automatizados, generic `requireFeature()` middleware |
| **Segurança** | **7.5** / 10 | JWT excelente (tokenVersion, rotation, 5 session limit, SHA-256 hash). Perde por: CSRF ausente em 2 rotas PUT admin, `unsafe-inline` em CSP, JWT em localStorage |
| **UX** | **8.0** / 10 | Admin funcional com toast feedback, onboarding, plan badges, locked overlays. Perde por: inline onclick handlers com JSON.stringify |

---

## CONTAGEM DE ISSUES

| Severidade | Qty | IDs |
|------------|-----|-----|
| 🔴 CRÍTICO | **0** | — |
| 🟠 HIGH | **3** | H-01, H-02, H-03 |
| 🟡 MEDIUM | **5** | M-01, M-02, M-03, M-04, M-05 |
| 🟢 LOW | **6** | L-01, L-02, L-03, L-04, L-05, L-06 |
| **Total** | **14** | |

---

## CONFIDENCE: **88%**

Base: leitura completa de todos os routes (8), middlewares (5), schema.prisma, 3 seeds, admin.html (1927 linhas), about.html, todos os js/*.js (8 arquivos). Não foi possível executar `npm test` (sem testes no projeto). Stripe webhook não testado end-to-end (requer Stripe CLI).

---

## CHECKLIST OBRIGATÓRIO — STATUS

| # | Check | Status | Evidência |
|---|-------|--------|-----------|
| 1 | `.env` não commitado / secrets in repo | ✅ **OK** | `.gitignore` L2, `server/.gitignore` L6 — `.env` ignorado |
| 2 | JWT_SECRET via env (`process.env.JWT_SECRET`) | ✅ **OK** | `authService.ts` L11 — fallback `'dev-secret...'` + crash guard em prod (`index.ts`) |
| 3 | Token invalidation on password change (tokenVersion) | ✅ **OK** | `auth.ts` L125-131 — `tokenVersion: { increment: 1 }` + `prisma.session.deleteMany()` |
| 4 | bcrypt rounds ≥ 12 | ✅ **OK** | `authService.ts` L14 — `BCRYPT_ROUNDS = 12` |
| 5 | Rate limit on auth endpoints | ✅ **OK** | `app.ts` L161 — `authLimiter` (10/15min) + brute-force per-IP tracker |
| 6 | Upload validation (MIME, ext, magic bytes, max size) | ✅ **OK** | `upload.ts` — JPEG/PNG/GIF/WEBP magic bytes, 2MB limit, UUID filename |
| 7 | No innerHTML with user content (unsanitized) | ✅ **OK** | Todos usam `escapeHTML()` / `escapeAttr()`. Exceção: `document.write` no QR (ver M-03) |
| 8 | Webhook signature validation (Stripe) | ✅ **OK** | `checkout.ts` L101 — `stripe.webhooks.constructEvent()` com `STRIPE_WEBHOOK_SECRET` |
| 9 | Health endpoint present (`/healthz`) | ✅ **OK** | `app.ts` L142 — retorna `{ status: 'ok', timestamp, uptime }` |
| 10 | Build runnable | ✅ **OK** | `npx tsc --noEmit` — zero erros (verificado nesta sessão) |
| 11 | Tests runnable | ⚠️ **COULD NOT RUN** | Não existem testes automatizados no projeto. Comando para criar: `cd server && npm i -D jest ts-jest @types/jest supertest` |
| 12 | `ClientFeatures` model existe? | ❌ **MISSING** | Planos usam `SiteConfig` KV store (`key='site_plan'`). Aceitável para 2 tiers mas não escalável. |
| 13 | `requireFeature()` genérico existe e usado? | ⚠️ **INCOMPLETE** | Existe `requireProfessional()` mas não `requireFeature(flag)`. Aceitável para 2 tiers. |
| 14 | Seed mapping ESSENTIAL/PROFESSIONAL testável? | ✅ **OK** | Todos 3 seeds leem `PLAN` env var. Default: `'essential'`. Testável: `PLAN=professional npx prisma db seed` |
| 15 | Frontend consome flags e oculta UI? | ✅ **OK** | `fetchPlanInfo()` + `applyPlanUI()` em admin.html. `about.html` fetch `/api/plan` + hide `#team-section` |
| 16 | Rotas PRO protegidas (403 se plan não tem feature)? | ⚠️ **INCOMPLETE** | `aboutContent.ts` retorna 403 corretamente. `config.ts` usa `throw new Error()` → retorna **500** (ver H-02) |

---

## LISTA DE ISSUES

### 🟠 HIGH (3)

| ID | Título | Arquivo(s) | Linha |
|----|--------|------------|-------|
| **H-01** | CSRF ausente em PUT `/api/config` e PUT `/api/about-content` — admin autenticado mas sem proteção CSRF nas rotas mutáveis | `app.ts` | L165-166 |
| **H-02** | Config route usa `throw new Error()` para plan block — errorHandler retorna 500 genérico ao invés de 403 com mensagem clara | `config.ts` | L95-97 |
| **H-03** | `GET /api/config` retorna TODOS os configs (incluindo `logo_url`, `brand_color`, `favicon_url`, `site_plan`) para público sem filtrar por plan | `config.ts` | L73-78 |

### 🟡 MEDIUM (5)

| ID | Título | Arquivo(s) | Linha |
|----|--------|------------|-------|
| **M-01** | Stripe webhook POST bloqueado por `csrfVerifyToken` — Stripe não envia CSRF cookies/headers | `app.ts` | L168 |
| **M-02** | PUT `/api/about-content` response não filtra `team_members` por plan (admin Essential vê dados PRO no response após save) | `aboutContent.ts` | L141-149 |
| **M-03** | `document.write` insere URL sem sanitizar no QR print window — self-XSS pelo admin | `admin.html` | L1882 |
| **M-04** | CSP `script-src: 'unsafe-inline'` enfraquece proteção XSS | `app.ts` | L46 |
| **M-05** | JWT tokens armazenados em `localStorage` (acessível a qualquer JS no mesmo origin) | `admin.html` | L968-969 |

### 🟢 LOW (6)

| ID | Título | Arquivo(s) | Linha |
|----|--------|------------|-------|
| **L-01** | Inline `onclick` com `JSON.stringify(d).replace(/'/g, "&#39;")` — edge case XSS se DB comprometido | `admin.html` | L1072, L1165 |
| **L-02** | Import morto: `PRO_CONFIG_KEYS`, `PRO_ABOUT_KEYS` importados mas não usados em plan route | `plan.ts` | L6 |
| **L-03** | `/healthz` expõe `process.uptime()` — information leak menor | `app.ts` | L144 |
| **L-04** | `.env.example` contém `ADMIN_PASSWORD=Admin@123456` — confusão com credenciais reais | `.env.example` | L45 |
| **L-05** | Seeds hamburgueria/pizzaria não alertam sobre valor inválido de PLAN (inconsistência com seed principal) | `seed-hamburgueria.ts`, `seed-pizzaria.ts` | — |
| **L-06** | Docker-compose expõe portas 5432/6379 no host (dev only mas perigoso se copiado para prod) | `docker-compose.yml` | — |

---

## ✅ DESTAQUES POSITIVOS

1. **Auth robusto**: JWT access (15m) + refresh rotation (30d) + tokenVersion DB check + 5 session limit + SHA-256 hash no refresh token
2. **Upload seguro**: Triple validation (MIME + extension + magic bytes) + UUID filename + 2MB limit
3. **CSRF**: Double-submit cookie pattern com `timingSafeEqual`
4. **Helmet**: CSP, HSTS, X-Frame-Options, Permissions-Policy, X-Content-Type-Options
5. **Prisma ORM**: Zero raw queries = zero SQL injection
6. **Plan system**: 3-layer protection (backend 403 + admin UI disabled/locked + public frontend hidden)
7. **Fail-closed**: `getCurrentPlan()` default = `'essential'` (mais restritivo)
8. **Rate limiting**: 3 tiers (API 100/15min, auth 10/15min, upload 30/hour) + brute-force per-IP
9. **Input validation**: Zod schemas em todas as rotas mutáveis
10. **XSS sanitization**: `escapeHTML()` consistente em todos os innerHTML com dados de API

---

## PRÓXIMA AÇÃO IMEDIATA

> **Abrir `phased_corrections.md` e executar Fase 0 (3 patches, ~30min).** Depois Fase 1 (~1h). Total para GO incondicional: ~2h.

---

## CHECKLIST DE ACEITAÇÃO (NOTA 10)

Todos os itens devem ser ✅ para considerar nota 10:

- [ ] 0 issues CRÍTICOS
- [ ] 0 issues HIGH (H-01, H-02, H-03 corrigidos)
- [ ] `tokenVersion` incrementado em password change ✅ (já OK)
- [ ] Upload validado (MIME + ext + magic bytes) ✅ (já OK)
- [ ] Seed testado para ESSENTIAL e PROFESSIONAL ✅ (já OK)
- [ ] CSRF presente em TODAS as rotas admin mutáveis (PUT config, PUT about-content)
- [ ] `GET /api/config` filtra PRO keys no Essential
- [ ] Config PUT retorna 403 (não 500) para PRO keys no Essential
- [ ] PUT about-content response filtra `team_members` por plan
- [ ] Webhook exempt de CSRF
- [ ] `document.write` sanitiza URL input
- [ ] Imports mortos removidos de `plan.ts`
- [ ] `npx tsc --noEmit` compila sem erros ✅ (já OK)
