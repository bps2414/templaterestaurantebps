# UX Sync Patches — `template-b` ← `main`

> Sincroniza features de validação visual, shake, toast, focus-trap, login UX e security headers de `main` para `template-b`.

## Sumário Executivo

| # | Patch | Descrição | Prioridade | Branch Alvo |
|---|---|---|---|---|
| P1 | `P1-add-scripts.patch` | Carregar `feedback.js` + `formValidation.js` nos HTMLs | 🔴 Urgente | `template-b` |
| P3 | `P3-orderModal-integration.patch` | Integrar formValidation + aria-busy no modal de pedido | 🔴 Urgente | `template-b` |
| P5 | `P5-toast-refactor.patch` | Usar `feedback.toast()` em vez de toasts inline | 🟢 Média | `template-b` |
| P9 | `P9-cartUI-focustrap.patch` | Focus-trap + focus-restore no carrinho sidebar | 🟡 Alta | `template-b` |
| P6 | `P6-admin-login-ux.patch` | Double-click prevention + spinner no login admin | 🔴 Urgente | **Ambas** |
| P10 | `P10-security-headers.patch` | Security headers extras no server | 🟡 Alta | `template-b` |
| P11 | `P11-skeletons.patch` | Skeleton loaders durante carregamento | 🟢 Média | `template-b` |
| P7 | `P7-abortcontroller-order.patch` | AbortController no submit de pedido | 🟢 Baixa | `template-b` |

---

## Pré-requisitos

- Git
- Node.js (para rodar o server local)
- Browser moderno (Chrome/Firefox com DevTools)

---

## Ordem de Aplicação

### Em `template-b`

```bash
# 1. Criar branch de trabalho
git checkout template-b
git checkout -b fix/template-b-ux-sync

# 2. Aplicar patches na ordem recomendada
git apply patches/P1-add-scripts.patch        # Scripts nos HTMLs
git apply patches/P3-orderModal-integration.patch  # Validação visual no modal
git apply patches/P5-toast-refactor.patch     # Toast via feedback.js
git apply patches/P9-cartUI-focustrap.patch   # Focus-trap no carrinho
git apply patches/P6-admin-login-ux.patch     # Login UX (admin)
git apply patches/P10-security-headers.patch  # Security headers
git apply patches/P11-skeletons.patch         # Skeleton loaders

# 3. (Opcional)
git apply patches/P7-abortcontroller-order.patch

# 4. Verificar
bash patches/verify-patches.sh

# 5. Commit
git add -A
git commit -m "fix(template-b): sync UX features from main (validation, shake, login, focus-trap, headers)"
```

### Em `main` (apenas P6 — login)

```bash
git checkout main
git checkout -b fix/admin-login-ux
git apply patches/P6-admin-login-ux.patch
git add -A
git commit -m "fix: admin login double-click prevention + spinner + aria-busy"
```

### Se `git apply` falhar

Use `--3way` para resolução de conflitos:
```bash
git apply --3way patches/P1-add-scripts.patch
```

Ou use `--reject` para ver quais hunks falharam:
```bash
git apply --reject patches/P3-orderModal-integration.patch
# Revise os .rej files e aplique manualmente
```

### Script automatizado

```bash
bash patches/apply-patches.sh
```

---

## Rollback

### Reverter um patch específico
```bash
git apply -R patches/P1-add-scripts.patch
```

### Reverter tudo (voltar ao estado original)
```bash
git checkout template-b -- public/ server/
# Ou hard reset da branch:
git reset --hard template-b
```

---

## Smoke Tests

### P1 — Scripts carregados

1. Iniciar servidor: `npx http-server public -p 8080` ou `npm run dev`
2. Abrir `http://localhost:8080` no browser
3. F12 → Console → digitar:
   ```js
   typeof window.formValidation  // deve retornar "object"
   typeof window.feedback         // deve retornar "object"
   window.formValidation.validators  // deve mostrar { required, minLength, ... }
   window.feedback.toast           // deve ser uma function
   ```
4. Repetir em `/menu.html`, `/about.html`, `/contact.html`, `/gallery.html`

### P3 — Validação visual no modal de pedido

1. Abrir qualquer página com cardápio
2. Clicar em "Pedir" num prato → modal abre
3. **Sem preencher nada**, clicar "Enviar pelo WhatsApp"
4. ✅ Campos ficam com **borda vermelha** (`border-color: #ef4444`)
5. ✅ Efeito **shake** (tremida 0.4s) nos campos inválidos
6. ✅ Mensagem de erro inline abaixo de cada campo (`role="alert"`)
7. ✅ Foco vai para o primeiro campo inválido
8. Preencher nome (≥2 chars) → tirar foco → ✅ borda fica **verde**
9. Preencher telefone inválido ("123") → ✅ "Telefone inválido"
10. Preencher tudo correto → ✅ submit funciona, botão mostra "Processando..."
11. Verificar `aria-busy="true"` no botão durante submit (Elements panel)

### P5 — Toast via feedback.js

1. Adicionar item ao carrinho em `/menu.html` ou homepage
2. ✅ Toast aparece no canto superior direito (stacked, com ícone ✓)
3. ✅ Toast tem barra de progresso e fecha automaticamente (~4s)
4. ✅ Hover no toast pausa o timer

### P9 — Focus trap no carrinho

