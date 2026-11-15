/**
 * Better Auth React Client
 * Provides reactive session state and methods for email/password authentication.
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
