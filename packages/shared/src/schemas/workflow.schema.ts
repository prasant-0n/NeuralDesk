/**
 * NeuralDesk Workflow Validation Schemas
 * Validates canvas topology, viewport coordinates, edge wiring, and version snapshots.
 */

import { z } from "zod";
import { WorkflowNodeSchema } from "./node.schema.js";

export const ViewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number().min(0.05).max(4.0).default(1.0),
});

export const ConditionBranchSchema = z.enum(["true", "false", "default", "on_failure"]);

export const WorkflowEdgeDataSchema = z.object({
  label: z.string().optional(),
  conditionExpression: z.string().optional(),
  branch: ConditionBranchSchema.optional(),
  description: z.string().optional(),
});

export const WorkflowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  sourceHandle: z.string().min(1),
  target: z.string().min(1),
  targetHandle: z.string().min(1),
  animated: z.boolean().default(false),
  branch: ConditionBranchSchema.optional(),
  data: WorkflowEdgeDataSchema.optional(),
});

export const WorkflowDefinitionSchema = z.object({
  nodes: z.array(WorkflowNodeSchema).default([]),
  edges: z.array(WorkflowEdgeSchema).default([]),
  viewport: ViewportSchema.default({ x: 0, y: 0, zoom: 1.0 }),
});

export const WorkflowStatusSchema = z.enum(["draft", "published", "archived"]);

export const CreateWorkflowSchema = z.object({
  workspaceId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  category: z.string().max(100).optional(),
  initialDefinition: WorkflowDefinitionSchema.optional(),
});

export const UpdateWorkflowSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  category: z.string().max(100).optional(),
  status: WorkflowStatusSchema.optional(),
  isActive: z.boolean().optional(),
});

export const WorkflowVersionSchema = z.object({
  id: z.string().min(1),
  workflowId: z.string().min(1),
  versionNumber: z.number().int().min(1),
  definition: WorkflowDefinitionSchema,
  changelog: z.string().optional(),
  isPublished: z.boolean().default(false),
  createdBy: z.string().optional(),
  createdAt: z.string(),
});

export const CreateWorkflowVersionSchema = z.object({
  definition: WorkflowDefinitionSchema,
  changelog: z.string().max(2000).optional(),
  isPublished: z.boolean().default(false),
});
