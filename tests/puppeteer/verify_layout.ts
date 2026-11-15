import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = path.resolve(process.cwd(), "tests/puppeteer/screenshots");
const APP_URL = "http://localhost:3000";

async function verifyCanvasLayout() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();
  console.log("Navigating to", APP_URL);
  await page.goto(APP_URL, { waitUntil: "networkidle2" });
  await page.waitForSelector(".react-flow__canvas, .react-flow__renderer", { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1000));

  // 1. Inspect computed styles on .react-flow__node[data-id="out_1"]
  const out1Styles = await page.evaluate(() => {
    const nodeEl = document.querySelector('.react-flow__node[data-id="out_1"]');
    if (!nodeEl) return null;
    const computed = window.getComputedStyle(nodeEl);
    return {
      tagName: nodeEl.tagName,
      className: nodeEl.className,
      backgroundColor: computed.backgroundColor,
      borderStyle: computed.borderStyle,
      borderWidth: computed.borderWidth,
      boxShadow: computed.boxShadow,
      width: computed.width,
      height: computed.height,
    };
  });
  console.log("\n--- [Audit 1] Terminal Output Node Wrapper Styling ---");
  console.log("out_1 computed styles:", JSON.stringify(out1Styles, null, 2));

  // 2. Inspect Edge Label Z-Index and clearance between Urgency Gate and Branch Targets
  const edgeLayout = await page.evaluate(() => {
    const condNode = document.querySelector('.react-flow__node[data-id="cond_1"]')?.getBoundingClientRect();
    const toolNode = document.querySelector('.react-flow__node[data-id="tool_1"]')?.getBoundingClientRect();
    const outNode = document.querySelector('.react-flow__node[data-id="out_1"]')?.getBoundingClientRect();

    const edgeLabels = Array.from(document.querySelectorAll('.react-flow__edge-labels, .react-flow__edgelabel-renderer > *')).map((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        text: el.textContent?.trim(),
        zIndex: style.zIndex,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      };
    });

    return {
      condRight: condNode ? condNode.right : null,
      toolLeft: toolNode ? toolNode.left : null,
      outLeft: outNode ? outNode.left : null,
      horizontalGapTool: condNode && toolNode ? toolNode.left - condNode.right : null,
      horizontalGapOut: condNode && outNode ? outNode.left - condNode.right : null,
      edgeLabels,
    };
  });
  console.log("\n--- [Audit 2] Edge Label & Horizontal Clearance ---");
  console.log("Edge & clearance data:", JSON.stringify(edgeLayout, null, 2));

  // 3. Selection Indicator Ring & Outline
  await page.evaluate(() => {
    const toolNode = document.querySelector('.react-flow__node[data-id="tool_1"]') as HTMLElement;
    if (toolNode) toolNode.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  const selectionAudit = await page.evaluate(() => {
    const toolNode = document.querySelector('.react-flow__node[data-id="tool_1"]');
    if (!toolNode) return null;
    const computedNode = window.getComputedStyle(toolNode);
    const innerCard = toolNode.querySelector('.relative.group') as HTMLElement;
    const computedCard = innerCard ? window.getComputedStyle(innerCard) : null;
    return {
      nodeOutline: computedNode.outline,
      nodeOutlineOffset: computedNode.outlineOffset,
      cardClasses: innerCard?.className,
      cardBoxShadow: computedCard?.boxShadow,
      cardBorderColor: computedCard?.borderColor,
    };
  });
  console.log("\n--- [Audit 3] Node Selection Halo ---");
  console.log("Selection audit:", JSON.stringify(selectionAudit, null, 2));

  // Capture Screenshot in Dark Mode (Selected Node)
  const darkCanvasPath = path.join(SCREENSHOT_DIR, "verified_canvas_dark.png");
  await page.screenshot({ path: darkCanvasPath, fullPage: false });
  console.log("Saved verified dark mode screenshot to:", darkCanvasPath);

  // 4. Trigger Workflow Execution to check bypassed state and title truncation
  console.log("\n--- [Audit 4] Workflow Execution & Title Truncation Check ---");
  await page.evaluate(async () => {
    // Run client mock or backend mock simulation
    const store = (window as any).__WORKFLOW_STORE__;
    if (store) {
      await store.getState().runExecution("client_mock");
    }
  });

  console.log("Execution triggered. Waiting for completion...");
  await page.waitForFunction(
    () => {
      const store = (window as any).__WORKFLOW_STORE__;
      return store && store.getState().executionStatus === "completed";
    },
    { timeout: 10000 }
  );
  await new Promise((r) => setTimeout(r, 600));

  const postExecAudit = await page.evaluate(() => {
    const outTitle = document.querySelector('.react-flow__node[data-id="out_1"] h4');
    const outBadge = document.querySelector('.react-flow__node[data-id="out_1"] span.uppercase');
    const outNode = document.querySelector('.react-flow__node[data-id="out_1"]');
    return {
      titleText: outTitle?.textContent,
      titleScrollWidth: outTitle?.scrollWidth,
      titleClientWidth: outTitle?.clientWidth,
      isTruncated: outTitle ? outTitle.scrollWidth > outTitle.clientWidth : false,
      badgeText: outBadge?.textContent,
      classes: outNode?.className,
    };
  });
  console.log("Post-execution output node audit:", JSON.stringify(postExecAudit, null, 2));

  const executedCanvasPath = path.join(SCREENSHOT_DIR, "verified_canvas_executed_dark.png");
  await page.screenshot({ path: executedCanvasPath, fullPage: false });
  console.log("Saved verified executed dark mode screenshot to:", executedCanvasPath);

  // 5. Toggle to Light Mode and verify
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
  });
  await new Promise((r) => setTimeout(r, 500));

  const lightOutStyles = await page.evaluate(() => {
    const nodeEl = document.querySelector('.react-flow__node[data-id="out_1"]');
    if (!nodeEl) return null;
    const computed = window.getComputedStyle(nodeEl);
    return {
      backgroundColor: computed.backgroundColor,
      borderStyle: computed.borderStyle,
      boxShadow: computed.boxShadow,
    };
  });
  console.log("\n--- [Audit 5] Light Mode Verification ---");
  console.log("Light mode out_1 styles:", JSON.stringify(lightOutStyles, null, 2));

  const executedLightCanvasPath = path.join(SCREENSHOT_DIR, "verified_canvas_executed_light.png");
  await page.screenshot({ path: executedLightCanvasPath, fullPage: false });
  console.log("Saved verified executed light mode screenshot to:", executedLightCanvasPath);

  await browser.close();
  console.log("\nVerification completed successfully!");
}

verifyCanvasLayout().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
