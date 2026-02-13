# Pull Request

## 📋 Tipo de Mudança

<!-- Marque com 'x' o tipo que se aplica -->

- [ ] 🐛 Bug fix (correção que resolve um issue)
- [ ] ✨ Nova feature (funcionalidade que adiciona valor)
- [ ] 💥 Breaking change (mudança que quebra compatibilidade)
- [ ] 📝 Documentação (apenas atualização de docs)
- [ ] 🎨 Refactoring (mudança de código sem alterar comportamento)
- [ ] ⚡ Performance (melhoria de performance)
- [ ] 🔒 Security (correção ou melhoria de segurança)
- [ ] 🧪 Tests (adicionar ou corrigir testes)
- [ ] 🔧 Chore (build, CI, dependencies, configs)

---

## 🎯 Descrição

<!-- Descrição clara e concisa do que foi alterado e por quê -->

### Problema / Contexto
<!-- Qual problema esta PR resolve? Link para issue se aplicável -->

Closes #ISSUE_NUMBER

### Solução
<!-- Como você resolveu o problema? Abordagem técnica -->

---

## 📦 O Que Mudou

<!-- Liste as principais mudanças realizadas -->

### Adicionado
- 

### Modificado
- 

### Removido
- 

### Corrigido
- 

---

## 🧪 Como Testar

<!-- Passo a passo para testar as mudanças -->

### Pré-requisitos
```bash
# Dependências ou setup necessário
npm install
cp .env.example .env
```

### Passos para Testar
1. 
2. 
3. 

### Resultados Esperados
- [ ] Feature X funciona conforme esperado
- [ ] Não há regressão em features existentes
- [ ] Testes automatizados passam
- [ ] Build compila sem erros

---

## 📸 Screenshots / Demos

<!-- Se aplicável, adicione screenshots ou GIFs demonstrando a mudança -->

### Antes
<!-- Screenshot do comportamento anterior -->

### Depois
<!-- Screenshot do novo comportamento -->

---

## ✅ Checklist de Qualidade

### Código
- [ ] Código segue os padrões do projeto (ESLint, Prettier)
- [ ] Código está comentado em partes complexas
- [ ] Funções e variáveis têm nomes descritivos
- [ ] Sem código comentado ou debug logs (console.log)
- [ ] Sem warnings do TypeScript (`npx tsc --noEmit`)

### Testes
- [ ] Testes unitários/integração adicionados ou atualizados
- [ ] Todos os testes passam (`npm run test`)
- [ ] Coverage mantém ou melhora (>60% overall)
- [ ] Casos edge testados

### Segurança
- [ ] Não expõe secrets ou dados sensíveis
- [ ] Input validation implementada
- [ ] Não introduz vulnerabilidades (SQL injection, XSS, CSRF)
- [ ] `npm audit` não mostra novas vulnerabilidades críticas

### Performance
- [ ] Não há regressão de performance
- [ ] Queries de DB são otimizadas (índices, LIMIT)
- [ ] Sem N+1 queries
- [ ] Assets otimizados (imagens, CSS, JS)

### Acessibilidade (se aplicável)
- [ ] ARIA labels em elementos interativos
- [ ] Navegação por teclado funciona
- [ ] Contraste de cores adequado (WCAG AA)
- [ ] Screen readers conseguem navegar

### Documentação
- [ ] README atualizado (se necessário)
- [ ] Comentários inline em lógica complexa
- [ ] Changelog atualizado (se aplicável)
- [ ] Variáveis de ambiente documentadas no .env.example

---

## 🚀 Deploy / Migration

### Requer Migration de Banco?
- [ ] Sim — Migration script incluído: `server/prisma/migrations/XXXXXX_description.sql`
- [ ] Não

### Novas Variáveis de Ambiente?
<!-- Liste novas env vars e seus valores de exemplo -->

```bash
# .env
NEW_VAR=example_value
ANOTHER_VAR=example
```

### Instruções de Deploy
<!-- Passos especiais necessários para deploy (se houver) -->

```bash
# Exemplo:
cd server
npm install
npx prisma migrate deploy
npm run build
pm2 restart app
```

### Rollback Plan
<!-- Como reverter esta mudança se algo der errado? -->

```bash
# Exemplo:
git revert <commit-sha>
npx prisma migrate rollback
npm run build
pm2 restart app
```

---

## 🔗 Links Relacionados

<!-- Issues, PRs, documentação relacionada -->

- Issue: #ISSUE_NUMBER
- Documentação: [Link]
- Staging/Preview: [URL se disponível]
- Design/Mockup: [Link se aplicável]

---

## 👥 Reviewers

<!-- Marque os reviewers apropriados -->

**Required:**
- [ ] @tech-lead — Revisão técnica
- [ ] @security-reviewer — Revisão de segurança (se mudanças de auth/perms)

**Optional:**
- [ ] @ux-designer — Revisão de UX (se mudanças visuais)
- [ ] @qa-tester — Revisão de QA

---

## 📊 Métricas de Impacto

<!-- Se aplicável, adicione métricas antes/depois -->

### Performance
- Lighthouse Score (antes): XX/100
- Lighthouse Score (depois): YY/100
- Bundle size (antes): XX KB
- Bundle size (depois): YY KB

### Code Coverage
- Coverage (antes): XX%
- Coverage (depois): YY%

---

## 💬 Notas Adicionais

<!-- Qualquer informação adicional relevante para reviewers -->

<!-- Exemplo:
- Esta PR depende de #123 ser merged primeiro
- Testado em Chrome, Firefox, Safari
- Edge case conhecido: [descrever] — será tratado em issue separado #456
-->

---

## 🏷️ Labels Sugeridas

<!-- GitHub labels para facilitar categorização -->

`enhancement` `bug` `security` `performance` `ux` `testing` `documentation` `chore` `priority:high` `sprint-X`

---

**Definition of Done:**
- [ ] Code review aprovado por 2+ reviewers
- [ ] CI/CD pipeline passa (lint, tests, build, audit)
- [ ] QA manual realizado
- [ ] Documentação atualizada
- [ ] Staging testado (se aplicável)
- [ ] PO/Stakeholder aprovou (se feature)

---

<!-- 
Template criado para Restaurant Template SaaS
Versão: 1.0
Data: 2026-02-13
-->
