# ⚙️ Manutenção Rápida — Sistema de Pedidos

## 🎨 Customizações Comuns

### Mudar Cores dos Botões

**Quick Order (Verde → Azul):**
```javascript
// Em menu.html e index.html, procure:
bg-green-600 hover:bg-green-700

// Substitua por:
bg-blue-600 hover:bg-blue-700
```

**Carrinho (Laranja → Roxo):**
```javascript
// Procure:
bg-brand-500 hover:bg-brand-600

// Substitua por:
bg-purple-600 hover:bg-purple-700
```

---

### Mudar Textos dos Botões

**"Pedir Agora" → "Comprar":**
```html
<!-- Em menu.html linha ~238 -->
Pedir Agora
↓
Comprar
```

**"Adicionar" → "Adicionar ao Carrinho":**
```html
<!-- Em menu.html linha ~246 -->
Adicionar
↓
Adicionar ao Carrinho
```

---

### Customizar Mensagem WhatsApp

**Arquivo:** `public/js/whatsappFormatter.js`

**Quick Order:**
```javascript
// Linha ~17
function formatQuickOrder(dish, customerData) {
    const lines = [
        '🍽️ *Pedido Rápido*',  // ← Mude aqui
        '',
        `📦 1x ${sanitizeText(dish.name)} - ${formatPrice(dish.price)}`,
        // ...
    ];
```

**Cart Order:**
```javascript
// Linha ~32
function formatCartOrder(cartItems, customerData) {
    const lines = [
        '🍽️ *Novo Pedido*',  // ← Mude aqui
        '',
        '📋 *Itens:*',  // ← Ou aqui
        // ...
    ];
```

---

### Adicionar Campo Extra no Formulário

**Exemplo:** Adicionar campo "Bairro"

**1. Modal HTML** (`public/js/orderModal.js` linha ~52):
```html
<div>
    <label class="block text-sm text-gray-400 mb-2">Bairro *</label>
    <input type="text" name="neighborhood" required maxlength="50"
        class="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-400 focus:outline-none"
        placeholder="Centro">
</div>
```

**2. Capturar valor** (`public/js/orderModal.js` linha ~109):
```javascript
const customerData = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    neighborhood: formData.get('neighborhood'),  // ← Adicione
    notes: formData.get('notes'),
};
```

**3. Adicionar na mensagem** (`public/js/whatsappFormatter.js`):
```javascript
lines.push(`📍 *Endereço:* ${sanitizeText(customerData.address)}`);
lines.push(`🏘️ *Bairro:* ${sanitizeText(customerData.neighborhood)}`);  // ← Adicione
```

---

### Remover Carrinho (Deixar Só Quick Order)

**Arquivos a modificar:**
- `public/index.html`
- `public/menu.html`
- `public/gallery.html`
- `public/about.html`
- `public/contact.html`

**Remover estas linhas:**
```html
<script src="/js/cart.js"></script>
<script src="/js/cartUI.js"></script>
```

**E remover botões "Adicionar":**
```html
<!-- Deletar este bloco inteiro -->
<button onclick="addToCart(...)" class="...">
    <svg>...</svg>
    Adicionar
</button>
```

**Manter:**
- `orderModal.js` (usado pelo quick order)
- `whatsappFormatter.js` (usado pelo quick order)
- Botões "Pedir Agora"

---

## 🔧 Problemas Comuns

### Carrinho não salva entre páginas

**Causa:** localStorage desabilitado ou privado mode  
**Solução:** Não há. É limitação do navegador. Quick order continuará funcionando.

---

### Modal abre mas não envia

**Causa:** Número WhatsApp não configurado  
**Onde:** Admin Panel → Configurações → `whatsapp_number`  
**Formato:** `5511999998888` (sem espaços, com DDI)

**Verificar via Console:**
```javascript
fetch('/api/config')
  .then(r => r.json())
  .then(d => console.log(d.data.whatsapp_number))
// Deve retornar número
```

---

### Badge não aparece

**Causa 1:** cartUI.js não carregou  
**Verificar:** Console → `window.cartUI` (deve retornar objeto)  
**Solução:** Refresh forçado (Ctrl+Shift+R)

**Causa 2:** CSS conflito  
**Verificar:** DevTools → Inspecionar badge → ver se `hidden` está aplicado  
**Solução:** Forçar visibilidade:
```javascript
document.getElementById('cart-count').classList.remove('hidden');
```

