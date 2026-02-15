# 🔧 PHASED CORRECTIONS — Correções por Fase

**Projeto:** Restaurant Template SaaS  
**Data:** 2026-02-12  
**Referência:** `verdict.md` (issues H-01 a H-03, M-01 a M-05, L-01 a L-06)

---

## FASE 0 — BLOCKERS IMEDIATOS (corrigir antes de qualquer venda)

> Tempo total estimado: **30 minutos**  
> Branch: **direto em `main`** (são fixes de segurança urgentes)

---

### ✅ TAREFA 0.1 — CSRF em rotas admin mutáveis (H-01)

**Severidade:** 🟠 HIGH  
**Problema:** `PUT /api/config` e `PUT /api/about-content` estão montadas SEM `csrfVerifyToken` em `app.ts`. Um atacante pode forjar requests se o admin visitar um site malicioso.  
**Arquivo:** `server/src/app.ts` — linhas 165-166  
**Tempo:** 5 min

**Trecho atual (L165-166):**
```typescript
app.use('/api/config', apiLimiter, configRoutes); // No CSRF for public config
app.use('/api/about-content', apiLimiter, aboutContentRoutes); // No CSRF for public GET, CSRF on PUT via middleware
```

**Patch mínimo:**
```typescript
app.use('/api/config', csrfVerifyToken, apiLimiter, configRoutes);
app.use('/api/about-content', csrfVerifyToken, apiLimiter, aboutContentRoutes);
```

> **Nota:** `csrfVerifyToken` já ignora GET/HEAD/OPTIONS (ver `csrf.ts` L40-42), então os endpoints públicos GET continuam funcionando normalmente. Só PUT/POST/DELETE serão protegidos.

**Validação:**
```bash
# 1. Sem token CSRF — deve retornar 403
curl -X PUT http://localhost:3000/api/config \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"restaurant_name":"Test"}' \
  -w "\n%{http_code}"
# Esperado: 403 "CSRF token missing"

# 2. Com token CSRF — deve funcionar
CSRF=$(curl -s http://localhost:3000/api/csrf-token -c - | grep csrf_token | awk '{print $NF}')
curl -X PUT http://localhost:3000/api/config \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -b "csrf_token=$CSRF" \
  -d '{"restaurant_name":"Test"}' \
  -w "\n%{http_code}"
# Esperado: 200
```

**Branch:** `main` (security fix)

---

### ✅ TAREFA 0.2 — Config route: ForbiddenError ao invés de throw Error (H-02)

**Severidade:** 🟠 HIGH  
**Problema:** Quando um admin Essential tenta salvar PRO keys, `config.ts` faz `throw new Error(...)`. O errorHandler trata como erro genérico → retorna **500 "Erro interno do servidor"** ao invés de **403** com mensagem explicativa.  
**Arquivo:** `server/src/routes/config.ts` — linhas 93-97  
**Tempo:** 5 min

**Trecho atual (L8, L93-97):**
```typescript
// L8: imports atuais
import { getCurrentPlan, isProConfigKey } from '../middlewares/plan';

// L93-97:
const proKeysAttempted = Object.keys(data).filter(k => isProConfigKey(k));
if (proKeysAttempted.length > 0 && plan !== 'professional') {
    throw new Error(
        `As chaves [${proKeysAttempted.join(', ')}] requerem o Plano Profissional.`
    );
}
```

**Patch mínimo:**

1. Adicionar import de `ForbiddenError`:
```typescript
// Mudar L8 de:
import { getCurrentPlan, isProConfigKey } from '../middlewares/plan';
// Para:
import { getCurrentPlan, isProConfigKey } from '../middlewares/plan';
import { ForbiddenError } from '../utils/errors';
```

2. Trocar `throw new Error` por `throw new ForbiddenError`:
```typescript
// Mudar L95-97 de:
    throw new Error(
        `As chaves [${proKeysAttempted.join(', ')}] requerem o Plano Profissional.`
    );
// Para:
    throw new ForbiddenError(
        `As chaves [${proKeysAttempted.join(', ')}] requerem o Plano Profissional.`
    );
```

