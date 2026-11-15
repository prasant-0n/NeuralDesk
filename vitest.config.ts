import { defineConfig } from "vitest/config";

/**
 * NeuralDesk Vitest Configuration
 * Explicitly isolates unit and integration test suites, excluding Playwright E2E specs.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "tests/unit/**/*.test.ts",
      "tests/integration/**/*.test.ts",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "tests/e2e/**",
    ],
  },
});