---

### WhatsApp abre mas mensagem cortada

**Causa:** URL muito longa (limite ~2000 caracteres)  
**Solução:** Reduzir tamanho da mensagem em `whatsappFormatter.js`:
```javascript
// Linha ~7
.slice(0, 300);  // Era 500, reduza para 300
```

---

### Animações travadas/lentas

**Causa:** Muitos elementos na página  
**Solução:** Remover animações:
```css
/* Em menu.html ou index.html, adicione: */
<style>
.reveal, .card-hover {
    transition: none !important;
}
</style>
```

---

## 📱 Compatibilidade

### Navegadores Suportados

✅ Chrome 90+ (100% funcional)  
✅ Firefox 88+ (100% funcional)  
✅ Safari 14+ (100% funcional)  
✅ Edge 90+ (100% funcional)  
⚠️ IE11 (não suportado, use polyfills)

---

### Mobile Browsers

✅ Chrome Android (100% funcional)  
✅ Safari iOS (100% funcional)  
✅ Samsung Internet (100% funcional)  
✅ Firefox Mobile (100% funcional)

---

### Features por Browser

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| localStorage | ✅ | ✅ | ✅ | ✅ |
| Arrow Functions | ✅ | ✅ | ✅ | ✅ |
| Template Literals | ✅ | ✅ | ✅ | ✅ |
| Classes (ES6) | ✅ | ✅ | ✅ | ✅ |
| WhatsApp API | ✅ | ✅ | ✅ | ✅ |

---

## 🚨 Troubleshooting Avançado

### Console mostra "cart is not defined"

**Causa:** Scripts carregando fora de ordem  
**Solução:** Garantir ordem correta:
```html
<script src="/js/cart.js"></script>           <!-- 1º -->
<script src="/js/whatsappFormatter.js"></script> <!-- 2º -->
<script src="/js/orderModal.js"></script>      <!-- 3º -->
<script src="/js/cartUI.js"></script>          <!-- 4º (depende de cart) -->
```

---

### Modal abre mas campos estão vazios

**Causa:** Formulário não renderizou  
**Solução:** Verificar se `orderModal.init()` foi chamado:
```javascript
// Console
window.orderModal
// Deve retornar OrderModal {modal: div, ...}
```

Se retornar `undefined`:
```javascript
// Adicione ao final de orderModal.js
console.log('OrderModal inicializado');
```

---

### Carrinho duplica itens

**Causa:** Função `add()` sendo chamada 2x  
**Solução:** Verificar se botão tem `onclick` duplicado:
```html
<!-- Errado: -->
<button onclick="addToCart(...)" onclick="addToCart(...)">

<!-- Correto: -->
<button onclick="addToCart(...)">
```

---

### WhatsApp não abre em Safari iOS

**Causa:** Safari bloqueia window.open() em alguns contextos  
**Solução:** Usar `location.href` em vez de `window.open()`:
```javascript
// Em whatsappFormatter.js linha ~56
// Antes:
window.open(url, '_blank');

// Depois:
if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    location.href = url;
} else {
    window.open(url, '_blank');
}
```

---

## 📦 Deploy em Produção

### Checklist Pré-Deploy

- [ ] Número WhatsApp configurado no admin
- [ ] Testar quick order em produção
- [ ] Testar carrinho em produção
- [ ] Verificar HTTPS (WhatsApp requer)
- [ ] Testar em mobile real
- [ ] Verificar localStorage em modo privado
- [ ] Limpar console.log() dos arquivos JS

---

### Otimizações Recomendadas

**1. Minificar JS:**
```bash
npm install -g terser

terser public/js/cart.js -o public/js/cart.min.js
terser public/js/whatsappFormatter.js -o public/js/whatsappFormatter.min.js
terser public/js/orderModal.js -o public/js/orderModal.min.js
terser public/js/cartUI.js -o public/js/cartUI.min.js
```

**2. Atualizar imports:**
```html
<script src="/js/cart.min.js"></script>
<script src="/js/whatsappFormatter.min.js"></script>
<script src="/js/orderModal.min.js"></script>
<script src="/js/cartUI.min.js"></script>
```

**3. Adicionar cache headers no servidor:**
```typescript
// Em server/src/app.ts
app.use('/js', express.static('public/js', {
    maxAge: '7d',  // Cache 7 dias
    etag: true
}));
```