**Validação:**
```bash
# Com plan=essential, tentar enviar logo_url
curl -X PUT http://localhost:3000/api/config \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -b "csrf_token=$CSRF" \
  -d '{"logo_url":"https://example.com/logo.png"}' \
  -w "\n%{http_code}"
# ANTES: 500 "Erro interno do servidor"
# DEPOIS: 403 "As chaves [logo_url] requerem o Plano Profissional."
```

**Branch:** `main`

---

### ✅ TAREFA 0.3 — GET /api/config vaza PRO keys para público (H-03)

**Severidade:** 🟠 HIGH  
**Problema:** O endpoint público `GET /api/config` retorna TODOS os configs do banco, incluindo `logo_url`, `brand_color`, `favicon_url` e até `site_plan`. No plano Essential, esses valores PRO não deveriam ser expostos.  
**Arquivo:** `server/src/routes/config.ts` — linhas 72-79  
**Tempo:** 10 min

**Trecho atual (L72-79):**
```typescript
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const configs = await prisma.siteConfig.findMany();
        const configMap: Record<string, string> = {};
        configs.forEach((c: { key: string; value: string }) => { configMap[c.key] = c.value; });
        res.json({ success: true, data: configMap });
    } catch (error) {
        next(error);
    }
});
```

**Patch mínimo:**
```typescript
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const plan = await getCurrentPlan();
        const configs = await prisma.siteConfig.findMany();
        const configMap: Record<string, string> = {};
        configs.forEach((c: { key: string; value: string }) => {
            // Hide internal keys from public response
            if (c.key === 'site_plan') return;
            // Hide PRO-only values on Essential plan
            if (plan !== 'professional' && isProConfigKey(c.key)) return;
            configMap[c.key] = c.value;
        });
        res.json({ success: true, data: configMap });
    } catch (error) {
        next(error);
    }
});
```

**Validação:**
```bash
# Com plan=essential
curl -s http://localhost:3000/api/config | python3 -m json.tool

# ANTES: response contém "logo_url", "brand_color", "favicon_url", "site_plan"
# DEPOIS: response NÃO contém essas chaves

# Com plan=professional (alterar no DB e repetir)
# DEPOIS: response contém "logo_url", "brand_color", "favicon_url" mas NÃO "site_plan"
```

**Branch:** `main`

---

## FASE 1 — Correções de Alta Prioridade (deploy seguro)

> Tempo total estimado: **45 minutos**  
> Branch: **`main`** ou **`fix/security-hardening`**

---

### ✅ TAREFA 1.1 — Webhook exempt de CSRF (M-01)

**Severidade:** 🟡 MEDIUM  
**Problema:** `app.use('/api/checkout', csrfVerifyToken, ...)` aplica CSRF a TODAS as sub-rotas, incluindo `POST /api/checkout/webhook`. Stripe envia POST sem cookies CSRF → webhook falha silenciosamente com 403.  
**Arquivo:** `server/src/app.ts` — linha 168  
**Tempo:** 10 min

**Trecho atual (L168):**
```typescript
app.use('/api/checkout', csrfVerifyToken, apiLimiter, checkoutRoutes);
```

**Patch mínimo — opção A (rota separada):**
```typescript
// Webhook BEFORE csrfVerifyToken — Stripe has its own signature verification
app.use('/api/checkout/webhook', apiLimiter, checkoutRoutes);
app.use('/api/checkout', csrfVerifyToken, apiLimiter, checkoutRoutes);
```

**Patch mínimo — opção B (CSRF condicional dentro do route):**  
Criar um wrapper middleware que skip CSRF para `/webhook`:
```typescript
import { Request, Response, NextFunction } from 'express';

function csrfUnlessWebhook(req: Request, res: Response, next: NextFunction) {
    if (req.path === '/webhook') return next(); // Stripe has own sig verify
    return csrfVerifyToken(req, res, next);
}

app.use('/api/checkout', csrfUnlessWebhook, apiLimiter, checkoutRoutes);
```

**Validação:**
```bash
# Simular Stripe webhook (sem CSRF token)
curl -X POST http://localhost:3000/api/checkout/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: fake_sig" \
  -d '{"type":"checkout.session.completed"}' \
  -w "\n%{http_code}"
# ANTES: 403 "CSRF token missing"
# DEPOIS: 400 "Webhook signature verification failed" (correto — Stripe sig check funciona)
```

