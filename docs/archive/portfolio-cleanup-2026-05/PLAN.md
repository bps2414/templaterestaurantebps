# Deploy Client - Migration from Coolify to AWS

## Objective
Reescrever totalmente o fluxo de `deploy_client` para ambiente AWS, mantendo a arquitetura atual do produto (Neon para DB), sem depender do Coolify. O fluxo deve suportar múltiplos clientes e ser *production-ready*.

## Abordagem AWS Selecionada: **Elastic Beanstalk** + Docker
**Por que Elastic Beanstalk (EB)?**
- **Simplicidade operacional:** Gerencia automaticamente EC2, Load Balancers, Auto Scaling e métricas.
- **Baixa barreira:** O Dockerfile atual funciona nativamente com o formato do EB (Single Container Docker).
- **Sem servidor SSH direto:** Não precisamos gerenciar a VPS diretamente, mantendo a estabilidade.
- **Fácil replicação:** Cada cliente pode ter o seu "Environment" no EB, isolando recursos ou compartilhando a mesma "Application" e criando múltiplos "Environments". (Abordagem de múltiplos ambientes na mesma app EB é barata, ou ECS Fargate se buscar containerização mais "serverless", mas EB com instâncias t4g.micro/small atende o critério de custo inicial baixo e extrema simplicidade).
**Alternativa considerada e preterida (ECS Fargate):** Mais configuração inicial (VPC, Subnets, Task Definition, Cluster, ALB). EB abstrai grande parte disso.
**Alternativa considerada e preterida (EC2 direto com Docker):** Seria o mesmo que a VPS atual (Coolify), exigindo gerenciamento do SO, docker-compose, nginx reverso, certbot manual, etc.

*Nota:* Para maximizar *simplicidade* e *baixo custo*, ECS Fargate (com o AWS Copilot CLI) também é fantástico. Para *esta* arquitetura focada em conteinerização web + DB remoto, optaremos pelo **AWS Copilot CLI + ECS Fargate** OU **Elastic Beanstalk**. Focaremos as instruções e scripts da nova versão na simplicidade do AWS Copilot + ECS (que hoje é a recomendação para containers novos na AWS, abstraindo redes) ou EB. Daremos foco à conteinerização segura na AWS. 
Após análise, **ECS Fargate** com um simples Load Balancer é a escolha mais aderente a "semplicidade operacional e replicação", onde instanciamos o container definindo variáveis e domínio pelo CLI/Terraform.

## Tarefas da Orquestração

### Fase 1: Fundação & Infra
- **Agentes:** `devops-engineer`, `security-auditor`
- **Ações:**
  1. Definir a estrutura exata na AWS (ECS Fargate ou Elastic Beanstalk). Pelo requisito de "simplicidade operacional, baixo custo inicial e fácil replicação", desenhar o módulo Terraform ou os comandos CLI (AWS CLI/Copilot) padrão.
  2. Ajustar regras de segurança (IAM roles, Security Groups permitindo apenas porto 80/443, secrets no Parameter Store/Secrets Manager).

### Fase 2: Adaptação do Código Core & Novo Workflow
- **Agentes:** `backend-specialist`, `frontend-specialist`
- **Ações:**
  1. Criar novo script/workflow em `.agent/workflows/deploy_client_aws.md` ou `.agent/scripts/deploy_client_aws.js` que assuma o papel de:
     - Gerar variáveis (senhas, keys).
     - Acionar a criação na AWS (substituindo chamadas API do Coolify por CLI da AWS/SDK).
  2. Garantir que o app lida corretamente com health checks do AWS ALB.
  3. Validar se a geração de imagens URL public (Cloudinary) não quebra no novo escopo.

### Fase 3: Documentação e Artefatos Finais
- **Agentes:** `documentation-writer`, `project-planner`
- **Ações:**
  1. Gerar/Atualizar `AWS_DEPLOY_GUIDE.md`.
  2. Gerar `ENV_TEMPLATE_CLIENT.md`.
  3. Remover arquivo antigo (`.agent/workflows/deploy_client.md` ou referências do Render/Coolify).
  4. Checklist de deploy AWS final.

## Diferenças Coolify vs AWS
- **Coolify:** Usava a API do Coolify instalada em uma VPS, delegava provisionamento SSL e build pro Coolify.
- **AWS:** Usa ferramentas nativas da AWS (ECS/EB + ACM para SSL). Build da imagem é pushado para o ECR, depois o serviço atualiza (ou EB lê o Dockerrun.aws.json).
- **Sem estado de servidor:** Fim do gerenciamento de VPS debaixo dos panos, containers são curtos/serverless.

## Riscos Identificados
1. Curva inicial de IAM e rede da AWS.
2. Custos: AWS não tem valor fixo, deve-se usar ALB compartilhado ou instâncias T4G spot/reservadas para o custo inicial não explodir por cliente.

---
## 🔴 Aguardando Aprovação do Usuário
Verificar se o foco em AWS requer documentação como *infra-as-code* (Terraform) ou passos via console/CLI manual.
