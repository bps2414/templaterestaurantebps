# CHECKUP GERAL — Temas Lite (Starter Plan)

> **Status atual:** Todos os 4 admin.html estão com os bugs de backend corrigidos. Este plano cobre os pontos restantes necessários para colocar os temas lite em produção e vendê-los com a mesma confiança dos temas padrão (code-freeze).

**Temas alvo:** `restaurant-lite` · `burger-lite` · `pizza-lite` · `acai`  
**Referência:** Temas padrão `restaurante` · `hamburgueria` · `pizzaria` (code-freeze)  
**Prioridade de execução:** Fases em ordem — cada fase é pré-requisito da próxima.

---

## Mapa de Status Inicial

| Item | restaurant-lite | burger-lite | pizza-lite | acai |
|---|:---:|:---:|:---:|:---:|
| admin.html — Auth (Bearer/CSRF/refresh) | ✅ | ✅ | ✅ | ✅ |
| admin.html — Store toggle correto | ✅ | ✅ | ✅ | ✅ |
| admin.html — Dish CRUD + preço (Math.round) | ✅ | ✅ | ✅ | ✅ |
| admin.html — Config snake_case | ✅ | ✅ | ✅ | ✅ |
| admin.html — Limites DISH_LIMIT=30 / CAT_LIMIT=5 | ✅ | ✅ | ✅ | ✅ |
| admin.html — Sem abas Gallery/Sobre | ✅ | ✅ | ✅ | ✅ |
| favicon.svg | ❌ | ❌ | ❌ | ❌ |
| Twitter Card meta tags (index.html) | ❌ | ❌ | ❌ | ❌ |
| Twitter Card meta tags (menu.html) | ❌ | ❌ | ❌ | ❌ |
| og: meta tags (contact.html) | ❌ | ❌ | ❌ | ❌ |
| Google Maps embed (contact.html) | ❌ | ❌ | ❌ | ❌ |
| global-loader / config-loaded | ✅ | ? | ? | ✅ |
| _shared/js/ referenciado | ✅ | ? | ? | ✅ |
| CSS build (input.css → styles.css) | ? | ? | ? | ? |
| provision_client.js suporte a lite | ❌ | ❌ | ❌ | ❌ |
| server/package.json scripts dev/seed | ❌ | ❌ | ❌ | ❌ |
| Backend plan enforcement (Starter) | ✅ (servidor) | ✅ | ✅ | ✅ |
| Seed files | ✅ | ✅ | ✅ | ✅ |
| Testes Jest | ? | ? | ? | ? |

---

## FASE 1 — Admin Panels: Smoke Test Manual

> **Objetivo:** Confirmar que todos os 4 admin.html funcionam de ponta a ponta com uma instância real. Os bugs foram corrigidos no código; esta fase valida no browser.

**Para cada tema**: deployar localmente com `select-theme.js` + servidor + seed, e executar o checklist abaixo.

### 1.1 Fluxo de Login / Auth
- [ ] Acessar `/admin.html` sem sessão → tela de login aparece (não vai direto pro dashboard)
- [ ] Login com credenciais erradas → mensagem de erro visível, sem loop infinito
- [ ] Login correto → `Bearer` token salvo no `localStorage`, dashboard exibido
- [ ] `csrfToken` sendo obtido via `GET /admin/csrf-token` após login
- [ ] Refresh de página no dashboard → token refreshado via `POST /admin/refresh`
- [ ] Logout → tokens removidos do `localStorage`, redireciona para tela de login

### 1.2 Toggle de Loja (Store Status)
- [ ] Switch "Loja aberta / fechada" presente no dashboard
- [ ] Ao toggar: `PUT /api/config` enviado com `{ store_force_closed: true/false }`
- [ ] Refresh da página preserva o estado do toggle (lê de `/api/config` na carga)
- [ ] Página pública index.html exibe banner de fechado quando `store_force_closed: true`

