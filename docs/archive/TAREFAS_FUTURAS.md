# 📋 Tarefas para Implementar Depois

## 🔴 Alta Prioridade (Próxima Sprint - 2-3 dias)

### 1. **Tailwind Build-Time** ⚡
**Impacto:** LCP reduz de ~2.5s para ~1.5s (40% melhora)  
**Esforço:** ~2-3 horas  
**O que fazer:**
- Instalar Tailwind via npm: `npm install -D tailwindcss`
- Criar `tailwind.config.js` e `postcss.config.js`
- Configurar build script no `package.json`
- Remover `<script src="https://cdn.tailwindcss.com"></script>` do HTML
- Gerar CSS otimizado com tree-shaking (apenas classes usadas)
- **Resultado:** 90KB CDN → ~15KB CSS final

---

### 2. **Code Splitting no JavaScript** 🔀
**Impacto:** TTI reduz de ~2s para ~1s (50% melhora)  
**Esforço:** ~3-4 horas  
**O que fazer:**
- Dividir `app.js` (711 linhas) em módulos separados:
  - `config.js` - Carregamento de configuração
  - `api.js` - Chamadas HTTP com retry
  - `ui.js` - Manipulação do DOM
  - `cart.js` - Já existe, verificar se está isolado
- Usar `type="module"` e `import/export` ES6
- Carregar módulos sob demanda (lazy loading)
- **Resultado:** JS inicial de 120KB → 40KB crítico + 80KB lazy

---

### 3. **IntersectionObserver para Animações** 👁️
**Impacto:** Reduz JS execution time em 60%  
**Esforço:** ~2 horas  
**O que fazer:**
- Substituir `.reveal` com scroll listener por IntersectionObserver
- Animar apenas elementos visíveis no viewport
- Remover event listeners de scroll desnecessários
- **Código exemplo:**
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // Observa apenas uma vez
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```

---

## 🟡 Média Prioridade (Semana 2 - 5-7 dias)

### 4. **Conversão de Imagens para WebP/AVIF** 🖼️
**Impacto:** Reduz bandwidth em 50-70%, LCP melhora ~1s  
**Esforço:** ~4-6 horas (incluindo setup de CDN)  
**O que fazer:**
- Usar Cloudinary ou Sharp.js para converter imagens
- Implementar `<picture>` com fallback:
```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Descrição">
</picture>
```
- Adicionar `loading="lazy"` em imagens abaixo do fold
- Implementar responsive images com `srcset` (múltiplos tamanhos)
- **Resultado:** 500KB imagem JPEG → 150KB WebP → 80KB AVIF

---

### 5. **Implementar fetchpriority e decoding** 🚀
**Impacto:** LCP melhora ~300ms, melhor priorização de recursos  
**Esforço:** ~1 hora  
**O que fazer:**
- Adicionar `fetchpriority="high"` na imagem Hero:
```html
<img src="hero.jpg" fetchpriority="high" decoding="async" alt="Hero">
```
- Hero image: `fetchpriority="high"`
- Imagens below-the-fold: `fetchpriority="low"`
- Todas imagens: `decoding="async"` (exceto Hero que pode ser `sync`)

---

### 6. **ARIA States Dinâmicos** ♿
**Impacto:** Acessibilidade 75/100 → 85/100  
**Esforço:** ~2-3 horas  
**O que fazer:**
- Adicionar `aria-current="page"` no link ativo da navegação
- Toggle `aria-expanded` no JavaScript quando menu mobile abre/fecha:
```javascript
menuToggle.addEventListener('click', () => {
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', !isExpanded);
  mobileMenu.classList.toggle('hidden');
});
```
- Adicionar `aria-live="polite"` em toasts/notificações
- Implementar `role="status"` em loading states

---

## 🟢 Baixa Prioridade / Long-term (Mês 1+)

### 7. **Server-Side Rendering (SSR)** 🏗️
**Impacto:** LCP < 1s, SEO ++, Zero JS para conteúdo crítico  
**Esforço:** ~2-3 semanas (refactor grande)  
**O que fazer:**
- Migrar para Next.js ou Astro
- Renderizar Hero + conteúdo crítico no servidor
- Hidratar JavaScript apenas para interatividade
- Implementar ISR (Incremental Static Regeneration) para páginas dinâmicas
- **Resultado:** TTFB < 200ms, FCP < 600ms, LCP < 1s

---

### 8. **Progressive Web App (PWA)** 📱
**Impacto:** Funciona offline, instalável, melhor retenção  
**Esforço:** ~1 semana  
**O que fazer:**
- Criar `manifest.json` com ícones e configurações
- Implementar Service Worker para cache de assets críticos
- Estratégia: Cache-first para CSS/JS/imagens, Network-first para API
- Adicionar banner "Adicionar à Tela Inicial"
- Push notifications para pedidos/promoções
- **Resultado:** Score PWA no Lighthouse: 0 → 100

---

### 9. **Critical CSS Inline** 💉
**Impacto:** Elimina render-blocking, FCP melhora ~500ms  
**Esforço:** ~3-4 horas  
**O que fazer:**
- Extrair CSS crítico (above-the-fold) e colocar inline no `<head>`
- Carregar resto do CSS de forma assíncrona:
```html
<style>/* CSS crítico inline (~8KB) */</style>
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```
- Usar ferramentas: Critical, Penthouse, ou Critters
- **Resultado:** Elimina FCP bloqueado por CSS

---

### 10. **HTTP/2 Server Push ou Preload** 🔗
**Impacto:** Reduz round-trips, melhora TTFB  
**Esforço:** ~1-2 horas (depende do servidor)  
**O que fazer:**
- Configurar server push para CSS/JS críticos (se Nginx/Apache)
- Ou usar `<link rel="preload">` para recursos importantes:
```html
<link rel="preload" href="/js/app.js" as="script">
<link rel="preload" href="/hero.webp" as="image">
```
- Evitar over-pushing (máximo 3-4 recursos)

---

## 📊 Checklist de Implementação

Use esta ordem recomendada para maximizar ROI (retorno sobre esforço):

```
Semana 1:
☐ Tailwind Build-Time (2-3h)
☐ IntersectionObserver (2h)
☐ fetchpriority + decoding (1h)
☐ ARIA states dinâmicos (2-3h)
Total: ~7-9 horas

