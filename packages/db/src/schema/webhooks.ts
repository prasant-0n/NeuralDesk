import { pgTable, uuid, varchar, text, boolean, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { workflows } from "./workflows.js";

export const webhooks = pgTable("webhooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id").references(() => workflows.id, { onDelete: "cascade" }).notNull(),
  urlToken: varchar("url_token", { length: 64 }).notNull().unique(),
  secretHash: text("secret_hash").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastTriggeredAt: timestamp("last_triggered_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("idx_webhooks_token").on(table.urlToken),
  index("idx_webhooks_workflow_id").on(table.workflowId),
]);

export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;