### 1.3 Gestão de Pratos (CRUD)
- [ ] Lista de pratos carrega via `GET /api/dishes`
- [ ] Criar novo prato: `POST /api/dishes` com campos corretos: `name`, `description`, `price` (em centavos = `Math.round(parseFloat(priceInput) * 100)`), `category_id`, `image_url`
- [ ] Editar prato: `PUT /api/dishes/:id` com mesmos campos
- [ ] Deletar prato: `DELETE /api/dishes/:id` com confirmação
- [ ] **Limite Starter:** Ao tentar criar o 31º prato → API retorna 403 com mensagem de upgrade; admin exibe alerta
- [ ] Barra de progresso "Pratos X/30" atualiza corretamente
- [ ] Preço exibido na lista em R$ com 2 casas decimais (field em API é INT cents → `/100`)

### 1.4 Campo de Imagem (URL — Simplificação Starter)
- [ ] Campo de imagem é `<input type="url">` (não file picker do Cloudinary) — **comportamento intencional para Starter**
- [ ] URL digitada/colada salva corretamente em `image_url`
- [ ] Imagem exibida na pré-visualização e no cardápio público
- [ ] **Decisão a confirmar:** Este comportamento é aceitável para o pitch de venda, ou o cliente precisa de upload real desde o início?

### 1.5 Gestão de Categorias
- [ ] CRUD de categorias funcional
- [ ] **Limite Starter:** 6ª categoria → API retorna 403; barra de progresso "Categorias X/5" aparece
- [ ] Dishes exibidos agrupados por categoria no cardápio público

### 1.6 Configurações Gerais
- [ ] Campos carregam via `GET /api/config` na abertura da aba
- [ ] Todos os campos salvam via `PUT /api/config` com chaves snake_case:
  - `restaurant_name`, `description`, `phone`, `address`
  - `opening_hours`, `delivery_fee`, `min_order`
  - `instagram_url`, `facebook_url`
  - `primary_color` (se houver customização de cor no tema)
- [ ] Sem campos `galleryTitle`, `aboutContent`, `privacyPolicy` — abas correspondentes **não devem existir**

### 1.7 Pedidos (se aplicável)
- [ ] Confirmar se admin de temas lite tem aba de Pedidos
- [ ] Se sim: `GET /api/orders` com Bearer Token funcional
- [ ] Se não: ausência da aba é intencional para Starter (confirmar)

---

## FASE 2 — Páginas Públicas: Funcionalidades Core

> **Objetivo:** Garantir que index.html, menu.html e contact.html funcionam corretamente com dados dinâmicos do servidor.

### 2.1 Carregamento de Config (global-loader)
**Para cada tema, para cada página pública:**
- [ ] `body:not(.config-loaded)` mostra o global-loader (spinner)  
- [ ] `GET /api/config` é chamado na inicialização
- [ ] Após resposta: `document.body.classList.add('config-loaded')` chamado
- [ ] Loader some, conteúdo exibido
- [ ] `restaurant_name` dinâmico no `<title>` e header (não hardcoded)
- [ ] **Verificar:** `burger-lite` e `pizza-lite` têm o mesmo padrão de global-loader que `restaurant-lite` e `acai`

### 2.2 Cardápio Dinâmico (menu.html)
- [ ] `GET /api/dishes` e `GET /api/categories` carregam os pratos
- [ ] Pratos agrupados por categoria
- [ ] Imagens de `image_url` carregando (CDN Cloudinary ou URL externa)
- [ ] Filtro por categoria funcional
- [ ] Prato sem imagem não quebra o layout (fallback visual)

### 2.3 Carrinho e Pedido WhatsApp
- [ ] Botão "Adicionar" adiciona prato ao carrinho (`cart.js`)
- [ ] Counter do carrinho atualiza no header
- [ ] Modal de carrinho abre e exibe itens (`cartUI.js`)
- [ ] Carrinho persiste no `localStorage` entre reloads
- [ ] Botão "Fazer Pedido" formata mensagem WhatsApp (`whatsappFormatter.js`)
- [ ] Mensagem gerada inclui: nome dos itens, quantidades, total, endereço de entrega (se colhido)
- [ ] `orderModal.js` exibe campos de entrega antes de enviar pro WhatsApp
- [ ] Link `wa.me/{phone}` usa o número dinâmico do config

### 2.4 Banner de Loja Fechada (index.html + menu.html)
- [ ] Quando `store_force_closed: true` → banner visível "Estamos fechados"
- [ ] Botão de pedido desabilitado ou oculto quando fechado
- [ ] Banner some quando loja reabre

