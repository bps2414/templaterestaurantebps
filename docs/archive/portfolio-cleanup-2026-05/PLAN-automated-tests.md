# PLAN — Testes Automatizados
> Status: ATIVO — executar antes da Fase 6

## Contexto

| Item | Estado |
|------|--------|
| Test runner | Jest + Supertest (`npm test` em `server/`) |
| Cobertura atual | 1 arquivo — `health.test.ts` (GET /healthz → 200) |
| E2E existente | `tests/e2e_flows.py` — Playwright Python, só cobre restaurante |
| DB de testes | `restaurant_test_preflight` (localhost:5432, postgres/postgres) |
| Aviso conhecido | `--forceExit` cobre 2 `setInterval` abertos em `authService.ts` |

---

## Estratégia: 3 Camadas

```
Camada 1 — Unit/Route Tests (Jest + Supertest) — server/src/__tests__/
  Mocks: prisma e middlewares via jest.mock
  Foco: lógica de negócio, limites de plano, controle de acesso

Camada 2 — Integration Tests (Jest + DB real)
  Rodar contra restaurant_test_preflight
  Foco: fluxo seed → contagem no DB → API responde corretamente

Camada 3 — E2E Tests (Python Playwright)
  Arquivo: tests/e2e_flows.py
  Foco: UI dos 4 temas lite, login admin, renderização de páginas
```

---

## Prioridades

| # | Arquivo de Teste | Por que é crítico |
|---|---|---|
| P0 | `plan.middleware.test.ts` | Valida os limites do Starter (5 cat / 30 pratos) — core da Fase 6 |
| P0 | `categories.test.ts` | Testa gating real via POST /api/categories |
| P0 | `dishes.test.ts` | Testa gating real via POST /api/dishes |
| P1 | `auth.test.ts` | Login, token, roles — base de todos os outros testes |
| P1 | `plan.route.test.ts` | GET /api/plan retorna feature flags corretas por plano |
| P2 | `gallery.test.ts` | Starter → 403 em rotas de galeria |
| P2 | `aboutContent.test.ts` | Starter → 403 em rotas de about |
| P3 | E2E `e2e_flows.py` | Multi-tema: 4 temas lite + admin login |

---

## Arquitetura de Mocks

### Mock padrão: prisma client

```typescript
// No topo de cada arquivo de teste
jest.mock('../prisma/client', () => ({
    __esModule: true,
    default: {
        siteConfig: { findUnique: jest.fn(), upsert: jest.fn() },
        category: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
        dish: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
        adminUser: { findUnique: jest.fn() },
        $disconnect: jest.fn(),
        $queryRaw: jest.fn().mockResolvedValue([1]),
    },
}));
```

### Mock de auth middleware (para testar rotas protegidas)

```typescript
// Helper: gera Bearer token de teste sem DB
import jwt from 'jsonwebtoken';

export function makeTestToken(role: 'ADMIN' | 'SUPERADMIN' = 'ADMIN') {
    return jwt.sign(
        { userId: 'test-user-id', email: 'test@test.com', role, tokenVersion: 0 },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
    );
}
```

> **Importante:** `requireAuth` verifica `tokenVersion` no DB. Mockear `prisma.adminUser.findUnique` retornando `{ tokenVersion: 0 }` para o token de teste funcionar.

---

## Detalhamento dos Testes

---

### `server/src/__tests__/plan.middleware.test.ts` (P0)

**Dependências mockadas:** `prisma.siteConfig.findUnique`

```
SUITE: getCurrentPlan()
  ✅ retorna 'starter' quando DB tem site_plan = 'starter'
  ✅ retorna 'essential' quando DB tem site_plan = 'essential'
  ✅ retorna 'professional' quando DB tem site_plan = 'professional'
  ✅ retorna 'essential' (default) quando configuração não existe (null)
  ✅ retorna 'essential' (fallback) quando DB lança erro (catch)
  ✅ ignora valor inválido (ex: 'premium') e retorna 'essential'

SUITE: STARTER_LIMITS constants
  ✅ STARTER_LIMITS.maxDishes === 30
  ✅ STARTER_LIMITS.maxCategories === 5

SUITE: isProfessional()
  ✅ retorna true quando plano é 'professional'
  ✅ retorna false quando plano é 'starter'
  ✅ retorna false quando plano é 'essential'

SUITE: isStarter()
  ✅ retorna true quando plano é 'starter'
  ✅ retorna false quando plano é 'essential'
```

---

### `server/src/__tests__/categories.test.ts` (P0)

**Dependências mockadas:** `prisma.category.*`, `prisma.adminUser.findUnique`, `prisma.siteConfig.findUnique`

