# Template de Variáveis de Ambiente do Cliente

Este documento define **quais** variáveis são necessárias para cada ambiente (cliente) instanciado na AWS via AWS Copilot.

> 🔴 **Regra de Ouro da Segurança:** **NUNCA** guarde valores reais `.env` no repositório. Este arquivo define o *schema* esperado. Os valores reais são injetados diretamente no AWS Systems Manager (SSM) Parameter Store pelo script de deploy ou via AWS CLI (`copilot secret init`).

## Variáveis Obrigatórias (Injetadas como AWS Secrets)

| Chave | Descrição | Ambiente (AWS Copilot) | Exemplo de Tipo/Geração |
|---|---|---|---|
| `DATABASE_URL` | String de conexão via Pooler com o Neon. | Todos os clientes | `postgresql://user:pass@ep-rest-123.neon.tech/neondb?sslmode=require` |
| `DIRECT_URL` | Conexão bancária direta (usada para migrations se necessário). | Todos os clientes | (mesma de cima, sem pgbouncer/pooler) |
| `JWT_SECRET` | Assinatura segura para autenticação de administradores. | Todos os clientes | `require('crypto').randomBytes(64).toString('base64')` |
| `CLOUDINARY_API_KEY` | Chave de acesso do serviço de imagens. | Compartilhado | `4485...` |
| `CLOUDINARY_API_SECRET` | Secret de acesso do serviço de imagens. | Compartilhado | `1XIC...` |

## Variáveis Obrigatórias (Injetadas em Texto Plano no Manifest)

| Chave | Descrição | Onde Definir |
|---|---|---|
| `NODE_ENV` | Define o modo da aplicação. | `copilot/manifest.yml` (`production`) |
| `THEME` | Tema/Negócio ativo do cliente. | `copilot/manifest.yml` (`restaurante`, `hamburgueria`, `pizzaria`) |
| `APP_URL` | URL final gerada para o frontend. | `copilot/manifest.yml` |
| `CORS_ORIGINS`| Autorização de origem para chamadas de API do client. | `copilot/manifest.yml` |
| `CLOUDINARY_CLOUD_NAME`| Nome do cloud (público). | `copilot/manifest.yml` (`dmebhvwpo`) |
| `CLOUDINARY_FOLDER_PREFIX`| Diretório exclusivo do cliente no servidor de imagens. | `copilot/manifest.yml` (e.g. `cliente-lampiao`) |
| `PORT` | Porta que o Express subirá na Fargate Task. | `copilot/manifest.yml` (`3000`) |

## Registo no SSM Parameter Store (AWS CLI / Copilot)

Em vez de criar arquivos `.env` na VPS (antigo Coolify), os *secrets* do cliente devem residir com segurança KMS na AWS. O comando:

```bash
copilot secret init --name JWT_SECRET --value [GERADO_NO_SCRIPT] --env production
```

Cria um parâmetro no path `/copilot/[nome_app]/production/secrets/JWT_SECRET` que a ECS Task Fargate consome de forma transparente no tempo de inicialização do container.

### Scripts Autorizados
O script `.agent/scripts/generate_client_secrets.js` ajuda os administradores a gerar esses tokens em memória durante a fase de setup, garantindo conformidade.
