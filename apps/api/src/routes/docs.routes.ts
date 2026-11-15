/**
 * NeuralDesk Interactive API Documentation Routes
 * Serves OpenAPI 3.1.0 JSON and the interactive Scalar API Reference UI.
 */

import { Hono } from "hono";
import { openApiSpec } from "../openapi.js";

export const docsRoutes = new Hono();

// 1. Machine-readable OpenAPI 3.1.0 JSON specification
docsRoutes.get("/openapi.json", (c) => {
  c.header("Cache-Control", "public, max-age=3600");
  return c.json(openApiSpec);
});

// 2. Interactive Scalar API Reference UI (Modern industry standard used by modern API companies)
docsRoutes.get("/", (c) => {
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
      }
    </style>
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/api/v1/openapi.json"
      data-proxy-url=""
      data-theme="purple"
      src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.25.107"></script>
  </body>
</html>`;
  return c.html(html);
});

// 3. Alternative Classic Swagger UI Explorer
docsRoutes.get("/swagger", (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>NeuralDesk Swagger UI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    <style>
      body { margin: 0; background: #fafafa; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/api/v1/openapi.json',
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.SwaggerUIStandalonePreset
          ],
          layout: "BaseLayout",
          deepLinking: true
        });
      };
    </script>
  </body>
</html>`;
  return c.html(html);
});
