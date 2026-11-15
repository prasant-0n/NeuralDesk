# 07. DevOps — 100% Zero-Cost Cloud Deployment Runbook

[← Back to Documentation Portal](../README.md) | [← CI/CD Pipeline](./ci-cd-pipeline.md) | [Next Section: Testing →](../08-testing/strategy.md)

---

## 3.1 Zero-Cost Production Hosting Matrix

| Subsystem | Production Cloud Host | Free Tier Allocation | Cold-Start Mitigation |
| :--- | :--- | :--- | :--- |
| **Frontend Web Canvas** | **Vercel** / Cloudflare Pages | Unlimited requests, 100GB monthly bandwidth, global edge CDN. | None required (instant Edge distribution). |
| **Backend REST & SSE API** | **Render** / Railway / Fly.io | 512 MB RAM, 0.1 vCPU, 750 free instance hours per month. | Health keep-alive cron ping every 14 minutes to prevent container spin-down. |
| **Database & Pooling** | **Neon Serverless PostgreSQL** | 0.5 GiB storage, pooled serverless HTTP connection endpoints. | Serverless pooling wakes up in < 250ms on cold connection. |
| **AI Inference Engine** | **Google Gemini Free Tier** | 15 Requests/Min (RPM), 1,000,000 Tokens/Min (TPM), 1,500 Requests/Day (RPD) on Gemini 1.5/2.0 Flash. | Automatic switch to Deterministic Mock Simulation when rate limits are approached. |

---

## 3.2 Step-by-Step Zero-Cost Deployment Runbook

### Step 1: Provision Free Serverless Database on Neon
1. Create a free account at [neon.tech](https://neon.tech).
2. Create project `neuraldesk-prod` and copy the connection string:
   `DATABASE_URL=postgresql://user:pass@ep-prod-12345.us-east-2.aws.neon.tech/neondb?sslmode=require`
3. Push database schema:
   `pnpm --filter=@neuraldesk/db drizzle-kit push`

### Step 2: Deploy Backend API on Render
1. Create a Web Service connected to your GitHub repository.
2. Select Docker runtime using `docker/Dockerfile.api`.
3. Add environment variables:
   * `DATABASE_URL` = Neon connection string
   * `GEMINI_API_KEY` = Google AI Studio API key
   * `ENCRYPTION_MASTER_KEY` = 64-character hex string
   * `WEBHOOK_SECRET_SALT` = Random 32-character string
   * `CORS_ORIGIN` = `https://neuraldesk.vercel.app`
4. Set health check path to `/api/health`.

### Step 3: Deploy Frontend Canvas on Vercel
1. Import repository on [vercel.com](https://vercel.com).
2. Set root directory to `apps/web`.
3. Configure environment variable:
   * `NEXT_PUBLIC_API_URL` = `https://neuraldesk-api.onrender.com`
4. Click Deploy.

---

[← Previous: CI/CD Pipeline](./ci-cd-pipeline.md) | [Next Section: Testing →](../08-testing/strategy.md)
