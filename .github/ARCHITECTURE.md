# BPS Kit Architecture

> AI Agent Capability Expansion Toolkit — System Map

---

## 📋 Overview

BPS Kit is a modular system consisting of:

- **22 Specialist Agents** — Role-based AI personas
- **Active Skills** — Domain-specific knowledge modules (varies by profile)
- **1200+ Vault Skills** — Extended skill library discoverable via index
- **15 Workflows** — Slash command procedures
- **2 Master Scripts** — Validation & verification

---

## 🏗️ Directory Structure

```plaintext
.github/
├── ARCHITECTURE.md          # This file
├── VAULT_INDEX.md           # Vault skill discovery index
├── rules/
│   └── GEMINI.md            # Master rule file (always loaded)
├── agents/                  # 22 Specialist Agents
├── skills/                  # Active Skills (profile-dependent)
├── vault/                   # 1200+ Vault Skills
├── workflows/               # 15 Slash Commands
└── scripts/                 # Master Validation Scripts
```

---

## 🤖 Agents (22)

Specialist AI personas for different domains.

| Agent                    | Focus                      | Skills Used                                              |
| ------------------------ | -------------------------- | -------------------------------------------------------- |
| `orchestrator`           | Multi-agent coordination   | parallel-agents, behavioral-modes, plan-writing, architecture |
| `project-planner`        | Discovery, task planning   | app-builder, plan-writing, brainstorming                 |
| `frontend-specialist`    | Web UI/UX                  | nextjs-react-expert, tailwind-patterns, frontend-design, design-md, enhance-prompt |
| `backend-specialist`     | API, business logic        | nodejs-best-practices, api-patterns, database-design, mcp-builder |
| `database-architect`     | Schema, SQL                | database-design                                          |
| `mobile-developer`       | iOS, Android, RN           | mobile-design                                            |
| `game-developer`         | Game logic, mechanics      | game-development (12 sub-skills)                         |
| `devops-engineer`        | CI/CD, Docker              | deployment-procedures, server-management                 |
| `security-auditor`       | Security compliance        | vulnerability-scanner, red-team-tactics                   |
| `penetration-tester`     | Offensive security         | vulnerability-scanner, red-team-tactics                   |
| `test-engineer`          | Testing strategies         | testing-patterns, tdd-workflow, webapp-testing            |
| `debugger`               | Root cause analysis        | systematic-debugging                                     |
| `performance-optimizer`  | Speed, Web Vitals          | performance-profiling                                    |
| `seo-specialist`         | Ranking, visibility        | seo-fundamentals, geo-fundamentals                       |
| `documentation-writer`   | Manuals, docs              | documentation-templates                                  |
| `product-manager`        | Requirements, user stories | plan-writing, brainstorming                              |
| `product-owner`          | Strategy, backlog, MVP     | plan-writing, brainstorming                              |
| `qa-automation-engineer` | E2E testing, CI pipelines  | webapp-testing, testing-patterns                          |
| `code-archaeologist`     | Legacy code, refactoring   | refactoring-patterns, code-review-checklist               |
| `explorer-agent`         | Codebase analysis          | architecture, plan-writing, brainstorming                 |
| `site-builder`           | Landing pages, websites    | scroll-experience, tailwind-patterns, frontend-design, design-md, enhance-prompt |
| `automation-specialist`  | n8n workflow automation    | n8n-mcp-tools-expert, n8n-workflow-patterns               |

---

## 🧩 Skills by Profile

Skills availability depends on the installed profile (`basic`, `normal`, or `extra`).

### Basic Profile (11 skills)

| Skill                          | Description                    |
| ------------------------------ | ------------------------------ |
| `behavioral-modes`             | Agent personas                 |
| `brainstorming`                | Socratic questioning           |
| `clean-code`                   | Coding standards (Global)      |
| `concise-planning`             | Quick planning                 |
| `executing-plans`              | Plan execution                 |
| `git-pushing`                  | Git workflow                   |
| `lint-and-validate`            | Linting, validation            |
| `plan-writing`                 | Task planning, breakdown       |
| `systematic-debugging`         | Troubleshooting                |
| `verification-before-completion` | Pre-completion checks        |
| `vulnerability-scanner`        | Security auditing              |

### Normal Profile — Calibrado para stack deste projeto (adds ~29 more skills)

