---
description: Guia para auditoria de performance no código do servidor e front-end
---

1. **Análise de Dependências**:
   - Verificar `package.json` para identificar pacotes não utilizados ou desnecessários.
   - Sugerir a remoção de dependências que não estão sendo importadas no projeto.
   - Analisar o tamanho do bundle se possível.

2. **Otimização de Imagens**:
   - Verificar imagens em `/public` ou `/assets`.
   - Garantir que as imagens estejam em formato otimizado (como WebP).
   - Verificar o uso do Cloudinary: confirmar se as imagens carregadas via URL possuem parâmetros de redimensionamento (`f_auto`, `q_auto`, `w_...`) para evitar carregamento de arquivos gigantes desnecessariamente.

3. **Database Check**:
   - Analisar o arquivo `schema.prisma`.
   - Identificar campos utilizados em buscas frequentes (ex: `where`, `orderBy`).
   - Garantir que esses campos possuam `@index` ou `@unique` para garantir performance nas queries.

4. **Renderização React**:
   - Verificar componentes React que podem estar sofrendo re-renders desnecessários.
   - Identificar funções ou objetos recriados a cada renderização que são passados como props.
   - Sugerir o uso de `useMemo` para cálculos pesados e `useCallback` para funções passadas para componentes filhos, especialmente os críticos.

5. **Network Waterfall**:
   - Inspecionar a aba Network do DevTools.
   - Identificar requisições que bloqueiam a renderização (render-blocking resources).
   - Verificar se scripts de terceiros (analytics, chat) estão sendo carregados de forma assíncrona (`async` ou `defer`).

6. **Code Splitting**:
   - Verificar se o projeto utiliza `React.lazy` e `Suspense` para dividir o bundle.
   - Sugerir a implementação de lazy loading para rotas ou componentes pesados que não são visíveis inicialmente.

7. **Bundle Analysis**:
   - Sugerir o uso de ferramentas como `source-map-explorer` ou `webpack-bundle-analyzer` para visualizar o que está ocupando mais espaço no bundle final.

8. **Relatório**:
   - Compilar todas as descobertas e sugestões em um relatório markdown.
   - Listar ações imediatas (high impact) e melhorias de longo prazo.
