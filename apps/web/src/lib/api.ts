/**
 * NeuralDesk Web API Client
 * Centralized fetch wrapper ensuring all outbound API requests include
 * authentication headers, tenant workspace context, and consistent error handling.
 */

export const DEMO_AUTH_TOKEN = "dev-admin-token";
export const DEMO_WORKSPACE_ID = "00000000-0000-4000-8000-000000000002";

export function getApiHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  return {
    "Authorization": `Bearer ${DEMO_AUTH_TOKEN}`,
    "X-Workspace-Id": DEMO_WORKSPACE_ID,
    ...customHeaders,
  };
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const existingHeaders: Record<string, string> = {};

  if (init.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((v, k) => {
        existingHeaders[k] = v;
      });
    } else if (Array.isArray(init.headers)) {
      init.headers.forEach(([k, v]) => {
        existingHeaders[k] = v;
      });
    } else {
      Object.assign(existingHeaders, init.headers);
    }
  }

  const mergedHeaders = getApiHeaders(existingHeaders);

  return fetch(input, {
    credentials: "include",
    ...init,
    headers: mergedHeaders,
  });
}