> ⚙️ **Última calibração:** setup-brain (Mar 2026) — Stack: Node.js/Express/TypeScript + Prisma/PostgreSQL + Stripe + TailwindCSS/HTML estático

| Skill                          | Description                    | Status |
| ------------------------------ | ------------------------------ | ------ |
| `api-patterns`                 | REST, GraphQL, tRPC            | ✅ ativo |
| `app-builder`                  | Full-stack scaffolding         | ✅ ativo |
| `backend-dev-guidelines`       | Backend standards              | ✅ ativo |
| `code-review-checklist`        | Padrões de revisão de código   | ✅ ativo (ativado) |
| `copywriting`                  | Marketing copy                 | ✅ ativo |
| `database-design`              | Schema design, optimization    | ✅ ativo |
| `deployment-procedures`        | Docker/docker-compose deploy   | ✅ ativo (ativado) |
| `design-md`                    | Design documentation           | ✅ ativo |
| `dispatching-parallel-agents`  | Multi-agent patterns           | ✅ ativo |
| `docker-expert`                | Containerization               | ✅ ativo |
| `enhance-prompt`               | Prompt enhancement             | ✅ ativo |
| `frontend-design`              | UI/UX patterns, design systems | ✅ ativo |
| `frontend-developer`           | Frontend standards             | ✅ ativo |
| `micro-saas-launcher`          | SaaS scaffolding               | ✅ ativo |
| `nodejs-backend-patterns`      | Padrões específicos Node.js/Express | ✅ ativo (ativado) |
| `page-cro`                     | Conversion rate optimization   | ✅ ativo |
| `performance-profiling`        | Web Vitals, optimization       | ✅ ativo |
| `prisma-expert`                | Prisma ORM, migrations         | ✅ ativo |
| `prompt-engineer`              | Prompt engineering             | ✅ ativo |
| `scroll-experience`            | Scroll-based UX                | ✅ ativo |
| `senior-fullstack`             | Full-stack expertise           | ✅ ativo |
| `seo-audit`                    | SEO audit avançado             | ✅ ativo (ativado) |
| `seo-fundamentals`             | SEO, Core Web Vitals           | ✅ ativo |
| `stripe-integration`           | Payment processing             | ✅ ativo |
| `tailwind-patterns`            | Tailwind CSS v4                | ✅ ativo |
| `test-driven-development`      | TDD workflow                   | ✅ ativo |
| `testing-patterns`             | Jest, Vitest, strategies       | ✅ ativo |
| `web-design-guidelines`        | HTML estático multi-tema       | ✅ ativo (ativado) |
| `webapp-testing`               | Testes de app web completo     | ✅ ativo (ativado) |

#### Skills movidas para o vault (irrelevantes para esta stack)

| Skill                  | Motivo                                   |
| ---------------------- | ---------------------------------------- |
| `clerk-auth`           | Projeto usa JWT próprio — sem Clerk      |
| `nextjs-best-practices`| Frontend é HTML estático — sem Next.js  |
| `nextjs-supabase-auth` | Sem Next.js e sem Supabase               |
| `react-patterns`       | Frontend é Vanilla JS — sem React        |
| `react-components`     | Skill Stitch/React                       |
| `n8n-code-javascript`  | Sem automação n8n no projeto             |
| `n8n-code-python`      | Sem automação n8n no projeto             |
| `n8n-expression-syntax`| Sem automação n8n no projeto             |
| `n8n-mcp-tools-expert` | Sem automação n8n no projeto             |
| `n8n-node-configuration`| Sem automação n8n no projeto            |
| `n8n-validation-expert`| Sem automação n8n no projeto             |
| `n8n-workflow-patterns`| Sem automação n8n no projeto             |
| `rag-engineer`         | Sem pipeline LLM/RAG no projeto          |
| `llm-app-patterns`     | Sem aplicação de LLM no projeto          |
| `vercel-deployment`    | Deploy via Docker/Render — sem Vercel    |

### Extra Profile (adds ~27 more skills)

