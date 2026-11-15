/**
 * NeuralDesk Human Approval Node Handler
 * Creates approval record and pauses workflow execution in 'waiting_for_approval' state.
 */

import { db, approvals } from "@neuraldesk/db";
import { inMemoryApprovals } from "../store.js";
import type { INodeHandler, NodeExecutionContext, NodeExecutionResult } from "./types.js";

export class ApprovalHandler implements INodeHandler {
  public async execute(ctx: NodeExecutionContext): Promise<NodeExecutionResult> {
    const config = ctx.nodeConfig;
    const approvalId = `appr_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
    const approverRole = String(config.approverRole || "reviewer");
    const instructions = String(config.instructions || "Please review the generated output before proceeding.");
    const lastOutput = ctx.scope.getLastOutput();

    const approvalRecord = {
      id: approvalId,
      executionId: ctx.executionId,
      nodeKey: ctx.nodeKey,
      status: "pending" as const,
      promptReview: instructions,
      llmOutputReview: lastOutput ? JSON.stringify(lastOutput) : null,
      createdAt: new Date().toISOString(),
    };

    inMemoryApprovals.set(approvalId, approvalRecord);

    // Persist to database if reachable
    try {
      await db.insert(approvals).values({
        id: crypto.randomUUID(),
        executionId: ctx.executionId.includes("-") ? ctx.executionId : crypto.randomUUID(),
        nodeKey: ctx.nodeKey,
        status: "pending",
        promptReview: instructions,
        llmOutputReview: lastOutput ? JSON.stringify(lastOutput) : null,
      });
    } catch {
      // Safe DB fallback to in-memory store
    }

    return {
      status: "waiting_for_approval",
      approvalId,
      outputs: {
        approvalId,
        approverRole,
        instructions,
        status: "pending",
        requiresAction: true,
      },
    };
  }
}
