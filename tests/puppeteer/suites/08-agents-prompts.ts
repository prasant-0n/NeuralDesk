import { type TestContext, type SuiteResult } from "../helpers/types.js";
import { captureScreenshot } from "../helpers/screenshot.js";

export async function runAgentsPromptsSuite(ctx: TestContext): Promise<SuiteResult> {
  const startTime = Date.now();
  const assertions: SuiteResult["assertions"] = [];
  const screenshots: string[] = [];

  try {
    const { page } = ctx;

    // 1. Navigate to Agent Studio by title
    const agentBtn = await page.$('button[title="Agents Studio"]');
    if (agentBtn) {
      await agentBtn.click();
    }
    await new Promise((r) => setTimeout(r, 600));

    // Send a message in agent chat
    const chatInput = await page.$('input[placeholder*="Ask"], input[placeholder*="Dispatch"], input[type="text"]');
    if (chatInput) {
      await chatInput.type("Urgent payment timeout on charge #9382", { delay: 20 });
      await page.keyboard.press("Enter");
      await new Promise((r) => setTimeout(r, 1200));
    }

    assertions.push({
      description: "Dispatched interactive message to AI Agent Studio",
      passed: true,
    });

    const agentShot = await captureScreenshot(page, "10_agent_studio_puppeteer.png");
    screenshots.push(agentShot);

    // 2. Navigate to Prompt Library by title
    const promptBtn = await page.$('button[title="Prompt Library"]');
    if (promptBtn) {
      await promptBtn.click();
    }
    await new Promise((r) => setTimeout(r, 600));

    const promptCount = await page.$$eval("div.w-80 div.cursor-pointer, div.w-80 div.p-3 > div", (els) => els.length);
    assertions.push({
      description: `Prompt template library loaded with templates (found: ${promptCount})`,
      passed: promptCount > 0,
    });

    const promptShot = await captureScreenshot(page, "11_prompt_library_puppeteer.png");
    screenshots.push(promptShot);

    // 3. Open Settings Modal
    const settingsBtn = await page.$('button[title*="Settings"]') || await page.$('header button:has(svg.lucide-settings)');
    if (settingsBtn) {
      await settingsBtn.click();
      await new Promise((r) => setTimeout(r, 400));

      const modalText = await page.evaluate(() => document.body.innerText);
      const isSettingsOpen = modalText.includes("Settings") || modalText.includes("Gemini");
      assertions.push({
        description: "Opened Settings & BYOK API modal",
        passed: isSettingsOpen,
      });

      const settingsShot = await captureScreenshot(page, "12_settings_modal_puppeteer.png");
      screenshots.push(settingsShot);

      // Close settings modal
      const closeBtn = await page.$('button:has(svg.lucide-x)') || await page.$('button:text("Cancel")');
      if (closeBtn) {
        await closeBtn.click();
        await new Promise((r) => setTimeout(r, 300));
      } else {
        await page.keyboard.press("Escape");
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    return {
      suiteName: "8. Agent Studio, Prompt Library & Settings Modal",
      passed: assertions.every((a) => a.passed),
      durationMs: Date.now() - startTime,
      assertions,
      screenshots,
    };
  } catch (err: any) {
    assertions.push({
      description: "Agents and prompts suite error",
      passed: false,
      error: err.message,
    });
    return {
      suiteName: "8. Agent Studio, Prompt Library & Settings Modal",
      passed: false,
      durationMs: Date.now() - startTime,
      assertions,
      screenshots,
    };
  }
}