```
SUITE: GET /api/categories (público)
  ✅ 200 — retorna lista de categorias ativas com seus pratos
  ✅ 200 — lista vazia quando não há categorias

SUITE: GET /api/categories/all (admin)
  ✅ 401 — sem token
  ✅ 200 — com token admin válido, retorna todas as categorias

SUITE: POST /api/categories — Starter Plan Gating
  ✅ 403 — plano starter + count >= 5 → erro com mensagem clara
  ✅ 201 — plano starter + count = 4 → criação permitida
  ✅ 201 — plano essential + count = 10 → sem limite, criação permitida
  ✅ 401 — sem autenticação

SUITE: POST /api/categories — Validação Zod
  ✅ 400 — nome com menos de 2 caracteres
  ✅ 400 — nome com mais de 100 caracteres

SUITE: PUT /api/categories/:id
  ✅ 401 — sem token
  ✅ 200 — atualização válida (verifica slug recalculado)
  ✅ 404 — ID inexistente

SUITE: DELETE /api/categories/:id
  ✅ 401 — sem token
  ✅ 200 — deleção com sucesso
  ✅ 404 — ID inexistente
```

---

### `server/src/__tests__/dishes.test.ts` (P0)

**Dependências mockadas:** `prisma.dish.*`, `prisma.category.*`, `prisma.adminUser.findUnique`, `prisma.siteConfig.findUnique`

```
SUITE: GET /api/dishes (público)
  ✅ 200 — lista de pratos ativos com categoria
  ✅ 200 — lista vazia

SUITE: GET /api/dishes/featured (público)
  ✅ 200 — só retorna featured: true

SUITE: POST /api/dishes/validate-prices (público)
  ✅ 400 — ids não é array
  ✅ 400 — array vazio
  ✅ 400 — array com mais de 50 itens
  ✅ 200 — retorna preços esperados para IDs válidos

SUITE: POST /api/dishes — Starter Plan Gating
  ✅ 403 — plano starter + count >= 30 → bloqueado
  ✅ 201 — plano starter + count = 29 → criação permitida
  ✅ 201 — plano essential + count = 100 → sem limite
  ✅ 401 — sem autenticação

SUITE: POST /api/dishes — Validação Zod
  ✅ 400 — preço não positivo (price: 0)
  ✅ 400 — categoryId não é UUID válido
  ✅ 400 — nome muito curto (< 2 chars)
```

---

### `server/src/__tests__/auth.test.ts` (P1)

**Dependências mockadas:** `prisma.adminUser.*`, `authService` (parcialmente)

```
SUITE: POST /api/auth/login
  ✅ 200 — credenciais válidas → retorna accessToken + refreshToken
  ✅ 400 — email inválido (não é email)
  ✅ 400 — senha muito curta (< 6 chars)
  ✅ 401 — senha incorreta → sem vazar se o usuário existe

SUITE: POST /api/auth/refresh
  ✅ 400 — sem refreshToken no body
  ✅ 401 — refreshToken inválido/expirado

SUITE: GET /api/auth/me
  ✅ 401 — sem Authorization header
  ✅ 401 — token malformado
  ✅ 401 — tokenVersion divergente (sessão invalidada)
  ✅ 200 — token válido → retorna dados do usuário

SUITE: POST /api/auth/change-password
  ✅ 401 — sem autenticação
  ✅ 400 — newPassword fraca (sem maiúscula, sem número)
  ✅ 400 — senhas não conferem
```

---

### `server/src/__tests__/plan.route.test.ts` (P1)

**Dependências mockadas:** `prisma.siteConfig.findUnique`

```
SUITE: GET /api/plan
  ✅ 200 starter — retorna { plan: 'starter', isStarter: true, isProfessional: false,
                             features: { maxDishes: 30, maxCategories: 5, gallery: false, ... } }
  ✅ 200 essential — retorna { plan: 'essential', isStarter: false, isProfessional: false,
                               features: { maxDishes: null, maxCategories: null, gallery: true, ... } }
  ✅ 200 professional — retorna isProfessional: true, features completo
```

---

### `server/src/__tests__/gallery.test.ts` (P2)

```
SUITE: Starter Plan Bloqueio
  ✅ GET /api/gallery — starter → 403
  ✅ POST /api/gallery — starter + admin auth → 403

SUITE: Essential/Pro Permitido
  ✅ GET /api/gallery — essential → 200
  ✅ POST /api/gallery — essential + admin auth → aceita upload
```

---

### `server/src/__tests__/aboutContent.test.ts` (P2)

```
SUITE: Starter Plan Bloqueio
  ✅ GET /api/about-content — starter → 403
  ✅ PUT /api/about-content — starter + admin auth → 403

SUITE: Pro Plan PRO_ABOUT_KEYS
  ✅ PUT /api/about-content com team_members — non-pro → 403
  ✅ PUT /api/about-content com team_members — pro → 200
```

---

## Camada 2 — Testes de Integração (com DB real)

> Executados separadamente via `npm run test:integration`  
> Usa `DATABASE_URL` apontando para `restaurant_test_preflight`

### Strategy: seed → assert

```
Para cada tema lite:
  1. Rodar seed (SEED_TYPE={tema})
  2. Consultar DB: contar categorias, pratos, admin users
  3. Verificar limites do starter (seeds devem respeitar 5 cat / 30 pratos)
  4. Verificar site_plan = 'starter' no SiteConfig

Temas: restaurant-lite, burger-lite, pizza-lite, acai
```

