# 🧪 Manual Tests — Final Audit

> Gerado em: 12/02/2026  
> Executar TODOS antes de cada deploy para produção

---

## Setup

```bash
# Configurar variáveis
export BASE_URL="http://localhost:3000"
export ADMIN_EMAIL="admin@restaurante.com"
export ADMIN_PASSWORD="admin123"

# Obter CSRF token e cookies
CSRF=$(curl -sf -c cookies.txt "$BASE_URL/api/csrf-token" | jq -r .token)
echo "CSRF: $CSRF"

# Login e obter access token
LOGIN=$(curl -sf -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
  "$BASE_URL/api/auth/login")
TOKEN=$(echo $LOGIN | jq -r .data.accessToken)
REFRESH=$(echo $LOGIN | jq -r .data.refreshToken)
echo "Token: ${TOKEN:0:30}..."
echo "Refresh: ${REFRESH:0:30}..."
```

---

## 1. Authentication Tests

### 1.1 Login com credenciais inválidas
```bash
curl -sf -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -d '{"email":"wrong@test.com","password":"wrongpass"}' \
  "$BASE_URL/api/auth/login" | jq .
# ✅ Esperado: { "success": false, "error": "Credenciais inválidas" }
```

### 1.2 Login com senha curta
```bash
curl -sf -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -d '{"email":"admin@test.com","password":"123"}' \
  "$BASE_URL/api/auth/login" | jq .
# ✅ Esperado: 400 validation error
```

### 1.3 Token refresh
```bash
curl -sf -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -d "{\"refreshToken\":\"$REFRESH\"}" \
  "$BASE_URL/api/auth/refresh" | jq .data.accessToken
# ✅ Esperado: novo access token
# ✅ Verificar: refresh token antigo invalidado
```

### 1.4 Acesso sem token
```bash
curl -sf "$BASE_URL/api/auth/me" | jq .
# ✅ Esperado: { "success": false, "error": "Token not provided" }
```

### 1.5 Rate limiting em login
```bash
for i in $(seq 1 12); do
  CODE=$(curl -sf -o /dev/null -w "%{http_code}" -b cookies.txt \
    -H "Content-Type: application/json" \
    -H "X-CSRF-Token: $CSRF" \
    -d '{"email":"brute@test.com","password":"wrong'$i'"}' \
    "$BASE_URL/api/auth/login")
  echo "Attempt $i: HTTP $CODE"
done
# ✅ Esperado: 429 após 10 tentativas
```

---

## 2. Config CRUD Tests

### 2.1 GET config (público)
```bash
curl -sf "$BASE_URL/api/config" | jq '.data | keys'
# ✅ Esperado: array com restaurant_name, whatsapp_number, etc.
```

### 2.2 PUT config (admin)
```bash
curl -sf -X PUT -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: $CSRF" \
  -d '{"restaurant_name":"Teste Auditoria"}' \
  "$BASE_URL/api/config" | jq .data.restaurant_name
# ✅ Esperado: "Teste Auditoria"
```

### 2.3 PUT config com chave proibida
```bash
curl -sf -X PUT -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: $CSRF" \
  -d '{"admin_password":"hacked"}' \
  "$BASE_URL/api/config" | jq .
# ✅ Esperado: error "Chave não permitida"
```

### 2.4 PUT config com XSS payload
```bash
curl -sf -X PUT -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: $CSRF" \
  -d '{"restaurant_name":"<script>alert(1)</script>Test"}' \
  "$BASE_URL/api/config" | jq .data.restaurant_name
# ✅ Esperado: "Test" (script tag stripped)
# ⚠️ KNOWN ISSUE: regex sanitizer bypassable (ver SEC-003)
```

### 2.5 PUT config com XSS bypass
```bash
curl -sf -X PUT -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: $CSRF" \
  -d '{"restaurant_name":"<img src=x onerror=alert(1)>"}' \
  "$BASE_URL/api/config" | jq .data.restaurant_name
# ⚠️ CURRENT: passes through (regex doesn't catch unquoted handlers)
# ✅ AFTER FIX: should return "" (sanitize-html strips all tags)
```

