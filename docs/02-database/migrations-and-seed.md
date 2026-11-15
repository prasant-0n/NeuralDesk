# 02. Database — Migrations, Connection Pooling & Seed Data

[← Back to Documentation Portal](../README.md) | [← Schema Models](./schema-models.md) | [Next Section: API →](../03-api/rest-specification.md)

---

## 3.1 Database Connection Factory (`packages/db/src/client.ts`)

```typescript
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { createClient } from "@libsql/client";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import * as schema from "./schema";

export function createDbClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  // SQLite / Turso Detection
  if (connectionString.startsWith("file:") || connectionString.startsWith("libsql:")) {
    const client = createClient({
      url: connectionString,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    return drizzleLibsql(client, { schema });
  }

  // Neon PostgreSQL Serverless Pooling (HTTP)
  neonConfig.fetchConnectionCache = true;
  const sql = neon(connectionString);
  return drizzleNeon(sql, { schema });
}

export const db = createDbClient();
```

---

## 3.2 Migration Workflows

Drizzle Kit manages versioned database migrations:

```bash
# 1. Generate SQL migration files from schema definition
pnpm --filter=@neuraldesk/db drizzle-kit generate

# 2. Apply migrations directly to Neon Serverless database
pnpm --filter=@neuraldesk/db drizzle-kit migrate

# 3. Fast schema push for local rapid prototyping
pnpm --filter=@neuraldesk/db drizzle-kit push

# 4. Open interactive visual database studio
pnpm --filter=@neuraldesk/db drizzle-kit studio
```

---

## 3.3 Reference Workflows Seed Data

On initial boot, the seed script (`packages/db/src/seed.ts`) provisions three reference workflows:

1. **Customer Support Triage & Sentiment Escalation:**
   * Nodes: `WebhookTrigger` -> `PromptNode` -> `GeminiFlashLLM` -> `ConditionNode` -> (`SlackAlertTool` | `PostgresStore`)
2. **Multi-Source Market Research Synthesizer:**
   * Nodes: `ManualTrigger` -> `NewsApiTool` -> `PromptNode` -> `GeminiProLLM` -> `MarkdownOutput`
3. **Structured Lead Information Extraction:**
   * Nodes: `WebhookTrigger` -> `GeminiFlashLLM (JSON Mode)` -> `TransformNode` -> `WebhookPostTool`

---

[← Previous: Schema Models](./schema-models.md) | [Next Section: API →](../03-api/rest-specification.md)
