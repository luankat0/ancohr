#!/bin/bash

# Script auxiliar para migrations

case "$1" in
  generate)
    echo "🔄 Gerando nova migration..."
    pnpm typeorm migration:generate ./src/migrations/$2 -d src/config/typeorm.config.ts
    ;;
  run)
    echo "▶️  Executando migrations..."
    pnpm typeorm migration:run -d src/config/typeorm.config.ts
    ;;
  revert)
    echo "◀️  Revertendo última migration..."
    pnpm typeorm migration:revert -d src/config/typeorm.config.ts
    ;;
  show)
    echo "📋 Mostrando migrations..."
    pnpm typeorm migration:show -d src/config/typeorm.config.ts
    ;;
  *)
    echo "Uso: ./scripts/migrate.sh {generate|run|revert|show} [nome]"
    echo ""
    echo "Comandos:"
    echo "  generate <nome>  - Gera uma nova migration"
    echo "  run             - Executa migrations pendentes"
    echo "  revert          - Reverte a última migration"
    echo "  show            - Mostra status das migrations"
    exit 1
    ;;
esac