import { pgTable, uuid, varchar, text, numeric, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces.js";

export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull(),
  description: text("description"),
  systemPrompt: text("system_prompt").notNull(),
  defaultModel: varchar("default_model", { length: 64 }).default("gemini-1.5-flash").notNull(),
  temperature: numeric("temperature", { precision: 3, scale: 2 }).default("0.70").notNull(),
  topP: numeric("top_p", { precision: 3, scale: 2 }).default("0.95").notNull(),
  maxTokens: integer("max_tokens").default(2048).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_agents_ws_slug").on(table.workspaceId, table.slug),
]);

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
