/**
 * NeuralDesk Webhook HMAC SHA-256 Authentication Middleware
 * Enforces cryptographic signature verification, constant-time comparison, and 300s replay window protection.
 */

import crypto from "node:crypto";
import type { Context, MiddlewareHandler } from "hono";
import { AppError } from "./error.middleware.js";

export interface SignatureValidationResult {
  valid: boolean;
  reason?: string;
  timestamp?: number;
}

/**
 * Pure cryptographic signature verification function.
 * Matches RFC-compliant HMAC-SHA256 ingress specification.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string,
  toleranceSeconds: number = 300
): SignatureValidationResult {
  if (!signatureHeader || signatureHeader.trim() === "") {
    return { valid: false, reason: "Missing X-NeuralDesk-Signature header" };
  }

  // Parse header: t=1700000000,v1=abc...
  const parts = signatureHeader.split(",");
  const timestampPart = parts.find((p) => p.trim().startsWith("t="));
  const signaturePart = parts.find((p) => p.trim().startsWith("v1="));

  if (!timestampPart || !signaturePart) {
    return { valid: false, reason: "Malformed signature header format" };
  }

  const timestampStr = timestampPart.trim().slice(2);
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    return { valid: false, reason: "Invalid timestamp in signature header" };
  }

  const receivedSignature = signaturePart.trim().slice(3);
  if (!receivedSignature) {
    return { valid: false, reason: "Empty signature hash in header" };
  }

  // Replay Attack Prevention
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - timestamp) > toleranceSeconds) {
    return { valid: false, reason: "Signature timestamp outside tolerance window" };
  }

  // Reconstruct payload: ${timestamp}.${rawBody}
  const payloadToSign = `${timestamp}.${rawBody}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadToSign, "utf8")
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(receivedSignature, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return { valid: false, reason: "Invalid signature length" };
  }

  const isMatch = crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  if (!isMatch) {
    return { valid: false, reason: "HMAC signature mismatch" };
  }

  return { valid: true, timestamp };
}

export interface HmacMiddlewareOptions {
  secret?: string;
  getSecret?: (c: Context) => Promise<string | null> | string | null;
  toleranceSeconds?: number;
}

/**
 * Hono Middleware enforcing HMAC validation on inbound webhooks.
 */
export function hmacWebhookMiddleware(options: HmacMiddlewareOptions = {}): MiddlewareHandler {
  return async (c: Context, next) => {
    const signatureHeader =
      c.req.header("X-NeuralDesk-Signature") ||
      c.req.header("x-neuraldesk-signature");

    let secret = options.secret || process.env.WEBHOOK_SIGNING_SECRET;

    if (options.getSecret) {
      const dynamicSecret = await options.getSecret(c);
      if (dynamicSecret) {
        secret = dynamicSecret;
      }
    }

    if (!secret) {
      secret = "whsec_sample_secret_key_for_local_testing";
    }

    // Capture raw body
    const rawBody = await c.req.text();
    // Cache raw body so downstream handlers can parse it as JSON
    c.set("rawBody", rawBody);

    const validation = verifyWebhookSignature(
      rawBody,
      signatureHeader,
      secret,
      options.toleranceSeconds ?? 300
    );

    if (!validation.valid) {
      throw new AppError(
        `Webhook HMAC verification failed: ${validation.reason}`,
        401,
        "UNAUTHORIZED"
      );
    }

    c.set("webhookTimestamp", validation.timestamp);
    await next();
  };
}
