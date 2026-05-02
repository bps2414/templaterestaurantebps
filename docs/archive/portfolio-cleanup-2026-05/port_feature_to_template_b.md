---
description: Guia para portar melhorias da main para template-b sem quebrar o design
---

1. **Checkout e Pull**:
   - Garantir que você está na branch `template-b`.
   - Executar `git checkout template-b` e `git pull origin template-b` para garantir que a cópia local esteja atualizada.

2. **Merge Estratégico**:
   - Executar `git merge main`.
   - **Instrução Crítica**: Se houver conflitos na pasta `/public` ou em arquivos de configuração de tema (ex: `index.css`), **mantenha a versão que JÁ ESTAVA na template-b** (`ours`).
   - Use `git checkout --ours public/` se necessário para descartar mudanças visuais vindas da `main` que não devem sobrescrever o tema Hamburgueria.
   - Exceção: Se a feature for especificamente uma mudança de imagem ou asset novo, resolva manualmente mantendo o novo arquivo.

3. **Verificação de Estilos**:
   - Verificar se alguma classe Tailwind nova introduzida na `main` entra em conflito com o tema da `template-b`.
   - Garantir que as cores e fontes do tema Hamburgueria (normalmente definidas em `tailwind.config.js` ou CSS variáveis) não foram alteradas indevidamente.

4. **Teste de Build**:
   - Rodar o build localmente para garantir que o merge não quebrou nada.
   - Comando: `npm run build` (ou script equivalente `yarn build` / `pnpm build`).

5. **Push**:
   - Enviar as alterações para o repositório remoto.
   - Comando: `git push origin template-b`.
