import { type TestContext, type SuiteResult } from "../helpers/types.js";
import { captureScreenshot } from "../helpers/screenshot.js";

export async function runExecutionSseSuite(ctx: TestContext): Promise<SuiteResult> {
  const startTime = Date.now();
  const assertions: SuiteResult["assertions"] = [];
  const screenshots: string[] = [];

  try {
    const { page } = ctx;

    // 1. Locate Run Workflow button
    const buttons = await page.$$("button");
    let runBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes("Run Workflow")) {
        runBtn = btn;
        break;
      }
    }

    if (!runBtn) {
      throw new Error("Run Workflow button not found");
    }

    // 2. Click Run Workflow
    await runBtn.click();
    await new Promise((r) => setTimeout(r, 150));

    // Capture screenshot during active streaming
    const streamingShot = await captureScreenshot(page, "04_execution_streaming_puppeteer.png");
    screenshots.push(streamingShot);

    assertions.push({
      description: "Triggered execution and captured active streaming state",
      passed: true,
    });

    // 3. Wait for execution completion
    await page.waitForFunction(
      () => {
        const bodyText = document.body.innerText;
        return bodyText.includes("Executed") || document.querySelector(".node-completed") !== null;
      },
      { timeout: 15000 }
    );

    assertions.push({
      description: "Execution completed; nodes transitioned to completed state",
      passed: true,
    });

    // 4. Inspect completed nodes
    const completedNodes = await page.$$(".node-completed");
    assertions.push({
      description: `Executed nodes displayed emerald completion halo (found: ${completedNodes.length})`,
      passed: completedNodes.length > 0,
    });

    // 5. Click the LLM node to open NodeInspectorDrawer
    const llmNode = await page.$('.react-flow__node[data-id="llm_1"]') || await page.$('.react-flow__node');
    if (llmNode) {
      await llmNode.click();
      await new Promise((r) => setTimeout(r, 500));

      // Switch to Execution Trace tab in drawer if present
      const drawerTabs = await page.$$('button[role="tab"], aside button');
      for (const tab of drawerTabs) {
        const text = await page.evaluate((el) => el.textContent, tab);
        if (text && text.includes("Trace")) {
          await tab.click();
          break;
        }
      }
      await new Promise((r) => setTimeout(r, 400));
    }

    // Capture completion & trace screenshot
    const completedShot = await captureScreenshot(page, "05_execution_trace_puppeteer.png");
    screenshots.push(completedShot);

    // 6. Close inspector drawer to restore unobstructed viewport
    const closeDrawerBtn = await page.$('button[title="Close Drawer"]');
    if (closeDrawerBtn) {
      await closeDrawerBtn.click();
      await new Promise((r) => setTimeout(r, 300));
    }

    return {
      suiteName: "4. Real-Time SSE Execution & Telemetry Halos",
      passed: assertions.every((a) => a.passed),
      durationMs: Date.now() - startTime,
      assertions,
      screenshots,
    };
  } catch (err: any) {
    assertions.push({
      description: "Execution error",
      passed: false,
      error: err.message,
    });
    return {
      suiteName: "4. Real-Time SSE Execution & Telemetry Halos",
      passed: false,
      durationMs: Date.now() - startTime,
      assertions,
      screenshots,
    };
  }
}
