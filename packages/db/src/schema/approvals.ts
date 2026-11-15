import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { executions } from "./executions.js";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "modified";

export const approvals = pgTable("approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  executionId: uuid("execution_id").references(() => executions.id, { onDelete: "cascade" }).notNull(),
  nodeKey: varchar("node_key", { length: 64 }).notNull(),
  status: varchar("status", { length: 32 }).$type<ApprovalStatus>().default("pending").notNull(),
  promptReview: text("prompt_review"),
  llmOutputReview: text("llm_output_review"),
  modifiedOutput: text("modified_output"),
  reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_approvals_execution_id").on(table.executionId),
  index("idx_approvals_status").on(table.status),
]);

export type Approval = typeof approvals.$inferSelect;
export type NewApproval = typeof approvals.$inferInsert;
