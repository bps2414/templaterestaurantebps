# TODO — Bugs & Melhorias (16/03/2026)

> **Status:** FASE 1 ✅ FASE 2 ✅ FASE 3 ✅ FASE 4 ✅ FASE 5 ✅ FASE 6 ✅ — FASE 7 pendente  
> Evidências visuais: ver screenshots anexados na conversa (carrinho, admin sidebar, modal finalizar pedido)

---

## 🗂️ FASES DE EXECUÇÃO

| Fase | Descrição | Bugs / Tasks |
|------|-----------|-------------|
| **FASE 1** | ✅ Encoding — corrigir caracteres quebrados no admin | Bug 7 |
| **FASE 2** | ✅ Index público — imagens dos pratos e botão carrinho | Bug 1, Bug 2 |
| **FASE 3** | ✅ Admin lite vs padrão — auditoria completa | Bug 6, Bug 8, Item 10, Item 15, Item 16 (Item 11 = smoke test manual) |
| **FASE 4** | ✅ UI/UX — carrinho, modal, botão "Pedir Agora" por item | Bug 3, Bug 4, Bug 5, Bug 9 |
| **FASE 5** | ✅ Horários de funcionamento — paridade com padrão | Item 12 |
| **FASE 6** | ✅ Maps embed configurável no admin lite | Item 13 |
| **FASE 7** | 🔒 Segurança — auditoria de paridade com temas padrão | Item 14 |

---

## ✅ BUG 1 — Imagens dos pratos não carregam no index.html [RESOLVIDO]

**Afeta:** Todos os 4 temas lite (`restaurant-lite`, `burger-lite`, `pizza-lite`, `acai`)  
**Arquivo:** `themes/*/index.html` + `public/js/app.js`

**Descrição:**  
As imagens dos pratos não carregam quando a **página inicial** (`/` ou `index.html`) é aberta. Os cards de pratos em destaque/cardápio no index exibem imagem quebrada ou placeholder. As imagens vêm do campo `dish.image` retornado pela API (via `window.api('/categories')`).

**Causa provável:**  
- `app.js` é carregado com `defer` — pode haver race condition onde `window.api` ainda não está disponível quando `loadMenu()` / `loadHighlights()` executa no `DOMContentLoaded` do script inline do `index.html`.
- Alternativamente, imagens com path relativo `/uploads/...` podem falhar se o servidor não estiver servindo o diretório correto.

**Reprodução:** Abrir `/` (index) com cold start. Imagens dos pratos aparecem como quebradas ou placeholder.

**Fix esperado:**  
- Garantir que `window.api` esteja definido antes de `loadMenu()` ser chamado no `index.html` (mover inline script para após os defer, ou usar `window.addEventListener('load', ...)` em vez de `DOMContentLoaded`)
- Verificar se o endpoint `/categories` retorna URLs absolutas ou relativas das imagens e se estão acessíveis

---

## ✅ BUG 2 — Botão "+" adicionar ao carrinho não funciona (index.html) [RESOLVIDO]

**Afeta:** Todos os 4 temas lite  
**Arquivo:** `themes/*/index.html` (inline script, click handler)

**Descrição:**  
Clicar no botão `+` de um prato nos cards do **index.html** não adiciona o item ao carrinho. 

**Causa provável:**  
O click handler chama `window.cart.add(...)` mas `window.cart` pode não estar definido — `cart.js` é carregado com `defer` e o handler é registrado num inline script do `index.html`. Race condition com a ordem de carregamento dos scripts.

**Trecho problemático (`index.html`):**
```js
if (window.cart) {
  window.cart.add({ id, name, image, price });
}
```
O `if (window.cart)` silencia o erro mas não resolve o problema — o item simplesmente não é adicionado.

**Fix esperado:**  
- Mover o registro do click handler para dentro de um `DOMContentLoaded` que aguarde `window.cart` estar disponível, ou
- Usar event delegation via `document` com `window.cartUI` já inicializado, ou
- Garantir que `cart.js` sempre inicialize antes do handler ser executado

---

## ✅ BUG 3 — Botão "Pedir Agora" por item do cardápio ausente/quebrado [RESOLVIDO]

**Afeta:** Todos os 4 temas lite — cards de pratos no `index.html`  
**Arquivo:** `themes/*/index.html`

**Descrição:**  
Nos temas padrão (`restaurante`, `hamburgueria`, `pizzaria`), cada card de prato tem **dois botões**:
1. **"Pedir Agora"** — abre o `orderModal` já preenchido com os dados daquele prato específico
2. **"+" / "Adicionar ao Carrinho"** — adiciona o item ao carrinho lateral

Nos temas lite, o botão "Pedir Agora" por item está **ausente ou incorretamente implementado** — clicar nele não abre o modal de pedido do item, ou o botão não existe nos cards.

**Comparação (tema padrão vs lite):**

| Feature | Tema Padrão | Tema Lite | Status |
|---|---|---|---|
| Botão "Pedir Agora" por item | ✅ abre `orderModal` com dados do prato | ❌ ausente ou não funciona | ❌ |
| Botão "+" carrinho por item | ✅ `window.cart.add(...)` | ⚠️ com race condition (Bug 2) | ⚠️ |

