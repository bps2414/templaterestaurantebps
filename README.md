# Restaurant Templates BPS

Template multi-tema para negocios de alimentacao, com demos para restaurante, pizzaria e hamburgueria, criado como estudo comercial e tecnico.

Este repositorio representa um projeto antigo preparado para portfolio. A proposta atual nao e vender isto como SaaS maduro, e sim apresentar um estudo de templates, tema visual, build estatico e uma exploracao de backend/admin para cardapio digital.

## Demos

| Variacao | Demo publica | Escopo mostrado |
| --- | --- | --- |
| Restaurante | [saborearte-seven.vercel.app](https://saborearte-seven.vercel.app/) | Landing page e cardapio digital |
| Pizzaria | [fornoemassa.vercel.app](https://fornoemassa.vercel.app/) | Variacao visual para pizzaria |
| Hamburgueria | [burguerhouse-lilac.vercel.app](https://burguerhouse-lilac.vercel.app/) | Variacao visual para hamburgueria |

Sugestao para screenshots: criar `public/screenshots/` ou `docs/assets/screenshots/` com capturas reais de desktop e mobile das tres demos. Nao ha garantia de que as imagens atuais do projeto sejam screenshots finais de portfolio.

## O Que Este Projeto Mostra

- Estrutura de temas em `themes/`, usada como fonte da verdade para as variacoes visuais.
- Build por selecao de tema via `scripts/select-theme.js`, copiando o tema ativo para `public/`.
- Frontend em HTML, CSS/Tailwind gerado e JavaScript vanilla.
- Backend Express/TypeScript com Prisma como estudo tecnico para admin, autenticacao, uploads e CRUD.
- Organizacao de deploys independentes para demonstrar variantes de nicho.

## Escopo Atual

Este projeto deve ser lido como um estudo comercial e tecnico. As demos publicas sao adequadas para demonstrar landing page, cardapio e identidade visual. O modulo de backend/admin existe como laboratorio de arquitetura e seguranca basica, mas nao deve ser tratado como recurso pronto para cliente sem nova validacao.

## Estrutura

```text
themes/       fonte da verdade dos temas
public/       artefato gerado pelo tema selecionado
scripts/      automacoes de build e apoio
server/       backend/admin experimental
docs/         documentacao atual para portfolio
docs/archive/ documentos antigos, planos e auditorias historicas
```

## Como Rodar Localmente

Instale as dependencias da raiz:

```bash
npm install
```

Selecionar um tema e gerar `public/`:

```bash
THEME=restaurant-lite node scripts/select-theme.js
```

No Windows PowerShell:

```powershell
$env:THEME="restaurant-lite"; node scripts/select-theme.js
```

Backend experimental:

```bash
cd server
npm install
npm run build
```

Para rodar o backend localmente, crie um `server/.env` a partir de `server/.env.example`. Nao publique esse arquivo.

## Temas

`themes/` e a fonte da verdade. Edicoes de layout, conteudo e assets devem ser feitas ali. `public/` e uma copia gerada para o tema ativo e pode ser sobrescrita pelo script de build.

Temas principais para portfolio:

- `restaurant-lite`
- `pizza-lite`
- `burger-lite`

Tambem existem estudos adicionais em `restaurante`, `pizzaria`, `hamburgueria` e `acai`.

## Backend/Admin Experimental

O backend em `server/` inclui Express, Prisma, autenticacao JWT, rotas de CRUD e upload. Ele deve ser apresentado como estudo tecnico, nao como promessa de painel administrativo pronto para venda.

Pontos que exigem nova validacao antes de uso real:

- politicas de credenciais e rotacao de segredos;
- isolamento de ambiente e banco por cliente;
- revisao completa de CORS, CSP e fluxo de login;
- testes E2E com banco real;
- revisao de exposicao publica da rota `/admin`;
- monitoramento, backup e recuperacao.

## Limitacoes Conhecidas

- O projeto nasceu com ambicao comercial maior do que a maturidade real do codigo.
- Algumas documentacoes antigas foram arquivadas porque prometiam prontidao de producao sem uma validacao atual.
- `public/` e artefato gerado e pode divergir de `themes/` se alguem editar direto.
- As demos mostram principalmente frontend/cardapio; o admin completo precisa de nova revisao antes de cliente real.
- A verificacao local depende de variaveis de ambiente e, para testes completos, de banco/configuracao externa.

Veja tambem [docs/LIMITATIONS.md](docs/LIMITATIONS.md).

## O Que Eu Faria Diferente Hoje

- Separaria claramente template estatico, admin experimental e produto SaaS.
- Comecaria por um escopo vendavel menor: landing page, cardapio digital e chamada para WhatsApp.
- Criaria contrato de dados simples por tema antes de evoluir o painel.
- Automatizaria screenshots, build e validacao de links no CI.
- Usaria uma estrategia de secrets e deploy desde o inicio, com ambientes separados e revisao de seguranca documentada.

## Escopo Recomendado Para Clientes Reais

A versao segura para oferecer hoje seria:

- landing page responsiva;
- cardapio digital estatico ou semi-estatico;
- botao de pedido/contato via WhatsApp;
- personalizacao visual por nicho;
- deploy simples em Vercel/Netlify.

Um admin completo com login, uploads, banco, pagamentos ou multi-cliente deve ser tratado como novo projeto ou fase separada, com discovery, threat model, testes e validacao de seguranca.

## Documentacao

- [Arquitetura](docs/ARCHITECTURE.md)
- [Case de portfolio](docs/PORTFOLIO_CASE.md)
- [Notas de deploy](docs/DEPLOY_NOTES.md)
- [Notas de seguranca](docs/SECURITY_NOTES.md)
- [Limitacoes](docs/LIMITATIONS.md)

## Estado Atual

O repositorio foi higienizado para portfolio: documentacao reposicionada, materiais antigos arquivados e arquivos temporarios/gerados removidos do controle de versao. O backend/admin permanece documentado como estudo tecnico.

Validacao local desta limpeza:

- `npm install`: passou na raiz apos corrigir `@types/k6`.
- `npm run test:e2e`: passou.
- `npm run test:security`: passou na raiz.
- `cd server && npm run build`: passou.
- `cd server && npm run lint`: passou com warnings existentes de `any`/variaveis nao usadas.
- `cd server && npm test`: passou, com aviso de open handles em `setInterval`.
- `cd server && npm audit`: ainda reporta 1 vulnerabilidade moderada em `uuid`, corrigivel apenas com `npm audit fix --force` e possivel breaking change.
- Demos publicas: os tres links responderam `HTTP 200`.
