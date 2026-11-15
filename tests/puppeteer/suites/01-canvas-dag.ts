import { type TestContext, type SuiteResult } from "../helpers/types.js";
import { captureScreenshot } from "../helpers/screenshot.js";

export async function runCanvasDagSuite(ctx: TestContext): Promise<SuiteResult> {
  const startTime = Date.now();
  const assertions: SuiteResult["assertions"] = [];
  const screenshots: string[] = [];

  try {
    const { page, baseUrl } = ctx;
    await page.goto(baseUrl, { waitUntil: "networkidle0" });

    // 1. Verify React Flow Canvas rendered
    await page.waitForSelector(".react-flow", { timeout: 8000 });
    assertions.push({
      description: "React Flow 12 canvas container rendered on DOM",
      passed: true,
    });

    // 2. Verify initial 6 default nodes
    const initialNodes = await page.$$(".react-flow__node");
    assertions.push({
      description: `Default 6 DAG nodes exist on DOM (found: ${initialNodes.length})`,
      passed: initialNodes.length >= 6,
    });

    // 3. Add a node from palette
    const paletteItems = await page.$$("aside div[draggable]");
    let transformButtonFound = false;
    for (const item of paletteItems) {
      const text = await page.evaluate((el) => el.textContent, item);
      if (text && (text.includes("JSON Transform") || text.includes("Transform"))) {
        await item.click();
        transformButtonFound = true;
        break;
      }
    }
    assertions.push({
      description: "Node Palette 'JSON Transform' item clicked",
      passed: transformButtonFound,
    });

    // Wait a brief tick for Zustand state update
    await new Promise((r) => setTimeout(r, 400));
    const nodesAfterAdd = await page.$$(".react-flow__node");
    assertions.push({
      description: `Node count increased after palette addition (count: ${nodesAfterAdd.length})`,
      passed: nodesAfterAdd.length > initialNodes.length,
    });

    // 4. Test Undo button
    const undoButton = await page.$('button[title*="Undo"]');
    if (undoButton) {
      await undoButton.click();
      await new Promise((r) => setTimeout(r, 300));
      const nodesAfterUndo = await page.$$(".react-flow__node");
      assertions.push({
        description: `Undo stack restores previous node count (count: ${nodesAfterUndo.length})`,
        passed: nodesAfterUndo.length === initialNodes.length,
      });
    }

    // 5. Test Redo button
    const redoButton = await page.$('button[title*="Redo"]');
    if (redoButton) {
      await redoButton.click();
      await new Promise((r) => setTimeout(r, 300));
      const nodesAfterRedo = await page.$$(".react-flow__node");
      assertions.push({
        description: `Redo stack reapplies node addition (count: ${nodesAfterRedo.length})`,
        passed: nodesAfterRedo.length > initialNodes.length,
      });
    }

    // Capture visual screenshot
    const shot = await captureScreenshot(page, "01_canvas_dag_puppeteer.png");
    screenshots.push(shot);

    return {
      suiteName: "1. Canvas & Visual DAG Editor",
      passed: assertions.every((a) => a.passed),
      durationMs: Date.now() - startTime,
      assertions,
      screenshots,
    };
  } catch (err: any) {
    assertions.push({
      description: "Suite execution encountered exception",
      passed: false,
      error: err.message,
    });
    return {
      suiteName: "1. Canvas & Visual DAG Editor",
      passed: false,
      durationMs: Date.now() - startTime,
      assertions,
      screenshots,
    };
  }
}
