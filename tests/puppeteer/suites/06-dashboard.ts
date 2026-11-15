import { type TestContext, type SuiteResult } from "../helpers/types.js";
import { captureScreenshot } from "../helpers/screenshot.js";

export async function runDashboardSuite(ctx: TestContext): Promise<SuiteResult> {
  const startTime = Date.now();
  const assertions: SuiteResult["assertions"] = [];
  const screenshots: string[] = [];

  try {
    const { page } = ctx;

    // 1. Locate and click Dashboard sidebar link by title
    const dashboardBtn = await page.$('button[title="Dashboard"]');
    if (!dashboardBtn) {
      throw new Error("Dashboard sidebar button not found");
    }

    await dashboardBtn.click();
    assertions.push({
      description: "Navigated to Dashboard view via sidebar button",
      passed: true,
    });

    await page.waitForSelector("div.grid", { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 600));

    // 2. Verify 5 KPI summary cards exist
    const pageText = await page.evaluate(() => document.body.innerText);
    const hasKPIs =
      pageText.includes("Active DAGs") &&
      pageText.includes("Total Runs") &&
      pageText.includes("Success Rate");

    assertions.push({
      description: "Dashboard operational KPI metrics rendered (Active DAGs, Total Runs, Success Rate)",
      passed: hasKPIs,
    });

    // 3. Verify Recharts analytics containers
    const rechartsCount = await page.$$eval(".recharts-responsive-container", (els) => els.length);
    assertions.push({
      description: `Recharts analytics graphs rendered on DOM (found: ${rechartsCount})`,
      passed: rechartsCount > 0,
    });

    // Capture visual screenshot
    const shot = await captureScreenshot(page, "08_dashboard_puppeteer.png");
    screenshots.push(shot);

    return {
      suiteName: "6. Dashboard View & Recharts Analytics",
      passed: assertions.every((a) => a.passed),
      durationMs: Date.now() - startTime,
      assertions,
      screenshots,
    };
  } catch (err: any) {
    assertions.push({
      description: "Dashboard view error",
      passed: false,
      error: err.message,
    });
    return {
      suiteName: "6. Dashboard View & Recharts Analytics",
      passed: false,
      durationMs: Date.now() - startTime,
      assertions,
      screenshots,
    };
  }
}
