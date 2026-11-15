/**
 * NeuralDesk Condition Node Handler
 * Pure AST boolean branch evaluator strictly forbidding eval().
 * Determines DAG routing path ('true' vs 'false') for downstream nodes.
 */

import { evaluateCondition, resolveContextPath } from "@neuraldesk/shared";
import type { INodeHandler, NodeExecutionContext, NodeExecutionResult } from "./types.js";

export class ConditionHandler implements INodeHandler {
  public async execute(ctx: NodeExecutionContext): Promise<NodeExecutionResult> {
    const config = ctx.nodeConfig;
    const context = ctx.scope.toContext();
    let isMet = false;

    if (typeof config.expression === "string" && config.expression.trim()) {
      isMet = evaluateCondition(config.expression, context);
    } else if (Array.isArray(config.rules) && config.rules.length > 0) {
      const logicalOp = (config.logicalOperator as string)?.toUpperCase() || "AND";
      const ruleResults: boolean[] = [];

      for (const rule of config.rules) {
        if (!rule || !rule.leftPath) continue;
        const leftVal = resolveContextPath(rule.leftPath, context);
        const op = rule.operator;
        const rightVal = rule.rightValue;

        let rulePassed = false;
        switch (op) {
          case "==":
          case "===":
            rulePassed = String(leftVal) === String(rightVal);
            break;
          case "!=":
          case "!==":
            rulePassed = String(leftVal) !== String(rightVal);
            break;
          case ">":
            rulePassed = Number(leftVal) > Number(rightVal);
            break;
          case "<":
            rulePassed = Number(leftVal) < Number(rightVal);
            break;
          case ">=":
            rulePassed = Number(leftVal) >= Number(rightVal);
            break;
          case "<=":
            rulePassed = Number(leftVal) <= Number(rightVal);
            break;
          case "contains":
            if (Array.isArray(leftVal)) {
              rulePassed = leftVal.some((item) => String(item).toLowerCase() === String(rightVal).toLowerCase());
            } else {
              rulePassed = String(leftVal ?? "").toLowerCase().includes(String(rightVal ?? "").toLowerCase());
            }
            break;
          case "matches":
            try {
              const regex = new RegExp(String(rightVal));
              rulePassed = regex.test(String(leftVal ?? ""));
            } catch {
              rulePassed = false;
            }
            break;
          case "is_null":
            rulePassed = leftVal === null || leftVal === undefined;
            break;
          case "is_not_null":
            rulePassed = leftVal !== null && leftVal !== undefined;
            break;
          default:
            rulePassed = Boolean(leftVal);
        }
        ruleResults.push(rulePassed);
      }

      if (logicalOp === "OR") {
        isMet = ruleResults.some(Boolean);
      } else {
        isMet = ruleResults.every(Boolean);
      }
    } else {
      // Fallback branch if configured, else default to truthiness of inputs
      const fallback = config.fallbackBranch === "true";
      isMet = fallback || Object.keys(ctx.inputs).length > 0;
    }

    const branch = isMet ? "true" : "false";

    return {
      status: "completed",
      branch,
      outputs: {
        result: isMet,
        branch,
        conditionMet: isMet,
        evaluatedAt: new Date().toISOString(),
      },
    };
  }
}
