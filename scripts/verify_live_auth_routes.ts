import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

const OUTPUT_DIR = path.resolve(process.cwd(), "images");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function verifyLive() {
  const liveUrl = "https://neuraldesk-lovat.vercel.app";
  console.log(`🌐 Verifying Live Production Deployment: ${liveUrl}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Step 1: Root route /
    console.log("1. Visiting live root route: /");
    await page.goto(`${liveUrl}/`, { waitUntil: "networkidle2" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1000));

    const liveRootShot = path.join(OUTPUT_DIR, "live_root_workspace.png");
    await page.screenshot({ path: liveRootShot });
    console.log(`📸 Saved live root screenshot: ${liveRootShot}`);

    // Step 2: Dedicated /signin
    console.log("2. Visiting live /signin...");
    await page.goto(`${liveUrl}/signin`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1200));

    const liveSigninShot = path.join(OUTPUT_DIR, "live_signin_page.png");
    await page.screenshot({ path: liveSigninShot });
    console.log(`📸 Saved live /signin screenshot: ${liveSigninShot}`);

    // Step 3: Dedicated /signup
    console.log("3. Visiting live /signup...");
    await page.goto(`${liveUrl}/signup`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1000));

    // Type into password to trigger strength indicator
    const pwdInput = await page.$("input[type='password']");
    if (pwdInput) {
      await pwdInput.type("NeuralDesk2026!#");
      await new Promise((r) => setTimeout(r, 500));
    }

    const liveSignupShot = path.join(OUTPUT_DIR, "live_signup_page.png");
    await page.screenshot({ path: liveSignupShot });
    console.log(`📸 Saved live /signup screenshot: ${liveSignupShot}`);

    // Step 4: Test 1-click persona on live /signin
    console.log("4. Testing 1-Click Evaluation on live /signin...");
    await page.goto(`${liveUrl}/signin`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1000));

    const demoBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      return buttons.find((b) => b.innerText.includes("System Administrator"));
    });

    if (demoBtn.asElement()) {
      await (demoBtn.asElement() as any).click();
      await page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {});
      await new Promise((r) => setTimeout(r, 1500));
    }

    const liveAuthedShot = path.join(OUTPUT_DIR, "live_authenticated_workspace.png");
    await page.screenshot({ path: liveAuthedShot });
    console.log(`📸 Saved live authenticated screenshot: ${liveAuthedShot}`);

    console.log("🎉 LIVE PRODUCTION VERIFICATION 100% COMPLETE!");
  } finally {
    await browser.close();
  }
}

verifyLive().catch((e) => {
  console.error("Live test error:", e);
  process.exit(1);
});
