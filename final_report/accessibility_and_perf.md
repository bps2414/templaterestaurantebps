# ♿ Accessibility & Performance Report — Final Audit

> Gerado em: 12/02/2026

---

## ♿ ACESSIBILIDADE

### 🔴 PRIORIDADE ALTA

#### A11Y-001: Lightbox sem role="dialog" e sem focus trap
**Arquivo**: public/gallery.html  
**Problema**: O lightbox de imagens não tem `role="dialog"`, `aria-modal="true"`, nem focus trap. Usuários de screen reader não sabem que um diálogo abriu. Tab key permite foco em elementos atrás do overlay.

**Correção**:
```html
<div id="lightbox" role="dialog" aria-modal="true" aria-label="Visualizador de imagens" ...>
```
```javascript
// Focus trap (mesma pattern do orderModal.js):
function trapFocus(element) {
    const focusable = element.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0], last = focusable[focusable.length - 1];
    element.addEventListener('keydown', e => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });
}
```

---

#### A11Y-002: Admin modals sem ARIA attributes
**Arquivo**: public/admin.html (5 modals)  
**Problema**: Nenhum modal do admin (dish, category, gallery, password, onboarding) tem `role="dialog"`, `aria-modal`, ou `aria-labelledby`. Nenhum implementa focus trap.

**Correção para cada modal**:
```html
<div id="dishModal" role="dialog" aria-modal="true" aria-labelledby="dishModalTitle" ...>
    <h3 id="dishModalTitle">Novo Prato</h3>
    ...
</div>
```

---

#### A11Y-003: Cart sidebar sem focus trap
**Arquivo**: public/js/cartUI.js  
**Problema**: Quando o carrinho lateral abre, o foco não é movido para dentro. Tab key permite focar em elementos atrás do overlay. Ao fechar, foco não volta ao botão que abriu.

**Correção**:
```javascript
// On open:
sidebar.focus(); // needs tabindex="-1"
previousFocus = document.activeElement;
// On close:
previousFocus?.focus();
```

---

#### A11Y-004: Category tabs sem role="tablist"/tab/tabpanel
**Arquivo**: public/menu.html  
**Problema**: O filtro de categorias (scrollable buttons) não segue o WAI-ARIA tabs pattern. Falta: `role="tablist"` no container, `role="tab"` em cada botão, `aria-selected`, `aria-controls`, `role="tabpanel"` no grid.

**Correção mínima**:
```html
<div role="tablist" aria-label="Filtrar por categoria">
    <button role="tab" aria-selected="true" aria-controls="menu-grid">Todos</button>
    <button role="tab" aria-selected="false" aria-controls="menu-grid">Pizzas</button>
</div>
<div id="menu-grid" role="tabpanel">...</div>
```

---