### 2.5 WhatsApp Float Button
- [ ] Botão flutuante presente em todas as páginas
- [ ] Número dinâmico do config (`phone`)
- [ ] Abre WhatsApp Web ou app mobile

### 2.6 Google Maps Embed (contact.html)
- [ ] **Gap identificado:** `contact.html` dos 4 temas lite **NÃO possui** `google_maps_embed`
- [ ] Padrão no tema `restaurante/contact.html` (linha 327-329):
  ```js
  if (c.google_maps_embed) {
    const iframe = document.getElementById('google-map');
    if (iframe) iframe.src = c.google_maps_embed;
  }
  ```
- [ ] **Decisão:** Incluir iframe de mapa dinâmico no contact.html dos temas lite (recomendado para parity com padrão) ou aceitar ausência para Starter?
- [ ] Se incluir: adicionar `<iframe id="google-map">` + JS de config loading

### 2.7 Formulário de Contato (contact.html)
- [ ] Formulário de contato presente
- [ ] Submit envia para endpoint ou exibe dados de contato
- [ ] Validação de campos (nome, email/phone, mensagem) — `formValidation.js` usado
- [ ] Mensagem de sucesso após envio
- [ ] **Verificar:** endpoint de formulário está implementado no servidor ou envio é via WhatsApp/mailto?

### 2.8 Acessibilidade e UX Básica
- [ ] `a11y.js` presente e ativo em todas as páginas
- [ ] `mobile.js` presente (menu hamburguer, scroll behavior)
- [ ] `feedback.js` presente (toast/snackbar de feedback de ações)
- [ ] Testar em mobile (375px) — layout responsivo sem overflow horizontal
- [ ] Testar em desktop (1280px) — sem elementos quebrados

---

## FASE 3 — SEO / Meta Tags ✅ CONCLUÍDA

> **Objetivo:** Paridade de SEO com temas padrão antes de colocar no ar para clientes.

### 3.1 Open Graph (og:) — ✅ RESOLVIDO

| Página | restaurant-lite | burger-lite | pizza-lite | acai |
|---|:---:|:---:|:---:|:---:|
| index.html — og:title, og:description, og:image, og:url | ✅ | ✅ | ✅ | ✅ |
| menu.html — og: tags | ✅ | ✅ | ✅ | ✅ |
| contact.html — og: tags | ✅ | ✅ | ✅ | ✅ |

- [x] **Verificado**: burger-lite/index.html e pizza-lite/index.html tinham og: ✅
- [x] **Adicionado**: og: tags completas em todos os menu.html (todos os 4 temas)
- [x] **Adicionado**: og: tags completas em todos os contact.html (todos os 4 temas)

### 3.2 Twitter Card — ✅ RESOLVIDO

- [x] Twitter Card adicionado em `index.html` dos 4 temas (com og:image URL como twitter:image)
- [x] Twitter Card adicionado em `menu.html` dos 4 temas
- [x] Twitter Card adicionado em `contact.html` dos 4 temas
- [x] **Decisão:** lite RESOLVEU o gap (restaurante/contact.html não tinha → lite agora tem)
- **Nota:** `app.js` já injeta Twitter Card dinamicamente (linhas 215-222) — tags estáticas são fallback para crawlers sem JS (Facebook, Slack, etc.)

### 3.3 Canonical URL — ✅ RESOLVIDO

- [x] `app.js` já popula canonical dinamicamente (linhas 233-240): `canonical.href = window.location.origin + window.location.pathname`
- [x] `<link rel="canonical" href="">` adicionado a burger-lite/pizza-lite/acai: menu.html e contact.html
- [x] restaurant-lite já tinha canonical em menu.html e contact.html ✅
- **Resultado:** Todos os 12 arquivos públicos têm canonical estático + preenchimento JS dinâmico

### 3.4 Meta Description Estática — ✅ CONFIRMADO
- [x] `<meta name="description">` presente em TODAS as páginas de todos os 4 temas
- [x] Textos únicos por página (index/menu/contact têm descrições distintas)

