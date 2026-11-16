/// <reference types="vite/client" />
/**
 * Better Auth & Neon Managed Auth React Client
 * Directly connected to Neon's Managed Better Auth service.
 */

import { createAuthClient } from "better-auth/react";

export const NEON_AUTH_URL =
  (import.meta.env?.VITE_NEON_AUTH_URL as string | undefined) ||
  "https://ep-snowy-term-be1jqdqs.neonauth.c-9.us-east-2.aws.neon.tech/neondb/auth";

export const authClient = createAuthClient({
  baseURL: NEON_AUTH_URL,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