**Fix esperado:**  
- Verificar se o botão "Pedir Agora" existe em cada card de prato no `index.html` dos lites
- Se ausente: adicionar botão que chama `window.orderModal.open({ id, name, price, image })` — idêntico ao comportamento do tema padrão
- Se presente mas quebrado: verificar race condition com `orderModal.js` (mesmo padrão do Bug 2)
- Aplicar nos 4 temas: `restaurant-lite`, `burger-lite`, `pizza-lite`, `acai`

---

## ✅ BUG 4 — Cursor não muda no botão flutuante do carrinho [RESOLVIDO]

**Afeta:** Todos os 4 temas lite  
**Arquivo:** `public/js/cartUI.js` (linha ~19 — `_createCartButton()`)

**Descrição:**  
O botão flutuante redondo do carrinho (canto inferior direito) não exibe `cursor: pointer` ao passar o mouse. O cursor permanece como seta/default.

**Causa:**  
O botão criado dinamicamente não tem a classe `cursor-pointer` do Tailwind, e o CSS reset pode estar sobrescrevendo o cursor padrão de `<button>`.

**Trecho problemático (`cartUI.js`):**
```js
e.className = "fixed bottom-6 right-6 z-50 bg-brand-500 hover:bg-brand-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110";
// cursor-pointer está AUSENTE
```

**Fix esperado:**  
Adicionar `cursor-pointer` à className do botão no `cartUI.js`.

---

## ✅ BUG 5 — UI do carrinho feia (tema escuro não combina com temas lite) [RESOLVIDO]

**Afeta:** Todos os 4 temas lite  
**Arquivo:** `public/js/cartUI.js`  
**Evidência:** Screenshot 1 (carrinho lateral)

**Descrição:**  
O carrinho lateral (`cart-sidebar`) e todos os seus elementos usam classes hardcoded de tema escuro (`bg-dark-900`, `bg-dark-800`, `bg-dark-700`, `text-white`, `text-gray-400`, `border-white/10`) que **não combinam** com os temas claros dos lites (fundos brancos/pastéis, cores vibrantes).

**Elementos problemáticos (todos em `cartUI.js`):**
- Sidebar: `bg-dark-900` — deveria ser branco/claro
- Header: `border-white/10` — borda invisível em fundo claro
- Items: `bg-dark-800 border-white/5` — fundo escuro em tema claro
- Footer: `bg-dark-800 border-white/10` — escuro no rodapé
- Textos: `text-white`, `text-gray-400` — brancos invisíveis em fundo claro
- Botões de qty: `bg-dark-700 hover:bg-dark-900` — escuros incompatíveis

**Fix esperado:**  
Reescrever `cartUI.js` para usar variáveis CSS (`var(--bg)`, `var(--surface)`, `var(--text)`, `var(--brand)`, `var(--border)`) em vez de classes Tailwind dark hardcoded, OU criar uma versão alternativa do carrinho para temas lite com CSS injetado via `<style>` tag dinâmica adaptada ao tema atual.

---

## ✅ BUG 6 — Admin: tela de Login com layout quebrado [RESOLVIDO]

**Afeta:** Todos os 4 admins lite  
**Arquivo:** `themes/*/admin.html` — seção de login (exibida antes da autenticação)  
**Evidência:** Screenshot 2 (tela de login do admin)

**Descrição:**  
A **tela de Login** do admin (exibida antes de o usuário se autenticar) está com layout quebrado — elementos desalinhados, formulário fora do container, ou espaçamento incorreto. O problema é na view de login, não no painel interno.

**Fix esperado:**  
Revisar o CSS da `#login-screen` / `.login-container` no `admin.html` de cada tema. Verificar se a estrutura do formulário de login tem os estilos corretos de centralização (flexbox/grid no wrapper), padding/margin e largura máxima do card de login.

---

## 🔴 BUG 7 — Admin: encoding quebrado (caracteres portugueses corrompidos)

**Afeta:** Todos os 4 admins lite  
**Arquivo:** `themes/restaurant-lite/admin.html`, `themes/burger-lite/admin.html`, `themes/pizza-lite/admin.html`, `themes/acai/admin.html`  
**Evidência:** Screenshot 2 — "CardÃ¡pio", "ConfiguraÃ§Ãµes" visíveis na sidebar

**Descrição:**  
Os arquivos admin.html foram gerados via PowerShell com `Set-Content` sem especificar encoding UTF-8, resultando em caracteres corrompidos em TODA a interface:

| Corrompido | Correto |
|---|---|
| `CardÃ¡pio` | `Cardápio` |
| `ConfiguraÃ§Ãµes` | `Configurações` |
| `AÃ§Ãµes` | `Ações` |
| `InformaÃ§Ãµes` | `Informações` |
| `excluÃ­da` | `excluída` |

**Arquivos afetados:** 4 admin.html (todos os temas lite) + `tmp/admin-starter-template.html`

**Fix esperado:**  
Re-gerar os 4 arquivos admin.html a partir do template usando PowerShell com encoding correto:
```powershell
Set-Content -Path "..." -Value $content -Encoding UTF8
# ou
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
```
Também corrigir o `admin-starter-template.html` de origem.