### 2.6 WhatsApp number validation
```bash
# Número válido BR
curl -sf -X PUT -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: $CSRF" \
  -d '{"whatsapp_number":"5511999998888"}' \
  "$BASE_URL/api/config" | jq .data.whatsapp_number
# ✅ Esperado: "5511999998888"

# Número inválido (curto)
curl -sf -X PUT -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: $CSRF" \
  -d '{"whatsapp_number":"11999"}' \
  "$BASE_URL/api/config" | jq .
# ✅ Esperado: error "WhatsApp deve ter entre 12 e 15 dígitos"
```

---

## 3. Dishes CRUD Tests

### 3.1 GET dishes (público)
```bash
curl -sf "$BASE_URL/api/dishes" | jq '.data | length'
# ✅ Esperado: número > 0
```

### 3.2 POST dish (admin)
```bash
curl -sf -X POST -b cookies.txt \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: $CSRF" \
  -F "name=Prato Teste Auditoria" \
  -F "description=Descrição de teste" \
  -F "price=29.90" \
  -F "categoryId=$(curl -sf $BASE_URL/api/categories | jq -r '.data[0].id')" \
  "$BASE_URL/api/dishes" | jq .data.name
# ✅ Esperado: "Prato Teste Auditoria"
```

### 3.3 DELETE dish (admin)
```bash
DISH_ID=$(curl -sf "$BASE_URL/api/dishes" | jq -r '.data[-1].id')
curl -sf -X DELETE -b cookies.txt \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: $CSRF" \
  "$BASE_URL/api/dishes/$DISH_ID" | jq .
# ✅ Esperado: { "success": true }
```

---

## 4. Category Tests

### 4.1 GET categories (público)
```bash
curl -sf "$BASE_URL/api/categories" | jq '.data | length'
# ✅ Esperado: número > 0
```

### 4.2 POST category (admin)
```bash
curl -sf -X POST -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: $CSRF" \
  -d '{"name":"Categoria Teste","order":99}' \
  "$BASE_URL/api/categories" | jq .data.name
# ✅ Esperado: "Categoria Teste"
```

---

## 5. Gallery Tests

### 5.1 GET gallery (público)
```bash
curl -sf "$BASE_URL/api/gallery" | jq '.data | length'
# ✅ Esperado: número >= 0
```

---

## 6. About Content Tests

### 6.1 GET about-content (público)
```bash
curl -sf "$BASE_URL/api/about-content" | jq '.data'
# ✅ Esperado: { "about_features": [...], "team_members": [...] }
```

### 6.2 PUT about-content (admin)
```bash
curl -sf -X PUT -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: $CSRF" \
  -d '{
    "about_features": [{"icon":"🧪","title":"Teste","description":"Auditoria feature"}],
    "team_members": [{"name":"Auditor","role":"QA","photo":""}]
  }' \
  "$BASE_URL/api/about-content" | jq '.data.about_features | length'
# ✅ Esperado: 1
```

### 6.3 PUT about-content com excesso (limite 6 features / 10 members)
```bash
curl -sf -X PUT -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: $CSRF" \
  -d '{"about_features":[{"icon":"1","title":"a","description":"b"},{"icon":"2","title":"a","description":"b"},{"icon":"3","title":"a","description":"b"},{"icon":"4","title":"a","description":"b"},{"icon":"5","title":"a","description":"b"},{"icon":"6","title":"a","description":"b"},{"icon":"7","title":"a","description":"b"}]}' \
  "$BASE_URL/api/about-content" | jq .
# ✅ Esperado: validation error (max 6 features)
```

---

## 7. Upload Tests

### 7.1 Upload imagem válida
```bash
# Criar imagem de teste mínima (1x1 PNG)
echo -ne '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82' > /tmp/test.png

curl -sf -X POST -b cookies.txt \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: $CSRF" \
  -F "image=@/tmp/test.png" \
  "$BASE_URL/api/upload" | jq .
# ✅ Esperado: { "success": true, "data": { "url": "https://res.cloudinary.com/..." } }
```

### 7.2 Upload arquivo inválido (não-imagem)
```bash
echo "This is not an image" > /tmp/fake.jpg
curl -sf -X POST -b cookies.txt \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: $CSRF" \
  -F "image=@/tmp/fake.jpg" \
  "$BASE_URL/api/upload" | jq .
# ✅ Esperado: 400 error (magic bytes validation)
```

