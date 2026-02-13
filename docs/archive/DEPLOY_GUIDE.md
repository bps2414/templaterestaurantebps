# 🚀 Guia Completo de Deploy - Template Restaurante SaaS

**Versão:** 2.0  
**Data:** Fevereiro 2026  
**Status:** ✅ PRODUCTION READY - Security Score 9.0/10

---

## 📋 Índice

1. [Visão Geral](#1-visão-geral)
2. [Pré-requisitos](#2-pré-requisitos)
3. [Configuração do Banco de Dados (Neon)](#3-configuração-do-banco-de-dados-neon)
4. [Configuração do Cloudinary](#4-configuração-do-cloudinary)
5. [Deploy no Render.com](#5-deploy-no-rendercom)
6. [Primeiro Acesso e Configuração](#6-primeiro-acesso-e-configuração)
7. [Personalização para Cliente](#7-personalização-para-cliente)
8. [Sistema de Planos](#8-sistema-de-planos)
9. [Troubleshooting](#9-troubleshooting)
10. [Manutenção e Backups](#10-manutenção-e-backups)
11. [Custos Mensais](#11-custos-mensais)
12. [Checklist Final](#12-checklist-final)

---

## 1. Visão Geral

Este template é um sistema SaaS completo para restaurantes com:

- **Frontend:** HTML5 + Tailwind CSS + Vanilla JS (sem dependências)
- **Backend:** Node.js + Express + TypeScript + Prisma ORM
- **Banco:** PostgreSQL (Neon serverless)
- **Upload:** Cloudinary (CDN global)
- **Deploy:** Render.com (auto-deploy via GitHub)

### Arquitetura de Segurança

- ✅ JWT com refresh token rotation (tokenVersion)
- ✅ CSRF protection (double-submit cookie)
- ✅ Rate limiting (3 camadas: login, upload, API)
- ✅ Triple upload validation (MIME + extension + magic bytes)
- ✅ XSS sanitization em todos os inputs
- ✅ Helmet CSP configurado
- ✅ Bcrypt 12 rounds + salt
- ✅ Session limit (5 dispositivos por usuário)

### Sistema de Planos

**Essential (Básico):**
- Config geral (nome, logo, cores, horários, contato)
- Galeria de imagens
- Cardápio completo
- QR Code para WhatsApp

**Professional (Profissional):**
- Tudo do Essential +
- Seção "Sobre" customizável
- Team members (foto, nome, cargo, descrição)
- Layouts alternativos (template-b, template-c)

---

## 2. Pré-requisitos

### Contas Necessárias

1. **GitHub** (gratuito) - Para versionamento e auto-deploy
2. **Neon** (Free tier) - Banco PostgreSQL serverless
3. **Cloudinary** (Free tier) - Upload e CDN de imagens
4. **Render** (Free tier disponível) - Hospedagem do backend

### Ferramentas Locais

- **Node.js 18+** ([Download](https://nodejs.org))
- **Git** ([Download](https://git-scm.com))
- **VSCode** (recomendado) ou editor de código

### Limites dos Planos Gratuitos

| Serviço | Limite Gratuito | Limite Recomendado para Produção |
|---------|----------------|----------------------------------|
| **Neon** | 0.5GB storage, 1 projeto | 3GB storage ($19/mês) |
| **Cloudinary** | 25GB bandwidth/mês, 25 créditos | 75GB bandwidth ($99/mês) |
| **Render** | 750h/mês (1 serviço ativo) | $7-25/mês por serviço |

---

## 3. Configuração do Banco de Dados (Neon)

### 3.1. Criar Conta e Projeto

1. Acesse [console.neon.tech](https://console.neon.tech)
2. Faça login com GitHub
3. Clique em **"Create a project"**
4. Configure:
   - **Name:** `restaurante-[nome-cliente]`
   - **Region:** `US East (Ohio)` (menor latência Brasil)
   - **Postgres version:** 16 (recomendado)
5. Clique **"Create project"**

### 3.2. Obter Connection String

1. No dashboard do projeto, vá em **"Connection Details"**
2. Copie a **"Connection string"** que se parece com:

```
postgresql://user:password@ep-name.us-east-2.aws.neon.tech/dbname?sslmode=require
```

3. **IMPORTANTE:** Salve essa string em local seguro (será usada como `DATABASE_URL`)

### 3.3. Configurar Pooling (Recomendado)

Para melhor performance em serverless:

1. Em "Connection Details", ative **"Pooled connection"**
2. Copie a connection string com pooling:

```
postgresql://user:password@ep-name-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require
```

3. Use essa URL em `DATABASE_URL` no Render

### 3.4. Primeiro Deploy do Schema

No terminal, dentro da pasta `server/`:

```bash
# Instalar dependências
npm install

# Criar arquivo .env local (temporário para deploy)
cp .env.example .env

# Editar .env e adicionar a DATABASE_URL do Neon
# DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Rodar migrations
npx prisma migrate deploy

# Criar admin inicial (senha padrão: Mudar@123)
npx prisma db seed
```

**Output esperado:**
```
✅ Admin criado: admin@example.com / Mudar@123
✅ SiteConfig inicializado (plano: essential)
✅ 3 categorias criadas
✅ 6 pratos de exemplo criados
```

---

## 4. Configuração do Cloudinary

### 4.1. Criar Conta

1. Acesse [cloudinary.com](https://cloudinary.com/users/register/free)
2. Registre-se (pode usar conta Google)
3. Confirme o email

### 4.2. Obter Credenciais

1. No dashboard, clique em **"Settings"** (ícone de engrenagem)
2. Vá em **"API Keys"**
3. Anote (ou copie para um arquivo):
   - **Cloud Name:** `dxxxxxxx`
   - **API Key:** `123456789012345`
   - **API Secret:** `AbCdEfGhIjKlMnOpQrStUvWxYz`

### 4.3. Configurar Pasta de Upload (Opcional)

1. Em "Settings" → "Upload"
2. Em **"Upload presets"**, crie um preset:
   - Name: `restaurante`
   - Folder: `restaurante-uploads`
   - Cropping: `server`
   - Access: `public`

### 4.4. Limites do Free Tier

- **25 créditos de transformação/mês** (suficiente para ~500 uploads com resize)
- **25GB de bandwidth** (suficiente para ~50k visualizações/mês)
- **10GB de storage**

**Dica:** Para economizar créditos, evite transformações complexas. Use `f_auto,q_auto` apenas.

---

## 5. Deploy no Render.com

### 5.1. Conectar GitHub

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Faça login com GitHub
3. Autorize o Render a acessar seus repositórios
4. Clique em **"New +"** → **"Web Service"**

### 5.2. Configurar Web Service

**Connect a repository:**
- Selecione o repositório `templaterestaurantebps` (ou seu fork)
- Clique **"Connect"**

**Configurações Básicas:**
- **Name:** `restaurante-[cliente]-api`
- **Region:** `Oregon (US West)` (free tier disponível)
- **Branch:** `main` (ou `template-b` para layout alternativo)
- **Root Directory:** `server`
- **Runtime:** `Node`
- **Build Command:** `npm install && npx prisma generate && npm run build`
- **Start Command:** `npm start`

**Instance Type:**
- Para teste: **Free** (0.1 CPU, 512MB RAM, sleep após 15min inatividade)
- Para produção: **Starter** ($7/mês, 0.5 CPU, 512MB RAM, sempre ativo)

### 5.3. Variáveis de Ambiente

Clique em **"Advanced"** e adicione as seguintes **Environment Variables**:

| Key | Value | Exemplo |
|-----|-------|---------|
| `NODE_ENV` | `production` | `production` |
| `PORT` | `3000` | `3000` |
| `DATABASE_URL` | Cole a URL do Neon | `postgresql://user:pass@...` |
| `JWT_SECRET` | Gere um segredo forte | `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Gere outro segredo diferente | `openssl rand -base64 32` |
| `CLOUDINARY_CLOUD_NAME` | Cloud Name do Cloudinary | `dxxxxxxx` |
| `CLOUDINARY_API_KEY` | API Key do Cloudinary | `123456789012345` |
| `CLOUDINARY_API_SECRET` | API Secret do Cloudinary | `AbCdEf...` |
| `CORS_ORIGIN` | URL do frontend (adicionar depois) | `https://site-cliente.com` |

**Como gerar JWT secrets:**

```bash
# No terminal (Linux/Mac/WSL):
openssl rand -base64 32

# No PowerShell (Windows):
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### 5.4. Deploy Automático

1. Clique **"Create Web Service"**
2. Aguarde o build (~3-5 minutos)
3. Quando aparecer **"Live"**, anote a URL:
   - Exemplo: `https://restaurante-cliente-api.onrender.com`

### 5.5. Testar API

No navegador, acesse:
```
https://seu-servico.onrender.com/healthz
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-12T12:34:56.789Z"
}
```

---

## 6. Primeiro Acesso e Configuração

### 6.1. Configurar CORS no Backend

**IMPORTANTE:** Após conhecer a URL do frontend, adicione em variáveis de ambiente do Render:

```
CORS_ORIGIN=https://site-cliente.com,https://www.site-cliente.com
```

Ou configure wildcard (apenas para desenvolvimento):
```
CORS_ORIGIN=*
```

**Redeploy:** Render fará redeploy automático ao alterar env vars.

### 6.2. Configurar Frontend

Edite `public/js/app.js` (linha ~2):

```javascript
const API = 'https://restaurante-cliente-api.onrender.com';
```

**Branches disponíveis:**
- `main` → Layout padrão (elegante, minimalista)
- `template-b` → Layout alternativo 1 (moderno, cards)
- `template-c` → Layout alternativo 2 (clássico, tradicional)

### 6.3. Deploy do Frontend

**Opção 1: GitHub Pages (Gratuito)**

1. No repositório GitHub, vá em **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / Folder: `/public`
4. URL: `https://seu-usuario.github.io/nome-repo`

**Opção 2: Vercel (Gratuito, mais rápido)**

1. Acesse [vercel.com](https://vercel.com)
2. Importe o repositório do GitHub
3. Configure:
   - Framework Preset: **Other**
   - Root Directory: `public`
   - Build Command: *(deixe vazio)*
4. Deploy → URL: `https://nome-projeto.vercel.app`

**Opção 3: Render Static Site (Gratuito)**

1. Render Dashboard → **New +** → **Static Site**
2. Conecte o repositório
3. Build Command: *(vazio)*
4. Publish Directory: `public`
5. URL: `https://nome-projeto.onrender.com`

### 6.4. Primeiro Login no Admin

1. Acesse `https://seu-frontend.com/admin.html`
2. Login:
   - **Email:** `admin@example.com`
   - **Senha:** `Mudar@123`

**Primeiro passo OBRIGATÓRIO:**
1. Clique no botão **"Alterar Senha"**
2. Digite a senha atual: `Mudar@123`
3. Digite nova senha forte (min. 8 caracteres)
4. Confirme a nova senha

### 6.5. Configuração Inicial (Tab "Config")

Preencha os dados do restaurante:

**Informações Básicas:**
- **Nome do Restaurante:** "Sabor & Arte"
- **Slogan:** "Gastronomia que encanta os sentidos"
- **Descrição:** Breve texto sobre o restaurante

**Logo:**
- Upload de imagem (PNG/JPG, max 2MB)
- Recomendado: 200x200px, fundo transparente

**Cores (Hex):**
- Primary Color: `#3D6B3D` (verde floresta)
- Secondary Color: `#D4A843` (dourado)
- Background Color: `#FFFDF7` (creme)

**Horários de Funcionamento:**
- Segunda a Sexta: "11:00 - 22:00"
- Sábado e Domingo: "12:00 - 23:00"
- Fechado: "Segundas-feiras"

**Contato:**
- Telefone: `(11) 98765-4321`
- Email: `contato@saborarte.com.br`
- WhatsApp: `5511987654321` (código país + DDD + número)
- Endereço: "Rua das Flores, 123 - Vila Gourmet, SP"

**Redes Sociais:**
- Instagram: URL completa (`https://instagram.com/saborarte`)
- Facebook: URL completa
- (deixe em branco se não usar)

**QR Code WhatsApp:**
- URL: `https://wa.me/5511987654321?text=Olá!%20Gostaria%20de%20fazer%20uma%20reserva`
- Aparecerá automaticamente na página de contato

Clique **"Salvar Configurações"**

---

## 7. Personalização para Cliente

### 7.1. Configurar Categorias (Tab "Categorias")

1. Clique **"Nova Categoria"**
2. Preencha:
   - **Nome:** "Entradas"
   - **Ordem:** 1 (número menor aparece primeiro)
3. Repita para:
   - "Pratos Principais" (ordem 2)
   - "Sobremesas" (ordem 3)
   - "Bebidas" (ordem 4)

### 7.2. Adicionar Pratos (Tab "Pratos")

1. Clique **"Novo Prato"**
2. Preencha:
   - **Nome:** "Bruschetta Caprese"
   - **Descrição:** "Pão italiano com tomate fresco, mussarela de búfala e manjericão"
   - **Preço:** `32.90` (em reais, com centavos)
   - **Categoria:** Selecione "Entradas"
   - **Imagem:** Upload (PNG/JPG, max 2MB, recomendado 800x600px)
   - **Destaque:** ✅ (aparece na home como "Prato do Chef")
   - **Ativo:** ✅ (aparece no cardápio)
3. Clique **"Salvar"**

**Dica:** Adicione ao menos 6 pratos para que a página inicial fique visualmente balanceada.

### 7.3. Adicionar Galeria (Tab "Galeria")

1. Clique **"Nova Imagem"**
2. Upload de foto (PNG/JPG, max 2MB)
3. Alt text: "Interior do restaurante Sabor & Arte"
4. Repita para 8-12 imagens (mix de: pratos, ambiente, equipe, detalhes)

### 7.4. Configurar "Sobre" (Apenas Plano Professional)

Se o cliente tiver plano professional, configure:

**Título da Seção:**
- "Nossa História"

**Texto Sobre:**
- História do restaurante (2-3 parágrafos)
- Valores, missão, filosofia

**Imagem de Destaque:**
- Foto do chef ou do ambiente (landscape, 1200x800px)

**Team Members (até 4):**

Para cada membro:
1. Upload de foto (quadrada, 400x400px)
2. **Nome:** "João Silva"
3. **Cargo:** "Chef Executivo"
4. **Descrição:** "Formado pelo Le Cordon Bleu, com passagens por restaurantes estrelados na França"

**Salvar:** Clique no botão de salvar da seção About.

---

## 8. Sistema de Planos

### 8.1. Verificar Plano Atual

```bash
# SSH no servidor Render (ou localmente com DATABASE_URL)
cd server/
npm run change-plan
```

**Output:**
```
Current plan: essential
```

### 8.2. Trocar de Plano (SQL Manual)

**Via psql (Neon Console):**

1. Neon Console → SQL Editor
2. Execute:

```sql
-- Verificar plano atual
SELECT key, value FROM "SiteConfig" WHERE key = 'site_plan';

-- Trocar para Professional
UPDATE "SiteConfig" SET value = 'professional' WHERE key = 'site_plan';

-- Trocar para Essential
UPDATE "SiteConfig" SET value = 'essential' WHERE key = 'site_plan';
```

### 8.3. Trocar de Plano (Script Node.js)

**Localmente ou via Render Shell:**

```bash
cd server/

# Trocar para essential
npm run change-plan essential

# Trocar para professional
npm run change-plan professional
```

**Output:**
```
✅ Plan updated to: professional
```

### 8.4. Diferenças Entre Planos

| Feature | Essential | Professional |
|---------|-----------|--------------|
| **Config Geral** | ✅ | ✅ |
| **Cardápio** | ✅ | ✅ |
| **Galeria** | ✅ | ✅ |
| **QR Code WhatsApp** | ✅ | ✅ |
| **Seção "Sobre"** | ❌ | ✅ |
| **Team Members** | ❌ | ✅ (até 4) |
| **Templates Alternativos** | ❌ | ✅ (B e C) |

**Preço Sugerido:**
- Essential: R$ 97/mês
- Professional: R$ 197/mês

---

## 9. Troubleshooting

### 9.1. "Error: P1000 - Authentication failed" (Neon)

**Causa:** Connection string incorreta ou IP bloqueado.

**Solução:**
1. Verifique a `DATABASE_URL` no Render (env vars)
2. Certifique-se de incluir `?sslmode=require` no final
3. No Neon Console → Settings → "IP Allow", adicione `0.0.0.0/0` (allow all)

### 9.2. "CORS Error" no Frontend

**Causa:** Backend não autoriza requisições do frontend.

**Solução:**
1. Render Dashboard → Web Service → Environment
2. Adicione/edite `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://seu-frontend.com
   ```
3. Se múltiplos domínios:
   ```
   CORS_ORIGIN=https://site.com,https://www.site.com
   ```
4. Aguarde redeploy automático (~2min)

### 9.3. Upload de Imagem Retorna 413 (Payload Too Large)

**Causa:** Imagem maior que 2MB.

**Solução:**
1. Comprima a imagem com [TinyPNG](https://tinypng.com)
2. Ou edite `server/src/routes/upload.ts` linha ~15:
   ```typescript
   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
   ```

### 9.4. Render Service "Sleeping" (Free Tier)

**Causa:** No free tier, serviços dormem após 15min de inatividade.

**Sintomas:**
- Primeiro request demora ~30s (cold start)
- Requests subsequentes são rápidos

**Soluções:**
1. **Upgrade para Starter ($7/mês):** Serviço sempre ativo
2. **Usar cron job externo:**
   - [UptimeRobot](https://uptimerobot.com) (gratuito)
   - Ping a cada 5min: `https://seu-servico.onrender.com/healthz`

### 9.5. "Invalid CSRF Token"

**Causa:** CSRF token expirou ou cookies desabilitados.

**Solução:**
1. Limpe cookies do site (Ctrl+Shift+Del)
2. Faça logout e login novamente
3. Verifique se browser permite cookies third-party

### 9.6. Syntax Error no Admin (linha 1772)

**Causa:** Auto-formatter do VSCode adicionou espaços em template literal.

**Solução:**
1. Já corrigido no commit `81f2e3c`
2. Se recorrer, desabilite o formatter:
   - Criado `.prettierignore` excluindo HTML
   - Criado `.vscode/settings.json` com `formatOnSave: false` para HTML

### 9.7. Prisma Deploy Falha "Schema drift detected"

**Causa:** Banco local diferente do schema em `prisma/schema.prisma`.

**Solução:**
```bash
cd server/
npx prisma migrate reset --force  # ⚠️ APAGA DADOS
npx prisma migrate deploy
npx prisma db seed
```

**Ou (preservando dados):**
```bash
npx prisma db push
```

---

## 10. Manutenção e Backups

### 10.1. Backup Manual do Banco

**Neon Console:**
1. Neon → Project → Branches
2. Crie uma branch: `backup-[data]`
3. A branch é um snapshot completo (instantâneo)

**Ou via script Node:**

```bash
cd server/
npm run backup
```

**Output:** Cria `server/backups/backup-[timestamp].json`

**Restaurar backup:**
1. Copie o JSON para variável
2. Execute queries SQL manualmente no Neon Console

### 10.2. Backup Automático (Recomendado)

**Neon Built-in:**
- Free tier: 7 dias de history (point-in-time recovery)
- Pro tier: 30 dias de history

**Para agendar backups regulares:**

1. Render Dashboard → Cron Jobs (se disponível)
2. Ou use GitHub Actions:

```yaml
# .github/workflows/backup.yml
name: Weekly Backup
on:
  schedule:
    - cron: '0 2 * * 0'  # Domingos às 2am UTC

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run backup
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      - uses: actions/upload-artifact@v3
        with:
          name: backup-${{ github.run_number }}
          path: server/backups/*.json
```

### 10.3. Monitoramento

**Uptime:**
- [UptimeRobot](https://uptimerobot.com) - Monitor HTTP (gratuito)
- Endpoint: `https://seu-servico.onrender.com/healthz`
- Intervalo: 5 minutos
- Alerta: Email quando status != 200

**Logs:**
- Render Dashboard → Logs (últimas 7 dias)
- Para logs persistentes: integrar com [Logtail](https://logtail.com) ou [Papertrail](https://papertrailapp.com)

**Performance:**
- Render Dashboard → Metrics (CPU, RAM, requests)

### 10.4. Atualizações de Segurança

**Mensal (recomendado):**

```bash
cd server/
npm outdated                 # Listar updates disponíveis
npm update                   # Atualizar patches
npm audit fix                # Aplicar fixes de segurança
git add package*.json
git commit -m "chore: update dependencies"
git push  # Deploy automático no Render
```

---

## 11. Custos Mensais

### 11.1. Stack Free Tier (Teste/MVP)

| Serviço | Plano | Custo | Limites |
|---------|-------|-------|---------|
| **Neon** | Free | R$ 0 | 0.5GB, 1 projeto, compute 191h/mês |
| **Cloudinary** | Free | R$ 0 | 25GB bandwidth, 10GB storage |
| **Render** | Free | R$ 0 | 750h/mês, sleep após 15min |
| **GitHub Pages** | Free | R$ 0 | 1GB storage, 100GB bandwidth |
| **Total** | - | **R$ 0/mês** | ⚠️ Limitações: cold starts, quotas |

**Ideal para:** Portfólio, testes, MVP com tráfego baixo (~500 visitas/mês).

### 11.2. Stack Produção (Pequeno/Médio)

| Serviço | Plano | Custo (USD → BRL) | Limites |
|---------|-------|-------------------|---------|
| **Neon** | Pro | $19/mês (~R$95) | 3GB storage, 200h compute/mês |
| **Cloudinary** | Plus | $99/mês (~R$495) | 75GB bandwidth, 50GB storage |
| **Render** | Starter | $7/mês (~R$35) | Sempre ativo, 0.5CPU, 512MB RAM |
| **Domínio** | .com.br | R$ 40/ano (~R$3/mês) | Registro.br |
| **Total** | - | **~R$ 628/mês** | Suporta ~5k visitas/mês |

**Ideal para:** Restaurante pequeno com delivery, reservas online.

### 11.3. Stack Produção (Alto Tráfego)

| Serviço | Plano | Custo (USD → BRL) |
|---------|-------|-------------------|
| **Neon** | Pro | $19-69/mês (~R$95-345) |
| **Cloudinary** | Advanced | $224/mês (~R$1120) |
| **Render** | Standard | $25/mês (~R$125) |
| **Total** | - | **~R$ 1340-1590/mês** |

**Ideal para:** Rede com múltiplas unidades, alto volume de imagens.

### 11.4. Otimização de Custos

**Cloudinary (maior custo):**
1. Ative auto-format (`f_auto`) e auto-quality (`q_auto`)
2. Limite uploads de alta resolução (resize no upload)
3. Use lazy loading em imagens (já implementado)

**Neon:**
1. Use connection pooling (Prisma já configurado)
2. Ative auto-suspend (já ativo no free tier)

**Render:**
1. Use CDN para servir static assets (Vercel/Cloudflare)
2. Configure cache headers (já implementado)

---

## 12. Checklist Final

### ✅ Pré-Deploy

- [ ] Node.js 18+ instalado localmente
- [ ] Git configurado com SSH ou HTTPS
- [ ] Repositório clonado e dependências instaladas (`npm install`)
- [ ] TypeScript compila sem erros (`npx tsc --noEmit`)
- [ ] Testes locais passando (se houver)

### ✅ Banco de Dados

- [ ] Conta Neon criada e projeto configurado
- [ ] Connection string copiada e salva
- [ ] Migrations executadas (`npx prisma migrate deploy`)
- [ ] Seed executado (`npx prisma db seed`)
- [ ] Admin inicial criado (email: admin@example.com)

### ✅ Cloudinary

- [ ] Conta criada e verificada
- [ ] Cloud Name, API Key e API Secret copiados
- [ ] Upload preset configurado (opcional)

### ✅ Backend (Render)

- [ ] Web Service criado e conectado ao GitHub
- [ ] Branch correta selecionada (`main` ou `template-b`)
- [ ] Build command configurado corretamente
- [ ] Todas as variáveis de ambiente adicionadas:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL` (Neon)
  - [ ] `JWT_SECRET` (gerado com openssl)
  - [ ] `JWT_REFRESH_SECRET` (diferente do JWT_SECRET)
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
  - [ ] `CORS_ORIGIN` (URL do frontend)
- [ ] Deploy bem-sucedido (status "Live")
- [ ] Endpoint `/healthz` retornando 200 OK

### ✅ Frontend

- [ ] `API` configurado em `public/js/app.js` (URL do backend)
- [ ] Deploy do frontend (GitHub Pages/Vercel/Render)
- [ ] CORS configurado no backend para permitir frontend
- [ ] Favicon aparecendo corretamente
- [ ] Todas as páginas carregando sem erros 404

### ✅ Primeiro Acesso

- [ ] Acessou `/admin.html` com sucesso
- [ ] Login realizado (admin@example.com / Mudar@123)
- [ ] Senha alterada (OBRIGATÓRIO)
- [ ] Config geral preenchida e salva
- [ ] Logo do restaurante enviada
- [ ] Cores personalizadas aplicadas

### ✅ Conteúdo

- [ ] Pelo menos 3 categorias criadas
- [ ] Pelo menos 6 pratos adicionados
- [ ] Imagens de pratos com boa qualidade
- [ ] Galeria com 8-12 fotos
- [ ] QR Code WhatsApp funcionando
- [ ] Horários de funcionamento corretos

### ✅ Plano Professional (se aplicável)

- [ ] Plano alterado para `professional`
- [ ] Seção "Sobre" preenchida
- [ ] Team members adicionados (até 4)
- [ ] Foto de destaque da seção About enviada

### ✅ Testes Finais

- [ ] Navegação entre páginas funciona
- [ ] Cardápio exibe pratos corretamente
- [ ] Galeria abre lightbox ao clicar
- [ ] Botão WhatsApp abre com mensagem correta
- [ ] Admin consegue:
  - [ ] Criar novo prato
  - [ ] Editar prato existente
  - [ ] Excluir prato
  - [ ] Upload de imagem funciona
  - [ ] Mudar senha funciona
  - [ ] Logout funciona
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Sem erros no Console do navegador (F12)

### ✅ Segurança

- [ ] Senha do admin alterada da padrão
- [ ] `.env` NÃO está commitado no Git
- [ ] `.env.example` sem valores reais
- [ ] JWT secrets são strings aleatórias (não defaults)
- [ ] CORS restrito ao domínio do cliente (não `*`)
- [ ] HTTPS ativo (Render fornece automaticamente)

### ✅ SEO e Performance (Opcional)

- [ ] Meta tags preenchidas em todas páginas
- [ ] Open Graph tags configuradas
- [ ] Sitemap.xml gerado
- [ ] robots.txt configurado
- [ ] Google Analytics instalado (se desejado)
- [ ] Lazy loading de imagens ativo

### ✅ Monitoramento

- [ ] UptimeRobot configurado (ou similar)
- [ ] Backups automáticos agendados
- [ ] Logs sendo capturados (Render Logs)
- [ ] Cliente tem acesso ao admin
- [ ] Documentação entregue ao cliente

### ✅ Pós-Deploy

- [ ] Cliente testou e aprovou
- [ ] Domínio personalizado configurado (se houver)
- [ ] DNS apontando para Render/Vercel
- [ ] Certificado SSL ativo (automático)
- [ ] Pagamento configurado (se SaaS)

---

## 📞 Suporte

**Documentação Adicional:**
- [GUIA_COMPLETO_DEPLOY.md](./GUIA_COMPLETO_DEPLOY.md) - Detalhes técnicos
- [GUIA_VENDAS_E_CUSTOMIZACAO.md](./GUIA_VENDAS_E_CUSTOMIZACAO.md) - Pitch de vendas
- [CHECKLIST_CLIENTE.md](./CHECKLIST_CLIENTE.md) - Checklist simplificado

**Troubleshooting Avançado:**
- [final_report/final_verdict.md](./final_report/final_verdict.md) - Auditoria de segurança

**Contato:**
- GitHub Issues: [templaterestaurantebps/issues](https://github.com/bps2414/templaterestaurantebps/issues)
- Email: (adicione seu email de suporte)

---

**Versão:** 2.0  
**Última Atualização:** Fevereiro 2026  
**Status:** ✅ PRODUCTION READY  
**Security Score:** 9.0/10

**Made with ❤️ by BPS**
