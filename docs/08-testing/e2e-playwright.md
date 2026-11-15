# 08. Testing — Playwright End-to-End User Journeys

[← Back to Documentation Portal](../README.md) | [← Unit & Integration](./unit-and-integration.md) | [Next Section: Roadmap →](../09-roadmap/implementation-sprints.md)

---

## 3.1 Automated Browser Journeys (`tests/e2e/workflow-canvas.spec.ts`)

```typescript
import { test, expect } from "@playwright/test";

test.describe("NeuralDesk Canvas E2E Journeys", () => {
  test("Journey 1: Load application, render canvas, and select template", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.locator("header")).toContainText("NeuralDesk");

    await page.click("button:has-text('Templates')");
    await page.click("text=Customer Sentiment Routing");
    
    await expect(page.locator(".react-flow__node")).toHaveCount(4);
  });

  test("Journey 2: Connect ports and configure node properties in Drawer", async ({ page }) => {
    await page.goto("http://localhost:3000");

    await page.locator(".react-flow__node:has-text('Sentiment Classifier')").click();
    
    const drawer = page.locator("[role='dialog']:has-text('Node Configuration')");
    await expect(drawer).toBeVisible();

    await page.fill("input[name='temperature']", "0.35");
    await expect(page.locator("input[name='temperature']")).toHaveValue("0.35");
  });

  test("Journey 3: Run execution, verify real-time pulse animation, and review trace", async ({ page }) => {
    await page.goto("http://localhost:3000");

    await page.click("button:has-text('Run Workflow')");
    await expect(page.locator(".node-running")).toBeVisible();
    await expect(page.locator(".node-completed")).toHaveCount(4, { timeout: 10000 });

    await page.click("button:has-text('Execution Trace')");
    await expect(page.locator("text=Execution Succeeded")).toBeVisible();
    await expect(page.locator("text=Total Tokens")).toBeVisible();
  });
});
```

---

[← Previous: Unit & Integration](./unit-and-integration.md) | [Next Section: Roadmap →](../09-roadmap/implementation-sprints.md)
