# 📋 GitHub Issues — Templates Prontos

Copie e cole estes templates ao criar issues no GitHub para padronizar descrição, checklist e labels.

---

## Sprint 1 — Quick Wins

### Issue S1-T1: Loading States + Toast Notifications

**Title:** `[UX] Implement loading states and toast notifications`

**Labels:** `enhancement`, `ux`, `priority:high`, `sprint-1`

**Description:**

Implementar sistema global de loading states (spinners, button disabled, overlay) e toast notifications (sucesso/erro/info) para melhorar feedback visual durante operações assíncronas.

**Current State:**
- Operações async (login, save, upload) não mostram feedback visual claro
- Usuários não sabem se ação foi bem-sucedida sem verificar manualmente
- UX Score: 7/10

**Proposed Solution:**
- Adicionar loading overlay global com spinner
- Implementar toast notifications usando Notyf (3KB) ou custom CSS
- Aplicar loading states em todos botões durante async operations
- Mostrar toast de sucesso/erro após cada ação

**Implementation Checklist:**
- [ ] Adicionar `<div id="loading-overlay">` no HTML base
- [ ] Criar funções `showLoading(btn)`, `hideLoading(btn)` em app.js
- [ ] Integrar biblioteca Notyf ou criar custom toast CSS
- [ ] Aplicar em login flow (admin.html)
- [ ] Aplicar em save operations (config, dishes, gallery)
- [ ] Aplicar em upload flow
- [ ] Testar em todos navegadores (Chrome, Firefox, Safari)

**Acceptance Criteria:**
- [ ] Clicar em 'Salvar' → botão desabilita e mostra spinner
- [ ] Upload de imagem → progress bar + toast de sucesso
- [ ] Login inválido → toast vermelho com mensagem clara
- [ ] Operações simultâneas → loading states não conflitam

**Files to Modify:**
- `public/js/app.js`
- `public/admin.html`
- `public/about.html`
- `styles.css`

**Testing:**
```bash
# Visual test
open http://localhost:3000/admin.html
# Testar cada ação: login, save, upload, delete
```

**Estimate:** 2-3 hours  
**Impact:** HIGH (melhora UX em +0.5 pontos)

---

### Issue S1-T2: Form Validation Visual Feedback

**Title:** `[UX] Add real-time visual form validation`

**Labels:** `enhancement`, `ux`, `priority:high`, `sprint-1`

**Description:**

Adicionar feedback visual em tempo real para validação de formulários: border vermelho + mensagem de erro para campos inválidos, checkmark verde para campos válidos.

**Current State:**
- Validação apenas no submit (backend)
- Usuário não sabe se preencheu corretamente até tentar submeter
- Mensagens de erro genéricas

**Proposed Solution:**
- Validação em tempo real (blur/input events)
- Classes CSS `.input-error`, `.input-valid`, `.error-message`
- Validações: email format, password min 8 chars, required fields

**Implementation Checklist:**
- [ ] Criar CSS classes para estados (error, valid, message)
- [ ] Adicionar event listeners (blur, input) em campos de formulário
- [ ] Validar formato de email
- [ ] Validar senha (min 8 chars, idealmente com complexidade)
- [ ] Validar campos obrigatórios (required)
- [ ] Mostrar/ocultar mensagens de erro dinamicamente
- [ ] Testar edge cases (copiar/colar, autocomplete)

**Acceptance Criteria:**
- [ ] Email vazio → border vermelho + 'Email obrigatório'
- [ ] Email inválido → 'Formato de email inválido'
- [ ] Password < 8 chars → 'Senha deve ter no mínimo 8 caracteres'
- [ ] Campo válido → border verde + checkmark icon
- [ ] Submit bloqueado se houver erros de validação

**Files to Modify:**
- `public/admin.html`
- `public/login.html`
- `public/register.html`
- `styles.css`

**Estimate:** 1.5-2 hours  
**Impact:** MEDIUM (melhora UX em +0.3 pontos)

---

### Issue S1-T3: Dependency Audit & Security Updates

**Title:** `[Security] Run npm audit fix and update critical dependencies`

**Labels:** `security`, `chore`, `priority:high`, `sprint-1`

**Description:**

