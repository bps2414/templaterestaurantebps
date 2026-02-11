# 🎨 UI Changes Report — FluxPay Landing Page

**Data:** 2025-02-10  
**Escopo:** Polish visual, microinterações e animações acessíveis  
**Status:** ✅ Concluído  

---

## 1. Design Tokens Consolidados (`styles.css :root`)

### Novas Variáveis Adicionadas

| Categoria | Tokens |
|-----------|--------|
| **Cores** | `--primary-50`, `--primary-100`, `--primary-glow`, `--accent-glow`, `--success-bg` |
| **Espaçamento** | `--space-xs` (0.25rem) → `--space-4xl` (6rem) — escala completa |
| **Tipografia** | `--font-body`, `--font-heading`, `--text-xs` → `--text-4xl` |
| **Easing** | `--ease-out`, `--ease-spring`, `--transition-slow`, `--transition-spring` |
| **Sombras** | `--shadow-glow` (glow azul com blur) |

---

## 2. Scroll Reveal System

### CSS (`.reveal` / `.is-visible`)
- Elementos iniciam com `opacity: 0` e `translateY(32px)`
- Transição suave de 0.7s com `ease-out` ao entrar no viewport
- **Stagger**: `.reveal-stagger` aplica delays incrementais de 0.1s nos filhos (`:nth-child`)
- Suporte a delays customizados: `.reveal-delay-1` até `.reveal-delay-4`

### JavaScript (IntersectionObserver)
- Substituiu o sistema antigo de inline styles (`style.opacity = ...`)
- Agora usa CSS classes: adiciona `.reveal` e `.reveal-stagger` via JS
- `threshold: 0.15` — trigger quando 15% visível
- `rootMargin: '0px 0px -40px 0px'` — trigger ligeiramente antes
- **Prefers-reduced-motion**: Não adiciona nenhuma classe de animação se o usuário preferir motion reduzido

---

## 3. Hero Animations

| Animação | Target | Efeito |
|----------|--------|--------|
| `heroFadeUp` | `.hero-content` | Fade in + slide up (0→1 opacity, 40px→0 translateY) |
| `heroImgFloat` | `.hero-image` | Float suave infinito (6s, ±12px translateY) |
| `heroGlow` | `.hero-image::after` | Pulse de glow (4s, opacity 0.3→0.6→0.3) |

---

## 4. Microinterações

### Botões (`.btn-primary`)
- **Ripple effect** via `::after` pseudo-element
- Scale 0→2.5 com transição 0.5s no hover
- Overflow hidden para conter o ripple

### Feature Cards
- **Hover glow**: `::before` pseudo-element com gradient radial
- `opacity: 0 → 1` no hover com `translateY(-4px)` lift

### Pricing Cards
- **Hover lift**: `translateY(-8px)` + shadow amplificado
- Transição `0.35s var(--ease-spring)`

### Testimonial Cards
- **Hover lift**: `translateY(-4px)` + shadow

### Step Numbers (`.step-number`)
- **Spring scale**: `scale(1.15)` no hover com `var(--ease-spring)`

### Newsletter Input
- **Focus glow**: Box-shadow com `var(--primary-glow)` no focus

---

## 5. Acessibilidade (prefers-reduced-motion)

Todas as animações respeitam `@media (prefers-reduced-motion: reduce)`:

```css
/* Desabilitado quando reduzido: */
- .reveal transitions (instantâneas)
- .hero-content animation
- .hero-image animation
- heroImgFloat keyframes
- heroGlow keyframes
- .btn-primary::after ripple
```

**JavaScript**: Verifica `matchMedia('(prefers-reduced-motion: reduce)')` antes de adicionar qualquer classe de animação.

---

## 6. Arquivos Modificados

| Arquivo | Tipo de Mudança |
|---------|----------------|
| `styles.css` | +20 tokens, +120 linhas CSS (animações, reveals, hovers) |
| `scripts.js` | Scroll reveal reescrito (inline styles → CSS classes) |
| `styles.min.css` | Cópia atualizada |
| `scripts.min.js` | Cópia atualizada |
