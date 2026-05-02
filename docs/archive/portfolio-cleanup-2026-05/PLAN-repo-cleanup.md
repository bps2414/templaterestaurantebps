# Relatório de Limpeza do Repositório (Repo Cleanup)

**Overview:** O repositório raiz contém uma série de arquivos residuais, scripts temporários de correções passadas e relatórios de auditoria que estão poluindo a visualização principal do projeto. O objetivo é higienizar a raiz do projeto deletando arquivos sem utilidade (lixo) e movendo a documentação e relatórios que ainda tenham valor histórico para a pasta `docs/`.

**Project Type:** WEB

**Success Criteria:**
1. A raiz do repositório (`f:\VSCode\Landpage\`) deve conter apenas arquivos essenciais de configuração, infraestrutura (`docker-compose.yml`), documentação principal (`README.md`) e os subdiretórios principais (`.agent`, `docs`, `server`, `themes`, `public`).
2. Nenhum script Python (`.py`) temporário deve permanecer na raiz.
3. Arquivos de log e testes rápidos (`.txt`, `.json`, `.js`) serão avaliados e, em sua maioria, deletados.
4. Assets e mídias soltas/não utilizadas serão limpos.

**Tech Stack:** N/A (Operação de limpeza de repositório via Bash/Glob)

**File Structure (Antes e Depois Previsto):**
*Antes:* Raiz poluída com mais de 15+ arquivos avulsos (`.py`, `.txt`, `.md`, `.json`, `.js`, `.html`).
*Depois:*
- Pasta `docs/` consolidando a documentação útil e antigos dumps.
- Raiz limpa, com foco apenas nas pastas fundamentais (`themes`, `server`, `.agent`, etc.).

---

## Task Breakdown

### Task 1: Limpeza de Scripts Temporários
* **Agent:** `backend-specialist` (ou qualquer dev que execute Shell/Bash)
* **Skills:** `bash-linux` / `powershell-windows`
* **Priority:** P1
* **INPUT → OUTPUT → VERIFY:**
    * **Input:** Encontrar arquivos `fix_*.py`, `test-db.js` e similares na raiz.
    * **Output:** Arquivos excluídos via `Remove-Item` (PowerShell). Arquivos a excluir: `fix_footer_targets.py`, `fix_hicks.py`, `fix_labels.py`, `fix_team_alt.py`, `fix_ux.py`, `test-db.js`.
    * **Verify:** A raiz do projeto não deve conter nenhum dos scripts `.py` ou `.js` mencionados acima.

### Task 2: Higienização de Relatórios e Dumps
* **Agent:** `backend-specialist`
* **Skills:** `documentation-templates`
* **Priority:** P2
* **INPUT → OUTPUT → VERIFY:**
    * **Input:** Arquivos como `diff.txt`, `hamburgueria_audit.txt`, `restaurante_audit.txt`, `ux_audit_results.json`, `audit_performance.md`, `audit_ux.md`.
    * **Output:** Mover os relatórios úteis (como os `.md` e os arquivos `.json`/`_audit.txt`) para um subdiretório `docs/audits/` ou `docs/legacy/`. Deletar o restante inútil.
    * **Verify:** Garantir que a raiz não liste arquivos `.txt` ou `.json` soltos focados em auditorias descartáveis.

### Task 3: Limpeza do Frontend Legado na Raiz
* **Agent:** `frontend-specialist`
* **Skills:** N/A
* **Priority:** P2
* **INPUT → OUTPUT → VERIFY:**
    * **Input:** Arquivos antigos do frontend soltos na raiz, como `index.html`, `styles.css`, `scripts.js`, `preview.png`.
    * **Output:** Avaliar se estão completamente desacoplados (já que agora usamos a pasta `themes/`). Caso positivo, deletá-los. Se fizerem parte da demo/public legacy, movê-los ou excluí-los conforme política da pasta `public/`.
    * **Verify:** A raiz não deve conter arquivos `.html`, `.css` ou imagens `.png` perdidos.

### Task 4: Limpeza de Assets não utilizados
* **Agent:** `frontend-specialist`
* **Priority:** P3
* **INPUT → OUTPUT → VERIFY:**
    * **Input:** Pastas como `assets/` na raiz ou varredura por imagens pesadas fora do seu local ideal.
    * **Output:** Deletar `assets/` se todo o necessário já consta nos `themes/` ou `public/`.
    * **Verify:** Nenhuma pasta legada de imagens soltas na raiz.

---

## ✅ Phase X: Verification

- [ ] `Get-ChildItem -File` na raiz do repositório lista apenas arquivos essenciais (ex: `README.md`, `docker-compose.yml`, `.gitignore`, `.env.example`, `PROJETO_MAPA.canvas`, `deploy_client.md`).
- [ ] O projeto continua realizando o build e injetando o tema corretamente: `npm run dev` na raiz ou no server.
- [ ] O servidor Prisma e Next/Node roda sem falta de dependências soltas.
