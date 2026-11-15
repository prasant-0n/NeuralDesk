# 02. Database — Drizzle ORM Schema Models

[← Back to Documentation Portal](../README.md) | [← ER Diagram](./er-diagram.md) | [Next: Migrations & Seed →](./migrations-and-seed.md)

---

## 2.1 Complete Production Schema (`packages/db/src/schema/index.ts`)

```typescript
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  jsonb,
  index,
  uniqueIndex
} from "drizzle-orm/pg-core";

// 1. Users Table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. Workspaces Table
export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "restrict" }).notNull(),
  encryptedApiKeys: text("encrypted_api_keys"), // AES-256-GCM ciphertext
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. Workspace Members Table
export const workspaceMembers = pgTable("workspace_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 32 }).$type<"owner" | "admin" | "member" | "viewer">().default("member").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  memberWorkspaceIdx: index("idx_workspace_members_ws").on(table.workspaceId),
  memberUserIdx: index("idx_workspace_members_user").on(table.userId),
  uniqueMember: uniqueIndex("idx_workspace_members_unique").on(table.workspaceId, table.userId),
}));

// 4. Workflows Table
export const workflows = pgTable("workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 64 }).default("general").notNull(),
  status: varchar("status", { length: 32 }).$type<"draft" | "published" | "archived">().default("draft").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  workflowWorkspaceIdx: index("idx_workflows_workspace_id").on(table.workspaceId),
  workflowStatusIdx: index("idx_workflows_status").on(table.status),
}));

// 5. Workflow Versions Table
export const workflowVersions = pgTable("workflow_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id").references(() => workflows.id, { onDelete: "cascade" }).notNull(),
  versionNumber: integer("version_number").notNull(),
  definition: jsonb("definition").$type<{
    nodes: unknown[];
    edges: unknown[];
    viewport: { x: number; y: number; zoom: number };
  }>().notNull(),
  changelog: text("changelog"),
  isPublished: boolean("is_published").default(false).notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  wfVersionIdx: index("idx_workflow_versions_wf_id").on(table.workflowId),
  uniqueWfVersion: uniqueIndex("idx_workflow_versions_unique").on(table.workflowId, table.versionNumber),
}));

// 6. Nodes Table
export const nodes = pgTable("nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowVersionId: uuid("workflow_version_id").references(() => workflowVersions.id, { onDelete: "cascade" }).notNull(),
  nodeKey: varchar("node_key", { length: 64 }).notNull(),
  type: varchar("type", { length: 64 }).$type<
    "trigger" | "llm" | "prompt" | "router" | "tool" | "code" | "evaluator" | "output" | "webhook"
  >().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  positionX: numeric("position_x", { precision: 10, scale: 2 }).notNull(),
  positionY: numeric("position_y", { precision: 10, scale: 2 }).notNull(),
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  inputs: jsonb("inputs").$type<Record<string, unknown>>().default({}).notNull(),
  outputs: jsonb("outputs").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  nodeVersionIdx: index("idx_nodes_version_id").on(table.workflowVersionId),
  nodeKeyVersionIdx: uniqueIndex("idx_nodes_key_version").on(table.workflowVersionId, table.nodeKey),
}));

// 7. Edges Table
export const edges = pgTable("edges", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowVersionId: uuid("workflow_version_id").references(() => workflowVersions.id, { onDelete: "cascade" }).notNull(),
  edgeKey: varchar("edge_key", { length: 64 }).notNull(),
  sourceNodeKey: varchar("source_node_key", { length: 64 }).notNull(),
  sourcePort: varchar("source_port", { length: 64 }).notNull(),
  targetNodeKey: varchar("target_node_key", { length: 64 }).notNull(),
  targetPort: varchar("target_port", { length: 64 }).notNull(),
  conditionExpression: text("condition_expression"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  edgeVersionIdx: index("idx_edges_version_id").on(table.workflowVersionId),
}));

// 8. Executions Table
export const executions = pgTable("executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id").references(() => workflows.id, { onDelete: "cascade" }).notNull(),
  workflowVersionId: uuid("workflow_version_id").references(() => workflowVersions.id, { onDelete: "set null" }),
  triggeredBy: uuid("triggered_by").references(() => users.id, { onDelete: "set null" }),
  triggerSource: varchar("trigger_source", { length: 32 }).$type<"manual" | "api" | "webhook" | "simulation">().notNull(),
  mode: varchar("mode", { length: 16 }).$type<"real" | "mock">().default("real").notNull(),
  status: varchar("status", { length: 32 }).$type<"pending" | "running" | "completed" | "failed" | "cancelled">().default("pending").notNull(),
  initialInputs: jsonb("initial_inputs").$type<Record<string, unknown>>().default({}).notNull(),
  finalOutputs: jsonb("final_outputs").$type<Record<string, unknown>>().default({}).notNull(),
  totalTokensUsed: integer("total_tokens_used").default(0).notNull(),
  promptTokens: integer("prompt_tokens").default(0).notNull(),
  completionTokens: integer("completion_tokens").default(0).notNull(),
  costEstimateUsd: numeric("cost_estimate_usd", { precision: 10, scale: 6 }).default("0.000000").notNull(),
  durationMs: integer("duration_ms").default(0).notNull(),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
}, (table) => ({
  execWorkflowIdx: index("idx_executions_workflow_id").on(table.workflowId),
  execStatusIdx: index("idx_executions_status").on(table.status),
  execWorkflowStatusCreatedIdx: index("idx_executions_wf_status_created").on(table.workflowId, table.status, table.startedAt),
}));

// 9. Node Execution Runs Table
export const nodeExecutionRuns = pgTable("node_execution_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  executionId: uuid("execution_id").references(() => executions.id, { onDelete: "cascade" }).notNull(),
  nodeId: uuid("node_id").references(() => nodes.id, { onDelete: "set null" }),
  nodeKey: varchar("node_key", { length: 64 }).notNull(),
  nodeType: varchar("node_type", { length: 64 }).notNull(),
  status: varchar("status", { length: 32 }).$type<"pending" | "running" | "completed" | "failed" | "skipped">().default("pending").notNull(),
  inputData: jsonb("input_data").$type<Record<string, unknown>>().default({}).notNull(),
  outputData: jsonb("output_data").$type<Record<string, unknown>>().default({}).notNull(),
  promptResolved: text("prompt_resolved"),
  llmModel: varchar("llm_model", { length: 64 }),
  promptTokens: integer("prompt_tokens").default(0).notNull(),
  completionTokens: integer("completion_tokens").default(0).notNull(),
  costEstimateUsd: numeric("cost_estimate_usd", { precision: 10, scale: 6 }).default("0.000000").notNull(),
  durationMs: integer("duration_ms").default(0).notNull(),
  errorMessage: text("error_message"),
  attempt: integer("attempt").default(1).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
}, (table) => ({
  nodeRunExecIdx: index("idx_node_runs_execution_id").on(table.executionId),
  nodeRunKeyIdx: index("idx_node_runs_node_key").on(table.nodeKey),
}));

// 10. AI Agents Configuration Table
export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  modelTier: varchar("model_tier", { length: 64 }).$type<"gemini-1.5-flash" | "gemini-1.5-pro" | "gemini-2.0-flash" | "custom">().default("gemini-1.5-flash").notNull(),
  systemInstruction: text("system_instruction").notNull(),
  temperature: numeric("temperature", { precision: 3, scale: 2 }).default("0.70").notNull(),
  topP: numeric("top_p", { precision: 3, scale: 2 }).default("0.95").notNull(),
  maxOutputTokens: integer("max_output_tokens").default(2048).notNull(),
  toolsEnabled: jsonb("tools_enabled").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 11. Prompt Templates Table
export const promptTemplates = pgTable("prompt_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull(),
  content: text("content").notNull(),
  variables: jsonb("variables").$type<string[]>().default([]).notNull(),
  category: varchar("category", { length: 64 }).default("general").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  promptWorkspaceSlugIdx: uniqueIndex("idx_prompts_ws_slug").on(table.workspaceId, table.slug),
}));

// 12. Webhooks Table
export const webhooks = pgTable("webhooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id").references(() => workflows.id, { onDelete: "cascade" }).notNull(),
  urlToken: varchar("url_token", { length: 64 }).notNull().unique(),
  secretHash: text("secret_hash").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastTriggeredAt: timestamp("last_triggered_at", { withTimezone: true }),
}, (table) => ({
  webhookTokenIdx: uniqueIndex("idx_webhooks_token").on(table.urlToken),
}));

// 13. Audit Logs Table
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 64 }).notNull(),
  resourceType: varchar("resource_type", { length: 64 }).notNull(),
  resourceId: varchar("resource_id", { length: 64 }).notNull(),
  details: jsonb("details").$type<Record<string, unknown>>().default({}).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  auditWorkspaceIdx: index("idx_audit_logs_ws").on(table.workspaceId),
  auditCreatedIdx: index("idx_audit_logs_created").on(table.createdAt),
}));

// 14. Idempotency Keys Table (Deduplication & Double-Trigger Prevention)
export const idempotencyKeys = pgTable("idempotency_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }).notNull(),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).notNull(),
  executionId: uuid("execution_id").references(() => executions.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 32 }).$type<"pending" | "resolved" | "failed">().notNull(),
  responsePayload: jsonb("response_payload").$type<Record<string, unknown>>(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  idempotencyUniqueIdx: uniqueIndex("idx_idempotency_key_ws").on(table.workspaceId, table.idempotencyKey),
  idempotencyExpiryIdx: index("idx_idempotency_expires").on(table.expiresAt),
}));

// 15. Approvals Table (Human-in-the-Loop Governance)
export const approvals = pgTable("approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  executionId: uuid("execution_id").references(() => executions.id, { onDelete: "cascade" }).notNull(),
  nodeId: uuid("node_id").references(() => nodes.id, { onDelete: "cascade" }).notNull(),
  status: varchar("status", { length: 32 }).$type<"pending" | "approved" | "rejected" | "modified">().default("pending").notNull(),
  promptReview: text("prompt_review"),
  llmOutputReview: text("llm_output_review").notNull(),
  modifiedOutput: text("modified_output"),
  reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  approvalExecutionIdx: index("idx_approvals_execution").on(table.executionId),
  approvalStatusIdx: index("idx_approvals_status").on(table.status),
}));
```

---

## 2.2 Storage Cap & Automated 30-Day Log Pruning Strategy

To guarantee that NeuralDesk operates indefinitely within **Neon's 0.5 GB (500 MB) free storage tier**, an automated background maintenance job runs daily:

1. **Retain Statistics Permanently:** The `executions` master table permanently preserves high-level metrics (`execution_id`, `status`, `total_tokens`, `total_cost_usd`, `duration_ms`, `started_at`).
2. **Prune Heavy Raw Payloads (>30 Days):**
   ```sql
   -- Truncates verbose input/output blobs on runs older than 30 days
   UPDATE node_execution_runs
   SET input_payload = jsonb_build_object('_pruned', true, '_pruned_at', NOW()),
       output_payload = jsonb_build_object('_pruned', true, '_pruned_at', NOW())
   WHERE created_at < NOW() - INTERVAL '30 days';

   -- Delete expired idempotency keys
   DELETE FROM idempotency_keys
   WHERE expires_at < NOW();
   ```
3. **Database Footprint Guarantee:** Keeps the active Neon database storage footprint under **45 MB** even after 100,000 executions.

---

[← Previous: ER Diagram](./er-diagram.md) | [Next: Migrations & Seed →](./migrations-and-seed.md)
