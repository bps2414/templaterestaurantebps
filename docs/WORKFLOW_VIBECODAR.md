# 🚀 Workflow Vibecodar — Como Criar Projetos Inteiros Usando IA

> **Autor:** Desenvolvedor usando GitHub Copilot Pro + ChatGPT  
> **Data:** Fevereiro 2026  
> **Objetivo:** Documentar workflow completo de desenvolvimento orientado por IA para replicação e otimização

---

## 📖 Índice

1. [O que é Vibecodar](#o-que-é-vibecodar)
2. [Stack de Ferramentas](#stack-de-ferramentas)
3. [Workflow Completo](#workflow-completo)
4. [ChatGPT: Gerador de Prompts](#chatgpt-gerador-de-prompts)
5. [Copilot Pro: Executor e Implementador](#copilot-pro-executor-e-implementador)
6. [Quando Usar Cada Modelo](#quando-usar-cada-modelo)
7. [Exemplos Práticos de Prompts](#exemplos-práticos-de-prompts)
8. [Casos de Uso Reais](#casos-de-uso-reais)
9. [Dicas e Armadilhas](#dicas-e-armadilhas)

---

## O que é Vibecodar

**Vibecodar** = Criar projetos inteiros **100% com IA** através de prompts bem estruturados.

### Filosofia

- Você não escreve código, você **direciona** a IA
- Você não debugga linha por linha, você **audita** e pede correções
- Você não refatora manualmente, você **descreve** a refatoração desejada

### Premissa

A IA tem acesso total ao projeto no VS Code e pode:
- Ler qualquer arquivo
- Editar múltiplos arquivos simultaneamente
- Rodar comandos no terminal
- Fazer commits, pushes, criar branches
- Auditar código, SEO, segurança, performance
- Gerar documentação e roadmaps

---

## Stack de Ferramentas

### 🧠 ChatGPT (Gerador de Prompts)

**Função:** Criar prompts **ultra-detalhados** para enviar ao Copilot Pro

**Modelos usados:**
- **Claude Sonnet 4.5** → Pedidos básicos, prompts simples, consultas rápidas
- **Claude Opus 4.6** → Sistemas complexos, arquiteturas novas, migrações grandes

**Por que usar ChatGPT primeiro?**
- Ele **não tem visão do projeto** → força você a pensar estrategicamente
- Gera prompts estruturados com checklists, regexes, comandos exatos
- Inclui safeguards (backup, testes, rollback)
- Você revisa o prompt antes de executar no projeto real

### 🤖 GitHub Copilot Pro (VS Code)

**Função:** Executar ações no projeto real com visão completa do workspace

**Modelo:** Claude Sonnet 4.5 (motor do GitHub Copilot Chat)

**Vantagens:**
- Acesso direto a todos os arquivos do projeto
- Contexto semântico do código (entende dependências)
- Executa comandos no terminal
- Faz edits multi-arquivo em paralelo
- Commit, push, troca de branches
- Vê erros do TypeScript/ESLint em tempo real

---

## Workflow Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    VOCÊ (Desenvolvedor)                      │
│                                                              │
│  1. Identifica necessidade (feature, bug, auditoria)        │
│  2. Decide: é simples/rápido/dúvida?                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  É simples ou   │
                    │  dúvida rápida? │
                    └─────────────────┘
                       │            │
                  SIM  │            │  NÃO (90% dos casos)
                 (10%) │            │
                       ▼            ▼
         ┌──────────────────┐   ┌────────────────────────────────────┐
         │  Copilot Pro     │   │   ChatGPT (Gerador de Prompts)    │
         │  (Direto)        │   │                                    │
         │                  │   │  Você pede (poucas linhas):       │
         │ "git status"     │   │  "Me dê prompt pra fazer X"       │
         │ "liste erros"    │   │                                    │
         │ "rode testes"    │   │  Modelo usado:                     │
         │                  │   │  • Sonnet 4.5 (normal)            │
         └──────────────────┘   │  • Opus 4.6 (complexo/novo)       │
                       │        └────────────────────────────────────┘
                       │                       │
                       │                       ▼
                              │
                              ▼
         ┌────────────────────────────────────┐
         │ ChatGPT gera prompt detalhado:    │
         │                                    │
         │ • Instruções passo-a-passo        │
         │        │ • Regex e comandos exatos         │
         │        │ • Checklist de validação          │
         │        │ • Instruções de rollback          │
         │        │ • Tech stack específica           │
         │        └────────────────────────────────────┘
         │                       │
         │                       ▼
         │             Você COPIA o prompt
         │                       │
         └───────────────────────┼───────────────────────┐
                                 │                       │
                                 ▼                       ▼
         ┌────────────────────────────────────┐
         │  Copilot Pro (VS Code)             │
         │                                    │
         │  Você COLA o prompt aqui           │
         │                                    │
         │  Copilot executa automaticamente:  │
         │  • Lê workspace inteiro            │
         │  • Edita múltiplos arquivos        │
         │  • Roda comandos no terminal       │
         │  • Executa testes                  │
         │  • Commita e pusha                 │
         └────────────────────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────┐
         │  Você revisa o resultado:          │
         │                                    │
         │  • git diff (ver mudanças)         │
         │  • Testa localmente                │
         │  • Aprova ou pede ajustes          │
         └────────────────────────────────────┘
                              │
                              ▼
              (Opcional) Feedback loop:
         Extrair docs → devolver pro ChatGPT
              → ChatGPT gera prompts melhores
```

---

## ChatGPT: Gerador de Prompts

### Quando usar

| Cenário | Use ChatGPT |
|---------|-------------|
| Criar sistema novo do zero | ✅ Sim |
| Migração de versão (v1 → v2) | ✅ Sim |
| Auditoria técnica (SEO, segurança) | ✅ Sim |
| Implementar feature complexa | ✅ Sim |
| Criar roadmap/documentação | ✅ Sim |
| Perguntas simples sobre git status | ❌ Não (use Copilot direto) |

### Como você usa o ChatGPT

**Você NÃO escreve prompts gigantes no ChatGPT.**  
**Você só pede em poucas linhas:**

```
"Me dê prompt pra fazer [TAREFA]"
```

**ChatGPT entende e gera o prompt detalhado pra você colar no Copilot.**

### Exemplos REAIS de como você pede

#### 1. Migração de versão
**Você escreve no ChatGPT:**
```
Chat, meu projeto ta com algumas partes com V5.3, algumas V1.0.2, 
me mande um prompt pra IA agent que to usando procurar e meio 
"migrar" para uma V2.0.0, TUDO, como se não fosse nenhuma dessas 
antigas. Mas NÃO use nada do git ainda, só mexa nos arquivos.
```

**ChatGPT retorna:**  
Prompt gigante com regex, comandos, checklist, rollback → Você cola no Copilot

---

#### 2. Criar landing page do zero
**Você escreve no ChatGPT:**
```
Agora crie um prompt pro Opus 4.6 criar uma landing page do zero
```

**ChatGPT retorna:**  
Prompt completo com estrutura HTML, CSS, JS, SEO, acessibilidade → Você cola no Copilot

---

#### 3. Transformar site em SaaS
**Você escreve no ChatGPT:**
```
Ele está fazendo a landing page, dai depois pode me dar um prompt 
porque eu quero que esse site seja um SaaS, ou tipo ele tá criando 
só a estética e pra criar um SaaS teria que ser mais trabalho
```

**ChatGPT retorna:**  
Prompt detalhado com backend, auth, billing, Prisma, Docker → Você cola no Copilot

---

#### 4. Auditoria técnica
**Você escreve no ChatGPT:**
```
Preciso de um prompt completo para auditoria técnica de SEO do projeto. 
Tem que analisar HTML, performance, backend, dar score e fases de implementação.
```

**ChatGPT retorna:**  
Prompt estruturado para análise profunda → Você cola no Copilot

---

### Fluxo especial: Extração de documentação

Às vezes você precisa que o ChatGPT entenda melhor o projeto:

**1. Você pede ao ChatGPT:**
```
Me dê prompt pra extrair documentação completa do projeto 
(roadmap, arquitetura, README) e formatar como relatório
```

**2. ChatGPT retorna prompt** → Você cola no Copilot

**3. Copilot extrai:**
- Estrutura de pastas
- Dependencies
- Roadmap existente
- Endpoints da API
- Modelos do banco

**4. Você pega esse relatório e DEVOLVE pro ChatGPT:**
```
Aqui está o relatório do projeto: [cola relatório]

Agora me dê prompt pra implementar feature X baseado nessa arquitetura
```

**5. ChatGPT gera prompt MUITO mais preciso** porque entendeu o projeto!

**Mesmo processo com roadmap:**
- Copilot gera roadmap
- Você devolve pro ChatGPT
- ChatGPT cria prompts para cada fase do roadmap

---

## Copilot Pro: Executor e Implementador

### Fluxo normal (90% dos casos)

**Você NO Copilot:**
1. Cola o prompt que o ChatGPT gerou
2. Copilot lê o workspace inteiro
3. Copilot executa tudo
4. Você valida o resultado

### Usar Copilot direto (10% dos casos)

Quando você decide que é **simples, rápido ou dúvida**:

| Cenário | Exemplo |
|---------|---------|
| Comandos git | "Mostre o git status e branches" |
| Ver erros | "Liste erros TypeScript no projeto" |
| Rodar testes | "Rode npm test e mostre resultado" |
| Commit simples | "Faça commit com mensagem X" |
| Dúvidas rápidas | "Qual a diferença entre X e Y?" |
| Perguntas sobre código | "Onde está implementado o login?" |

**Você decide na hora:** "Isso é simples/rápido?" → Manda direto no Copilot.

**Para implementações (mesmo pequenas):** Normalmente você pede prompt ao ChatGPT primeiro.

### Como o Copilot trabalha

**1. Você recebeu prompt do ChatGPT e cola aqui:**
```
[PROMPT DETALHADO DE 200-1000 LINHAS QUE CHATGPT GEROU]
```

**2. Copilot lê automaticamente:**
- ✅ Estrutura do workspace inteiro
- ✅ Conteúdo dos arquivos relevantes
- ✅ Git status (branch, uncommitted changes)
- ✅ Erros de compilação (TypeScript, ESLint)
- ✅ Dependências (package.json, requirements.txt)

**3. Copilot executa em paralelo:**
```javascript
// Exemplo: implementar SEO Phase 1 em 5 arquivos
multi_replace_string_in_file([
  { file: 'index.html', add: '<meta name="description"...>' },
  { file: 'menu.html', add: '<meta name="description"...>' },
  { file: 'about.html', add: '<meta name="description"...>' },
  { file: 'gallery.html', add: '<meta name="description"...>' },
  { file: 'contact.html', add: '<meta name="description"...>' }
]);
```

**4. Copilot valida:**
```bash
# Verifica erros TypeScript
get_errors(['server/src/app.ts'])

# Roda testes
run_in_terminal('npm test')
```

**5. Copilot commita e pusha:**
```bash
git add .
git commit -m "feat(seo): Phase 1 - meta tags, canonical, JSON-LD"
git push origin main
```

### Exemplo real de interação

**Você pede ao ChatGPT:**
```
Preciso implementar Phase 1 de SEO na main, auditar, 
commitar, pushar, depois fazer o mesmo na branch Template-B 
e me dar veredito se posso vender
```

**ChatGPT gera prompt** → Você cola no Copilot:
```
After implementing phase 1 I can sell right? So, implement phase 1, 
after do a quick audit to see if it was implemented right, commit, 
push, and go to Branch Template-B and do Phase 1 on that same branch, 
commit and push, then give me a verdict if I can sell or not
```

**Copilot faz (automaticamente):**
1. ✅ Lê todas as 5 páginas HTML
2. ✅ Descobre que app.js já tem OG tags dinâmicas
3. ✅ Adiciona meta description, canonical, preconnect em todos os HTMLs
4. ✅ Corrige H1 vazio (`<h1 id="hero-title"></h1>` → `<h1>Restaurante</h1>`)
5. ✅ Adiciona JSON-LD Restaurant schema no app.js
6. ✅ Atualiza server/app.ts para bloquear /admin com noindex
7. ✅ Verifica erros TypeScript (0 errors)
8. ✅ Commita: `feat(seo): Phase 1 — meta descriptions, OG tags, canonical`
9. ✅ Pusha para origin/main
10. ✅ Troca para branch template-b
11. ✅ Repete todo o processo com conteúdo "Hamburgueria"
12. ✅ Commita e pusha template-b
13. ✅ Volta para main
14. ✅ **Dá o veredito final:** "SIM, PODE VENDER"

---

## Quando Usar Cada Modelo

### Claude Sonnet 4.5 (ChatGPT + Copilot)

**Use para:**
- Prompts simples e diretos
- Features rotineiras (CRUD, validações)
- Correções de bugs conhecidos
- Auditorias básicas
- Documentação
- Testes unitários

**Características:**
- ⚡ Mais rápido
- 💰 Mais barato
- 🎯 Ideal para 80% dos casos
- ✅ Confiável em tarefas bem definidas

**Exemplo de como você pede:**
```
Me dê prompt pra adicionar rate limiting no endpoint /api/auth/login. 
Máximo 5 tentativas por 15 minutos com express-rate-limit.
```

### Claude Opus 4.6 (ChatGPT apenas)

**Use para:**
- Criar sistemas completamente novos
- Arquiteturas complexas (microservices, event-driven)
- Migrações massivas de código
- Transformações profundas (monolito → SaaS)
- Decisões de arquitetura críticas
- Auditorias de segurança em profundidade

**Características:**
- 🧠 Mais inteligente e criativo
- 🔬 Analisa cenários complexos
- 📐 Sugere arquiteturas melhores
- ⚠️ Mais lento e caro
- 🎯 Use quando Sonnet falha ou tarefa é crítica

**Exemplo de como você pede:**
```
Me dê prompt completo pro Copilot transformar esta landing page 
estática em um SaaS multi-tenant com autenticação, billing (Stripe), 
admin panel, emails transacionais, rate limiting, audit logs, 
e testes E2E. Inclua Docker-compose, migrations Prisma.
```

### Decisão Rápida

```
Tarefa é nova ou muito complexa?
│
├─ SIM → Opus 4.6 (gera prompt detalhado)
│          ↓
│        Copia prompt para Copilot
│          ↓
│        Copilot executa
│
└─ NÃO → Sonnet 4.5 (gera prompt)
           ↓
         Copia prompt para Copilot
           ↓
         Copilot executa
```

---

## Exemplos Práticos de Prompts

### 1. Auditoria SEO Técnica

**Você pede ao ChatGPT:**
```
Preciso de um prompt completo para auditoria técnica de SEO do projeto. 
Tem que analisar HTML, performance, backend, dar score e fases de implementação.
```

**ChatGPT retorna (prompt pronto para colar no Copilot):**
```
You are a Senior Technical SEO + Fullstack Auditor. Analyze the 
ENTIRE project:

1. Scan all HTML files for:
   - Title tags (present, unique, 50-60 chars)
   - Meta descriptions (present, unique, 150-160 chars)
   - H1 tags (one per page, not empty)
   - Canonical tags
   - Open Graph tags (7 required: title, description, image, url, type, locale, site_name)
   - Structured data (JSON-LD)

2. Check frontend performance:
   - Image formats (prefer webp)
   - Lazy loading implementation
   - CSS/JS minification
   - Font loading strategy
   - Render-blocking resources

3. Analyze backend (server/src/):
   - Sitemap.xml generation
   - Robots.txt
   - Canonical URL handling
   - X-Robots-Tag for admin pages

4. Provide:
   - SEO Score (X/10)
   - List of 16 items analyzed with ✅/❌
   - Implementation phases (Critical, Important, Nice-to-have)
   - Estimated impact per fix

Output as structured report with priorities.
```

**Você cola no Copilot** → Copilot analisa tudo e gera relatório completo

---

### 2. Implementar Feature Completa

**Você pede ao ChatGPT:**
```
Me dê prompt para implementar página de perfil com upload de avatar, 
validação, testes e commit. Backend Prisma + Express, frontend vanilla JS.
```

**ChatGPT retorna (prompt pronto para colar no Copilot):**
```
Implement user profile page with avatar upload:

1. Create /profile route in server/src/routes/users.ts
2. Add Prisma model User fields: avatarUrl, bio (max 500 chars)
3. Implement multer middleware for image upload (max 5MB, jpg/png/webp)
4. Store in assets/uploads/avatars/ with UUID filename
5. Add validation: image dimensions 200x200 to 2000x2000
6. Create frontend page: public/profile.html with:
   - Avatar preview
   - Upload button
   - Bio textarea with character count
   - Save button (AJAX to /api/profile)
7. Update app.js to fetch /api/me and populate avatar
8. Add tests: upload valid/invalid images, exceed size limit
9. Update server/src/app.ts to serve /profile
10. Commit with message: "feat(profile): add user profile with avatar upload"
```

**Você cola no Copilot** → Copilot implementa tudo em 2-3 minutos ✅

---

### 3. Migração de Código Legacy

**Você pede ao ChatGPT:**
```
Me dê prompt pra migrar projeto Express + MongoDB pra Prisma + PostgreSQL. 
Manter rotas, atualizar queries, migrations, testes, docker-compose. 
Sem mexer em git ainda.
```

**ChatGPT retorna (prompt detalhado de 800+ linhas):**
```
Create a detailed prompt for Copilot to migrate this Express + MongoDB 
project to Express + Prisma + PostgreSQL:

Requirements:
- Keep existing API contracts (same routes, responses)
- Migrate all Mongoose schemas to Prisma models
- Convert MongoDB queries to Prisma queries
- Update all controllers and services
- Generate Prisma migrations
- Add seed script with 10 fake users
- Update docker-compose.yml (remove mongo, add postgres)
- Update .env.example with DATABASE_URL
- Run tests and fix breaking changes
- Create migration report with:
  - Before/after comparison
  - Breaking changes list
  - Rollback instructions
- Do NOT push to git yet (local only)

Generate the complete prompt with:
- Prisma schema examples
- Query conversion patterns (find → findMany, etc.)
- Test commands
- Validation checklist
```

**Você cola no Copilot** → Copilot migra tudo em 15-20 minutos

---

### 4. Criar Roadmap

**Você pede ao ChatGPT:**
```
Me dê prompt pra criar roadmap 90 dias desse SaaS restaurante. 
Tem que ter user stories, complexidade, tasks.json e templates GitHub.
```

**ChatGPT retorna (prompt pronto para colar no Copilot):**
```
Create a 90-day product roadmap for this SaaS restaurant template:

Context: We have a working MVP with auth, billing, multi-tenant orgs.

Format: roadmap/roadmap.md with:
- Month 1: Core features (menu management, order tracking, WhatsApp integration)
- Month 2: Growth features (referral program, analytics dashboard, email campaigns)
- Month 3: Scale features (mobile app, API for integrations, white-label)

For each feature:
- User story (As a [role], I want [goal], so that [benefit])
- Acceptance criteria (3-5 items)
- Estimated complexity (S/M/L)
- Dependencies
- Suggested branch name

Also create:
- roadmap/tasks.json with all tasks in structured format
- roadmap/github_issues.md with GitHub issue templates

Use emoji for visual hierarchy.
```

**Você cola no Copilot** → Copilot gera roadmap completo

---

## Casos de Uso Reais

### Caso 1: Implementar SEO Phase 1 em 2 branches

**Contexto:** Projeto tem template genérico (main) e template hamburgueria (template-b). Precisa de SEO mínimo para vender.

**Você pede ao ChatGPT:**
```
Preciso implementar Phase 1 de SEO na main, auditar, commitar, pushar, 
depois fazer o mesmo na template-b e me dar veredito se posso vender
```

**ChatGPT gera prompt** → Você cola no Copilot

**Resultado:**
- ✅ 7 arquivos editados em cada branch
- ✅ +113 insertions por branch
- ✅ Meta descriptions, canonical, OG tags, JSON-LD
- ✅ H1 corrigido (vazio → "Restaurante" / "Hamburgueria")
- ✅ X-Robots-Tag em páginas admin
- ✅ 2 commits + 2 pushes
- ✅ Veredito: **"SIM, PODE VENDER. SEO Score subiu de 5.5/10 → 7.5/10"**

**Tempo:** ~5 minutos  
**Linhas de código escritas por você:** 0

---

### Caso 2: Transformar landing page em SaaS

**Contexto:** Landing page estática pronta. Cliente quer dashboard, autenticação, billing.

**Você pede ao ChatGPT (Opus 4.6):**
```
Me dê prompt completo para transformar landing page em SaaS MVP com:
- Backend Express + Prisma + PostgreSQL
- Auth (JWT + refresh tokens)
- Stripe billing com webhooks
- Multi-tenancy (organizações)
- Admin panel básico
- Docker-compose local
- Testes Jest
- Sem tocar em git (só arquivos)
```

**ChatGPT retorna:** Prompt de 1200+ linhas

**Você cola no Copilot** → 20 minutos depois:
- ✅ 45+ arquivos criados
- ✅ Backend funcional
- ✅ Testes passando
- ✅ Docker rodando local
- ✅ Relatório `saas_migration_report.md`

---

### Caso 3: Comparar Render vs Vercel

**Você pede ao Copilot (direto, sem ChatGPT):**
```
O Render é melhor que Vercel para nosso projeto?
```

**Copilot analisa:**
- ✅ Lê server/src/ (Express + Prisma)
- ✅ Vê cron jobs, rate limiting, CSRF
- ✅ Entende que usa PostgreSQL persistente

**Resposta (2 minutos):**
- "SIM, Render é **MUITO** melhor"
- Vercel é serverless → requer reescrita de 60-70% do código
- Render suporta servidor persistente → deploy direto
- Tabela comparativa com 8 critérios
- Custo estimado: $7/mês (Render) vs $20+/mês (Vercel)

---

## Dicas e Armadilhas

### ✅ Boas Práticas

1. **Sempre peça backup antes de mudanças grandes**
   ```
   "Crie backup em ./backup_before_[TASK]/ antes de começar"
   ```

2. **Seja específico com tecnologias**
   ```
   ❌ "Adicione autenticação"
   ✅ "Adicione autenticação JWT com refresh tokens usando bcrypt 
       para hash, express-jwt para middleware, e redis para blacklist"
   ```

3. **Peça validação após implementação**
   ```
   "Após implementar, rode testes, verifique erros TypeScript, 
   e me dê um resumo do que foi alterado"
   ```

4. **Use fases para tarefas grandes**
   ```
   "Implemente em 3 fases:
   Phase 1: Modelos Prisma + migrations
   Phase 2: Controllers + routes
   Phase 3: Frontend integration + testes
   
   Pare após cada fase e me mostre o resultado"
   ```

5. **Documente decisões de arquitetura**
   ```
   "Crie ADR (Architecture Decision Record) em docs/adr/ explicando 
   por que escolhemos Prisma vs TypeORM"
   ```

### ❌ Armadilhas Comuns

1. **Prompt vago = resultado ruim**
   ```
   ❌ "Melhore o SEO"
   ✅ "Adicione meta description única em todas as 5 páginas HTML, 
       canonical tags, e JSON-LD Restaurant schema no app.js"
   ```

2. **Esquecer de especificar "não usar git"**
   ```
   # Se você quer só editar arquivos localmente:
   "IMPORTANTE: NÃO execute comandos git (commit, push, branch). 
   Apenas altere arquivos no filesystem."
   ```

3. **Não pedir relatório final**
   ```
   # Sempre termine com:
   "Gere [TASK]_report.md com lista de arquivos alterados, 
   comandos executados, e instruções de rollback"
   ```

4. **Ignorar testes**
   ```
   # Sempre valide:
   "Após implementar, rode npm test, pytest, ou o equivalente 
   e me mostre se passou"
   ```

5. **Não usar ChatGPT pra gerar prompts**
   ```
   ❌ Escrever prompt gigante direto no Copilot
   ✅ Pedir prompt ao ChatGPT em poucas linhas → Colar no Copilot
   ```

### 🎯 Checklist pré-prompt (pro ChatGPT)

Quando você for pedir prompt ao ChatGPT:

- [ ] Disse claramente o que quer?
- [ ] Mencionou tech stack se relevante?
- [ ] Especificou se pode usar git ou não?
- [ ] Pediu validação (testes, lint)?
- [ ] Pediu relatório final?

---

## Conclusão

**Vibecodar não é sobre escrever menos código — é sobre DIRECIONAR melhor a IA.**

### Workflow ideal:

1. **Pensa** → O que preciso fazer?
2. **Pede ao ChatGPT** → "Me dê prompt pra fazer X" (em poucas linhas)
3. **ChatGPT gera** → Prompt detalhado de 200-1000 linhas
4. **Cola no Copilot** → Copilot implementa tudo automaticamente
5. **Valida** → git diff, testes locais, aprovação
6. **Itera** → Ajusta e melhora conforme necessário

### Métricas do workflow (estimativa):

- **Velocidade:** 10-20x mais rápido que codificar manualmente
- **Qualidade:** Alta (com prompts bons + revisão)
- **Custo:** ~$20-40/mês (Copilot Pro) + ~$50-150/mês (ChatGPT API)
- **Curva de aprendizado:** ~2 semanas para dominar

### Próximos passos para você:

1. ✅ Leia este documento completo
2. ✅ Teste com uma tarefa pequena (ex: adicionar validação em 1 formulário)
3. ✅ Evolua para tarefas médias (ex: criar CRUD completo)
4. ✅ Tente algo complexo (ex: migrar DB ou adicionar feature grande)
5. ✅ Refine seus prompts baseado nos resultados

**Boa sorte! E lembre-se: a IA é sua ferramenta, mas VOCÊ é o arquiteto. 🚀**

---

## Apêndice: Comandos Úteis

### Git via Copilot

```bash
# Ver status
"Mostre o git status e branches disponíveis"

# Criar branch
"Crie branch feature/nova-feature e faça checkout"

# Commit
"Commite todas as mudanças com mensagem: 
'feat(auth): add JWT authentication'"

# Push
"Faça push para origin/main"

# Stash
"Stash mudanças não commitadas com nome 'wip-before-switch'"

# Checkout
"Troque para branch template-b"
```

### Análises via Copilot

```bash
# Busca semântica
"Procure por todos os lugares onde fazemos queries ao banco"

# Erros
"Liste todos os erros TypeScript no projeto"

# Dependências
"Liste todas as dependências npm e suas versões"

# Estrutura
"Mostre a estrutura de pastas de server/src/ até 3 níveis"
```

### Testes via Copilot

```bash
# Rodar testes
"Rode npm test e me mostre o output"

# Criar testes
"Crie testes unitários para server/src/services/authService.ts 
usando Jest. Teste: login success, login fail, token expiration"

# Coverage
"Rode coverage e me diga qual a porcentagem atual"
```

---

**Versão:** 1.0.0  
**Última atualização:** 13 de fevereiro de 2026  
**Feedback:** Abra issue no repositório ou mande mensagem direta
