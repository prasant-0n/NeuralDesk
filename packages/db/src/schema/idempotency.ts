import { pgTable, uuid, varchar, jsonb, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces.js";
import { executions } from "./executions.js";

export type IdempotencyStatus = "pending" | "resolved" | "failed";

export const idempotencyKeys = pgTable("idempotency_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }).notNull(),
  idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull(),
  executionId: uuid("execution_id").references(() => executions.id, { onDelete: "set null" }),
  status: varchar("status", { length: 32 }).$type<IdempotencyStatus>().default("pending").notNull(),
  responsePayload: jsonb("response_payload").$type<Record<string, unknown>>(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_idempotency_ws_key").on(table.workspaceId, table.idempotencyKey),
  index("idx_idempotency_expires_at").on(table.expiresAt),
]);

export type IdempotencyKey = typeof idempotencyKeys.$inferSelect;
export type NewIdempotencyKey = typeof idempotencyKeys.$inferInsert;