Executar `npm audit fix` para corrigir vulnerabilidades conhecidas. Atualizar packages críticos (express, helmet, jsonwebtoken, bcrypt) para versões mais recentes e seguras.

**Current State:**
- Dependências não auditadas recentemente
- Possíveis vulnerabilidades conhecidas em packages
- Security Score: 8/10

**Proposed Solution:**
- Executar `npm audit` para identificar vulnerabilidades
- Aplicar `npm audit fix --force` (revisar breaking changes)
- Atualizar manualmente packages críticos
- Testar build e runtime após updates

**Implementation Checklist:**
- [ ] Executar `npm audit` e documentar vulnerabilidades
- [ ] Aplicar `npm audit fix` (sem --force primeiro)
- [ ] Revisar `npm audit fix --force` se necessário
- [ ] Verificar `npm outdated` para packages desatualizados
- [ ] Atualizar express, helmet, jsonwebtoken, bcryptjs
- [ ] Testar `npm run build` — deve compilar sem erros
- [ ] Testar `npm run dev` — servidor deve iniciar
- [ ] Testar funcionalidades críticas (login, upload)
- [ ] Revisar changelogs para breaking changes

**Acceptance Criteria:**
- [ ] `npm audit` → 0 vulnerabilities (ou apenas LOW/informational)
- [ ] `npm run build` → sucesso
- [ ] `npm run dev` → servidor inicia sem erros
- [ ] Login flow → funciona normalmente
- [ ] Upload de imagem → funciona normalmente
- [ ] Todas rotas críticas testadas

**Files to Modify:**
- `server/package.json`
- `server/package-lock.json`

**Testing:**
```bash
cd server
npm audit
npm audit fix
npm outdated
npm update express helmet jsonwebtoken bcryptjs
npm run build
npm run dev
```

**Estimate:** 1-2 hours  
**Impact:** HIGH (melhora Segurança em +0.3 pontos)

---

### Issue S1-T4: Additional Security Headers

**Title:** `[Security] Add Expect-CT and CSP-Report-Only headers`

**Labels:** `security`, `enhancement`, `priority:medium`, `sprint-1`

**Description:**

Adicionar headers de segurança extras: `Expect-CT` para certificate transparency e `Content-Security-Policy-Report-Only` para monitorar violações CSP sem bloquear conteúdo.

**Implementation Checklist:**
- [ ] Adicionar `Expect-CT` header após helmet config
- [ ] Adicionar `Content-Security-Policy-Report-Only` header
- [ ] Opcionalmente criar endpoint `/csp-report` para receber reports
- [ ] Testar com curl/browser DevTools

**Acceptance Criteria:**
- [ ] `curl -I http://localhost:3000` mostra `Expect-CT` header
- [ ] Browser DevTools mostra CSP-Report-Only
- [ ] Nenhum conteúdo bloqueado (report-only mode)

**Files to Modify:**
- `server/src/app.ts`

**Code Snippet:**
```typescript
res.setHeader('Expect-CT', 'max-age=86400, enforce');
res.setHeader('Content-Security-Policy-Report-Only', "default-src 'self'; report-uri /csp-report");
```

**Estimate:** 0.5-1 hour  
**Impact:** LOW (+0.2 Segurança)

---

### Issue S1-T5: Accessibility - ARIA Labels & Focus Trap

**Title:** `[A11y] Add ARIA labels and focus trap in modals`

**Labels:** `accessibility`, `a11y`, `enhancement`, `priority:medium`, `sprint-1`

**Description:**

Melhorar acessibilidade com ARIA labels em botões de ícone e focus trap em modais para navegação por teclado e screen readers.

**Implementation Checklist:**
- [ ] Adicionar `aria-label` em todos botões de ícone (edit, delete, upload)
- [ ] Adicionar `role="dialog"` e `aria-modal="true"` em modais
- [ ] Implementar focus trap (Tab cicla dentro do modal)
- [ ] ESC key fecha modal
- [ ] Focus automático no primeiro input ao abrir modal
- [ ] Restaurar foco ao elemento trigger ao fechar
- [ ] Testar com screen reader (NVDA/JAWS)
- [ ] Validar com axe DevTools

