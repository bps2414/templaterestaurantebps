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

3. **Database & Backend Check**:
   - Analisar o arquivo `schema.prisma`.
   - Identificar campos utilizados em buscas frequentes (ex: `where`, `orderBy`).
   - Garantir que esses campos possuam `@index` ou `@unique`.
   - **Over-fetching**: Verificar queries que trazem o objeto inteiro quando apenas 1 campo é necessário (usar `select` em vez de `include` cego).
   - **Connection Pooling**: Garantir que o `PrismaClient` é instanciado apenas uma vez (Singleton pattern).

4. **Renderização React & Client-Side**:
   - Verificar componentes React que podem estar sofrendo re-renders desnecessários.
   - Identificar funções ou objetos recriados a cada renderização que são passados como props.
   - Sugerir o uso de `useMemo` para cálculos pesados e `useCallback` para funções passadas para componentes filhos.
   - **Lazy Loading**: Verificar uso de `React.lazy` e `Suspense` para rotas e modais pesados.

5. **Network & Core Web Vitals (CWV)**:
   - **LCP (Largest Contentful Paint)**: O elemento principal carrega em < 2.5s? (Otimizar Hero images, preload critical CSS).
   - **CLS (Cumulative Layout Shift)**: Elementos pulam enquanto carregam? (Definir width/height para imagens e vídeos).
   - **INP (Interaction to Next Paint)**: A página trava ao clicar? (Reduzir Main Thread blocking JS).

6. **Otimização de Assets (Fonts & Scripts)**:
   - **Fontes**: Usar `font-display: swap`. Hospedar localmente (WOFF2) ou usar Google Fonts com `preconnect`.
   - **Scripts**: 3rd party scripts (Analytics, Chat) devem ter `async` ou `defer`.
   - **Gzip/Brotli**: O servidor está comprimindo as respostas de texto?

7. **Caching Strategy**:
   - Headers: Verificar `Cache-Control` para assets estáticos (`max-age=31536000, immutable`).
   - SWR (Stale-While-Revalidate): Estratégia de cache para dados de API via React Query ou similar.

8. **Bundle Analysis**:
   - Sugerir o uso de ferramentas como `source-map-explorer` ou `webpack-bundle-analyzer` para visualizar o que está ocupando mais espaço no bundle final.

9. **Relatório**:
   - Compilar todas as descobertas e sugestões em um relatório markdown.
   - Listar ações imediatas (high impact) e melhorias de longo prazo.
