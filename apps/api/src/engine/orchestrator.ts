/**
 * NeuralDesk Runtime DAG Execution Orchestrator
 * Topological DAG runner with Kahn's algorithm, FIFO concurrency queue (max 3 runs),
 * variable resolution scope, condition branching, exponential backoff retries,
 * on_failure error port routing, real-time SSE streaming, and state persistence.
 */

import {
  topologicalSortKahn,
  type WorkflowNode,
  type WorkflowEdge,
} from "@neuraldesk/shared";
import {
  db,
  executions,
  nodeExecutionRuns,
  eq,
  SEED_IDS,
  supportWorkflowDefinition,
  docSummarizerWorkflowDefinition,
  leadEnrichmentWorkflowDefinition,
} from "@neuraldesk/db";
import { sseManager } from "../services/sse-manager.js";
import { ExecutionScope } from "./scope.js";
import { getNodeHandler } from "./handlers/index.js";
import {
  inMemoryExecutions,
  inMemoryNodeRuns,
  type StoredNodeRun,
} from "./store.js";

export interface ExecuteWorkflowOptions {
  executionId: string;
  workflowId: string;
  workflowDefinition?: {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  };
  inputs: Record<string, unknown>;
  mode?: "real" | "simulation" | "mock" | "live";
  versionNumber?: number;
  triggerSource?: "manual" | "webhook" | "schedule" | "api";
  apiKey?: string;
  dbExecutionId?: string;
}

export class ExecutionOrchestrator {
  private readonly maxConcurrent = 3;
  private activeRuns = 0;
  private readonly queue: Array<() => Promise<void>> = [];

  /**
   * Enqueues execution according to FIFO concurrency queue.
   */
  public async enqueueExecution(options: ExecuteWorkflowOptions): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const task = async () => {
        try {
          await this.runDAG(options);
          resolve();
        } catch (err) {
          reject(err);
        } finally {
          this.activeRuns--;
          this.processNextInQueue();
        }
      };

