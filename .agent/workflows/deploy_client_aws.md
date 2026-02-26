---
description: Automates the full deployment process for a new client (Neon + ECS Fargate AWS)
---

# Deploy de Novo Cliente — AWS (ECS Fargate via Copilot)

> **Pré-requisito**: AWS CLI configurado (`aws configure`) e AWS Copilot CLI instalado (`brew install aws/tap/copilot-cli` ou equivalente).
> **Acesso:** Conta AWS com permissões de AdministratorAccess (ou Roles desenhadas para o ECS/IAM).

---

## 0. Resumo Arquitetural

Este workflow substitui a antiga VPS por containers gerenciados na AWS:
- **Neon:** Gerencia o banco de dados (sem alterações).
- **Copilot / ECS Fargate:** Sobe exatamente a imagem Docker configurada no repo para um cluster na AWS. O Copilot cuida de rede, load balancer (ALB) e HTTPS.

---

## 1. Coletar Dados do Cliente e Gerar Secrets

Em vez de preencher manualmente, o script interativo agora cuida de tudo:

```bash
node .agent/scripts/deploy_client_aws.js
```

O script fará as seguintes perguntas:
1. Nome do Cliente (ex: `lampiao-burguer`)
2. Tipo de Negócio (`restaurante` / `hamburgueria` / `confeitaria`)
3. E-mail do Admin
4. Domínio (opcional, ex: `lampiaoburger.com.br`)

✅ **Saída do Script:**
- Criação no **Neon** via API para obter a `DATABASE_URL`.
- Geração segura local do `JWT_SECRET`.
- Instruções de inicialização do Copilot para este cliente.

---

## 2. Inicializar Serviço no AWS Copilot

O conceito na AWS usa `App` (o seu SaaS global) -> `Environment` (produção/teste) -> `Service` (o cliente).

Se for o **primeiro** cliente na AWS da vida do SaaS, crie o App e o Environment:
```bash
copilot app init saas-restaurante
copilot env init --name production --profile default --default-config
```

**Para CADA NOVO cliente (Service):**
No terminal, execute o comando com as variáveis geradas passo 1:

```bash
copilot svc init --name [CLIENT_NAME] --svc-type "Load Balanced Web Service" --dockerfile ./server/Dockerfile
```

> ⚠️ O Copilot gerará um diretório `copilot/[CLIENT_NAME]/manifest.yml`. Você precisará adicionar as variáveis base lá (THEME, PORT, NODE_ENV) conforme as instruções do script `.js`.

---

## 3. Injetar Secrets Seguros (SSM)

**Atenção:** NUNCA coloque DATABASE_URL no repo. Injete os valores secretos fornecidos pelo script do Passo 1:

```bash
copilot secret init --name DATABASE_URL --value "[VALOR_DO_NEON]" --env production
copilot secret init --name DIRECT_URL --value "[VALOR_DO_NEON_DIRECT]" --env production
copilot secret init --name JWT_SECRET --value "[VALOR_GERADO]" --env production
# Inclua os secrets do Cloudinary da mesma forma (listados no fim do script)
```

---

## 4. Deploy Final (AWS via Fargate)

Quando os secrets estiverem criados e as variáveis inseridas no `manifest.yml`, rode o deploy:

```bash
copilot deploy --name [CLIENT_NAME] --env production
```

> ☕ **Pausa para o café:** A AWS vai provisionar o Application Load Balancer (ALB), Target Groups, Roles do IAM, subir seu container Fargate e anexar ao DNS. Pode levar de 3 a 5 minutos na primeira vez.

---

## 5. Seed do Banco de Dados (Pós-Deploy)

Com a URL em mãos (o Copilot dirá a URL pública no final, ex: `https://[cliente].saas-restaurante.us-east-1.amazonaws.com`), precisamos fazer o seed do DB remoto com as tabelas do tema:

```bash
# Na sua máquina local, no diretório /server
$env:DATABASE_URL="[DIRECT_URL]"
$env:DIRECT_URL="[DIRECT_URL]"
$env:SEED_ADMIN_EMAIL="[ADMIN_EMAIL]"
$env:SEED_ADMIN_PASSWORD="[ADMIN_PASSWORD_GERADA_NO_SCRIPT]"
$env:SEED_TYPE="[BUSINESS_TYPE]"

npx prisma migrate deploy
npx prisma db seed
```

---

## 6. Configuração de Domínio Personalizado (Opcional)

Se o cliente usar domínio próprio (ex: `lampiao.com.br`):
1. Copilot suporta isso nativamente se você delegar todo o domínio para a conta AWS Route53.
2. Alternativamente, diga ao cliente para criar um **CNAME** no provedor dele apontando para a URL do Load Balancer da AWS fornecida pelo `copilot deploy`.
3. Certificados TLS/SSL devem ser aprovados no AWS Certificate Manager (ACM).

---

## 7. Informar o Cliente 🚀

O script `.agent/scripts/deploy_client_aws.js` também gerará o e-mail final para ser colado no WhatsApp ou E-mail do cliente, contendo:

```text
🌐 URL do site:     https://[URL_GERADA_PELA_AWS]
🔐 Painel admin:    https://[URL_GERADA_PELA_AWS]/admin
📧 Email:           [ADMIN_EMAIL]
🔑 Senha:           [SENHA_GERADA]
📦 Tema Ativo:      [BUSINESS_TYPE]

⚠️ Troque sua senha no primeiro login!
```
