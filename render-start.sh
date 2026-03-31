#!/bin/bash
set -e

DB_ADDR=$(echo "$DATABASE_URL" | sed 's|^postgresql://||' | sed 's|^postgres://||')

exec ./nakama \
  --config backend/local.yml \
  --database.address "${DB_ADDR}?sslmode=prefer" \
  --socket.port "${PORT:-7350}" \
  --socket.server_key "${NAKAMA_SERVER_KEY:-defaultkey}" \
  --console.port 7351 \
  --console.username "${CONSOLE_USERNAME:-admin}" \
  --console.password "${CONSOLE_PASSWORD:-gridbattle2024}"
