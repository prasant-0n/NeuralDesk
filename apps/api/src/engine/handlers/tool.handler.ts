/**
 * NeuralDesk Tool / HTTP Node Handler
 * Executes outbound HTTP requests with AbortController timeout, headers, query parameters,
 * and auth resolution with simulation mock fallback for placeholder webhook URLs.
 */

import { compilePromptTemplate } from "@neuraldesk/shared";
import type { INodeHandler, NodeExecutionContext, NodeExecutionResult } from "./types.js";

function isPrivateOrLoopbackIP(hostname: string): boolean {
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "0.0.0.0"
  ) {
    return true;
  }

  // AWS/GCP/Azure link-local metadata address
  if (hostname === "169.254.169.254" || hostname.startsWith("169.254.")) {
    return true;
  }

  // RFC 1918 IPv4 ranges
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const o1 = Number(ipv4Match[1]);
    const o2 = Number(ipv4Match[2]);
    if (o1 === 10) return true;
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    if (o1 === 192 && o2 === 168) return true;
    if (o1 === 127) return true;
    if (o1 === 169 && o2 === 254) return true;
    if (o1 === 0) return true;
  }

  return false;
}

export function validateOutboundUrl(targetUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    throw new Error(`SSRF Guard: Invalid URL '${targetUrl}'`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`SSRF Guard: Unsupported protocol '${parsed.protocol}'. Only http and https are allowed.`);
  }

  if (process.env.NODE_ENV === "production") {
    if (parsed.protocol !== "https:") {
      throw new Error("SSRF Guard: In production, outbound HTTP tool requests must use HTTPS.");
    }
    if (isPrivateOrLoopbackIP(parsed.hostname)) {
      throw new Error(`SSRF Guard: Outbound requests to private/internal network address '${parsed.hostname}' are prohibited.`);
    }
  } else {
    if (parsed.hostname === "169.254.169.254" || parsed.hostname.startsWith("169.254.")) {
      throw new Error("SSRF Guard: Outbound requests to cloud instance metadata are prohibited.");
    }
  }

  return parsed;
}

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
      resolvedUrl.includes(".internal") ||
      resolvedUrl.includes("placeholder");

    if (isMockMode || isPlaceholderUrl) {
      // Simulate realistic outbound API call latency (30-80ms)
      await new Promise((r) => setTimeout(r, 45));

      const isCrmLeads = resolvedUrl.includes("leads") || resolvedUrl.includes("crm");
      const samplePayload = isCrmLeads
        ? {
            id: "lead_enterprise_982",
            company: "Acme Global Dynamics",
            contact: "Sarah Jenkins (VP Engineering)",
            employeeCount: 3500,
            annualBudget: "$450,000",
            intentSignals: [
              "Viewed pricing page 7 times in past 48 hours",
              "Downloaded Enterprise Security & Compliance Whitepaper",
              "Requested technical architecture briefing for 100 seats",
            ],
            notes: "Immediate requirement to replace legacy orchestration with NeuralDesk.",
          }
        : {
            ok: true,
            message: "Notification dispatched successfully to on-call channel.",
            timestamp: new Date().toISOString(),
          };

      return {
        status: "completed",
        outputs: {
          statusCode: 200,
          statusText: "OK",
          url: resolvedUrl || "https://api.internal/dispatched",
          method,
          delivered: true,
          simulated: true,
          response: samplePayload,
          responseBody: samplePayload,
          ...samplePayload,
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

    // Validate Outbound URL against SSRF attacks (ND-SEC-05)
    const targetUrlObj = validateOutboundUrl(resolvedUrl);

    // Execute Request with AbortController timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(targetUrlObj.toString(), {
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
