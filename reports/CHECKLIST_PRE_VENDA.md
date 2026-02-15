# ✅ CHECKLIST PRÉ-VENDA — Validação em 10 Minutos

**Use este checklist antes de entregar para cliente.**  
**Tempo total:** ~10 minutos

---

## 1️⃣ DEPLOY (2 min)

```bash
# No Render ou similar, verificar:
```

- [ ] **Variáveis de ambiente configuradas:**
  - `JWT_SECRET` (mínimo 32 caracteres aleatórios)
  - `DATABASE_URL` (conexão PostgreSQL funcionando)
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `APP_URL` (domínio de produção)
  - `CORS_ORIGINS` (domínio de produção)
  - `NODE_ENV=production`

- [ ] **Database setup executado:**
  ```bash
  npm run prisma:migrate:deploy
  npm run prisma:seed
  ```

- [ ] **Health check OK:**
  - Acessar: `https://SEU_DOMINIO/healthz`
  - Deve retornar: `{"status":"ok"}`
  - Status HTTP: `200`

- [ ] **HTTPS funcionando:**
  - URL começa com `https://`
  - Sem warning de certificado
  - Cadeado verde no navegador

---

## 2️⃣ AUTENTICAÇÃO (2 min)

### Login Admin

- [ ] Abrir: `https://SEU_DOMINIO/admin`
- [ ] Fazer login com credenciais seed:
  - Email: `admin@restaurante.com`
  - Senha: (conferir no seed ou `SEED_ADMIN_PASSWORD`)
- [ ] ✅ Login bem-sucedido → redireciona para dashboard

### Logout

- [ ] Clicar em "Sair" no admin
- [ ] ✅ Redireciona para `/login`
- [ ] ✅ Tentar acessar `/admin` → bloqueia e pede login novamente

### JWT/CSRF

- [ ] Abrir DevTools → Network
- [ ] Fazer qualquer ação PUT/POST no admin (ex: editar configuração)
- [ ] ✅ Request tem header `X-CSRF-Token`
- [ ] ✅ Response 200 (não 403)

---

## 3️⃣ FUNCIONALIDADES CORE (3 min)

### A. CRUD de Pratos

- [ ] **Criar prato:**
  - Ir em "Cardápio" → "Adicionar Prato"
  - Preencher nome, preço, descrição
  - ✅ Salva sem erro

- [ ] **Upload de imagem de prato:**
  - Adicionar foto ao prato criado
  - ✅ Upload funciona
  - ✅ URL retornada começa com `https://res.cloudinary.com/`
  - ✅ Imagem aparece no preview do admin

- [ ] **Editar prato:**
  - Mudar nome do prato
  - ✅ Salva e atualiza

- [ ] **Deletar prato:**
  - Remover prato de teste
  - ✅ Deleta sem erro

### B. Galeria

- [ ] **Upload de foto na galeria:**
  - Ir em "Galeria" → Upload
  - ✅ Foto sobe para Cloudinary
  - ✅ Aparece na grid da galeria

### C. Configurações do Site

- [ ] **Editar nome do restaurante:**
  - Ir em "Configurações" → Campo "Nome do Restaurante"
  - Mudar para "Teste Restaurante"
  - Salvar
  - ✅ Salva sem erro

- [ ] **Verificar no site público:**
  - Abrir: `https://SEU_DOMINIO/`
  - ✅ Nome mudou no hero e no rodapé

---

## 4️⃣ SITE PÚBLICO (2 min)

### Homepage

- [ ] Abrir: `https://SEU_DOMINIO/`
- [ ] ✅ Hero aparece sem erro
- [ ] ✅ Imagens carregam
- [ ] ✅ Sem erros no console (F12)

### Menu

- [ ] Abrir: `https://SEU_DOMINIO/menu`
- [ ] ✅ Pratos aparecem
- [ ] ✅ Filtro por categoria funciona
- [ ] ✅ Fotos dos pratos carregam do Cloudinary

### Galeria

- [ ] Abrir: `https://SEU_DOMINIO/gallery`
- [ ] ✅ Fotos aparecem
- [ ] ✅ Modal de zoom funciona ao clicar

### WhatsApp

- [ ] Adicionar prato ao carrinho no menu
- [ ] Clicar em "Finalizar Pedido" ou botão WhatsApp
- [ ] ✅ Abre WhatsApp com mensagem formatada
- [ ] ✅ Mensagem contém:
  - Nome do restaurante
  - Lista de pratos
  - Total

---

## 5️⃣ SEGURANÇA (1 min)

### Rate Limiting

