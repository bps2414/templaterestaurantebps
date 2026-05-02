# Plan: Static Build Injection — Eliminação de Branches

## Contexto
O projeto atualmente usa branches separadas (`main` = Restaurante, `template-b` = Hamburgueria) para diferentes designs. Isso causa dor de manutenção porque fixes precisam ser portados manualmente via scripts de sync.

**Decisão:** Usar um script de build (`select-theme.js`) que copia os arquivos HTML/CSS do tema correto para `public/` baseado na env var `THEME`.

## User Review Required

> [!IMPORTANT]
> **A pasta `public/` passará a ser gerada dinamicamente.** Ela será limpa e re-populada pelo script de build a cada deploy. Arquivos editados diretamente em `public/` serão sobrescritos.

> [!WARNING]
> **3 scripts serão removidos:** `sync-safe.ps1`, `sync-admin.ps1`, `sync-core-js.ps1`. Eles se tornam obsoletos com a arquitetura single-branch.

---

## Proposed Changes

### Fase 1: Reestruturação de Pastas

#### [NEW] `themes/restaurante/`
- Cópia exata do conteúdo atual de `public/` (8 HTMLs + `js/` com 11 arquivos + `favicon.svg`).

#### [NEW] `themes/hamburgueria/`
- Extraído da branch `template-b:public/` via `git show`. Inclui 10 HTMLs (tem `buy.html` e `buy-success.html` extras) + `js/` + `favicon.svg`.

**Arquivos que diferem entre temas (auditoria do `git diff`):**

| Arquivo | Tipo de Diferença |
|---------|-------------------|
| `index.html` | Layout Hero, cores, textos, imagens |
| `menu.html` | Estrutura do grid, categorias |
| `about.html` | Textos, seções |
| `contact.html` | Layout do formulário |
| `admin.html` | Pequenas diferenças de estilo |
| `privacy.html` | Textos |
| `buy.html` | **Exclusivo** hamburgueria |
| `buy-success.html` | **Exclusivo** hamburgueria |

**Arquivos JS comuns (lógica idêntica):**
`app.js`, `cart.js`, `cartUI.js`, `feedback.js`, `formValidation.js`, `mobile.js`, `orderModal.js`, `performance.js`, `whatsappFormatter.js`, `a11y.js`

> [!NOTE]
> `app_temp_b.js` (65KB) existe em `main` mas parece ser legado da template-b. Será investigado na Fase 1.

---

### Fase 2: Script "The Switcher"

#### [NEW] [select-theme.js](file:///f:/VSCode/Landpage/scripts/select-theme.js)

```javascript
// Pseudocódigo
const theme = process.env.THEME || 'restaurante';
const src = path.join(__dirname, '..', 'themes', theme);
const dest = path.join(__dirname, '..', 'public');

if (!fs.existsSync(src)) {
  console.error(`❌ Tema "${theme}" não encontrado em themes/`);
  process.exit(1);
}

// Limpar public/ (exceto .gitkeep)
// Copiar themes/{theme}/ → public/
console.log(`✅ Tema "${theme}" aplicado com sucesso.`);
```

---

### Fase 3: Pipeline de Build

#### [MODIFY] [package.json](file:///f:/VSCode/Landpage/server/package.json#L6-L22)

```diff
 "scripts": {
+    "select-theme": "node ../scripts/select-theme.js",
-    "build": "tsc",
+    "build": "node ../scripts/select-theme.js && tsc",
     "start": "node dist/index.js",
```

> [!NOTE]
> O script roda na raiz do projeto (fora de `server/`), por isso usa `../scripts/`.

---

### Fase 4: Limpeza

#### [DELETE] [sync-safe.ps1](file:///f:/VSCode/Landpage/scripts/sync-safe.ps1)
#### [DELETE] [sync-admin.ps1](file:///f:/VSCode/Landpage/scripts/sync-admin.ps1)
#### [DELETE] [sync-core-js.ps1](file:///f:/VSCode/Landpage/scripts/sync-core-js.ps1)

#### [MODIFY] [PROJECT_MANIFEST.md](file:///f:/VSCode/Landpage/docs/PROJECT_MANIFEST.md)
- Remover referências a branches de design e scripts de sync.
- Adicionar seção sobre o sistema de temas (`themes/`).

---

## Verification Plan

### Automated Tests

**Teste 1: Build com tema `restaurante`**
```powershell
$env:THEME = "restaurante"
node scripts/select-theme.js
# Verificar que public/index.html contém "Restaurante" ou conteúdo esperado
if (Test-Path "public/index.html") { Write-Host "✅ PASS" } else { Write-Host "❌ FAIL" }
```

**Teste 2: Build com tema `hamburgueria`**
```powershell
$env:THEME = "hamburgueria"
node scripts/select-theme.js
# Verificar que public/buy.html existe (exclusivo da hamburgueria)
if (Test-Path "public/buy.html") { Write-Host "✅ PASS" } else { Write-Host "❌ FAIL" }
```

**Teste 3: Tema inexistente falha corretamente**
```powershell
$env:THEME = "sushi"
node scripts/select-theme.js
# Deve retornar exit code 1
if ($LASTEXITCODE -eq 1) { Write-Host "✅ PASS" } else { Write-Host "❌ FAIL" }
```

### Manual Verification

1. Rodar `$env:THEME="restaurante"; node scripts/select-theme.js`
2. Iniciar servidor com `npm run dev` (dentro de `server/`)
3. Abrir `http://localhost:3000` no navegador
4. **Verificar visualmente:** Cores, imagens e textos do tema Restaurante aparecem
5. Parar servidor
6. Rodar `$env:THEME="hamburgueria"; node scripts/select-theme.js`
7. Iniciar servidor novamente
8. **Verificar visualmente:** Cores, imagens e textos do tema Hamburgueria aparecem
9. Confirmar que `buy.html` está acessível em `/buy.html`
