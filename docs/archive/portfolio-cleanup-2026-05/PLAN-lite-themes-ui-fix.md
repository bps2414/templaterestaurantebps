# PLANO — Correções UI/UX dos Temas Lite

> **Data:** 2025  
> **Escopo:** `restaurant-lite`, `burger-lite`, `pizza-lite`, `acai`  
> **Baseline:** 59/59 testes Jest passando  

---

## 📋 Problemas Identificados

| # | Problema | Severidade | Temas Afetados |
|---|---------|-----------|----------------|
| 1 | Botões minúsculos sem cursor pointer | MEDIUM | Todos os lite |
| 2 | Modais transparentes/invisíveis | HIGH | Todos os lite |
| 3 | Carrinho invisível/transparente | HIGH | Todos os lite |
| 4 | Hamburgueria layout quebrado (alinhado à esquerda) | HIGH | burger-lite |
| 5 | "Faça upgrade" deve ser removido | LOW | restaurant-lite, burger-lite |
| 6 | Menu pizzaria sem botões (só texto) | MEDIUM | pizza-lite |
| 7 | Seção localização parece quebrada | MEDIUM | Todos os lite |
| 8 | Layout "Mais Pedidos" feio/quebrado | MEDIUM | Todos os lite |
| 9 | Painel Admin alinhado à esquerda e quebrado | HIGH | Todos os lite |
| 10 | Login sem rate limit | ~~CRITICAL~~ → ✅ JÁ RESOLVIDO | Nenhum |

---

## 🔍 Diagnóstico Detalhado

### Problema 2 & 3 — CAUSA RAIZ (Modais + Carrinho transparentes)

Os arquivos compartilhados `_shared/js/orderModal.js` e `_shared/js/cartUI.js` criam DOM dinâmico com classes Tailwind **customizadas do tema escuro**:

```
orderModal.js → bg-dark-800, bg-dark-900, text-white, border-white/10, text-gray-400
cartUI.js     → bg-dark-900, bg-brand-500, text-white, border-white/10, text-gray-400
```

**O CSS compilado dos temas lite NÃO contém `bg-dark-800`, `bg-dark-900`, nem `bg-brand-500`** (confirmado: zero matches no `styles.css`). Essas cores são personalizadas do tema escuro padrão e não existem na paleta default do Tailwind.

**Resultado:** Os containers de modal/carrinho ficam com `background: transparent` — totalmente invisíveis.

### Problema 10 — JÁ RESOLVIDO ✅

O servidor já possui rate limiting completo:
- `server/src/middlewares/rateLimit.ts` → `authLimiter` (10 req/15min)
- `server/src/app.ts` → `app.use('/api/auth', csrfVerifyToken, authLimiter, authRoutes)`
- Pacote `express-rate-limit@^7.5.1` instalado

**Nenhuma ação necessária** no backend. A rota já está protegida.

---

## 🏗️ Plano de Execução

### Fase 1 — CSS Override para Modais + Carrinho (HIGH PRIORITY)

**Estratégia:** Adicionar um bloco `<style>` em cada tema lite que define fallbacks CSS para as classes Tailwind do tema escuro usadas pelo JS compartilhado. Isso evita alterar os JS compartilhados (que também servem o tema padrão).

**Classes que precisam de fallback em cada tema:**

```css
/* Modal (orderModal.js) */
.bg-dark-800    { background-color: #1e293b; }  /* ou cor do tema */
.bg-dark-900    { background-color: #0f172a; }
.bg-black\/80   { background-color: rgba(0,0,0,0.8); }  /* ← já existe no CSS */
.text-white     { color: #fff; }                         /* ← já existe */
.text-gray-400  { color: #9ca3af; }                      /* ← já existe */
.border-white\/10 { border-color: rgba(255,255,255,0.1); }
.focus\:border-brand-400:focus { border-color: var(--brand); }

/* Carrinho (cartUI.js) */
.bg-brand-500   { background-color: var(--brand); }
.bg-brand-600   { background-color: var(--brand-dark); }
.hover\:bg-brand-600:hover { background-color: var(--brand-dark); }
```

