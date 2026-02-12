# 🚀 Guia de Vendas e Customização — Template Restaurante

> **Para:** Você que vai vender templates para restaurantes  
> **Atualização:** 11/02/2026  
> **Auditoria:** Ver [UPDATE.md](UPDATE.md) para relatório completo de auditoria técnica + comercial

---

## 📋 ÍNDICE

1. [Criar Instância para Novo Cliente](#1--criar-instância-para-novo-cliente)
2. [Entregar para o Cliente](#2--entregar-para-o-cliente)
3. [Customização do Frontend](#3--customização-do-frontend)
4. [Preços Sugeridos](#4--preços-sugeridos)
5. [FAQ de Vendas](#5--faq-de-vendas)
6. [Riscos e Limitações Conhecidas](#6--riscos-e-limitações-conhecidas)
7. [Roadmap de Melhorias](#7--roadmap-de-melhorias)

---

## 1 — Criar Instância para Novo Cliente

### ⏱️ Tempo total: ~20 minutos

### Passo 1: Criar Banco de Dados (Neon) — 3 min

1. Acesse **https://neon.tech** → Login
2. **Create Project**
   - Nome: `restaurante-[nome-cliente]` (ex: `restaurante-pizzaria-napoli`)
   - Região: escolha a mais próxima do cliente (Brasil → `São Paulo` ou `US East`)
3. Após criado, vá em **Dashboard → Connection Details**
4. **Copie a Connection String** (parece com):
   ```
   postgresql://neondb_owner:ABC123...@ep-cool-name-123.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. **Guarde essa string** — você vai colar no Render no próximo passo

---

### Passo 2: Criar Web Service (Render) — 8 min

1. Acesse **https://dashboard.render.com** → Login
2. **New +** → **Web Service**
3. Conecte sua conta GitHub → selecione o repositório `templaterestaurantebps` (ou o nome do seu repo)
4. **Preencha os campos:**

   | Campo | Valor |
   |-------|-------|
   | **Name** | `restaurante-[nome-cliente]` (ex: `pizzaria-napoli`) |
   | **Region** | Mesma do Neon (ex: Ohio / US East) |
   | **Branch** | `main` |
   | **Root Directory** | `server` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm ci --include=dev && npx prisma generate && npm run build` |
   | **Start Command** | `npx prisma migrate deploy && node dist/index.js` |
   | **Plan** | **Free** (para testes) ou **Starter $7/mês** (para produção) |

5. Clique em **Create Web Service** (ainda não vai funcionar — falta configurar variáveis)

---

### Passo 3: Configurar Variáveis de Ambiente — 8 min

No serviço criado → **Environment** → **Add Environment Variable**

**Adicione TODAS essas variáveis (uma por vez):**

| Key | Value | Como gerar |
|-----|-------|------------|
| `DATABASE_URL` | `postgresql://neondb_owner:...` | Cole a string do Neon (Passo 1) |
| `JWT_SECRET` | `AbC123XyZ...` (64+ caracteres aleatórios) | No terminal: `node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"` |
| `NODE_ENV` | `production` | Fixo |
| `APP_URL` | `https://restaurante-[nome].onrender.com` | Substitua `[nome]` pelo Name do serviço |
| `CORS_ORIGINS` | `https://restaurante-[nome].onrender.com` | Mesmo valor de `APP_URL` |
| `PORT` | `3000` | Fixo |
| `CLOUDINARY_CLOUD_NAME` | `seu-cloud-name` | Ver abaixo como criar conta Cloudinary |
| `CLOUDINARY_API_KEY` | `123456789012345` | Da dashboard do Cloudinary |
| `CLOUDINARY_API_SECRET` | `abc123xyz...` | Da dashboard do Cloudinary |
| `CLOUDINARY_FOLDER_PREFIX` | `restaurante-[nome]` | Organiza uploads por site (ex: `pizzarianapoli`) |

**⚠️ IMPORTANTE:** 
- Use um **JWT_SECRET diferente** para cada cliente! Nunca reutilize.
- Use a **mesma conta Cloudinary** para todos os clientes (1 conta = todos os sites)
- Mude apenas o **CLOUDINARY_FOLDER_PREFIX** para cada cliente (organiza as pastas)

**Como criar conta Cloudinary (1x só, serve para todos os clientes):**

1. Acesse https://cloudinary.com/users/register_free
2. Crie conta gratuita (25 GB/mês grátis — serve ~10-15 sites pequenos)
3. Na dashboard, copie:
   - **Cloud Name** (ex: `dz1a2b3c4`)
   - **API Key** (ex: `123456789012345`)
   - **API Secret** (clique em "Reveal" para ver)
4. Use esses 3 valores em **TODOS os clientes** (só muda o FOLDER_PREFIX)

**Por que Cloudinary?**  
→ Render deleta arquivos no redeploy. Sem Cloudinary = **fotos dos clientes somem**.

6. Clique em **Save Changes** (Render vai começar o deploy automaticamente)

---

### Passo 4: Popular o Banco (Seed) — 4 min

Aguarde o deploy terminar (~3-5 min). Quando aparecer **"Your service is live 🎉"** nos logs:

**No seu computador (Windows PowerShell):**

```powershell
cd F:\VSCode\Landpage\server

$env:DATABASE_URL="postgresql://neondb_owner:...@...neon.tech/neondb?sslmode=require"
$env:SEED_ADMIN_EMAIL="dono@pizzarianapoli.com"
$env:SEED_ADMIN_PASSWORD="SenhaForte123!"

npx prisma db seed
```

**Substitua:**
- `DATABASE_URL`: Cole a string do Neon (Passo 1)
- `SEED_ADMIN_EMAIL`: Email do dono do restaurante
- `SEED_ADMIN_PASSWORD`: **Senha forte** (min 8 chars, maiúscula + minúscula + número)

**Saída esperada:**
```
✅ Admin: dono@pizzarianapoli.com (senha: ***)
✅ Categorias criadas
✅ 11 pratos criados
✅ Configurações do site criadas
🎉 Seed concluído com sucesso!
```

---

### Passo 5: Testar Antes de Entregar — 5 min

1. Acesse `https://restaurante-[nome].onrender.com`
   - ✅ Deve aparecer a página inicial com pratos de exemplo
2. Acesse `https://restaurante-[nome].onrender.com/admin`
   - ✅ Faça login com o email/senha do seed
   - ✅ Teste adicionar um prato novo
   - ✅ Teste upload de imagem (JPG/PNG, até 2MB)
   - ✅ Teste trocar senha (botão 🔑 na barra lateral)

**Se tudo funcionar → pode entregar para o cliente!**

---

## 2 — Entregar para o Cliente

### Email/WhatsApp de Entrega

```
Olá [Nome do Cliente]! 😊

Seu site está no ar! 🎉

🌐 Veja aqui: https://restaurante-[nome].onrender.com

---

🔐 ACESSO AO PAINEL ADMIN:

Link: https://restaurante-[nome].onrender.com/admin
Email: [email que você definiu]
Senha: [senha temporária]

⚠️ PRIMEIRO ACESSO:
Assim que entrar, clique em "🔑 Alterar Senha" (no menu lateral) e troque para uma senha só sua.

---

✅ O QUE VOCÊ PODE FAZER:

• Adicionar/remover pratos e preços
• Subir fotos dos pratos (até 2MB cada)
• Mudar telefone e WhatsApp
• Editar endereço e horários
• Ativar/desativar categorias

Tudo pelo painel, sem precisar de programador!

---

📞 PRECISA DE AJUDA?

Estou disponível por aqui mesmo. Preparei um vídeo rápido de 10 minutos mostrando como usar tudo.

Quer agendar 15 minutos comigo para eu te mostrar ao vivo?

Abraço,
[Seu Nome]
```

---

### Vídeo Tutorial (opcional, mas recomendado)

**Grave um vídeo de 10-15 minutos mostrando:**

1. Como fazer login (0-2 min)
2. Como trocar a senha (2-3 min)
3. Como adicionar um prato novo (3-6 min)
4. Como fazer upload de fotos (6-8 min)
5. Como editar informações do restaurante (8-10 min)
6. Como visualizar o site público (10-12 min)

**Ferramenta grátis:** Use o **Loom** (https://loom.com) ou grave com **OBS Studio**.

---

### Domínio Customizado (se o cliente tiver)

**Tempo:** ~15 min (propagação DNS pode levar até 1h)

1. **No Render:** serviço → **Settings → Custom Domains** → **Add Custom Domain**
2. Digite: `www.restaurantedocliente.com.br`
3. **Render mostra os registros DNS** (tipo CNAME)
4. **No provedor de domínio do cliente** (Registro.br, GoDaddy, HostGator, etc.):
   - Adicione o registro CNAME apontando para `restaurante-[nome].onrender.com`
5. **Aguarde 5-60 minutos** (propagação DNS)
6. **Render provisiona SSL automaticamente** (certificado HTTPS grátis)

**Depois de apontar o domínio, atualize as variáveis no Render:**

| Key | Novo Valor |
|-----|------------|
| `APP_URL` | `https://www.restaurantedocliente.com.br` |
| `CORS_ORIGINS` | `https://www.restaurantedocliente.com.br` |

**Não mexa nas variáveis do Cloudinary** (CLOUD_NAME, API_KEY, API_SECRET, FOLDER_PREFIX) — elas não mudam com domínio customizado.

Render vai redeploy automaticamente (~3 min).

---

## 3 — Customização do Frontend

### 3.1 — Customizações Simples (Cliente Faz no Painel Admin)

**✅ O cliente pode fazer sozinho:**

- Trocar nome do restaurante
- Alterar endereço, telefone, WhatsApp
- Adicionar/remover pratos e categorias
- Trocar fotos dos pratos
- Gerenciar galeria de fotos
- Alterar senha de acesso

**❌ Cliente NÃO consegue fazer (precisa de você):**

- Mudar cores do site
- Trocar layout/design
- Adicionar novas páginas
- Mudar logo/marca
- Integrar redes sociais personalizadas

---

### 3.2 — Customizações que Você Faz (Cobra Extra)

#### A) Mudar Cores do Site

**Arquivos:** `public/index.html`, `public/menu.html`, `public/gallery.html`, `public/about.html`, `public/contact.html`, `public/admin.html`

**Cores atuais:**
- Primária: `#d97706` (laranja)
- Secundária: `#ef4444` (vermelho)
- Fundo: `#1f2937` (cinza escuro)
- Texto: `#f3f4f6` (branco)

**Como trocar:**

1. Abra cada arquivo HTML em um editor
2. Use **Ctrl+H** (Find and Replace)
3. Substitua todas as ocorrências:

| Trocar | Por | Para |
|--------|-----|------|
| `bg-amber-600` | `bg-blue-600` | Azul |
| `bg-amber-500` | `bg-blue-500` | Azul claro |
| `text-amber-600` | `text-blue-600` | Texto azul |
| `hover:bg-amber-700` | `hover:bg-blue-700` | Hover azul |

**Cores Tailwind disponíveis:**
- `red-600` (vermelho)
- `blue-600` (azul)
- `green-600` (verde)
- `purple-600` (roxo)
- `pink-600` (rosa)
- `indigo-600` (índigo)
- `yellow-600` (amarelo)

**Preço sugerido:** R$ 50-100 por troca de cor

---

#### B) Adicionar Logo Personalizada

**Arquivo:** `public/index.html` (e outros)

**Linha atual (~30):**
```html
<div class="text-2xl font-bold text-amber-600">🍽️ Restaurante Template</div>
```

**Trocar por:**
```html
<img src="/assets/logo-cliente.png" alt="Logo" class="h-12">
```

**Passos:**
1. Cliente envia logo (PNG transparente, 200x80px recomendado)
2. Coloque em `public/assets/logo-cliente.png`
3. Substitua o código acima em todos os HTMLs
4. Commit e push

**Preço sugerido:** R$ 30-50

---

#### C) Alterar Texto do Footer

**Arquivo:** `public/index.html` (linha ~150)

```html
<p class="text-gray-400">&copy; 2024 Restaurante Template. Todos os direitos reservados.</p>
```

**Trocar por:**
```html
<p class="text-gray-400">&copy; 2026 Pizzaria Napoli. Todos os direitos reservados.</p>
```

**Preço sugerido:** Incluso no pacote (não cobre extra)

---

#### D) Adicionar Links de Redes Sociais no Footer

**Arquivo:** `public/index.html` (adicionar antes do `</footer>`)

```html
<div class="flex justify-center space-x-6 mt-6">
    <a href="https://facebook.com/pizzarianapoli" target="_blank" class="text-gray-400 hover:text-amber-600">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    </a>
    <a href="https://instagram.com/pizzarianapoli" target="_blank" class="text-gray-400 hover:text-amber-600">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
    </a>
</div>
```

**Preço sugerido:** R$ 40-60

---

#### E) Trocar Layout Completo (Trabalho Grande)

**Se o cliente quiser um design totalmente diferente:**

1. **Negocie separadamente** — isso é praticamente um novo projeto
2. **Use os mesmos endpoints da API** (não mexa no backend)
3. **Crie novos HTMLs** com o design dele
4. **Mantenha as mesmas rotas:**
   - `/` → index.html
   - `/menu` → menu.html
   - `/admin` → admin.html (esse é crítico, não mude muito)

**Preço sugerido:** R$ 500-1500 (dependendo da complexidade)

---

### 3.3 — Template com Frontend Customizado (React/Vue/Svelte)

**Se o cliente quer um frontend moderno (SPA):**

**✅ O backend funciona perfeitamente** — a API REST já está pronta.

**Passos:**

1. **Crie um novo projeto React/Vue/Svelte** fora da pasta `public/`
2. **Consuma a mesma API:**
   - `GET /api/dishes` → listar pratos
   - `GET /api/categories` → listar categorias
   - `GET /api/config` → pegar configurações (nome, telefone, etc.)
   - `POST /api/auth/login` → login admin (lembre do CSRF token!)
3. **Deploy o frontend separado:**
   - **Netlify** (grátis)
   - **Vercel** (grátis)
   - **Render Static Site** (grátis)
4. **Configure CORS no backend** para aceitar o domínio do frontend:
   ```
   CORS_ORIGINS=https://meurestaurante.netlify.app,https://restaurante-xyz.onrender.com
   ```

**Preço sugerido:** R$ 1500-5000 (projeto completo com React)

---

## 4 — Preços Sugeridos

### ⚠️ Antes de Vender — Checklist Obrigatório

Antes de fechar qualquer venda, garanta que completou a **Fase 0** do [UPDATE.md](UPDATE.md):

- [ ] Removeu todos os `console.log` de debug (csrf.ts, app.ts, upload.ts)
- [ ] Removeu campo `debug` da resposta 403 do CSRF
- [ ] Integrou Cloudinary para uploads (imagens somem sem isso!)
- [ ] Testou deploy completo com Cloudinary funcionando

### Pacotes

| Pacote | O que o Cliente Recebe | Preço Sugerido | Seu Custo | Sua Margem |
|--------|------------------------|----------------|-----------|------------|
| **🥉 Básico** | • Site completo no ar<br>• Painel admin para editar tudo<br>• Upload ilimitado de fotos<br>• Suporte por 30 dias<br>• Tutorial em vídeo | **R$ 500** | ~R$42/mês | **~R$458** |
| **🥈 Profissional** | • Tudo do Básico<br>• Seu domínio próprio (.com.br)<br>• Cores personalizadas<br>• Logo do restaurante<br>• Suporte por 90 dias | **R$ 800** | ~R$42/mês | **~R$758** |
| **🥇 Premium** | • Tudo do Profissional<br>• QR Code para mesas<br>• Otimização para Google (SEO)<br>• Treinamento 1h ao vivo<br>• Suporte por 6 meses<br>• Prioridade em atualizações | **R$ 1.400** | ~R$42/mês | **~R$1.358** |

**💡 Dica de venda:** Recomende o **Profissional** (melhor custo-benefício). Cliente com domínio próprio parece mais sério.

**\*Custo:** Render Starter $7/mês (~R$42). Cloudinary é **grátis e compartilhado** entre todos os clientes (1 conta = até 15 sites).

### Mensalidade (Recomendado)

| Plano | O que Inclui | Preço Sugerido |
|-------|--------------|----------------|
| **Manutenção Simples** | Site no ar 24/7 + backup semanal | **R$ 50-80/mês** |
| **Manutenção + Updates** | Tudo acima + você atualiza fotos/pratos pelo cliente | **R$ 100-150/mês** |
| **Suporte VIP** | Tudo acima + resposta em até 24h | **R$ 200-300/mês** |

**💰 Renda recorrente:** Com 10 clientes pagando R$ 100/mês = **R$ 1.000/mês fixo**. Seu custo: ~R$ 420/mês (Render).

### Extras (One-time)

| Extra | Preço Sugerido |
|-------|----------------|
| Troca de cores | R$ 50-100 |
| Adicionar logo | R$ 30-50 |
| Links redes sociais | R$ 40-60 |
| Traduzir para outro idioma | R$ 150-250 |
| Adicionar nova página (ex: "Eventos") | R$ 200-400 |
| Layout completamente customizado | R$ 500-1500 |
| Frontend React/Vue do zero | R$ 1500-5000 |

---

## 5 — FAQ de Vendas

### P: Quanto tempo leva para criar uma instância nova?

**R:** 20 minutos se você já tem tudo pronto (Neon, Render, GitHub). No primeiro cliente demora mais (~1h) porque você vai aprender o processo.

---

### P: Posso usar o mesmo repositório GitHub para todos os clientes?

**R:** **SIM!** Isso é o ideal. Cada cliente é uma **instância separada** (Render + Neon), mas todos usam o mesmo código do GitHub. Se você corrigir um bug ou adicionar funcionalidade, **todos os clientes recebem** no próximo deploy.

---

### P: E se um cliente quiser algo totalmente diferente?

**R:** Crie um **branch separado** ou **fork do repositório** para ele. Mas cuidado: você vai ter que manter **dois códigos diferentes**. Recomendo cobrar bem mais caro nesses casos (R$ 2000+).

---

### P: Preciso saber programar para vender?

**R:** **Não**, se você só criar instâncias e customizar cores. Mas se quiser adicionar funcionalidades novas (ex: sistema de delivery, pagamento online), aí sim precisa saber Node.js/React.

---

### P: O que acontece se eu parar de pagar o Render?

**R:** O site do cliente **sai do ar**. Por isso, recomendo cobrar mensalidade para cobrir os custos ($7/mês do Render = ~R$ 35/mês) + sua margem.

---

### P: Posso revender sem falar que eu fiz?

**R:** **Sim!** O template é seu. Você pode remover qualquer menção a "template" e colocar sua marca. O cliente não precisa saber que é um template.

---

### P: Quantos clientes posso ter?

**R:** **Ilimitados!** Cada cliente é uma instância separada (Render + Neon). Você só paga:
- **Render:** $7/mês por cliente (ou Free se for teste)
- **Neon:** $0 (Free até 0.5GB) ou $19/mês (Pro, raramente necessário)
- **Cloudinary:** $0 até ~10-15 sites (plano Free com 25GB/mês)

**Exemplo:** 10 clientes pagando R$ 100/mês cada = R$ 1000/mês  
**Custo:** 10 × $7 = $70/mês (~R$ 350) + Cloudinary $0 + seu tempo  
**Lucro líquido:** ~R$ 650/mês

**Como Cloudinary organiza 10+ sites em 1 conta?**  
Cada site tem seu `CLOUDINARY_FOLDER_PREFIX` único:
```
cloudinary.com/sua-conta/
├── restaurante-joao/dishes/
├── pizzaria-maria/dishes/
└── bar-ze/dishes/
```
Mesmas credenciais (CLOUD_NAME, API_KEY, SECRET) em todos os sites.

---

### P: Como faço backup do site do cliente?

**R:** O Neon faz backup automático no plano pago ($19/mês). Se usar o Free, você pode fazer backup manual:

```bash
# No seu PC
pg_dump "postgresql://..." -Fc -f backup-cliente-2026-02-11.dump
```

Para restaurar:
```bash
pg_restore -d "postgresql://..." backup-cliente-2026-02-11.dump
```

---

### P: Cliente quer mudar de plano Free para Starter. Como fazer?

**R:** No Render → serviço → **Settings → Plan** → selecione **Starter** → **Upgrade**. Cobra $7/mês automaticamente no cartão que você cadastrou.

---

### P: Como cobrar do cliente?

**R:** 3 opções:

1. **Pix/Transferência** (manual todo mês)
2. **Boleto recorrente** (Asaas, Vindi, Stripe)
3. **Cliente paga diretamente o Render** (você cria a conta Render dele — não recomendado porque você perde controle)

Recomendo: **Asaas** ou **Vindi** para automação de cobranças.

---

## ✅ Checklist Entrega ao Cliente

Antes de marcar como "entregue", verifique:

- [ ] Site público carrega (https://restaurante-xyz.onrender.com)
- [ ] Admin funciona (https://restaurante-xyz.onrender.com/admin)
- [ ] Login com email/senha do seed funciona
- [ ] Cliente consegue adicionar prato novo
- [ ] **Upload de imagem funciona E retorna URL do Cloudinary** (https://res.cloudinary.com/...)
- [ ] **Imagem aparece no site público** (teste abrir a URL da foto)
- [ ] **CLOUDINARY_FOLDER_PREFIX configurado** (fotos vão para pasta do cliente)
- [ ] Troca de senha funciona
- [ ] Dados do seed foram substituídos (nome, telefone, WhatsApp)
- [ ] Domínio customizado configurado (se tiver)
- [ ] Email de entrega enviado ao cliente
- [ ] Tutorial/vídeo enviado (se prometeu)
- [ ] Call de 15 min agendada para treinamento

**Teste crítico de Cloudinary:**
1. Faça upload de 1 foto pelo admin
2. Verifique que a URL começa com `https://res.cloudinary.com/seu-cloud-name/`
3. Abra a URL da foto diretamente no navegador (deve aparecer)
4. **Se não funcionar:** verifique as 4 variáveis CLOUDINARY no Render

---

## 🎯 Próximos Passos

1. **Teste você mesmo** criando uma instância de teste
2. **Documente seus próprios passos** (anote o que funcionou)
3. **Crie um vídeo** do processo (para você mesmo revisar)
4. **Venda para o primeiro cliente** (pode cobrar mais barato para praticar)
5. **Cobre mensalidade** para garantir renda recorrente

**Boa sorte nas vendas! 🚀**

---

## 6 — Riscos e Limitações Conhecidas

> ⚠️ Leia antes de vender. Saiba o que pode dar errado e como resolver.

### Riscos Técnicos

| Risco | Probabilidade | O que acontece | Como resolver |
|---|---|---|---|
| **Imagens somem no redeploy** | 🔴 100% (sem Cloudinary) | Cliente perde todas as fotos do cardápio/galeria | Integrar Cloudinary (Fase 0 — **obrigatório**) |
| **Render Free dorme** | 🔴 ALTA | Site leva 30s para abrir | Usar Render Starter ($7/mês) para clientes reais |
| **Neon Free cai** | 🟢 BAIXA | Raro, mas possível | Backup pg_dump mensal |
| **Dependências desatualizadas** | 🟡 MÉDIA a longo prazo | Vulnerabilidades futuras | `npm audit` + update a cada 3-6 meses |

### Riscos Comerciais

| Risco | O que acontece | Como resolver |
|---|---|---|
| **Cliente quer Pix** | 80% do BR paga com Pix — seu sistema não aceita nativamente | Pedido via WhatsApp contorna ("me manda o Pix"). Integração Pix na Fase 3. |
| **Cliente quer app** | "Quero baixar no celular" | PWA resolve parcialmente (Fase 3). Fale "funciona como app" |
| **Cliente para de pagar** | Você paga a infra e ele usa de graça | Cobre mensalidade obrigatória. Sem pagamento = derrubar no Render |
| **Cliente quer mudar cores sozinho** | Precisa de você hoje | Seletor de tema no admin (Fase 3) resolve |

### O que NÃO prometer ao cliente

- ❌ "Seu site aparece em primeiro no Google" (SEO leva meses)
- ❌ "Aceita pagamento online" (sem Pix nativo ainda)
- ❌ "O site nunca sai do ar" (Render Free dorme; Starter tem 99.9% uptime)
- ❌ "Você pode mudar tudo sozinho" (cores/layout precisam de dev)

### O que PODE prometer

- ✅ "Você edita cardápio, preços, fotos e WhatsApp sozinho pelo painel"
- ✅ "O site é profissional e funciona no celular"
- ✅ "Suporte técnico incluso por X dias"
- ✅ "Domínio próprio configurado" (se incluir no pacote)

---

## 7 — Roadmap de Melhorias

> Veja o plano completo com detalhes técnicos em [UPDATE.md](UPDATE.md)

### Resumo das Fases

| Fase | Quando | O que | Impacto em Vendas |
|---|---|---|---|
| **0 — Correções** | **AGORA** (antes da 1ª venda) | Debug logs, Cloudinary, CSRF fix | Obrigatório — sem isso não vende |
| **1 — UX Rápido** | Semana 1-2 | Máscara preço, placeholder WA, SEO, admin mobile | Site mais profissional |
| **2 — Valor** | Semana 3-6 | QR Code, preview config, contador visitas, maps | Justifica pacote Premium |
| **3 — Diferencial** | Mês 2-3 | Seletor tema, PWA, avaliações, Pix, dashboard | Compete com iFood/cardápio digital |
| **4 — Escala** | Mês 3+ | Multi-tenant, auto-provisioning, CI/CD, testes | Gerenciar 50+ clientes sem estresse |

### O que fazer AGORA vs DEPOIS

**AGORA (Fase 0 — 3 horas):**
1. Remover debug logs
2. Integrar Cloudinary
3. Testar e commitar

**Após 1ª venda (com dinheiro no bolso):**
1. Admin responsivo (dono edita pelo celular)
2. SEO (meta tags, sitemap)
3. QR Code (vende mais pacotes Premium)
