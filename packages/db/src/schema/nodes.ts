import { pgTable, uuid, varchar, numeric, jsonb, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { workflowVersions } from "./workflow-versions.js";

export const nodes = pgTable("nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowVersionId: uuid("workflow_version_id").references(() => workflowVersions.id, { onDelete: "cascade" }).notNull(),
  nodeKey: varchar("node_key", { length: 64 }).notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  positionX: numeric("position_x", { precision: 10, scale: 2 }).notNull(),
  positionY: numeric("position_y", { precision: 10, scale: 2 }).notNull(),
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  inputs: jsonb("inputs").$type<Record<string, unknown>>().default({}).notNull(),
  outputs: jsonb("outputs").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_nodes_version_id").on(table.workflowVersionId),
  uniqueIndex("idx_nodes_key_version").on(table.workflowVersionId, table.nodeKey),
]);

export type NodeRecord = typeof nodes.$inferSelect;
export type NewNodeRecord = typeof nodes.$inferInsert;
