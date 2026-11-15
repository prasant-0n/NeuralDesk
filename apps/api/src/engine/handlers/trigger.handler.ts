/**
 * NeuralDesk Trigger Node Handler
 * Ingests initial workflow payload from webhook, manual trigger, or cron event.
 */

import type { INodeHandler, NodeExecutionContext, NodeExecutionResult } from "./types.js";

export class TriggerHandler implements INodeHandler {
  public async execute(ctx: NodeExecutionContext): Promise<NodeExecutionResult> {
    const config = ctx.nodeConfig;
    const samplePayload = (config.samplePayload as Record<string, unknown>) || {};
    
    // Combine samplePayload defaults with actual inputs provided
    const resolvedOutputs: Record<string, unknown> = {
      ...samplePayload,
      ...ctx.inputs,
    };

    // Ensure common fields are populated
    if (!resolvedOutputs.customer_message && resolvedOutputs.message) {
      resolvedOutputs.customer_message = resolvedOutputs.message;
    }
    if (!resolvedOutputs.customer_message && resolvedOutputs.text) {
      resolvedOutputs.customer_message = resolvedOutputs.text;
    }
    if (!resolvedOutputs.customerEmail && resolvedOutputs.email) {
      resolvedOutputs.customerEmail = resolvedOutputs.email;
    }

    return {
      status: "completed",
      outputs: resolvedOutputs,
    };
  }
}
