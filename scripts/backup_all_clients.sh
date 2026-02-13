#!/bin/bash
################################################################################
# Script de Backup Local - Todos os Clientes
#
# Cria dumps dos bancos de dados de todos os clientes usando pg_dump.
# Backups salvos em: $HOME/restaurant-backups/YYYY-MM-DD/
#
# Uso:
#   bash scripts/backup_all_clients.sh
#
# Automação (Windows Task Scheduler):
#   1. Abra Task Scheduler
#   2. Create Task → Triggers → Weekly, Sunday 3am
#   3. Actions → Start a program:
#      Program: C:\Program Files\Git\bin\bash.exe
#      Arguments: F:\VSCode\Landpage\scripts\backup_all_clients.sh
#
# Requer: PostgreSQL client (pg_dump) instalado
################################################################################

set -e  # Exit on error

BACKUP_ROOT="$HOME/restaurant-backups"
TODAY=$(date +%Y-%m-%d)
BACKUP_DIR="$BACKUP_ROOT/$TODAY"

echo "🗄️  BACKUP AUTOMÁTICO - $(date)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Criar diretório de backup
mkdir -p "$BACKUP_DIR"

# ====== LISTA DE CLIENTES ======
# Adicione aqui cada cliente conforme for vendendo.
# Formato: "nome-cliente|connection-string-do-neon"
#
# Para pegar a connection string:
#   1. Neon Dashboard → seu projeto → Connection Details
#   2. Copie "Pooled connection" (com -pooler)
#
# Exemplo:
#   CLIENTS=(
#     "restaurante-saborarte|postgresql://user:pass@ep-xxx-pooler.neon.tech/neondb?sslmode=require"
#     "pizzaria-napoli|postgresql://user:pass@ep-yyy-pooler.neon.tech/neondb?sslmode=require"
#   )

CLIENTS=(
  # "cliente-1|postgresql://user:pass@ep-xxx-pooler.neon.tech/neondb?sslmode=require"
  # "cliente-2|postgresql://user:pass@ep-yyy-pooler.neon.tech/neondb?sslmode=require"
)

# Se não tiver clientes cadastrados
if [ ${#CLIENTS[@]} -eq 0 ]; then
  echo "⚠️  Nenhum cliente cadastrado ainda."
  echo "   Edite este script e adicione na array CLIENTS."
  echo ""
  exit 0
fi

# Backup de cada cliente
SUCCESS_COUNT=0
FAIL_COUNT=0

for CLIENT_ENTRY in "${CLIENTS[@]}"; do
  IFS='|' read -r CLIENT_NAME DB_URL <<< "$CLIENT_ENTRY"
  
  echo "📦 Backup: $CLIENT_NAME"
  
  DUMP_FILE="$BACKUP_DIR/${CLIENT_NAME}.dump"
  
  if pg_dump "$DB_URL" -Fc -f "$DUMP_FILE" 2>/dev/null; then
    SIZE=$(du -h "$DUMP_FILE" | cut -f1)
    echo "   ✅ Sucesso! Tamanho: $SIZE"
    ((SUCCESS_COUNT++))
  else
    echo "   ❌ Falhou! Verifique a connection string."
    ((FAIL_COUNT++))
  fi
  
  echo ""
done

# Limpeza: manter apenas últimos 30 dias
echo "🧹 Limpando backups antigos (mantendo 30 dias)..."
find "$BACKUP_ROOT" -maxdepth 1 -type d -name "20*" -mtime +30 -exec rm -rf {} \;

# Resumo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ BACKUP CONCLUÍDO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Sucesso:   $SUCCESS_COUNT clientes"
echo "Falhas:    $FAIL_COUNT clientes"
echo "Salvos em: $BACKUP_DIR"
echo ""

# Verificar se pg_dump está instalado
if ! command -v pg_dump &> /dev/null; then
  echo "⚠️  ATENÇÃO: pg_dump não encontrado!"
  echo "   Instale o PostgreSQL client:"
  echo "   - Windows: https://www.postgresql.org/download/windows/"
  echo "   - Linux: sudo apt install postgresql-client"
  echo "   - Mac: brew install postgresql"
  echo ""
fi

# Restaurar um backup:
# pg_restore -d "postgresql://connection-string" backup.dump
