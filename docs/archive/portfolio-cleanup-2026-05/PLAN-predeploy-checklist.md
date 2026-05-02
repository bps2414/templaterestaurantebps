# PLAN-predeploy-checklist

## Goal
Analisar, implementar e verificar todos os itens do `pre_deploy_checklist.md`, em ordem numérica (itens 1 ao 9), utilizando o Browser Subagent para simular testes E2E, deixando o sistema 100% pronto para go-to-market.

## Project Type
**WEB**

## Tasks
- [ ] Task 1: Section 1 (Segurança) → Verify: Auditoria de XSS, Escape Strings no HTML, JWT Expiry e CSP/Rate Limiting básico.
- [ ] Task 2: Section 2 (Cliente Final) → Verify: Geração correta do link do WhatsApp e bloqueio em carrinho vazio/fora de hora.
- [ ] Task 3: Section 3 (UI/UX) → Verify: Testes de line-clamp, scroll das modais, truncamento de texto, e barra inferior do Safari iOS.
- [ ] Task 4: Section 4 (Admin) → Verify: Delete em cascata no BD/Storage (Imagens), input de preços em R$, limite de plano e toasts do Painel.
- [ ] Task 5: Section 5 (Deploy & Cloud) → Verify: `.env` limpo de exposição, `tenant_id` e índices no banco, logs PM2 integrados.
- [ ] Task 6: Section 6 (CI/CD) → Verify: Compilação TypeScript segura e Build passando perfeitamente (`npm run build`).
- [ ] Task 7: Section 7 (E2E) → Verify: Antigravity Browser Control roda um cenário completo de cliente pedindo e loja atualizando.
- [ ] Task 8: Section 8 (Performance) → Verify: Checar query de Menu contra o N+1 problem (carregando dezenas de pratos e categorias com e sem selects paralelos).
- [ ] Task 9: Section 9 (Advanced Security) → Verify: Scan de dependencias (`npm audit`), segurança de cabeçalhos (`helmet`) ativa.

## Constraints & Notes
- **Foco Temático:** O foco das implementações e testes da checklist deve ser estritamente nos temas **lite** e **acai**.
- **Proibição de Edição no `/public`:** 🔴 **NÃO modifique os arquivos dentro do diretório `/public`**, pois eles são substituídos no processo de build via injeção estática. Todas as edições devem ocorrer diretamente nos arquivos-fonte originais dos temas.
- **Ferramentas de Teste:** Como não optado por Cypress/etc., usaremos o Antigravity Browser Control para E2E automatizado.
- **Regra de Implementação:** Sempre executar verificação imediata (*Verification before completion*) entre cada uma das tasks antes de seguir para a próxima Section.

## Done When
- [ ] 100% dos items de 1 a 9 marcados como `[x]` no código original `pre_deploy_checklist.md` e também neste arquivo de plano.
- [ ] Zero erros no step de compilação/build.

## Phase X: Verification
- [ ] Executar o *Lighthouse Audit* simulado e `webapp-testing` básico.
- [ ] Executar o Lint e Validate local.
- [ ] Revisão de Segurança do `checklist.py`.
