# 📚 Documentation Structure

This folder contains all essential and archived documentation for the Restaurant Template SaaS project.

## 📁 Folder Structure

```
docs/
├── keep/              # Essential docs (actively used)
├── archive/           # Historical/deprecated docs (safe archive)
├── KEEP_LIST.json     # Metadata for preserved files
└── README_DOCS.md     # This file
```

---

## 🎯 Purpose

**`docs/keep/`** contains only the documentation files required for:
- **Sales & Client Onboarding** (pricing, templates, checklists)
- **Deployment & Operations** (deploy guides, environment setup)
- **Project Status & Audits** (verdicts, phased corrections, updates)
- **Technical Reference** (repo README, tech stack overview)

**`docs/archive/`** contains:
- Historical audit reports (old format)
- Deprecated guides (superseded versions)
- Implementation task lists (completed or backlog)
- Internal planning documents (no longer actively referenced)

**Why archive instead of delete?** Preserves project history, allows restoration if needed, and maintains git blame context.

---

## 📄 Essential Files (docs/keep/)

| File | Use When |
|---|---|
| **README-repo.md** | Onboarding developers, project overview |
| **PLANOS_COMERCIAIS.md** | Pricing discussions, defining client packages |
| **UPDATE.md** | Checking current status, planning next phase |
| **CHECKLIST_CLIENTE.md** | Starting new client, gathering deployment variables |
| **GUIA_COMPLETO_DEPLOY.md** | Deploying to production, troubleshooting |
| **GUIA_VENDAS_E_CUSTOMIZACAO.md** | Sales preparation, scoping custom work |
| **TEMPLATES_VENDAS.md** | Prospecting, follow-ups, closing deals |
| **verdict.md** | Quick audit reference (Feb 12 condensed) |
| **phased_corrections.md** | Planning technical debt, security fixes |
| **final_verdict.md** | Final GO/NO-GO decision, production readiness |

📖 Full descriptions available in [`KEEP_LIST.json`](KEEP_LIST.json)

---

## 🔍 Archived Files (docs/archive/)

18 files archived (see [`archive/index.csv`](archive/index.csv) for complete list):
- Old audit reports (superseded by final_verdict.md)
- Future task lists (TAREFAS_FUTURAS.md)
- Deployment guide variants (DEPLOY_RENDER_PLANOS.md)
- Client manual drafts (MANUAL_DO_PROPRIETARIO.md)
- JSON reports (bugs.json, inventory.json, security_summary.json)

---

## 🔄 Restoring Archived Files

### Option 1: Git Move (preserves history)
```bash
# Restore to repo root
git mv docs/archive/FILENAME.md ./

# Or restore to custom location
git mv docs/archive/FILENAME.md path/to/destination/
```

### Option 2: Using Helper Script
```bash
# Restore file back to original location
bash scripts/restore_doc.sh FILENAME.md

# Example
bash scripts/restore_doc.sh TAREFAS_FUTURAS.md
```

The script automatically:
- Moves file from archive to repo root
- Stages the change in git
- Suggests a commit message

---

## 📊 Statistics

- **Preserved:** 10 essential documents
- **Archived:** 18 historical documents
- **Last cleanup:** 2026-02-13
- **Branch:** `chore/docs-cleanup`

---

## 🚀 Quick Links

| Resource | Description |
|---|---|
| [Final Verdict](keep/final_verdict.md) | Latest production readiness decision ✅ GO — SAFE TO SELL |
| [Phased Corrections](keep/phased_corrections.md) | Audit issue fixes (H-01 to L-06) |
| [Deploy Guide](keep/GUIA_COMPLETO_DEPLOY.md) | Full deployment walkthrough |
| [Sales Templates](keep/TEMPLATES_VENDAS.md) | Copy-paste prospecting scripts |
| [Pricing Plans](keep/PLANOS_COMERCIAIS.md) | Essential vs Professional tiers |

---

## 💡 Maintenance

**When to add files to `keep/`:**
- New deployment guides or checklists
- Updated audit verdicts
- Sales playbook updates
- Client onboarding templates

**When to archive:**
- Superseded documentation versions
- Completed task lists
- Old audit reports (keep only latest)
- Deprecated guides

**Never archive:**
- Current production deployment guide
- Active client checklist templates
- Latest audit verdict
- Sales/pricing documentation

---

**Questions?** Check [KEEP_LIST.json](KEEP_LIST.json) for file descriptions or [archive/index.csv](archive/index.csv) for archived file metadata.
