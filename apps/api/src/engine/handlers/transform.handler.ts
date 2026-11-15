/**
 * NeuralDesk Transform Node Handler
 * Pure, safe functional data manipulation without eval().
 * Supports json_pick, string_template, regex_extract, math_op, and type_cast.
 */

import { compilePromptTemplate, resolveContextPath } from "@neuraldesk/shared";
import type { INodeHandler, NodeExecutionContext, NodeExecutionResult } from "./types.js";

export class TransformHandler implements INodeHandler {
  public async execute(ctx: NodeExecutionContext): Promise<NodeExecutionResult> {
    const config = ctx.nodeConfig;
    const context = ctx.scope.toContext();
    const rules = Array.isArray(config.rules) ? config.rules : [];
    const outputs: Record<string, unknown> = {};

    for (const rule of rules) {
      if (!rule || !rule.targetKey) continue;
      const targetKey = rule.targetKey;
      const op = rule.operation || config.transformType || "json_pick";
      const sourceExpr = String(rule.sourceExpression || "");

      let val: unknown = undefined;

      switch (op) {
        case "json_pick": {
          val = resolveContextPath(sourceExpr, context);
          break;
        }
        case "string_template": {
          val = compilePromptTemplate(sourceExpr, context);
          break;
        }
        case "regex_extract": {
          const text = String(resolveContextPath(sourceExpr, context) ?? "");
          const pattern = rule.pattern ? new RegExp(String(rule.pattern)) : /(.+)/;
          const match = text.match(pattern);
          val = match ? (match[1] !== undefined ? match[1] : match[0]) : null;
          break;
        }
        case "math_op": {
          val = this.executeMathOp(sourceExpr, rule.mathOperation || "add", context);
          break;
        }
        case "type_cast": {
          const raw = resolveContextPath(sourceExpr, context);
          val = this.executeTypeCast(raw, rule.targetType || "string");
          break;
        }
        case "array_map": {
          const arr = resolveContextPath(sourceExpr, context);
          if (Array.isArray(arr) && rule.mapField) {
            val = arr.map((item) => (typeof item === "object" && item !== null ? item[rule.mapField] : item));
          } else {
            val = arr;
          }
          break;
        }
        default: {
          val = resolveContextPath(sourceExpr, context) ?? compilePromptTemplate(sourceExpr, context);
          break;
        }
      }

      outputs[targetKey] = val !== undefined ? val : rule.defaultValue;
    }

    // If no rules were specified, passthrough inputs with shallow clone
    if (rules.length === 0) {
      return {
        status: "completed",
        outputs: { ...ctx.inputs },
      };
    }

    return {
      status: "completed",
      outputs,
    };
  }

  private executeMathOp(expr: string, operation: string, context: Record<string, unknown>): number {
    const parts = expr.split(",").map((s) => Number(resolveContextPath(s.trim(), context) ?? s.trim()));
    const valid = parts.filter((n) => !isNaN(n));
    if (valid.length === 0) return 0;

    switch (operation) {
      case "add":
      case "+":
        return valid.reduce((a, b) => a + b, 0);
      case "subtract":
      case "-":
        return valid.reduce((a, b) => a - b);
      case "multiply":
      case "*":
        return valid.reduce((a, b) => a * b, 1);
      case "divide":
      case "/":
        return valid.length > 1 && valid[1] !== 0 ? valid[0] / valid[1] : 0;
      case "min":
        return Math.min(...valid);
      case "max":
        return Math.max(...valid);
      case "round":
        return Math.round(valid[0]);
      default:
        return valid[0];
    }
  }

  private executeTypeCast(raw: unknown, targetType: string): unknown {
    switch (targetType.toLowerCase()) {
      case "number":
      case "int":
      case "float":
        return Number(raw);
      case "boolean":
      case "bool":
        return Boolean(raw && raw !== "false" && raw !== "0");
      case "array":
        return Array.isArray(raw) ? raw : [raw];
      case "string":
      default:
        return typeof raw === "object" ? JSON.stringify(raw) : String(raw ?? "");
    }
  }
}
