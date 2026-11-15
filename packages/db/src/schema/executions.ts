import { pgTable, uuid, varchar, text, integer, numeric, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { workflows } from "./workflows.js";
import { workflowVersions } from "./workflow-versions.js";

export type ExecutionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "waiting_for_approval";

export type TriggerType = "manual" | "api" | "webhook" | "cron" | "event";
export type ExecutionMode = "live" | "mock";

export const executions = pgTable("executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id").references(() => workflows.id, { onDelete: "cascade" }).notNull(),
  workflowVersionId: uuid("workflow_version_id").references(() => workflowVersions.id, { onDelete: "set null" }),
  triggeredBy: uuid("triggered_by").references(() => users.id, { onDelete: "set null" }),
  status: varchar("status", { length: 32 }).$type<ExecutionStatus>().default("pending").notNull(),
  triggerType: varchar("trigger_type", { length: 32 }).$type<TriggerType>().default("manual").notNull(),
  triggerPayload: jsonb("trigger_payload").$type<Record<string, unknown>>().default({}).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  durationMs: integer("duration_ms").default(0).notNull(),
  totalTokens: integer("total_tokens").default(0).notNull(),
  promptTokens: integer("prompt_tokens").default(0).notNull(),
  completionTokens: integer("completion_tokens").default(0).notNull(),
  totalCostUsd: numeric("total_cost_usd", { precision: 10, scale: 6 }).default("0.000000").notNull(),
  errorMessage: text("error_message"),
  executionMode: varchar("execution_mode", { length: 16 }).$type<ExecutionMode>().default("live").notNull(),
}, (table) => [
  index("idx_executions_workflow_id").on(table.workflowId),
  index("idx_executions_status").on(table.status),
  index("idx_executions_wf_status_started").on(table.workflowId, table.status, table.startedAt),
]);

export type Execution = typeof executions.$inferSelect;
export type NewExecution = typeof executions.$inferInsert;
