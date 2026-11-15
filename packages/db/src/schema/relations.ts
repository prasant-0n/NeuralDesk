import { relations } from "drizzle-orm";
import { users } from "./users.js";
import { workspaces } from "./workspaces.js";
import { workspaceMembers } from "./workspace-members.js";
import { workflows } from "./workflows.js";
import { workflowVersions } from "./workflow-versions.js";
import { nodes } from "./nodes.js";
import { edges } from "./edges.js";
import { executions } from "./executions.js";
import { nodeExecutionRuns } from "./node-runs.js";
import { approvals } from "./approvals.js";
import { idempotencyKeys } from "./idempotency.js";
import { agents } from "./agents.js";
import { promptTemplates } from "./prompt-templates.js";
import { webhooks } from "./webhooks.js";
import { auditLogs } from "./audit-logs.js";

// Users Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedWorkspaces: many(workspaces),
  memberships: many(workspaceMembers),
  createdWorkflows: many(workflows),
  createdVersions: many(workflowVersions),
  executions: many(executions),
  reviewedApprovals: many(approvals),
  auditLogs: many(auditLogs),
}));

// Workspaces Relations
export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id],
  }),
  members: many(workspaceMembers),
  workflows: many(workflows),
  agents: many(agents),
  promptTemplates: many(promptTemplates),
  idempotencyKeys: many(idempotencyKeys),
  auditLogs: many(auditLogs),
}));

// Workspace Members Relations
export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [workspaceMembers.userId],
    references: [users.id],
  }),
}));

// Workflows Relations
export const workflowsRelations = relations(workflows, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [workflows.workspaceId],
    references: [workspaces.id],
  }),
  author: one(users, {
    fields: [workflows.createdBy],
    references: [users.id],
  }),
  versions: many(workflowVersions),
  executions: many(executions),
  webhooks: many(webhooks),
}));

// Workflow Versions Relations
export const workflowVersionsRelations = relations(workflowVersions, ({ one, many }) => ({
  workflow: one(workflows, {
    fields: [workflowVersions.workflowId],
    references: [workflows.id],
  }),
  author: one(users, {
    fields: [workflowVersions.createdBy],
    references: [users.id],
  }),
  nodes: many(nodes),
  edges: many(edges),
  executions: many(executions),
}));

// Nodes Relations
export const nodesRelations = relations(nodes, ({ one, many }) => ({
  version: one(workflowVersions, {
    fields: [nodes.workflowVersionId],
    references: [workflowVersions.id],
  }),
  runs: many(nodeExecutionRuns),
}));

// Edges Relations
export const edgesRelations = relations(edges, ({ one }) => ({
  version: one(workflowVersions, {
    fields: [edges.workflowVersionId],
    references: [workflowVersions.id],
  }),
}));

// Executions Relations
export const executionsRelations = relations(executions, ({ one, many }) => ({
  workflow: one(workflows, {
    fields: [executions.workflowId],
    references: [workflows.id],
  }),
  version: one(workflowVersions, {
    fields: [executions.workflowVersionId],
    references: [workflowVersions.id],
  }),
  triggeredByUser: one(users, {
    fields: [executions.triggeredBy],
    references: [users.id],
  }),
  nodeRuns: many(nodeExecutionRuns),
  approvals: many(approvals),
  idempotencyKeys: many(idempotencyKeys),
}));

// Node Execution Runs Relations
export const nodeRunsRelations = relations(nodeExecutionRuns, ({ one }) => ({
  execution: one(executions, {
    fields: [nodeExecutionRuns.executionId],
    references: [executions.id],
  }),
  node: one(nodes, {
    fields: [nodeExecutionRuns.nodeId],
    references: [nodes.id],
  }),
}));

// Approvals Relations
export const approvalsRelations = relations(approvals, ({ one }) => ({
  execution: one(executions, {
    fields: [approvals.executionId],
    references: [executions.id],
  }),
  reviewer: one(users, {
    fields: [approvals.reviewerId],
    references: [users.id],
  }),
}));

// Idempotency Keys Relations
export const idempotencyKeysRelations = relations(idempotencyKeys, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [idempotencyKeys.workspaceId],
    references: [workspaces.id],
  }),
  execution: one(executions, {
    fields: [idempotencyKeys.executionId],
    references: [executions.id],
  }),
}));

// Agents Relations
export const agentsRelations = relations(agents, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [agents.workspaceId],
    references: [workspaces.id],
  }),
}));

// Prompt Templates Relations
export const promptTemplatesRelations = relations(promptTemplates, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [promptTemplates.workspaceId],
    references: [workspaces.id],
  }),
}));

// Webhooks Relations
export const webhooksRelations = relations(webhooks, ({ one }) => ({
  workflow: one(workflows, {
    fields: [webhooks.workflowId],
    references: [workflows.id],
  }),
}));

// Audit Logs Relations
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [auditLogs.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
