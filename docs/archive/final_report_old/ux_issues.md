# 🎯 UX Issues Report — Final Audit

> Gerado em: 12/02/2026

---

## 🔴 CRÍTICOS (Impactam usabilidade diretamente)

### UX-001: CDN Tailwind em produção (TODOS os .html)
**Arquivos**: Todos os 8 HTML públicos  
**Problema**: `<script src="https://cdn.tailwindcss.com">` é o compilador JIT runtime — projetado APENAS para prototipagem. Em produção:
- Adiciona ~300KB de JS bloqueante
- Compila CSS no browser (lento em mobile)
- Causa FOUC (flash of unstyled content)
- Pode quebrar em conexões lentas (3G)

**Correção**: 
```bash
# Build CSS estático:
npx tailwindcss -o public/css/styles.css --minify
# Substituir script por <link rel="stylesheet">
```

---

### UX-002: FOUC em todas as páginas (placeholder visível)
**Arquivos**: public/index.html, contact.html, about.html  
**Problema**: Dados de placeholder ("Endereço da Loja", "(00) 00000-0000", "Sabor & Arte") ficam visíveis por 200-500ms até o JavaScript carregar a config da API e substituir.  
**Impacto**: Parece amador para o cliente do restaurante.

**Correção mínima**:
```css
/* Ocultar conteúdo dinâmico até config carregar */
[data-config] { visibility: hidden; }
.config-loaded [data-config] { visibility: visible; }
```
```javascript
// Após carregar config:
document.body.classList.add('config-loaded');
```

---

### UX-003: apiAuth() sem try/catch (admin.html)
**Arquivo**: public/admin.html  
**Problema**: A função `apiAuth()` não tem try/catch ao redor do `fetch()`. Se a rede cair ou o servidor estiver fora, o erro silencioso deixa o admin sem feedback.  
**Impacto**: Admin clica em salvar → nada acontece → frustração.

**Correção**:
```javascript
async function apiAuth(url, options = {}) {
    try {
        const res = await fetch(url, { ...options, headers: { ...headers } });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw new Error(err.error || `HTTP ${res.status}`);
        }
        return await res.json();
    } catch (err) {
        showToast(err.message || 'Erro de conexão. Verifique sua internet.', 'error');
        throw err;
    }
}
```

---

## 🟡 ALTOS (Afetam a experiência mas não bloqueiam)

### UX-004: Falta de loading states em operações do admin
**Arquivo**: public/admin.html  
**Problema**: Ao salvar prato, categoria, config, etc., não há indicador visual de carregamento. O botão não desabilita, não muda de texto, não mostra spinner.  
**Impacto**: Usuário clica múltiplas vezes → requests duplicados.

**Correção**:
```javascript
function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.dataset.originalText = btn.dataset.originalText || btn.textContent;
    btn.textContent = loading ? 'Salvando...' : btn.dataset.originalText;
}
```

---

### UX-005: Menu page sem feedback de erro
**Arquivo**: public/menu.html  
**Problema**: Se `loadMenu()` falha (API fora), a página mostra apenas "Carregando cardápio..." eternamente. Sem botão de retry, sem mensagem de erro.

**Correção**:
```javascript
} catch (err) {
    menuContainer.innerHTML = `
        <div class="text-center py-12">
            <p class="text-gray-400">Não foi possível carregar o cardápio.</p>
            <button onclick="loadMenu()" class="mt-4 text-brand-400 underline">Tentar novamente</button>
        </div>`;
}
```

---

### UX-006: verifyPrices silenciosamente permite checkout com preços errados
**Arquivo**: public/js/cart.js  
**Problema**: Se a verificação de preços falha por rede, o checkout prossegue silenciosamente com preços potencialmente desatualizados.

**Correção**: Mostrar aviso ao usuário:
```javascript
catch(err) {
    console.error('Price verify failed', err);
    showToast('⚠️ Não foi possível verificar preços. Valores podem estar desatualizados.', 'warning');
    return true; // allow but warn
}
```

---

### UX-007: Cart sidebar sem feedback visual ao atingir limite
**Arquivo**: public/js/cart.js  
**Problema**: `addItem()` silenciosamente não adiciona quando max items (50) ou max quantity (99) é atingido. Nenhum feedback visual.