**Arquivos a modificar (4):**
- `themes/restaurant-lite/index.html` — adicionar `<style>` no `<head>`
- `themes/burger-lite/index.html` — idem
- `themes/pizza-lite/index.html` — idem
- `themes/acai/index.html` — idem

**Também aplicar em `menu.html` e `contact.html`** de cada tema (pois modais/carrinho funcionam em todas as páginas).

**Total: ~12 arquivos** (3 páginas × 4 temas)

---

### Fase 2 — Botões: Tamanho + Cursor

**Ação:** Revisar e ajustar CSS de `.add-btn` em cada tema.

- Aumentar de `28×28px` para `36×36px` mínimo
- Garantir `cursor: pointer` em TODOS os botões interativos
- Adicionar hover state visível (escala ou cor)

**Arquivos a modificar (8):**
- `themes/*/index.html` (seção `<style>`)
- `themes/*/menu.html` (seção `<style>`)

---

### Fase 3 — Burger-lite Layout Fix

**Problema:** Layout principal possivelmente com container sem centrar corretamente, ou faltando padding.

**Ação:**
- Auditar `burger-lite/index.html` — verificar se `max-width:900px; margin:0 auto` está aplicado corretamente a todas as seções
- Corrigir alinhamento/padding do hero, destaques, e seções
- Verificar responsividade mobile

**Arquivos a modificar (2-3):**
- `themes/burger-lite/index.html`
- `themes/burger-lite/menu.html`
- `themes/burger-lite/contact.html` (se necessário)

---

### Fase 4 — Remover "Faça Upgrade"

Os temas lite são **exclusivamente Starter** — não há upgrade disponível.

**Ações:**
- **restaurant-lite/admin.html:**
  - Linha 908: Remover texto "faça upgrade do plano" do card de limite
  - Linha 1459: Alterar toast de pratos → apenas "Limite de X pratos atingido."
  - Linha 1496: Alterar toast de categorias → apenas "Limite de X categorias."

- **burger-lite/admin.html:**
  - Linha 983: Alterar toast de pratos → apenas "Limite de X pratos atingido."
  - Linha 1025: Alterar toast de categorias → apenas "Limite de X categorias."

- **pizza-lite/admin.html:** Sem matches — verificar se existe texto similar
- **acai/admin.html:** Sem matches — verificar se existe texto similar

**Arquivos a modificar (2-4):**
- `themes/restaurant-lite/admin.html`
- `themes/burger-lite/admin.html`
- Verificar os demais

---

### Fase 5 — Pizza-lite Menu: Verificar Botões

Na sessão anterior, foi adicionado JS completo ao `menu.html` de todos os temas lite. O botão `+` foi incluído no `renderDishes()`.

**Ação:**
- Verificar que o CSS de `.add-btn` está presente e visível
- Confirmar que o botão tem tamanho adequado e cor contrastante
- Testar visualmente se o fix anterior resolveu

**Arquivo:** `themes/pizza-lite/menu.html`

---

### Fase 6 — Seção Localização

**Problema:** Layout de 2 colunas com grid que pode parecer "quebrado" em certos viewports.

**Ação:**
- Revisar estrutura do grid de localização em cada tema
- Melhorar padding, espaçamento, e responsividade
- Considerar tornar single-column em mobile

**Arquivos a modificar (4):**
- `themes/*/contact.html` ou seção de localização em `index.html`

---

### Fase 7 — Layout "Mais Pedidos" (Featured Dishes)

**Problema:** Grid `auto-fill` com `200px min` e `140px` de altura de imagem pode ficar desalinhado.

**Ação:**
- Ajustar grid de destaques em cada tema
- Melhorar cards com padding, border-radius, shadow consistentes
- Garantir que o fallback de imagem (emoji) fica centralizado
- Tornar responsivo (1 coluna mobile, 2-3 desktop)

