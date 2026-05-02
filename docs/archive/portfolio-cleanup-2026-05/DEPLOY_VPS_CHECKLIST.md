# 🚀 Checklist de Deploy em VPS — Coolify

> Guia completo para ir de VPS limpa → produção com CI/CD.

---

## 1. Pré-requisitos da VPS

| Requisito | Mínimo | Recomendado |
|-----------|--------|-------------|
| **OS** | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| **RAM** | 2 GB | 4 GB |
| **CPU** | 1 vCPU | 2 vCPU |
| **Disco** | 20 GB SSD | 40 GB SSD |
| **Acesso** | SSH root ou sudo | SSH com chave |

**Portas que precisam estar abertas:**

| Porta | Protocolo | Uso |
|-------|-----------|-----|
| 22 | TCP | SSH |
| 80 | TCP | HTTP (redirect → HTTPS) |
| 443 | TCP | HTTPS |
| 8000 | TCP | Coolify Dashboard (temporário, após SSL pode fechar) |

---

## 2. Instalação do Coolify

### 2.1 Conectar na VPS via SSH

```bash
ssh root@IP_DA_VPS
```

### 2.2 Instalar Coolify (one-liner oficial)

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

> ⏱️ Leva ~3-5 minutos. Instala Docker, Docker Compose e o Coolify automaticamente.

### 2.3 Acessar o Dashboard

```
http://IP_DA_VPS:8000
```

- Criar conta de admin
- Salvar o **API Token**: Settings → API → Generate Token
- Anotar o **Server UUID**: Servers → Localhost → UUID na URL

### 2.4 Conectar GitHub

1. Settings → Sources → Add → GitHub App
2. Autorizar o repo `bps2414/templaterestaurantebps`
3. Verificar que o repo aparece na lista de sources

---

## 3. DNS — Configuração

### 3.1 Domínio Base + Wildcard

No painel do registrador (Registro.br, Cloudflare, etc.):

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| A | `@` | `IP_DA_VPS` | 300 |
| A | `*` | `IP_DA_VPS` | 300 |
| A | `coolify` | `IP_DA_VPS` | 300 |
| CNAME | `www` | `seudominio.com.br` | 300 |

> O registro wildcard `*` permite que `cliente1.seudominio.com.br`, `cliente2.seudominio.com.br`, etc. apontem automaticamente para a VPS.

### 3.2 Domínio Customizado de Cliente (opcional)

Se o cliente tiver domínio próprio (`www.restaurantedocliente.com.br`):

| Tipo | Nome | Valor |
|------|------|-------|
| A | `@` | `IP_DA_VPS` |
| CNAME | `www` | `seudominio.com.br` |

---

## 4. SSL — Let's Encrypt

- **Automático** no Coolify — basta marcar HTTPS na configuração do Application.
- Coolify usa Traefik como reverse proxy e renova certificados automaticamente.
- **Verificar**: Cadeado verde no browser após deploy.

---

## 5. Health Check

Configurar no Coolify para cada Application:

| Configuração | Valor |
|-------------|-------|
| **Path** | `/healthz` |
| **Port** | `3000` |
| **Interval** | `30s` |
| **Timeout** | `10s` |
| **Retries** | `3` |
| **Start Period** | `60s` |

O endpoint `/healthz` faz `SELECT 1` no banco e retorna:
```json
{"status":"ok","database":"connected","timestamp":"...","version":"2.0.0"}
```

---

## 6. Logs & Monitoramento

### 6.1 Logs da Aplicação

| Camada | Onde ver | Formato |
|--------|---------|---------|
| **Stdout** | Dashboard Coolify → Application → Logs | JSON (Winston) |
| **Error file** | Dentro do container: `logs/error.log` | JSON (max 10MB × 5 files) |

### 6.2 Logs do Sistema

```bash
# Logs de todos os containers
docker ps
docker logs <container-id> --tail 100 -f

# Logs do Coolify
docker logs coolify -f

# Uso de recursos
htop
df -h
```

### 6.3 Monitoramento Recomendado (opcional)

- **Uptime Kuma** (grátis, self-hosted) — monitorar `/healthz` de cada cliente
- Instalar pelo próprio Coolify: New Resource → Service → Uptime Kuma

---

## 7. Rollback

| Cenário | Ação |
|---------|------|
| **Deploy quebrado (código)** | Dashboard Coolify → Deployments → Redeploy versão anterior |
| **Banco corrompido** | Neon → Point-in-Time Restore (branching) |
| **Imagens perdidas** | Impossível — Cloudinary é externo e persistente |
| **VPS inteira** | Reinstalar Coolify + reimportar env vars + forçar deploy |

---

## 8. Segurança — Hardening da VPS

```bash
# Firewall básico (UFW)
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Desabilitar login root por senha (usar chave SSH)
sed -i 's/PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
systemctl restart sshd

# Updates automáticos de segurança
apt install unattended-upgrades -y
dpkg-reconfigure -plow unattended-upgrades
```

---

## 9. Checklist Final de Go-Live

- [ ] VPS acessível via SSH
- [ ] Coolify instalado e dashboard acessível
- [ ] GitHub repo conectado ao Coolify
- [ ] DNS wildcard `*.seudominio.com.br` → IP da VPS
- [ ] SSL automático ativo (Let's Encrypt)
- [ ] Primeiro cliente deployado com sucesso
- [ ] Health check retornando `200 OK`
- [ ] Logs visíveis no dashboard Coolify
- [ ] Firewall ativo (UFW)
- [ ] Login SSH por chave (senha desabilitada)
- [ ] Backup strategy: Neon (DB) + Cloudinary (imagens) — externos
- [ ] Uptime Kuma monitorando `/healthz` (opcional)