1. Clicar no botão do carrinho (ícone flutuante)
2. Sidebar abre → ✅ foco vai para botão "Fechar carrinho"
3. Pressionar Tab repetidamente → ✅ foco cicla dentro do sidebar
4. Pressionar Shift+Tab no primeiro elemento → ✅ vai para o último
5. Pressionar ESC → ✅ sidebar fecha
6. ✅ Foco retorna ao elemento que estava focado antes de abrir

### P6 — Login admin (double-click prevention)

1. Abrir `/admin.html`
2. Preencher email/senha errados
3. Clicar "Entrar" rapidamente 5x em <200ms
4. ✅ Network tab mostra **apenas 1 request** (não 5)
5. ✅ Botão fica disabled + cinza + spinner SVG + "Entrando…"
6. ✅ `aria-busy="true"` presente no botão (inspect)
7. Após resposta de erro → ✅ botão volta ao normal ("Entrar")
8. Testar rate-limit (se server rodando):
   ```bash
   for i in $(seq 1 15); do
     curl -s -o /dev/null -w "%{http_code}\n" \
       -X POST http://localhost:3000/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"x@x.com","password":"x"}'
   done
   # Após ~10 requests: deve retornar 429
   ```
9. ✅ Com 429: mensagem "Muitas tentativas. Aguarde X segundos."

### P10 — Security headers

```bash
# Com o server rodando:
curl -sI http://localhost:3000 | grep -iE "expect-ct|cross-origin|csp-report"
# Esperado (em produção):
#   Expect-CT: max-age=86400, enforce
#   Cross-Origin-Opener-Policy: same-origin
#   Cross-Origin-Resource-Policy: same-site
```

### P11 — Skeleton loaders

1. F12 → Network → Throttle: "Slow 3G"
2. Desmarcar "Disable cache"
3. Recarregar homepage
4. ✅ Cards de destaque mostram **skeleton shimmer** (retângulos animados)
5. ✅ Cards de categorias mostram skeleton shimmer
6. Após dados carregarem → ✅ skeletons substituídos por conteúdo real

---

## Dependências e Mitigações

| Dependência | Status | Mitigação |
|---|---|---|
| **Tailwind CSS** | Via CDN (`cdn.tailwindcss.com`) | ✅ Sem build necessário. Classes `animate-spin`, `opacity-70` etc. já disponíveis |
| **CSS de validação** (`.field-error`, `.field-shake`, `@keyframes shake`) | Injetado via JS por `formValidation.js:injectStyles()` | ✅ **CSS puro injetado em runtime** — não depende de build |
| **CSS de skeleton** (`.skeleton`, `@keyframes shimmer`) | Injetado via JS por `feedback.js:injectSkeletonCSS()` | ✅ CSS puro injetado em runtime |
| **`express-rate-limit`** | No `server/package.json` (ambas branches) | ✅ Idêntico, sem alteração |
| **`animate-spin`** (spinner login) | Tailwind CDN inclui esta utility | ✅ Se migrar para build: já está no default config do Tailwind |

### Fallback CSS inline (caso Tailwind CDN falhe)

Se por algum motivo `animate-spin` não estiver disponível, adicione no `<head>` do `admin.html`:

```html
<style>
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .animate-spin { animation: spin 1s linear infinite; }
</style>
```

---

## Checklist Final

- [ ] P1 aplicado — `window.formValidation` existe em todas as páginas
- [ ] P3 aplicado — modal de pedido tem validação visual + shake + aria-busy
- [ ] P5 aplicado — toasts usam feedback.js (stacked, com progresso)
- [ ] P9 aplicado — carrinho sidebar tem focus-trap + focus-restore
- [ ] P6 aplicado em **template-b** — login admin tem proteção double-click
- [ ] P6 aplicado em **main** — login admin tem proteção double-click
- [ ] P10 aplicado — security headers extras no server
- [ ] P11 aplicado — skeleton loaders durante carregamento
- [ ] `bash patches/verify-patches.sh` retorna ✅ All checks passed
- [ ] Testes manuais de fumaça completados
- [ ] Network throttle testado (Slow 3G)
- [ ] Mobile emulation testada
- [ ] Leitor de tela testado (aria-invalid, role="alert")

---

## Commit Messages Sugeridos

| Patch | Commit Message |
|---|---|
| P1 | `fix(template-b): load formValidation + feedback scripts in public HTMLs` |
| P3 | `fix(template-b): integrate formValidation + aria-busy in orderModal` |
| P5 | `fix(template-b): use feedback.toast() for all toast notifications` |
| P9 | `fix(template-b): add focus-trap + focus-restore to cart sidebar` |
| P6 | `fix: admin login double-click prevention + spinner + aria-busy` |
| P10 | `fix(template-b): add Sprint 1 security headers to server` |
| P11 | `fix(template-b): add skeleton loaders to featured + category cards` |
| P7 | `feat(template-b): add AbortController to order submission (optional)` |

---

## Notas de QA Adicionais

- **Acessibilidade (WCAG 2.1):**
  - `aria-invalid="true"` aplicado a campos com erro
  - `aria-describedby` aponta para o elemento de erro
  - `role="alert"` nas mensagens de erro (anunciadas por leitores de tela)
  - Foco movido para primeiro campo inválido
  - Focus trap no modal e sidebar

- **Segurança:**
  - Rate-limit server-side **não alterado** (mantém 10 tentativas/15min)
  - `isLoginSubmitting` é apenas UX — a proteção real é o rate-limit
  - CSRF token preservado em todas as requisições

- **Performance:**
  - Skeletons evitam layout shift (CLS)
  - Debounce 300ms na validação por input
  - Throttle 500ms em cart.add/updateQuantity (já existente)
