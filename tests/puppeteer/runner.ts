import { config } from "./config.js";
import { launchBrowser, createPage } from "./helpers/browser.js";
import { type TestContext, type SuiteResult } from "./helpers/types.js";
import { runCanvasDagSuite } from "./suites/01-canvas-dag.js";
import { runCyclePreventionSuite } from "./suites/02-cycle-prevention.js";
import { runTemplatesSuite } from "./suites/03-templates.js";
import { runExecutionSseSuite } from "./suites/04-execution-sse.js";
import { runThemeWcagSuite } from "./suites/05-theme-wcag.js";
import { runDashboardSuite } from "./suites/06-dashboard.js";
import { runExecutionsAuditSuite } from "./suites/07-executions-audit.js";
import { runAgentsPromptsSuite } from "./suites/08-agents-prompts.js";

async function main() {
  console.log("\n================================================================================");
  console.log("   NeuralDesk — Puppeteer Automated Browser Verification Harness");
  console.log("================================================================================");
  console.log(`Target Frontend: ${config.baseUrl}`);
  console.log(`Target Backend:  ${config.apiUrl}`);
  console.log(`Display Mode:    ${config.headless ? "Headless (CI/Audit)" : "Headed (Interactive)"}`);
  console.log(`Screenshots Dir: ${config.screenshotDir}`);
  console.log("================================================================================\n");

  const browser = await launchBrowser();
  const page = await createPage(browser);

  const ctx: TestContext = {
    browser,
    page,
    baseUrl: config.baseUrl,
    apiUrl: config.apiUrl,
  };

  const results: SuiteResult[] = [];

  const suites = [
    { name: "1. Canvas & Visual DAG Editor", runner: runCanvasDagSuite },
    { name: "2. Kahn's Cycle Invariant Prevention", runner: runCyclePreventionSuite },
    { name: "3. Pre-Built Template Swapping", runner: runTemplatesSuite },
    { name: "4. Real-Time SSE Execution & Telemetry Halos", runner: runExecutionSseSuite },
    { name: "5. Dual Theme Visual & Persistence Audit", runner: runThemeWcagSuite },
    { name: "6. Dashboard View & Recharts Analytics", runner: runDashboardSuite },
    { name: "7. Executions Audit Trail & Trace Modal", runner: runExecutionsAuditSuite },
    { name: "8. Agent Studio, Prompt Library & Settings Modal", runner: runAgentsPromptsSuite },
  ];

  for (const suite of suites) {
    process.stdout.write(`▶ Running: ${suite.name}... `);
    const result = await suite.runner(ctx);
    results.push(result);

    if (result.passed) {
      console.log(`\x1b[32mPASSED\x1b[0m (${result.durationMs}ms)`);
      for (const a of result.assertions) {
        console.log(`    \x1b[32m✓\x1b[0m ${a.description}`);
      }
    } else {
      console.log(`\x1b[31mFAILED\x1b[0m (${result.durationMs}ms)`);
      for (const a of result.assertions) {
        if (a.passed) {
          console.log(`    \x1b[32m✓\x1b[0m ${a.description}`);
        } else {
          console.log(`    \x1b[31m✗\x1b[0m ${a.description}${a.error ? ` - ${a.error}` : ""}`);
        }
      }
    }
  }

  await browser.close();

  console.log("\n================================================================================");
  console.log("   Puppeteer Test Suite Execution Summary");
  console.log("================================================================================");

  let totalAssertions = 0;
  let passedAssertions = 0;
  let allScreenshots: string[] = [];

  for (const r of results) {
    const statusIcon = r.passed ? "\x1b[32m[PASS]\x1b[0m" : "\x1b[31m[FAIL]\x1b[0m";
    console.log(`${statusIcon} ${r.suiteName.padEnd(52)} ${r.durationMs}ms`);
    totalAssertions += r.assertions.length;
    passedAssertions += r.assertions.filter((a) => a.passed).length;
    allScreenshots.push(...r.screenshots);
  }

  console.log("--------------------------------------------------------------------------------");
  console.log(`Total Suites:     ${results.length}`);
  console.log(`Suites Passed:    ${results.filter((r) => r.passed).length} / ${results.length}`);
  console.log(`Assertions:       ${passedAssertions} / ${totalAssertions} passed`);
  console.log(`Screenshots:      ${allScreenshots.length} captured and synced`);
  console.log("================================================================================\n");

  const allPassed = results.every((r) => r.passed);
  if (!allPassed) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Puppeteer Harness fatal exception:", err);
  process.exit(1);
});
