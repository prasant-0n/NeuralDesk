/**
 * NeuralDesk In-Memory Execution & Run Telemetry Store
 * Provides low-latency thread-safe cache for active streaming, real-time metrics, and DB fallback.
 */

import {
  SEED_IDS,
  supportWorkflowDefinition,
  docSummarizerWorkflowDefinition,
  leadEnrichmentWorkflowDefinition,
} from "@neuraldesk/db";

export interface StoredWorkflowRecord {
  id: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  category: string;
  status: "draft" | "published" | "archived";
  isActive: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  activeVersionNumber: number;
  versions: Array<{
    id: string;
    workflowId: string;
    versionNumber: number;
    definition: any;
    changelog?: string | null;
    isPublished: boolean;
    createdAt: string;
  }>;
}

export interface StoredExecution {
  id: string;
  workflowId: string;
  workflowVersionId?: string | null;
  versionNumber: number;
  status: "pending" | "running" | "completed" | "failed" | "cancelled" | "waiting_for_approval";
  triggerType: "manual" | "webhook" | "schedule" | "api";
  triggerPayload: Record<string, unknown>;
  startedAt: string;
  completedAt?: string | null;
  durationMs: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalCostUsd: number;
  errorMessage?: string | null;
  executionMode: "real" | "simulation" | "mock" | "live";
  finalOutputs?: Record<string, unknown>;
}

export interface StoredNodeRun {
  id: string;
  executionId: string;
  nodeKey: string;
  nodeType: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped" | "waiting_for_approval";
  durationMs: number;
  promptTokens: number;
  completionTokens: number;
  costEstimateUsd: number;
  outputData: Record<string, unknown>;
  inputData: Record<string, unknown>;
  errorMessage?: string;
  finishReason?: string;
  startedAt: string;
  completedAt?: string;
}

export const inMemoryExecutions = new Map<string, StoredExecution>();
export const inMemoryNodeRuns = new Map<string, StoredNodeRun[]>();
export const inMemoryApprovals = new Map<string, any>();

export const inMemoryWorkflows = new Map<string, StoredWorkflowRecord>([
  [
    SEED_IDS.WF_SUPPORT,
    {
      id: SEED_IDS.WF_SUPPORT,
      workspaceId: SEED_IDS.WORKSPACE_CORE,
      name: "Customer Support Sentiment & Routing",
      description: "Classifies incoming tickets and routes negative sentiment to Slack.",
      category: "support",
      status: "published",
      isActive: true,
      createdBy: SEED_IDS.USER_ADMIN,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activeVersionNumber: 1,
      versions: [
        {
          id: SEED_IDS.WF_SUPPORT_V1,
          workflowId: SEED_IDS.WF_SUPPORT,
          versionNumber: 1,
          definition: supportWorkflowDefinition,
          changelog: "Initial production release",
          isPublished: true,
          createdAt: new Date().toISOString(),
        },
      ],
    },
  ],
  [
    SEED_IDS.WF_DOC_SUMMARIZER,
    {
      id: SEED_IDS.WF_DOC_SUMMARIZER,
      workspaceId: SEED_IDS.WORKSPACE_CORE,
      name: "Document Summarizer & Key Insight Extractor",
      description: "Extracts key highlights and action items from long-form documents.",
      category: "productivity",
      status: "published",
      isActive: true,
      createdBy: SEED_IDS.USER_ADMIN,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activeVersionNumber: 1,
      versions: [
        {
          id: SEED_IDS.WF_DOC_SUMMARIZER_V1,
          workflowId: SEED_IDS.WF_DOC_SUMMARIZER,
          versionNumber: 1,
          definition: docSummarizerWorkflowDefinition,
          changelog: "Initial production release",
          isPublished: true,
          createdAt: new Date().toISOString(),
        },
      ],
    },
  ],
  [
    SEED_IDS.WF_LEAD_ENRICHMENT,
    {
      id: SEED_IDS.WF_LEAD_ENRICHMENT,
      workspaceId: SEED_IDS.WORKSPACE_CORE,
      name: "Lead Enrichment & Structured Extractor",
      description: "Ingests raw inbound leads and extracts CRM fields via Gemini.",
      category: "marketing",
      status: "published",
      isActive: true,
      createdBy: SEED_IDS.USER_ADMIN,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activeVersionNumber: 1,
      versions: [
        {
          id: SEED_IDS.WF_LEAD_ENRICHMENT_V1,
          workflowId: SEED_IDS.WF_LEAD_ENRICHMENT,
          versionNumber: 1,
          definition: leadEnrichmentWorkflowDefinition,
          changelog: "Initial production release",
          isPublished: true,
          createdAt: new Date().toISOString(),
        },
      ],
    },
  ],
]);
