# NeuralDesk — Zero-Cost Production Deployment & Operations Guide

## 1. High-Level Architecture Overview

NeuralDesk is engineered for 100% reproducible, zero-cost cloud deployment across modern serverless edge and containerized platforms:

```
                                  ┌───────────────────────────────┐
                                  │      Client Web Browser       │
                                  └───────────────┬───────────────┘
                                                  │
                                                  │ HTTPS
                                                  ▼
                        ┌───────────────────────────────────────────────────┐
                        │              Edge CDN (Zero-Cost)                 │
                        │       Vercel / Cloudflare Pages / Nginx           │
                        │             (React 18 SPA Assets)                 │
                        └─────────────────────────┬─────────────────────────┘
                                                  │
                                                  │ /api/v1/ (REST & SSE Stream)
                                                  ▼
                        ┌───────────────────────────────────────────────────┐
                        │             API Backend Service                   │
                        │         Render / Railway / Fly.io                 │
                        │        (Node 20 Alpine Hono Container)            │
                        └─────────────────────────┬─────────────────────────┘
                                                  │
                                                  │ Pooled TLS Connections
                                                  ▼
                        ┌───────────────────────────────────────────────────┐
                        │             Serverless Database                   │
                        │         Neon Serverless PostgreSQL                │
                        │       (Autoscaling to zero compute)               │
                        └───────────────────────────────────────────────────┘
```

---

## 2. Local Containerized Orchestration (`docker compose`)

To boot the complete NeuralDesk stack (PostgreSQL 16, Hono API Engine, and Nginx Web Client) locally in containerized isolation:

```bash
# Build and start all orchestrated services
docker compose up --build -d

# Check live health status of containers
docker compose ps

# Follow structured API server logs
docker compose logs -f api

# Tear down services and retain volume data
docker compose down
```

### Port Mappings & Endpoints:
- **Web UI**: [http://localhost:3000](http://localhost:3000)
- **API Engine**: [http://localhost:3001](http://localhost:3001)
- **Health Probe**: [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health) (or `/api/health`, `/health`)
- **PostgreSQL**: `localhost:5432` (`postgres:postgres`, DB: `neuraldesk_dev`)

---

## 3. Automated CI/CD Pipeline (GitHub Actions)

The repository includes a four-tier automated GitHub Actions workflow defined in `.github/workflows/ci.yml`:

1. **`lint-and-typecheck`**:
   - Executes `pnpm --recursive typecheck` across all packages (`@neuraldesk/shared`, `@neuraldesk/db`, `@neuraldesk/api`, `@neuraldesk/web`).
2. **`test-unit-integration`**:
   - Executes 84 unit and integration tests across contracts, schemas, DAG algorithms, execution engine, and REST/SSE routes via Vitest.
3. **`test-e2e`**:
   - Automatically installs headless Playwright Chromium and executes 5 critical user journey tests (Canvas rendering, edge validation, DAG execution, dark mode, multi-view navigation).
4. **`build`**:
   - Compiles production bundles and strictly validates that `apps/api/dist/index.js` and `apps/web/dist/index.html` artifacts exist.

---

## 4. Zero-Cost Cloud Deployment Blueprints

### Blueprint A: Web Client on Vercel (`vercel.json`)
The frontend client is pre-configured for zero-cost static edge hosting on Vercel:
- **Build Command**: `pnpm --filter @neuraldesk/shared build && pnpm --filter @neuraldesk/web build`
- **Output Directory**: `apps/web/dist`
- **Rewrites**: All virtual routes route to `/index.html` for client-side React routing; `/api/*` proxies to the backend API.
- **Security Headers**: HSTS, X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, CSP.

To deploy via Vercel CLI:
```bash
vercel deploy --prod
```

### Blueprint B: API Server on Render Free Tier (`render.yaml`)
NeuralDesk includes an Infrastructure-as-Code Blueprint (`render.yaml`) for deploying the API container and a managed PostgreSQL database on Render's Free Tier:
- Deploys multi-stage `Dockerfile.api`.
- Built-in zero-downtime health probing via `/api/v1/health`.
- Automatically provisions persistent PostgreSQL with zero configuration.

To deploy on Render:
1. Connect your GitHub repository to Render.
2. Select **Blueprints** and choose `render.yaml`.
3. Render automatically provisions the database and boots the web service.

### Blueprint C: Alternative API Hosting on Railway (`railway.json`)
For developers preferring Railway's developer experience:
- Configured via `railway.json` with Dockerfile builder.
- Configured health check path at `/api/v1/health` with automatic restart policy.

To deploy via Railway CLI:
```bash
railway up
```

### Blueprint D: Neon Serverless PostgreSQL Connection Pooling
For cloud deployments requiring serverless database scaling to 0:
1. Create a free database on [Neon.tech](https://neon.tech).
2. Copy your pooled connection string:
   ```
   DATABASE_URL="postgresql://[user]:[password]@[endpoint]-pooler.neon.tech/[dbname]?sslmode=require"
   ```
3. Set `DATABASE_POOL_SIZE=5` (for free tier compute limits).
4. Run migrations:
   ```bash
   pnpm db:migrate
   ```

---

## 5. Strict Zod Environment Variable Validation

Environment variables are validated strictly via `ServerEnvSchema` (`@neuraldesk/shared`):

| Variable | Required in Prod | Default / Value | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `development` / `production` | Execution mode |
| `PORT` | No | `3001` | HTTP listening port |
| `HOST` | No | `0.0.0.0` | Network bind address |
| `DATABASE_URL` | Yes | Local postgres fallback | PostgreSQL connection string |
| `DATABASE_POOL_SIZE` | No | `10` | Max connection pool capacity |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed browser origins |
| `JWT_SECRET` | Yes | Secure 32+ char string | Signing secret for session tokens |
| `ENCRYPTION_KEY` | Yes | 64-char hex string | AES-256-GCM BYOK encryption key |
| `WEBHOOK_SIGNING_SECRET` | No | 32-char string | Shared secret for HMAC-SHA256 |
| `GEMINI_API_KEY` | No (Mock fallback) | AI Studio key | Google Gemini API key |
| `MAX_CONCURRENT_EXECUTIONS` | No | `3` | Worker concurrency limit |
| `EXECUTION_TIMEOUT_MS` | No | `30000` | Max timeout per node execution |