### 3.5 Outros SEO Checks — ✅ CONFIRMADO
- [x] `<title>` dinâmico: `app.js` atualiza via `restaurant_name` do config (linha 178-181)
- [x] `<html lang="pt-BR">` declarado em todos os arquivos
- [x] Heading hierarchy: 1 `<h1>` por página pública (admin.html multi-h1 é SPA com JS show/hide — OK)
- [x] Imagens de pratos usam `alt="${escapeHTML(d.name)}"` nas páginas públicas

---

## FASE 4 — Assets Estáticos

> **Objetivo:** Garantir que todos os assets necessários existem e estão corretamente gerados.

### 4.1 favicon.svg — Gap Crítico

**Nenhum dos 4 temas lite possui `favicon.svg`.** Os temas padrão têm (restaurante, pizzaria, hamburgueria).

Todas as páginas dos temas lite já referenciam:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
```

Se o arquivo não existir → ícone quebrado no navegador (404 no DevTools).

**Ação para cada tema:**
- [ ] `restaurant-lite/favicon.svg` — criar SVG representando o tema (fork do restaurante ou ícone neutro)
- [ ] `burger-lite/favicon.svg` — ícone de hamburguer simplificado
- [ ] `pizza-lite/favicon.svg` — ícone de pizza simplificado
- [ ] `acai/favicon.svg` — ícone de açaí / tigela simplificada

**Sugestão de conteúdo mínimo (SVG neutro temporário por tema):**
```svg
<!-- Usar a cor principal do tema como fill -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#[COR_DO_TEMA]"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
        fill="white" font-size="18" font-family="sans-serif">[INICIAL]</text>
