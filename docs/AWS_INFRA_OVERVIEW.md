# Visão Geral da Infraestrutura na AWS

> 🤖 **Documento gerado pelo DevOps-Engineer & Backend-Specialist**

Este documento detalha a infraestrutura escolhida para o deployment do SaaS de restaurantes na AWS, substituindo o antigo modelo baseado em Coolify/VPS.

## 🎯 Abordagem Selecionada: **ECS Fargate via AWS Copilot**

Após analisar os critérios de **simplicidade operacional, baixo custo inicial e fácil replicação por cliente**, escolhemos o Amazon Elastic Container Service (ECS) rodando no AWS Fargate, gerenciado pela ferramenta oficial **AWS Copilot CLI**.

### Por que esta escolha?
1. **Zero Gerenciamento de Servidor (Serverless):** Diferente de EC2 com Docker, não há sistema operacional para atualizar, patches de segurança ou quedas por falta de memória na VM.
2. **Fácil Replicação:** O AWS Copilot permite criar novos "Environments" ou "Services" com comandos simples (`copilot svc init`), padronizando o deploy de clientes.
3. **Custo-Benefício Inteligente:** Podemos agrupar múltiplos clientes (Services) sob o mesmo Load Balancer (ALB) dentro do mesmo Environment ("Production"), diluindo drasticamente o custo do balanceador de carga.
4. **Segurança Integrada:** Secrets (como JWT_SECRET e DATABASE_URL) não ficam em texto plano, sendo gerenciados via AWS Systems Manager (SSM) Parameter Store automaticamente pelo Copilot.

## 🏗️ Arquitetura

- **Frontend/Backend:** Next.js (Node.js) rodando em containers Docker no ECS Fargate.
- **Load Balancer:** AWS Application Load Balancer (ALB) configurado para HTTPS com certificados gerenciados pelo AWS Certificate Manager (ACM).
- **Banco de Dados:** Mantido no **Neon** (Serverless Postgres). Continua inalterado.
- **Storage de Imagens:** Mantido no **Cloudinary**.
- **Registro de Containers:** AWS Elastic Container Registry (ECR). Copilot faz o build e push automaticamente.

## 🔄 Novo Ciclo de Vida do Cliente

1. **Setup do Cliente:** O script gera o `.env` do cliente e as senhas.
2. **Declaração Infra:** O AWS Copilot inicializa um serviço web para o novo cliente (`copilot svc init --name client-lampiao`).
3. **Injeção de Secrets:** O script injeta os dados do banco e secrets no SSM (`copilot secret init`).
4. **Deploy:** `copilot deploy`. A AWS provisiona o container, atrela ao domínio, pede o certificado SSL e coloca no ar.

## ⚖️ Comparação: Antigo vs Novo

| Característica | Coolify (Antigo) | AWS ECS Fargate (Novo) |
|---|---|---|
| **Hospedagem** | VPS Single Node (Risco de queda) | Serverless Container (Alta disponibilidade) |
| **Escalabilidade** | Limitada pelo tamanho da VPS | Automática por container/cliente |
| **SSL/Domínio** | Traefik / Caddy interno | AWS ALB + Route53/ACM (Global) |
| **Execução Deploy**| Via Dashboard UI ou Script API | Via CLI (AWS Copilot) no CI/CD ou local |
| **Complexidade** | Média (requer gerenciar a VPS) | Muito Baixa (Copilot abstrai tudo) |
| **Segurança Env**| Texto no painel UI | Criptografia KMS no AWS SSM |

## ⚠️ Riscos e Pontos Manuais
1. **Configuração de Domínio Personalizado:** Exige a configuração manual no provedor de DNS do cliente para apontar (CNAME) para o Load Balancer da AWS.
2. **Custos Iniciais da Conta AWS:** Um ALB sozinho custa cerca de ~$16/mês. Todos os clientes de um mesmo cluster devem compartilhar este ALB para viabilizar financeiramente a operação SaaS em early-stage. A flag `--http-path` do Copilot ou hosts no ALB resolvem isso.
