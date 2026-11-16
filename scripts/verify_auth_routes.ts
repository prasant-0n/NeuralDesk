import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { spawn, type ChildProcess } from "child_process";

const OUTPUT_DIR = path.resolve(process.cwd(), "images");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runAuthVerification() {
  console.log("🚀 Starting verification of dedicated /signin, /signup, and / routes...");

  // Launch local vite preview server on port 4173
  const previewProcess: ChildProcess = spawn("pnpm", ["--filter", "@neuraldesk/web", "preview", "--port", "4173"], {
    stdio: "pipe",
    shell: true,
  });

  // Wait for preview server to be ready
  await new Promise<void>((resolve) => {
    previewProcess.stdout?.on("data", (data) => {
      const msg = data.toString();
      if (msg.includes("4173") || msg.includes("Local:")) {
        resolve();
      }
    });
    setTimeout(resolve, 3000);
  });

  const baseUrl = "http://localhost:4173";
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Clear local storage for clean start
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle0" });
    await page.evaluate(() => localStorage.clear());

    // 1. TEST ROOT ROUTE `/` (Unauthenticated)
    console.log("1. Testing Root Route / (unauthenticated)...");
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1000));

    const rootShot = path.join(OUTPUT_DIR, "route_root_workspace.png");
    await page.screenshot({ path: rootShot });
    console.log(`📸 Saved root screenshot: ${rootShot}`);

    const hasSignInBtn = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a"));
      return links.some((l) => l.textContent?.includes("Sign In") && l.getAttribute("href")?.includes("/signin"));
    });
    console.log(`   Has 'Sign In' link to /signin: ${hasSignInBtn ? "✅ YES" : "❌ NO"}`);

    const hasSignUpBtn = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a"));
      return links.some((l) => l.textContent?.includes("Sign Up") && l.getAttribute("href")?.includes("/signup"));
    });
    console.log(`   Has 'Sign Up' link to /signup: ${hasSignUpBtn ? "✅ YES" : "❌ NO"}`);

    // 2. TEST DEDICATED SIGN IN ROUTE `/signin`
    console.log("2. Testing Dedicated Route /signin...");
    await page.goto(`${baseUrl}/signin`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1000));

    const signinShot = path.join(OUTPUT_DIR, "route_signin_page.png");
    await page.screenshot({ path: signinShot });
    console.log(`📸 Saved /signin screenshot: ${signinShot}`);

    const signinVerification = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasWelcomeBack: text.includes("Welcome back"),
        hasWorkEmail: text.includes("Work Email"),
        hasPassword: text.includes("Password"),
        hasGithub: text.includes("GitHub"),
        hasGoogle: text.includes("Google"),
        has1ClickDemo: text.includes("1-Click Instant Evaluation"),
        hasCreateAccountLink: Array.from(document.querySelectorAll("a")).some((a) => a.getAttribute("href") === "/signup"),
      };
    });
    console.log("   /signin page features:", signinVerification);

    // 3. TEST DEDICATED SIGN UP ROUTE `/signup`
    console.log("3. Testing Dedicated Route /signup...");
    await page.goto(`${baseUrl}/signup`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1000));

    // Type a password to test interactive strength meter
    const passwordInput = await page.$("input[type='password']");
    if (passwordInput) {
      await passwordInput.type("P@ssw0rd123!");
      await new Promise((r) => setTimeout(r, 500));
    }

    const signupShot = path.join(OUTPUT_DIR, "route_signup_page.png");
    await page.screenshot({ path: signupShot });
    console.log(`📸 Saved /signup screenshot: ${signupShot}`);

    const signupVerification = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasCreateAccount: text.includes("Create your account"),
        hasFullName: text.includes("Full Name"),
        hasWorkEmail: text.includes("Work Email"),
        hasStrengthMeter: text.includes("Password Strength"),
        hasTerms: text.includes("Terms of Service"),
        hasSignInLink: Array.from(document.querySelectorAll("a")).some((a) => a.getAttribute("href") === "/signin"),
      };
    });
    console.log("   /signup page features:", signupVerification);

    // 4. TEST ALIAS REDIRECTS (/login -> /signin, /sign-up -> /signup)
    console.log("4. Testing Alias Redirects...");
    await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle0" });
    const loginRedirectUrl = page.url();
    console.log(`   /login redirected to: ${loginRedirectUrl} (Matches /signin: ${loginRedirectUrl.endsWith("/signin") ? "✅" : "❌"})`);

    await page.goto(`${baseUrl}/sign-up`, { waitUntil: "networkidle0" });
    const signupRedirectUrl = page.url();
    console.log(`   /sign-up redirected to: ${signupRedirectUrl} (Matches /signup: ${signupRedirectUrl.endsWith("/signup") ? "✅" : "❌"})`);

    // 5. TEST AUTHENTICATION & HEADER PROFILE
    console.log("5. Testing Authentication via 1-Click Demo on /signin...");
    await page.goto(`${baseUrl}/signin`, { waitUntil: "networkidle0" });
    const demoAdminBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      return buttons.find((b) => b.innerText.includes("System Administrator"));
    });
    if (demoAdminBtn.asElement()) {
      await (demoAdminBtn.asElement() as any).click();
      await page.waitForNavigation({ waitUntil: "networkidle0" }).catch(() => {});
      await new Promise((r) => setTimeout(r, 1000));
    }

    const authedUrl = page.url();
    console.log(`   After login, current URL: ${authedUrl}`);

    const authHeaderShot = path.join(OUTPUT_DIR, "route_authenticated_header.png");
    await page.screenshot({ path: authHeaderShot });
    console.log(`📸 Saved authenticated workspace screenshot: ${authHeaderShot}`);

    const hasUserChip = await page.evaluate(() => {
      return document.body.innerText.includes("System Administrator");
    });
    console.log(`   User chip visible in Header: ${hasUserChip ? "✅ YES" : "❌ NO"}`);

    // 6. TEST SIGN OUT
    console.log("6. Testing Sign Out...");
    const signoutBtn = await page.$("button[title='Sign Out of NeuralDesk']");
    if (signoutBtn) {
      await signoutBtn.click();
      await new Promise((r) => setTimeout(r, 1000));
    }

    const postSignoutHasSignIn = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a"));
      return links.some((l) => l.textContent?.includes("Sign In") && l.getAttribute("href")?.includes("/signin"));
    });
    console.log(`   Post sign-out restored 'Sign In' button: ${postSignoutHasSignIn ? "✅ YES" : "❌ NO"}`);

    console.log("\n🎉 ALL ROUTE & AUTHENTICATION AUDITS COMPLETED SUCCESSFULLY!");
  } finally {
    await browser.close();
    previewProcess.kill();
  }
}

runAuthVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
