# Limitacoes

## Limitacoes Conhecidas

- O projeto foi criado cedo na jornada, com ambicao comercial maior do que a validacao tecnica disponivel.
- As demos comunicam bem o frontend, mas nao provam maturidade SaaS.
- O admin/backend e experimental e depende de revisao antes de uso real.
- `public/` e gerado a partir de `themes/` e pode ser sobrescrito.
- Alguns temas e documentos antigos foram preservados como historico em `docs/archive/`.
- Testes completos dependem de ambiente, banco e variaveis externas.
- O lint do backend passa, mas ainda emite warnings de tipagem ampla em testes e alguns pontos de rotas/servicos.
- Os testes do backend passam, mas o Jest detecta open handles causados por timers periodicos no `authService`.
- O audit do backend ainda tem uma pendencia moderada em `uuid`, que requer avaliacao antes de upgrade maior.

## Nao Faz Parte Do Escopo Atual

- Multi-tenant real.
- Painel administrativo pronto para cliente.
- Pagamentos em producao.
- Garantia de seguranca auditada.
- SLA, monitoramento e suporte operacional.
- Automacao completa de provisionamento para clientes.

## O Que Eu Faria Diferente Hoje

- Comecaria com um produto menor e mais vendavel: landing page, cardapio e WhatsApp.
- Separaria o repositorio em frontend/template e backend/admin experimental.
- Criaria um contrato de conteudo por tema.
- Adicionaria CI simples para build, links e screenshots.
- Documentaria threat model antes de expor qualquer admin.

## Proximo Escopo Recomendado

Para transformar em oferta real, recomendo uma fase pequena:

1. Escolher apenas um tema base.
2. Remover admin da oferta inicial.
3. Criar fluxo de personalizacao manual.
4. Automatizar build/deploy estatico.
5. Validar com um cliente piloto.

Somente depois disso faria sentido retomar admin, banco e login.
