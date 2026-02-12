# 🚀 Deploy Checklist — Final Audit

> Gerado em: 12/02/2026  
> Pré-requisitos: VPS com Docker + Docker Compose, domínio configurado, SSL (Let's Encrypt)

---

## 📋 PRÉ-DEPLOY

### 1. Variáveis de Ambiente

| Variável | Obrigatória | Exemplo | Notas |
|----------|------------|---------|-------|
| `DATABASE_URL` | ✅ | `postgresql://user:pass@postgres:5432/restaurant` | Trocar user/pass do default |
| `JWT_SECRET` | ✅ | String aleatória 64+ chars | `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | ❌ | `15m` | Default: 15 minutos |
| `JWT_REFRESH_EXPIRES_IN` | ❌ | `7d` | Default: 7 dias |
| `NODE_ENV` | ✅ | `production` | Ativa guards de segurança |
| `PORT` | ❌ | `3000` | Default: 3000 |
| `CLOUDINARY_CLOUD_NAME` | ✅ | `my-cloud` | Necessário para uploads |
| `CLOUDINARY_API_KEY` | ✅ | `123456789` | Dashboard Cloudinary |
| `CLOUDINARY_API_SECRET` | ✅ | `abcdef123` | Dashboard Cloudinary |
| `STRIPE_SECRET_KEY` | ⚠️ | `sk_live_...` | Só se usar checkout |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ | `whsec_...` | Só se usar checkout |
| `CORS_ORIGIN` | ✅ | `https://meurestaurante.com.br` | Domínio do frontend |
| `POSTGRES_PASSWORD` | ✅ | String forte | Para docker-compose |
| `SEED_TYPE` | ❌ | `restaurante` | hamburgueria, pizzaria |
| `SEED_ADMIN_EMAIL` | ❌ | `admin@meu.com` | Default: admin@restaurante.com |
| `SEED_ADMIN_PASSWORD` | ❌ | `MinhaSenh@Forte1` | Default: admin123 ⚠️ |

---

### 2. Limpeza do Repositório (ANTES de deploy)

```bash
# ⚠️ OBRIGATÓRIO: Remover arquivos FluxPay órfãos do root
rm -f index.html scripts.js scripts.min.js styles.css styles.min.css

# Remover config de teste com dados inadequados
rm -f config_full.json

# Mover .env.example para versão correta (restaurante, não FluxPay)
cp server/.env.example .env.example

# Verificar que .env NÃO está no git
git status --ignored | grep .env
```

---

### 3. Correções de Segurança (OBRIGATÓRIAS para produção)

```bash
# 1. Corrigir CSRF DoS (timingSafeEqual length check)
# Arquivo: server/src/middlewares/csrf.ts, linha 55
# Ver: final_report/security_summary.json SEC-001

# 2. Instalar sanitize-html (substituir regex XSS)
cd server && npm install sanitize-html @types/sanitize-html

# 3. Bind Docker ports a localhost
# docker-compose.yml: '127.0.0.1:5432:5432' (ou remover ports)

# 4. Adicionar Redis password
# docker-compose.yml: command: redis-server --requirepass ${REDIS_PASSWORD}
```

---

### 4. Build de Produção

```bash
# Compilar TypeScript
cd server && npm run build

# Verificar que dist/ foi gerado
ls -la server/dist/

# Build Tailwind CSS (substituir CDN)
# NOTA: Requer configuração de tailwind.config.js
npx tailwindcss -o public/css/tailwind.css --minify
```

---

## 🚀 DEPLOY

### 5. Docker Compose

```bash
# Criar .env na raiz com todas as variáveis
nano .env

# Build e start
docker compose build --no-cache
docker compose up -d

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f server
```

---

### 6. Database

```bash
# Executar migrations
docker compose exec server npx prisma migrate deploy

# Executar seed (primeira vez)
docker compose exec server npx prisma db seed

# Verificar conexão
docker compose exec server npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"AdminUser\";"
```

---

### 7. Verificação de Saúde

```bash
# Health check
curl -s http://localhost:3000/healthz | jq .

# Resultado esperado:
# { "status": "ok", "timestamp": "..." }
```

---

## ✅ PÓS-DEPLOY — Smoke Tests

### 8. Smoke Tests Automatizados

```bash
BASE_URL="http://localhost:3000"

echo "=== 1. Health Check ==="
curl -sf "$BASE_URL/healthz" | jq .status
# Esperado: "ok"

echo "=== 2. CSRF Token ==="
CSRF=$(curl -sf -c cookies.txt "$BASE_URL/api/csrf-token" | jq -r .token)
echo "Token: $CSRF"
# Esperado: string hex 64 chars

echo "=== 3. Config Pública ==="
curl -sf "$BASE_URL/api/config" | jq '.data.restaurant_name'
# Esperado: nome do restaurante (do seed)

echo "=== 4. Categorias Públicas ==="
curl -sf "$BASE_URL/api/categories" | jq '.data | length'
# Esperado: número > 0

echo "=== 5. Pratos Públicos ==="
curl -sf "$BASE_URL/api/dishes" | jq '.data | length'
# Esperado: número > 0

echo "=== 6. Login Admin ==="
LOGIN=$(curl -sf -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -d '{"email":"admin@restaurante.com","password":"admin123"}' \
  "$BASE_URL/api/auth/login")
TOKEN=$(echo $LOGIN | jq -r .data.accessToken)
echo "AccessToken: ${TOKEN:0:20}..."
# Esperado: JWT token

echo "=== 7. Admin /me ==="
curl -sf -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/auth/me" | jq .data.email
# Esperado: email do admin

echo "=== 8. About Content (GET) ==="
curl -sf "$BASE_URL/api/about-content" | jq '.data | keys'
# Esperado: ["about_features", "team_members"]

echo "=== 9. Gallery (GET) ==="
curl -sf "$BASE_URL/api/gallery" | jq '.data | length'
# Esperado: número >= 0

echo "=== 10. Sitemap ==="
curl -sf "$BASE_URL/sitemap.xml" | head -5
# Esperado: XML com <urlset>

echo "=== 11. Robots.txt ==="
curl -sf "$BASE_URL/robots.txt"
# Esperado: User-agent: * / Sitemap: ...

echo "=== 12. Static Files ==="
curl -sf -o /dev/null -w "%{http_code}" "$BASE_URL/menu.html"
# Esperado: 200

echo "=== SMOKE TESTS COMPLETE ==="
```

---

### 9. Testes de Segurança

```bash
echo "=== SEC-1: CSRF Required ==="
curl -sf -X PUT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"restaurant_name":"Test"}' \
  "$BASE_URL/api/config"
# Esperado: 403 "CSRF token missing"

echo "=== SEC-2: Auth Required ==="
curl -sf -X PUT \
  -H "Content-Type: application/json" \
  -d '{"restaurant_name":"Test"}' \
  "$BASE_URL/api/config"
# Esperado: 401 "Token not provided"

echo "=== SEC-3: Rate Limiting ==="
for i in $(seq 1 15); do
  curl -sf -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    "$BASE_URL/api/auth/login" -o /dev/null -w "$i: %{http_code}\n"
done
# Esperado: 429 após 10 tentativas

echo "=== SEC-4: Upload Validation ==="
echo "not an image" > /tmp/fake.jpg
curl -sf -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: $CSRF" \
  -b cookies.txt \
  -F "image=@/tmp/fake.jpg" \
  "$BASE_URL/api/upload"
# Esperado: 400 "Tipo de arquivo inválido"

echo "=== SEC-5: Helmet Headers ==="
curl -sf -I "$BASE_URL/" | grep -i "x-content-type\|x-frame\|strict-transport\|content-security"
# Esperado: X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, etc.
```

---

### 10. Testes que NÃO podem ser automatizados

> Status: **COULD NOT RUN** — Requer execução manual

| Teste | Comando/Ação | Esperado |
|-------|-------------|----------|
| Upload real de imagem | Admin panel → Pratos → Upload foto | Imagem aparece via Cloudinary CDN |
| QR Code geração | Admin panel → QR Code → Gerar | PNG renderizado, download funciona |
| WhatsApp redirect | Menu → Add item → Finalizar → WhatsApp | Abre WhatsApp com mensagem formatada |
| Mobile responsivo | Chrome DevTools → Toggle device | Layout adapta, menu hamburger funciona |
| Stripe checkout | /buy.html → Comprar | Redirect para Stripe Checkout |
| Password change | Admin → Alterar Senha → Nova senha | Login com senha antiga falha, nova funciona |
| Multi-tab logout | 2 abas admin → Logout em 1 | Outra aba mostra login na próxima ação |
| Backup download | `npm run backup` no container | JSON gerado em server/backups/ |

---

## 📦 MONITORAMENTO PÓS-DEPLOY

### 11. UptimeRobot (Gratuito)

```
URL: https://seudominio.com.br/healthz
Intervalo: 5 minutos
Tipo: HTTP
Palavra esperada: "ok"
Alerta: Email + Telegram/Slack
```

### 12. PM2 (se não usar Docker)

```bash
# Instalar PM2
npm install -g pm2

# Start com cluster mode
pm2 start server/dist/index.js -i max --name restaurant

# Configurar auto-restart
pm2 startup
pm2 save

# Monitorar
pm2 monit
pm2 logs restaurant --lines 50
```

### 13. Backup Automático

```bash
# Cron job para backup diário (2h da manhã)
# NOTA: backup.ts requer ts-node (devDependency) — não funciona no container de produção
# Alternativa: usar pg_dump

# Via pg_dump (funciona em produção):
0 2 * * * docker compose exec -T postgres pg_dump -U postgres restaurant_template > /backups/backup-$(date +\%Y\%m\%d).sql

# Manter últimos 7 dias:
0 3 * * * find /backups -name "backup-*.sql" -mtime +7 -delete
```

### 14. Log Rotation

```bash
# Se usar PM2:
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Se usar Docker:
# docker-compose.yml → logging:
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

---

## ⚠️ ISSUES ENCONTRADOS NO DEPLOY

| # | Issue | Severidade | Status |
|---|-------|-----------|--------|
| 1 | Root index.html/scripts.js/styles.css são FluxPay (outro projeto) | 🔴 CRITICAL | Deletar antes de deploy |
| 2 | .env.example (root) referencia FluxPay | 🟠 HIGH | Substituir por versão restaurant |
| 3 | config_full.json tem dados de teste inadequados | 🟠 HIGH | Deletar |
| 4 | Docker ports expostos a 0.0.0.0 | 🔴 CRITICAL | Bind a 127.0.0.1 |
| 5 | Redis sem autenticação | 🔴 CRITICAL | Adicionar requirepass |
| 6 | Server container sem healthcheck | 🟠 HIGH | Adicionar ao compose |
| 7 | .dockerignore no diretório errado (ignorado) | 🟠 HIGH | Mover para root |
| 8 | Dockerfile copia devDependencies para prod | 🟡 MEDIUM | npm ci --omit=dev |
| 9 | Source maps no build de produção | 🟡 MEDIUM | sourceMap: false |
| 10 | backup.ts requer ts-node (não disponível em prod) | 🟡 MEDIUM | Usar pg_dump ou compilar backup script |
| 11 | README diz PG 14, compose usa PG 15 | 🟢 LOW | Corrigir README |
| 12 | README referencia serviço 'app' em vez de 'server' | 🟢 LOW | Corrigir README |
