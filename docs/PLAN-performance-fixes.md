# PLAN — Performance Fixes (Score 69 → 90+)

> Análise baseada nos relatórios GTmetrix (Score 89%) e Lighthouse mobile (Score 69).
> Cada fix inclui: problema, impacto estimado, métrica afetada, e o que mudar.

---

## Resumo dos Scores Atuais

| Métrica | GTmetrix (desktop) | Lighthouse (mobile 4G) | Meta |
|---|---|---|---|
| **Score** | 89% | 69 | 90+ |
| **FCP** | — | 3.1s 🔴 | < 1.8s |
| **LCP** | 1.7s | 6.2s 🔴 | < 2.5s |
| **TBT** | 58ms | 0ms ✅ | < 200ms |
| **CLS** | 0.07 | 0 ✅ | < 0.1 |
| **Speed Index** | — | 4.8s 🟡 | < 3.4s |

**Diagnóstico raiz:** O problema de performance é quase 100% de **carregamento** (FCP e LCP), não de interatividade (TBT/CLS estão perfeitos). Os fixes devem focar em **reduzir o critical path** e **otimizar a hero image**.

---

## 🔴 FIX 1 — Trocar `cdn.tailwindcss.com` por CSS pré-compilado (IMPACTO: MÁXIMO)

**Problema:** O `<script src="https://cdn.tailwindcss.com">` no `<head>` é o **JIT compiler do Tailwind** (~100KB+ de JavaScript). Ele:
- Bloqueia o rendering completamente (parser-blocking `<script>`)
- Precisa baixar (~100KB), parsear, e compilar CSS antes de qualquer pixel aparecer
- É a causa #1 dos 520ms de "render-blocking requests"
- Nunca deveria ser usado em produção — é ferramenta de desenvolvimento

**Métrica:** FCP (-1s a -1.5s), LCP (-1s a -2s), Speed Index (-1s)

**Fix:** Gerar um arquivo `styles.css` estático com o output do Tailwind no build time.

```
Opção A (mais simples): Tailwind CLI standalone
  1. Instalar: npm install -D tailwindcss @tailwindcss/cli
  2. Criar tailwind.config.js no root (já existe inline no <script>)
  3. Criar input.css com @tailwind directives
  4. Build script: npx @tailwindcss/cli -i input.css -o public/css/styles.css --minify
  5. Trocar <script src="cdn.tailwindcss.com"> por <link rel="stylesheet" href="/css/styles.css">

Opção B (alternativa): Usar o CSS inline no <style> do HTML
  - Gerar o CSS e injetar direto no <head> via build step
  - Elimina até o request do CSS externo
```

**Escopo:** Todos os 7 HTMLs dos temas (index, menu, gallery, about, contact, privacy, admin) EM TEMAS PIZZARIA, RESTAURANTE, HAMBURGUERIA (confeitaria não tem Tailwind)

**Risco:** Alto — precisa garantir que TODAS as classes Tailwind usadas nos HTMLs sejam escaneadas. Testar visual completo após a mudança.

---

## 🔴 FIX 2 — Otimizar hero image / LCP element (IMPACTO: ALTO)

**Problema:** A hero image é carregada via CSS `background-image` apontando direto para o Unsplash:
```html
<div class="hero-bg" style="background-image:url('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920&q=80');">
```
Issues:
- Não é descoberta pelo preload scanner do browser (está escondida em CSS inline)
- Unsplash não serve WebP/AVIF automaticamente
- Sem responsive sizing (1920px para todos os devices)
- Sai de um domínio externo (DNS resolve + TLS handshake extra)
- É o **LCP element** — a imagem mais importante da página

**Métrica:** LCP (-2s a -3s no mobile), Speed Index (-1s)

