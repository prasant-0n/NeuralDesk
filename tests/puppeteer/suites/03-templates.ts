import { type TestContext, type SuiteResult } from "../helpers/types.js";
import { captureScreenshot } from "../helpers/screenshot.js";

export async function runTemplatesSuite(ctx: TestContext): Promise<SuiteResult> {
  const startTime = Date.now();
  const assertions: SuiteResult["assertions"] = [];
  const screenshots: string[] = [];

  try {
    const { page } = ctx;

    // 1. Locate and click Templates dropdown button
    const buttons = await page.$$("button");
    let templateBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes("Templates")) {
        templateBtn = btn;
        break;
      }
    }

    if (!templateBtn) {
      throw new Error("Templates button not found on control bar");
    }

    await templateBtn.click();
    await new Promise((r) => setTimeout(r, 300));

    // 2. Click "Document Summarizer" option
    const dropdownButtons = await page.$$("div.absolute button");
    let docSummClicked = false;
    for (const btn of dropdownButtons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes("Document Summarizer")) {
        await btn.click();
        docSummClicked = true;
        break;
      }
    }

    assertions.push({
      description: "Selected 'Document Summarizer' template from dropdown",
      passed: docSummClicked,
    });

    await new Promise((r) => setTimeout(r, 400));
    const titleVal = await page.$eval('input[title*="workflow name"]', (el: any) => el.value);
    assertions.push({
      description: `Workflow title updated to Document Summarizer (title: '${titleVal}')`,
      passed: titleVal.includes("Document Summarizer"),
    });

    // 3. Switch back to "Customer Support Triage"
    await templateBtn.click();
    await new Promise((r) => setTimeout(r, 300));

    const dropdownButtons2 = await page.$$("div.absolute button");
    let supportClicked = false;
    for (const btn of dropdownButtons2) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes("Customer Support Triage")) {
        await btn.click();
        supportClicked = true;
        break;
      }
    }

    assertions.push({
      description: "Restored 'Customer Support Triage' template",
      passed: supportClicked,
    });

    await new Promise((r) => setTimeout(r, 400));

    // Capture screenshot
    const shot = await captureScreenshot(page, "03_templates_puppeteer.png");
    screenshots.push(shot);

    return {
      suiteName: "3. Pre-Built Template Swapping",
      passed: assertions.every((a) => a.passed),
      durationMs: Date.now() - startTime,
      assertions,
      screenshots,
    };
  } catch (err: any) {
    assertions.push({
      description: "Template swapping error",
      passed: false,
      error: err.message,
    });
    return {
      suiteName: "3. Pre-Built Template Swapping",
      passed: false,
      durationMs: Date.now() - startTime,
      assertions,
      screenshots,
    };
  }
}