---

## ✅ BUG 8 — Admin aba Categorias: contagem de pratos fica exibida incorretamente [RESOLVIDO]

**Afeta:** Todos os 4 admins lite  
**Arquivo:** `themes/*/admin.html` — função `loadCategories()` (~linha 1008)

**Descrição:**  
Na tabela de categorias do admin, a coluna "Pratos" exibe o valor de `c._count?.dishes ?? 0`. Isso depende de a API `/categories` retornar o campo `_count` no JSON (contagem Prisma). Se o endpoint não incluir `include: { _count: true }`, sempre mostrará `0`.

**Trecho problemático:**
```js
<td>${c._count?.dishes ?? 0}</td>
```

**Fix esperado:**  
- Verificar se `GET /api/categories` retorna `_count.dishes` no payload
- Se não retornar, atualizar o backend para incluir a contagem, OU calcular no frontend via `c.dishes?.length ?? 0` se a API já retornar os pratos inline

---

## ✅ BUG 9 — Modal "Finalizar Pedido" feio (tema escuro incompatível) [RESOLVIDO]

**Afeta:** Todos os 4 temas lite  
**Arquivo:** `public/js/orderModal.js`  
**Evidência:** Screenshot 3 (modal finalizar pedido)

**Descrição:**  
O modal de finalizar pedido usa `bg-dark-800` como fundo do container, resultando em um modal escuro que conflita com os temas claros dos lites. Inputs, labels e textos também usam classes dark.

**Elementos problemáticos:**
- Container: `bg-dark-800 rounded-2xl` — fundo escuro
- Título: `text-white` — branco invisível se fundo for claro
- Inputs: sem classes adaptativas — provavelmente herdam estilos globais dark
- Backdrop: `bg-black/80 backdrop-blur-sm` — OK (pode manter)
- Botão WhatsApp: `#25D366` — parece correto (único elemento ok)

**Fix esperado:**  
Reescrever o HTML gerado em `orderModal.js._createModal()` para usar variáveis CSS do tema (`var(--bg)`, `var(--surface)`, `var(--text)`, `var(--border)`, `var(--brand)`) ou injetar uma `<style>` tag que adapte o modal ao tema atual detectado via CSS variables.

---

---

## ✅ ITEM 10 — Admin lite vs padrão: auditoria de funcionalidades faltantes [RESOLVIDO]

**Fase:** FASE 3  
**Afeta:** Todos os 4 admins lite  
**Arquivo:** `themes/*/admin.html` vs `themes/restaurante/admin.html`

**Descrição:**  
Os temas padrão (`restaurante`, `hamburgueria`, `pizzaria`) têm funcionalidades no admin que os lites não têm. Precisa comparar item a item e decidir o que é Starter vs o que está simplesmente faltando por erro.

**Comparação padrão (restaurante) vs lite:**

| Funcionalidade | Admin Padrão | Admin Lite | Situação |
|---|---|---|---|
| Dashboard stats | ✅ | ✅ | OK |
| CRUD Pratos | ✅ | ✅ | OK |
| CRUD Categorias | ✅ | ✅ | OK |
| Settings básicas (nome, tel, email, endereço) | ✅ | ✅ | OK |
| Tagline | ✅ | ✅ | OK |
| Instagram / Facebook | ✅ | ✅ | OK |
| WhatsApp Number | ✅ | ✅ | OK |
| WhatsApp Message | ✅ | ❌ | **FALTANDO** |
| Horários de funcionamento por dia | ✅ | ❌ | **Ver FASE 5** |
| Google Maps Embed | ✅ | ❌ | **Ver FASE 6** |
| Forçar loja fechada (store_force_closed) | ✅ (toggle) | ✅ (via store-open-toggle) | Verificar paridade |
| Alterar senha do admin | ✅ (modal) | ❌ | **FALTANDO** |
| Onboarding / Primeiros Passos | ✅ | ❌ | OK p/ Starter |
| Gallery (PRO) | ✅ PRO | ❌ | OK p/ Starter |
| Logo upload (PRO) | ✅ PRO | ❌ | OK p/ Starter |
| Favicon (PRO) | ✅ PRO | ❌ | OK p/ Starter |
| Cor da marca (PRO) | ✅ PRO | ❌ | OK p/ Starter |

**Fix esperado (FASE 3):**  
1. Adicionar campo `whatsapp_message` (textarea) na aba Config dos lites
2. Adicionar modal de **Alterar Senha** idêntico ao dos padrões
3. Verificar se o toggle `store_force_closed` do lite corresponde exatamente ao comportamento do padrão
4. Verificar se todos os 4 admins lite carregam e salvam corretamente as configs acima

---

## 🆕 ITEM 11 — Admin lite: verificação geral de funcionamento (smoke test)

**Fase:** FASE 3  
**Afeta:** Todos os 4 admins lite  
**Arquivo:** `themes/*/admin.html`

**Descrição:**  
Além da comparação de features, garantir que o que já existe está funcionando corretamente end-to-end. Itens a verificar manualmente ou via script:

