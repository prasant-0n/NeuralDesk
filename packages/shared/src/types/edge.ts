/**
 * NeuralDesk Edge Domain Contracts
 * Standardized edge connections, port handles, and conditional branch routing.
 */

export type HandleType = "source" | "target";

export type ConditionBranch = "true" | "false" | "default" | "on_failure";

export interface WorkflowEdgeData {
  label?: string;
  conditionExpression?: string;
  branch?: ConditionBranch;
  description?: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
  animated?: boolean;
  branch?: ConditionBranch;
  data?: WorkflowEdgeData;
}
