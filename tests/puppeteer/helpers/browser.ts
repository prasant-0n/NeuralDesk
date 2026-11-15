import puppeteer, { type Browser, type Page } from "puppeteer";
import { config } from "../config.js";

export async function launchBrowser(): Promise<Browser> {
  const browser = await puppeteer.launch({
    headless: config.headless,
    slowMo: config.slowMo,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      `--window-size=${config.viewport.width},${config.viewport.height}`,
    ],
    defaultViewport: {
      width: config.viewport.width,
      height: config.viewport.height,
      deviceScaleFactor: config.viewport.deviceScaleFactor,
    },
  });

  return browser;
}

export async function createPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();
  page.setDefaultTimeout(config.defaultTimeout);
  page.setDefaultNavigationTimeout(config.defaultTimeout);

  await page.setViewport({
    width: config.viewport.width,
    height: config.viewport.height,
    deviceScaleFactor: config.viewport.deviceScaleFactor,
  });

  return page;
}
