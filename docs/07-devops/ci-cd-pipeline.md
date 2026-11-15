# 07. DevOps — GitHub Actions CI/CD Pipeline

[← Back to Documentation Portal](../README.md) | [← Docker](./docker.md) | [Next: Zero-Cost Deployment →](./zero-cost-deployment.md)

---

## 2.1 Quality Gate Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI & Quality Gate

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    name: Lint, Typecheck & Vitest
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20 & pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Linting Check
        run: pnpm run lint

      - name: Strict Typecheck
        run: pnpm run typecheck

      - name: Run Vitest Unit & Integration Suites
        run: pnpm run test:unit --coverage

      - name: Install Playwright Browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: Run Playwright E2E Tests
        run: pnpm run test:e2e
        env:
          GEMINI_API_KEY: mock_key_for_ci
          NODE_ENV: test
```

---

[← Previous: Docker](./docker.md) | [Next: Zero-Cost Deployment →](./zero-cost-deployment.md)
