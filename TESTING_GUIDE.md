# 🧪 Guia de Testes — Sistema de Pedidos

## 🚀 Servidor Rodando

✅ **URL:** http://localhost:3000  
✅ **Status:** Online  
✅ **Modo:** Development

---

## 📋 Testes Essenciais

### 1️⃣ Teste Quick Order (Pedido Rápido)

#### Passo a Passo:
1. Abra: http://localhost:3000/menu
2. Escolha qualquer prato
3. Clique no botão verde **"Pedir Agora"**
4. ✅ **Deve:** Modal abrir com formulário
5. Preencha:
   - Nome: João Silva
   - Telefone: (11) 99999-8888
   - Endereço: Rua Teste, 123
   - Obs: Sem cebola
6. Clique **"Enviar pelo WhatsApp"**
7. ✅ **Deve:** Abrir WhatsApp com mensagem formatada:
   ```
   🍽️ Pedido Rápido
   📦 1x [Nome do Prato] - R$ XX,XX
   👤 Nome: João Silva
   📞 Telefone: (11) 99999-8888
   📍 Endereço: Rua Teste, 123
   💬 Obs: Sem cebola
   ```

#### O Que Verificar:
- ✅ Modal abre corretamente
- ✅ Campos estão validando (required)
- ✅ Modal fecha com ESC
- ✅ Modal fecha clicando fora
- ✅ WhatsApp abre com mensagem formatada
- ✅ Nome do prato está correto
- ✅ Preço está correto

---

### 2️⃣ Teste Carrinho (Múltiplos Itens)

#### Passo a Passo:
1. Ainda em http://localhost:3000/menu
2. Clique no botão laranja **"Adicionar"** em 3 pratos diferentes
3. ✅ **Deve:** 
   - Toast aparecer: "✓ Adicionado ao carrinho"
   - Badge vermelho no ícone do carrinho (canto inferior direito)
   - Número aumentando (1 → 2 → 3)
4. Clique no **ícone do carrinho flutuante**
5. ✅ **Deve:** Sidebar abrir pela direita
6. Verifique:
   - ✅ 3 itens listados
   - ✅ Imagens aparecendo (se disponíveis)
   - ✅ Preços corretos
   - ✅ Botões + e - funcionando
7. Teste aumentar quantidade de um item (clique +)
8. ✅ **Deve:** 
   - Quantidade aumentar
   - Total atualizar
   - Badge atualizar
9. Clique **"Finalizar Pedido"**
10. ✅ **Deve:** Modal abrir com resumo do pedido
11. Veja o resumo:
    - ✅ Lista de itens com quantidades
    - ✅ Total calculado corretamente
12. Preencha formulário e envie
13. ✅ **Deve:** WhatsApp abrir com:
    ```
    🍽️ Novo Pedido
    
    📋 Itens:
    • 2x Prato A - R$ XX,XX
    • 1x Prato B - R$ XX,XX
    • 1x Prato C - R$ XX,XX
    
    💰 Total: R$ XXX,XX
    
    👤 Nome: ...
    📞 Telefone: ...
    📍 Endereço: ...
    ```
14. ✅ **Deve:** Carrinho limpar após envio

#### O Que Verificar:
- ✅ Toast aparece ao adicionar
- ✅ Badge atualiza corretamente
- ✅ Sidebar abre/fecha suavemente
- ✅ Quantidades aumentam/diminuem
- ✅ Remover item funciona
- ✅ Total calcula certo
- ✅ Resumo no modal está correto
- ✅ Carrinho limpa após pedido

---

### 3️⃣ Teste Persistência (localStorage)

#### Passo a Passo:
1. Adicione 2 itens ao carrinho
2. ✅ **Deve:** Badge mostrar "2"
3. **Recarregue a página** (F5)
4. ✅ **Deve:** Badge continuar mostrando "2"
5. Abra o carrinho
6. ✅ **Deve:** Itens ainda lá
7. Navegue para http://localhost:3000 (homepage)
8. ✅ **Deve:** Badge ainda visível (2 itens)
9. Navegue para http://localhost:3000/about
10. ✅ **Deve:** Badge ainda visível
11. Volte para /menu e finalize pedido
12. ✅ **Deve:** Badge desaparecer após finalizar

#### O Que Verificar:
- ✅ Carrinho sobrevive refresh
- ✅ Carrinho visível em todas páginas
- ✅ Carrinho limpa após finalizar

---

### 4️⃣ Teste Homepage (Destaques)

#### Passo a Passo:
1. Vá para http://localhost:3000
2. Role até "Nossos Pratos Especiais"
3. ✅ **Deve:** Cada prato ter 2 botões:
   - Verde: "Pedir Agora"
   - Laranja: "Adicionar"
4. Teste "Pedir Agora" em um destaque
5. ✅ **Deve:** Mesmo comportamento do menu
6. Teste "Adicionar" em um destaque
7. ✅ **Deve:** 
   - Toast aparecer
   - Badge atualizar
   - Item no carrinho

#### O Que Verificar:
- ✅ Botões aparecem nos destaques
- ✅ Funcionalidade idêntica ao menu
- ✅ Layout responsivo

---

### 5️⃣ Teste Mobile (Responsividade)

#### Passo a Passo:
1. Abra DevTools (F12)
2. Ative modo mobile (Ctrl+Shift+M)
3. Selecione "iPhone SE" ou similar
4. Repita todos testes anteriores
5. Verifique especificamente:
   - ✅ Botões são touch-friendly (grandes o suficiente)
   - ✅ Modal ocupa tela toda em mobile
   - ✅ Sidebar ocupa tela toda em mobile
   - ✅ Carrinho flutuante não cobre conteúdo importante
   - ✅ Toast aparece visível no topo

