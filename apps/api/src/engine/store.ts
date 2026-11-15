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

function initializeSeedExecutions(): Map<string, StoredExecution> {
  const map = new Map<string, StoredExecution>();
  const now = Date.now();
  const sampleWorkflows = [
    SEED_IDS.WF_SUPPORT,
    SEED_IDS.WF_DOC_SUMMARIZER,
    SEED_IDS.WF_LEAD_ENRICHMENT,
  ];

  // 34 realistic historical runs distributed across the last 24h
  const hoursAgo = [
    23.5, 22.8, 21.5, 20.2, 19.4, 18.1, 17.5, 16.2, 15.6, 14.8, 13.9, 13.1,
    12.4, 11.6, 10.9, 10.1, 9.4, 8.7, 8.0, 7.3, 6.6, 5.9, 5.2, 4.5, 3.8, 3.1, 2.5, 1.9, 1.4, 1.0, 0.7, 0.5, 0.3, 0.1
  ];

  hoursAgo.forEach((h, idx) => {
    const id = `exec_${String(idx + 1).padStart(3, "0")}`;
    const wfId = sampleWorkflows[idx % sampleWorkflows.length];
    const started = new Date(now - h * 3600 * 1000).toISOString();
    const isFail = idx === 11 || idx === 27; // 2 failures for realistic ~94% success rate
    const duration = isFail ? 210 : 280 + ((idx * 43) % 480);
    const pTokens = 350 + ((idx * 89) % 700);
    const cTokens = 150 + ((idx * 61) % 400);
    const totalTokens = pTokens + cTokens;
    const cost = Number(((totalTokens / 1_000_000) * 0.15).toFixed(6));

    map.set(id, {
      id,
      workflowId: wfId,
      versionNumber: 1,
      status: isFail ? "failed" : "completed",
      triggerType: idx % 3 === 0 ? "webhook" : idx % 3 === 1 ? "manual" : "api",
      triggerPayload: { source: "telemetry_feed", batchId: `batch_${idx}` },
      startedAt: started,
      completedAt: new Date(new Date(started).getTime() + duration).toISOString(),
      durationMs: duration,
      totalTokens,
      promptTokens: pTokens,
      completionTokens: cTokens,
      totalCostUsd: cost,
      executionMode: idx % 4 === 0 ? "live" : "simulation",
      errorMessage: isFail ? "Rate limit exceeded on upstream webhook gateway" : undefined,
    });
  });

  return map;
}

export const inMemoryExecutions = initializeSeedExecutions();
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
