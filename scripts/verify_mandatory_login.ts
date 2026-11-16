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

async function verifyMandatoryLogin() {
  console.log(`🚀 Verifying Mandatory Login Gate on: ${BASE_URL}`);

  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1440,900"],
  });

  const page: Page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // 1. Visit Homepage with completely fresh session
    console.log("  Loading page in fresh session (unauthenticated)...");
    await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(2500);

    // 2. Check if the Login Screen is displayed
    const content = await page.content();
    const isLoginGated =
      content.includes("Sign in to NeuralDesk") &&
      content.includes("Authentication required to access workspace");

    const hasCanvasBeforeLogin = await page.$(".react-flow");

    const screenShot = path.join(SCREENSHOTS_DIR, "mandatory_1_login_screen.png");
    await page.screenshot({ path: screenShot });
    console.log(`📸 Captured Mandatory Login Screen: ${screenShot}`);

    if (isLoginGated && !hasCanvasBeforeLogin) {
      console.log("✅ SUCCESS: Mandatory Login Gate enforced! Canvas is locked behind authentication.");
    } else {
      console.log("❌ FAILED: Canvas was accessible without login.");
      return;
    }

    // 3. Authenticate using 1-Click Demo Evaluation persona
    console.log("  Switching to '1-Click Demo' tab on Login Screen...");
    const demoTab = await findButtonByText(page, "1-Click Demo");
    if (!demoTab) {
      console.log("❌ Demo tab not found.");
      return;
    }
    await demoTab.click();
    await sleep(800);

    console.log("  Clicking 'System Administrator' persona to authenticate...");
    const adminPersona = await findButtonByText(page, "System Administrator");
    if (!adminPersona) {
      console.log("❌ Admin persona button not found.");
      return;
    }
    await adminPersona.click();
    await sleep(2500);

    // 4. Verify Canvas Unlocked
    const hasCanvasAfterLogin = await page.$(".react-flow");
    const unlockedShot = path.join(SCREENSHOTS_DIR, "mandatory_2_unlocked_canvas.png");
    await page.screenshot({ path: unlockedShot });
    console.log(`📸 Captured Unlocked Studio Canvas: ${unlockedShot}`);

    if (hasCanvasAfterLogin) {
      console.log("✅ SUCCESS: Workspace unlocked upon authentication! Canvas and full studio accessible.");
    } else {
      console.log("❌ FAILED: Workspace did not unlock after authentication.");
      return;
    }

    // 5. Test Sign Out to verify Relock
    console.log("  Testing Sign Out to verify security relock...");
    const signOutBtn = await page.$("button[title*='Sign Out']");
    if (signOutBtn) {
      await signOutBtn.click();
      await sleep(2000);

      const relockedContent = await page.content();
      const isRelocked = relockedContent.includes("Sign in to NeuralDesk");
      const hasCanvasAfterSignOut = await page.$(".react-flow");

      const relockShot = path.join(SCREENSHOTS_DIR, "mandatory_3_relocked_screen.png");
      await page.screenshot({ path: relockShot });
      console.log(`📸 Captured Relocked Screen: ${relockShot}`);

      if (isRelocked && !hasCanvasAfterSignOut) {
        console.log("🎉 VERIFIED 100%: Mandatory Login Gate is active, unlocks on authentication, and immediately relocks on Sign Out!");
      }
    }

  } catch (err) {
    console.error("Verification error:", err);
  } finally {
    await browser.close();
  }
}

verifyMandatoryLogin();