---

## 🔐 Segurança em Produção

### Validação Server-Side (Opcional)

Se quiser adicionar validação no backend (não é necessário, mas é boa prática):

**Criar endpoint de validação:**
```typescript
// server/src/routes/orders.ts (criar novo arquivo)
import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const orderSchema = z.object({
    name: z.string().min(1).max(100),
    phone: z.string().min(10).max(20),
    address: z.string().min(1).max(200),
    notes: z.string().max(500).optional(),
    items: z.array(z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        quantity: z.number().int().min(1)
    }))
});

router.post('/validate', (req, res) => {
    try {
        orderSchema.parse(req.body);
        res.json({ valid: true });
    } catch (error) {
        res.status(400).json({ valid: false, errors: error.errors });
    }
});

export default router;
```

**Usar no frontend:**
```javascript
// Antes de abrir WhatsApp
const isValid = await fetch('/api/orders/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...customerData, items: cart.items })
}).then(r => r.json());

if (!isValid.valid) {
    alert('Dados inválidos');
    return;
}
```

---

### Rate Limiting (Opcional)

Para evitar spam, adicione rate limit ao endpoint de validação:

```typescript
// server/src/app.ts
import rateLimit from 'express-rate-limit';

const orderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10 // 10 pedidos por IP
});

app.use('/api/orders', orderLimiter);
```

---

## 📊 Monitoramento (Opcional)

### Google Analytics Events

Adicionar tracking de eventos:

```javascript
// Em orderModal.js, após enviar pedido:
if (window.gtag) {
    gtag('event', this.isCartMode ? 'cart_order' : 'quick_order', {
        'event_category': 'orders',
        'event_label': this.isCartMode ? 
            `${window.cart.items.length} items` : 
            this.currentDish.name,
        'value': this.isCartMode ? 
            window.cart.getTotal() / 100 : 
            this.currentDish.price / 100
    });
}
```

---

## 🎓 Recursos Adicionais

### Documentação Completa
- `HYBRID_ORDERING_SYSTEM.md` → 31 páginas, análise comercial + técnica
- `ORDER_SYSTEM_SUMMARY.md` → Resumo executivo
- `TESTING_GUIDE.md` → Guia de testes completo

### Arquivos do Sistema
- `public/js/cart.js` → 60 linhas, lógica de carrinho
- `public/js/whatsappFormatter.js` → 64 linhas, formatação segura
- `public/js/orderModal.js` → 195 linhas, modal + validação
- `public/js/cartUI.js` → 146 linhas, interface visual

**Total:** ~465 linhas de código limpo e documentado.

---

## ✅ Manutenção Preventiva

### Checklist Mensal

- [ ] Testar quick order em produção
- [ ] Testar carrinho em produção
- [ ] Verificar Console → erros JS?
- [ ] Verificar número WhatsApp ainda válido
- [ ] Verificar localStorage funcionando
- [ ] Testar em Safari iOS (comum mudar)
- [ ] Revisar feedback de clientes

---

### Atualizações Recomendadas

**A cada 3 meses:**
- Revisar mensagens WhatsApp (cliente pediu mudanças?)
- Verificar novos navegadores (compatibilidade)
- Otimizar imagens (se carrinho ficou lento)
- Revisar localStorage (limpar dados antigos?)

**A cada 6 meses:**
- Considerar features novas (histórico de pedidos?)
- Revisar GA events (o que converter mais?)
- A/B test cores de botões (verde vs azul?)

---

## 🆘 Suporte Emergencial

### Sistema não funciona DE JEITO NENHUM

**Fallback rápido:**
1. Remover todos os scripts do carrinho
2. Adicionar link simples:
```html
<a href="https://wa.me/5511999998888?text=Olá, gostaria de fazer um pedido" 
   class="btn btn-primary">
    Fazer Pedido pelo WhatsApp
</a>
```
3. Cliente pelo menos consegue entrar em contato

---

### Reverter para versão anterior

Se fez backup antes de implementar:
```bash
# Copiar backup
cp -r backup_before_ordering/* public/

# Restart server
npm run dev
```

Se não fez backup, reverter commits:
```bash
git log --oneline
git checkout <commit_hash_anterior>
```

---

**Qualquer dúvida adicional, consulte os 3 arquivos de documentação completa! 📚**