**Correção**:
```javascript
if (this.items.length >= MAX_ITEMS) {
    this.emit('limitReached', { type: 'items', max: MAX_ITEMS });
    return false;
}
```
No cartUI: escutar evento e mostrar toast.

---

### UX-008: whatsappFormatter usa console.error em vez de toast
**Arquivo**: public/js/whatsappFormatter.js (3 locais)  
**Problema**: Erros de formatação vão apenas para `console.error` — usuário não vê nada.

**Correção**: Substituir `console.error` por toast:
```javascript
if (typeof showToast === 'function') showToast('Erro ao formatar mensagem', 'error');
```

---

### UX-009: editDish via JSON.stringify no onclick (admin.html)
**Arquivo**: public/admin.html  
**Problema**: `onclick='editDish(${JSON.stringify(d).replace(...)})'` quebra com caracteres especiais em nomes de pratos (aspas, emojis, barras). Prato com `"Pizza "Especial"` crasheia o admin.  
**Impacto**: Admin quebra ao tentar editar pratos com nomes exóticos.

**Correção**: Usar data attributes + event delegation (ver bugs.json BUG-008).

---

## 🟢 MÉDIOS (Melhorias de polimento)

### UX-010: printQRCode usa document.write()
**Arquivo**: public/admin.html  
**Problema**: `document.write()` em janela popup pode ser bloqueado por popup blockers. Em alguns browsers, causa warning de segurança.

**Correção**: Usar iframe oculto para impressão.

---

### UX-011: Loading states genéricos ("Carregando...")
**Arquivos**: public/index.html (3 locais), about.html, gallery.html  
**Problema**: Texto "Carregando..." sem animação, sem skeleton, sem spinner. Parece genérico e inacabado.

**Correção rápida** (skeleton CSS):
```html
<div class="animate-pulse bg-gray-700 rounded h-6 w-3/4 mb-2"></div>
<div class="animate-pulse bg-gray-700 rounded h-4 w-1/2"></div>
```

---

### UX-012: Nenhuma confirmação visual após salvar config (admin)
**Arquivo**: public/admin.html  
**Problema**: Após `saveConfig()`, o toast aparece mas a página não indica visualmente que os dados foram salvos. Não há "✅ Salvo" persistente no botão.

**Correção**:
```javascript
saveBtn.textContent = '✅ Salvo!';
setTimeout(() => saveBtn.textContent = 'Salvar Configurações', 2000);
```

---

### UX-013: Duplicate API calls
**Arquivo**: public/js/orderModal.js  
**Problema**: `orderModal.js` faz um segundo `fetch('/api/config')` que já foi feito por `app.js`. Desperdiça uma requisição HTTP por modal aberto.

**Correção**: Usar `window._siteConfig` já carregado:
```javascript
const config = window._siteConfig || await fetch('/api/config').then(r => r.json()).then(d => d.data);
```

---

### UX-014: renderDishes usa innerHTML (menu.html) — resets scroll
**Arquivo**: public/menu.html  
**Problema**: `menuGrid.innerHTML = html` ao filtrar categorias faz scroll position resetar para o topo do grid. Usuário perde sua posição.

**Correção**: Usar `requestAnimationFrame` + scroll restoration:
```javascript
const scrollY = window.scrollY;
menuGrid.innerHTML = html;
window.scrollTo(0, scrollY);
```

---

## 📊 Resumo

| Severidade | Qtd | Exemplos |
|-----------|-----|----------|
| 🔴 Crítico | 3 | CDN Tailwind, FOUC, apiAuth sem try/catch |
| 🟡 Alto | 6 | Loading states, verificação preços, cart limits |
| 🟢 Médio | 5 | Skeletons, duplicate API, scroll reset |

**Esforço total para corrigir tudo**: ~8-12 horas

**Top 3 quick wins** (30min cada):
1. Adicionar try/catch no `apiAuth()` (UX-003)
2. Feedback de erro no menu.html (UX-005)
3. Toast no whatsappFormatter (UX-008)