**Acceptance Criteria:**
- [ ] Screen reader anuncia labels corretamente
- [ ] Tab dentro do modal cicla apenas elementos do modal
- [ ] ESC fecha modal e retorna foco
- [ ] Abrir modal → primeiro input recebe foco automaticamente
- [ ] axe DevTools → 0 erros críticos de acessibilidade

**Files to Modify:**
- `public/admin.html`
- `public/about.html`
- `public/js/app.js`

**Estimate:** 2-3 hours  
**Impact:** MEDIUM (+0.4 UX, +A11y compliance)

---

### Issue S1-T6: Skeleton Loaders for Gallery & Menu

**Title:** `[UX] Implement skeleton loaders for async content`

**Labels:** `enhancement`, `ux`, `priority:low`, `sprint-1`

**Description:**

Implementar placeholders animados (skeleton screens) durante carregamento inicial da galeria e menu para melhorar percepção de performance.

**Implementation Checklist:**
- [ ] Criar CSS para skeleton animation (shimmer effect)
- [ ] Renderizar 6 skeleton cards antes do fetch
- [ ] Substituir por conteúdo real após load
- [ ] Aplicar em gallery.html
- [ ] Aplicar em menu.html
- [ ] Testar com network throttling (Slow 3G)

**Acceptance Criteria:**
- [ ] Abrir /gallery.html → skeleton cards aparecem imediatamente
- [ ] Após ~500ms → skeleton substituído por imagens reais
- [ ] Network throttling → skeleton visível por tempo proporcional
- [ ] Animação suave (60fps)

**Files to Modify:**
- `public/gallery.html`
- `public/menu.html`
- `styles.css`

**Estimate:** 1.5-2 hours  
**Impact:** MEDIUM (+0.3 UX)

---

## Sprint 2 — Core Improvements

### Issue S2-T1: Redis Rate Limiting for Horizontal Scaling

**Title:** `[Infrastructure] Migrate rate limiting to Redis store`

**Labels:** `infrastructure`, `security`, `priority:high`, `sprint-2`

**Description:**

Substituir rate limiting in-memory por Redis store para suportar horizontal scaling (múltiplas instâncias compartilham estado de rate limit).

**Current State:**
- Rate limit armazenado em memória da instância
- Múltiplas instâncias = rate limit isolado por instância
- Não escalável horizontalmente

**Proposed Solution:**
- Integrar Redis como store compartilhado
- Usar `rate-limit-redis` package
- Configurar health check para Redis

**Implementation Checklist:**
- [ ] `npm install rate-limit-redis redis`
- [ ] Criar Redis client em rateLimit.ts
- [ ] Configurar RedisStore para authLimiter
- [ ] Configurar RedisStore para apiLimiter, uploadLimiter, checkoutLimiter
- [ ] Adicionar `REDIS_URL` ao .env.example
- [ ] Atualizar /healthz para incluir Redis ping
- [ ] Testar com 2 instâncias do servidor
- [ ] Documentar setup do Redis no GUIA_COMPLETO_DEPLOY.md

**Acceptance Criteria:**
- [ ] Iniciar 2 instâncias (porta 3000 e 3001)
- [ ] 5 requests para :3000/api/auth/login + 6 para :3001 → última deve bloquear
- [ ] Rate limit compartilhado entre instâncias
- [ ] Reiniciar servidor → rate limit persiste (Redis mantém estado)
- [ ] /healthz retorna status do Redis

**Files to Modify:**
- `server/src/middlewares/rateLimit.ts`
- `server/package.json`
- `server/.env.example`
- `server/src/app.ts` (healthcheck)

**Code Snippet:**
```typescript
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

export const authLimiter = rateLimit({
    store: new RedisStore({ client: redisClient }),
    windowMs: 15 * 60 * 1000,
    max: 10,
    // ... rest
});
```

**Estimate:** 3-4 hours  
**Impact:** HIGH (+0.5 Segurança, essencial para scaling)

---

### Issue S2-T2: Automated Testing (Auth, Upload, Config)

**Title:** `[Testing] Implement unit and integration tests (60%+ coverage)`

**Labels:** `testing`, `quality`, `priority:high`, `sprint-2`

**Description:**

Implementar testes automatizados para rotas críticas: auth (login, refresh, token rotation), upload (magic bytes, size), config (PRO key gating). Target: 60%+ code coverage.

