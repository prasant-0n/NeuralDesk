/**
 * NeuralDesk Mustache Prompt Template Compiler
 * Resolves dynamic Mustache variable tokens {{nodeKey.outputProperty}} from execution scope.
 */

import { resolveContextPath, FORBIDDEN_KEYS } from "./evaluator.js";

/**
 * Interpolates template strings with values from the node execution scope.
 * Syntax: {{nodeKey.property}} or {{nodeKey}}
 */
export function compilePromptTemplate(
  template: string,
  scope: Record<string, unknown>
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (match, path: string) => {
    const parts = path.split(".");
    const rootKey = parts[0];

    // ND-SEC-10: Reject prototype traversal
    if (FORBIDDEN_KEYS.has(rootKey)) {
      return match;
    }

    if (!Object.prototype.hasOwnProperty.call(scope, rootKey)) {
      const fallbackVal = resolveContextPath(path, scope);
      if (fallbackVal !== undefined && fallbackVal !== null) {
        return typeof fallbackVal === "object" ? JSON.stringify(fallbackVal) : String(fallbackVal);
      }
      return match; // Return unchanged if root key not present
    }

    if (parts.length === 1) {
      const val = scope[rootKey];
      if (val === undefined || val === null) return "";
      return typeof val === "object" ? JSON.stringify(val) : String(val);
    }

    const subPath = parts.slice(1).join(".");
    const nodeOutputs = scope[rootKey];
    const val = resolveContextPath(subPath, nodeOutputs);

    if (val === undefined || val === null) {
      return "";
    }

    return typeof val === "object" ? JSON.stringify(val) : String(val);
  });
}
