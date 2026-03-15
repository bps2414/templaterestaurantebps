# 🚀 PLAN — Starter Plan (Plano Básico)

> **Objetivo:** Criar um novo plano de entrada (Starter) com 4 temas simplificados para negócios locais de bairro.
> **Status:** PLANEJADO
> **Data:** 2026-03-15

---

## 📋 Resumo Executivo

| Campo | Valor |
|---|---|
| **Nome comercial** | Starter Plan |
| **Preço setup** | R$200–300 |
| **Preço mensal** | R$70/mês |
| **Público-alvo** | Pensão, hamburgueria de bairro, pizzaria de esquina, açaízeiro |
| **Temas** | `restaurant-lite`, `burger-lite`, `pizza-lite`, `acai` |
| **Diferencial vs Essencial** | Visual mais simples, menos páginas, limite de pratos/categorias |

---

## 🔒 Definições Fechadas (Brainstorming)

### Plano Starter vs Essencial vs Profissional

| Feature | ⭐ Starter | 🟢 Essencial | 🔵 Profissional |
|---|---|---|---|
| **Setup** | R$200–300 | R$700 | R$900 |
| **Mensal** | R$70/mês | R$100/mês | R$150/mês |
| **Páginas** | index, menu, contact, admin | index, menu, about, contact, gallery, privacy, admin | Todas |
| **Categorias** | **5 max** | Ilimitado | Ilimitado |
| **Pratos** | **30 max** | Ilimitado | Ilimitado |
| **Carrinho + WhatsApp** | ✅ | ✅ | ✅ |
| **Galeria de fotos** | ❌ | ✅ | ✅ |
| **Página Sobre** | ❌ | ✅ | ✅ |
| **Página Privacy** | ❌ | ✅ | ✅ |
| **Domínio personalizado** | ❌ | ❌ | ✅ |
| **Logo customizada** | ❌ | ❌ | ✅ |
| **Cor da marca** | ❌ | ❌ | ✅ |
| **Equipe** | ❌ | ❌ | ✅ |
| **QR Code** | ❌ | ❌ | ✅ |
| **Temas disponíveis** | Apenas lite/acai | restaurante, hamburgueria, pizzaria | Todos |
| **Admin tabs** | Pratos, Categorias, Config | Pratos, Categorias, Galeria, Config, Sobre | Tudo |

### Posicionamento Visual dos 4 Temas

| Tema | Público | Estilo |
|---|---|---|
| `restaurant-lite` | Pensão, self-service, comida caseira | Popular, acolhedor, cores quentes simples |
| `burger-lite` | Lanchonete de bairro, trailer de hambúrguer | Casual sem o dark premium dos atuais |
| `pizza-lite` | Pizzaria de bairro, tele-entrega local | Cardápio funcional, sem branding sofisticado |
| `acai` | Açaízeiro, bowls, sorveteria | Vibrante/tropical — roxo + verde limão, vibe verão |

### Decisões Técnicas

- **Backend:** `PLAN=starter` como nova opção. Armazenado em `SiteConfig.site_plan`
- **Seeds:** 4 novos seed files (`SEED_TYPE=restaurant-lite|burger-lite|pizza-lite|acai`)
- **JS compartilhado:** `themes/_shared/js/` para os 4 temas lite (temas premium mantêm JS próprio)
- **`select-theme.js`:** Atualizado para copiar JS do `_shared/` quando tema for `*-lite` ou `acai`
- **Design:** Feito via workflow `/ui-ux-pro-max` em fase separada

---

## 🏗️ Fases de Execução

---

### FASE 1 — Backend: Lógica do Plano Starter
**Agente:** `backend-specialist`
**Dependências:** Nenhuma

#### Task 1.1 — Adicionar `starter` ao tipo de plano
- **Arquivo:** `server/src/middlewares/plan.ts`
- **Ação:** Alterar `PlanType` para `'starter' | 'essential' | 'professional'`
- **Verificação:** `getCurrentPlan()` retorna `'starter'` quando `site_plan='starter'`

#### Task 1.2 — Atualizar rota `/api/plan/`
- **Arquivo:** `server/src/routes/plan.ts`
- **Ação:** Adicionar features do Starter no response:
  ```json
  {
    "plan": "starter",
    "isProfessional": false,
    "isStarter": true,
    "features": {
      "customLogo": false,
      "brandColor": false,
      "teamSection": false,
      "qrCode": false,
      "favicon": false,
      "gallery": false,
      "aboutPage": false,
      "maxDishes": 30,
      "maxCategories": 5
    }
  }
  ```
