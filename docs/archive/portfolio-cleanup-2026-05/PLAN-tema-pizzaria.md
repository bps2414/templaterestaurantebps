# PLAN: Tema Pizzaria

## Overview
Criar o 3° tema base do projeto: **Pizzaria**. Estrutura idêntica aos temas existentes (restaurante, hamburgueria), apenas com identidade visual própria. JS compartilhado sem customizações.

**Project Type:** WEB (Landing Page)

## Design System
Gerado via `ui-ux-pro-max` → [MASTER.md](file:///f:/VSCode/Landpage/design-system/pizzaria/MASTER.md)

| Role | Hex | Descrição |
|------|-----|-----------|
| Primary | `#3B82F6` | Azul - navbar/links |
| CTA | `#F97316` | Laranja - botões |
| Background | `#F8FAFC` | Cinza claro |
| Text | `#1E293B` | Slate escuro |

**Fontes:** Playfair Display SC + Karla
**Estilo:** Exaggerated Minimalism + Scroll-Triggered Storytelling

## File Structure
```
themes/pizzaria/
├── index.html, about.html, contact.html
├── gallery.html, menu.html, admin.html, privacy.html
├── favicon.svg
└── js/ (cópia dos 11 arquivos JS existentes)
```

## Task Breakdown
- [x] T1: Gerar design system (`ui-ux-pro-max --persist`)
- [x] T2: Analisar estrutura dos temas existentes
- [ ] T3: Criar todos os HTMLs do tema pizzaria
- [ ] T4: Copiar pasta JS e favicon
- [ ] T5: Testar com `THEME=pizzaria npm run dev`
- [ ] T6: UX Audit + browser check

## Integração
`select-theme.js` detecta automaticamente. Zero config.

## Phase X: Verification
- [ ] `$env:THEME="pizzaria"; node scripts/select-theme.js`
- [ ] `$env:THEME="pizzaria"; npm run dev`
- [ ] UX Audit: `python .agent/skills/frontend-design/scripts/ux_audit.py .`
- [ ] Visual check em 375px e 1440px