- [ ] Login com credenciais válidas → redireciona para dashboard
- [ ] Login com credenciais inválidas → exibe erro, não fica em loop
- [ ] Refresh automático do token → funciona sem logout forçado
- [ ] Dashboard carrega stats corretas (pratos, categorias)
- [ ] Barras de limite (30 pratos / 5 categorias) atualizam corretamente
- [ ] Toggle loja aberta/fechada → persiste no backend
- [ ] CRUD pratos: criar, editar, excluir funcionam
- [ ] CRUD categorias: criar, editar, excluir funcionam
- [ ] Aba Config: todos os campos salvam e recarregam corretamente
- [ ] Toast de sucesso/erro aparece após cada ação
- [ ] Modal de prato e categoria fecham com ESC e clique fora

**Fix esperado (FASE 3):**  
Executar checklist acima com o servidor rodando e documentar qualquer item quebrado para corrigir em seguida.

---

## 🆕 ITEM 12 — Horários de funcionamento: paridade com temas padrão

**Fase:** FASE 5  
**Afeta:** Todos os 4 admins lite + `themes/*/index.html` (lógica de store status)  
**Arquivo:** `themes/*/admin.html` vs `themes/restaurante/admin.html` linhas 1514–1558

**Descrição:**  
Os temas padrão têm um sistema completo de horários por dia da semana no admin:

**Sistema padrão (restaurante/admin.html):**
- 7 checkboxes (Segunda → Domingo), cada um com `from` e `to` (tipo `<input type="time">`)
- Desabilita inputs de horário quando o dia está desmarcado
- Salva como JSON no campo `business_hours`: `{ days: [{ open: bool, from: "08:00", to: "22:00" }, ...] }`
- Toggle `store_force_closed` separado para fechar manualmente independente do horário
- O frontend lê esse JSON e desabilita os botões de pedido automaticamente fora do horário

**Sistema lite (atual):**
- Campo `store_force_closed` via toggle manual (ok)
- **Sem configuração de horários por dia** — dono não consegue definir "aberto Seg a Sex 11h–22h, fechado Sab/Dom"
- Cliente sempre vê loja aberta exceto se dono fechar manualmente

**Fix esperado (FASE 5):**  
1. Adicionar seção "⏰ Horário de Funcionamento" no admin lite (Config tab) com o mesmo UI de 7 dias/checkboxes/time inputs
2. Adaptar estilos para o tema claro dos lites (padrão usa `bg-dark-800` — lites precisam de `var(--surface)`)
3. Garantir que `business_hours` é salvo como JSON no `/api/config`
4. Verificar se `app.js` / `menu.html` lê `business_hours` e desabilita botões automaticamente (paridade com padrão)
5. Aplicar nos 4 lites + atualizar `tmp/admin-starter-template.html`

---

## 🆕 ITEM 13 — Google Maps embed não configurável nos lites

**Fase:** FASE 6  
**Afeta:** Todos os 4 admins lite  
**Arquivo:** `themes/*/admin.html` (Config tab) + `themes/*/index.html` (seção localização)

**Descrição:**  
Os temas padrão têm campo `google_maps_embed` no admin (textarea longo) onde o dono Cola a URL de embed do Google Maps. O mapa é exibido na página inicial/contact via `<iframe>`.

**Sistema padrão:**
- Campo `google_maps_embed` como `<textarea>` na aba Config
- Frontend do `index.html` / `contact.html` lê `cfg.google_maps_embed` e popula um `<iframe>`
- Sem isso, a seção de localização fica vazia ou estática

**Sistema lite (atual):**
- Endereço é só texto (`restaurant_address`) — sem campo de embed
- Seção de mapa nos `index.html` dos lites exibe texto estático ou nada

**Fix esperado (FASE 6):**  
1. Adicionar campo `google_maps_embed` (textarea) na Config do admin de cada lite
2. Adicionar seção de mapa no `index.html` de cada lite (iframe que lê `cfg.google_maps_embed`)
3. Se o campo estiver vazio, ocultar o iframe graciosamente (sem bloco em branco)
4. Aplicar nos 4 lites + atualizar `tmp/admin-starter-template.html`

---

## 🆕 ITEM 14 — Segurança: auditoria de paridade com temas padrão

**Fase:** FASE 7  
**Afeta:** Todos os 4 admins lite  
**Arquivo:** `themes/*/admin.html` vs `themes/restaurante/admin.html`

**Descrição:**  
Verificar que os admins lite têm exatamente o mesmo nível de segurança que os temas padrão:

**Checklist de segurança a auditar:**

