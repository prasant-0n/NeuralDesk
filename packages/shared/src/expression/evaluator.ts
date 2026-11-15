/**
 * NeuralDesk Safe Expression Evaluator
 * AST/Token-based boolean condition evaluation strictly forbidding eval() and new Function().
 * Hardened against ReDoS (ND-SEC-06) and Prototype Pollution (ND-SEC-10).
 */

export const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export function resolveContextPath(path: string, obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return undefined;
  }
  const parts = path.split(".");
  let current: any = obj;
  for (const part of parts) {
    if (FORBIDDEN_KEYS.has(part)) {
      return undefined;
    }
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    if (!Object.prototype.hasOwnProperty.call(current, part)) {
      // Fallback: If looking for a direct property e.g. "sentiment" and current contains "nodes", search node outputs
      if (parts.length === 1 && current && typeof current === "object") {
        const nodes = (current as any).nodes;
        if (nodes && typeof nodes === "object") {
          for (const nodeOut of Object.values(nodes)) {
            if (nodeOut && typeof nodeOut === "object" && Object.prototype.hasOwnProperty.call(nodeOut, part)) {
              return (nodeOut as any)[part];
            }
          }
        }
      }
      return undefined;
    }
    current = current[part];
  }
  return current;
}

export function parseLiteralValue(str: string): unknown {
  const trimmed = str.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  if (trimmed === "undefined") return undefined;
  if (!isNaN(Number(trimmed)) && trimmed !== "") {
    return Number(trimmed);
  }
  // Strip bounding quotes if present
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/**
 * Evaluates binary conditions safely against a context object without eval().
 * Supports: ==, ===, !=, !==, >, <, >=, <=, contains, matches, in, not_in, is_null, is_not_null,
 * as well as compound logical operators: && and ||.
 */
export function evaluateCondition(
  expression: string,
  context: Record<string, unknown>
): boolean {
  const trimmed = expression.trim();
  if (!trimmed) return false;

  // Handle compound OR (||) - lower precedence than &&
  if (trimmed.includes("||")) {
    const clauses = splitCompoundExpression(trimmed, "||");
    return clauses.some((clause) => evaluateCondition(clause, context));
  }

  // Handle compound AND (&&)
  if (trimmed.includes("&&")) {
    const clauses = splitCompoundExpression(trimmed, "&&");
    return clauses.every((clause) => evaluateCondition(clause, context));
  }

  // Normalize variable references e.g. {{trigger.score}} -> trigger.score
  const normalizedExpr = trimmed.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, "$1").trim();

  // Check unary operators: is_null / is_not_null
  const isNullMatch = normalizedExpr.match(/^\s*([a-zA-Z0-9_.]+)\s+(is_null|is_not_null)\s*$/i);
  if (isNullMatch) {
    const [, leftPath, unaryOp] = isNullMatch;
    const val = resolveContextPath(leftPath, context);
    if (unaryOp.toLowerCase() === "is_null") {
      return val === null || val === undefined;
    } else {
      return val !== null && val !== undefined;
    }
  }

  const regex = /^\s*([a-zA-Z0-9_.]+)\s*(===|==|!==|!=|>=|<=|>|<|contains|matches|not_in|in)\s*(.+)\s*$/i;
  const match = normalizedExpr.match(regex);
  if (!match) {
    // If expression is just a single truthy boolean or path
    const directVal = resolveContextPath(normalizedExpr, context);
    return Boolean(directVal);
  }

  const [, leftPath, rawOperator, rawRight] = match;
  const operator = rawOperator.toLowerCase();
  const leftValue = resolveContextPath(leftPath, context);
  const rightValue = parseLiteralValue(rawRight.trim());

  switch (operator) {
    case "==":
    case "===":
      return String(leftValue) === String(rightValue);
    case "!=":
    case "!==":
      return String(leftValue) !== String(rightValue);
    case ">":
      return Number(leftValue) > Number(rightValue);
    case "<":
      return Number(leftValue) < Number(rightValue);
    case ">=":
      return Number(leftValue) >= Number(rightValue);
    case "<=":
      return Number(leftValue) <= Number(rightValue);
    case "contains":
      if (Array.isArray(leftValue)) {
        return leftValue.some((item) => String(item).toLowerCase() === String(rightValue).toLowerCase());
      }
      return String(leftValue ?? "").toLowerCase().includes(String(rightValue ?? "").toLowerCase());
    case "matches":
      try {
        const rawPattern = String(rightValue);
        // ND-SEC-06: Guard against ReDoS (catastrophic backtracking)
        if (rawPattern.length > 64) return false;
        if (/(\+|\*|\{\d+,?\d*\}).*\1/.test(rawPattern) && /(\([^)]*(\+|\*)[^)]*\)(\+|\*))/.test(rawPattern)) {
          return false;
        }
        const pattern = new RegExp(rawPattern);
        const testTarget = String(leftValue ?? "");
        if (testTarget.length > 20000) return false;
        return pattern.test(testTarget);
      } catch {
        return false;
      }
    case "in":
      if (Array.isArray(rightValue)) {
        return rightValue.some((item) => String(item) === String(leftValue));
      }
      return String(rightValue ?? "").includes(String(leftValue ?? ""));
    case "not_in":
      if (Array.isArray(rightValue)) {
        return !rightValue.some((item) => String(item) === String(leftValue));
      }
      return !String(rightValue ?? "").includes(String(leftValue ?? ""));
    default:
      return false;
  }
}

/**
 * Splits expression by compound operator (|| or &&) while ignoring inside quotes.
 */
function splitCompoundExpression(expr: string, op: "||" | "&&"): string[] {
  const parts: string[] = [];
  let current = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      current += ch;
    } else if (ch === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      current += ch;
    } else if (
      !inSingleQuote &&
      !inDoubleQuote &&
      expr.startsWith(op, i)
    ) {
      parts.push(current.trim());
      current = "";
      i += op.length - 1;
    } else {
      current += ch;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}
