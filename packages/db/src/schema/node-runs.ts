import { pgTable, uuid, varchar, text, integer, numeric, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { executions } from "./executions.js";
import { nodes } from "./nodes.js";

export type NodeRunStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped"
  | "waiting_for_approval";

export const nodeExecutionRuns = pgTable("node_execution_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  executionId: uuid("execution_id").references(() => executions.id, { onDelete: "cascade" }).notNull(),
  nodeId: uuid("node_id").references(() => nodes.id, { onDelete: "set null" }),
  nodeKey: varchar("node_key", { length: 64 }).notNull(),
  nodeType: varchar("node_type", { length: 64 }).notNull(),
  status: varchar("status", { length: 32 }).$type<NodeRunStatus>().default("pending").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  durationMs: integer("duration_ms").default(0).notNull(),
  inputPayload: jsonb("input_payload").$type<Record<string, unknown>>().default({}).notNull(),
  outputPayload: jsonb("output_payload").$type<Record<string, unknown>>().default({}).notNull(),
  errorDetails: text("error_details"),
  tokensUsed: integer("tokens_used").default(0).notNull(),
  costUsd: numeric("cost_usd", { precision: 10, scale: 6 }).default("0.000000").notNull(),
  finishReason: varchar("finish_reason", { length: 64 }),
}, (table) => [
  index("idx_node_runs_execution_id").on(table.executionId),
  index("idx_node_runs_node_key").on(table.nodeKey),
]);

export type NodeExecutionRun = typeof nodeExecutionRuns.$inferSelect;
export type NewNodeExecutionRun = typeof nodeExecutionRuns.$inferInsert;
