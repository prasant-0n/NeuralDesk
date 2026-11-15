import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { workflowVersions } from "./workflow-versions.js";

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
}, (table) => [
  index("idx_edges_version_id").on(table.workflowVersionId),
]);

export type EdgeRecord = typeof edges.$inferSelect;
export type NewEdgeRecord = typeof edges.$inferInsert;