- **Verificação:** `GET /api/plan` retorna dados corretos para cada plano

#### Task 1.3 — Enforce limite de pratos (30 max)
- **Arquivo:** `server/src/routes/dishes.ts`
- **Ação:** No `POST /`, antes de criar, contar pratos existentes. Se `plan === 'starter'` e count >= 30, retornar `403` com mensagem
- **Verificação:** Criar 30 pratos OK, prato 31 retorna erro

#### Task 1.4 — Enforce limite de categorias (5 max)
- **Arquivo:** `server/src/routes/categories.ts`
- **Ação:** No `POST /`, antes de criar, contar categorias existentes. Se `plan === 'starter'` e count >= 5, retornar `403` com mensagem
- **Verificação:** Criar 5 categorias OK, categoria 6 retorna erro

#### Task 1.5 — Ocultar Gallery e About no config (Starter)
- **Arquivo:** `server/src/routes/config.ts`
- **Ação:** Se `plan === 'starter'`, ocultar keys relacionadas a gallery/about no GET público
- **Arquivo:** `server/src/routes/aboutContent.ts`
- **Ação:** Se `plan === 'starter'`, retornar `403` em qualquer operação
- **Arquivo:** `server/src/routes/gallery.ts`
- **Ação:** Se `plan === 'starter'`, retornar `403` nas rotas admin de gallery
- **Verificação:** Rotas gallery/about bloqueadas para starter

#### Task 1.6 — Atualizar seed principal
- **Arquivo:** `server/prisma/seed.ts`
- **Ação:** Adicionar `'starter'` à validação de `PLAN` + adicionar `SEED_TYPE` entries para `restaurant-lite`, `burger-lite`, `pizza-lite`, `acai`
- **Verificação:** `PLAN=starter SEED_TYPE=acai npx prisma db seed` executa sem erro

---

### FASE 2 — Seeds dos 4 Novos Temas
**Agente:** `backend-specialist`
**Dependências:** Fase 1.6

#### Task 2.1 — Seed `restaurant-lite`
- **Arquivo:** `server/prisma/seed-restaurant-lite.ts`
- **Categorias (5):** Pratos do Dia, Marmitex, Porções, Bebidas, Sobremesas
- **Pratos (~15):** PF Completo, Marmitex P/M/G, Feijoada, Strogonoff, Bife Acebolado, Frango Grelhado, Arroz/Feijão/Farofa, Refrigerante, Suco Natural, Água, Pudim, Gelatina, etc.
- **Config:** Nome genérico, horário de almoço, endereço placeholder
- **Admin:** `admin@restaurante.com` / `admin123`

#### Task 2.2 — Seed `burger-lite`
- **Arquivo:** `server/prisma/seed-burger-lite.ts`
- **Categorias (4):** Hambúrgueres, Lanches, Bebidas, Porções
- **Pratos (~12):** X-Salada, X-Bacon, X-Tudo, Misto Quente, Hot Dog, Batata Frita, Refrigerante, Suco, Milk Shake, etc.
- **Config:** Nome genérico de lanchonete, horário noturno
- **Admin:** `admin@lanchonete.com` / `admin123`

#### Task 2.3 — Seed `pizza-lite`
- **Arquivo:** `server/prisma/seed-pizza-lite.ts`
- **Categorias (5):** Pizzas Salgadas, Pizzas Doces, Bebidas, Porções, Promoções
- **Pratos (~15):** Calabresa, Mussarela, Portuguesa, Frango, 4 Queijos, Chocolate, Romeu e Julieta, Refrigerante 2L, Guaraná, Borda Recheada, etc.
- **Config:** Nome genérico de pizzaria, horário noturno
- **Admin:** `admin@pizzaria.com` / `admin123`

#### Task 2.4 — Seed `acai`
- **Arquivo:** `server/prisma/seed-acai.ts`
- **Categorias (5):** Açaí no Copo, Bowls, Complementos, Bebidas, Sorvetes
- **Pratos (~15):** Açaí 300ml/500ml/700ml, Bowl Tropical, Bowl Fitness, Granola, Leite Ninho, Paçoca, Banana, Morango, Suco de Laranja, Água de Coco, Sorvete 1 Bola, etc.
- **Config:** Nome genérico de açaízeiro, horário integral
- **Admin:** `admin@acai.com` / `admin123`

---

### FASE 3 — Infra de Temas: JS Compartilhado e Pastas
**Agente:** `devops-engineer` / `backend-specialist`
**Dependências:** Nenhuma (paralela à Fase 1)