**Branch:** `main`

---

### ✅ TAREFA 1.2 — PUT about-content response filtra team_members (M-02)

**Severidade:** 🟡 MEDIUM  
**Problema:** Após salvar dados via PUT, a response retorna TODOS os about dados, incluindo `team_members`, sem filtrar pelo plan. Admin no Essential consegue ver team data no response JSON (embora não consiga editar).  
**Arquivo:** `server/src/routes/aboutContent.ts` — linhas 141-149  
**Tempo:** 5 min

**Trecho atual (L135-149):**
```typescript
        // Return updated data
        const configs = await prisma.siteConfig.findMany({
            where: { key: { in: ABOUT_KEYS } },
        });

        const result: Record<string, unknown> = {};
        configs.forEach((c: { key: string; value: string }) => {
            try {
                result[c.key] = JSON.parse(c.value);
            } catch {
                result[c.key] = c.value;
            }
        });

        res.json({ success: true, data: result });
```

**Patch mínimo:**
```typescript
        // Return updated data
        const configs = await prisma.siteConfig.findMany({
            where: { key: { in: ABOUT_KEYS } },
        });

        const result: Record<string, unknown> = {};
        configs.forEach((c: { key: string; value: string }) => {
            try {
                result[c.key] = JSON.parse(c.value);
            } catch {
                result[c.key] = c.value;
            }
        });

        // Filter PRO keys on Essential plan (same as GET handler)
        if (plan !== 'professional') {
            delete result.team_members;
        }

        res.json({ success: true, data: result });
```

**Validação:**
```bash
# Com plan=essential, salvar about_features
curl -X PUT http://localhost:3000/api/about-content \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -b "csrf_token=$CSRF" \
  -d '{"about_features":[{"icon":"🍕","title":"Artesanal","description":"Feito com amor"}]}' \
  -s | python3 -m json.tool

# ANTES: response contém "team_members": [...]
# DEPOIS: response NÃO contém "team_members"
```

**Branch:** `main`

---

### ✅ TAREFA 1.3 — Sanitizar URL em document.write do QR (M-03)

**Severidade:** 🟡 MEDIUM  
**Problema:** `printQRCode()` insere a URL do input diretamente via template literal em `document.write()` sem escaping. Se o admin digitar `<script>alert(1)</script>` no campo URL, será injetado no print window.  
**Arquivo:** `public/admin.html` — linha 1882  
**Tempo:** 5 min

**Trecho atual (L1869-1882):**
```javascript
const url = document.getElementById('qr-url').value || window.location.origin;
const printWindow = window.open('', '_blank');
printWindow.document.write(`
    ...
    <p>${url}</p>
    ...
`);
```

**Patch mínimo:**
```javascript
const rawUrl = document.getElementById('qr-url').value || window.location.origin;
const url = escapeHTML(rawUrl);
const printWindow = window.open('', '_blank');
printWindow.document.write(`
    ...
    <p>${url}</p>
    ...
`);
```

> `escapeHTML()` já está definida no admin.html (L803). Basta usá-la.

**Validação:**
1. Abrir admin → aba QR Code
2. No campo URL, digitar: `<img src=x onerror=alert(1)>`
3. Clicar "Imprimir"
4. **ANTES:** alert(1) executa no print window
5. **DEPOIS:** texto literal aparece `<img src=x onerror=alert(1)>` (escapado)

**Branch:** `main`

---

### ✅ TAREFA 1.4 — Remover import morto em plan.ts (L-02)

**Severidade:** 🟢 LOW  
**Problema:** `PRO_CONFIG_KEYS` e `PRO_ABOUT_KEYS` são importados em `plan.ts` route mas nunca usados no response (foram removidos em fix anterior). Dead import.  
**Arquivo:** `server/src/routes/plan.ts` — linha 6  
**Tempo:** 2 min

**Trecho atual (L6):**
```typescript
import { getCurrentPlan, PRO_CONFIG_KEYS, PRO_ABOUT_KEYS } from '../middlewares/plan';
```

