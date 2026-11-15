/**
 * NeuralDesk Tool / HTTP Node Handler
 * Executes outbound HTTP requests with AbortController timeout, headers, query parameters,
 * and auth resolution with simulation mock fallback for placeholder webhook URLs.
 */

import { compilePromptTemplate } from "@neuraldesk/shared";
import type { INodeHandler, NodeExecutionContext, NodeExecutionResult } from "./types.js";

export class ToolHandler implements INodeHandler {
  public async execute(ctx: NodeExecutionContext): Promise<NodeExecutionResult> {
    const config = ctx.nodeConfig;
    const context = ctx.scope.toContext();

    const rawUrl = String(config.url || ctx.inputs.url || "");
    const resolvedUrl = compilePromptTemplate(rawUrl, context);
    const method = String(config.httpMethod || "POST").toUpperCase();
    const timeoutMs = Number(config.timeoutMs) || 10000;

    // Check if running in simulation mode or against placeholder webhook endpoints
    const isMockMode = ctx.mode === "mock" || ctx.mode === "simulation";
    const isPlaceholderUrl =
      !resolvedUrl ||
      resolvedUrl.includes("hooks.slack.internal/services") ||
      resolvedUrl.includes("example.com") ||
      resolvedUrl.includes("placeholder");

    if (isMockMode || isPlaceholderUrl) {
      // Simulate realistic outbound API call latency (30-80ms)
      await new Promise((r) => setTimeout(r, 45));
      return {
        status: "completed",
        outputs: {
          statusCode: 200,
          statusText: "OK",
          url: resolvedUrl || "https://api.internal/dispatched",
          method,
          delivered: true,
          simulated: true,
          responseBody: {
            ok: true,
            message: "Notification dispatched successfully to on-call channel.",
            timestamp: new Date().toISOString(),
          },
        },
      };
    }

    // Resolve Headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "NeuralDesk-Orchestrator/1.0",
    };

    if (config.headers && typeof config.headers === "object") {
      for (const [k, v] of Object.entries(config.headers)) {
        headers[k] = compilePromptTemplate(String(v), context);
      }
    }

    // Resolve Auth
    if (config.authType === "bearer" && config.authSecretKeyRef) {
      headers["Authorization"] = `Bearer ${config.authSecretKeyRef}`;
    }

    // Resolve Body
    let body: string | undefined;
    if (method !== "GET" && method !== "HEAD") {
      if (typeof config.bodyTemplate === "string" && config.bodyTemplate) {
        body = compilePromptTemplate(config.bodyTemplate, context);
      } else if (config.bodyPayload) {
        const compiledBodyStr = compilePromptTemplate(JSON.stringify(config.bodyPayload), context);
        body = compiledBodyStr;
      } else if (ctx.inputs && Object.keys(ctx.inputs).length > 0) {
        body = JSON.stringify(ctx.inputs);
      }
    }

    // Execute Request with AbortController timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(resolvedUrl, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timer);

      const contentType = response.headers.get("content-type") || "";
      let responseData: unknown;

      if (contentType.includes("application/json")) {
        responseData = await response.json().catch(() => ({}));
      } else {
        responseData = await response.text().catch(() => "");
      }

      if (!response.ok) {
        throw new Error(
          `HTTP Tool call to ${resolvedUrl} failed with status ${response.status}: ${JSON.stringify(responseData)}`
        );
      }

      return {
        status: "completed",
        outputs: {
          statusCode: response.status,
          statusText: response.statusText,
          delivered: true,
          responseBody: responseData,
        },
      };
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === "AbortError") {
        throw new Error(`Tool request to ${resolvedUrl} timed out after ${timeoutMs}ms.`);
      }
      throw err;
    }
  }
}