**Current State:**
- Zero testes automatizados
- Validação manual propensa a regressão
- Technical Score: 8/10

**Proposed Solution:**
- Setup Jest + ts-jest + supertest
- Testes unitários: authService, upload validation
- Testes de integração: rotas de auth, config, upload
- Target: 60%+ overall, 80%+ em rotas críticas

**Implementation Checklist:**
- [ ] `npm install -D jest ts-jest @types/jest supertest`
- [ ] Criar `jest.config.ts`
- [ ] Criar `tests/auth.test.ts`
  - [ ] Login válido → retorna tokens
  - [ ] Login inválido → 401
  - [ ] Refresh token válido → novo access token
  - [ ] Password change → incrementa tokenVersion
  - [ ] Rate limit → bloqueia após 10 tentativas
- [ ] Criar `tests/upload.test.ts`
  - [ ] Upload JPEG válido → sucesso
  - [ ] Upload executável (.exe renomeado) → rejeita magic bytes
  - [ ] Upload > 2MB → rejeita tamanho
  - [ ] Upload sem auth → 401
- [ ] Criar `tests/config.test.ts`
  - [ ] GET /api/config (Essential) → filtra PRO keys
  - [ ] PUT PRO key (Essential) → 403
  - [ ] PUT PRO key (Professional) → sucesso
  - [ ] GET retorna `site_plan` oculto
- [ ] Adicionar npm script `"test": "jest"`
- [ ] Executar `npm run test -- --coverage`
- [ ] Configurar CI para executar testes

**Acceptance Criteria:**
- [ ] `npm run test` → todos testes passam
- [ ] Coverage report → 60%+ overall
- [ ] Auth routes → 80%+ coverage
- [ ] Upload middleware → 80%+ coverage
- [ ] Config routes → 75%+ coverage
- [ ] CI pipeline executa testes automaticamente

**Files to Create:**
- `server/tests/auth.test.ts`
- `server/tests/upload.test.ts`
- `server/tests/config.test.ts`
- `server/jest.config.ts`

**Estimate:** 6-8 hours  
**Impact:** HIGH (+0.7 Técnica, fundação para qualidade)

---

### Issue S2-T3: Tailwind Local Build with Tree-Shaking

**Title:** `[Performance] Replace Tailwind CDN with local build`

**Labels:** `performance`, `build`, `priority:medium`, `sprint-2`

**Description:**

Substituir Tailwind CDN por build local para reduzir payload de ~100KB para ~10KB com tree-shaking, eliminando classes CSS não utilizadas.

**Current State:**
- Tailwind carregado via CDN (~100KB)
- Todas classes Tailwind incluídas (sem tree-shaking)
- Dependência de CDN externo
- Performance score menor

**Proposed Solution:**
- Instalar tailwindcss localmente
- Configurar build script
- Gerar CSS otimizado (~10KB gzipped)
- Remover dependência de CDN

**Implementation Checklist:**
- [ ] `npm install -D tailwindcss postcss autoprefixer`
- [ ] `npx tailwindcss init`
- [ ] Criar `input.css` com @tailwind directives
- [ ] Configurar `tailwind.config.js` com content paths
- [ ] Adicionar build script: `tailwindcss -i ./input.css -o ./public/output.css --minify`
- [ ] Substituir CDN por `<link href="/output.css">` em todos HTMLs (8 arquivos)
- [ ] Adicionar npm script `"build:css": "tailwindcss build..."`
- [ ] Testar todos layouts
- [ ] Verificar Lighthouse score improvement

**Acceptance Criteria:**
- [ ] `npm run build:css` → gera `public/output.css` (~10KB gzipped)
- [ ] Abrir qualquer página → estilos carregam corretamente
- [ ] Network tab → sem request para cdn.tailwindcss.com
- [ ] Lighthouse Performance → +5 pontos
- [ ] output.css não contém classes não utilizadas

**Files to Modify:**
- `public/index.html` (x8 arquivos)
- `tailwind.config.js` (novo)
- `input.css` (novo)
- `package.json`

**Estimate:** 2-3 hours  
**Impact:** MEDIUM (+0.3 Técnica, +performance)

