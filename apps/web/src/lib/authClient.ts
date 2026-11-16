/// <reference types="vite/client" />
/**
 * Better Auth Production React Client
 * Connected to NeuralDesk same-origin API endpoint (/api/auth).
 * Eliminates third-party DNS restrictions, CORS blocks, and cross-domain cookie issues.
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
