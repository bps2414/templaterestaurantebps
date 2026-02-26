---
description: Automates the full deployment process for a new client (Neon + Render PaaS)
---

# Deploy de Novo Cliente — Render (Platform as a Service)

> **Pré-requisito**: Contas ativas no [Render.com](https://render.com) e no [Neon.tech](https://neon.tech).
> **Acesso:** Permissão para criar Web Services no Render e novos projetos no Neon.

---

## 0. Resumo Arquitetural

Este workflow detalha o processo de deploy na plataforma gerenciada Render:
- **Neon:** Gerencia o banco de dados serverless PostgreSQL.
- **Render:** Hospeda o frontend e backend (Node.js/Next.js) como um único "Web Service", cuidando de building, CI/CD automático, HTTPS e certificados.

---

## 1. Configurar o Banco de Dados (Neon)

Para cada novo cliente, um banco isolado deve ser criado:

1. Acesse o console do **Neon.tech**.
2. Clique em **New Project** (ou crie um novo Database dentro de um projeto existente).
3. Nomeie o projeto/banco de acordo com o cliente (ex: `lampiao-burguer-db`).
4. Copie a Connection String (Padrão e Pooled, se aplicável).

✅ **Valores Necessários:**
- `DATABASE_URL` (Sua URL em modo pooled para as queries, se houver).
- `DIRECT_URL` (Sua URL direta, geralmente a mesma ou com `?connect_timeout=0` para as migrations regulares no Prisma).

---

## 2. Preparar Variáveis Essenciais

Gere localmente ou anote as chaves e segredos que o cliente precisará na nuvem:

1. **JWT_SECRET:**
   - Gere uma chave forte. Ex: `openssl rand -base64 32` no terminal.
2. **THEME:**
   - O tema contratado pelo cliente (ex: `pizzaria`, `hamburgueria`, `restaurante`).
3. **Credenciais do Admin (Seed):**
   - O e-mail e a senha que o cliente usará no primeiro acesso. (A senha será enviada pro Render via `SEED_ADMIN_PASSWORD`).

---

## 3. Criar Web Service no Render

No Dashboard do **Render**, conecte o repositório do projeto:

1. Vá em **New** > **Web Service**.
2. Selecione o repositório do projeto Landpage/SaaS.
3. Preencha os campos básicos:
   - **Name:** Nome do cliente (ex: `cliente-pizzaria`).
   - **Region:** A mais próxima (ex: Ohio, US East).
   - **Branch:** `main` (ou a branch de produção correta).
   - **Runtime:** `Node`.
   - **Build Command:** `npm install && npm run build` (certifique-se de que script build engloba o Next.js/Front e Back).
   - **Start Command:** `npm start` (ou `node server/index.js` dependendo do seu script).
   - **Plan:** Escolha (Free tier para testes, Starter/Pro para produção).

---

## 4. Injetar Variáveis de Ambiente

Na aba **Environment** do serviço no Render, adicione as seguintes variáveis secretas e públicas:

| Key | Value (Exemplo) | Descrição |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...` | A URL Pooled do Neon |
| `DIRECT_URL` | `postgresql://...` | A URL Direta do Neon |
| `JWT_SECRET` | `sua-chave-gerada` | O hash criptográfico |
| `THEME` | `pizzaria` | Responsável por injetar as cores corretas no Build |
| `NODE_ENV` | `production` | Modo de produção do Node |
| `PORT` | `10000` | O Render impõe esta porta dinamicamente (automático) |

> ⚠️ **Dica:** O Render aceita injeção em massa com a opção "Add from .env". Você pode preparar um bloco texto e colar de uma vez.

Salvar as variáveis iniciará o processo de Build. Aguarde a mensagem **Live** no topo dos logs.

---

## 5. Seed do Banco de Dados

Com o servidor rodando e conectado ao Neon remoto localmente:

```bash
# Na sua máquina local (abra o terminal)
# Configure para apontar para o banco do seu cliente antes disso:
$env:DATABASE_URL="[A URL DIRETA DO NEON DO CLIENTE]"
$env:DIRECT_URL="[A URL DIRETA DO NEON DO CLIENTE]"
$env:SEED_ADMIN_EMAIL="[EMAIL DO CLIENTE]"
$env:SEED_ADMIN_PASSWORD="[SENHA GERADA PARA O CLIENTE]"
$env:SEED_TYPE="[TEMA EX: pizzaria]"

# Após aplicar as envs acesse o diretório /server
cd server

# Rode as migrations
npx prisma migrate deploy

# Rode o hook de Seed customizado
npx prisma db seed
```

✅ O banco estará agora populado com tabelas essenciais e a conta Master Admin do cliente.

---

## 6. Configuração de Domínio Personalizado

Na página do Web Service no Render:

1. Vá na aba **Settings**.
2. Em **Custom Domains**, adicione o domínio do cliente (ex: `pizzariaitaliana.com.br`).
3. O Render fornecerá as instruções de CNAME ou A REC para você passar para o cliente colocar na zona DNS dele (Cloudflare, Registro.br, etc).
4. O Render gerenciará e renovará automaticamente os certificados SSL.

---

## 7. Informar o Cliente 🚀

O sistema foi ao ar! Envie esta mensagem para o cliente (WhatsApp ou E-mail):

```text
🌐 URL do site:     https://[URL_DO_RENDER_OU_DOMINIO]
🔐 Painel admin:    https://[URL_DO_RENDER_OU_DOMINIO]/admin
📧 Email:           [ADMIN_EMAIL configurado no Seed]
🔑 Senha:           [SENHA configurada no Seed]
📦 Tema Ativo:      [TEMA selecionado]

⚠️ Troque sua senha no primeiro login acessando as configurações de Admin!
```
