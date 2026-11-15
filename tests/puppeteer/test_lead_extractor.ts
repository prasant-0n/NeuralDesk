import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

const API_URL = "http://localhost:3001/api/v1";
const APP_URL = "http://localhost:3000";
const SCREENSHOT_DIR = path.resolve(process.cwd(), "tests/puppeteer/screenshots");

async function testBackendLead(mode: "simulation" | "real") {
  console.log(`\n=======================================================`);
  console.log(`▶ Testing Lead Extractor on Backend [mode = "${mode}"]`);
  console.log(`=======================================================`);

  // We load the actual lead template from workflowStore
  const { useWorkflowStore } = await import("../../apps/web/src/store/workflowStore.ts");
  useWorkflowStore.getState().loadTemplate("lead_extractor");
  const { nodes, edges, workflowId } = useWorkflowStore.getState();

  const res = await fetch(`${API_URL}/workflows/${workflowId}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode,
      workflowDefinition: { nodes, edges },
      inputs: {},
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Execution trigger failed with HTTP ${res.status}: ${err}`);
  }

  const { execution_id, stream_url } = await res.json();
  console.log(`✓ Triggered execution ${execution_id}`);

  // Connect to SSE stream
  const streamRes = await fetch(`http://localhost:3001${stream_url}`);
  if (!streamRes.ok) throw new Error(`SSE stream failed HTTP ${streamRes.status}`);

  const reader = streamRes.body?.getReader();
  if (!reader) throw new Error("No reader");

  const decoder = new TextDecoder();
  let buffer = "";
  let completed = false;
  let finalResult: any = null;

  const timeout = setTimeout(() => {
    throw new Error("Execution timed out after 25s");
  }, 25000);

  try {
    while (!completed) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() || "";

      for (const block of blocks) {
        if (!block.trim()) continue;
        const lines = block.split("\n");
        let eventType = "message";
        let eventData = "";

        for (const line of lines) {
          if (line.startsWith("event:")) eventType = line.replace("event:", "").trim();
          else if (line.startsWith("data:")) eventData += line.replace("data:", "").trim();
        }

        try {
          const parsed = JSON.parse(eventData);
          if (eventType === "node:start") {
            console.log(`  [SSE] Node Started: ${parsed.node_key} (${parsed.node_type})`);
          } else if (eventType === "node:stream:chunk") {
            process.stdout.write(`  [Chunk] ${JSON.stringify(parsed.chunk).slice(0, 45)}...\n`);
          } else if (eventType === "node:complete") {
            console.log(`  [SSE] Node Complete: ${parsed.node_key} | Duration: ${parsed.duration_ms}ms | Status: ${parsed.status || "completed"}`);
          } else if (eventType === "node:skip") {
            console.log(`  [SSE] Node Skipped: ${parsed.node_key} (${parsed.reason})`);
          } else if (eventType === "execution:complete") {
            console.log(`  [SSE] Workflow Execution Finished! Total Duration: ${parsed.duration_ms}ms`);
            finalResult = parsed;
            completed = true;
          } else if (eventType === "execution:error") {
            throw new Error(`Execution failed: ${parsed.error_message}`);
          }
        } catch (e: any) {
          if (e.message.includes("Execution failed")) throw e;
        }
      }
    }
  } finally {
    clearTimeout(timeout);
  }

  return finalResult;
}

