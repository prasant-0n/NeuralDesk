import { describe, it, expect } from "vitest";
import {
  getTableColumns,
  getTableName,
  users,
  workspaces,
  workspaceMembers,
  workflows,
  workflowVersions,
  nodes,
  edges,
  executions,
  nodeExecutionRuns,
  approvals,
  idempotencyKeys,
  agents,
  promptTemplates,
  webhooks,
  auditLogs,
  usersRelations,
  workspacesRelations,
  workspaceMembersRelations,
  workflowsRelations,
  workflowVersionsRelations,
  nodesRelations,
  edgesRelations,
  executionsRelations,
  nodeRunsRelations,
  approvalsRelations,
  idempotencyKeysRelations,
  agentsRelations,
  promptTemplatesRelations,
  webhooksRelations,
  auditLogsRelations,
  createDbClient,
  createPgPool,
  createLibsqlClient,
  db,
} from "../../packages/db/src/index";
import {
  SEED_IDS,
  supportWorkflowDefinition,
  docSummarizerWorkflowDefinition,
  leadEnrichmentWorkflowDefinition,
} from "../../packages/db/src/seed";
import {
  WorkflowDefinitionSchema,
  topologicalSortKahn,
} from "../../packages/shared/src/index";

describe("Drizzle Relational Schema Architecture", () => {
  it("should define all 15 core tables with expected column metadata", () => {
    // 1. Users
    const userCols = getTableColumns(users);
    expect(userCols.id).toBeDefined();
    expect(userCols.email).toBeDefined();
    expect(userCols.name).toBeDefined();
    expect(userCols.avatarUrl).toBeDefined();
    expect(userCols.createdAt).toBeDefined();
    expect(userCols.updatedAt).toBeDefined();

    // 2. Workspaces
    const wsCols = getTableColumns(workspaces);
    expect(wsCols.id).toBeDefined();
    expect(wsCols.name).toBeDefined();
    expect(wsCols.slug).toBeDefined();
    expect(wsCols.ownerId).toBeDefined();
    expect(wsCols.encryptedApiKeys).toBeDefined();

    // 3. Workspace Members
    const memberCols = getTableColumns(workspaceMembers);
    expect(memberCols.id).toBeDefined();
    expect(memberCols.workspaceId).toBeDefined();
    expect(memberCols.userId).toBeDefined();
    expect(memberCols.role).toBeDefined();

    // 4. Workflows
    const wfCols = getTableColumns(workflows);
    expect(wfCols.id).toBeDefined();
    expect(wfCols.workspaceId).toBeDefined();
    expect(wfCols.name).toBeDefined();
    expect(wfCols.category).toBeDefined();
    expect(wfCols.status).toBeDefined();
    expect(wfCols.isActive).toBeDefined();

    // 5. Workflow Versions
    const wfVerCols = getTableColumns(workflowVersions);
    expect(wfVerCols.id).toBeDefined();
    expect(wfVerCols.workflowId).toBeDefined();
    expect(wfVerCols.versionNumber).toBeDefined();
    expect(wfVerCols.definition).toBeDefined();
    expect(wfVerCols.isPublished).toBeDefined();

    // 6. Nodes
    const nodeCols = getTableColumns(nodes);
    expect(nodeCols.id).toBeDefined();
    expect(nodeCols.workflowVersionId).toBeDefined();
    expect(nodeCols.nodeKey).toBeDefined();
    expect(nodeCols.type).toBeDefined();
    expect(nodeCols.name).toBeDefined();
    expect(nodeCols.positionX).toBeDefined();
    expect(nodeCols.positionY).toBeDefined();
    expect(nodeCols.config).toBeDefined();
    expect(nodeCols.inputs).toBeDefined();
    expect(nodeCols.outputs).toBeDefined();

    // 7. Edges
    const edgeCols = getTableColumns(edges);
    expect(edgeCols.id).toBeDefined();
    expect(edgeCols.workflowVersionId).toBeDefined();
    expect(edgeCols.edgeKey).toBeDefined();
    expect(edgeCols.sourceNodeKey).toBeDefined();
    expect(edgeCols.sourcePort).toBeDefined();
    expect(edgeCols.targetNodeKey).toBeDefined();
    expect(edgeCols.targetPort).toBeDefined();
    expect(edgeCols.conditionExpression).toBeDefined();

    // 8. Executions
    const execCols = getTableColumns(executions);
    expect(execCols.id).toBeDefined();
    expect(execCols.workflowId).toBeDefined();
    expect(execCols.workflowVersionId).toBeDefined();
    expect(execCols.status).toBeDefined();
    expect(execCols.triggerType).toBeDefined();
    expect(execCols.triggerPayload).toBeDefined();
    expect(execCols.startedAt).toBeDefined();
    expect(execCols.completedAt).toBeDefined();
    expect(execCols.durationMs).toBeDefined();
    expect(execCols.totalTokens).toBeDefined();
    expect(execCols.promptTokens).toBeDefined();
    expect(execCols.completionTokens).toBeDefined();
    expect(execCols.totalCostUsd).toBeDefined();
    expect(execCols.executionMode).toBeDefined();

    // 9. Node Execution Runs
    const runCols = getTableColumns(nodeExecutionRuns);
    expect(runCols.id).toBeDefined();
    expect(runCols.executionId).toBeDefined();
    expect(runCols.nodeId).toBeDefined();
    expect(runCols.nodeKey).toBeDefined();
    expect(runCols.nodeType).toBeDefined();
    expect(runCols.status).toBeDefined();
    expect(runCols.inputPayload).toBeDefined();
    expect(runCols.outputPayload).toBeDefined();
    expect(runCols.tokensUsed).toBeDefined();
    expect(runCols.costUsd).toBeDefined();

    // 10. Approvals
    const appCols = getTableColumns(approvals);
    expect(appCols.id).toBeDefined();
    expect(appCols.executionId).toBeDefined();
    expect(appCols.nodeKey).toBeDefined();
    expect(appCols.status).toBeDefined();
    expect(appCols.promptReview).toBeDefined();
    expect(appCols.llmOutputReview).toBeDefined();
    expect(appCols.modifiedOutput).toBeDefined();
    expect(appCols.reviewerId).toBeDefined();

    // 11. Idempotency Keys
    const idempCols = getTableColumns(idempotencyKeys);
    expect(idempCols.id).toBeDefined();
    expect(idempCols.workspaceId).toBeDefined();
    expect(idempCols.idempotencyKey).toBeDefined();
    expect(idempCols.executionId).toBeDefined();
    expect(idempCols.status).toBeDefined();
    expect(idempCols.expiresAt).toBeDefined();

    // 12. Agents
    const agentCols = getTableColumns(agents);
    expect(agentCols.id).toBeDefined();
    expect(agentCols.workspaceId).toBeDefined();
    expect(agentCols.name).toBeDefined();
    expect(agentCols.slug).toBeDefined();
    expect(agentCols.systemPrompt).toBeDefined();
    expect(agentCols.defaultModel).toBeDefined();
    expect(agentCols.temperature).toBeDefined();
    expect(agentCols.topP).toBeDefined();
    expect(agentCols.maxTokens).toBeDefined();

    // 13. Prompt Templates
    const promptCols = getTableColumns(promptTemplates);
    expect(promptCols.id).toBeDefined();
    expect(promptCols.workspaceId).toBeDefined();
    expect(promptCols.name).toBeDefined();
    expect(promptCols.slug).toBeDefined();
    expect(promptCols.content).toBeDefined();
    expect(promptCols.variables).toBeDefined();

    // 14. Webhooks
    const whCols = getTableColumns(webhooks);
    expect(whCols.id).toBeDefined();
    expect(whCols.workflowId).toBeDefined();
    expect(whCols.urlToken).toBeDefined();
    expect(whCols.secretHash).toBeDefined();
    expect(whCols.isActive).toBeDefined();

    // 15. Audit Logs
    const auditCols = getTableColumns(auditLogs);
    expect(auditCols.id).toBeDefined();
    expect(auditCols.workspaceId).toBeDefined();
    expect(auditCols.userId).toBeDefined();
    expect(auditCols.action).toBeDefined();
    expect(auditCols.resourceType).toBeDefined();
    expect(auditCols.resourceId).toBeDefined();
    expect(auditCols.details).toBeDefined();
  });

  it("should configure proper table names in postgres dialect", () => {
    expect(getTableName(users)).toBe("users");
    expect(getTableName(workspaces)).toBe("workspaces");
    expect(getTableName(workspaceMembers)).toBe("workspace_members");
    expect(getTableName(workflows)).toBe("workflows");
    expect(getTableName(workflowVersions)).toBe("workflow_versions");
    expect(getTableName(nodes)).toBe("nodes");
    expect(getTableName(edges)).toBe("edges");
    expect(getTableName(executions)).toBe("executions");
    expect(getTableName(nodeExecutionRuns)).toBe("node_execution_runs");
    expect(getTableName(approvals)).toBe("approvals");
    expect(getTableName(idempotencyKeys)).toBe("idempotency_keys");
    expect(getTableName(agents)).toBe("agents");
    expect(getTableName(promptTemplates)).toBe("prompt_templates");
    expect(getTableName(webhooks)).toBe("webhooks");
    expect(getTableName(auditLogs)).toBe("audit_logs");
  });
});

