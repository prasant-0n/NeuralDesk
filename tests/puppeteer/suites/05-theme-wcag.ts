import { type TestContext, type SuiteResult } from "../helpers/types.js";
import { captureScreenshot } from "../helpers/screenshot.js";

export async function runThemeWcagSuite(ctx: TestContext): Promise<SuiteResult> {
  const startTime = Date.now();
  const assertions: SuiteResult["assertions"] = [];
  const screenshots: string[] = [];

  try {
    const { page } = ctx;

    // Ensure any open drawer is closed
    const closeDrawerBtn = await page.$('button[title="Close Drawer"]');
    if (closeDrawerBtn) {
      await closeDrawerBtn.click();
      await new Promise((r) => setTimeout(r, 200));
    }

    // 1. Locate theme button (has sun or moon icon)
    let themeButton =
      (await page.$("header button:has(svg.lucide-sun)")) ||
      (await page.$("header button:has(svg.lucide-moon)")) ||
      (await page.$('header button[title*="Light Mode"]')) ||
      (await page.$('header button[title*="Dark Mode"]'));

    if (!themeButton) {
      const headerButtons = await page.$$("header button");
      for (const btn of headerButtons) {
        const title = await page.evaluate((el) => el.getAttribute("title") || "", btn);
        if (title.includes("Mode")) {
          themeButton = btn;
          break;
        }
      }
    }

    if (!themeButton) {
      throw new Error("Theme toggle button not found in header");
    }

    // 2. Toggle to Light Mode
    await themeButton.click();
    await new Promise((r) => setTimeout(r, 500));

    const isLightNow = await page.evaluate(() => !document.documentElement.classList.contains("dark"));
    assertions.push({
      description: "Toggled to Light Mode; 'dark' class removed from <html>",
      passed: isLightNow,
    });

    const lightShot = await captureScreenshot(page, "06_light_mode_puppeteer.png");
    screenshots.push(lightShot);

    // 3. Test persistence across reload
    await page.reload({ waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 500));

    const isStillLight = await page.evaluate(() => !document.documentElement.classList.contains("dark"));
    assertions.push({
      description: "Light mode persisted across full browser page reload",
      passed: isStillLight,
    });

    // 4. Toggle back to Dark Mode
    const themeButtonAfterReload =
      (await page.$("header button:has(svg.lucide-moon)")) ||
      (await page.$("header button:has(svg.lucide-sun)")) ||
      (await page.$('header button[title*="Dark Mode"]'));

    if (themeButtonAfterReload) {
      await themeButtonAfterReload.click();
      await new Promise((r) => setTimeout(r, 500));
    }

    const isDarkRestored = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    assertions.push({
      description: "Dark mode restored; 'dark' class present on <html>",
      passed: isDarkRestored,
    });

    const darkShot = await captureScreenshot(page, "07_dark_mode_puppeteer.png");
    screenshots.push(darkShot);

    return {
      suiteName: "5. Dual Theme Visual & Persistence Audit",
      passed: assertions.every((a) => a.passed),
      durationMs: Date.now() - startTime,
      assertions,
      screenshots,
    };
  } catch (err: any) {
    assertions.push({
      description: "Theme toggle error",
      passed: false,
      error: err.message,
    });
    return {
      suiteName: "5. Dual Theme Visual & Persistence Audit",
      passed: false,
      durationMs: Date.now() - startTime,
      assertions,
      screenshots,
    };
  }
}