| Item | Admin Padrão | Admin Lite | Status |
|------|-------------|-----------|--------|
| CSRF token em todas as mutações | ✅ header `x-csrf-token` | ✅ | Verificar |
| `credentials: 'include'` em todas as chamadas fetch | ✅ | ✅ | Verificar |
| JWT Bearer token no header `Authorization` | ✅ | ✅ | Verificar |
| Refresh automático de token (tryRefreshToken) | ✅ | ✅ | Verificar |
| Escape de HTML em outputs dinâmicos (`esc()`) | ✅ `escapeAttr()` | ✅ `esc()` | Verificar se cobre todos os campos |
| Login sem expor token em URL | ✅ | ✅ | Verificar |
| Logout limpa token do localStorage | ✅ | ✅ | Verificar |
| Campos de formulário sem `autocomplete` em dados sensíveis | ✅ | ⚠️ | Verificar |
| Sem hardcode de credenciais ou keys no HTML | ✅ | ✅ | Verificar |
| `inline onclick` com inputs do usuário escapados | ✅ | ✅ | Verificar `editCategory`, `deleteCategory`, `editDish` |
| Uploads de imagem validados no backend (não frontend) | ✅ | N/A | OK (lites não têm upload) |

**Gaps conhecidos para investigar:**
- `esc()` no lite é implementado como função inline — confirmar que cobre XSS em todos os campos do DOM
- `editCategory('${c.id}')` e `deleteDish('${dish.id}')` passam IDs via `onclick="..."` — verificar se IDs são numéricos/UUIDs não manipuláveis
- Confirmar que a rota `/api/config PUT` valida os campos no backend (evitar injeção via settings form)

**Fix esperado (FASE 7):**  
1. Comparar lado a lado `api()` helper do lite vs padrão — verificar headers, error handling, retry logic
2. Confirmar que `esc()` do lite é equivalente ao `escapeAttr()` do padrão
3. Corrigir qualquer gap encontrado
4. Se houver `autocomplete` faltando ou sobrando, corrigir
5. Docuentar resultado: ✅ segurança igual / ❌ gaps encontrados

---

---

## ✅ ITEM 15 — Modal "Novo Prato" não está igual ao do tema padrão [RESOLVIDO]

**Fase:** FASE 3  
**Afeta:** Todos os 4 admins lite  
**Arquivo:** `themes/*/admin.html` vs `themes/restaurante/admin.html` linhas 560–617

**Comparação direta:**

| Campo / Feature | Admin Padrão | Admin Lite | Status |
|---|---|---|---|
| Campo Nome | `<input type="text">` | `<input type="text">` | ✅ OK |
| Campo Descrição | `<textarea rows="3">` | `<textarea rows="2">` | ⚠️ menor |
| Campo Preço | `<input type="text" inputmode="numeric">` com placeholder `R$ 39,90` | `<input type="number" step="0.01">` | ❌ diferente (type errado, sem formatação) |
| Campo Categoria | `<select>` | `<select>` | ✅ OK |
| Campo Imagem | `<input type="file" accept="image/*">` (upload real) | `<input type="url">` (apenas URL de texto) | ❌ diferente (lite perdeu upload de arquivo) |
| Checkbox Destaque (`featured`) | ✅ presente | ❌ ausente | ❌ faltando |
| Checkbox Ativo (`active`) | ✅ presente (checked por padrão) | ✅ presente como "Disponível" | ⚠️ nome diferente, verificar se mapeia para mesmo campo |
| Encoding do modal | ✅ sem problemas | ❌ `DescriÃ§Ã£o`, `PreÃ§o`, `DisponÃ­vel` | ❌ coberto pela FASE 1 |
| Estilo visual | Dark (`bg-dark-800`, Tailwind) | CSS customizado (`form-group`, `.modal`) | ⚠️ visual diferente, menos polido |
| `aria-labelledby` no modal | ✅ `aria-labelledby="dish-modal-title"` | ❌ ausente | ⚠️ acessibilidade |

**Diferenças críticas identificadas:**

1. **Upload de imagem vs URL de texto** — O padrão usa `<input type="file">` que faz upload real via `/api/upload`. O lite usa `<input type="url">` que apenas aceita texto. Isso significa que no lite o dono não consegue fazer upload de foto — precisa colar URL externa, que é péssima UX e pode quebrar se o link expirar.

2. **Preço como `type="number"`** — O padrão usa `type="text" inputmode="numeric"` com formatação em BRL. O lite usa `type="number" step="0.01"` que pode causar problemas com casas decimais locais (vírgula vs ponto) e não formata como moeda.

3. **Checkbox "Destaque" ausente** — O padrão tem `dish-featured` que marca um prato como destaque para exibição na home. O lite não tem esse campo, então todos os pratos aparecem ou nenhum aparece nos destaques da home page.

4. **Checkbox "Ativo" vs "Disponível"** — Verificar se `dish-available` no lite mapeia corretamente para o campo `active` do schema Prisma ou se é um campo diferente.

**Fix esperado (FASE 3):**  
1. Substituir `<input type="url">` por `<input type="file" accept="image/*">` + lógica de upload idêntica ao padrão (POST `/api/upload`)
2. Corrigir campo preço para `type="text" inputmode="numeric"` com máscara BRL
3. Adicionar checkbox `dish-featured` ("Destaque") ao form
4. Unificar nome do campo `dish-available` → `dish-active` para mapeamento correto com o backend
5. Adicionar `aria-labelledby` no `<div class="modal-overlay" id="modal-dish">`
6. Aplicar nos 4 lites + atualizar `tmp/admin-starter-template.html`

---

## ✅ ITEM 16 — Comparação TOTAL: Admin Padrão vs Admin Lite (Paridade Funcional) [RESOLVIDO]

