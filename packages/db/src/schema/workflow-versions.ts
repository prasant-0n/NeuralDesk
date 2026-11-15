import { pgTable, uuid, integer, jsonb, text, boolean, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { workflows } from "./workflows.js";

export interface WorkflowCanvasDefinition {
  nodes: unknown[];
  edges: unknown[];
  viewport: { x: number; y: number; zoom: number };
}

export const workflowVersions = pgTable("workflow_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id").references(() => workflows.id, { onDelete: "cascade" }).notNull(),
  versionNumber: integer("version_number").notNull(),
  definition: jsonb("definition").$type<WorkflowCanvasDefinition>().notNull(),
  changelog: text("changelog"),
  isPublished: boolean("is_published").default(false).notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_workflow_versions_wf_id").on(table.workflowId),
  uniqueIndex("idx_workflow_versions_unique").on(table.workflowId, table.versionNumber),
]);

export type WorkflowVersion = typeof workflowVersions.$inferSelect;
export type NewWorkflowVersion = typeof workflowVersions.$inferInsert;