### 7.3 Upload sem auth
```bash
curl -sf -X POST \
  -F "image=@/tmp/test.png" \
  "$BASE_URL/api/upload" | jq .
# ✅ Esperado: 401 "Token not provided"
```

---

## 8. CSRF Tests

### 8.1 Mutation sem CSRF token
```bash
curl -sf -X PUT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"restaurant_name":"CSRF Test"}' \
  "$BASE_URL/api/config" | jq .
# ✅ Esperado: 403 "CSRF token missing"
```

### 8.2 CSRF com token manipulado
```bash
curl -sf -X PUT -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: aaa" \
  -d '{"restaurant_name":"CSRF Test"}' \
  "$BASE_URL/api/config" | jq .
# ⚠️ CURRENT BUG: May crash server if cookie token length != header length
# ✅ AFTER FIX: 403 "Invalid CSRF token"
```

---

## 9. Static & SEO Tests

### 9.1 Páginas estáticas
```bash
for page in "" "menu.html" "about.html" "gallery.html" "contact.html" "admin.html" "buy.html"; do
  CODE=$(curl -sf -o /dev/null -w "%{http_code}" "$BASE_URL/$page")
  echo "$page: $CODE"
done
# ✅ Esperado: todas 200
```

### 9.2 Sitemap.xml
```bash
curl -sf "$BASE_URL/sitemap.xml" | grep -c "<url>"
# ✅ Esperado: 5+ URLs
```

### 9.3 Robots.txt
```bash
curl -sf "$BASE_URL/robots.txt" | grep Sitemap
# ✅ Esperado: Sitemap: https://...
```

### 9.4 404 handler
```bash
curl -sf -o /dev/null -w "%{http_code}" "$BASE_URL/nonexistent-page"
# ✅ Esperado: 404
```

---

## 10. Security Headers

```bash
curl -sf -I "$BASE_URL/" 2>&1 | grep -iE "x-content-type|x-frame|strict-transport|content-security|x-xss|referrer-policy|permissions-policy"
# ✅ Esperado:
# X-Content-Type-Options: nosniff
# X-Frame-Options: SAMEORIGIN
# Content-Security-Policy: ...
# Referrer-Policy: strict-origin-when-cross-origin
# Permissions-Policy: ...
```

---

## 11. Verify-Prices (Cart Integrity)

```bash
DISH_ID=$(curl -sf "$BASE_URL/api/dishes" | jq -r '.data[0].id')
PRICE=$(curl -sf "$BASE_URL/api/dishes" | jq '.data[0].price')

# Preço correto
curl -sf -X POST \
  -H "Content-Type: application/json" \
  -d "{\"items\":[{\"dishId\":\"$DISH_ID\",\"price\":$PRICE,\"quantity\":1}]}" \
  "$BASE_URL/api/dishes/verify-prices" | jq .
# ✅ Esperado: { "success": true, "data": { "valid": true } }

# Preço manipulado
curl -sf -X POST \
  -H "Content-Type: application/json" \
  -d "{\"items\":[{\"dishId\":\"$DISH_ID\",\"price\":0.01,\"quantity\":1}]}" \
  "$BASE_URL/api/dishes/verify-prices" | jq .
# ✅ Esperado: { "success": true, "data": { "valid": false, "corrections": [...] } }
```

---

## Resultado Esperado

| Seção | Testes | Status |
|-------|--------|--------|
| Auth | 5 | 🟢 Todos passam |
| Config | 6 | 🟡 XSS bypass conhecida (SEC-003) |
| Dishes | 3 | 🟢 Todos passam |
| Categories | 2 | 🟢 Todos passam |
| Gallery | 1 | 🟢 Passa |
| About | 3 | 🟢 Todos passam |
| Upload | 3 | 🟢 Todos passam |
| CSRF | 2 | 🔴 8.2 pode crashar server (BUG-001) |
| Static/SEO | 4 | 🟢 Todos passam |
| Headers | 1 | 🟢 Passa |
| Prices | 2 | 🟢 Todos passam |
| **Total** | **32** | **30 pass, 2 known issues** |