**Patch mínimo:**
```typescript
import { getCurrentPlan } from '../middlewares/plan';
```

**Validação:**
```powershell
cd F:\VSCode\Landpage\server
npx tsc --noEmit
# Esperado: zero erros
```

**Branch:** `main`

---

## FASE 2 — Correções de Média Prioridade (UX + hardening)

> Tempo total estimado: **1-2 horas**  
> Branch: **`feature/security-hardening`**

---

### ✅ TAREFA 2.1 — Remover uptime do /healthz (L-03)

**Severidade:** 🟢 LOW  
**Problema:** `process.uptime()` expõe há quanto tempo o servidor está rodando — info leak menor.  
**Arquivo:** `server/src/app.ts` — linha 142-146  
**Tempo:** 2 min

**Trecho atual:**
```typescript
app.get('/healthz', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
```

**Patch mínimo:**
```typescript
app.get('/healthz', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});
```

**Validação:**
```bash
curl -s http://localhost:3000/healthz | python3 -m json.tool
# ANTES: { "status": "ok", "timestamp": "...", "uptime": 12345.678 }
# DEPOIS: { "status": "ok", "timestamp": "..." }
```

**Branch:** `feature/security-hardening`

---

### ✅ TAREFA 2.2 — Limpar .env.example (L-04)

**Severidade:** 🟢 LOW  
**Problema:** `.env.example` contém `ADMIN_PASSWORD=Admin@123456` que pode ser confundido com credencial real. Keys `ADMIN_EMAIL` e `ADMIN_PASSWORD` não são consumidas por código (orphan).  
**Arquivo:** `server/.env.example` — linhas 44-45  
**Tempo:** 3 min

**Patch mínimo:**
```dotenv
# Mudar de:
ADMIN_EMAIL=admin@fluxpay.com.br
ADMIN_PASSWORD=Admin@123456

# Para:
# --- Admin seed (optional — overrides default seed password) ---
# SEED_ADMIN_PASSWORD=YourStrongPassword123!
```

**Validação:** Verificar que `npx prisma db seed` ainda funciona (usa `SEED_ADMIN_PASSWORD` como fallback, não `ADMIN_PASSWORD`).

**Branch:** `feature/security-hardening`

---

### ✅ TAREFA 2.3 — Alinhar validação PLAN nos seeds secundários (L-05)

**Severidade:** 🟢 LOW  
**Problema:** `seed-hamburgueria.ts` e `seed-pizzaria.ts` não alertam quando o valor de `PLAN` é inválido (ex: `PLAN=premium`). O seed principal (`seed.ts`) faz `console.warn()`. Inconsistência.  
**Arquivo:** `server/prisma/seed-hamburgueria.ts`, `server/prisma/seed-pizzaria.ts`  
**Tempo:** 5 min

**Patch mínimo (aplicar nos dois arquivos):**

Procurar o bloco de leitura de PLAN e adicionar validação:
```typescript
// Onde tiver algo como:
const plan = process.env.PLAN === 'professional' ? 'professional' : 'essential';

// Substituir por:
const rawPlan = process.env.PLAN || 'essential';
const plan = rawPlan === 'professional' ? 'professional' : 'essential';
if (rawPlan && rawPlan !== 'essential' && rawPlan !== 'professional') {
    console.warn(`⚠️  PLAN="${rawPlan}" não é válido. Usando "essential".`);
}
```

**Validação:**
```powershell
cd F:\VSCode\Landpage\server
$env:PLAN = "premium"
npx prisma db seed
# Esperado: warning "PLAN=premium não é válido. Usando essential."
```

**Branch:** `feature/security-hardening`

---

### ✅ TAREFA 2.4 — Tighten CSP imgSrc (M-04 parcial)

**Severidade:** 🟡 MEDIUM  
**Problema:** `imgSrc: ["'self'", "data:", "blob:", "https:", "*"]` — wildcard `*` torna a restrição ineficaz.  
**Arquivo:** `server/src/app.ts` — linha 50  
**Tempo:** 5 min

**Trecho atual:**
```typescript
imgSrc: ["'self'", "data:", "blob:", "https:", "*"],
```