---

### Issue S2-T4: Advanced Health Check (DB + Redis)

**Title:** `[Infrastructure] Improve health check endpoint with dependency checks`

**Labels:** `infrastructure`, `monitoring`, `priority:medium`, `sprint-2`

**Description:**

Melhorar `/healthz` para incluir verificação de dependências externas (PostgreSQL, Redis). Retornar 503 se algum serviço crítico estiver down.

**Implementation Checklist:**
- [ ] Adicionar `await prisma.$queryRaw\`SELECT 1\`` em /healthz
- [ ] Adicionar `await redisClient.ping()` em /healthz
- [ ] Retornar 200 se tudo OK, 503 se degraded
- [ ] Incluir detalhes de cada check no response
- [ ] Testar com Redis parado
- [ ] Testar com DB parada
- [ ] Documentar para Kubernetes/Render liveness probe

**Acceptance Criteria:**
- [ ] `curl /healthz` → 200 `{status: 'healthy', checks: {database: 'ok', redis: 'ok'}}`
- [ ] Parar Redis → `curl /healthz` → 503 `{status: 'degraded', checks: {redis: 'down'}}`
- [ ] Parar DB → 503 com database: 'down'
- [ ] Kubernetes/Render consegue usar como probe

**Files to Modify:**
- `server/src/app.ts`

**Estimate:** 1-2 hours  
**Impact:** MEDIUM (+0.2 Técnica, +observability)

---

### Issue S2-T5: Keyboard Navigation Enhancement

**Title:** `[A11y] Implement full keyboard navigation support`

**Labels:** `accessibility`, `a11y`, `enhancement`, `priority:low`, `sprint-2`

**Description:**

Implementar navegação completa por teclado: ESC fecha modais/dropdowns, Enter submete forms, Tab order lógico, Skip to content link.

**Implementation Checklist:**
- [ ] Event listener global ESC → fecha modal ativo
- [ ] Verificar/corrigir tabindex em elementos interativos
- [ ] Adicionar "Skip to main content" link (visível no Tab)
- [ ] Enter key em forms → submit
- [ ] Arrow keys em dropdowns/select
- [ ] Shift+Tab → navegação reversa
- [ ] Testar keyboard-only navigation completa

**Acceptance Criteria:**
- [ ] ESC fecha modal aberto
- [ ] Tab através da página → ordem lógica
- [ ] Tab no topo → "Skip to content" aparece e funciona
- [ ] Enter em form → submete
- [ ] Navegação 100% funcional sem mouse

**Files to Modify:**
- `public/js/app.js`
- `public/admin.html`
- `styles.css`

**Estimate:** 2-3 hours  
**Impact:** MEDIUM (+0.3 UX, +A11y)

---

## Sprint 3 — Production Polish

### Issue S3-T1: CSP Nonces (Remove unsafe-inline)

**Title:** `[Security] Implement CSP nonces to eliminate unsafe-inline`

**Labels:** `security`, `enhancement`, `priority:high`, `sprint-3`

**Description:**

Implementar CSP nonces para eliminar `'unsafe-inline'` do Content-Security-Policy, fortalecendo proteção contra XSS.

**Current State:**
- CSP usa `script-src: 'unsafe-inline'` por causa do Tailwind CDN
- Enfraquece proteção XSS

**Proposed Solution:**
- Gerar nonce aleatório por request
- Injetar nonce em script/style tags inline
- Atualizar CSP header para incluir nonce
- Usar template engine (EJS) ou string replacement

**Implementation Checklist:**
- [ ] Middleware: `res.locals.nonce = crypto.randomBytes(16).toString('base64')`
- [ ] Helmet CSP: `script-src: ["'self'", (req, res) => \`'nonce-${res.locals.nonce}'\`]`
- [ ] Converter HTMLs estáticos para templates (EJS ou similar)
- [ ] Adicionar `nonce="<%= nonce %>"` em todos `<script>` inline
- [ ] Testar scripts inline executam normalmente
- [ ] Testar XSS bloqueado sem nonce correto

**Acceptance Criteria:**
- [ ] `curl -I /admin.html` → CSP contém `nonce-RANDOM`
- [ ] Scripts inline executam normalmente
- [ ] Injetar `<script>alert(1)</script>` via XSS → bloqueado
- [ ] CSP não contém mais `'unsafe-inline'`

