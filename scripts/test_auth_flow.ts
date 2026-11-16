import puppeteer, { Browser, Page, ElementHandle } from "puppeteer";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = process.env.BASE_URL || "https://neuraldesk-lovat.vercel.app";
const SCREENSHOTS_DIR = path.join(process.cwd(), "images");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findButtonByText(page: Page, text: string): Promise<ElementHandle<HTMLButtonElement> | null> {
  const buttons = await page.$$("button");
  for (const b of buttons) {
    const content = await page.evaluate((el) => el.textContent, b);
    if (content && content.toLowerCase().includes(text.toLowerCase())) {
      return b as ElementHandle<HTMLButtonElement>;
    }
  }
  return null;
}

async function testAuthFlow() {
  console.log(`🚀 Testing Better Auth Live Flow on: ${BASE_URL}`);

  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1440,900"],
  });

  const page: Page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log(`  [Console Error]:`, msg.text());
    }
  });

  try {
    // 1. Visit Homepage
    console.log("  Loading page...");
    await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(3000);

    // 2. Find and click "Sign In" button in Header
    const signInBtn = await findButtonByText(page, "Sign In");

    if (!signInBtn) {
      console.log("❌ 'Sign In' button not found in header.");
      const headerShot = path.join(SCREENSHOTS_DIR, "auth_debug_header.png");
      await page.screenshot({ path: headerShot });
      return;
    }

    console.log("✅ Found 'Sign In' button in Header. Clicking...");
    await signInBtn.click();
    await sleep(1200);

    // 3. Take screenshot of Auth Modal
    const modalShot = path.join(SCREENSHOTS_DIR, "auth_1_modal_open.png");
    await page.screenshot({ path: modalShot });
    console.log(`📸 Captured Auth Modal: ${modalShot}`);

    // 4. Click "1-Click Demo" tab
    const demoTab = await findButtonByText(page, "1-Click Demo");

    if (demoTab) {
      console.log("✅ Switching to '1-Click Demo' tab...");
      await demoTab.click();
      await sleep(1000);

      const demoTabShot = path.join(SCREENSHOTS_DIR, "auth_2_demo_personas.png");
      await page.screenshot({ path: demoTabShot });
      console.log(`📸 Captured Demo Personas Tab: ${demoTabShot}`);

      // Select "Lead AI Engineer"
      const engineerBtn = await findButtonByText(page, "Lead AI Engineer");

      if (engineerBtn) {
        console.log("✅ Clicking 'Lead AI Engineer' persona...");
        await engineerBtn.click();
        await sleep(2500);

        // Verify header shows user
        const loggedInShot = path.join(SCREENSHOTS_DIR, "auth_3_logged_in_header.png");
        await page.screenshot({ path: loggedInShot });
        console.log(`📸 Captured Logged In State: ${loggedInShot}`);

        const headerContent = await page.evaluate(() => document.querySelector("header")?.textContent || "");
        console.log("  Header content:", headerContent.replace(/\s+/g, " "));

        if (headerContent.includes("Lead AI Engineer")) {
          console.log("🎉 SUCCESS: Better Auth persona switched to Lead AI Engineer in header!");
        } else {
          console.log("⚠️ Header did not reflect persona change immediately.");
        }
      }
    }

  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await browser.close();
  }
}

testAuthFlow();
