/**
 * NeuralDesk Execution Scope & Variable Resolution Context
 * Manages runtime scope resolution for Mustache templates and safe AST expression evaluation.
 * Supports {{nodes.*}}, {{steps.*}}, {{trigger.*}}, {{env.*}}, {{$execution.*}}, and direct node keys.
 */

export class ExecutionScope {
  private readonly executionId: string;
  private readonly workflowId: string;
  private readonly mode: string;
  private readonly initialInputs: Record<string, unknown>;
  private readonly nodeOutputs: Map<string, Record<string, unknown>> = new Map();
  private lastNodeKey?: string;

  constructor(
    executionId: string,
    workflowId: string,
    mode: string,
    initialInputs: Record<string, unknown> = {}
  ) {
    this.executionId = executionId;
    this.workflowId = workflowId;
    this.mode = mode;
    this.initialInputs = { ...initialInputs };
  }

  /**
   * Records completed outputs of a node into scope.
   */
  public setNodeOutput(nodeKey: string, output: Record<string, unknown>): void {
    this.nodeOutputs.set(nodeKey, output);
    this.lastNodeKey = nodeKey;
  }

  public getNodeOutput(nodeKey: string): Record<string, unknown> | undefined {
    return this.nodeOutputs.get(nodeKey);
  }

  public getLastOutput(): Record<string, unknown> | undefined {
    return this.lastNodeKey ? this.nodeOutputs.get(this.lastNodeKey) : undefined;
  }

  public getAllOutputs(): Record<string, Record<string, unknown>> {
    const result: Record<string, Record<string, unknown>> = {};
    for (const [k, v] of this.nodeOutputs.entries()) {
      result[k] = v;
    }
    return result;
  }

  /**
   * Generates a context dictionary for expression evaluation and template interpolation.
   */
  public toContext(currentInputs?: Record<string, unknown>): Record<string, unknown> {
    const nodesObj: Record<string, unknown> = {};
    const stepsObj: Record<string, unknown> = {};
    const flatNodeOutputs: Record<string, unknown> = {};
    const reservedKeys = new Set(["nodes", "steps", "trigger", "$execution", "env"]);

    for (const [key, val] of this.nodeOutputs.entries()) {
      nodesObj[key] = val;
      stepsObj[key] = {
        output: val,
        ...val,
      };

      // Flatten upstream outputs so keys like sentiment, urgency, priority are directly accessible
      if (typeof val === "object" && val !== null) {
        for (const [propKey, propVal] of Object.entries(val)) {
          if (!reservedKeys.has(propKey)) {
            flatNodeOutputs[propKey] = propVal;
          }
        }
      }
    }

    const context: Record<string, unknown> = {
      ...flatNodeOutputs,
      trigger: { ...this.initialInputs },
      ...this.initialInputs,
      ...(currentInputs || {}),
      nodes: nodesObj,
      steps: stepsObj,
      $execution: {
        id: this.executionId,
        workflowId: this.workflowId,
        mode: this.mode,
      },
      env: {
        NODE_ENV: process.env.NODE_ENV || "development",
        ...process.env,
      },
    };

    // Also populate direct node references e.g. {{gemini_sentiment.urgencyScore}}
    for (const [key, val] of this.nodeOutputs.entries()) {
      context[key] = {
        output: val,
        ...val,
      };
    }

    return context;
  }
}