**Files to Modify:**
- `server/src/app.ts`
- `public/*.html` → converter para `views/*.ejs`

**Estimate:** 3-4 hours  
**Impact:** MEDIUM (+0.3 Segurança)

---

### Issue S3-T2: CI/CD Pipeline (GitHub Actions)

**Title:** `[DevOps] Setup CI/CD pipeline with GitHub Actions`

**Labels:** `devops`, `ci-cd`, `automation`, `priority:high`, `sprint-3`

**Description:**

Configurar GitHub Actions para executar automaticamente em cada push/PR: linting, type-check, testes, build, security audit.

**Implementation Checklist:**
- [ ] Criar `.github/workflows/ci.yml`
- [ ] Job: checkout code
- [ ] Job: setup Node.js 18
- [ ] Job: install dependencies (`npm ci`)
- [ ] Job: lint (`npm run lint`)
- [ ] Job: type-check (`npx tsc --noEmit`)
- [ ] Job: run tests (`npm test`)
- [ ] Job: security audit (`npm audit`)
- [ ] Job: build (`npm run build`)
- [ ] Configurar branch protection rules
- [ ] Testar com PR de teste

**Acceptance Criteria:**
- [ ] Push para branch → workflow executa automaticamente
- [ ] Todos jobs passam (green check)
- [ ] PR mostra status check antes de merge
- [ ] Falha em teste → CI falha
- [ ] Status badge no README mostra build status

**Files to Create:**
- `.github/workflows/ci.yml`

**Workflow Example:**
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd server && npm ci
      - run: cd server && npm run lint
      - run: cd server && npx tsc --noEmit
      - run: cd server && npm test
      - run: cd server && npm audit
      - run: cd server && npm run build