- [ ] **Testar limite de login:**
  - Tentar fazer login com senha errada 5 vezes seguidas
  - Na 6ª tentativa:
  - ✅ Deve retornar erro "Too many attempts"
  - ✅ Deve bloquear por 15 minutos

### CSRF Protection

- [ ] Abrir DevTools → Application → Cookies
- [ ] Fazer login no admin
- [ ] ✅ Cookie `csrf_token` existe
- [ ] Fazer qualquer ação PUT/POST
- [ ] ✅ Request inclui header `X-CSRF-Token`
- [ ] ✅ Response 200 (não 403 Forbidden)

### Headers de Segurança

- [ ] Abrir DevTools → Network
- [ ] Carregar qualquer página
- [ ] Inspecionar Response Headers:
  - ✅ `Content-Security-Policy` presente
  - ✅ `X-Content-Type-Options: nosniff`
  - ✅ `X-Frame-Options: DENY`
  - ✅ `Strict-Transport-Security` (se HTTPS)

---

## 6️⃣ RESPONSIVIDADE (1 min)

- [ ] **Mobile:**
  - Abrir site no celular (ou DevTools → Toggle device toolbar)
  - ✅ Menu hamburguer funciona
  - ✅ Imagens responsivas
  - ✅ Texto legível
  - ✅ Botões clicáveis (não sobrepostos)

- [ ] **Tablet:**
  - Testar viewport 768px
  - ✅ Layout adapta corretamente

---

## ✅ RESULTADO FINAL

### Critério de Aprovação:

**✅ APROVADO se:**
- Todos os itens críticos (marcados acima) funcionam
- Zero erros no console do navegador
- WhatsApp abre corretamente
- Upload de imagens vai para Cloudinary

**⚠️ REVISAR se:**
- Algum upload falha → verificar env vars Cloudinary
- CSRF 403 → verificar cookies no navegador
- Rate limit não funciona → verificar logs do servidor

**❌ BLOCKER se:**
- Login admin não funciona → verificar DATABASE_URL e seed
- Site público não carrega → verificar build e deploy
- Imagens não aparecem → verificar Cloudinary config

---

## 📋 CHECKLIST DE ENTREGA PARA CLIENTE

Após validação acima, entregar:

- [ ] **URL do site público:** `https://restaurante-cliente.onrender.com`
- [ ] **URL do admin:** `https://restaurante-cliente.onrender.com/admin`
- [ ] **Credenciais admin:** (email/senha em mensagem segura)
- [ ] **Link para documentação:** Enviar `GUIA_COMPLETO_DEPLOY.md`
- [ ] **Tutorial rápido:**
  - Como editar pratos
  - Como fazer upload de fotos
  - Como mudar configurações
  - Como testar pedido WhatsApp

---

## 🆘 SE ALGO FALHAR

### 1. Site não carrega (500 Internal Server Error)

**Diagnóstico:**
```bash
# No Render, abrir "Logs" e procurar por:
```
- `Error: JWT_SECRET not configured` → Adicionar env var
- `Error connecting to database` → Verificar DATABASE_URL
- `Prisma migration required` → Rodar `prisma migrate deploy`

**Fix:**
1. Adicionar env var faltante
2. Redeploy automático

---

### 2. Upload de imagens falha

**Diagnóstico:**
- Erro "Cloudinary credentials invalid"
- Status 500 ao fazer upload

**Fix:**
1. Conferir env vars:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
2. Validar no site do Cloudinary se credenciais estão corretas
3. Redeploy

---

### 3. CSRF 403 Forbidden

**Diagnóstico:**
- Erro ao salvar configurações
- DevTools → Console: "CSRF token missing"

**Fix:**
1. Verificar se `CORS_ORIGINS` inclui o domínio correto
2. Limpar cookies do navegador
3. Fazer login novamente
4. Testar em aba anônima

---

### 4. Rate limit não funciona

**Diagnóstico:**
- Consegue fazer login infinitas vezes

**Fix:**
- Verificar se `uploadLimiter` está aplicado em `app.ts`
- Conferir logs: deve aparecer "Rate limit exceeded"
- Em produção com múltiplas instâncias → migrar para Redis

---

## 📊 RESUMO

| Área | Tempo | Criticidade |
|------|-------|-------------|
| Deploy | 2 min | 🔴 Crítico |
| Autenticação | 2 min | 🔴 Crítico |
| Funcionalidades | 3 min | 🔴 Crítico |
| Site Público | 2 min | 🟡 Importante |
| Segurança | 1 min | 🟢 Validação |
| Responsividade | 1 min | 🟢 Validação |

**Total:** ~10 minutos

---

**Última atualização:** 13/02/2026