#### A11Y-005: Nenhuma página tem skip-to-content link
**Arquivo**: Todos os public/*.html  
**Problema**: Usuários de teclado precisam navegar por todo o header/nav antes de chegar ao conteúdo principal. Não existe link "Pular para o conteúdo".

**Correção** (adicionar como primeiro elemento do `<body>`):
```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-brand-400 focus:text-white focus:px-4 focus:py-2 focus:rounded">
    Pular para o conteúdo
</a>
```

---

### 🟡 PRIORIDADE MÉDIA

#### A11Y-006: Imagens de pratos sem alt text descritivo
**Arquivo**: public/menu.html (renderDishes), public/js/app.js (renderFeaturedDishes)  
**Problema**: Menu items renderizados via JS usam `alt="${dish.name}"` ✅ (OK), mas galeria de imagens e hero backgrounds não têm alt text.

**Correção**:
- Gallery images: usar `alt="Foto do restaurante"` ou campo de alt no upload
- Hero: `role="img" aria-label="Imagem de fundo do restaurante"`

---

#### A11Y-007: Gallery items não têm keyboard interaction
**Arquivo**: public/gallery.html  
**Problema**: `<div onclick="openLightbox(i)">` não é navegável por teclado. Falta `tabindex="0"`, `role="button"`, e `onkeydown` (Enter/Space).

**Correção**:
```html
<div role="button" tabindex="0" aria-label="Ver imagem ${i+1} em tela cheia" 
     onclick="openLightbox(${i})" onkeydown="if(event.key==='Enter')openLightbox(${i})">
```

---

#### A11Y-008: iframe do Google Maps sem title
**Arquivo**: public/contact.html  
**Problema**: `<iframe>` do Google Maps não tem atributo `title`. Screen readers anunciam "frame" sem contexto.

**Correção**:
```html
<iframe title="Localização do restaurante no Google Maps" ...></iframe>
```

---

#### A11Y-009: Mobile menu sem aria-expanded
**Arquivo**: public/index.html (e outros)  
**Problema**: O botão de menu mobile tem `aria-label="Menu"` ✅ mas não atualiza `aria-expanded` ao abrir/fechar.

**Correção** (no toggle handler):
```javascript
menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
```

---

#### A11Y-010: about.html, gallery.html, contact.html não carregam a11y.js
**Arquivo**: Páginas internas  
**Problema**: O módulo de acessibilidade (`a11y.js`) com ARIA live regions é carregado apenas em `index.html` e `menu.html`. Páginas internas não têm announcements para screen readers.

**Correção**: Adicionar `<script src="/js/a11y.js" defer></script>` em todas as páginas.

---

### 🟢 PRIORIDADE BAIXA

#### A11Y-011: WhatsApp links sem rel="noopener"
**Arquivo**: public/contact.html  
**Problema**: Links `target="_blank"` para WhatsApp não têm `rel="noopener noreferrer"`. Menor risco de tab nabbing.

**Correção**: `rel="noopener noreferrer"` em todos os `target="_blank"`.

---

#### A11Y-012: Emoji como brand icon sem sr-only text
**Arquivo**: public/index.html (navbar)  
**Problema**: `🍽` emoji usado como logo. Screen readers anunciam "fork and knife" em inglês — não ajuda.

**Correção**: `<span aria-hidden="true">🍽</span><span class="sr-only">Logo do restaurante</span>`

---

---

## ⚡ PERFORMANCE

### 🔴 PRIORIDADE ALTA

#### PERF-001: CDN Tailwind em produção (BLOCKER)
**Arquivo**: Todos os public/*.html  
**Problema**: `<script src="https://cdn.tailwindcss.com">` é ~330KB de JavaScript que:
1. Bloqueia o parsing HTML (render-blocking)
2. Compila CSS no runtime do browser (CPU-intensive)
3. Gera FOUC (flash of unstyled content)
4. Incompatível com CSP strict (usa eval)
5. CDN pode ficar offline = site sem estilo

**Impacto**: Lighthouse Performance score < 50 em mobile.

**Correção**:
```bash
# 1. Instalar Tailwind como dependência:
npm install tailwindcss @tailwindcss/cli

# 2. Criar tailwind.config.js com content paths
# 3. Build CSS:
npx @tailwindcss/cli -i input.css -o public/css/tailwind.css --minify

# 4. Substituir <script> por <link>:
<link rel="stylesheet" href="/css/tailwind.css">

# 5. Adicionar ao build script do package.json
```

**Tempo estimado**: 2-3 horas (incluindo configurar content paths)

---

#### PERF-002: 8 scripts síncronos sem defer/async
**Arquivo**: Todos os public/*.html  
**Problema**: 8 arquivos JS carregados no final do `<body>` sem `defer`. Embora estejam no final, o browser ainda precisa baixar e executar sequencialmente antes de considerar a página "interativa".

**Impacto**: Time to Interactive (TTI) inflado em ~500ms+ em 3G.

**Correção**: Adicionar `defer` em todos:
```html
<script src="/js/app.js" defer></script>
<script src="/js/cart.js" defer></script>
<script src="/js/cartUI.js" defer></script>
<!-- etc -->
```

---

#### PERF-003: Hero image sem preload
**Arquivo**: public/index.html  
**Problema**: A imagem de hero (LCP element) é definida em `background-image` CSS inline. O browser precisa: baixar HTML → parse CSS → descobrir imagem → baixar imagem. Cada passo adiciona latência.

**Correção**:
```html
<link rel="preload" as="image" href="hero-image-url" fetchpriority="high">
```

---

### 🟡 PRIORIDADE MÉDIA

#### PERF-004: Imagens sem lazy-loading
**Arquivos**: public/index.html (about image, featured dishes), public/about.html  
**Problema**: Imagens abaixo da dobra (about section, featured dishes) são carregadas eagerly, competindo com recursos acima da dobra.

**Correção**: `<img loading="lazy" ...>` em todas exceto a hero.

**Nota**: gallery.html já usa `loading="lazy"` ✅

---

#### PERF-005: Google Fonts preconnect incompleto
**Arquivo**: public/index.html  
**Problema**: Preconnect apenas para `fonts.googleapis.com`, faltando `fonts.gstatic.com` (onde os font files realmente estão).

**Correção**:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

---

#### PERF-006: QR Code library carregada em todo acesso ao admin
**Arquivo**: public/admin.html  
**Problema**: `qrcodejs` (CDN) é carregado em toda visita ao admin, mesmo quando o usuário nunca acessa a aba QR Code.

**Correção**: Lazy-load ao clicar na aba QR:
```javascript
async function showQrTab() {
    if (!window.QRCode) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
        await new Promise(resolve => { script.onload = resolve; document.head.appendChild(script); });
    }
    // render QR
}
```

---

#### PERF-007: renderDishes() rebuilds entire DOM via innerHTML
**Arquivo**: public/menu.html  
**Problema**: `menuGrid.innerHTML = html` destrói e recria todo o DOM do grid a cada filtro de categoria. Para 50+ pratos, causa jank visible.

**Correção para MVP**: Aceitável. Para 100+ pratos: usar document fragments ou virtualização.

---

#### PERF-008: Dockerfile copia devDependencies e source maps
**Arquivo**: server/Dockerfile + server/tsconfig.json  
**Problema**: Imagem de produção inclui TypeScript, ts-node, jest types, source maps, declaration maps. Adiciona ~100MB desnecessários.

**Correção**:
```dockerfile
# Production stage:
RUN cd server && npm ci --omit=dev --ignore-scripts
```
```json
// tsconfig.json (ou tsconfig.prod.json):
"sourceMap": false,
"declarationMap": false
```

---

### 🟢 PRIORIDADE BAIXA

#### PERF-009: performance.js usa API deprecated
**Arquivo**: public/js/performance.js  
**Problema**: `performance.timing` é deprecated. `PerformanceNavigationTiming` é o padrão atual.

**Correção**:
```javascript
const [nav] = performance.getEntriesByType('navigation');
if (nav) { /* use nav.domContentLoadedEventEnd etc */ }
```

---

#### PERF-010: cartUI.js rebuilds cart items on every change
**Arquivo**: public/js/cartUI.js  
**Problema**: `clearChildren()` + rebuild de todos os items no carrinho a cada add/remove/quantity change. Para carrinhos pequenos (5-10 items) não é problema.

**Correção**: Aceitável para MVP. Considerar diff-based updates se carts ficarem grandes.

---

---

## 📊 Resumo Consolidado

| Categoria | Críticos | Altos | Médios | Baixos |
|-----------|----------|-------|--------|--------|
| ♿ Acessibilidade | 5 | 5 | 2 | - |
| ⚡ Performance | 3 | 5 | 2 | - |
| **Total** | **8** | **10** | **4** | **-** |

### 🏆 Top 5 Ações por Impacto

| # | Ação | Esforço | Impacto |
|---|------|---------|---------|
| 1 | Build Tailwind CSS (PERF-001) | 3h | 🔴 Lighthouse +30pts |
| 2 | Adicionar defer em scripts (PERF-002) | 15min | 🔴 TTI -500ms |
| 3 | Focus trap no lightbox (A11Y-001) | 1h | 🟡 WCAG 2.1 compliance |
| 4 | Skip-to-content link (A11Y-005) | 15min | 🟡 WCAG 2.1 Level A |
| 5 | ARIA nos admin modals (A11Y-002) | 2h | 🟡 Usabilidade admin |

**Esforço total para resolver TODOS os issues**: ~16-20 horas
