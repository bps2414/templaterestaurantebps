---
description: Guia para auditoria de UX e Acessibilidade (A11y)
---

1. **Verificação de Contrastes**:
   - Analisar arquivos CSS/Tailwind.
   - Garantir que as cores de texto e fundo tenham contraste suficiente (pelo menos 4.5:1 para texto normal, 3:1 para texto grande/bold).
   - Verificar estados de hover e focus para garantir que o contraste se mantém.

2. **Tags Semânticas**:
   - Varrer o código (HTML/JSX) procurando por `div`s genéricas que poderiam ser:
     - `button` (para elementos clicáveis que executam ações).
     - `a` (para links de navegação).
     - `nav`, `section`, `header`, `footer`, `main`, `article`.
   - Melhorar a semântica ajuda leitores de tela e SEO.

3. **Inputs e Forms**:
   - Garantir que todos os inputs tenham `label` visualmente associado (via `for`/`htmlFor` e `id`).
   - Se o design não permitir label visível, garantir `aria-label` ou `aria-labelledby`.
   - Verificar atributos como `type` (email, tel, number) para teclados virtuais corretos em mobile.

4. **Responsividade**:
   - Simular visualmente ou analisar classes responsivas (ex: `hidden md:block`, `flex-col md:flex-row`).
   - Verificar se elementos críticos (botões de ação, navegação) não quebram ou somem em telas pequenas (mobile).
   - Garantir que não haja scroll horizontal indesejado.

5. **Feedback de Erro e Sucesso**:
   - Verificar chamadas de API no front-end.
   - Garantir que erros (4xx, 5xx) sejam comunicados ao usuário visualmente (Toasts, Alertas, Mensagens inline).
   - Garantir feedback de sucesso (ex: "Salvo com sucesso") após ações.

6. **Áreas de Toque (Touch Targets)**:
   - Garantir que botões e links tenham área clicável de pelo menos 44x44 pixels para facilitar o uso em dispositivos móveis.

7. **Gerenciamento de Foco**:
   - Verificar se o foco do teclado é visível (outline não removido sem substituto).
   - Garantir que a ordem do tab (tabindex) seja lógica.

8. **Estados de Carregamento (Loading)**:
   - Verificar se ações assíncronas (carregar dados, submeter form) possuem indicação visual (spinners, skeletons, botão desabilitado) para evitar cliques múltiplos e incerteza.

9. **Relatório UX**:
   - Gerar um resumo das melhorias necessárias.
   - Priorizar correções que impedem o uso (erros de contraste severos, botões inalcançáveis).
