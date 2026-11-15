# 06. Security — Sandboxing & Safety Architecture

[← Back to Documentation Portal](../README.md) | [← Zero-Leak Secrets](./zero-leak-secrets.md) | [Next Section: DevOps →](../07-devops/docker.md)

---

## 2.1 Zero-`eval()` AST Evaluation Guard

NeuralDesk bans JavaScript `eval()`, `new Function()`, and Node's `vm` module. Condition and Transform nodes are evaluated via safe regex and recursive descent token parsing:

```typescript
export function evaluateCondition(
  expression: string,
  context: Record<string, unknown>
): boolean {
  const regex = /^\s*([a-zA-Z0-9_.]+)\s*(==|!=|>=|<=|>|<|contains)\s*(.+)\s*$/;
  const match = expression.match(regex);
  if (!match) return false;

  const [, leftPath, operator, rawRight] = match;
  const leftValue = resolveContextPath(leftPath, context);
  const rightValue = parseLiteralValue(rawRight.trim());

  switch (operator) {
    case "==": return leftValue == rightValue;
    case "!=": return leftValue != rightValue;
    case ">": return Number(leftValue) > Number(rightValue);
    case "<": return Number(leftValue) < Number(rightValue);
    case ">=": return Number(leftValue) >= Number(rightValue);
    case "<=": return Number(leftValue) <= Number(rightValue);
    case "contains":
      return String(leftValue).toLowerCase().includes(String(rightValue).toLowerCase());
    default:
      return false;
  }
}

function resolveContextPath(path: string, obj: unknown): unknown {
  return path.split(".").reduce((acc: any, part) => acc?.[part], obj);
}

function parseLiteralValue(str: string): unknown {
  if (str === "true") return true;
  if (str === "false") return false;
  if (!isNaN(Number(str))) return Number(str);
  return str.replace(/^["']|["']$/g, "");
}
```

---

## 2.2 Prototype Pollution & Injection Guards

Object traversal blocks dangerous property paths:

```typescript
export function safeGetProperty(obj: any, path: string): unknown {
  const dangerousKeys = ["__proto__", "constructor", "prototype"];
  const parts = path.split(".");
  let current = obj;

  for (const part of parts) {
    if (dangerousKeys.includes(part)) return undefined;
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}
```

---

## 2.3 Rate Limiting & Defense-in-Depth

* Free tier workspaces are rate-limited to **10 workflow executions per minute**.
* Inbound webhooks enforce a strict 300-second signature timestamp tolerance to block replay attacks.
* Strict Content Security Policy (CSP) and CORS restrict origins to configured production domains.

---

[← Previous: Zero-Leak Secrets](./zero-leak-secrets.md) | [Next Section: DevOps →](../07-devops/docker.md)
