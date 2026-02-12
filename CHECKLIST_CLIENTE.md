# 📋 Checklist de Variáveis — Cada Cliente Novo

> **Copie esse arquivo para cada cliente e preencha os valores**

---

## 🆔 IDENTIFICAÇÃO DO CLIENTE

```
Cliente: ___________________________
Restaurante: ________________________
Contato: ____________________________
Pacote: [ ] Básico  [ ] Profissional  [ ] Premium
Data contratação: ___/___/______
```

---

## 🗄️ BANCO DE DADOS (NEON)

**Onde pegar:** https://neon.tech → Create Project

```
Project Name: restaurante-[nome]
Region: São Paulo (ou US East)

DATABASE_URL=postgresql://neondb_owner:_______________@ep-________.neon.tech/neondb?sslmode=require
```

**✅ Salvo em:** [ ] Bloco de notas  [ ] LastPass  [ ] Outro: _______

---

## 🌐 HOSPEDAGEM (RENDER)

**Onde configurar:** https://dashboard.render.com

### Passo 1: Criar Web Service

```
Name: restaurante-[nome]
Region: [Mesma do Neon]
Branch: main
Root Directory: server
Plan: [ ] Free (teste)  [ ] Starter $7/mês (produção)
```

### Passo 2: Variáveis de Ambiente (10 no total)

**Copie e cole cada uma no Render → Environment → Add Environment Variable:**

#### 2.1 - Banco de Dados
```
Key: DATABASE_URL
Value: [Cole a string do Neon acima]
```

#### 2.2 - Segurança JWT
```
Key: JWT_SECRET
Value: [Gere com: node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"]

Gerado: _______________________________________________
```

#### 2.3 - Ambiente
```
Key: NODE_ENV
Value: production
```

#### 2.4 - URLs da Aplicação
```
Key: APP_URL
Value: https://restaurante-[nome].onrender.com

Key: CORS_ORIGINS
Value: https://restaurante-[nome].onrender.com
```

#### 2.5 - Porta
```
Key: PORT
Value: 3000
```

#### 2.6 - Cloudinary (MESMO para todos os clientes!)

**⚠️ USE SUAS CREDENCIAIS ÚNICAS** (pegue em https://console.cloudinary.com/)

```
Key: CLOUDINARY_CLOUD_NAME
Value: dmebhvwpo   ← SEU cloud name (não "Root"!)

Key: CLOUDINARY_API_KEY
Value: 448539967934699   ← SEU API Key

Key: CLOUDINARY_API_SECRET
Value: _______________   ← Clique "Show" para revelar

Key: CLOUDINARY_FOLDER_PREFIX
Value: restaurante-[nome]   ← MUDA para cada cliente (organiza pastas)
```

**✅ Todas variáveis configuradas:** [ ] Sim

---

## 🌱 POPULAR BANCO (SEED)

**Rode no PowerShell local:**

```powershell
cd F:\VSCode\Landpage\server

$env:DATABASE_URL="[Cole DATABASE_URL do Neon]"
$env:SEED_ADMIN_EMAIL="dono@restaurante.com"
$env:SEED_ADMIN_PASSWORD="SenhaForte123!"

npx prisma db seed
```

**Credenciais de Admin criadas:**
```
Email: _______________________________
Senha: _______________________________
```

**✅ Seed executado:** [ ] Sim  
**✅ Pratos de exemplo apareceram:** [ ] Sim

---

## 🌍 DOMÍNIO CUSTOMIZADO (Profissional/Premium)

**Se o cliente tem domínio próprio:**

```
Domínio: www.______________________.com.br
Provedor: [ ] Registro.br  [ ] GoDaddy  [ ] HostGator  [ ] Outro: _______
```

**Configurar no Render:**
1. Settings → Custom Domains → Add Custom Domain
2. Digite: www.restaurante.com.br
3. Copie o CNAME que o Render mostrar: ________________

**Configurar no provedor do cliente:**
1. Login no painel do domínio
2. DNS → Adicionar registro CNAME
3. Apontar www para: [CNAME do Render]

**Depois, ATUALIZAR variáveis no Render:**
```
APP_URL=https://www.restaurante.com.br
CORS_ORIGINS=https://www.restaurante.com.br
```

**✅ Domínio configurado:** [ ] Sim  
**✅ SSL ativo (HTTPS):** [ ] Sim

---

## ✅ CHECKLIST FINAL DE ENTREGA

Antes de enviar pro cliente:

- [ ] Site público abre (https://restaurante-[nome].onrender.com)
- [ ] Admin funciona (/admin)
- [ ] Login com email/senha do seed funciona
- [ ] Upload de imagem funciona
- [ ] **Imagem retorna URL do Cloudinary** (https://res.cloudinary.com/...)
- [ ] Imagem aparece no site público
- [ ] Trocar senha funciona
- [ ] WhatsApp abre pedido
- [ ] **Teste redeploy:** Imagens persistem após redeploy manual

**✅ Tudo testado:** [ ] Sim  
**✅ Cliente recebeu mensagem de entrega:** [ ] Sim  
**✅ Agendou call de 15min:** [ ] Sim

---

## 💰 FINANCEIRO

```
Valor do pacote: R$ __________
Forma de pagamento: [ ] Pix  [ ] Transferência  [ ] Boleto

Entrada (50%): R$ __________ | Pago em: ___/___/___
Restante (50%): R$ __________ | Pago em: ___/___/___

Mensalidade: R$ __________ /mês
Dia do vencimento: [ ] 05  [ ] 10  [ ] 15  [ ] Outro: ___
```

**✅ Pagamento confirmado:** [ ] Sim

---

## 📞 PÓS-VENDA

```
Data entrega: ___/___/______
Call de treinamento: [ ] Feita  [ ] Agendada para ___/___/___
Vídeo tutorial enviado: [ ] Sim
```

**Próximos contatos:**
- [ ] 7 dias depois: Perguntar se está usando tranquilo
- [ ] 30 dias depois: Oferecer upgrade (QR Code, cores, etc)
- [ ] Todo dia 05: Lembrete de mensalidade

---

## 🔗 LINKS ÚTEIS

```
Site público: https://restaurante-[nome].onrender.com
Admin: https://restaurante-[nome].onrender.com/admin
Painel Render: https://dashboard.render.com
Painel Neon: https://console.neon.tech
Painel Cloudinary: https://console.cloudinary.com
```

---

**💾 SALVAR ESTE ARQUIVO COMO:**
`cliente-[nome]-variaveis.txt`

**Guardar em:** Pasta segura ou gerenciador de senhas (LastPass, 1Password, etc)
