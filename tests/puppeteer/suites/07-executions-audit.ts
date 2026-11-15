import { type TestContext, type SuiteResult } from "../helpers/types.js";
import { captureScreenshot } from "../helpers/screenshot.js";

export async function runExecutionsAuditSuite(ctx: TestContext): Promise<SuiteResult> {
  const startTime = Date.now();
  const assertions: SuiteResult["assertions"] = [];
  const screenshots: string[] = [];

  try {
    const { page } = ctx;

    // 1. Navigate to Executions view by title
    const executionsBtn = await page.$('button[title="Executions"]');
    if (!executionsBtn) {
      throw new Error("Executions sidebar button not found");
    }

    await executionsBtn.click();
    assertions.push({
      description: "Navigated to Executions view via sidebar button",
      passed: true,
    });

    await page.waitForSelector("table", { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 600));

    // 2. Verify table exists
    const tableHeaders = await page.$$eval("table th", (ths) => ths.map((th) => th.textContent?.trim()));
    assertions.push({
      description: `Executions audit table headers loaded (${tableHeaders.slice(0, 3).join(", ")})`,
      passed: tableHeaders.length >= 4,
    });

    // 3. Test Refresh button
    const refreshBtn = await page.$('button:has(svg.lucide-refresh-cw)') || await page.$('button[title*="Refresh"]');
    if (refreshBtn) {
      await refreshBtn.click();
      await new Promise((r) => setTimeout(r, 300));
    }

    // 4. Click an execution row to open trace modal
    const rows = await page.$$("table tbody tr");
    if (rows.length > 0) {
      await rows[0].click();
      await new Promise((r) => setTimeout(r, 500));

      const modalText = await page.evaluate(() => document.body.innerText);
      const modalOpen = modalText.includes("Trace:") || modalText.includes("Node Execution Waterfall");
      assertions.push({
        description: "Execution trace detail modal opened on row click",
        passed: modalOpen,
      });

      // Capture screenshot of modal overlay
      const shot = await captureScreenshot(page, "09_executions_modal_puppeteer.png");
      screenshots.push(shot);

      // Close modal (click backdrop or close button)
      const closeBtn = await page.$('button:has(svg.lucide-x)');
      if (closeBtn) {
        await closeBtn.click();
        await new Promise((r) => setTimeout(r, 300));
      } else {
        await page.keyboard.press("Escape");
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    return {
      suiteName: "7. Executions Audit Trail & Trace Modal",
      passed: assertions.every((a) => a.passed),
      durationMs: Date.now() - startTime,
      assertions,
      screenshots,
    };
  } catch (err: any) {
    assertions.push({
      description: "Executions audit error",
      passed: false,
      error: err.message,
    });
    return {
      suiteName: "7. Executions Audit Trail & Trace Modal",
      passed: false,
      durationMs: Date.now() - startTime,
      assertions,
      screenshots,
    };
  }
}