```

**Estimate:** 3-4 hours  
**Impact:** HIGH (+0.3 Técnica, +automação)

---

### Issue S3-T3: Error Monitoring with Sentry

**Title:** `[Monitoring] Integrate Sentry for error tracking`

**Labels:** `monitoring`, `observability`, `priority:medium`, `sprint-3`

**Description:**

Integrar Sentry para capturar e rastrear erros em produção (backend + frontend) com contexto de usuário, breadcrumbs e release tracking.

**Implementation Checklist:**
- [ ] `npm install @sentry/node @sentry/profiling-node`
- [ ] Inicializar Sentry no topo de `index.ts`
- [ ] Adicionar `Sentry.Handlers.errorHandler()` em app.ts
- [ ] Configurar environment, release (git SHA), tags
- [ ] Adicionar Sentry frontend (browser SDK)
- [ ] Criar endpoint `/debug-sentry` para testar
- [ ] Testar erro intencional aparece no dashboard
- [ ] Configurar alertas no Sentry dashboard

**Acceptance Criteria:**
- [ ] Erro lançado → aparece no dashboard Sentry com stack trace
- [ ] Contexto de usuário incluído (userId, email)
- [ ] Breadcrumbs mostram ações antes do erro
- [ ] Release tagging funciona (git SHA visível)
- [ ] Frontend errors também capturados

**Files to Modify:**
- `server/src/index.ts`
- `server/src/app.ts`
- `public/js/app.js`
- `server/package.json`

**Estimate:** 2-3 hours  
**Impact:** MEDIUM (+0.2 Técnica, +observability)

---

### Issue S3-T4: Subresource Integrity (SRI) for CDNs

**Title:** `[Security] Add SRI hashes to external scripts`

**Labels:** `security`, `enhancement`, `priority:low`, `sprint-3`

**Description:**

Adicionar hashes SRI (Subresource Integrity) em todos scripts/styles carregados de CDNs externos para prevenir tampering de CDN comprometido.

**Implementation Checklist:**
- [ ] Identificar todos CDNs externos (Stripe, etc)
- [ ] Gerar hash SRI para cada resource
- [ ] Adicionar `integrity="sha384-HASH" crossorigin="anonymous"`
- [ ] Testar scripts carregam normalmente
- [ ] Testar hash inválido → bloqueado

**Acceptance Criteria:**
- [ ] Todos CDNs têm hashes SRI
- [ ] Modificar hash → script não carrega (erro integridade)
- [ ] Hash correto → carrega normal

**Files to Modify:**
- `public/index.html`
- `public/admin.html`
- `public/buy.html`

**Command:**
```bash
curl -s https://js.stripe.com/v3/ | openssl dgst -sha384 -binary | openssl base64 -A
```

**Estimate:** 1 hour  
**Impact:** LOW (+0.1 Segurança)

---

### Issue S3-T5: Pre-commit Hooks (Husky + lint-staged)

**Title:** `[DevOps] Setup pre-commit hooks for code quality`

**Labels:** `devops`, `quality`, `automation`, `priority:low`, `sprint-3`

**Description:**

Configurar Husky + lint-staged para executar automaticamente linting e type-check antes de cada commit, prevenindo commits com erros.

**Implementation Checklist:**
- [ ] `npm install -D husky lint-staged`
- [ ] `npx husky init`
- [ ] Criar pre-commit hook
- [ ] Configurar lint-staged: `{ "*.ts": ["eslint --fix", "tsc --noEmit"] }`
- [ ] Testar commit com erro lint → bloqueado
- [ ] Testar commit válido → passa

**Acceptance Criteria:**
- [ ] Commit com erro lint → bloqueado
- [ ] Commit com erro TS → bloqueado
- [ ] Código válido → commit passa
- [ ] Auto-fix em erros lintable

**Files to Create:**
- `.husky/pre-commit`
- `server/.lintstagedrc.json`

**Estimate:** 1-2 hours  
**Impact:** LOW (+0.1 Técnica, +qualidade)

---

### Issue S3-T6: Performance Budget CI Check (Lighthouse)

**Title:** `[Performance] Add Lighthouse CI checks with performance budgets`

**Labels:** `performance`, `ci-cd`, `quality`, `priority:low`, `sprint-3`

**Description:**

Adicionar check de performance budget no CI usando Lighthouse. Bloqueia merge se Performance < 85, Accessibility < 90, ou FCP > 1.5s.

**Implementation Checklist:**
- [ ] Criar `.github/workflows/lighthouse.yml`
- [ ] Instalar `@lhci/cli`
- [ ] Configurar budgets (performance: 0.85, a11y: 0.90, FCP: 1500ms)
- [ ] Executar em ambiente de preview (Render Preview)
- [ ] Anexar report Lighthouse como comment no PR
- [ ] Testar com PR que degrada performance

**Acceptance Criteria:**
- [ ] PR com perf ruim → CI falha com report
- [ ] PR com perf boa → CI passa
- [ ] Report Lighthouse anexado no PR comment
- [ ] Budgets configurados e respeitados

**Files to Create:**
- `.github/workflows/lighthouse.yml`
- `lighthouse.config.js`

**Estimate:** 2 hours  
**Impact:** LOW (+0.2 UX, +qualidade)

---

## 📝 Template Geral (Copiar para novos issues)

**Title:** `[Category] Short descriptive title`

**Labels:** `label1`, `label2`, `priority:high/medium/low`, `sprint-X`

**Description:**
[Descrição do problema e solução proposta]

**Current State:**
- [Estado atual]

**Proposed Solution:**
- [Solução proposta]

**Implementation Checklist:**
- [ ] Step 1
- [ ] Step 2

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

**Files to Modify:**
- `path/to/file1.ts`

**Estimate:** X-Y hours  
**Impact:** HIGH/MEDIUM/LOW (+score)

---

**Suggested Labels:**
- `enhancement` — Nova feature
- `bug` — Correção de bug
- `security` — Relacionado a segurança
- `performance` — Otimização de performance
- `ux` — User experience
- `a11y` / `accessibility` — Acessibilidade
- `testing` — Testes
- `devops` / `ci-cd` — Infraestrutura e CI/CD
- `documentation` — Documentação
- `chore` — Manutenção/tarefas
- `priority:high` / `priority:medium` / `priority:low`
- `sprint-1` / `sprint-2` / `sprint-3`

**Assignee:** Atribuir ao desenvolvedor responsável  
**Milestone:** Atribuir ao sprint milestone correspondente  
**Projects:** Adicionar ao board do projeto (Kanban)