**Patch mínimo:**
```typescript
imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://*.unsplash.com", "https://via.placeholder.com"],
```

> Adapte os domínios aos que você efetivamente usa para imagens. Se usar CDN externo, adicione.

**Validação:** Abrir site, verificar que todas as imagens carregam (Console → sem erros CSP para imagens).

**Branch:** `feature/security-hardening`

---

### ✅ TAREFA 2.5 — Docker: bind ports a localhost (L-06)

**Severidade:** 🟢 LOW  
**Problema:** Docker-compose expõe PostgreSQL (5432) e Redis (6379) em todas as interfaces. Se copiado para produção, qualquer IP pode conectar.  
**Arquivo:** `docker-compose.yml`, `docker-compose.dev.yml`  
**Tempo:** 5 min

**Patch mínimo (em ambos os arquivos):**
```yaml
# Mudar de:
ports:
  - "5432:5432"
# Para:
ports:
  - "127.0.0.1:5432:5432"

# Mudar de:
ports:
  - "6379:6379"
# Para:
ports:
  - "127.0.0.1:6379:6379"
```

**Validação:**
```powershell
docker compose up -d
# De outro PC na rede, tentar: psql -h <ip-do-host> -p 5432
# ANTES: conexão aceita
# DEPOIS: connection refused
```

**Branch:** `feature/security-hardening`

---

## FASE 3 — Melhorias Cosméticas e Backlog (LOW)

> Tempo total estimado: **30-60 minutos**  
> Branch: **`feature/improvements`**

---

### ✅ TAREFA 3.1 — Substituir inline onclick por data-attributes (L-01)

**Severidade:** 🟢 LOW  
**Problema:** `onclick='editDish(${JSON.stringify(d).replace(/'/g, "&#39;")})` é um edge-case XSS se o banco for comprometido. Melhor prática: usar `data-*` attributes + `addEventListener`.  
**Arquivo:** `public/admin.html` — linhas 1072, 1165  
**Tempo:** 20 min

**Patch mínimo (exemplo para dishes, L1072):**
```html
<!-- ANTES: -->
<button onclick='editDish(${JSON.stringify(d).replace(/'/g, "&#39;")})'>Editar</button>

<!-- DEPOIS: -->
<button data-action="edit-dish" data-dish-id="${escapeAttr(String(d.id))}">Editar</button>
```

```javascript
// Adicionar após renderizar o HTML:
document.querySelectorAll('[data-action="edit-dish"]').forEach(btn => {
    btn.addEventListener('click', () => {
        const dishId = Number(btn.dataset.dishId);
        const dish = allDishes.find(d => d.id === dishId);
        if (dish) editDish(dish);
    });
});
```

> Mesma lógica para `editCategory` na L1165.

**Validação:** Abrir admin → aba Cardápio → clicar "Editar" em qualquer prato. Modal deve abrir com dados preenchidos.

**Branch:** `feature/improvements`

---

### ✅ TAREFA 3.2 — Considerar httpOnly cookies para JWT (M-05)

**Severidade:** 🟡 MEDIUM (arquitetural — não urgente)  
**Problema:** JWT tokens em `localStorage` são acessíveis a qualquer JS no mesmo origin. Se existir XSS (mesmo via extensão do browser), os tokens podem ser roubados.  
**Arquivo:** `public/admin.html` L968-969, `server/src/routes/auth.ts`  
**Tempo:** 2-3 horas (mudança arquitetural)

**Análise:** Esta é uma mudança de arquitetura significativa (BFF pattern ou httpOnly cookie). O risco é **mitigado** pelo fato de que:
- Access token tem TTL curto (15m)
- Refresh token é SHA-256 hashed no banco
- Todas as innerHTML usam `escapeHTML()` — XSS improvável
- CSP existe (embora com `unsafe-inline`)

**Recomendação:** Documentar como dívida técnica. Priorizar apenas se remover `unsafe-inline` do CSP (o que reduziria o risco a quase zero de qualquer forma).

**Branch:** `feature/auth-httponly-cookies` (futuro)

---

## RESUMO POR FASE