**Arquivo: `server/src/__tests__/integration/seeds.integration.test.ts`**

```
SUITE: restaurant-lite seed
  ✅ exatamente 5 categorias criadas
  ✅ <= 30 pratos criados
  ✅ SiteConfig site_plan = 'starter'
  ✅ admin user admin@restaurante.com existe

SUITE: burger-lite seed
  ✅ <= 4 categorias criadas
  ✅ <= 30 pratos criados
  ✅ admin user admin@lanchonete.com existe

SUITE: pizza-lite seed
  ✅ <= 5 categorias criadas
  ✅ <= 30 pratos criados
  ✅ admin user admin@pizzaria.com existe

SUITE: acai seed
  ✅ <= 5 categorias criadas
  ✅ <= 30 pratos criados
  ✅ admin user admin@acai.com existe
```

---

## Camada 3 — E2E Multi-Tema (Playwright Python)

### Mudanças no `tests/e2e_flows.py`

**Problema atual:** URL e admin hardcoded para o tema restaurante.  
**Solução:** Aceitar parâmetros via `--url` e `--admin-email`.

```python
# Uso:
# python tests/e2e_flows.py --url http://localhost:3000 --admin-email admin@restaurante.com
# python tests/e2e_flows.py --url http://localhost:3000 --admin-email admin@lanchonete.com
```

**Estrutura refatorada:**
```python
THEME_CONFIGS = [
    {"name": "restaurant-lite",  "admin": "admin@restaurante.com"},
    {"name": "burger-lite",      "admin": "admin@lanchonete.com"},
    {"name": "pizza-lite",       "admin": "admin@pizzaria.com"},
    {"name": "acai",             "admin": "admin@acai.com"},
]
```

**Casos de teste por tema:**
```
✅ index.html carrega (networkidle)
✅ menu.html carrega e exibe cards de pratos
✅ contact.html renderiza corretamente
✅ admin.html → redireciona para login se não autenticado
✅ Admin Login: email+senha corretos → dashboard visível
✅ Admin Dashboard: seção de categorias acessível
✅ Gallery: se starter → tab ausente ou 403 na requisição
✅ Zero links buy.html no HTML público (verifica remoção do Stripe)
```

---

## Setup Utilitários

### Arquivo: `server/src/__tests__/helpers/testUtils.ts`

```typescript
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

export function makeTestToken(
    role: 'ADMIN' | 'SUPERADMIN' = 'ADMIN',
    tokenVersion = 0
): string {
    return jwt.sign(
        { userId: 'test-user-id', email: 'test@test.com', role, tokenVersion },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
}

export function mockPrismaUser(tokenVersion = 0) {
    return { tokenVersion };
}

export type MockPrisma = {
    [K in keyof PrismaClient]: jest.Mocked<PrismaClient[K]>;
};
```

### Variáveis de Ambiente para Testes

Adicionar `server/.env.test`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/restaurant_test_preflight
JWT_SECRET=test-secret-not-for-production
JWT_REFRESH_SECRET=test-refresh-secret
NODE_ENV=test
```

---

## Ordem de Implementação

```
Semana 1 — P0 (crítico para Fase 6)
  [ ] server/src/__tests__/helpers/testUtils.ts
  [ ] server/src/__tests__/plan.middleware.test.ts
  [ ] server/src/__tests__/categories.test.ts
  [ ] server/src/__tests__/dishes.test.ts

Semana 1 — P1 (base de segurança)
  [ ] server/src/__tests__/auth.test.ts
  [ ] server/src/__tests__/plan.route.test.ts

Semana 2 — P2
  [ ] server/src/__tests__/gallery.test.ts
  [ ] server/src/__tests__/aboutContent.test.ts

Semana 2 — P3 (E2E)
  [ ] Refatorar tests/e2e_flows.py para aceitar params
  [ ] Adicionar loops multi-tema
  [ ] server/src/__tests__/integration/seeds.integration.test.ts
```

---

## Cobertura Esperada Após Implementação

| Módulo | Antes | Depois |
|--------|-------|--------|
| `middlewares/plan.ts` | 0% | ~90% |
| `routes/categories.ts` | 0% | ~85% |
| `routes/dishes.ts` | 0% | ~80% |
| `routes/auth.ts` | 0% | ~75% |
| `routes/plan.ts` | 0% | ~90% |
| `routes/gallery.ts` | 0% | ~70% |
| `routes/aboutContent.ts` | 0% | ~70% |
| **Total** | **~5%** | **~80%** |

---

## Integração com preflight.ps1

Após implementar os testes, o preflight já executa `npm test` automaticamente. O resultado aparecerá no bloco PASS/FAIL. Nenhuma mudança necessária no script.

Para rodar apenas os testes unitários sem o DB:
```
cd server; npm test -- --testPathPattern="(?<!integration)\.test\.ts$"
```

Para rodar só integração:
```
cd server; npm test -- --testPathPattern="integration"
```