describe("Drizzle Schema Relations Configuration", () => {
  it("should define all entity relations correctly", () => {
    expect(usersRelations).toBeDefined();
    expect(workspacesRelations).toBeDefined();
    expect(workspaceMembersRelations).toBeDefined();
    expect(workflowsRelations).toBeDefined();
    expect(workflowVersionsRelations).toBeDefined();
    expect(nodesRelations).toBeDefined();
    expect(edgesRelations).toBeDefined();
    expect(executionsRelations).toBeDefined();
    expect(nodeRunsRelations).toBeDefined();
    expect(approvalsRelations).toBeDefined();
    expect(idempotencyKeysRelations).toBeDefined();
    expect(agentsRelations).toBeDefined();
    expect(promptTemplatesRelations).toBeDefined();
    expect(webhooksRelations).toBeDefined();
    expect(auditLogsRelations).toBeDefined();
  });
});

describe("Database Client & Connection Factory", () => {
  it("should export singleton db and connection factories", () => {
    expect(db).toBeDefined();
    expect(typeof createDbClient).toBe("function");
    expect(typeof createPgPool).toBe("function");
    expect(typeof createLibsqlClient).toBe("function");
  });

  it("should initialize a libSQL fallback client successfully", () => {
    const sqliteDb = createLibsqlClient(":memory:");
    expect(sqliteDb).toBeDefined();
  });
});

