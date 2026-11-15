import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface PuppeteerTestConfig {
  baseUrl: string;
  apiUrl: string;
  viewport: {
    width: number;
    height: number;
    deviceScaleFactor: number;
  };
  headless: boolean;
  slowMo: number;
  defaultTimeout: number;
  screenshotDir: string;
  artifactScreenshotDir: string;
}

export const config: PuppeteerTestConfig = {
  baseUrl: process.env.TEST_BASE_URL || "http://localhost:3000",
  apiUrl: process.env.TEST_API_URL || "http://localhost:3001",
  viewport: {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1.5,
  },
  headless: !process.argv.includes("--headed"),
  slowMo: process.argv.includes("--headed") ? 50 : 0,
  defaultTimeout: 15000,
  screenshotDir: path.resolve(__dirname, "./screenshots"),
  artifactScreenshotDir: process.env.ARTIFACTS_DIR
    ? path.join(process.env.ARTIFACTS_DIR, "screenshots")
    : process.env.PRIMARY_SCREENSHOT_DIR || path.resolve(__dirname, "./screenshots"),
};
