# 🗺️ ROADMAP — Melhoria Contínua (UX 9 · Segurança 9 · Técnica 9)

**Projeto:** Restaurant Template SaaS  
**Status atual:** ✅ SAFE TO SELL (UX 7/10 · Segurança 8/10 · Técnica 8/10)  
**Meta:** UX 9/10 · Segurança 9/10 · Técnica 9/10  
**Versão:** 1.0  
**Data:** 2026-02-13

---

## 🎯 Visão

Este roadmap prioriza melhorias incrementais para elevar a qualidade do produto de "SAFE TO SELL" para "PRODUCTION EXCELLENCE". Foco em **impacto/esforço alto**, implementando loading states profissionais, testes automatizados, Redis para scaling horizontal, build otimizado do Tailwind, e pipeline CI/CD — todas melhorias sugeridas na auditoria final que maximizam vendabilidade e confiança técnica.

---

## 🏆 Objetivo

Atingir **9/10 em todas as métricas** através de 3 sprints focados:

| Sprint | Objetivo | Ganhos Esperados | Duração |
|---|---|---|---|
| **Sprint 1: Quick Wins** | UX polish + deps audit | UX +1.5, Segurança +0.5 | 8–12h (1–1.5 dias) |
| **Sprint 2: Core** | Redis + Testes + Build | Segurança +0.5, Técnica +1 | 16–24h (2–3 dias) |
| **Sprint 3: Polish** | CSP + CI + Monitoring | Técnica +0.5, Segurança +0.3 | 12–16h (1.5–2 dias) |

**Tempo total:** 36–52 horas (4.5–6.5 dias de trabalho focado)

---

## 📊 Estado Atual vs Meta

| Métrica | Atual | Meta | Gap | Ações Chave |
|---|---|---|---|---|
| **UX** | 7/10 | 9/10 | +2 | Loading states, toasts, validação visual, skeleton loaders, A11y |
| **Segurança** | 8/10 | 9/10 | +1 | Redis rate limit, CSP nonces, deps audit, SRI |
| **Técnica** | 8/10 | 9/10 | +1 | Testes (60%+ coverage), Tailwind build, CI/CD, monitoring |

---

## 🚀 Sprint 1 — Quick Wins (8–12h)

**Objetivo:** Melhorias de UX e segurança de baixo esforço e alto impacto visível.

### Tarefas

| ID | Título | Prioridade | Tempo | Ganho |
|---|---|---|---|---|
| **S1-T1** | Loading states + toast notifications | HIGH | 2–3h | UX +0.5 |
| **S1-T2** | Validação visual de formulários | HIGH | 1.5–2h | UX +0.3 |
| **S1-T3** | npm audit fix + dependências críticas | HIGH | 1–2h | Segurança +0.3 |
| **S1-T4** | Security headers extras (Expect-CT, CSP-Report) | MEDIUM | 0.5–1h | Segurança +0.2 |
| **S1-T5** | ARIA labels + focus trap em modais | MEDIUM | 2–3h | UX +0.4, A11y |
| **S1-T6** | Skeleton loaders (galeria, menu) | LOW | 1.5–2h | UX +0.3 |

**Total estimado:** 8–12h  
**Ganhos:** UX 8.5/10 (+1.5) · Segurança 8.5/10 (+0.5)

---

## ⚙️ Sprint 2 — Core Improvements (16–24h)

**Objetivo:** Infraestrutura para produção escalável e confiável.

### Tarefas

| ID | Título | Prioridade | Tempo | Ganho |
|---|---|---|---|---|
| **S2-T1** | Redis para rate limiting (multi-instance) | HIGH | 3–4h | Segurança +0.5 |
| **S2-T2** | Testes automatizados (auth, upload, config, 60%+ coverage) | HIGH | 6–8h | Técnica +0.7 |
| **S2-T3** | Tailwind build local com tree-shaking | MEDIUM | 2–3h | Técnica +0.3 |
| **S2-T4** | Endpoint healthcheck avançado (DB + Redis ping) | MEDIUM | 1–2h | Técnica +0.2 |
| **S2-T5** | Keyboard navigation (ESC fecha modais, Tab order) | LOW | 2–3h | UX +0.3 |

**Total estimado:** 16–24h  
**Ganhos:** Segurança 9/10 (+0.5) · Técnica 9/10 (+1) · UX 8.8/10 (+0.3)

---

## 💎 Sprint 3 — Production Polish (12–16h)

**Objetivo:** Excelência operacional e monitoramento.

### Tarefas

| ID | Título | Prioridade | Tempo | Ganho |
|---|---|---|---|---|
| **S3-T1** | CSP com nonces (eliminar unsafe-inline) | HIGH | 3–4h | Segurança +0.3 |
| **S3-T2** | CI/CD pipeline (GitHub Actions: lint, test, build) | HIGH | 3–4h | Técnica +0.3 |
| **S3-T3** | Error monitoring (Sentry integration) | MEDIUM | 2–3h | Técnica +0.2 |
| **S3-T4** | Subresource Integrity (SRI) para CDNs | LOW | 1h | Segurança +0.1 |
| **S3-T5** | Pre-commit hooks (lint, type-check) | LOW | 1–2h | Técnica +0.1 |
| **S3-T6** | Performance budget CI check (Lighthouse) | LOW | 2h | UX +0.2 |

**Total estimado:** 12–16h  
**Ganhos:** Segurança 9.4/10 (+0.4) · Técnica 9.6/10 (+0.6) · UX 9.0/10 (+0.2)

---

## 📈 Resultado Final Projetado

| Métrica | Antes | Após 3 Sprints | Melhoria |
|---|---|---|---|
| **UX** | 7.0 | **9.0** ✅ | +2.0 |
| **Segurança** | 8.0 | **9.4** ✅ | +1.4 |
| **Técnica** | 8.0 | **9.6** ✅ | +1.6 |

---

## 🔄 Ordem de Execução Sugerida

### Semana 1
1. **S1-T3** — Deps audit (blocker, afeta tudo)
2. **S1-T1** — Loading states (visível imediato)
3. **S1-T2** — Validação visual
4. **S1-T4** — Security headers
5. **S1-T5** — ARIA labels
6. **S1-T6** — Skeleton loaders

### Semana 2
7. **S2-T1** — Redis rate limit (infra crítica)
8. **S2-T2** — Testes automatizados (fundação)
9. **S2-T3** — Tailwind build
10. **S2-T4** — Healthcheck avançado
11. **S2-T5** — Keyboard nav

### Semana 3
12. **S3-T2** — CI/CD (habilita automação)
13. **S3-T1** — CSP nonces
14. **S3-T3** — Error monitoring
15. **S3-T4** — SRI
16. **S3-T5** — Pre-commit hooks
17. **S3-T6** — Perf budget

---

## 📝 Convenções de Branch

```
feature/loading-states         # Nova feature
fix/csrf-validation           # Bugfix
chore/update-deps             # Manutenção
refactor/auth-middleware      # Refactoring
test/auth-service             # Adicionar testes
docs/api-endpoints            # Documentação
```

---

## 🔗 Recursos Relacionados

- [tasks.json](tasks.json) — JSON estruturado de todas as tarefas (importável)
- [github_issues.md](github_issues.md) — Templates prontos para GitHub Issues
- [PR_TEMPLATE.md](PR_TEMPLATE.md) — Template para Pull Requests

---

**Nota:** Este roadmap é iterativo. Cada sprint pode ser ajustado com base em feedback do cliente, urgência de deploy, ou capacidade da equipe. Priorize sempre **impacto/esforço alto** e mantenha o foco em vendabilidade.
