# Checklist de Deploy — AWS (ECS Fargate via Copilot)

Este checklist garante que nenhum passo crítico de segurança, configuração e deploy seja ignorado ao criar o ambiente de um novo cliente na AWS.

## 🗄️ Fase 1: Preparação e Banco de Dados (Neon)
- [ ] Novo projeto foi criado no Neon (isolamento por cliente).
- [ ] O script `.agent/scripts/deploy_client_aws.js` foi executado localmente.
- [ ] Recebeu as variáveis seguras geradas no console (DATABASE_URL, DIRECT_URL, JWT_SECRET, ADMIN_PASSWORD).
- [ ] Você possui o AWS CLI autenticado configurado no terminal (usado pelo `copilot`).

## ☁️ Fase 2: Configuração do Serviço na AWS
- [ ] Executou o `copilot svc init` e configurou as origens locais do repo `server/Dockerfile`.
- [ ] Alterou manualmente o arquivo `copilot/[cliente]/manifest.yml` gerado pelo Copilot para incluir as variáveis não confidenciais (THEME, PORT, NODE_ENV, CLOUDINARY_CLOUD_NAME, CLOUDINARY_FOLDER_PREFIX).
- [ ] Registrou as chaves ultra-secretas (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, e `CLOUDINARY_API_KEY/SECRET`) no AWS Systems Manager usando `copilot secret init`.

## 🚢 Fase 3: Deploy e Validação
- [ ] Executou o `copilot deploy --name [cliente] --env production` para provisionamento no ECS Fargate.
- [ ] O console finalizou com a URL do Load Balancer em verde.
- [ ] (Somente 1ª vez): Executou o script Prisma Seed (via `npx prisma migrate deploy` e `npx prisma db seed`) na máquina local para preencher a DB com o plano padrão de restaurante/hamburgueria/confeitaria.
- [ ] O site carregou o tema correto na URL oficial gerada.
- [ ] Login no `/admin` com `admin@...` funcionou.
- [ ] Envio das credenciais ao cliente (texto gerado pelo script).

## 🔒 Fase 4: Opcional e Continuidade
- [ ] (Opcional): Customizou o DNS no Route53 apontando pro ALB.
- [ ] Confirmou a exclusão da infra anterior com o Coolify se este cliente foi recém-migrado.
