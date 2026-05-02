# 🚀 PLAN — Landing Page de Vendas (CardápioExpress)

> **Tipo:** Planejamento Estrutural + Backend
> **UI:** Placeholder — será refeita com Stitch futuramente
> **Projeto:** Repositório SEPARADO do Landpage principal
> **Data:** 2026-03-14

---

## 📋 Índice

1. [Contexto do Negócio](#-contexto-do-negócio)
2. [Produto que Está Sendo Vendido](#-produto-que-está-sendo-vendido)
3. [Planos & Precificação](#-planos--precificação)
4. [Fluxo Completo do Cliente](#-fluxo-completo-do-cliente)
5. [Arquitetura Técnica](#-arquitetura-técnica)
6. [Stack & Justificativas](#-stack--justificativas)
7. [Schema do Banco de Dados (Supabase)](#-schema-do-banco-de-dados-supabase)
8. [Páginas & Rotas](#-páginas--rotas)
9. [Formulário de Pedido](#-formulário-de-pedido)
10. [Área de Demonstração](#-área-de-demonstração)
11. [Integração WhatsApp](#-integração-whatsapp)
12. [Painel Admin (Dono)](#-painel-admin-dono)
13. [Integrações](#-integrações)
14. [Variáveis de Ambiente](#-variáveis-de-ambiente)
15. [Checklist de Implementação](#-checklist-de-implementação)
16. [Regras & Restrições](#-regras--restrições)

---

## 📌 Contexto do Negócio

### O que é
Uma **landing page de vendas** para comercializar sites profissionais prontos para estabelecimentos gastronômicos. O dono do SaaS (você) vende sites que incluem:
- Site completo com cardápio digital
- Painel administrativo para o cliente gerenciar produtos, horários, redes sociais etc.
- Hospedagem e manutenção técnica

### O que NÃO é
- **NÃO é um builder** — o cliente não monta o próprio site
- **NÃO é self-service** — o deploy é manual, feito pelo dono após receber o pagamento
- **NÃO é o mesmo projeto** que o repositório `Landpage` — é um repo/projeto separado

### Modelo de Negócio
- **Venda direta**: cliente vê a landing page, preenche formulário, é redirecionado ao WhatsApp
- **Pagamento**: via PIX (fora da plataforma, direto no WhatsApp)
- **Entrega**: dono faz deploy manual na VPS (Hostinger + Coolify), devolve login/senha ao cliente
- **Recorrência**: cliente paga mensalidade para manutenção e hospedagem

### Tipos de Estabelecimento Atendidos
Existem **3 temas** prontos no repositório principal (`Landpage`):

| # | Tema | Descrição |
|---|------|-----------|
| 1 | **Restaurante** | Layout clássico, elegante, para restaurantes tradicionais |
| 2 | **Hamburgueria** | Layout mais bold/moderno, para hamburguerias |
| 3 | **Pizzaria** | Layout temático para pizzarias |

O cliente escolhe qual tema quer no formulário.

---

## 🎯 Produto que Está Sendo Vendido

O site que o cliente RECEBE após o pagamento inclui (tudo do repositório `Landpage`):

### Todo Cliente Recebe
- Site completo (HTML + Tailwind + Vanilla JS)
- Cardápio digital ilimitado
- Painel administrativo completo (gerencia produtos, categorias, galeria, horários, redes sociais, endereço)
- Botão direto para WhatsApp
- Página Sobre e Contato
- Backend com Express + TypeScript + Prisma + PostgreSQL (Neon)
- Hospedagem via Coolify na VPS Hostinger
- Suporte básico

### Arquitetura de Deploy (contexto para entender)
Cada cliente = 1 deploy separado no Coolify com:
- Container Docker do backend (`Landpage/server/`)
- Frontend estático injetado pelo tema escolhido (`Landpage/themes/{tema}/`)
- Banco de dados PostgreSQL dedicado no Neon
- Variáveis de ambiente únicas (JWT_SECRET, DATABASE_URL, CORS_ORIGINS etc.)
- Subdomínio: `nomedocliente.cardapioexpress.com.br` (ou domínio próprio do cliente)

---

## 💰 Planos & Precificação

### 🟢 Plano Essencial — R$700 + R$100/mês

| Item | Incluído |
|------|----------|
| Site completo e profissional | ✅ |
| Cardápio digital ilimitado | ✅ |
| Painel administrativo | ✅ |
| Botão WhatsApp | ✅ |
| Página Sobre e Contato | ✅ |
| Hospedagem e manutenção | ✅ |
| Suporte básico | ✅ |
| Subdomínio `cliente.cardapioexpress.com.br` | ✅ |
| Configuração de domínio próprio (se tiver) | ✅ (sem custo adicional) |

### 🔵 Plano Profissional — R$900 + R$150/mês

| Item | Incluído |
|------|----------|
| **Tudo do Essencial** | ✅ |
| Personalização de cores da marca | ✅ |
| Criação ou ajuste de logo | ✅ |
| Upload de logo no formulário | ✅ |
| Seção de equipe (opcional) | ✅ |
| QR Code do cardápio | ✅ |
| Ajustes visuais personalizados | ✅ |

---

## 🔄 Fluxo Completo do Cliente

```
┌─────────────────────────────────────────────────────────────────┐
│                    JORNADA DO CLIENTE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. DESCOBERTA                                                  │
│     └─ Cliente encontra a landing page                          │
│                                                                 │
│  2. EXPLORAÇÃO                                                  │
│     └─ Vê os temas disponíveis na Área de Demonstração          │
│     └─ Clica nos links de preview (Vercel) e navega nos sites   │
│     └─ Entende os planos e preços                               │
│                                                                 │
│  3. DECISÃO                                                     │
│     └─ Preenche o formulário de pedido com:                     │
│        • Nome do restaurante                                    │
│        • Tipo (Pizzaria / Hamburgueria / Restaurante)           │
│        • Plano (Essencial / Profissional)                       │
│        • WhatsApp de contato                                    │
│        • Logo (upload, apenas Plano Profissional)               │
│                                                                 │
│  4. CONTATO                                                     │
│     └─ Redirecionado ao WhatsApp do DONO com mensagem           │
│        pré-formatada contendo todos os dados do formulário      │
│                                                                 │
│  5. PAGAMENTO                                                   │
│     └─ Cliente envia PIX via WhatsApp (fora da plataforma)      │
│                                                                 │
│  6. ENTREGA (feita pelo DONO)                                   │
│     └─ Dono faz deploy manual no Coolify/VPS                    │
│     └─ Configura subdomínio (ou domínio do cliente)             │
│     └─ Devolve login + senha do painel admin ao cliente         │
│                                                                 │
│  7. PÓS-VENDA                                                   │
│     └─ Cliente gerencia tudo sozinho pelo painel admin           │
│     └─ Suporte técnico conforme o plano                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗 Arquitetura Técnica

### Visão Geral

```
┌──────────────────────────────────────────────────────┐
│                    LANDING PAGE                       │
│              (Este projeto - repo novo)               │
├──────────────────────────────────────────────────────┤
│                                                      │
│   Next.js 15 (App Router)                            │
│   ├── / ........................ Home (Hero + CTA)   │
│   ├── /planos ................. Planos + Preços      │
│   ├── /demonstracao ........... Preview dos temas    │
│   ├── /pedido ................. Formulário de pedido  │
│   ├── /admin .................. Painel do dono        │
│   │   ├── /admin/leads ........ Lista de leads       │
│   │   └── /admin/clientes ..... Clientes ativos      │
│   └── /api                                           │
│       ├── /api/leads .......... CRUD leads           │
│       └── /api/upload ......... Upload de logo       │
│                                                      │
│   Supabase                                           │
│   ├── Auth (login do dono)                           │
│   ├── Database (leads + clientes)                    │
│   └── Storage (logos enviados)                       │
│                                                      │
│   Integrações                                        │
│   ├── WhatsApp API (redirect com mensagem)           │
│   ├── Google Analytics 4                             │
│   └── Vercel (deploy da landing + hosting demos)     │
│                                                      │
└──────────────────────────────────────────────────────┘
          │
          │ (Links de preview)
          ▼
┌──────────────────────────────────────────────────────┐
│             DEMOS NO VERCEL (já existem)              │
├──────────────────────────────────────────────────────┤
│   https://demo-restaurante.vercel.app                │
│   https://demo-hamburgueria.vercel.app               │
│   https://demo-pizzaria.vercel.app                   │
└──────────────────────────────────────────────────────┘
          │
          │ (Após pagamento, deploy manual)
          ▼
┌──────────────────────────────────────────────────────┐
│          DEPLOY DO CLIENTE (repo Landpage)            │
├──────────────────────────────────────────────────────┤
│   Hostinger VPS + Coolify                            │
│   ├── Container Docker por cliente                   │
│   ├── Neon PostgreSQL (DB dedicado)                  │
│   └── cliente.cardapioexpress.com.br                 │
└──────────────────────────────────────────────────────┘
```

### Separação de Responsabilidades

| Componente | Repositório | Responsabilidade |
|------------|-------------|------------------|
| Landing page de vendas | **ESTE projeto (novo)** | Vender, coletar leads, redirecionar WhatsApp |
| Sites dos clientes | **Landpage (existente)** | Template SaaS, backend, painel admin dos clientes |
| Demos de preview | **Landpage (deploys no Vercel)** | Mostrar ao potencial cliente como o site fica |

---

## 🛠 Stack & Justificativas

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Framework** | Next.js 15 (App Router) | Preparado para Stitch no futuro, SSR para SEO, API Routes nativas |
| **Styling** | Tailwind CSS v4 | Consistência com o projeto Landpage, rápido para UI placeholder |
| **Linguagem** | TypeScript | Type safety, melhor DX |
| **Banco de Dados** | Supabase (PostgreSQL) | Auth + DB + Storage em um só serviço, grátis para começar |
| **Auth** | Supabase Auth | Login do dono para o painel admin, sem complexidade extra |
| **Storage** | Supabase Storage | Upload de logos dos clientes (Plano Profissional) |
| **Analytics** | Google Analytics 4 | Tracking de visitas e conversões |
| **Deploy** | Vercel | Free tier suficiente, domínio custom fácil, preview deploys |
| **WhatsApp** | API `wa.me` (redirect) | Sem custo, sem servidor, link direto com mensagem pré-formatada |

### Por que NÃO Stripe/pagamento online?
O pagamento é via PIX, feito diretamente no WhatsApp. Não há necessidade de gateway de pagamento neste momento. O fluxo é: formulário → WhatsApp → PIX → deploy manual.

---

## 🗄 Schema do Banco de Dados (Supabase)

### Tabela: `leads`
Armazena todos os formulários preenchidos (antes de virarem clientes).

```sql
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Dados do estabelecimento
  restaurant_name TEXT NOT NULL,
  restaurant_type TEXT NOT NULL CHECK (restaurant_type IN ('pizzaria', 'hamburgueria', 'restaurante')),
  
  -- Dados de contato
  whatsapp TEXT NOT NULL,           -- Telefone WhatsApp do cliente
  
  -- Plano escolhido
  plan TEXT NOT NULL CHECK (plan IN ('essencial', 'profissional')),
  
  -- Logo (apenas plano profissional)
  logo_url TEXT,                     -- URL do Supabase Storage
  
  -- Status do lead
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'pago', 'deployed', 'cancelado')),
  
  -- Metadados
  notes TEXT,                        -- Notas do dono sobre o lead
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para consultas frequentes
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
```

### Tabela: `clients`
Armazena clientes que já pagaram e tiveram o site deployed.

```sql
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),               -- Referência ao lead original
  
  -- Dados do site
  restaurant_name TEXT NOT NULL,
  restaurant_type TEXT NOT NULL CHECK (restaurant_type IN ('pizzaria', 'hamburgueria', 'restaurante')),
  plan TEXT NOT NULL CHECK (plan IN ('essencial', 'profissional')),
  
  -- Deploy info
  subdomain TEXT NOT NULL UNIQUE,                    -- ex: "saborearte" (= saborearte.cardapioexpress.com.br)
  custom_domain TEXT,                                -- ex: "www.saborearte.com.br" (se o cliente tiver)
  deploy_url TEXT,                                   -- URL final do site
  coolify_app_id TEXT,                               -- ID no Coolify para referência
  
  -- Credenciais (enviadas ao cliente)
  admin_email TEXT NOT NULL,                         -- Email de login do painel admin do cliente
  
  -- Status
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'cancelado')),
  
  -- Financeiro
  monthly_fee DECIMAL(10,2) NOT NULL,                -- Mensalidade (100.00 ou 150.00)
  setup_fee DECIMAL(10,2) NOT NULL,                  -- Taxa de setup (700.00 ou 900.00)
  paid_until DATE,                                   -- Até quando a mensalidade está paga
  
  -- Metadados
  whatsapp TEXT NOT NULL,
  notes TEXT,
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_subdomain ON clients(subdomain);
```

### Row Level Security (RLS)
```sql
-- Apenas o dono (autenticado via Supabase Auth) pode acessar
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policy: apenas usuários autenticados podem ler/escrever
CREATE POLICY "Authenticated users can manage leads"
  ON leads FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage clients"
  ON clients FOR ALL
  USING (auth.role() = 'authenticated');

-- EXCEÇÃO: inserção de leads é pública (formulário do site)
CREATE POLICY "Anyone can insert leads"
  ON leads FOR INSERT
  WITH CHECK (true);
```

### Supabase Storage Bucket
```
Bucket: "logos"
- Público: NÃO (apenas o dono acessa)
- Limite de arquivo: 5MB
- Tipos permitidos: image/png, image/jpeg, image/webp, image/svg+xml
```

---

## 📄 Páginas & Rotas

### Páginas Públicas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Home | Hero section, proposta de valor, CTA principal, resumo dos planos |
| `/planos` | Planos | Detalhes dos 2 planos com preços, comparativo, CTA para formulário |
| `/demonstracao` | Demonstração | 3 cards com preview dos temas (links para demos no Vercel) |
| `/pedido` | Formulário | Formulário de pedido completo (dados + redirect WhatsApp) |

### Páginas Admin (protegidas por auth)

| Rota | Página | Descrição |
|------|--------|-----------|
| `/admin` | Dashboard | Visão geral: total leads, clientes ativos, receita mensal |
| `/admin/login` | Login | Login via Supabase Auth (email + senha) |
| `/admin/leads` | Leads | Lista de leads com filtros por status, opção de converter para cliente |
| `/admin/clientes` | Clientes | Lista de clientes deployados, status, links, datas |
| `/admin/clientes/novo` | Novo Cliente | Formulário para registrar um deploy realizado (converte lead → cliente) |

### API Routes (Next.js)

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/api/leads` | Criar lead (formulário público) | ❌ Pública |
| `GET` | `/api/leads` | Listar leads | ✅ Auth |
| `PATCH` | `/api/leads/[id]` | Atualizar status/notas do lead | ✅ Auth |
| `DELETE` | `/api/leads/[id]` | Deletar lead | ✅ Auth |
| `POST` | `/api/leads/[id]/convert` | Converter lead em cliente | ✅ Auth |
| `GET` | `/api/clients` | Listar clientes | ✅ Auth |
| `POST` | `/api/clients` | Criar cliente (pós-deploy) | ✅ Auth |
| `PATCH` | `/api/clients/[id]` | Atualizar dados do cliente | ✅ Auth |
| `POST` | `/api/upload` | Upload de logo (Supabase Storage) | ❌ Pública (rate limited) |

---

## 📝 Formulário de Pedido

### Campos

| Campo | Tipo | Obrigatório | Condição | Validação |
|-------|------|-------------|----------|-----------|
| Nome do Restaurante | `text` | ✅ | Sempre | min 2 chars, max 100 |
| Tipo | `select` | ✅ | Sempre | `pizzaria` \| `hamburgueria` \| `restaurante` |
| Plano | `radio/select` | ✅ | Sempre | `essencial` \| `profissional` |
| WhatsApp | `tel` | ✅ | Sempre | Formato brasileiro, min 10 dígitos |
| Logo | `file upload` | ❌ | Só aparece se Plano = Profissional | PNG/JPG/WebP/SVG, max 5MB |

### Comportamento do Formulário

1. Cliente preenche todos os campos
2. Validação client-side (Zod + React Hook Form)
3. `POST /api/leads` — salva no Supabase
4. Upload do logo (se houver) via `POST /api/upload` → retorna URL → salva no lead
5. **Redirect automático** para WhatsApp com mensagem pré-formatada
6. Página de confirmação: "Seu pedido foi enviado! Verifique o WhatsApp."

### Validação Server-Side (Zod Schema)

```typescript
import { z } from 'zod';

export const leadSchema = z.object({
  restaurant_name: z.string().min(2).max(100),
  restaurant_type: z.enum(['pizzaria', 'hamburgueria', 'restaurante']),
  plan: z.enum(['essencial', 'profissional']),
  whatsapp: z.string().regex(/^\d{10,11}$/),
  logo_url: z.string().url().optional(),
});
```

---

## 🖼 Área de Demonstração

### Conceito
Uma página com **3 cards** — um para cada tema disponível. Cada card tem:
- Nome do tema (Restaurante / Hamburgueria / Pizzaria)
- Screenshot ou imagem de preview
- Breve descrição
- **Botão "Ver Demonstração"** → abre o link do Vercel em nova aba

### Links de Demo (configuráveis via env vars)

```env
NEXT_PUBLIC_DEMO_RESTAURANTE=https://demo-restaurante.vercel.app
NEXT_PUBLIC_DEMO_HAMBURGUERIA=https://demo-hamburgueria.vercel.app
NEXT_PUBLIC_DEMO_PIZZARIA=https://demo-pizzaria.vercel.app
```

> **NOTA:** Estes deploys no Vercel são feitos a partir do repositório `Landpage` com o tema correspondente. Já devem existir ou precisam ser criados antes de lançar a landing page.

### Funcionalidade
- O potencial cliente pode **navegar livremente** no site demo (cardápio, galeria, contato, tudo)
- Isso serve como **prova social** e demonstração real do produto
- Cada demo é um deploy completo e funcional (com dados de seed fictícios)

---

## 📱 Integração WhatsApp

### Mecanismo
Usa a API pública `wa.me` para abrir uma conversa no WhatsApp com uma mensagem pré-formatada. **Não requer API paga nem servidor adicional.**

### URL de Redirect

```typescript
function buildWhatsAppURL(data: LeadFormData): string {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_OWNER; // Sem +, sem espaços. Ex: 5511999999999
  
  const planLabel = data.plan === 'essencial' ? '🟢 Essencial' : '🔵 Profissional';
  const typeLabel = {
    pizzaria: '🍕 Pizzaria',
    hamburgueria: '🍔 Hamburgueria',
    restaurante: '🍽️ Restaurante',
  }[data.restaurant_type];
  
  const message = [
    `🚀 *Novo Pedido — CardápioExpress*`,
    ``,
    `📋 *Dados do Pedido:*`,
    `• Estabelecimento: ${data.restaurant_name}`,
    `• Tipo: ${typeLabel}`,
    `• Plano: ${planLabel}`,
    `• WhatsApp: ${data.whatsapp}`,
    ``,
    `💰 *Investimento:*`,
    data.plan === 'essencial' 
      ? `• Setup: R$700 + R$100/mês`
      : `• Setup: R$900 + R$150/mês`,
    ``,
    `Olá! Preenchi o formulário no site e tenho interesse em contratar o plano ${planLabel} para meu estabelecimento.`,
  ].join('\n');
  
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
```

### Fluxo
1. Formulário submit → Salva lead no Supabase → Redireciona para `wa.me` URL
2. WhatsApp abre com a mensagem pré-formatada
3. O cliente envia a mensagem (pode editar se quiser)
4. Dono recebe no WhatsApp pessoal e segue o processo de pagamento via PIX

---

## 🔐 Painel Admin (Dono)

### Acesso
- Rota: `/admin`
- Auth: Supabase Auth (email + senha)
- **Apenas 1 usuário** (o dono) — não precisa de sistema de roles
- Protegido por middleware do Next.js (`middleware.ts`)

### Dashboard (`/admin`)

Métricas exibidas:
- Total de leads (por status)
- Total de clientes ativos
- Receita mensal estimada (soma das mensalidades dos clientes ativos)
- Leads recentes (últimos 5)

### Gestão de Leads (`/admin/leads`)

| Funcionalidade | Descrição |
|---------------|-----------|
| Listar | Tabela com todos os leads, ordenados por data |
| Filtrar | Por status: `novo`, `contatado`, `pago`, `deployed`, `cancelado` |
| Atualizar status | Dropdown para mudar status (ex: novo → contatado → pago) |
| Notas | Campo de texto para anotar informações |
| Ver detalhes | Modal/drawer com todos os dados + logo (se existir) |
| Converter → Cliente | Botão que abre formulário para registrar o deploy |

### Gestão de Clientes (`/admin/clientes`)

| Funcionalidade | Descrição |
|---------------|-----------|
| Listar | Tabela com todos os clientes ativos |
| Filtrar | Por status: `ativo`, `suspenso`, `cancelado` |
| Ver site | Link direto para o site do cliente |
| Editar | Atualizar subdomínio, domínio, notas, status |
| Financeiro | Ver `paid_until`, mensalidade, setup pago |

### Converter Lead → Cliente (`/admin/clientes/novo`)

Formulário preenchido pelo dono APÓS fazer o deploy:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Lead de origem | `select` | Seleciona o lead (auto-preenche dados) |
| Subdomínio | `text` | Ex: "saborearte" (vira saborearte.cardapioexpress.com.br) |
| Domínio custom | `text` (opcional) | Se o cliente tem domínio próprio |
| URL do deploy | `text` | URL final do site |
| Coolify App ID | `text` | ID de referência no Coolify |
| Email admin | `text` | Email de login do painel admin do CLIENTE |
| Setup pago | `number` | Valor do setup (700 ou 900) |
| Mensalidade | `number` | Valor mensal (100 ou 150) |
| Pago até | `date` | Data até quando está pago |

---

## 🔗 Integrações

### 1. Google Analytics 4

```typescript
// app/layout.tsx — Script tag no <head>
// Usar NEXT_PUBLIC_GA_ID
```

Eventos customizados a rastrear:
- `form_start` — Quando o cliente começa a preencher o formulário
- `form_submit` — Quando submete com sucesso
- `plan_view` — Quando abre a página de planos
- `demo_click` — Quando clica em "Ver Demonstração" (qual tema)
- `whatsapp_redirect` — Quando é redirecionado ao WhatsApp

### 2. WhatsApp (wa.me)
Descrito na seção [Integração WhatsApp](#-integração-whatsapp).

### 3. Supabase
- **Auth**: Login do dono
- **Database**: Leads + Clientes
- **Storage**: Upload de logos

### 4. Vercel (Deploy)
- Landing page hospedada no Vercel
- Demos dos temas também no Vercel (deploys separados do repo `Landpage`)

---

## 🔐 Variáveis de Ambiente

### Públicas (NEXT_PUBLIC_*)

```env
# WhatsApp do dono (com código do país, sem +)
NEXT_PUBLIC_WHATSAPP_OWNER=5511999999999

# URLs das demos no Vercel
NEXT_PUBLIC_DEMO_RESTAURANTE=https://demo-restaurante.vercel.app
NEXT_PUBLIC_DEMO_HAMBURGUERIA=https://demo-hamburgueria.vercel.app
NEXT_PUBLIC_DEMO_PIZZARIA=https://demo-pizzaria.vercel.app

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Privadas (Server-Side Only)

```env
# Supabase (server-side para admin operations)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## ✅ Checklist de Implementação

### Fase 0 — Setup do Projeto
- [ ] Criar novo repositório (ex: `cardapioexpress-landing`)
- [ ] `npx create-next-app@latest` com App Router + TypeScript + Tailwind
- [ ] Instalar dependências: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `react-hook-form`, `@hookform/resolvers`
- [ ] Configurar Supabase project (criar no dashboard)
- [ ] Criar tabelas `leads` e `clients` no Supabase (SQL acima)
- [ ] Configurar RLS policies
- [ ] Criar bucket `logos` no Supabase Storage
- [ ] Configurar variáveis de ambiente (`.env.local`)
- [ ] Criar usuário admin no Supabase Auth (email + senha do dono)

### Fase 1 — Backend (API Routes)
- [ ] `POST /api/leads` — Criar lead (validação Zod, público, rate limited)
- [ ] `POST /api/upload` — Upload de logo para Supabase Storage (público, rate limited, validação de tipo/tamanho)
- [ ] `GET /api/leads` — Listar leads (auth required)
- [ ] `PATCH /api/leads/[id]` — Atualizar lead (auth required)
- [ ] `DELETE /api/leads/[id]` — Deletar lead (auth required)
- [ ] `POST /api/leads/[id]/convert` — Converter lead → cliente (auth required)
- [ ] `GET /api/clients` — Listar clientes (auth required)
- [ ] `POST /api/clients` — Criar cliente (auth required)
- [ ] `PATCH /api/clients/[id]` — Atualizar cliente (auth required)
- [ ] Middleware de autenticação (Supabase Auth check)
- [ ] Rate limiting no `POST /api/leads` e `POST /api/upload`

### Fase 2 — Páginas Públicas (UI Placeholder)
- [ ] Layout base (`app/layout.tsx`) — Header + Footer mínimos
- [ ] `/` (Home) — Hero + proposta de valor + CTA
- [ ] `/planos` — Cards com os 2 planos
- [ ] `/demonstracao` — 3 cards com links para demos Vercel
- [ ] `/pedido` — Formulário completo com validação
- [ ] Lógica de redirect WhatsApp pós-submit
- [ ] Página de confirmação pós-submit

### Fase 3 — Painel Admin
- [ ] `/admin/login` — Tela de login com Supabase Auth
- [ ] Middleware de proteção de rotas `/admin/*`
- [ ] `/admin` — Dashboard com métricas
- [ ] `/admin/leads` — Tabela de leads com filtros + ações
- [ ] `/admin/clientes` — Tabela de clientes
- [ ] `/admin/clientes/novo` — Formulário de conversão lead → cliente
- [ ] Componente de atualização de status (dropdown)
- [ ] Notas editáveis por lead/cliente

### Fase 4 — Integrações
- [ ] Google Analytics 4 (script tag + eventos customizados)
- [ ] Eventos de tracking (form_start, form_submit, demo_click, etc.)
- [ ] Deploy no Vercel
- [ ] Configurar domínio `cardapioexpress.com.br` (se já tiver)
- [ ] Criar os 3 deploys de demo no Vercel (se ainda não existem)

### Fase 5 — Refinamento (pré-Stitch)
- [ ] Testes básicos das API routes
- [ ] Validar fluxo completo: formulário → lead salvo → WhatsApp redirect
- [ ] Validar painel admin: listar leads → converter → registrar cliente
- [ ] Rate limiting em rotas públicas
- [ ] Meta tags básicas de SEO (title, description, OG)
- [ ] Favicon e meta tags mínimas

---

## ⚠️ Regras & Restrições

### UI
- **A UI é PLACEHOLDER** — foco é estrutura funcional, não estética
- Usar Tailwind apenas para layout básico e legibilidade
- **NÃO investir tempo** em animações, efeitos, design elaborado
- A UI será completamente refeita com **Stitch** em uma fase futura

### Segurança
- Rate limiting em todas as rotas públicas (`POST /api/leads`, `POST /api/upload`)
- Validação server-side com Zod em todas as API routes (nunca confiar no client)
- RLS ativado no Supabase para todas as tabelas
- Upload de logo: validar tipo MIME + tamanho máximo (5MB)
- Sanitizar antes de inserir no WhatsApp URL (prevenir injection)

### Arquitetura
- **NUNCA misturar** com o repositório `Landpage` — são projetos completamente independentes
- A landing page **não tem acesso** aos bancos/servidores dos clientes
- A landing page **não faz deploy** — isso é feito manualmente pelo dono
- O painel admin é para o **dono** gerenciar leads/clientes, NÃO é para os clientes

### Dados
- Dados mínimos no formulário — o cliente configura o resto via painel admin do PRÓPRIO site
- Não armazenar senhas de clientes na landing page (apenas email de referência)
- Logo é armazenado no Supabase Storage, não localmente

---

## 📐 Estrutura de Pastas Esperada

```
cardapioexpress-landing/
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── app/
│   ├── layout.tsx                          # Layout global (header, footer, GA)
│   ├── page.tsx                            # Home
│   ├── planos/
│   │   └── page.tsx                        # Página de planos
│   ├── demonstracao/
│   │   └── page.tsx                        # Área de demonstração
│   ├── pedido/
│   │   ├── page.tsx                        # Formulário de pedido
│   │   └── confirmacao/
│   │       └── page.tsx                    # Pós-submit
│   ├── admin/
│   │   ├── layout.tsx                      # Layout admin (auth guard)
│   │   ├── page.tsx                        # Dashboard
│   │   ├── login/
│   │   │   └── page.tsx                    # Login
│   │   ├── leads/
│   │   │   └── page.tsx                    # Lista de leads
│   │   └── clientes/
│   │       ├── page.tsx                    # Lista de clientes
│   │       └── novo/
│   │           └── page.tsx                # Converter lead → cliente
│   └── api/
│       ├── leads/
│       │   ├── route.ts                    # GET (auth), POST (public)
│       │   └── [id]/
│       │       ├── route.ts                # PATCH, DELETE (auth)
│       │       └── convert/
│       │           └── route.ts            # POST (auth)
│       ├── clients/
│       │   ├── route.ts                    # GET, POST (auth)
│       │   └── [id]/
│       │       └── route.ts                # PATCH (auth)
│       └── upload/
│           └── route.ts                    # POST (public, rate limited)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       # Supabase browser client
│   │   ├── server.ts                       # Supabase server client (SSR)
│   │   └── admin.ts                        # Supabase service role client
│   ├── validations/
│   │   ├── lead.ts                         # Zod schema para leads
│   │   └── client.ts                       # Zod schema para clients
│   ├── whatsapp.ts                         # Função buildWhatsAppURL
│   └── analytics.ts                        # Helpers de GA events
│
├── components/
│   ├── ui/                                 # Componentes UI base (placeholder)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   └── Card.tsx
│   ├── forms/
│   │   └── LeadForm.tsx                    # Formulário de pedido
│   ├── admin/
│   │   ├── LeadTable.tsx                   # Tabela de leads
│   │   ├── ClientTable.tsx                 # Tabela de clientes
│   │   ├── StatusBadge.tsx                 # Badge de status
│   │   └── DashboardCards.tsx              # Cards do dashboard
│   └── sections/
│       ├── Hero.tsx                        # Hero da home
│       ├── PlanCards.tsx                    # Cards de planos
│       └── DemoCards.tsx                    # Cards de demonstração
│
├── middleware.ts                            # Auth guard para /admin/*
│
└── types/
    └── database.ts                         # Types gerados do Supabase
```

---

## 🔮 Fase Futura (NÃO implementar agora)

Estas funcionalidades ficam para quando a UI for refeita com Stitch:
- Design elaborado (animações, parallax, efeitos visuais)
- Depoimentos/testimonials de clientes
- Blog/conteúdo
- Chatbot/chat ao vivo
- Comparador de planos interativo
- Calculadora de ROI
- Onboarding automatizado pós-pagamento
- Sistema de pagamento integrado (Stripe)
- Notificações automáticas (email/SMS)

---

> **IMPORTANTE:** Este documento é o plano de referência. Ao iniciar a implementação, siga o checklist na ordem (Fase 0 → 1 → 2 → 3 → 4 → 5). A UI é propositalmente simples — o valor está na estrutura e no backend funcional.