      if (this.activeRuns < this.maxConcurrent) {
        this.activeRuns++;
        task();
      } else {
        this.queue.push(task);
      }
    });
  }

  private processNextInQueue(): void {
    if (this.queue.length > 0 && this.activeRuns < this.maxConcurrent) {
      this.activeRuns++;
      const nextTask = this.queue.shift();
      if (nextTask) {
        nextTask();
      }
    }
  }

  /**
   * Core DAG execution pipeline.
   */
  public async runDAG(options: ExecuteWorkflowOptions): Promise<void> {
    const {
      executionId,
      workflowId,
      inputs,
      mode = "real",
      apiKey,
      dbExecutionId,
    } = options;

    const exec = inMemoryExecutions.get(executionId);
    if (!exec) return;

    // 1. Resolve Workflow Definition
    const definition = this.resolveWorkflowDefinition(workflowId, options.workflowDefinition);
    const nodes = definition.nodes || [];
    const edges = definition.edges || [];

    const nodeMap = new Map<string, WorkflowNode>();
    for (const node of nodes) {
      nodeMap.set(node.id, node);
    }

    const nodeKeys = nodes.map((n) => n.id);
    const simpleEdges = edges.map((e) => ({ source: e.source, target: e.target }));

    // 2. Validate DAG Acyclic Invariant & Topological Order via Kahn's Algorithm
    const validation = topologicalSortKahn(nodeKeys, simpleEdges);
    if (!validation.isValid || !validation.sortedOrder) {
      const errorMsg = validation.error || "Directed cycle detected in workflow DAG";
      exec.status = "failed";
      exec.errorMessage = errorMsg;
      exec.completedAt = new Date().toISOString();

      sseManager.broadcast(executionId, "execution:error", {
        execution_id: executionId,
        workflow_id: workflowId,
        status: "failed",
        error_message: errorMsg,
      });

      this.persistExecutionState(executionId, dbExecutionId);
      throw new Error(errorMsg);
    }

    const orderedKeys = validation.sortedOrder;

    // 3. Broadcast execution:start
    sseManager.broadcast(executionId, "execution:start", {
      execution_id: executionId,
      workflow_id: workflowId,
      mode,
      total_nodes: orderedKeys.length,
      ordered_keys: orderedKeys,
      started_at: exec.startedAt,
    });

    // 4. Initialize Execution Scope & Tracking
    const scope = new ExecutionScope(executionId, workflowId, mode, inputs);
    const skippedNodes = new Set<string>();
    const inactiveEdges = new Set<string>(); // Edge IDs not selected by condition branching
    const nodeRuns: StoredNodeRun[] = inMemoryNodeRuns.get(executionId) || [];
    inMemoryNodeRuns.set(executionId, nodeRuns);

    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalCostUsd = 0;
    let executionOutputs: Record<string, unknown> = {};

    const execStartTime = Date.now();

    // 5. Sequential Execution of Nodes in Topological Order
    for (const nodeKey of orderedKeys) {
      const node = nodeMap.get(nodeKey);
      if (!node) continue;

      const incomingEdges = edges.filter((e) => e.target === nodeKey);

      // Check if node should be skipped due to inactive branch routing
      const isSkipped =
        incomingEdges.length > 0 &&
        incomingEdges.every(
          (edge) => inactiveEdges.has(edge.id) || skippedNodes.has(edge.source)
        );

      if (isSkipped) {
        skippedNodes.add(nodeKey);

        const skipRun: StoredNodeRun = {
          id: crypto.randomUUID(),
          executionId,
          nodeKey,
          nodeType: node.type,
          status: "skipped",
          durationMs: 0,
          promptTokens: 0,
          completionTokens: 0,
          costEstimateUsd: 0,
          outputData: {},
          inputData: {},
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        };
        nodeRuns.push(skipRun);

        sseManager.broadcast(executionId, "node:skip", {
          execution_id: executionId,
          node_key: nodeKey,
          reason: "Conditional branch not taken or parent node skipped",
        });

        this.persistNodeRun(skipRun, dbExecutionId);
        continue;
      }

      // Node is active: prepare execution
      const nodeStartTime = Date.now();

      sseManager.broadcast(executionId, "node:start", {
        execution_id: executionId,
        node_key: nodeKey,
        node_type: node.type as any,
        started_at: new Date(nodeStartTime).toISOString(),
      });

      // Assemble node input payload from incoming edges and trigger
      const nodeInputs: Record<string, unknown> = { ...inputs };
      for (const edge of incomingEdges) {
        const sourceOutput = scope.getNodeOutput(edge.source);
        if (sourceOutput) {
          Object.assign(nodeInputs, sourceOutput);
        }
      }

      let handlerResult: any;
      let nodeError: Error | null = null;

      try {
        // Execute Handler with Exponential Backoff Retry Policy on Transient Errors
        handlerResult = await this.executeWithRetry(async () => {
          const handler = getNodeHandler(node.type);
          return await handler.execute({
            executionId,
            workflowId,
            nodeKey,
            nodeType: node.type,
            nodeConfig: (node.data?.config as unknown as Record<string, unknown>) || {},
            inputs: nodeInputs,
            scope,
            mode,
            apiKey,
            onStreamChunk: (chunk: string) => {
              sseManager.broadcast(executionId, "node:stream:chunk", {
                execution_id: executionId,
                node_key: nodeKey,
                chunk,
              });
            },
          });
        }, nodeKey);
      } catch (err: any) {
        nodeError = err;
      }

      // Handle Node Failure & on_failure Routing
      if (nodeError) {
        const onFailureEdge = edges.find(
          (e) =>
            e.source === nodeKey &&
            (e.branch === "on_failure" || e.sourceHandle === "on_failure")
        );

        if (onFailureEdge) {
          // Route error through on_failure edge instead of terminating entire DAG
          console.warn(
            `[Orchestrator] Node ${nodeKey} failed. Routing to on_failure port edge ${onFailureEdge.id}.`
          );
          const errorPayload = {
            error: nodeError.message || "Node execution failure",
            nodeKey,
          };
          scope.setNodeOutput(nodeKey, errorPayload);

          const failedRun: StoredNodeRun = {
            id: crypto.randomUUID(),
            executionId,
            nodeKey,
            nodeType: node.type,
            status: "failed",
            durationMs: Date.now() - nodeStartTime,
            promptTokens: 0,
            completionTokens: 0,
            costEstimateUsd: 0,
            outputData: errorPayload,
            inputData: nodeInputs,
            errorMessage: nodeError.message,
            startedAt: new Date(nodeStartTime).toISOString(),
            completedAt: new Date().toISOString(),
          };
          nodeRuns.push(failedRun);
          this.persistNodeRun(failedRun, dbExecutionId);
          continue;
        }

        // Fatal Failure: terminate workflow
        const durationMs = Date.now() - nodeStartTime;
        const failedRun: StoredNodeRun = {
          id: crypto.randomUUID(),
          executionId,
          nodeKey,
          nodeType: node.type,
          status: "failed",
          durationMs,
          promptTokens: 0,
          completionTokens: 0,
          costEstimateUsd: 0,
          outputData: {},
          inputData: nodeInputs,
          errorMessage: nodeError.message,
          startedAt: new Date(nodeStartTime).toISOString(),
          completedAt: new Date().toISOString(),
        };
        nodeRuns.push(failedRun);

        sseManager.broadcast(executionId, "node:error", {
          execution_id: executionId,
          node_key: nodeKey,
          error_message: nodeError.message,
        });

        exec.status = "failed";
        exec.errorMessage = `Node '${nodeKey}' failed: ${nodeError.message}`;
        exec.completedAt = new Date().toISOString();
        exec.durationMs = Date.now() - execStartTime;

        sseManager.broadcast(executionId, "execution:error", {
          execution_id: executionId,
          workflow_id: workflowId,
          status: "failed",
          duration_ms: exec.durationMs,
          error_message: exec.errorMessage,
          failing_node_key: nodeKey,
        });

        this.persistNodeRun(failedRun, dbExecutionId);
        this.persistExecutionState(executionId, dbExecutionId);
        sseManager.closeExecution(executionId);
        return;
      }

      // Handle Waiting For Human Approval
      if (handlerResult.status === "waiting_for_approval") {
        exec.status = "waiting_for_approval";
        const durationMs = Date.now() - nodeStartTime;

        const approvalRun: StoredNodeRun = {
          id: crypto.randomUUID(),
          executionId,
          nodeKey,
          nodeType: node.type,
          status: "waiting_for_approval",
          durationMs,
          promptTokens: 0,
          completionTokens: 0,
          costEstimateUsd: 0,
          outputData: handlerResult.outputs,
          inputData: nodeInputs,
          startedAt: new Date(nodeStartTime).toISOString(),
          completedAt: new Date().toISOString(),
        };
        nodeRuns.push(approvalRun);
        this.persistNodeRun(approvalRun, dbExecutionId);
        this.persistExecutionState(executionId, dbExecutionId);
        return; // Pause DAG execution
      }

      // Node Completed Successfully
      const durationMs = Date.now() - nodeStartTime;
      const promptTokens = handlerResult.promptTokens || 0;
      const completionTokens = handlerResult.completionTokens || 0;
      const costEstimateUsd = handlerResult.costEstimateUsd || 0;

      totalPromptTokens += promptTokens;
      totalCompletionTokens += completionTokens;
      totalCostUsd += costEstimateUsd;

      scope.setNodeOutput(nodeKey, handlerResult.outputs);
      executionOutputs = { ...executionOutputs, ...handlerResult.outputs };

      const completedRun: StoredNodeRun = {
        id: crypto.randomUUID(),
        executionId,
        nodeKey,
        nodeType: node.type,
        status: "completed",
        durationMs,
        promptTokens,
        completionTokens,
        costEstimateUsd,
        outputData: handlerResult.outputs,
        inputData: nodeInputs,
        finishReason: handlerResult.finishReason,
        startedAt: new Date(nodeStartTime).toISOString(),
        completedAt: new Date().toISOString(),
      };
      nodeRuns.push(completedRun);

      sseManager.broadcast(executionId, "node:complete", {
        execution_id: executionId,
        node_key: nodeKey,
        duration_ms: durationMs,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        tokens: promptTokens + completionTokens,
        cost_usd: costEstimateUsd,
        outputs: handlerResult.outputs,
      });

      this.persistNodeRun(completedRun, dbExecutionId);

      // Handle Condition Branching Edge Pruning
      if (node.type === "condition" && handlerResult.branch) {
        const chosenBranch = handlerResult.branch; // 'true' or 'false'
        const outgoingEdges = edges.filter((e) => e.source === nodeKey);

        for (const outEdge of outgoingEdges) {
          const edgeBranch = outEdge.branch || outEdge.sourceHandle || outEdge.data?.branch;
          if (edgeBranch && edgeBranch !== chosenBranch) {
            inactiveEdges.add(outEdge.id);
          }
        }
      }
    }

    // 6. Complete Execution
    const totalDurationMs = Date.now() - execStartTime;
    const totalTokens = totalPromptTokens + totalCompletionTokens;

    exec.status = "completed";
    exec.completedAt = new Date().toISOString();
    exec.durationMs = totalDurationMs;
    exec.totalTokens = totalTokens;
    exec.promptTokens = totalPromptTokens;
    exec.completionTokens = totalCompletionTokens;
    exec.totalCostUsd = totalCostUsd;
    exec.finalOutputs = executionOutputs;

    sseManager.broadcast(executionId, "execution:complete", {
      execution_id: executionId,
      workflow_id: workflowId,
      status: "completed",
      duration_ms: totalDurationMs,
      total_tokens: totalTokens,
      total_cost_usd: totalCostUsd,
      final_outputs: executionOutputs,
    });

    this.persistExecutionState(executionId, dbExecutionId);
    sseManager.closeExecution(executionId);
  }

  /**
   * Exponential backoff retry handler for transient 429 rate limits and network errors.
   */
  private async executeWithRetry<T>(fn: () => Promise<T>, nodeKey: string, maxRetries = 3): Promise<T> {
    let attempt = 0;
    while (true) {
      try {
        return await fn();
      } catch (err: any) {
        attempt++;
        const isTransient =
          err?.status === 429 ||
          err?.statusCode === 429 ||
          err?.message?.includes("429") ||
          err?.message?.includes("RESOURCE_EXHAUSTED") ||
          err?.message?.includes("503") ||
          err?.message?.includes("ECONNRESET") ||
          err?.message?.includes("ETIMEDOUT");

        if (isTransient && attempt < maxRetries) {
          const backoff = Math.min(1000, 100 * Math.pow(2, attempt) + Math.random() * 50);
          console.warn(
            `[Orchestrator] Transient error on node '${nodeKey}' (attempt ${attempt}/${maxRetries}). Retrying in ${Math.round(backoff)}ms...`
          );
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }
        throw err;
      }
    }
  }

  /**
   * Resolves workflow definition by ID from database seeds or custom definition.
   */
  private resolveWorkflowDefinition(
    workflowId: string,
    customDefinition?: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }
  ): { nodes: WorkflowNode[]; edges: WorkflowEdge[] } {
    if (customDefinition && customDefinition.nodes && customDefinition.nodes.length > 0) {
      return customDefinition;
    }

    if (workflowId === SEED_IDS.WF_SUPPORT) {
      return supportWorkflowDefinition as any;
    }
    if (workflowId === SEED_IDS.WF_DOC_SUMMARIZER) {
      return docSummarizerWorkflowDefinition as any;
    }
    if (workflowId === SEED_IDS.WF_LEAD_ENRICHMENT) {
      return leadEnrichmentWorkflowDefinition as any;
    }

    // Default fallback workflow if none matches
    return supportWorkflowDefinition as any;
  }

  /**
   * Persists execution run state to PostgreSQL executions table.
   */
  private async persistExecutionState(executionId: string, dbExecutionId?: string): Promise<void> {
    const exec = inMemoryExecutions.get(executionId);
    if (!exec) return;

    const idToUpdate = dbExecutionId || (executionId.includes("-") ? executionId : undefined);
    if (!idToUpdate) return;

    try {
      await db
        .update(executions)
        .set({
          status: exec.status as any,
          completedAt: exec.completedAt ? new Date(exec.completedAt) : null,
          durationMs: exec.durationMs,
          totalTokens: exec.totalTokens,
          promptTokens: exec.promptTokens,
          completionTokens: exec.completionTokens,
          totalCostUsd: exec.totalCostUsd.toFixed(6),
          errorMessage: exec.errorMessage,
        })
        .where(eq(executions.id, idToUpdate));
    } catch {
      // Safe DB fallback
    }
  }

  /**
   * Persists node execution run to PostgreSQL node_execution_runs table.
   */
  private async persistNodeRun(nodeRun: StoredNodeRun, dbExecutionId?: string): Promise<void> {
    const execId = dbExecutionId || (nodeRun.executionId.includes("-") ? nodeRun.executionId : undefined);
    if (!execId) return;

    try {
      await db.insert(nodeExecutionRuns).values({
        id: crypto.randomUUID(),
        executionId: execId,
        nodeKey: nodeRun.nodeKey,
        nodeType: nodeRun.nodeType,
        status: nodeRun.status as any,
        startedAt: new Date(nodeRun.startedAt),
        completedAt: nodeRun.completedAt ? new Date(nodeRun.completedAt) : new Date(),
        durationMs: nodeRun.durationMs,
        inputPayload: nodeRun.inputData,
        outputPayload: nodeRun.outputData,
        errorDetails: nodeRun.errorMessage,
        tokensUsed: nodeRun.promptTokens + nodeRun.completionTokens,
        costUsd: nodeRun.costEstimateUsd.toFixed(6),
        finishReason: nodeRun.finishReason,
      });
    } catch {
      // Safe DB fallback
    }
  }
}

export const orchestrator = new ExecutionOrchestrator();
