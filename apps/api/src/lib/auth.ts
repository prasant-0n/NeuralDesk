/**
 * Better Auth Server Configuration
 * Configures Drizzle ORM adapter, email/password authentication, and session management.
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, user, session, account, verification } from "@neuraldesk/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
  secret:
    process.env.BETTER_AUTH_SECRET ||
    process.env.JWT_SECRET ||
    "neuraldesk_better_auth_secret_minimum_32_characters_long",
  baseURL:
    process.env.BETTER_AUTH_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://neuraldesk-lovat.vercel.app"
      : "http://localhost:5173"),
  trustedOrigins: [
    "https://neuraldesk-lovat.vercel.app",
    "https://neuraldesk-xfe2.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
  ],
});

export type Auth = typeof auth;
