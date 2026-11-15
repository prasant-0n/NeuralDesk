import { type Page, type Browser } from "puppeteer";

export interface TestContext {
  browser: Browser;
  page: Page;
  baseUrl: string;
  apiUrl: string;
}

export interface SuiteResult {
  suiteName: string;
  passed: boolean;
  durationMs: number;
  assertions: Array<{
    description: string;
    passed: boolean;
    error?: string;
  }>;
  screenshots: string[];
}