**Fase:** FASE 3  
**Afeta:** Todos os 4 admins lite (`restaurant-lite`, `burger-lite`, `pizza-lite`, `acai`)  
**Arquivo:** `themes/*/admin.html` vs `themes/restaurante/admin.html`  
**Prioridade:** 🔴 CRÍTICO — nenhuma funcionalidade útil pode ser perdida no admin lite

> **Objetivo:** O admin lite deve ser **teoricamente idêntico** ao admin padrão em funcionalidade. As diferenças só são aceitáveis quando justificadas pelo plano Starter (ex: limite de pratos/categorias). Tudo o mais deve ser portado.

---

### 📊 Dimensões do gap

| Dimensão | Admin Padrão | Admin Lite | Delta |
|---|---|---|---|
| Funções JS totais | 57 | 19 | **-38 funções** |
| Abas de navegação | 6 | 4 | **-2 abas** |
| Campos de configuração | 22 (19 básicos + 3 PRO) | 7 | **-15 campos** |
| Botões na sidebar footer | 4 | 1 | **-3 botões** |

---

### 🗂️ ABAS — Padrão vs Lite

| Aba | Admin Padrão | Admin Lite | Ação |
|---|---|---|---|
| Dashboard | ❌ ausente | ✅ presente (único no lite) | **MANTER no lite** |
| Cardápio / Pratos | ✅ | ✅ | ✅ OK |
| Categorias | ✅ | ✅ | ✅ OK |
| Configurações | ✅ | ✅ (incompleta) | ⚠️ expandir campos |
| **Galeria** | ✅ | ❌ ausente | **PORTAR** |
| **Sobre / Equipe** | ✅ | ❌ ausente | **PORTAR** |
| **QR Code** | ✅ | ❌ ausente | **PORTAR** |

---

### 🔧 FUNÇÕES JS — Presentes no Padrão, Ausentes no Lite

#### Grupo 1 — Preço / Formatação (impacto direto em dados)

| Função | O que faz | Impacto se ausente |
|---|---|---|
| `formatPrice(cents)` | Formata `3990` → `R$ 39,90` (locale pt-BR) | Preço exibido como `39.90` sem moeda/vírgula |
| `initPriceMask()` | Máscara live no input: digita `3990` → exibe `R$ 39,90` | Input de preço sem formatação BRL em tempo real |
| `getPriceCents()` | Lê input formatado → retorna inteiro em centavos | — |
| `setPriceFromCents(n)` | Preenche input já formatado ao editar prato | — |

> ⚠️ **Nota:** O lite usa `Math.round(parseFloat(price) * 100)` ao salvar — envia cents corretamente. Mas o INPUT aceita `type="number" step="0.01"` (vírgula vs ponto depende do locale do OS) e o DISPLAY usa `.toFixed(2)` sem locale. Deve ser unificado com `formatPrice` + `initPriceMask`.

#### Grupo 2 — Segurança / UX de formulários

| Função / Feature | O que faz | Impacto se ausente |
|---|---|---|
| `setLoading(btn, isLoading, text)` | Desabilita botão + mostra spinner durante requisição | Double-click em todos os forms (criar prato, salvar config, etc.) |
| `isLoginSubmitting` flag | Previne duplo submit no login | Double-submit no login pode criar sessões duplicadas |
| Login spinner + `aria-busy` | Feedback visual durante autenticação | UX ruim, sem indicação de processamento |
| Rate-limit handling (`Retry-After`) | Lê header `Retry-After` em respostas 429 e exibe mensagem | Silent fail em rate-limit — usuário não sabe o que houve |
| `escapeAttr(s)` | XSS-safe para atributos HTML inline (ex: `onclick="f('${escapeAttr(id)}')"`)) | IDs no DOM sem sanitização (baixo risco pois IDs são UUIDs, mas princípio defensivo) |

#### Grupo 3 — Galeria

| Função | O que faz |
|---|---|
| `loadGalleryAdmin()` | Carrega imagens da galeria do restaurante |
| `openGalleryModal()` | Abre modal de upload de nova imagem |
| `deleteGalleryImage(id)` | Remove imagem da galeria |

#### Grupo 4 — Sobre / Equipe

| Função | O que faz |
|---|---|
| `loadAboutAdmin()` | Carrega texto sobre + features + membros |
| `addFeature()` / `removeFeature()` | Gerencia lista de diferenciais/valores da loja |
| `renderFeaturesList()` | Renderiza lista de features no DOM |
| `addTeamMember()` / `removeTeamMember()` | Gerencia equipe (PRO gated) |
| `renderTeamList()` | Renderiza membros da equipe no DOM |
| `saveAboutContent()` | Salva sobre + features + equipe via API |

#### Grupo 5 — QR Code

| Função | O que faz |
|---|---|
| `generateQRCode()` | Gera QR code com URL do cardápio |
| `downloadQRCode()` | Baixa QR como PNG |
| `printQRCode()` | Abre janela de impressão do QR |
| `initQRCodeTab()` | Inicializa tab ao clicar (lazy load) |

#### Grupo 6 — Onboarding (Primeiros Passos)

