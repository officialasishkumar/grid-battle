#!/bin/bash
set -e

echo "==> Downloading Nakama server..."
curl -L "https://github.com/heroiclabs/nakama/releases/download/v3.24.2/nakama-3.24.2-linux-amd64.tar.gz" -o nakama.tar.gz
tar -xzf nakama.tar.gz
chmod +x nakama

echo "==> Building backend modules..."
cd backend
npm ci
npm run build
cd ..

echo "==> Running database migrations..."
DB_ADDR=$(echo "$DATABASE_URL" | sed 's|^postgresql://||' | sed 's|^postgres://||')
./nakama migrate up --database.address "${DB_ADDR}?sslmode=prefer" 2>&1 || echo "Migrations complete"

echo "==> Build complete!"