#### Task 3.1 — Criar `themes/_shared/js/`
- **Ação:** Copiar o conteúdo de `themes/restaurante/js/` para `themes/_shared/js/`
- **Verificação:** Comparar com diff que todos os JS dos 3 temas existentes são idênticos. Se não forem, usar a versão mais recente.

#### Task 3.2 — Criar estrutura dos 4 temas
- **Ação:** Criar pastas vazias (placeholder) para:
  ```
  themes/restaurant-lite/
  themes/burger-lite/
  themes/pizza-lite/
  themes/acai/
  ```
  Cada uma com: `input.css` (placeholder), `index.html`, `menu.html`, `contact.html`, `admin.html` (todos placeholder com comentário `<!-- TODO: /ui-ux-pro-max -->`)
- **Verificação:** Pastas existem, `select-theme.js` lista todos os temas

#### Task 3.3 — Atualizar `scripts/select-theme.js`
- **Ação:** Após copiar o tema, se o tema for `*-lite` ou `acai`:
  1. Copiar `themes/_shared/js/` → `public/js/`
  2. Pular cópia do `js/` do tema (pois não existe)
- **Lógica:** Detectar se é lite/acai e usar `_shared/js/` como fonte de JS
- **Verificação:** `THEME=restaurant-lite node scripts/select-theme.js` copia HTML do tema + JS do `_shared/`

---

### FASE 4 — Design System + UI (workflow `/ui-ux-pro-max`)
**Agente:** N/A — executado manualmente pelo usuário com a workflow
**Dependências:** Fase 3.2 (pastas criadas)

> ⚠️ **Esta fase é executada SEPARADAMENTE pelo usuário usando `/ui-ux-pro-max`.**
> Cada tema é desenhado individualmente com a workflow.

#### Task 4.1 — Design System `restaurant-lite`
- Estilo: Popular, acolhedor, cores quentes
- Público: Pensão, self-service, comida caseira
- Páginas: index + menu + contact + admin

#### Task 4.2 — Design System `burger-lite`
- Estilo: Casual de bairro, sem dark premium
- Público: Lanchonete, trailer de hambúrguer
- Páginas: index + menu + contact + admin

#### Task 4.3 — Design System `pizza-lite`
- Estilo: Funcional, cardápio de tele-entrega
- Público: Pizzaria de bairro
- Páginas: index + menu + contact + admin

#### Task 4.4 — Design System `acai`
- Estilo: Vibrante/tropical, roxo + verde limão, vibe verão
- Público: Açaízeiro, bowls
- Páginas: index + menu + contact + admin

---

### FASE 5 — Templates HTML (pós-design)
**Agente:** `frontend-specialist`
**Dependências:** Fase 4 (design system aprovado)

#### Task 5.1–5.4 — Implementar HTML/CSS por tema
- Para cada tema (`restaurant-lite`, `burger-lite`, `pizza-lite`, `acai`):
  - `index.html` — Hero + pratos destaque + categorias + WhatsApp CTA + footer
  - `menu.html` — Cardápio com filtro de categorias + carrinho + WhatsApp
  - `contact.html` — Formulário + WhatsApp + telefone + endereço + Google Maps + horários
  - `admin.html` — Painel sem tabs Gallery e Sobre/Equipe
  - `input.css` — Tailwind v4 com tokens do design system do tema
  - `favicon.svg` — Ícone do tema
- **Todas as páginas devem consumir os mesmos endpoints de API**
- **Admin deve respeitar limites do Starter (30 pratos, 5 categorias)**
- **Verificação:** `THEME=acai node scripts/select-theme.js` gera site funcional

---

### FASE 6 — QA e Verificação Final
**Agente:** `test-engineer` + `backend-specialist`
**Dependências:** Todas anteriores

#### Task 6.1 — Testar limites do plano Starter
- Criar 30 pratos → sucesso
- Criar prato 31 → `403` com mensagem clara
- Criar 5 categorias → sucesso
- Criar categoria 6 → `403` com mensagem clara
- Tentar acessar `/api/gallery/` admin → `403`
- Tentar acessar `/api/about-content/` admin → `403`

#### Task 6.2 — Testar seeds dos 4 temas
- `PLAN=starter SEED_TYPE=restaurant-lite npx prisma db seed` → OK
- `PLAN=starter SEED_TYPE=burger-lite npx prisma db seed` → OK
- `PLAN=starter SEED_TYPE=pizza-lite npx prisma db seed` → OK
- `PLAN=starter SEED_TYPE=acai npx prisma db seed` → OK
- Verificar que dados seedados respeitam limites (≤30 pratos, ≤5 categorias)

