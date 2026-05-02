# 🔄 Scripts de Sincronização

Scripts para manter **template-b** atualizado com **main** sem conflitos.

---

## 📁 Scripts Disponíveis

### 1. `sync-admin.ps1` - Sincronizar Admin
**Quando usar:** Sempre que atualizar o admin na main

```powershell
.\sync-admin.ps1
```

**O que faz:**
- ✅ Copia `public/admin.html` da main → template-b
- ✅ Mostra o diff das mudanças
- ✅ Pergunta se quer commitar/push
- ✅ Encoding UTF-8 automático

**Arquivos sincronizados:**
- `public/admin.html` (sempre deve ser idêntico)

---

### 2. `sync-core-js.ps1` - Sincronizar JS Core
**Quando usar:** Após testar correções de bugs na main

```powershell
.\sync-core-js.ps1
```

**O que faz:**
- ✅ Sincroniza arquivos JS que devem ser iguais
- ✅ Mostra resumo de mudanças
- ✅ Permite revisar diff antes de commitar

**Arquivos sincronizados:**
- `public/js/feedback.js` (toast system)
- `public/js/whatsappFormatter.js` (formatação)

---

## 🎯 Workflow Recomendado

### Cenário 1: Bug no Admin
```bash
# 1. Corrigir na main
git checkout main
# ... editar admin.html ...
git commit -m "fix: corrigir X no admin"
git push origin main

# 2. Sincronizar para template-b
git checkout template-b
.\sync-admin.ps1
# Responder 's' para commitar e push
```

### Cenário 2: Nova Feature no Toast
```bash
# 1. Desenvolver e testar na main
git checkout main
# ... editar feedback.js ...
git commit -m "feat: adicionar Y ao toast"
git push origin main

# 2. Sincronizar para template-b
git checkout template-b
.\sync-core-js.ps1
# Revisar diff, depois 's' para commitar
```

---

## ⚠️ Arquivos que NÃO devem ser sincronizados

Estes têm diferenças intencionais entre branches:

- ❌ `public/js/app.js` (mensagens diferentes)
- ❌ `public/js/orderModal.js` (implementação levemente diferente)
- ❌ `public/js/cart.js` (comentários diferentes)
- ❌ `public/js/cartUI.js` (ordem de código)
- ❌ `public/index.html` (design diferente!)
- ❌ `public/menu.html` (design diferente!)
- ❌ `styles.css` (design diferente!)

**Regra de Ouro:** Se o arquivo tem design/HTML diferente, NÃO sincronize!

---

## 🚨 Troubleshooting

### "Erro: Execute este script na raiz do projeto!"
```bash
# Navegar para a raiz:
cd F:\VSCode\Landpage
.\sync-admin.ps1
```

### "fatal: ambiguous argument 'main'"
```bash
# Fetch da main primeiro:
git fetch origin main
.\sync-admin.ps1
```

### Encoding errado após sync
```bash
# Os scripts já usam UTF-8, mas se der erro:
git show main:public/admin.html | Out-File -FilePath public/admin.html -Encoding UTF8
```

---

## 📊 Verificar Diferenças Manualmente

```powershell
# Comparar admin.html
git diff main template-b -- public/admin.html

# Comparar feedback.js
git diff main template-b -- public/js/feedback.js

# Ver todas as diferenças JS
git diff main template-b --stat -- public/js/*.js
```

---

## 💡 Dica Pro

Adicione alias no PowerShell profile:

```powershell
# Abrir profile:
notepad $PROFILE

# Adicionar:
function Sync-Admin { Set-Location F:\VSCode\Landpage; .\sync-admin.ps1 }
function Sync-JS { Set-Location F:\VSCode\Landpage; .\sync-core-js.ps1 }

# Usar:
Sync-Admin
Sync-JS
```

---

## ✅ Checklist Pós-Sync

Após sincronizar, sempre teste:

- [ ] `npm run dev` (servidor inicia sem erros)
- [ ] Admin login funciona
- [ ] Toast notifications aparecem
- [ ] WhatsApp redirect funciona
- [ ] Console sem erros

---

**Tempo estimado por sync:** 2-3 minutos ⚡
