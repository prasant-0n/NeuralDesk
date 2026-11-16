/// <reference types="vite/client" />
/**
 * Better Auth & Neon Managed Auth React Client
 * Supports both Neon Managed Auth service (via VITE_NEON_AUTH_URL / NEON_AUTH_BASE_URL)
 * and the integrated Hono API server for email/password and third-party social OAuth (Google, Microsoft).
 */

import { createAuthClient } from "better-auth/react";

// Resolve Base URL: Check for Neon Managed Auth endpoint first, then window origin
const resolvedBaseURL =
  (import.meta.env?.VITE_NEON_AUTH_URL as string | undefined) ||
  (import.meta.env?.NEON_AUTH_BASE_URL as string | undefined) ||
  (typeof window !== "undefined" ? window.location.origin : "");

export const authClient = createAuthClient({
  baseURL: resolvedBaseURL,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