**Arquivos a modificar (4):**
- `themes/*/index.html` (seção featured)

---

### Fase 8 — Admin Panel (DECISÃO NECESSÁRIA)

#### Opção A: Adaptar admin.html padrão → lite ✅ **(RECOMENDADO)**

O `restaurante/admin.html` padrão é:
- ✅ Totalmente funcional (CRUD completo, password change, QR code)
- ✅ Seguro (CSRF tokens, XSS-safe rendering, input validation)
- ✅ Responsivo (mobile-first com sidebar collapsible)
- ✅ Dark mode consistente
- ✅ Rate limiting já integrado no backend

**Plano de adaptação:**
1. Copiar `restaurante/admin.html` como base
2. Remover features que não existem no plano Starter:
   - Team management
   - QR Code generation
   - Pro badge overlay
   - Advanced analytics
3. Manter limites do Starter (DISH_LIMIT, CAT_LIMIT)
4. Adaptar fontes e cores de cada tema via CSS variables
5. Remover qualquer menção a "upgrade"

**Prós:** Herda toda a segurança e UX já validada, manutenção centralizada.  
**Contras:** Admin terá visual dark (diferente do tema lite), mas isso é ACEITÁVEL pois admin é ferramenta interna.

#### Opção B: Consertar os admin.html lite atuais ❌

**Prós:** Mantém identidade visual light de cada tema.  
**Contras:** 4 arquivos diferentes para manter, segurança duvidosa, layout já está quebrado, refazer do zero é mais trabalho que adaptar.

> **🟢 Recomendação: Opção A** — Copiar o admin padrão e adaptar. O usuário já sugeriu isso e faz sentido técnico.

---

### Fase 9 — Verificação Final

- [ ] Rodar `jest` → 59/59 passando
- [ ] Verificar visualmente cada tema em 3 viewports (mobile/tablet/desktop)
- [ ] Confirmar modais/carrinho opacos e funcionais
- [ ] Confirmar botões com tamanho adequado e cursor pointer
- [ ] Confirmar ausência de "faça upgrade" nos lite themes

---

## 📊 Resumo de Impacto

| Fase | Arquivos | Esforço | Impacto |
|------|---------|---------|---------|
| 1 — Modais/Carrinho CSS | ~12 | Alto | ⭐⭐⭐⭐⭐ |
| 2 — Botões | ~8 | Baixo | ⭐⭐⭐ |
| 3 — Burger Layout | 2-3 | Médio | ⭐⭐⭐⭐ |
| 4 — Remover Upgrade | 2-4 | Baixo | ⭐⭐ |
| 5 — Pizza Botões | 1 | Baixo | ⭐⭐ |
| 6 — Localização | 4 | Médio | ⭐⭐⭐ |
| 7 — Mais Pedidos | 4 | Médio | ⭐⭐⭐ |
| 8 — Admin Panel | 4 | Alto | ⭐⭐⭐⭐⭐ |
| 9 — Verificação | 0 | Baixo | ⭐⭐⭐⭐⭐ |

---

## ⏳ Ordem de Execução Recomendada

1. **Fase 1** (Modais/Carrinho) — impacto visual imediato
2. **Fase 8** (Admin) — resolve alinhamento, segurança, upgrade text de uma vez
3. **Fase 3** (Burger layout) — tema mais quebrado
4. **Fase 2** (Botões) — quick win
5. **Fase 7** (Mais Pedidos) — visual polish
6. **Fase 6** (Localização) — visual polish
7. **Fase 4** (Upgrade text) — se não foi resolvido pela Fase 8
8. **Fase 5** (Pizza botões) — verificação
9. **Fase 9** (Verificação final)

---

> **⚠️ AGUARDANDO APROVAÇÃO DO USUÁRIO ANTES DE EXECUTAR.**
