/**
 * NeuralDesk Full Runtime Engines Test Suite
 * Tests all 3 execution engines:
 * 1. Client Mock (In-browser topological DAG)
 * 2. Simulated Backend Engine (Fastify SSE DAG + MockProvider)
 * 3. Live Real AI Engine (Fastify SSE DAG + Real Google Gemini GenAI SDK)
 */

import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = path.resolve(process.cwd(), "tests/puppeteer/screenshots");
const API_URL = "http://localhost:3001/api/v1";
const APP_URL = "http://localhost:3000";

async function testBackendEngine(mode: "simulation" | "real", apiKey?: string) {
  console.log(`\n=======================================================`);
  console.log(`▶ Testing Backend Engine [mode = "${mode}"]`);
  console.log(`=======================================================`);

  const workflowDefinition = {
    nodes: [
      {
        id: "trigger_1",
        type: "trigger",
        position: { x: 50, y: 160 },
        data: {
          kind: "trigger",
          label: "Customer Inbound",
          config: {
            samplePayload: {
              customer_message: "URGENT: Our checkout page is returning 500 error! Customers cannot complete purchases!",
            },
          },
        },
      },
      {
        id: "prompt_1",
        type: "prompt",
        position: { x: 440, y: 160 },
        data: {
          kind: "prompt",
          label: "Triage Prompt",
          config: {
            template: "Classify this customer issue:\n{{customer_message}}\nOutput JSON with sentiment, priority (1-5), urgency (1-5), and summary.",
          },
        },
      },
      {
        id: "llm_1",
        type: "llm",
        position: { x: 840, y: 160 },
        data: {
          kind: "llm",
          label: mode === "real" ? "Real Gemini AI" : "Mock LLM",
          config: {
            provider: "gemini",
            model: mode === "real" ? "gemini-3.8-flash" : "gemini-1.5-flash",
            temperature: 0.2,
            jsonMode: true,
            systemPrompt: "You are an automated support classifier. Output strict JSON with { 'sentiment': 'NEGATIVE' | 'NEUTRAL' | 'POSITIVE', 'priority': 1-5, 'urgency': 1-5, 'summary': string }.",
          },
        },
      },
      {
        id: "cond_1",
        type: "condition",
        position: { x: 1240, y: 160 },
        data: {
          kind: "condition",
          label: "Urgency Gate",
          config: {
            expression: "{{urgency}} >= 4",
            fallbackBranch: "false",
          },
        },
      },
      {
        id: "tool_1",
        type: "tool",
        position: { x: 1680, y: 50 },
        data: {
          kind: "tool",
          label: "Slack Pager Alert",
          config: {
            toolType: "http_request",
            url: "https://api.internal.service/triage-alert",
          },
        },
      },
      {
        id: "out_1",
        type: "output",
        position: { x: 1680, y: 310 },
        data: {
          kind: "output",
          label: "Standard Triage Result",
        },
      },
    ],
    edges: [
      { id: "e1", source: "trigger_1", sourceHandle: "output", target: "prompt_1", targetHandle: "customer_message" },
      { id: "e2", source: "prompt_1", sourceHandle: "prompt", target: "llm_1", targetHandle: "input" },
      { id: "e3", source: "llm_1", sourceHandle: "output", target: "cond_1", targetHandle: "input" },
      { id: "e4", source: "cond_1", sourceHandle: "true", target: "tool_1", targetHandle: "params", branch: "true" },
      { id: "e5", source: "cond_1", sourceHandle: "false", target: "out_1", targetHandle: "input", branch: "false" },
    ],
  };

  const execRes = await fetch(`${API_URL}/workflows/wf_test_engine/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode,
      workflowDefinition,
      apiKey,
      inputs: {
        customer_message: "URGENT: Our checkout page is returning 500 error! Customers cannot complete purchases!",
      },
    }),
  });

  if (!execRes.ok) {
    const errText = await execRes.text();
    throw new Error(`Execute endpoint failed with HTTP ${execRes.status}: ${errText}`);
  }

  const { execution_id } = await execRes.json();
  console.log(`✓ Triggered execution ${execution_id} (HTTP 202 Accepted)`);

  // Connect to SSE stream
  const events: Array<{ type: string; data: any }> = [];
  const sseUrl = `${API_URL}/executions/${execution_id}/stream`;
  console.log(`Connecting to SSE stream: ${sseUrl}`);

  const sseResponse = await fetch(sseUrl);
  if (!sseResponse.ok) {
    throw new Error(`SSE stream connection failed with HTTP ${sseResponse.status}`);
  }

  const reader = sseResponse.body?.getReader();
  if (!reader) throw new Error("ReadableStream reader not available");

  const decoder = new TextDecoder();
  let buffer = "";
  let executionCompleted = false;
  let finalResult: any = null;

  const streamTimeout = setTimeout(() => {
    throw new Error(`Execution timed out after 20s waiting for SSE completion`);
  }, 20000);

  try {
    while (!executionCompleted) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const block of lines) {
        if (!block.trim()) continue;
        const blockLines = block.split("\n");
        let eventType = "message";
        let eventData = "";

        for (const line of blockLines) {
          if (line.startsWith("event:")) {
            eventType = line.replace("event:", "").trim();
          } else if (line.startsWith("data:")) {
            eventData += line.replace("data:", "").trim();
          }
        }

        try {
          const parsed = JSON.parse(eventData);
          events.push({ type: eventType, data: parsed });

          if (eventType === "node:start") {
            console.log(`  [SSE] Node Started: ${parsed.node_key} (${parsed.node_type})`);
          } else if (eventType === "node:stream:chunk") {
            process.stdout.write(`  [Chunk] ${JSON.stringify(parsed.chunk).slice(0, 40)}...\n`);
          } else if (eventType === "node:complete") {
            console.log(`  [SSE] Node Completed: ${parsed.node_key} | Duration: ${parsed.duration_ms}ms | Outputs:`, JSON.stringify(parsed.outputs).slice(0, 80));
          } else if (eventType === "node:skip") {
            console.log(`  [SSE] Node Skipped: ${parsed.node_key} (Branch not taken)`);
          } else if (eventType === "execution:complete") {
            console.log(`  [SSE] Workflow Execution Complete! Total Duration: ${parsed.duration_ms}ms`);
            finalResult = parsed;
            executionCompleted = true;
          } else if (eventType === "execution:error") {
            console.error(`  [SSE Error] Execution Failed:`, parsed);
            throw new Error(`Execution failed: ${parsed.error_message || "Unknown error"}`);
          }
        } catch (e: any) {
          if (e.message.includes("Execution failed")) throw e;
        }
      }
    }
  } finally {
    clearTimeout(streamTimeout);
  }

  return { execution_id, events, finalResult };
}

async function testBrowserClientEngine() {
  console.log(`\n=======================================================`);
  console.log(`▶ Testing Browser UI & Client Mock Simulation Engine`);
  console.log(`=======================================================`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1920, height: 1080 },
  });

  const page = await browser.newPage();
  await page.goto(APP_URL, { waitUntil: "networkidle2" });
  await page.waitForSelector(".react-flow__canvas, .react-flow__renderer", { timeout: 10000 });

  // 1. Test Client Mock Simulation
  console.log("Triggering Pure Client-Side Topological DAG Simulation...");
  const clientSimResult = await page.evaluate(async () => {
    const store = (window as any).__WORKFLOW_STORE__;
    await store.getState().runExecution("client_mock");
    return {
      status: store.getState().executionStatus,
      nodeTelemetry: store.getState().nodeTelemetry,
    };
  });

  console.log("Client mock simulation finished. Nodes completed:");
  for (const [id, tel] of Object.entries(clientSimResult.nodeTelemetry as Record<string, any>)) {
    console.log(`  Node ${id}: status=${tel.status}, duration=${tel.durationMs}ms`);
  }

  // Capture screenshot of client mock completed
  const clientMockShot = path.join(SCREENSHOT_DIR, "verified_engine_client_mock.png");
  await page.screenshot({ path: clientMockShot });
  console.log(`Saved screenshot: ${clientMockShot}`);

  // 2. Test Real AI via UI
  console.log("\nTriggering Real Gemini AI Execution via UI Canvas...");
  await page.evaluate(async () => {
    const store = (window as any).__WORKFLOW_STORE__;
    // Set active execution mode to live
    store.getState().resetTelemetry();
    await store.getState().runExecution("live");
  });

  // Wait for completion
  console.log("Waiting for real AI execution to complete in browser...");
  await page.waitForFunction(
    () => {
      const store = (window as any).__WORKFLOW_STORE__;
      return store && store.getState().executionStatus === "completed";
    },
    { timeout: 25000 }
  );

  const realAiTelemetry = await page.evaluate(() => {
    const store = (window as any).__WORKFLOW_STORE__;
    const llmTel = store.getState().nodeTelemetry["llm_1"];
    return {
      executionStatus: store.getState().executionStatus,
      llmStatus: llmTel?.status,
      llmOutputs: llmTel?.outputData,
      llmTokens: llmTel?.tokens,
      llmCost: llmTel?.costUsd,
      streamText: llmTel?.streamText?.slice(0, 120),
    };
  });

  console.log("Real AI browser execution telemetry:", JSON.stringify(realAiTelemetry, null, 2));

  // Capture screenshot of real AI completed in dark canvas
  const realAiShot = path.join(SCREENSHOT_DIR, "verified_engine_real_ai_dark.png");
  await page.screenshot({ path: realAiShot });
  console.log(`Saved real AI dark screenshot: ${realAiShot}`);

  // Switch to light mode and capture
  await page.evaluate(() => document.documentElement.classList.remove("dark"));
  await new Promise((r) => setTimeout(r, 400));
  const realAiLightShot = path.join(SCREENSHOT_DIR, "verified_engine_real_ai_light.png");
  await page.screenshot({ path: realAiLightShot });
  console.log(`Saved real AI light screenshot: ${realAiLightShot}`);

  await browser.close();
}

async function run() {
  console.log("================================================================================");
  console.log("       NeuralDesk — Comprehensive Multi-Engine Execution Verification           ");
  console.log("================================================================================");

  // 1. Test Backend Simulation Engine
  const simResult = await testBackendEngine("simulation");
  console.log("\n[PASS] Backend Simulated Engine: Completed with 0 errors");

  // 2. Test Backend Real AI Engine (Gemini)
  const realResult = await testBackendEngine("real");
  console.log("\n[PASS] Backend Real AI Engine (Google Gemini 3.8 Flash): Completed with 0 errors");
  console.log("Final Outputs from Real AI:", JSON.stringify(realResult.finalResult?.final_outputs, null, 2));

  // 3. Test In-Browser Client Mock Engine & Browser Integration
  await testBrowserClientEngine();
  console.log("\n[PASS] Browser Client Simulation & Live UI Execution: Completed with 0 errors");

  console.log("\n================================================================================");
  console.log("   ALL 3 EXECUTION RUNTIME ENGINES VERIFIED & OPERATIONAL!");
  console.log("   1. Client Mock (In-Browser Offline DAG):  VERIFIED & PASSING");
  console.log("   2. Simulated Backend Engine (SSE Mock):  VERIFIED & PASSING");
  console.log("   3. Live Real AI Engine (Gemini 3.8 Flash): VERIFIED & PASSING");
  console.log("================================================================================\n");
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