---

### 6️⃣ Teste Segurança (Sanitização)

#### Passo a Passo:
1. Adicione 1 item ao carrinho
2. Clique "Finalizar Pedido"
3. No formulário, tente inserir:
   - **Nome:** `<script>alert('XSS')</script>`
   - **Telefone:** `<img src=x onerror=alert(1)>`
   - **Endereço:** `{{constructor.constructor('alert(1)')()}}`
   - **Obs:** `'; DROP TABLE users; --`
4. Envie
5. ✅ **Deve:** WhatsApp abrir SEM executar scripts
6. Verifique mensagem:
   - ✅ Tags HTML removidas
   - ✅ Caracteres especiais sanitizados
   - ✅ Nenhum código executado

---

### 7️⃣ Teste Validação

#### Passo a Passo:
1. Clique "Pedir Agora"
2. Tente enviar formulário vazio
3. ✅ **Deve:** Navegador mostrar "Preencha este campo"
4. Preencha só Nome
5. ✅ **Deve:** Pedir Telefone
6. Tente colar texto gigante (>500 caracteres) em Observações
7. ✅ **Deve:** Cortar em 500 caracteres

---

### 8️⃣ Teste Edge Cases

#### Teste 1: Carrinho Vazio
1. Clique no carrinho flutuante (sem itens)
2. ✅ **Deve:** Mostrar "Carrinho vazio" com ícone
3. Botão "Finalizar" deve estar disponível
4. Clicar nele ✅ **Deve:** Mostrar toast de erro

#### Teste 2: Item com Nome Grande
1. Via admin, crie prato com nome: "Super Mega Hiper X-Burger Bacon Cheddar Supreme Deluxe Grande"
2. Adicione ao carrinho
3. ✅ **Deve:** Layout não quebrar

#### Teste 3: Muitos Itens
1. Adicione 10+ pratos diferentes
2. ✅ **Deve:** 
   - Sidebar ter scroll
   - Badge mostrar número correto
   - Mensagem WhatsApp não cortar

#### Teste 4: Caracteres Especiais
1. Prato com nome: "Açaí & Granola — R$ 15"
2. ✅ **Deve:** Renderizar corretamente
3. Mensagem WhatsApp ✅ **Deve:** Codificar URLs corretamente

---

## 🐛 Problemas Comuns e Soluções

### Problema: "Número do WhatsApp não configurado"
**Solução:**
1. Faça login no admin: http://localhost:3000/admin
2. Credenciais: admin@restaurante.com / admin123
3. Vá em "Configurações"
4. Procure campo "whatsapp_number"
5. Adicione número com DDI: `5511999998888` (sem espaços)
6. Salve

### Problema: Modal não abre
**Solução:**
1. Abra Console (F12)
2. Veja se há erros JavaScript
3. Verifique se scripts estão carregando:
   - cart.js
   - orderModal.js
   - whatsappFormatter.js
   - cartUI.js
4. Se faltar algum, refresh forçado (Ctrl+Shift+R)

### Problema: WhatsApp abre mas mensagem está vazia
**Solução:**
1. Verifique se número tem DDI correto (+55)
2. Verifique se formatPrice() está retornando valor
3. Console (F12) → veja se há erro em whatsappFormatter.js

### Problema: Carrinho não persiste
**Solução:**
1. Verifique se localStorage está habilitado no navegador
2. Firefox: about:config → dom.storage.enabled = true
3. Chrome: Settings → Privacy → Cookies → Allow all

### Problema: Badge não atualiza
**Solução:**
1. Verifique se cartUI.js está carregado
2. Console: digite `window.cart.items` → deve retornar array
3. Se retornar undefined, cart.js não carregou

---

## ✅ Checklist Final

Antes de considerar pronto, verifique:

### Funcional
- [ ] Quick order abre modal
- [ ] Formulário valida campos obrigatórios
- [ ] WhatsApp abre com mensagem formatada (quick)
- [ ] Carrinho adiciona itens
- [ ] Badge atualiza corretamente
- [ ] Sidebar abre/fecha
- [ ] Quantidades aumentam/diminuem
- [ ] Remover item funciona
- [ ] Total calcula corretamente
- [ ] WhatsApp abre com mensagem formatada (cart)
- [ ] Carrinho limpa após pedido
- [ ] localStorage persiste carrinho

### Visual
- [ ] Toast aparece ao adicionar
- [ ] Modal tem animação suave
- [ ] Sidebar desliza da direita
- [ ] Badge vermelho é visível
- [ ] Botões têm hover states
- [ ] Responsivo em mobile
- [ ] Sem quebra de layout

### Segurança
- [ ] XSS não executa (<script> removido)
- [ ] Validação maxlength funciona
- [ ] URL encoding correto
- [ ] Sanitização em todos inputs

### Performance
- [ ] Scripts carregam sem erro
- [ ] Sem console.error() vermelho
- [ ] Animações são suaves (60fps)
- [ ] localStorage não trava

---

## 🎉 Sucesso!

Se todos os testes passaram, o sistema está **100% funcional** e pronto para demonstração ao cliente.

**Próxima etapa:** Mostrar ao restaurante usando o script de vendas em `ORDER_SYSTEM_SUMMARY.md`

---

**Servidor:** http://localhost:3000  
**Admin:** http://localhost:3000/admin (admin@restaurante.com / admin123)  
**Cardápio:** http://localhost:3000/menu