| Função | O que faz |
|---|---|
| `shouldShowOnboarding()` | Decide se mostra o guia (novo usuário) |
| `showOnboarding()` | Abre modal de onboarding |
| `closeOnboarding()` | Fecha modal |
| `dismissOnboardingForever()` | Marca como visto definitivamente |
| `goToStep(n)` | Navega entre os 5 passos |
| `markStepDone(key)` | Marca passo como concluído |
| `updateOnboardingChecks()` | Atualiza checkmarks do progresso |

#### Grupo 7 — Plano / PRO Gating

| Função | O que faz |
|---|---|
| `fetchPlanInfo()` | Busca plano atual do restaurante via API |
| `applyPlanUI()` | Exibe badge do plano, bloqueia features PRO com cadeado |

#### Grupo 8 — Senha / Sidebar

| Feature | O que faz | Impacto se ausente |
|---|---|---|
| `openPasswordModal()` | Abre modal de troca de senha | Dono não consegue trocar senha pelo admin |
| `previewSite()` | Abre site público em nova aba | Botão "Visualizar Site" ausente na sidebar |
| Botão "Primeiros Passos" na sidebar | Liga ao onboarding | Ausente no lite |
| Botão "Alterar Senha" na sidebar | Chama `openPasswordModal()` | Ausente no lite |

---

### ⚙️ CONFIGURAÇÕES — Campos Faltando no Lite

| Campo (key da API) | Label exibida | Padrão | Lite | PRO? |
|---|---|---|---|---|
| `restaurant_name` | Nome | ✅ | ✅ (como `cfg-name`) | — |
| `restaurant_tagline` | Tagline | ✅ | ✅ (como `cfg-tagline`) | — |
| `restaurant_description` | Descrição | ✅ | ❌ | — |
| `restaurant_address` | Endereço | ✅ | ✅ (como `cfg-address`) | — |
| `restaurant_phone` | Telefone | ✅ | ✅ (como `cfg-phone`) | — |
| `restaurant_email` | Email | ✅ | ✅ (como `cfg-email`) | — |
| `whatsapp_number` | WhatsApp | ✅ | ⚠️ salvo junto com telefone | — |
| `whatsapp_message` | Mensagem padrão WA | ✅ | ❌ | — |
| `hero_title` | Título principal | ✅ | ❌ | — |
| `hero_subtitle` | Subtítulo | ✅ | ❌ | — |
| `about_title` | Título "Sobre" | ✅ | ❌ | — |
| `about_text` | Texto sobre (1) | ✅ | ❌ | — |
| `about_text_2` | Texto sobre (2) | ✅ | ❌ | — |
| `google_maps_embed` | Embed Google Maps | ✅ | ❌ | — |
| `instagram_url` | Instagram | ✅ | ✅ | — |
| `facebook_url` | Facebook | ✅ | ✅ | — |
| `footer_text` | Texto do rodapé | ✅ | ❌ | — |
| `hero_image` | Imagem hero (upload) | ✅ | ❌ | — |
| `about_image` | Imagem sobre (upload) | ✅ | ❌ | — |
| `logo_url` | Logo URL | ✅ | ❌ | PRO |
| `brand_color` | Cor principal | ✅ | ❌ | PRO |
| `favicon_url` | Favicon | ✅ | ❌ | PRO |

---

### 🍽️ TABELA DE PRATOS — Diferenças

| Coluna / Feature | Admin Padrão | Admin Lite | Ação |
|---|---|---|---|
| Thumbnail da imagem | ✅ `<img>` 40×40px | ❌ ausente | PORTAR |
| Badge "Destaque" | ✅ verde se `featured=true` | ❌ ausente | PORTAR |
| Badge Ativo/Inativo | ✅ verde/vermelho | ✅ verde/vermelho | OK |
| Preço formatado (BRL) | ✅ `R$ 39,90` (locale) | ⚠️ `R$ 39.90` (sem locale) | Corrigir com `formatPrice` |

---

### 🔑 STORAGE / AUTENTICAÇÃO — Inconsistências

| Item | Admin Padrão | Admin Lite | Risco |
|---|---|---|---|
| Chave localStorage refresh token | `admin_refresh` | `admin_refresh_token` | Inconsistência — scripts de logout/limpeza podem quebrar |
| Logout — clear de chaves | Remove `admin_refresh` | Remove `admin_refresh_token` | Precisa ser unificado |

---

### ✅ FUNCIONALIDADES ÚNICAS DO LITE — MANTER (NÃO REMOVER)

| Feature | Onde | Motivo para manter |
|---|---|---|
| `loadDashboard()` | Tab Dashboard | Visão geral rápida — o padrão não tem isso |
| `updateLimits(dishes, cats)` | Dashboard | Barras visuais de limite (30 pratos / 5 cats) — extremamente útil para Starter |
| `store-open-toggle` no Dashboard | Dashboard | Toggle imediato de loja aberta/fechada — boa UX |

---

### 📋 Lista de fixes ordenada por prioridade

