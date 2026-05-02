# Notas De Seguranca

## Posicionamento

Este projeto nao deve ser descrito como auditado ou pronto para producao. A seguranca atual e suficiente para estudo tecnico e portfolio, mas nao para prometer operacao real de admin sem nova validacao.

## Achados Da Higienizacao

- Existe um `server/.env` local com variaveis Cloudinary preenchidas. O arquivo esta ignorado pelo Git e nao foi encontrado no historico consultado, mas deve continuar fora do repositorio.
- Arquivos antigos de relatorio, logs, backup e temporarios foram removidos ou arquivados.
- Diretórios de ferramental de agentes foram removidos do controle de versao por nao fazerem parte do produto.
- A documentacao antiga com linguagem de "SAFE TO SELL" foi movida para arquivo historico, e a documentacao atual nao usa essa promessa.
- `npm audit` da raiz passou sem vulnerabilidades conhecidas.
- `npm audit` do `server/` ainda aponta 1 vulnerabilidade moderada em `uuid`; a correcao automatica exige `--force` e troca para uma versao com possivel breaking change, entao ficou documentada como pendencia.

## Admin Publico

O backend serve uma pagina `/admin` e aplica `X-Robots-Tag: noindex, nofollow` nessa pagina. Isso reduz indexacao, mas nao esconde a rota. Se uma demo publica incluir admin, trate como experimental.

Antes de uso real, recomenda-se:

- remover ou proteger o admin nas demos publicas;
- exigir credenciais fortes e rotacionadas;
- revisar CORS e CSP para os dominios finais;
- validar CSRF, refresh tokens e expiracao de sessao com testes;
- separar dados/ambiente por cliente;
- registrar logs sem dados sensiveis.

## Segredos

Nunca versionar:

- `.env` real;
- URLs de banco Neon/Postgres;
- `JWT_SECRET`;
- secrets Cloudinary;
- chaves Stripe;
- tokens de CI/CD ou GitHub.

Se qualquer segredo real ja tiver sido publicado antes, a acao correta e rotacionar a credencial no provedor.

## Escopo Seguro Atual

O escopo mais seguro para cliente real hoje e:

- site estatico;
- cardapio digital;
- WhatsApp para pedidos/contato;
- sem login publico;
- sem banco por cliente;
- sem upload em producao.

## Pendencias Tecnicas De Seguranca

- Rotacionar qualquer segredo que ja tenha sido usado fora do ambiente local.
- Decidir se o backend experimental sera mantido, removido das demos ou protegido por ambiente privado.
- Resolver a pendencia de `uuid` com teste de compatibilidade antes de aplicar upgrade maior.
- Ajustar timers do `authService` para nao deixar open handles nos testes.
