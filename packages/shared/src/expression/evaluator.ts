/**
 * NeuralDesk Safe Expression Evaluator
 * AST/Token-based boolean condition evaluation strictly forbidding eval() and new Function().
 */

export function resolveContextPath(path: string, obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return undefined;
  }
  const parts = path.split(".");
  let current: any = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
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
 * Supports: ==, !=, >, <, >=, <=, contains, matches
 */
export function evaluateCondition(
  expression: string,
  context: Record<string, unknown>
): boolean {
  // Normalize variable references e.g. {{trigger.score}} -> trigger.score
  const normalizedExpr = expression.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, "$1").trim();

  const regex = /^\s*([a-zA-Z0-9_.]+)\s*(===|==|!==|!=|>=|<=|>|<|contains|matches)\s*(.+)\s*$/;
  const match = normalizedExpr.match(regex);
  if (!match) {
    // If expression is just a single truthy boolean or path
    const directVal = resolveContextPath(normalizedExpr, context);
    return Boolean(directVal);
  }

  const [, leftPath, operator, rawRight] = match;
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
        const pattern = new RegExp(String(rightValue));
        return pattern.test(String(leftValue ?? ""));
      } catch {
        return false;
      }
    default:
      return false;
  }
}
