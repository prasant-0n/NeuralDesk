import fs from "node:fs";
import path from "node:path";
import { type Page } from "puppeteer";
import { config } from "../config.js";

export async function captureScreenshot(page: Page, filename: string): Promise<string> {
  // Ensure target directories exist
  if (!fs.existsSync(config.screenshotDir)) {
    fs.mkdirSync(config.screenshotDir, { recursive: true });
  }
  if (!fs.existsSync(config.artifactScreenshotDir)) {
    fs.mkdirSync(config.artifactScreenshotDir, { recursive: true });
  }

  const localPath = path.join(config.screenshotDir, filename);
  const artifactPath = path.join(config.artifactScreenshotDir, filename);

  await page.screenshot({
    path: localPath,
    fullPage: false,
  });

  // Mirror copy to brain artifact directory
  fs.copyFileSync(localPath, artifactPath);

  return localPath;
}