| Fase | Issues | Tempo | Branch |
|------|--------|-------|--------|
| **Fase 0** | H-01, H-02, H-03 | ~30 min | `main` |
| **Fase 1** | M-01, M-02, M-03, L-02 | ~25 min | `main` |
| **Fase 2** | L-03, L-04, L-05, M-04, L-06 | ~20 min | `feature/security-hardening` |
| **Fase 3** | L-01, M-05 | ~30 min+ | `feature/improvements` |
| **Total** | **14 issues** | **~2h** | — |

---

## COMANDOS DE EXECUÇÃO RÁPIDA

### Fazer backup antes de começar:
```powershell
cd F:\VSCode\Landpage
git checkout -b audit-final
git add .
git commit -m "backup: pre-audit corrections"
git checkout main
```

### Após Fase 0 + 1:
```powershell
cd F:\VSCode\Landpage\server
npx tsc --noEmit
# Esperado: zero erros

# Testar seed Essential
$env:PLAN = "essential"
npx prisma db seed

# Testar seed Professional
$env:PLAN = "professional"
npx prisma db seed

# Verificar plan endpoint
npm run dev
# (em outro terminal)
Invoke-RestMethod -Uri "http://localhost:3000/api/plan"
Invoke-RestMethod -Uri "http://localhost:3000/healthz"
```

### Smoke test completo:
```powershell
# 1. Health
curl -s http://localhost:3000/healthz

# 2. Plan
curl -s http://localhost:3000/api/plan

# 3. Config (sem PRO keys no Essential)
curl -s http://localhost:3000/api/config | Select-String "logo_url"
# Esperado: SEM match no Essential

# 4. Login + CSRF
$csrf = (Invoke-RestMethod -Uri "http://localhost:3000/api/csrf-token").data.csrfToken
$loginBody = @{ email = "admin@restaurante.com"; password = "admin123" } | ConvertTo-Json
$headers = @{ "Content-Type" = "application/json"; "X-CSRF-Token" = $csrf }
$login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers $headers -Body $loginBody
$token = $login.data.accessToken

# 5. Config PUT com PRO key no Essential (deve dar 403)
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json"; "X-CSRF-Token" = $csrf }
$body = '{"logo_url":"https://test.com/logo.png"}'
try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/config" -Method PUT -Headers $headers -Body $body
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode) (esperado: 403)"
}

# 6. About PUT team_members no Essential (deve dar 403)
$body = '{"team_members":[{"name":"Test","role":"Dev"}]}'
try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/about-content" -Method PUT -Headers $headers -Body $body
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode) (esperado: 403)"
}
```

---

## CHECKLIST DE ACEITAÇÃO (NOTA 10)

Após corrigir todas as fases, verificar:

- [ ] `npx tsc --noEmit` — zero erros
- [ ] 0 issues CRÍTICOS
- [ ] 0 issues HIGH (H-01, H-02, H-03 corrigidos)
- [ ] CSRF em todas as rotas PUT admin (config, about-content)
- [ ] Config PUT retorna **403** (não 500) para PRO keys no Essential
- [ ] `GET /api/config` NÃO retorna `logo_url`/`brand_color`/`favicon_url`/`site_plan` no Essential
- [ ] PUT about-content response filtra `team_members` por plan
- [ ] Webhook exempt de CSRF
- [ ] `document.write` sanitiza URL com `escapeHTML()`
- [ ] Imports mortos removidos de `plan.ts`
- [ ] Seed testado com `PLAN=essential` ✅
- [ ] Seed testado com `PLAN=professional` ✅
- [ ] Seed com `PLAN=invalid` mostra warning ✅
- [ ] `tokenVersion` incrementado em password change ✅ (já OK)
- [ ] Upload validado (MIME + ext + magic bytes) ✅ (já OK)
- [ ] bcrypt 12 rounds ✅ (já OK)
- [ ] Rate limit em auth ✅ (já OK)
- [ ] Stripe webhook signature ✅ (já OK)
- [ ] `/healthz` retorna 200 ✅ (já OK)
- [ ] Docker ports bound a 127.0.0.1
- [ ] `.env.example` limpo (sem passwords fake)
