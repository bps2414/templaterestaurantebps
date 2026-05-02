# Arquitetura

Este projeto combina um frontend multi-tema com um backend/admin experimental.

## Visao Geral

```text
themes/{theme}/ -> scripts/select-theme.js -> public/ -> deploy estatico/backend
server/         -> Express + Prisma + rotas de admin experimental
```

## Frontend

`themes/` e a fonte da verdade dos temas. Cada tema contem paginas HTML, CSS de entrada e JavaScript client-side. O script `scripts/select-theme.js` seleciona um tema usando a variavel `THEME`, limpa `public/` e copia os arquivos do tema selecionado.

`public/` deve ser tratado como artefato gerado. Ele existe para deploy e preview, mas mudancas permanentes devem nascer em `themes/`.

## Temas

Temas principais para apresentacao:

- `restaurant-lite`
- `pizza-lite`
- `burger-lite`

Temas/estudos adicionais:

- `restaurante`
- `pizzaria`
- `hamburgueria`
- `acai`

`themes/_shared/` contem JavaScript compartilhado usado pelos temas lite.

## Backend Experimental

`server/` contem uma API Express em TypeScript com Prisma. O modulo cobre autenticacao administrativa, categorias, pratos, galeria, configuracoes, conteudo institucional e upload.

Este backend e util como estudo tecnico de arquitetura e seguranca basica, mas nao deve ser vendido como admin pronto sem nova revisao.

## Decisoes Importantes

- Manter o portfolio focado nas demos visuais e no aprendizado tecnico.
- Documentar o admin como laboratorio, nao como produto final.
- Preservar `themes/` como origem das mudancas visuais.
- Evitar promessas de maturidade como "SaaS pronto", "seguranca 8/10" ou "pronto para producao".

## Riscos Arquiteturais

- Edicoes diretas em `public/` podem ser perdidas no proximo build.
- A rota `/admin` pode existir nas demos, mesmo com `noindex`; isso nao equivale a controle de exposicao.
- O backend depende de banco e variaveis sensiveis para validacao real.
- O historico de docs antigas tinha linguagem comercial mais forte do que o estado atual justifica.
