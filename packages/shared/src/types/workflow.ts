/**
 * NeuralDesk Workflow Domain Contracts
 * Represents workflow topographies, immutable versions, canvas viewport, and lifecycle state.
 */

import type { AnyWorkflowNode } from "./node.js";
import type { WorkflowEdge } from "./edge.js";

export const WORKFLOW_STATUSES = ["draft", "published", "archived"] as const;

export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

export type WorkflowCategory =
  | "support"
  | "research"
  | "triage"
  | "sales"
  | "engineering"
  | "operations"
  | "general"
  | (string & {});

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface WorkflowDefinition {
  nodes: AnyWorkflowNode[];
  edges: WorkflowEdge[];
  viewport: Viewport;
}

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  versionNumber: number;
  definition: WorkflowDefinition;
  changelog?: string;
  isPublished: boolean;
  createdBy?: string;
  createdAt: string;
}

export interface WorkflowMetadata {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  category?: WorkflowCategory;
  status: WorkflowStatus;
  isActive: boolean;
  activeVersion?: number;
  nodeCount?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowWithActiveVersion extends WorkflowMetadata {
  version?: WorkflowVersion;
}

export interface CreateWorkflowInput {
  workspaceId?: string;
  name: string;
  description?: string;
  category?: WorkflowCategory;
  initialDefinition?: WorkflowDefinition;
}

export interface UpdateWorkflowInput {
  name?: string;
  description?: string;
  category?: WorkflowCategory;
  status?: WorkflowStatus;
  isActive?: boolean;
}

export interface CreateWorkflowVersionInput {
  definition: WorkflowDefinition;
  changelog?: string;
  isPublished?: boolean;
}
