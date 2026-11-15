/**
 * NeuralDesk Mustache Prompt Template Compiler
 * Resolves dynamic Mustache variable tokens {{nodeKey.outputProperty}} from execution scope.
 */

import { resolveContextPath } from "./evaluator.js";

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

    if (!(rootKey in scope)) {
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
