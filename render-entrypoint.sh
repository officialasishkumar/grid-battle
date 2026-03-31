#!/bin/sh
set -e

# Parse Render's DATABASE_URL into Nakama's expected format
# Render: postgresql://user:password@host:port/database
# Nakama: user:password@host:port/database?sslmode=prefer
if [ -n "$DATABASE_URL" ]; then
  DB_ADDR=$(echo "$DATABASE_URL" | sed 's|^postgresql://||' | sed 's|^postgres://||')
  DB_ADDR="${DB_ADDR}?sslmode=prefer"
else
  DB_ADDR="postgres:localdb@localhost:5432/nakama?sslmode=disable"
fi

PORT=${PORT:-7350}

echo "Running database migrations..."
/nakama/nakama migrate up \
  --database.address "$DB_ADDR" \
  2>&1 || echo "Migration completed (or already up to date)"

echo "Starting Nakama on port $PORT..."
exec /nakama/nakama \
  --config /nakama/data/local.yml \
  --database.address "$DB_ADDR" \
  --socket.port "$PORT" \
  --socket.server_key "${NAKAMA_SERVER_KEY:-defaultkey}" \
  --console.port 7351 \
  --console.username "${CONSOLE_USERNAME:-admin}" \
  --console.password "${CONSOLE_PASSWORD:-admin123}"