**Fix:**
```
1. Subir a hero image para Cloudinary (já configurado no projeto)
2. Trocar de background-image CSS para <img> tag com:
   - loading="eager" fetchpriority="high"
   - srcset com 3 tamanhos (640w, 1024w, 1920w)
   - Formato automático via Cloudinary (f_auto → serve WebP/AVIF)
3. Adicionar <link rel="preload" as="image"> no <head>
4. Na section .hero-bg, usar position absolute + object-cover na <img>

Alternativa mínima (sem mudar HTML):
  - Adicionar <link rel="preload" as="image" href="URL"> no <head>
  - Usar Cloudinary URL com f_auto,q_auto,w_1200 ao invés do Unsplash direto
```

**Aplica a:** Hero image + about section image (ambas Unsplash hardcoded)

---

## 🟡 FIX 3 — Otimizar Google Fonts (IMPACTO: MÉDIO)

**Problema:** Google Fonts carrega assim:
```html
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?...">
<link href="https://fonts.googleapis.com/css2?..." rel="stylesheet">
```
- O `preload` + `stylesheet` duplica o request
- As fontes são render-blocking CSS
- 2 famílias (Playfair Display SC + Karla) com múltiplos weights = arquivo grande

**Métrica:** FCP (-200ms a -400ms)

**Fix:**
```
Opção A — Font display swap + preconnect (já tem preconnect ✅):
  - Adicionar &display=swap na URL (já está ✅)
  - Remover o <link rel="preload" as="style"> duplicado
  - Manter apenas o <link rel="stylesheet">

Opção B — Self-host (máximo controle):
  - Baixar os fonts via google-webfonts-helper
  - Servir como /fonts/*.woff2 locais
  - Elimina 2 requests externos (googleapis + gstatic)

Opção C — Reduzir weights:
  - Playfair Display SC: manter só 700 (bold) — o 400 quase não é usado
  - Karla: manter 400, 600, 700 — dropar 300 e 500
```

---

## 🟡 FIX 4 — Adicionar `defer` nos scripts (IMPACTO: MÉDIO)

**Problema:** 10 scripts carregados sem `defer` no fim do body:
```html
<script src="/js/performance.js"></script>
<script src="/js/mobile.js"></script>
<script src="/js/a11y.js"></script>
<script src="/js/feedback.js"></script>
<script src="/js/formValidation.js"></script>
<script src="/js/app.js"></script>
<script src="/js/cart.js"></script>
<script src="/js/whatsappFormatter.js"></script>
<script src="/js/orderModal.js"></script>
<script src="/js/cartUI.js"></script>
```
Embora estejam no fim do body, sem `defer` eles são **parser-blocking** — cada um espera o anterior terminar download + parse.

**Tamanho total:** ~131KB de JS (sem contar `app_temp_b.js` que não é carregado)

**Métrica:** FCP (-100ms), Speed Index (-200ms)

**Fix:**
```
1. Adicionar defer em TODOS os scripts:
   <script defer src="/js/app.js"></script>

2. Remover /js/performance.js — ele usa APIs deprecated (performance.timing)
   e só faz logging no console. Peso morto de 6.8KB sem benefício ao usuário.

3. Considerar: mover app.js para <head> com defer — inicia download mais cedo

Nota: Os scripts usam IIFEs e DOMContentLoaded,
      então defer não vai quebrar a ordem de execução.
```

---

## 🟡 FIX 5 — `background-attachment: fixed` no mobile (IMPACTO: BAIXO-MÉDIO)

**Problema:**
```css
.hero-bg {
    background-attachment: fixed;
}
```
`background-attachment: fixed` força o browser a:
- Criar uma camada separada para compositing
- Repintar a cada scroll frame
- Causa "non-composited animation" (1 elemento flagged no Lighthouse)
- No iOS/Safari mobile, `fixed` é completamente ignorado (fallback feio)

**Métrica:** CLS (evita regressão), TBT (evita long tasks durante scroll)

