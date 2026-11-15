/**
 * NeuralDesk Idempotency Middleware
 * Enforces exactly-once semantics for mutating requests using X-Idempotency-Key with 24-hour TTL.
 */

import type { Context, MiddlewareHandler } from "hono";
import { db, idempotencyKeys, eq } from "@neuraldesk/db";
import { AppError } from "./error.middleware.js";

interface CachedIdempotentEntry {
  status: "pending" | "resolved" | "failed";
  statusCode: number;
  responsePayload?: Record<string, unknown>;
  expiresAt: Date;
}

// In-memory fallback cache for resilience (e.g. testing or transient DB disconnects)
const memoryCache = new Map<string, CachedIdempotentEntry>();

// Purge expired entries from memory cache periodically
setInterval(() => {
  const now = new Date();
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt <= now) {
      memoryCache.delete(key);
    }
  }
}, 60 * 1000).unref();

export interface IdempotencyOptions {
  required?: boolean;
  ttlSeconds?: number;
  workspaceId?: string;
}

/**
 * Creates an idempotency middleware handler.
 */
export function idempotencyMiddleware(options: IdempotencyOptions = {}): MiddlewareHandler {
  const ttlSeconds = options.ttlSeconds ?? 86400; // 24 hours default
  const isRequired = options.required ?? false;

  return async (c: Context, next) => {
    // Only apply to mutating HTTP methods
    const method = c.req.method.toUpperCase();
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
      return await next();
    }

    const headerKey =
      c.req.header("X-Idempotency-Key") ||
      c.req.header("x-idempotency-key") ||
      c.req.header("Idempotency-Key");

    if (!headerKey && isRequired) {
      throw new AppError("X-Idempotency-Key header is required for this operation", 400, "MISSING_IDEMPOTENCY_KEY");
    }

    // If key not provided and not strictly required, pass through
    if (!headerKey) {
      return await next();
    }

    const idempotencyKey = headerKey.trim();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

    // 1. Check in-memory cache first
    const memEntry = memoryCache.get(idempotencyKey);
    if (memEntry && memEntry.expiresAt > now) {
      if (memEntry.status === "pending") {
        throw new AppError(
          "A request with this idempotency key is currently being processed.",
          409,
          "IDEMPOTENCY_CONFLICT"
        );
      }
      if (memEntry.status === "resolved" && memEntry.responsePayload) {
        c.header("X-Idempotent-Replay", "true");
        c.header("X-Cache-Lookup", "HIT");
        return c.json(memEntry.responsePayload, memEntry.statusCode as any);
      }
    }

    // 2. Query Postgres idempotency_keys table if reachable
    let dbSuccess = false;
    try {
      const records = await db
        .select()
        .from(idempotencyKeys)
        .where(eq(idempotencyKeys.idempotencyKey, idempotencyKey))
        .limit(1);

      if (records.length > 0) {
        const record = records[0];
        if (record.expiresAt > now) {
          if (record.status === "pending") {
            throw new AppError(
              "A request with this idempotency key is currently being processed.",
              409,
              "IDEMPOTENCY_CONFLICT"
            );
          }
          if (record.status === "resolved" && record.responsePayload) {
            c.header("X-Idempotent-Replay", "true");
            c.header("X-Cache-Lookup", "HIT");
            return c.json(record.responsePayload, 200);
          }
        }
      }

      // Mark as pending in database
      const fallbackWorkspaceId =
        options.workspaceId ||
        c.req.param("wsId") ||
        "00000000-0000-4000-8000-000000000002"; // Default seed workspace

      await db
        .insert(idempotencyKeys)
        .values({
          workspaceId: fallbackWorkspaceId,
          idempotencyKey,
          status: "pending",
          expiresAt,
        })
        .onConflictDoNothing();

      dbSuccess = true;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      // DB is unavailable or table not migrated yet; fallback to memoryCache
    }

    // Set pending in memory cache
    memoryCache.set(idempotencyKey, {
      status: "pending",
      statusCode: 200,
      expiresAt,
    });

    try {
      await next();

      // Read response status
      const resStatus = c.res.status;
      if (resStatus >= 200 && resStatus < 300) {
        // Clone response and extract json payload for caching
        const clonedRes = c.res.clone();
        try {
          const bodyJson = await clonedRes.json();
          memoryCache.set(idempotencyKey, {
            status: "resolved",
            statusCode: resStatus,
            responsePayload: bodyJson,
            expiresAt,
          });

          if (dbSuccess) {
            try {
              await db
                .update(idempotencyKeys)
                .set({
                  status: "resolved",
                  responsePayload: bodyJson,
                })
                .where(eq(idempotencyKeys.idempotencyKey, idempotencyKey));
            } catch {
              // Ignore background update error
            }
          }
        } catch {
          // If response body is not JSON, resolve without payload
          memoryCache.set(idempotencyKey, {
            status: "resolved",
            statusCode: resStatus,
            expiresAt,
          });
        }
      } else {
        memoryCache.delete(idempotencyKey);
      }
    } catch (error) {
      memoryCache.delete(idempotencyKey);
      throw error;
    }
  };
}