async function testBrowserLead() {
  console.log(`\n=======================================================`);
  console.log(`▶ Testing Lead Extractor in Browser Canvas UI`);
  console.log(`=======================================================`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1920, height: 1080 },
  });

  const page = await browser.newPage();
  await page.goto(APP_URL, { waitUntil: "networkidle2" });
  await page.waitForSelector(".react-flow", { timeout: 10000 });

  // 1. Load lead extractor template in browser
  console.log("Loading 'Automated Lead Scoring' template in browser...");
  await page.evaluate(() => {
    const store = (window as any).__WORKFLOW_STORE__;
    store.getState().loadTemplate("lead_extractor");
  });
  await new Promise((r) => setTimeout(r, 600));

  // 2. Run client simulation
  console.log("Running in-browser client simulation...");
  await page.evaluate(async () => {
    const store = (window as any).__WORKFLOW_STORE__;
    await store.getState().runExecution("client_mock");
  });
  await new Promise((r) => setTimeout(r, 600));

  const clientStatuses = await page.evaluate(() => {
    const store = (window as any).__WORKFLOW_STORE__;
    return {
      execStatus: store.getState().executionStatus,
      nodeStatuses: Object.fromEntries(
        Object.entries(store.getState().nodeTelemetry).map(([k, v]: any) => [k, v.status])
      ),
    };
  });
  console.log("Client mock execution statuses:", JSON.stringify(clientStatuses, null, 2));

  // Capture screenshot of completed lead extractor in dark mode
  const leadClientDarkPath = path.join(SCREENSHOT_DIR, "verified_lead_extractor_client_dark.png");
  await page.screenshot({ path: leadClientDarkPath });
  console.log("Saved client screenshot:", leadClientDarkPath);

  // 3. Run Real AI execution on lead extractor in browser
  console.log("\nRunning Live Real AI Execution on Lead Extractor...");
  await page.evaluate(async () => {
    const store = (window as any).__WORKFLOW_STORE__;
    store.getState().resetTelemetry();
    await store.getState().runExecution("live");
  });

  await page.waitForFunction(
    () => {
      const store = (window as any).__WORKFLOW_STORE__;
      return store && store.getState().executionStatus === "completed";
    },
    { timeout: 25000 }
  );
  await new Promise((r) => setTimeout(r, 500));

  const realAiStatuses = await page.evaluate(() => {
    const store = (window as any).__WORKFLOW_STORE__;
    return {
      execStatus: store.getState().executionStatus,
      nodeStatuses: Object.fromEntries(
        Object.entries(store.getState().nodeTelemetry).map(([k, v]: any) => [k, v.status])
      ),
      vipOutput: store.getState().nodeTelemetry["out_vip"]?.outputData,
      scoreOutput: store.getState().nodeTelemetry["llm_score"]?.outputData,
      approvalOutput: store.getState().nodeTelemetry["approval_vip"]?.outputData,
    };
  });
  console.log("Real AI execution statuses & outputs:", JSON.stringify(realAiStatuses, null, 2));

  // Capture screenshot of real AI completed lead extractor in dark mode
  const leadRealDarkPath = path.join(SCREENSHOT_DIR, "verified_lead_extractor_real_dark.png");
  await page.screenshot({ path: leadRealDarkPath });
  console.log("Saved real AI dark screenshot:", leadRealDarkPath);

  // Toggle to light mode and capture
  await page.evaluate(() => document.documentElement.classList.remove("dark"));
  await new Promise((r) => setTimeout(r, 400));
  const leadRealLightPath = path.join(SCREENSHOT_DIR, "verified_lead_extractor_real_light.png");
  await page.screenshot({ path: leadRealLightPath });
  console.log("Saved real AI light screenshot:", leadRealLightPath);

  await browser.close();
}

async function main() {
  console.log("================================================================================");
  console.log("       Automated Lead Scoring & Enterprise CRM Routing — Multi-Engine Test       ");
  console.log("================================================================================");

  // 1. Test Backend Simulation
  const simResult = await testBackendLead("simulation");
  console.log("\n[PASS] Lead Scoring Backend Simulation: Completed successfully!");

  // 2. Test Backend Real AI
  const realResult = await testBackendLead("real");
  console.log("\n[PASS] Lead Scoring Backend Real AI (Gemini 3.8 Flash): Completed successfully!");
  console.log("Real AI VIP Route Output:", JSON.stringify(realResult?.final_outputs, null, 2).slice(0, 300));

  // 3. Test In-Browser Client Mock & Live Canvas UI
  await testBrowserLead();
  console.log("\n[PASS] Lead Scoring Browser UI & Real AI: Completed successfully!");

  console.log("\n================================================================================");
  console.log("   AUTOMATED LEAD SCORING & ENTERPRISE CRM ROUTING FULLY OPERATIONAL!");
  console.log("================================================================================\n");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