**Fix:**
```css
.hero-bg {
    background-size: cover;
    background-position: center;
    /* Removido: background-attachment: fixed — causa repaint em cada frame */
}

/* Parallax real com transform (composited, GPU-accelerated): */
@media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
    .hero-bg {
        will-change: transform;
        /* Parallax via JS com transform3d se quiser manter o efeito */
    }
}
```

---

## 🟢 FIX 6 — Comprimir / minificar JS (IMPACTO: BAIXO)

**Problema:** Os arquivos JS não são minificados:
| Arquivo | Tamanho |
|---|---|
| app.js | 29.9 KB |
| orderModal.js | 22.5 KB |
| cartUI.js | 18.2 KB |
| feedback.js | 15.4 KB |
| cart.js | 13.3 KB |
| formValidation.js | 11 KB |
| **Total** | **~131 KB** |

Minificados, devem cair para ~60-70 KB. Com gzip (Vercel já faz), ~20 KB.

**Métrica:** Speed Index (-100ms), reduz "unused JavaScript" flagged

**Fix:**
```
Opção A — Minificação no build (recomendado):
  1. npm install -D terser
  2. No build script, após select-theme.js:
     for file in public/js/*.js; do npx terser "$file" -o "$file" -c -m; done

Opção B — Vercel Edge Compression:
  - O Vercel já aplica gzip/brotli automaticamente em assets estáticos
  - Minificação ainda ajuda porque reduz o tamanho PRÉ-compressão
```

---

## 🟢 FIX 7 — Preconnect para API calls (IMPACTO: BAIXO)

**Problema:** Ao renderizar a página, o JS faz 3 API calls sequenciais:
1. `GET /api/csrf-token`
2. `GET /api/config`
3. `GET /api/dishes?featured=true` + `GET /api/categories`

No Vercel serverless, o primeiro request sofre **cold start** (~1-3s) que atrasa todo o chain.

**Fix:**
```
Não é um fix de frontend — é arquitetural. Opções:
  A. Mover para SSR (pré-render config no HTML no servidor) — invasivo
  B. Cache na Edge (Vercel Edge Config ou ISR) — requer refactor
  C. Preconnect shortcut: adicionar link preconnect para o próprio domínio
     (sem efeito real no same-origin, mas ajuda se usar CDN/proxy)

Recomendação: Não priorizar. O cold start do Vercel é inevitável no free tier.
```

---

## Ordem de Execução Recomendada

| Prioridade | Fix | Impacto Estimado | Risco | Tempo |
|---|---|---|---|---|
| 1️⃣ | **FIX 1** — Tailwind CSS pré-compilado | FCP -1.5s, LCP -1.5s | Alto (testar visual) | Médio |
| 2️⃣ | **FIX 2** — Hero image otimizada | LCP -2s | Baixo | Curto |
| 3️⃣ | **FIX 4** — Scripts com `defer` | FCP -100ms | Muito baixo | Curto |
| 4️⃣ | **FIX 3** — Google Fonts otimizados | FCP -300ms | Baixo | Curto |
| 5️⃣ | **FIX 5** — Remover `background-attachment: fixed` | CLS prevenção | Baixo | Curto |
| 6️⃣ | **FIX 6** — Minificar JS | Speed Index -100ms | Baixo | Curto |
| 7️⃣ | **FIX 7** — Cold start Vercel | N/A | N/A | Não priorizar |

**Projeção:** Fixes 1 + 2 + 3 + 4 devem levar o score mobile de **69 → 88-95**.

---

## Escopo: Onde Aplicar

Todos os fixes se aplicam aos **3 temas** simultaneamente, pois o HTML é igual:
- `themes/restaurante/index.html`
- `themes/hamburgueria/index.html`
- `themes/pizzaria/index.html`

E também aos outros HTMLs do tema (menu, gallery, about, contact, privacy) que compartilham o mesmo `<head>` com Tailwind CDN e Google Fonts.

---

> **Aguardando aprovação para executar. Qual fix (ou quais) quer que eu implemente?**
