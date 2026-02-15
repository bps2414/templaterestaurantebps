# Plano de Implementação: Script de Sincronização Segura (Main -> Template B)

> **Objetivo:** Automatizar o processo de trazer melhorias de código (backend/lógica) da branch `main` para `template-b` SEM sobrescrever ativos visuais ou configurações específicas da Hamburgueria.

---

## 1. Contexto e Riscos

### O Problema
O processo manual de `git merge` é propenso a erros humanos. Um "accept incoming changes" acidental pode substituir:
- O logotipo da Hamburgueria pelo do Restaurante.
- As cores vibrantes do tema B pelo tema padrão.
- O HTML estruturado especificamente para a Hamburgueria.

### O Solução Proposta
Um script PowerShell (`scripts/sync-safe.ps1`) que atua como um "Merge Driver" inteligente e interativo.

---

## 2. Regras de Proteção (A "White-List" e "Black-List")

### 🛡️ Zona Proibida (Nunca Sobrescrever Automaticamente)
Estes arquivos definem a identidade da Hamburgueria e devem ser preservados da `template-b` a todo custo, a menos que o usuário force explicitamente.

| Arquivo/Pasta | Motivo | Ação do Script |
| :--- | :--- | :--- |
| `public/images/*` | Imagens dos produtos (Hambúrgueres vs Pratos) | **Manter Template-B** (git checkout --ours) |
| `public/favicon.ico` | Ícone do site | **Manter Template-B** |
| `styles.css` (raiz) | Estilização global do tema (Cores, Fontes) | **Manter Template-B** |
| `index.html` | Estrutura da Landing Page | **Manter Template-B** |
| `tailwind.config.js` | Definição de cores/fontes | **Manter Template-B** |
| `config_full.json` | Configurações base do template | **Manter Template-B** |
| `public/js/app.js` | Lógica JS de Frontend (Contém lógica de UI específica) | **Análise Especial** (Merge Manual Recomendado ou Preservação) |

### 🔄 Zona de Sincronização (Sempre Atualizar)
Lógica de negócio e infraestrutura que deve ser idêntica em todos os templates.

| Arquivo/Pasta | Motivo | Ação do Script |
| :--- | :--- | :--- |
| `server/*` | Backend, API, Banco de Dados | **Trazer da Main** (git checkout --theirs/merge) |
| `tests/*` | Suites de teste E2E/Unit | **Trazer da Main** |
| `scripts/*.ps1` | Scripts de utilidade (incluindo este) | **Trazer da Main** |
| `package.json` | Dependências do projeto | **Merge Inteligente** |
| `public/js/modules/*` | Lógica JS reutilizável (se houver) | **Trazer da Main** |

---

## 3. Fluxo de Execução do Script

1.  **Validação de Ambiente**:
    *   Verificar se está na branch `template-b`.
    *   Verificar se o diretório de trabalho está limpo (sem mudanças não commitadas).

2.  **Preparação do Merge**:
    *   `git fetch origin main`
    *   `git merge main --no-commit --no-ff` (Merge sem finalizar, permitindo ajustes).

3.  **Restauração de Identidade (O "Escudo")**:
    *   Iterar sobre a lista de **Arquivos Protegidos**.
    *   Para cada arquivo, executar `git checkout HEAD -- <arquivo>` (reverte para o estado antes do merge, ou seja, estado da `template-b`).
    *   *Log*: "🛡️ Protegido: styles.css (Versão Hamburgueria mantida)".

4.  **Detecção de Novos Arquivos**:
    *   Identificar arquivos que existem na `main` mas não na `template-b`.
    *   Se for na pasta `public/images`, perguntar: "Novo asset detectado: 'img/novo-prato.png'. Deseja importar? (s/n)".
    *   Se for no `server/`, importar automaticamente.

5.  **Validação Pós-Merge**:
    *   Executar `npm run build` (server) para garantir que o mix de arquivos não quebrou a compilação.
    *   Opcional: Verificar se tags críticas (ex: `{{restaurant_name}}`) ainda existem no HTML.

6.  **Finalização**:
    *   Se sucesso, compilar a lista de alterações.
    *   Solicitar confirmação para `git commit` e `git push`.

---

## 4. Tarefas de Implementação

- [ ] **Mapeamento**: Listar exaustivamente todos os arquivos que diferem entre `main` e `template-b`.
- [ ] **Script Core**: Escrever `scripts/sync-safe.ps1` com a lógica de merge e proteção.
- [ ] **Lógica de "Diff"**: Implementar a detecção inteligente de conflitos em arquivos protegidos.
- [ ] **Teste Seco**: Rodar o script em modo "Dry Run" (sem fazer alterações reais) para validar a lógica.

## 5. Próximos Passos
Aprovar este plano para iniciar a codificação do script `scripts/sync-safe.ps1`.
