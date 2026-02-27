# PLAN: Cache Invalidation & UX Improvements

## 1. Contexto e Objetivo
Implementar melhorias focadas na experiência do usuário (UX) tanto para o administrador (lojista) quanto para o cliente final, além de resolver o problema de cache no frontend após deploys, garantindo atualizações suaves sem necessidade de `Ctrl+Shift+R`.

Opções selecionadas do Brainstorm:
- **Cache Opção B**: Solução via Express (ETags e Cache-Control).
- **UX Opção 1**: Aviso de alterações não salvas no painel de administração.
- **UX Opção 2**: Preview em tempo real de uploads de imagens com drag-and-drop no Admin.
- **UX Opção 4**: Atualização fluida do status de "Aberto/Fechado" da loja no frontend.

---

## 2. Escopo das Tarefas

### 2.1. Estratégia de Cache (Opção B - Express)
- **Onde**: `server/src/app.ts` (rotas de arquivos estáticos).
- **Como**: 
  - Ajustar para que os arquivos estáticos (CSS, JS) tenham tempo de cache adequado (ex: 1 ano) SE usassem assets versionados, mas como estamos servindo diretamente, aplicaremos no HTML o cabeçalho `Cache-Control: no-cache`.
  - Isso garante que o navegador sempre valide a ETag (hash do arquivo) num novo deploy. Se o arquivo não mudou, retorna 304 rápido. Se mudou (novo deploy), baixa o novo sem usar o cache velho.
  - Isso substitui nosso recente workaround de development para algo que rege produção de forma eficiente.

### 2.2. Aviso de Alterações Não Salvas (UX 1)
- **Onde**: `themes/{tema}/admin.html` (para todos os temas).
- **Como**:
  - Criar um estado `let isDirty = false;`.
  - Adicionar event listeners (`input`, `change`) no `<form id="config-form">` para marcar `isDirty = true`.
  - Quando clicar em "Salvar", voltar `isDirty = false`.
  - Adicionar `window.addEventListener('beforeunload', ...)` que exibe o prompt nativo do navegador caso `isDirty` seja verdadeiro.

### 2.3. Live Preview & Drag-and-Drop (UX 2)
- **Onde**: Modal ou seção de upload de imagens (Logo, Banner, Itens do Menu) em `themes/{tema}/admin.html`.
- **Como**:
  - Transformar os botões de "Escolher Arquivo" em ou estar dentro de áreas dropáveis (`dragover`, `dragleave`, `drop`).
  - Utilizar `FileReader` do JavaScript JS vanilla para gerar um base64 local assim que a imagem for arrastada ou selecionada.
  - Atualizar imediatamente a tag `<img>` de preview na tela, fornecendo feedback instantâneo antes mesmo do botão "Salvar" enviar a imagem pro Cloudinary.

### 2.4. Atualização Fluida do Status da Loja (UX 4)
- **Onde**: `themes/{tema}/js/app.js` (ou arquivo de lógica principal).
- **Como**:
  - Criar um `setInterval` que roda a cada 60 segundos (ou 30s).
  - A cada tick, ele chama novamente a função `applyStoreStatus()` (que verifica `isStoreOpen()` com o `siteConfig` já recebido associado à data/hora de agora local do cliente).
  - Se o status migrou de Aberto para Fechado (ou vice-versa), ele altera dinamicamente o texto do botão do carrinho e a tag vermelha/verde de status, impedindo aberturas de carrinho de surpresa após o horário.

---

## 3. Agentes Especialistas Envolvidos

- **`frontend-specialist` e `backend-specialist` (para o Express)**.
- Todos os temas deverão receber as injeções de UX (`restaurante`, `hamburgueria`, `pizzaria`, `confeitaria`). Seguiremos a regra de aplicar globalmente.

---

## 4. Checklist de Validação (QA)

- [ ] Dar deploy/reiniciar servidor, carregar a página e medir o status code do index.html (esperado: 200 na primeira, 304 em reloads se não mudar arquivos).
- [ ] No painel Admin (Restaurante), alterar um texto de título e fechar a aba. O navegador deve barrar com o alerta.
- [ ] Salvar a alteração no painel Admin, e então fechar a aba (não deve exibir alerta).
- [ ] Arrastar uma imagem de logo para o input, e ver a imagem substituindo o avatar original antes mesmo de dar Salvar.
- [ ] No frontend, injetar um fechamento de loja daqui a 1 minuto no Admin. Aguardar o frontend virar "Fechado" sem dar F5 na tela.