Semana 2:
☐ Code Splitting JS (3-4h)
☐ WebP/AVIF conversion (4-6h)
Total: ~7-10 horas

Mês 1+ (se necessário):
☐ Critical CSS inline (3-4h)
☐ HTTP/2 preload (1-2h)
☐ SSR com Next.js (2-3 semanas)
☐ PWA completo (1 semana)
```

---

## 🎯 Métricas Alvo (Pós-Implementação Completa)

| Métrica | Atual | Meta | 
|---------|-------|------|
| **Lighthouse Performance** | 65 | 95+ |
| **LCP** | ~2.5s | < 1.0s |
| **FID** | ~100ms | < 50ms |
| **CLS** | ~0.1 | < 0.05 |
| **TTI** | ~2.0s | < 1.5s |
| **Accessibility** | 75 | 95+ |
| **SEO** | 85 | 100 |
| **PWA** | 0 | 100 |

---

## 💰 ROI Estimado

**Investimento:** ~25-35 horas de dev (incluindo Semana 1 + 2)  
**Retorno:**
- **Conversão:** +30-40% (usuários não abandonam site lento)
- **SEO:** +20-30% ranking (Core Web Vitals são fator de ranking)
- **Mobile:** +50% satisfação (touch targets, contraste, legibilidade)
- **Acessibilidade:** Conformidade WCAG 2.1 AA (~85-95/100)

**Break-even:** Se aumentar 5-10 vendas/mês, já paga o investimento.

---

## 📝 Notas Importantes

1. **Não fazer tudo de uma vez** - Implemente em fases para validar cada melhoria
2. **Medir sempre** - Use Lighthouse, WebPageTest, e Real User Monitoring (RUM)
3. **Priorize usuários reais** - Se 80% dos usuários são mobile 3G, foque em redução de payload
4. **Teste em produção** - Lighthouse local pode não refletir realidade (CDN, cache, latência)

---

**Última atualização:** 13/02/2026  
**Status:** ✅ Quick Wins implementados | 🟡 Melhorias de médio prazo pendentes