describe("Seed Workflows Data Integrity & DAG Validation", () => {
  it("should provide valid deterministic SEED_IDS", () => {
    expect(SEED_IDS.USER_ADMIN).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(SEED_IDS.WORKSPACE_CORE).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(SEED_IDS.WF_SUPPORT).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(SEED_IDS.WF_DOC_SUMMARIZER).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(SEED_IDS.WF_LEAD_ENRICHMENT).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it("should validate Workflow 1: Customer Support Triage DAG structure", () => {
    const parsed = WorkflowDefinitionSchema.safeParse(supportWorkflowDefinition);
    if (!parsed.success) {
      console.error("Support Workflow validation error:", parsed.error.format());
    }
    expect(parsed.success).toBe(true);

    const nodeIds = supportWorkflowDefinition.nodes.map((n) => n.id);
    const edgesList = supportWorkflowDefinition.edges.map((e) => ({
      source: e.source,
      target: e.target,
    }));

    const topoResult = topologicalSortKahn(nodeIds, edgesList);
    expect(topoResult.isValid).toBe(true);
    expect(topoResult.sortedOrder[0]).toBe("webhook_trigger");
    expect(topoResult.sortedOrder[1]).toBe("gemini_sentiment");
    expect(topoResult.sortedOrder[2]).toBe("escalation_router");
  });

  it("should validate Workflow 2: Document Summarizer DAG structure", () => {
    const parsed = WorkflowDefinitionSchema.safeParse(docSummarizerWorkflowDefinition);
    if (!parsed.success) {
      console.error("Doc Summarizer validation error:", parsed.error.format());
    }
    expect(parsed.success).toBe(true);

    const nodeIds = docSummarizerWorkflowDefinition.nodes.map((n) => n.id);
    const edgesList = docSummarizerWorkflowDefinition.edges.map((e) => ({
      source: e.source,
      target: e.target,
    }));

    const topoResult = topologicalSortKahn(nodeIds, edgesList);
    expect(topoResult.isValid).toBe(true);
    expect(topoResult.sortedOrder).toEqual([
      "manual_doc_input",
      "text_chunker",
      "gemini_pro_synthesizer",
      "markdown_formatter",
    ]);
  });

  it("should validate Workflow 3: Lead Enrichment DAG structure", () => {
    const parsed = WorkflowDefinitionSchema.safeParse(leadEnrichmentWorkflowDefinition);
    if (!parsed.success) {
      console.error("Lead Enrichment validation error:", parsed.error.format());
    }
    expect(parsed.success).toBe(true);

    const nodeIds = leadEnrichmentWorkflowDefinition.nodes.map((n) => n.id);
    const edgesList = leadEnrichmentWorkflowDefinition.edges.map((e) => ({
      source: e.source,
      target: e.target,
    }));

    const topoResult = topologicalSortKahn(nodeIds, edgesList);
    expect(topoResult.isValid).toBe(true);
    expect(topoResult.sortedOrder).toEqual([
      "inbound_lead_webhook",
      "gemini_structured_extractor",
      "data_transform",
      "crm_sync_output",
    ]);
  });
});