**🔴 CRÍTICO (segurança / dados):**
1. Adicionar `setLoading()` em todos os botões de submit (pratos, categorias, settings) para prevenir double-click
2. Adicionar `isLoginSubmitting` flag no form de login
3. Padronizar chave localStorage: `admin_refresh_token` → `admin_refresh` (igual ao padrão)
4. Adicionar `escapeAttr()` nos handlers inline de onclick

**🟠 ALTO (funcionalidade faltando):**
5. Adicionar Modal + botão sidebar "Alterar Senha" (`openPasswordModal()`)
6. Adicionar botão sidebar "Visualizar Site" (`previewSite()`)
7. Implementar tab Galeria com `loadGalleryAdmin()`, `deleteGalleryImage()`
8. Implementar tab Sobre/Equipe com todas as 8 funções
9. Implementar tab QR Code (PRO gated)
10. Implementar sistema de Onboarding (botão "Primeiros Passos" na sidebar)
11. Adicionar `fetchPlanInfo()` + `applyPlanUI()` (badge do plano + PRO gating visual)

**🟡 MÉDIO (UX / configuração):**
12. Substituir `type="number"` por `type="text" inputmode="numeric"` no campo preço do modal
13. Implementar `initPriceMask()` no campo preço (máscara BRL live)
14. Corrigir display de preço na tabela: `.toFixed(2)` → `formatPrice(cents)`
15. Adicionar thumbnail da imagem na tabela de pratos
16. Adicionar badge "Destaque" na tabela de pratos
17. Expandir campos de config: `whatsapp_message`, `hero_title`, `hero_subtitle`, `about_title`, `about_text`, `about_text_2`, `google_maps_embed`, `footer_text`, `hero_image`, `about_image`
18. Adicionar campos PRO de config: `logo_url`, `brand_color`, `favicon_url`
19. Adicionar campo `restaurant_description` na seção Informações
20. Adicionar login spinner + rate-limit handling (`Retry-After`)

> **Nota:** Os itens 6 (Galeria), 12 (Maps), 15 (Modal prato) e 14 (Segurança) já cobrem subsets desses fixes. Este Item 16 é o documento-mestre de referência.

---

## 📋 Resumo por Fase e Prioridade

| Fase | # | Bug / Item | Severidade | Arquivo Principal |
|------|---|-----------|-----------|-------------------|
| **FASE 1** | 7 | Encoding admin quebrado (`CardÃ¡pio`) | ✅ RESOLVIDO | `themes/*/admin.html` (todos 4) |
| **FASE 2** | 1 | Imagens não carregam no menu | ✅ RESOLVIDO | `themes/*/menu.html` |
| **FASE 2** | 2 | Botão "+" carrinho não funciona | ✅ RESOLVIDO | `themes/*/menu.html` | É APENAS NO INDEX no HOME DO SITE
| **FASE 3** | 6 | Admin sidebar esquerda quebrada | ✅ RESOLVIDO | `themes/*/admin.html` |
| **FASE 3** | 8 | Contagem pratos na aba categorias | ✅ RESOLVIDO | `themes/*/admin.html` |
| **FASE 3** | 10 | Features faltando vs admin padrão | ✅ RESOLVIDO | `themes/*/admin.html` |
| **FASE 3** | 11 | Smoke test geral do admin lite | � PENDENTE MANUAL | `themes/*/admin.html` |
| **FASE 3** | 15 | Modal "Novo Prato" diferente do padrão | ✅ RESOLVIDO | `themes/*/admin.html` |
| **FASE 3** | 16 | Paridade TOTAL admin lite vs padrão | ✅ RESOLVIDO | `themes/*/admin.html` |
| **FASE 4** | 3 | Falta CTA "PEDIR AGORA VERDE" | ✅ RESOLVIDO | `public/js/orderModal-lite.js` |
| **FASE 4** | 4 | Cursor faltando no botão carrinho | ✅ RESOLVIDO | `public/js/cartUI-lite.js` |
| **FASE 4** | 5 | UI carrinho dark/feia nos lite themes | ✅ RESOLVIDO | `public/js/cartUI-lite.js` |
| **FASE 4** | 9 | Modal "Finalizar Pedido" dark/feio | ✅ RESOLVIDO | `public/js/orderModal-lite.js` |
| **FASE 5** | 12 | Horários por dia faltando nos lites | 🟠 ALTO | `themes/*/admin.html` |
| **FASE 6** | 13 | Maps embed não configurável | 🟠 ALTO | `themes/*/admin.html` + `index.html` |
| **FASE 7** | 14 | Auditoria de segurança lite vs padrão | 🔒 SEGURANÇA | `themes/*/admin.html` |

---

## 🖼️ Evidências Visuais (screenshots da conversa)

- **Screenshot 1:** Carrinho lateral aberto — fundo escuro (`bg-dark-900`), não combina com temas lite
- **Screenshot 2:** Sidebar admin — "CardÃ¡pio" e "ConfiguraÃ§Ãµes" (encoding corrompido)
- **Screenshot 3:** Modal "Finalizar Pedido" — fundo escuro (`bg-dark-800`), visual incompatível com temas claros

---

> **Próximo passo:** Executar as FASES em ordem, começando por FASE 1 (encoding crítico) → FASE 2 (menu público) → FASE 3 (admin auditoria).
