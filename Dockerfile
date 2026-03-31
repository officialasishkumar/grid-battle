# Stage 1: Build backend JavaScript modules
FROM node:20-alpine AS builder

WORKDIR /build

COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend/src ./src
COPY backend/tsconfig.json backend/rollup.config.mjs ./
RUN npm run build

# Stage 2: Nakama server with game modules
FROM registry.heroiclabs.com/heroiclabs/nakama:3.24.2

# Copy built modules
COPY --from=builder /build/build/ /nakama/data/modules/
COPY backend/local.yml /nakama/data/local.yml
COPY render-entrypoint.sh /nakama/render-entrypoint.sh

USER root
RUN chmod +x /nakama/render-entrypoint.sh
USER nakama

ENTRYPOINT ["/nakama/render-entrypoint.sh"]
