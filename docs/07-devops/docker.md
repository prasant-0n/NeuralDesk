# 07. DevOps — Multi-Stage Docker & Compose Orchestration

[← Back to Documentation Portal](../README.md) | [Next: CI/CD Pipeline →](./ci-cd-pipeline.md)

---

## 1.1 Production Backend Dockerfile (`docker/Dockerfile.api`)

```dockerfile
# Stage 1: Pruning
FROM node:20-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm turbo
COPY . .
RUN turbo prune --scope=@neuraldesk/api --docker

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=@neuraldesk/api...

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/package.json ./package.json

USER nodejs
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

CMD ["node", "dist/index.js"]
```

---

## 1.2 Local Developer Orchestration (`docker/docker-compose.yml`)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: neuraldesk-postgres
    restart: always
    environment:
      POSTGRES_USER: neuraldesk_user
      POSTGRES_PASSWORD: neuraldesk_password
      POSTGRES_DB: neuraldesk_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U neuraldesk_user -d neuraldesk_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: docker/Dockerfile.api
    container_name: neuraldesk-api
    restart: always
    environment:
      PORT: 4000
      NODE_ENV: development
      DATABASE_URL: postgresql://neuraldesk_user:neuraldesk_password@postgres:5432/neuraldesk_db
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      ENCRYPTION_MASTER_KEY: 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
      WEBHOOK_SECRET_SALT: dev_salt_123456789
      CORS_ORIGIN: http://localhost:3000
    ports:
      - "4000:4000"
    depends_on:
      postgres:
        condition: service_healthy

  web:
    build:
      context: .
      dockerfile: docker/Dockerfile.web
    container_name: neuraldesk-web
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - api

volumes:
  pgdata:
```

---

[Next: CI/CD Pipeline →](./ci-cd-pipeline.md)
