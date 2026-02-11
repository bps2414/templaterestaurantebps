# 🧪 Guia Rápido: Como Testar o Site do Restaurante

## ⚠️ Problemas com TypeScript no VS Code?

Os 86 erros que você está vendo são porque o VS Code precisa recarregar o Prisma Client. **Soluções:**

### Opção 1: Recarregar o VS Code
1. Pressione `Ctrl + Shift + P`
2. Digite: `Developer: Reload Window`
3. Pressione Enter

### Opção 2: Reiniciar o TypeScript Server
1. Abra qualquer arquivo `.ts` no editor
2. Pressione `Ctrl + Shift + P`
3. Digite: `TypeScript: Restart TS Server`
4. Pressione Enter

Os erros devem desaparecer.

---

## 🚀 Passo a Passo para Testar

### 1. Configure o Banco de Dados PostgreSQL

Você precisa de um PostgreSQL rodando. **Opções:**

#### Opção A: Docker (Mais Fácil)
```bash
cd f:\VSCode\Landpage
docker compose up -d db
```

#### Opção B: PostgreSQL Local
- Instale o PostgreSQL
- Crie um banco: `restaurant_template`

### 2. Configure o Arquivo .env

Edite o arquivo `server/.env` com estas configurações:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/restaurant_template?schema=public"

# JWT
JWT_SECRET="meu-secret-super-secreto-12345"
JWT_ACCESS_EXP="2h"
JWT_REFRESH_EXP="30d"

# Server
PORT=3000
NODE_ENV="development"
APP_URL="http://localhost:3000"
CORS_ORIGINS="http://localhost:3000"

# Stripe (opcional - deixe vazio por enquanto)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
TEMPLATE_PRICE_CENTS=29700
```

### 3. Instale e Configure o Banco

No terminal, dentro da pasta `server`:

```bash
cd server

# Instalar dependências (se ainda não fez)
npm install

# Criar as tabelas no banco
npx prisma migrate dev --name init

# Popular o banco com dados de exemplo
npx prisma db seed
```

### 4. Inicie o Servidor

```bash
npm run dev
```

Você verá:
```
Restaurant Template server listening on port 3000
```

### 5. Abra o Site no Navegador

Abra seu navegador em:

- **🏠 Site Principal:** http://localhost:3000
- **🍝 Cardápio:** http://localhost:3000/menu
- **📸 Galeria:** http://localhost:3000/gallery
- **ℹ️ Sobre:** http://localhost:3000/about
- **📞 Contato:** http://localhost:3000/contact
- **⚙️ Painel Admin:** http://localhost:3000/admin

### 6. Faça Login no Admin

No painel admin (http://localhost:3000/admin), use:

- **Email:** `admin@restaurante.com`
- **Senha:** `admin123`

⚠️ **Troque a senha depois!**

---

## 🧪 O Que Testar

### No Site Principal
- [ ] Veja os pratos em destaque carregando da API
- [ ] Clique nas categorias e veja os links
- [ ] Clique no botão WhatsApp flutuante (canto inferior direito)
- [ ] Teste em mobile (F12 → modo responsivo)

### No Cardápio
- [ ] Alterne entre as abas de categorias
- [ ] Clique em "Pedir via WhatsApp" em um prato
- [ ] Veja se os preços estão formatados em R$

### Na Galeria
- [ ] Clique em uma foto para abrir o lightbox
- [ ] Use as setas ou teclado (←→) para navegar
- [ ] Pressione ESC para fechar

### No Admin
- [ ] Crie um novo prato com foto
- [ ] Edite um prato existente
- [ ] Crie uma categoria
- [ ] Envie uma foto para a galeria
- [ ] Altere as configurações do site (nome, WhatsApp, etc.)
- [ ] Salve e veja as mudanças no site principal

---

## ❌ Problemas Comuns

### "Cannot connect to database"
- Certifique-se que o PostgreSQL está rodando
- Verifique a `DATABASE_URL` no `.env`

### "Port 3000 is already in use"
- Mude a porta no `.env`: `PORT=3001`
- Ou mate o processo na porta 3000:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID [número] /F
  ```

### Erros no TypeScript mesmo após reload
- Delete a pasta `node_modules`
- Rode `npm install` novamente
- Rode `npx prisma generate`

### Imagens não aparecem
- Verifique se a pasta `server/assets/uploads/` existe
- Confirme que as URLs no admin começam com `/uploads/`

---

## 📦 Antes de Distribuir

1. **Troque a senha admin**
2. **Configure um JWT_SECRET forte**
3. **Teste em produção com Docker:**
   ```bash
   docker compose up -d
   ```
4. **Configure HTTPS** (Let's Encrypt/Cloudflare)
5. **Backup automático do banco**

---

## 🆘 Precisa de Ajuda?

1. Veja os logs do servidor no terminal
2. Abra o Console do navegador (F12) para erros de frontend
3. Confira o README.md para mais detalhes
