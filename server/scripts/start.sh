#!/bin/sh
# ==============================================
# Start script for Render deploy
# Tenta rodar migrations, mas NÃO falha se der timeout
# (comum no Neon free tier - advisory lock timeout)
# ==============================================

echo "🔄 Tentando aplicar migrations..."

npx prisma migrate deploy 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Migrations aplicadas com sucesso"
else
    echo "⚠️  Migrate retornou código $EXIT_CODE — continuando mesmo assim"
    echo "   (Se for timeout de advisory lock no Neon, rode migrations localmente)"
fi

echo "🚀 Iniciando servidor..."
exec node dist/index.js
