/**
 * NeuralDesk Interactive API Documentation Routes
 * Serves OpenAPI 3.1.0 JSON, embedded Scalar API Reference, and Swagger UI Explorer.
 */

import { Hono } from "hono";
import { openApiSpec } from "../openapi.js";

export const docsRoutes = new Hono();

// 1. Machine-readable OpenAPI 3.1.0 JSON specification
docsRoutes.get("/openapi.json", (c) => {
  c.header("Cache-Control", "public, max-age=3600");
  return c.json(openApiSpec);
});

// 2. Interactive Scalar API Reference UI (Modern industry standard used by Stripe/OpenAI)
docsRoutes.get("/", (c) => {
  const specJson = JSON.stringify(openApiSpec).replace(/<\/script>/gi, "<\\/script>");
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>NeuralDesk API Reference — Interactive Documentation</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'><path d='M13 2L3 14h9l-1 8 10-12h-9l1-8z'/></svg>" />
    <style>
      body {
        margin: 0;
        background-color: #0b0f19;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      .nav-switch {
        position: fixed;
        top: 12px;
        right: 20px;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(15, 23, 42, 0.85);
        backdrop-filter: blur(8px);
        padding: 6px 12px;
        border-radius: 9999px;
        border: 1px solid rgba(255, 255, 255, 0.15);
      }
      .nav-switch a {
        color: #94a3b8;
        text-decoration: none;
        font-size: 12px;
        font-weight: 500;
        transition: color 0.15s ease;
      }
      .nav-switch a:hover {
        color: #ffffff;
      }
      .nav-switch .active {
        color: #818cf8;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <div class="nav-switch">
      <span class="active">Scalar View</span>
      <span style="color: #475569;">•</span>
      <a href="/docs/swagger">Swagger UI</a>
      <span style="color: #475569;">•</span>
      <a href="/api/v1/openapi.json" target="_blank">OpenAPI JSON</a>
    </div>

    <!-- Embedded OpenAPI 3.1.0 JSON Spec for instant offline loading -->
    <script id="api-reference" type="application/json">
${specJson}
    </script>

    <!-- Scalar API Reference Standalone Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;
  return c.html(html);
});

// 3. Alternative Classic Swagger UI Explorer with Embedded Spec
docsRoutes.get("/swagger", (c) => {
  const specJson = JSON.stringify(openApiSpec).replace(/<\/script>/gi, "<\\/script>");
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NeuralDesk Swagger UI — Interactive Explorer</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'><path d='M13 2L3 14h9l-1 8 10-12h-9l1-8z'/></svg>" />
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    <style>
      body { margin: 0; background: #fafafa; font-family: sans-serif; }
      .nav-switch {
        position: fixed;
        top: 12px;
        right: 20px;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(15, 23, 42, 0.9);
        backdrop-filter: blur(8px);
        padding: 6px 12px;
        border-radius: 9999px;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .nav-switch a {
        color: #94a3b8;
        text-decoration: none;
        font-size: 12px;
        font-weight: 500;
      }
      .nav-switch a:hover {
        color: #ffffff;
      }
      .nav-switch .active {
        color: #818cf8;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <div class="nav-switch">
      <a href="/docs">Scalar View</a>
      <span style="color: #64748b;">•</span>
      <span class="active">Swagger UI</span>
      <span style="color: #64748b;">•</span>
      <a href="/api/v1/openapi.json" target="_blank">OpenAPI JSON</a>
    </div>

    <div id="swagger-ui"></div>

    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = () => {
        const spec = ${specJson};
        window.ui = SwaggerUIBundle({
          spec: spec,
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          layout: "BaseLayout",
          deepLinking: true,
          displayRequestDuration: true,
          filter: true
        });
      };
    </script>
  </body>
</html>`;
  return c.html(html);
});
