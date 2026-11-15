import { test, expect } from "@playwright/test";

/**
 * NeuralDesk Playwright End-to-End Test Suite
 *
 * Covers 5 Critical Enterprise User Journeys:
 * 1. Canvas Render & Template Loading
 * 2. Edge Wiring & Cycle Prevention (Acyclic Graph Invariant & Error Handling)
 * 3. Workflow Execution & Telemetry (SSE/Simulation, Node Halos, Economics)
 * 4. Dark/Light Theme Switching & State Persistence
 * 5. Multi-View Navigation (Canvas, Dashboard, Executions, Agent Studio, Settings)
 */

test.describe("NeuralDesk E2E Workflow Journeys", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local web client
    await page.goto("/");
    // Wait for initial render and React Flow canvas mounting
    await page.waitForSelector(".react-flow__renderer", { state: "visible" });
  });

  // ============================================================================
  // Journey 1: Canvas Render & Template Loading
  // ============================================================================
  test("Journey 1: Canvas Render & Template Loading", async ({ page }) => {
    // 1. Verify canvas container and default nodes exist on DOM
    const canvas = page.locator(".react-flow__renderer");
    await expect(canvas).toBeVisible();

    const nodes = page.locator(".react-flow__node");
    await expect(nodes).toHaveCount(6);

    // Verify default 'Customer Support Triage' nodes are rendered
    await expect(page.locator('.react-flow__node:has-text("Customer Inbound")')).toBeVisible();
    await expect(page.locator('.react-flow__node:has-text("Triage Classifier")')).toBeVisible();
    await expect(page.locator('.react-flow__node:has-text("Gemini 1.5 Flash")')).toBeVisible();
    await expect(page.locator('.react-flow__node:has-text("Urgency Gate")')).toBeVisible();
    await expect(page.locator('.react-flow__node:has-text("Slack Pager Alert")')).toBeVisible();
    await expect(page.locator('.react-flow__node:has-text("Standard Triage Result")')).toBeVisible();

    // Verify initial workflow title
    const titleInput = page.locator('input[title="Click to edit workflow name"]');
    await expect(titleInput).toHaveValue("Customer Support Triage & Auto-Escalation");

    // 2. Open Templates dropdown and load alternative template: 'Document Summarizer'
    const templatesBtn = page.getByRole("button", { name: "Templates" });
    await templatesBtn.click();

    const docSummarizerOption = page.getByRole("button", { name: "Document Summarizer" });
    await expect(docSummarizerOption).toBeVisible();
    await docSummarizerOption.click();

    // Verify nodes updated for Document Summarizer template
    await expect(titleInput).toHaveValue("Document Summarizer & Executive Briefing");
    await expect(page.locator('.react-flow__node:has-text("Manual Document Input")')).toBeVisible();
    await expect(page.locator('.react-flow__node:has-text("Gemini 1.5 Pro")')).toBeVisible();

    // 3. Switch back to 'Customer Support Triage' template
    await templatesBtn.click();
    const supportTriageOption = page.getByRole("button", { name: "Customer Support Triage" });
    await expect(supportTriageOption).toBeVisible();
    await supportTriageOption.click();

    // Verify Customer Support Triage nodes are restored on the DOM
    await expect(titleInput).toHaveValue("Customer Support Triage & Auto-Escalation");
    await expect(page.locator('.react-flow__node:has-text("Customer Inbound")')).toBeVisible();
    await expect(page.locator('.react-flow__node:has-text("Triage Classifier")')).toBeVisible();
    await expect(page.locator('.react-flow__node:has-text("Gemini 1.5 Flash")')).toBeVisible();
    await expect(page.locator('.react-flow__node:has-text("Urgency Gate")')).toBeVisible();
    await expect(nodes).toHaveCount(6);
  });

  // ============================================================================
  // Journey 2: Edge Wiring & Cycle Prevention
  // ============================================================================
  test("Journey 2: Edge Wiring & Cycle Prevention", async ({ page }) => {
    // 1. Verify initial edges render on DOM
    const initialEdges = page.locator(".react-flow__edge");
    const initialEdgeCount = await initialEdges.count();
    expect(initialEdgeCount).toBeGreaterThanOrEqual(5);

    // 2. Add a new node to canvas via the Node Palette
    const transformPaletteItem = page.locator('.group:has-text("JSON Transform")').first();
    await transformPaletteItem.click();

    // Verify a new node is added to the DOM
    const nodes = page.locator(".react-flow__node");
    await expect(nodes).toHaveCount(7);
    await expect(page.locator('.react-flow__node:has-text("JSON Transform")')).toBeVisible();

    // Inspect the added node ID via the Zustand store
    const addedNodeId = await page.evaluate(() => {
      const store = (window as any).__WORKFLOW_STORE__?.getState();
      const lastNode = store?.nodes[store.nodes.length - 1];
      return lastNode ? lastNode.id : null;
    });
    expect(addedNodeId).toBeTruthy();

    // 3. Connect a valid forward edge: out_1 -> addedNodeId
    await page.evaluate((targetId) => {
      const store = (window as any).__WORKFLOW_STORE__?.getState();
      store?.onConnect({
        source: "out_1",
        sourceHandle: "output",
        target: targetId,
        targetHandle: "input",
      });
    }, addedNodeId);

    // Verify edge count increased by 1 and graph is acyclic
    const updatedEdgeCount = await page.evaluate(() => {
      return (window as any).__WORKFLOW_STORE__?.getState().edges.length;
    });
    expect(updatedEdgeCount).toBe(initialEdgeCount + 1);

    // 4. Attempt to connect a backward edge that creates a DIRECTED CYCLE:
    // (addedNodeId -> trigger_1), which would create a cycle: trigger_1 -> ... -> out_1 -> addedNodeId -> trigger_1
    const consoleWarnings: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "warning" || msg.type() === "warn") {
        consoleWarnings.push(msg.text());
      }
    });

    await page.evaluate((sourceId) => {
      const store = (window as any).__WORKFLOW_STORE__?.getState();
      store?.onConnect({
        source: sourceId,
        sourceHandle: "output",
        target: "trigger_1",
        targetHandle: "input",
      });
    }, addedNodeId);

    // Verify the cyclic edge was REJECTED by Kahn's algorithm invariant
    const edgeCountAfterCycleAttempt = await page.evaluate(() => {
      return (window as any).__WORKFLOW_STORE__?.getState().edges.length;
    });
    expect(edgeCountAfterCycleAttempt).toBe(updatedEdgeCount); // Unchanged!
    expect(consoleWarnings.some((w) => w.includes("Directed cycle detected"))).toBe(true);

    // 5. Test Error Handling for cyclic DAG execution:
    // If a cyclic graph is forcefully passed to simulation, verify error handling alert
    let alertMessage = "";
    page.once("dialog", async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await page.evaluate(() => {
      const store = (window as any).__WORKFLOW_STORE__?.getState();
      // Introduce an edge that forms a cycle for validation test
      store.edges.push({
        id: "cyclic_edge_test",
        source: "out_1",
        target: "trigger_1",
      });
      // Trigger execution which validates Kahn topological sort
      return store.runClientSimulation();
    });

    // Verify validation error was surfaced via alert dialog
    expect(alertMessage).toMatch(/cycle/i);

    // Verify execution status was marked as 'failed'
    const execStatus = await page.evaluate(() => {
      return (window as any).__WORKFLOW_STORE__?.getState().executionStatus;
    });
    expect(execStatus).toBe("failed");
  });

  // ============================================================================
  // Journey 3: Workflow Execution & Telemetry
  // ============================================================================
  test("Journey 3: Workflow Execution & Telemetry", async ({ page }) => {
    // 1. Ensure clean default support triage template
    const templatesBtn = page.getByRole("button", { name: "Templates" });
    await templatesBtn.click();
    await page.getByRole("button", { name: "Customer Support Triage" }).click();

    // 2. Verify Run Workflow button is ready
    const runBtn = page.getByRole("button", { name: "Run Workflow" });
    await expect(runBtn).toBeVisible();

    // 3. Click Run Workflow to trigger execution
    await runBtn.click();

    // 4. Verify execution enters running state:
    // Stop Execution button appears
    await expect(page.getByRole("button", { name: "Stop Execution" })).toBeVisible({ timeout: 5000 });

    // 5. Verify node halo classes during and after execution
    // Execution will complete either via SSE or local simulation
    // Wait for the execution to finish
    await expect(page.getByRole("button", { name: "Run Workflow" })).toBeVisible({ timeout: 20000 });

    // 6. Verify completion status in UI
    await expect(page.locator("text=Executed")).toBeVisible();

    // Verify nodes have acquired the `.node-completed` halo class
    const completedHalos = page.locator(".node-completed");
    await expect(completedHalos.first()).toBeVisible();
    const completedCount = await completedHalos.count();
    expect(completedCount).toBeGreaterThanOrEqual(4);

    // 7. Verify node telemetry footer (duration and cost) is displayed on completed nodes
    const llmHalo = page.locator('.node-completed:has-text("Gemini 1.5 Flash")');
    await expect(llmHalo).toBeVisible();

    // Telemetry duration or token/cost metrics are present
    const clockIcon = llmHalo.locator("svg.lucide-clock");
    await expect(clockIcon).toBeVisible();

    // 8. Click the LLM node to inspect deep execution telemetry in the drawer
    await page.locator('.react-flow__node[data-id="llm_1"]').click();

    const inspector = page.locator('aside[aria-label="Node Inspector"]');
    await expect(inspector).toBeVisible();
    await expect(inspector.locator("h3")).toHaveText("Node Inspector");

    // Switch to Execution Trace (Telemetry) tab
    const traceTab = inspector.getByRole("button", { name: /Execution Trace/i });
    await traceTab.click();

    // Verify execution status and telemetry metrics in drawer
    await expect(inspector.locator("text=COMPLETED")).toBeVisible();
    await expect(inspector.locator("text=Execution Status")).toBeVisible();
    await expect(inspector.getByText("Latency", { exact: true })).toBeVisible();
    await expect(inspector.getByText("Tokens", { exact: true })).toBeVisible();
    await expect(inspector.getByText("Est. Cost", { exact: true })).toBeVisible();

    // Close Inspector
    await inspector.locator('button[title="Close Drawer"]').click();
    await expect(inspector).toBeHidden();
  });

  // ============================================================================
  // Journey 4: Dark/Light Theme Switching
  // ============================================================================
  test("Journey 4: Dark/Light Theme Switching", async ({ page }) => {
    // 1. Initial State: Default theme is dark
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);

    const themeToggle = page.locator('button[title^="Switch to"]');
    await expect(themeToggle).toHaveAttribute("title", "Switch to Light Mode");

    // 2. Toggle to Light Mode
    await themeToggle.click();

    // Verify dark class removed from <html>
    await expect(html).not.toHaveClass(/dark/);
    await expect(themeToggle).toHaveAttribute("title", "Switch to Dark Mode");

    // Verify localStorage persistence
    const savedTheme = await page.evaluate(() => localStorage.getItem("neuraldesk_theme"));
    expect(savedTheme).toBe("light");

    // 3. Reload page and verify Light theme persists across reload
    await page.reload();
    await page.waitForSelector(".react-flow__renderer", { state: "visible" });

    const htmlAfterReload = page.locator("html");
    await expect(htmlAfterReload).not.toHaveClass(/dark/);
    await expect(page.locator('button[title^="Switch to"]')).toHaveAttribute("title", "Switch to Dark Mode");

    // 4. Toggle back to Dark Mode
    await page.locator('button[title^="Switch to"]').click();

    // Verify dark class restored
    await expect(htmlAfterReload).toHaveClass(/dark/);
    await expect(page.locator('button[title^="Switch to"]')).toHaveAttribute("title", "Switch to Light Mode");

    // 5. Reload again and verify Dark theme persists
    await page.reload();
    await page.waitForSelector(".react-flow__renderer", { state: "visible" });
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  // ============================================================================
  // Journey 5: Multi-view Navigation
  // ============================================================================
  test("Journey 5: Multi-view Navigation", async ({ page }) => {
    // 1. Initial view: Canvas
    await expect(page.locator('input[title="Click to edit workflow name"]')).toBeVisible();
    await expect(page.locator(".react-flow__renderer")).toBeVisible();

    // 2. Navigate to Dashboard
    const dashboardNavBtn = page.locator('button[title="Dashboard"]');
    await dashboardNavBtn.click();

    // Verify Dashboard view loaded
    await expect(page.locator("h1:has-text('Intelligence Operations & Telemetry')")).toBeVisible();
    await expect(page.locator("text=Active DAGs")).toBeVisible();
    await expect(page.locator("text=Total Runs")).toBeVisible();
    await expect(page.locator("text=Success Rate")).toBeVisible();
    await expect(page.locator("text=Tokens Consumed")).toBeVisible();
    await expect(page.locator("text=Total Spend (USD)")).toBeVisible();

    // 3. Navigate to Executions View
    const executionsNavBtn = page.locator('button[title="Executions"]');
    await executionsNavBtn.click();

    // Verify Executions view loaded
    await expect(page.locator("h1:has-text('Execution History & Telemetry')")).toBeVisible();
    await expect(page.locator("th:has-text('Execution ID')")).toBeVisible();
    await expect(page.locator("th:has-text('Status')")).toBeVisible();
    await expect(page.locator("th:has-text('Duration')")).toBeVisible();

    // 4. Navigate to Agent Studio
    const agentsNavBtn = page.locator('button[title="Agents Studio"]');
    await agentsNavBtn.click();

    // Verify Agent Studio view loaded
    await expect(page.locator("h2:has-text('AI Agent Studio')")).toBeVisible();
    await expect(page.locator('span:has-text("Triage Sentinel")').first()).toBeVisible();
    await expect(page.locator('span:has-text("Synthesizer Pro")').first()).toBeVisible();
    await expect(page.locator('span:has-text("Pipeline Scout")').first()).toBeVisible();

    // 5. Navigate to Prompt Library
    const promptsNavBtn = page.locator('button[title="Prompt Library"]');
    await promptsNavBtn.click();

    // Verify Prompt Library view loaded
    await expect(page.locator("h2:has-text('Prompt Template Library')")).toBeVisible();
    await expect(page.locator('span:has-text("Customer Support Urgency & Sentiment Triage")').first()).toBeVisible();

    // 6. Open Studio Settings Modal from top header
    const settingsBtn = page.locator('button[title="Studio Settings"]');
    await settingsBtn.click();

    // Verify Settings Modal is displayed
    await expect(page.locator("h2:has-text('Runtime & AI Credentials')")).toBeVisible();
    await expect(page.locator("text=Execution Engine Mode")).toBeVisible();
    await expect(page.locator("text=Simulated DAG")).toBeVisible();
    await expect(page.locator("text=Live Gemini API")).toBeVisible();
    await expect(page.locator("input[placeholder='AIzaSy...']")).toBeVisible();

    // Close Settings Modal
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.locator("h2:has-text('Runtime & AI Credentials')")).toBeHidden();

    // 7. Return to Canvas View
    const canvasNavBtn = page.locator('button[title="Canvas"]');
    await canvasNavBtn.click();

    // Verify Canvas view is restored
    await expect(page.locator(".react-flow__renderer")).toBeVisible();
    await expect(page.locator('input[title="Click to edit workflow name"]')).toBeVisible();
  });
});