</svg>
```

### 4.2 CSS Build

- [ ] Verificar que `input.css` existe no root de cada tema lite:
  - `themes/restaurant-lite/input.css`
  - `themes/burger-lite/input.css`
  - `themes/pizza-lite/input.css`
  - `themes/acai/input.css`
- [ ] Verificar output: `themes/[tema]/css/styles.css` existe e é não-vazio
- [ ] Executar build para cada tema e confirmar tamanho razoável (> 10KB):
  ```bash
  # Da raiz do projeto — usar THEME para apontar para cada tema:
  npx @tailwindcss/cli -i themes/restaurant-lite/input.css -o themes/restaurant-lite/css/styles.css --minify
  ```
- [ ] Confirmar que tokens de cor do design system de cada tema estão em `input.css` (não usando cores do tema padrão)
- [ ] CSS gerado não tem referências a arquivos de temas padrão

### 4.3 Assets de Imagem (OG Image)
- [ ] Verificar se existe imagem default para og:image (usada no compartilhamento social)
- [ ] Se `og:image` estiver vazio: criar placeholder ou usar imagem do Cloudinary do cliente
- [ ] Tamanho recomendado: 1200×630px

---

## FASE 5 — Scripts de Infraestrutura

> **Objetivo:** Garantir que os scripts de provisionamento e deploy suportam temas lite corretamente.

### 5.1 provision_client.js — Gap Crítico

**Situação atual (linha 109):**
```
Tipo (restaurante/hamburgueria/confeitaria) [restaurante]:
```
Problemas:
- Não lista temas lite como opções válidas
- Não define `PLAN=starter` quando tipo lite é selecionado
- Não define `SEED_TYPE` correto para lite themes

**Mudanças necessárias em `scripts/provision_client.js`:**
- [ ] Atualizar prompt para incluir todos os temas:
  ```
  Tipo (restaurante/hamburgueria/pizzaria/restaurant-lite/burger-lite/pizza-lite/acai) [restaurante]:
  ```
- [ ] Adicionar mapeamento `THEME → PLAN`:
  ```js
  const LITE_THEMES = ['restaurant-lite', 'burger-lite', 'pizza-lite', 'acai'];
  const plan = LITE_THEMES.includes(selectedTheme) ? 'starter' : 'professional';
  ```
- [ ] Escrever `PLAN=${plan}` no `.env` gerado do cliente
- [ ] Mapear `seedType` correto (que pode ser diferente do `THEME` se necessário)
- [ ] Documentar limites do Starter no output do script (30 pratos, 5 categorias, sem galeria/sobre)

### 5.2 inject-loader.js

**Situação atual:** `themes = ['restaurante', 'hamburgueria', 'pizzaria']` — lite themes ausentes.

**Análise:**
- Temas lite já embutem o global-loader diretamente no HTML (self-contained) ✅
- `inject-loader.js` seria redundante para lite themes
- **Decisão:** Documentar no README que lite themes **não usam** `inject-loader.js` por serem auto-suficientes — ou adicionar ao array com flag `skipIfPresent`

- [ ] Verificar se `inject-loader.js` checka duplicidade antes de injetar (evitar duplicar loader)
- [ ] Se sim: seguro adicionar lite themes ao array
- [ ] Se não: manter fora e documentar no README dos scripts

### 5.3 select-theme.js

- [ ] Confirmar que `LITE_THEMES = ['restaurant-lite', 'burger-lite', 'pizza-lite', 'acai']` está presente
- [ ] Testar cada tema:
  ```bash
  node scripts/select-theme.js restaurant-lite
  node scripts/select-theme.js burger-lite
  node scripts/select-theme.js pizza-lite
  node scripts/select-theme.js acai
  ```
- [ ] Confirmar que `_shared/js/` é copiado para `public/js/` ao selecionar tema lite
- [ ] Confirmar que arquivos do tema são copiados para `public/` corretamente

### 5.4 Preflight Script

- [ ] Rodar `scripts/preflight.ps1` ou equivalente e verificar se lite themes passam nos checks
- [ ] Se o script não conhece lite themes: atualizar lista de temas suportados

---

## FASE 6 — Servidor: Dev Scripts e Seeds ✅ CONCLUÍDA

> **Objetivo:** Permitir desenvolvimento local de qualquer tema lite com um único comando.

### 6.1 server/package.json — Scripts Ausentes ✅ RESOLVIDO

- [x] `dev:restaurant-lite`, `dev:burger-lite`, `dev:pizza-lite`, `dev:acai` adicionados com `cross-env THEME=X PLAN=starter`
- [x] `seed:restaurant-lite`, `seed:burger-lite`, `seed:pizza-lite`, `seed:acai` adicionados com `cross-env SEED_TYPE=X PLAN=starter`
- [x] `cross-env` já presente em devDependencies (v10.1.0) — sem dependência nova
- [x] JSON válido confirmado via `node -e "require('./server/package.json')"`
- **Nota Windows:** Scripts usam `cross-env` conforme recomendado — compatível com Windows/Linux/Mac

### 6.2 Validação das Seeds ✅ CONFIRMADO

**Arquivos existentes (confirmados):**
- `server/prisma/seed-restaurant-lite.ts` ✅
- `server/prisma/seed-burger-lite.ts` ✅
- `server/prisma/seed-pizza-lite.ts` ✅
- `server/prisma/seed-acai.ts` ✅
- `server/prisma/seed.ts` com routing por `SEED_TYPE` para todos os 4 temas ✅

- [x] Todos os 4 seed files têm referência `starter` (site_plan gravado como 'starter')
- [x] Contagem de pratos seeded está dentro do limite ≤ 30 em todos os temas
- [x] `seed.ts` router já suporta todos os SEED_TYPE dos temas lite (cases 273-283)

### 6.3 Plan Enforcement — Teste de Integração ✅ CONFIRMADO

- [x] `middlewares/plan.ts` implementado: `STARTER_LIMITS = { maxDishes: 30, maxCategories: 5 }`
- [x] `routes/plan.ts` retorna `{ gallery: false, aboutPage: false, maxDishes: 30, maxCategories: 5 }` para starter
- [x] `dishes.test.ts` — testes de gating starter existentes: 403 ao atingir 30 pratos ✅
- [x] `categories.test.ts` — testes de gating starter existentes: 403 ao atingir 5 categorias ✅
- [x] `plan.middleware.test.ts` e `plan.route.test.ts` — cobertura completa do plan enforcement ✅
- [x] Suite de testes: **55/59 passando** — baseline mantido, sem regressão ✅

---

## FASE 7 — Testes Automatizados ✅ CONCLUÍDA

> **Objetivo:** Garantir que as correções dos admin.html não quebraram nenhum teste existente e que a suite de 55/59 (4 falhas pré-existentes) está mantida.

### 7.1 Regredir os Testes Jest ✅ RESOLVIDO

- [x] **Resultado final: 59/59 passando — 0 falhando** (todas as 4 falhas pré-existentes corrigidas)
- [x] Coverage geral: **44.1% statements** (baseline mantido)

**4 falhas corrigidas:**
| Falha | Causa | Correção |
|---|---|---|
| `dishes.test.ts — validate-prices 200` | Teste esperava `Array`, rota retorna `Record<id, price>` | Corrigido assertion no teste |
| `auth.test.ts — /me returns 401 malformed` | `verifyAccessToken` lançava `Error` genérico → 500; bug real de produção | Corrigido middleware `auth.ts`: envolve `verifyAccessToken` em try-catch, relança como `UnauthorizedError` |
| `auth.test.ts — change-pwd 401 not auth` | `authLimiter` (max 10 req/15 min) disparava 429 durante testes | Mockado `rateLimit` em `auth.test.ts` |
| `auth.test.ts — change-pwd 400 weak pwd` | Idem — rate limit 429 | Idem |

### 7.2 Testes de Plan Limits ✅ CONFIRMADO

- [x] `dishes.test.ts` → starter 30-dish limit: `403 Forbidden` ✅
- [x] `categories.test.ts` → starter 5-category limit: `403 Forbidden` ✅
- [x] `plan.route.test.ts` → features starter: `{ gallery: false, aboutPage: false, maxDishes: 30, maxCategories: 5 }` ✅
- [x] `plan.middleware.test.ts` → `STARTER_LIMITS`, `getCurrentPlan()`, `isStarter()` ✅

### 7.3 Testes E2E (se aplicável) ✅ CONFIRMADO

- [x] `tests/e2e_flows.py` já suporta todos os 4 temas lite com `is_starter: True`
- [x] `THEME_CONFIGS` contém: `restaurant-lite`, `burger-lite`, `pizza-lite`, `acai`
- [x] `run_client_flow` verifica: ausência de galeria em starter, carregamento de home/menu/contact
- [x] `run_admin_flow` genérico funciona para qualquer tema via `--theme` flag
- **Cobertura E2E lite:** requer servidor rodando (smoke test manual — fora do escopo Jest)

---

## FASE 8 — Deploy e Provisionamento

> **Objetivo:** Confirmar que um cliente lite pode ser provisionado do zero até o ar em produção.

### 8.1 Variáveis de Ambiente Necessárias

Documentar e verificar que o deploy de um tema lite requer:

```env
# Obrigatórias para temas lite
THEME=restaurant-lite          # ou burger-lite, pizza-lite, acai
PLAN=starter
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Variáveis opcionais (mas recomendadas)
NODE_ENV=production
PORT=3000
```

- [ ] Verificar `docs/ENV_TEMPLATE_CLIENT.md` — inclui `PLAN`? Inclui temas lite no exemplo?
- [ ] Atualizar template de env se necessário

### 8.2 Docker Compose

- [ ] Verificar `docker-compose.yml` e `docker-compose.dev.yml`:
  - Environment `THEME` está parametrizado (não hardcoded)?
  - `PLAN` está incluído?
- [ ] Testar build Docker com `THEME=acai PLAN=starter`

### 8.3 vercel.json / Coolify

- [ ] `vercel.json` suporta roteamento para temas lite? (rewrites para `/api/*`)
- [ ] Confirmar que variáveis de ambiente podem ser setadas por cliente no Coolify
- [ ] Testar deploy de um tema lite em staging antes de produção

### 8.4 Fluxo de Provisionamento Completo (Happy Path)

Após fase 5.1 (provision_client.js atualizado), testar:
1. `node scripts/provision_client.js` → tipo: `acai`
2. Script gera `.env`, configura DB, roda seed
3. `npm run dev:acai` → servidor sobe, acessar `localhost:3000` → tema acai carrega
4. Admin: login → criar 5 pratos → tentar criar 31º → 403 correto
5. Confirmar `select-theme.js acai` → `public/` populado corretamente

---

## FASE 9 — Documentação e Entregáveis de Venda

> **Objetivo:** O produto deve estar documentado e com materiais de suporte prontos para a venda.

### 9.1 README dos Temas Lite

- [ ] Cada tema lite deve ter um `README.md` ou referência ao README principal com:
  - O que está incluído no Starter Plan
  - Limites (30 pratos, 5 categorias)
  - O que **não** está incluído (galeria, página sobre, página privacy)
  - Como fazer upgrade para Professional
  - Como customizar cores (tokens no `input.css`)

### 9.2 Atualizar README_SYNC.md / README.md

- [ ] Listar os 4 novos temas lite no README principal
- [ ] Documentar o `_shared/js/` e sua responsabilidade
- [ ] Documentar qual é o `SEED_TYPE` correspondente a cada tema

### 9.3 Design System dos Temas Lite

- [ ] Confirmar que cada tema lite tem tokens de design documentados (ou referenciados no `input.css`)
- [ ] Se houver `MASTER.md` no design-system para algum lite tema: revisar se está atualizado

### 9.4 Checklist de Venda (por tema)

Para cada cliente que comprar um tema lite, o pacote entregue deve incluir:
- [ ] Link de acesso ao admin (`/admin.html`)
- [ ] Credenciais iniciais (de onde vêm? da seed? geradas pelo provision?)
- [ ] URL do cardápio público (`/menu.html`)
- [ ] Guia de onboarding de 1 página (como adicionar pratos, como alterar configurações)

---

## Resumo de Prioridades (Quick Win vs. Obrigatório)

### 🔴 Bloqueadores de Produção (MUST DO antes de vender)

| # | Item | Fase | Impacto |
|---|------|------|---------|
| B1 | `favicon.svg` — criar para os 4 temas | 4.1 | Ícone quebrado no browser |
| B2 | `og:` no contact.html — adicionar nos 4 temas | 3.1 | Compartilhamento social sem preview |
| B3 | Twitter Card — adicionar em todas as páginas dos 4 temas | 3.2 | SEO e compartilhamento |
| B4 | `google_maps_embed` no contact.html | 2.6 | Funcionalidade faltando vs padrão |
| B5 | `provision_client.js` — atualizar para suportar lite + PLAN=starter | 5.1 | Onboarding de clientes quebrado |
| B6 | `server/package.json` — dev/seed scripts | 6.1 | Desenvolvimento local impossível |
| B7 | Smoke test manual admin (todos os 4 temas) | 1.x | Validar correções em produção |
| B8 | CSS build verificado e funcionando | 4.2 | Site sem estilo |

### 🟡 Alta prioridade (SHOULD DO antes da primeira venda)

| # | Item | Fase |
|---|------|------|
| A1 | Canonical URL preenchido via JS | 3.3 |
| A2 | Testes Jest passando (sem regressão) | 7.1 |
| A3 | Seed de cada tema validado em dev | 6.2 |
| A4 | Plan enforcement testado manualmente | 6.3 |
| A5 | select-theme.js testado para todos os 4 temas | 5.3 |
| A6 | ENV_TEMPLATE_CLIENT.md atualizado com PLAN | 8.1 |
| A7 | Bullet test: og: em menu.html de todos os temas | 3.1 |

### 🟢 Desejável (NICE TO HAVE — pode ir pós-primeira venda)

| # | Item | Fase |
|---|------|------|
| N1 | Testes E2E para temas lite | 7.3 |
| N2 | Google Maps para todos (burger-lite, pizza-lite) | 2.6 |
| N3 | README por tema lite | 9.1 |
| N4 | Guia de onboarding de 1 página | 9.4 |
| N5 | Docker Compose parametrizado por tema | 8.2 |

---

## Critério de Conclusão

O checkup está **completo e os temas prontos para venda** quando:

1. ✅ Todos os itens 🔴 Bloqueadores de Produção concluídos
2. ✅ Pelo menos 5 dos 7 itens 🟡 Alta Prioridade concluídos
3. ✅ Smoke test manual de admin + cardápio público realizado em **todos os 4 temas**
4. ✅ `npx jest` retornando ≥ 55 passos (sem regressão)
5. ✅ Um cliente de teste provisionado do zero com `provision_client.js` atualizado

---

*Plano gerado via análise comparativa completa dos 4 temas lite vs. temas padrão (code-freeze).*  
*Investigação concluída em sessão — todos os dados obtidos do codebase real, sem suposições.*