#### Task 6.3 — Testar select-theme para cada tema lite
- `THEME=restaurant-lite node scripts/select-theme.js` → copia HTML + JS do `_shared/`
- `THEME=burger-lite node scripts/select-theme.js` → idem
- `THEME=pizza-lite node scripts/select-theme.js` → idem
- `THEME=acai node scripts/select-theme.js` → idem
- Temas premium (`THEME=restaurante`) → continua funcionando normalmente

#### Task 6.4 — Testar admin sem tabs proibidas
- Login no admin de cada tema lite → tabs Gallery e Sobre NÃO aparecem
- Todas as outras funcionalidades admin funcionam normalmente
- Limites aparecem de forma clara na UI (ex: "5/5 categorias usadas")

---

## 📊 Ordem de Execução Recomendada

```
Fase 1 (Backend) ─────────────┐
                               ├──→ Fase 2 (Seeds) ──→ Fase 6 (QA)
Fase 3 (Infra/Scripts) ───────┘         ↑
                                        │
Fase 4 (Design — /ui-ux-pro-max) ──→ Fase 5 (HTML)
```

- **Fases 1 e 3** podem rodar em paralelo
- **Fase 2** depende de 1.6
- **Fase 4** depende de 3.2 (pastas criadas)
- **Fase 5** depende de 4 (design aprovado)
- **Fase 6** depende de todas

---

## ⚠️ Edge Cases & Observações

1. **Admin tabs** — as abas Gallery e Sobre/Equipe devem ser **ocultadas via JS** no admin.html dos temas lite (checando `/api/plan/` response)
2. **Limite de imagens** — com 30 pratos, Cloudinary free tier aguenta. Não precisa limitar upload por prato
3. **Seeds realistas** — pratos e preços devem ser realistas para o público-alvo de cada tema
4. **select-theme.js** — deve listar `_shared` como pasta interna, não como tema disponível
5. **Pricing page** — landing page de vendas precisa incluir o Starter Plan (escopo separado, fora deste plano)
6. **Privacy page** — removida do Starter, mas se necessário por LGPD pode ser adicionada depois como link no footer
7. **Upgrade path** — mensagens de limite (403) devem sugerir upgrade para Essencial

---

## 📦 Arquivos Impactados (Resumo)

### Backend (Fase 1)
| Arquivo | Tipo de mudança |
|---|---|
| `server/src/middlewares/plan.ts` | Alterar — adicionar `starter` ao PlanType |
| `server/src/routes/plan.ts` | Alterar — novos campos no response |
| `server/src/routes/dishes.ts` | Alterar — enforce limite 30 pratos |
| `server/src/routes/categories.ts` | Alterar — enforce limite 5 categorias |
| `server/src/routes/config.ts` | Alterar — ocultar keys para starter |
| `server/src/routes/aboutContent.ts` | Alterar — bloquear para starter |
| `server/src/routes/gallery.ts` | Alterar — bloquear admin routes para starter |

### Seeds (Fase 2)
| Arquivo | Tipo de mudança |
|---|---|
| `server/prisma/seed.ts` | Alterar — adicionar starter + 4 seed types |
| `server/prisma/seed-restaurant-lite.ts` | **Criar** |
| `server/prisma/seed-burger-lite.ts` | **Criar** |
| `server/prisma/seed-pizza-lite.ts` | **Criar** |
| `server/prisma/seed-acai.ts` | **Criar** |

### Infra/Scripts (Fase 3)
| Arquivo | Tipo de mudança |
|---|---|
| `themes/_shared/js/*.js` | **Criar** — copiar de themes/restaurante/js/ |
| `themes/restaurant-lite/` | **Criar** — estrutura placeholder |
| `themes/burger-lite/` | **Criar** — estrutura placeholder |
| `themes/pizza-lite/` | **Criar** — estrutura placeholder |
| `themes/acai/` | **Criar** — estrutura placeholder |
| `scripts/select-theme.js` | Alterar — suporte a _shared/js/ |

### Templates (Fases 4-5)
| Arquivo | Tipo de mudança |
|---|---|
| `themes/{cada-tema-lite}/*.html` | **Criar** — via /ui-ux-pro-max |
| `themes/{cada-tema-lite}/input.css` | **Criar** — via /ui-ux-pro-max |
| `design-system/{cada-tema-lite}/` | **Criar** — via /ui-ux-pro-max |