| Skill                          | Description               |
| ------------------------------ | ------------------------- |
| `api-security-best-practices`  | API security              |
| `async-python-patterns`        | Python async patterns     |
| `cloud-architect`              | Cloud infrastructure      |
| `code-reviewer`                | Code review standards     |
| `deployment-engineer`          | Deployment workflows      |
| `django-pro`                   | Django framework          |
| `domain-driven-design`         | DDD patterns              |
| `ethical-hacking-methodology`  | Ethical hacking           |
| `fastapi-pro`                  | FastAPI framework         |
| `growth-engine`                | Growth strategies         |
| `microservices-patterns`       | Microservices             |
| `nodejs-best-practices`        | Node.js patterns          |
| `pandas`                       | Data analysis             |
| `playwright-skill`             | E2E testing               |
| `postgres-best-practices`      | PostgreSQL optimization   |
| `python-fastapi-development`   | Python FastAPI dev        |
| `python-pro`                   | Python standards          |
| `python-testing-patterns`      | Python testing            |
| `security-auditor`             | Security auditing         |
| `seo-content-writer`           | SEO content               |
| `software-architecture`        | System design patterns    |
| `sql-optimization-patterns`    | SQL optimization          |
| `stitch-loop`                  | Stitch design loop        |
| `threat-modeling-expert`       | Threat modeling           |
| `top-web-vulnerabilities`      | OWASP vulnerabilities     |
| `ui-ux-designer`               | UI/UX design              |
| `web-performance-optimization` | Web performance           |

---

## 🔄 Workflows (15)

Slash command procedures. Invoke with `/command`.

| Command          | Description                     |
| ---------------- | ------------------------------- |
| `/automate`      | n8n workflow automation builder  |
| `/brainstorm`    | Socratic discovery              |
| `/build-site`    | Cinematic landing page builder  |
| `/create`        | Create new features             |
| `/debug`         | Debug issues                    |
| `/deploy`        | Deploy application              |
| `/enhance`       | Improve existing code           |
| `/orchestrate`   | Multi-agent coordination        |
| `/plan`          | Task breakdown                  |
| `/preview`       | Preview changes                 |
| `/recall`        | Re-anchor AI on rules           |
| `/setup-brain`   | Initialize agent memory/context |
| `/status`        | Check project status            |
| `/test`          | Run tests                       |
| `/ui-ux-pro-max` | Full UI/UX design workflow      |

---

## 📜 Scripts (2 master + skill-level)

### Master Scripts

| Script          | Purpose                                 | When to Use              |
| --------------- | --------------------------------------- | ------------------------ |
| `checklist.py`  | Priority-based validation (Core checks) | Development, pre-commit  |
| `verify_all.py` | Comprehensive verification (All checks) | Pre-deployment, releases |

### Usage

```bash
# Quick validation during development
python .github/scripts/checklist.py .

# Full verification before deployment
python .github/scripts/verify_all.py . --url http://localhost:3000
```

### Skill-level Scripts

Scripts are embedded within skills at `.github/skills/<skill>/scripts/`:

| Script                | Skill                 | When to Use         |
| --------------------- | --------------------- | ------------------- |
| `security_scan.py`    | vulnerability-scanner | Always on deploy    |
| `lint_runner.py`      | lint-and-validate     | Every code change   |
| `seo_checker.py`      | seo-fundamentals      | After page change   |
| `lighthouse_audit.py` | performance-profiling | Before deploy       |

> 🔴 **Agents can invoke ANY skill script** via `python .github/skills/<skill>/scripts/<script>.py`

---

## 📊 Statistics

| Metric              | Value                         |
| ------------------- | ----------------------------- |
| **Total Agents**    | 22                            |
| **Basic Skills**    | 11                            |
| **Normal Skills**   | ~42                           |
| **Extra Skills**    | ~69                           |
| **Vault Skills**    | 1200+                         |
| **Total Workflows** | 15                            |

---

## 🔗 Quick Reference

| Need     | Agent                 | Skills                                    |
| -------- | --------------------- | ----------------------------------------- |
| Web App  | `frontend-specialist` | nextjs-react-expert, tailwind-patterns, frontend-design |
| API      | `backend-specialist`  | api-patterns, nodejs-best-practices       |
| Mobile   | `mobile-developer`    | mobile-design                             |
| Database | `database-architect`  | database-design                           |
| Security | `security-auditor`    | vulnerability-scanner, red-team-tactics   |
| Testing  | `test-engineer`       | testing-patterns, tdd-workflow            |
| Debug    | `debugger`            | systematic-debugging                      |
| Plan     | `project-planner`     | brainstorming, plan-writing               |
| Deploy   | `devops-engineer`     | deployment-procedures, server-management  |
| Automate | `automation-specialist` | n8n-mcp-tools-expert, n8n-workflow-patterns |
