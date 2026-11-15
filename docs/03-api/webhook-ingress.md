# 03. API — HMAC SHA-256 Webhook Ingress Gateway

[← Back to Documentation Portal](../README.md) | [← SSE Streaming](./sse-streaming.md) | [Next Section: AI Engine →](../04-ai-engine/graph-orchestration.md)

---

## 3.1 Webhook Trigger Endpoint

* **Endpoint:** `POST /api/v1/webhooks/trigger/:urlToken`
* **Authentication:** Cryptographic header `X-NeuralDesk-Signature`

### Signature Header Format
`X-NeuralDesk-Signature: t=1700000000,v1=9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08`
* `t`: Unix epoch timestamp in seconds.
* `v1`: Hex-encoded HMAC SHA-256 signature of `${t}.${rawBody}` computed with the workflow webhook secret.

---

## 3.2 Production Verification Implementation (`apps/api/src/middleware/webhook-auth.ts`)

```typescript
import crypto from "node:crypto";

export interface SignatureValidationResult {
  valid: boolean;
  reason?: string;
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSeconds: number = 300
): SignatureValidationResult {
  if (!signatureHeader) {
    return { valid: false, reason: "Missing X-NeuralDesk-Signature header" };
  }

  // Parse header
  const parts = signatureHeader.split(",");
  const timestampPart = parts.find((p) => p.startsWith("t="));
  const signaturePart = parts.find((p) => p.startsWith("v1="));

  if (!timestampPart || !signaturePart) {
    return { valid: false, reason: "Malformed signature header format" };
  }

  const timestamp = parseInt(timestampPart.slice(2), 10);
  const receivedSignature = signaturePart.slice(3);

  // Replay Attack Prevention
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - timestamp) > toleranceSeconds) {
    return { valid: false, reason: "Signature timestamp outside tolerance window" };
  }

  // Compute expected signature
  const payloadToSign = `${timestamp}.${rawBody}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadToSign, "utf8")
    .digest("hex");

  // Constant-time comparison
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(receivedSignature, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return { valid: false, reason: "Invalid signature length" };
  }

  const isMatch = crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  return isMatch ? { valid: true } : { valid: false, reason: "HMAC signature mismatch" };
}
```

---

## 3.3 Webhook Idempotency & Deduplication Engine

To prevent duplicate workflow runs caused by network retries from external emitters (e.g. Stripe, GitHub, Shopify), NeuralDesk evaluates an **Idempotency Fingerprint**:

```
Inbound Webhook
       │
       ▼
Extract X-Idempotency-Key (or compute SHA-256 hash of rawBody)
       │
       ▼
Query `idempotency_keys` table (with 24h TTL)
       ├───► [Match Found] ──► Return cached 202 Accepted { execution_id: "...", status: "cached" }
       │                       (Prevents duplicate execution & avoids burning Gemini tokens)
       │
       └───► [New Key] ─────► Atomically insert into `idempotency_keys`
                              Dispatch workflow execution to engine
```

### Idempotency Guarantee
* **TTL:** 24 hours.
* **Concurrency Protection:** PostgreSQL `ON CONFLICT DO NOTHING` ensures that even simultaneous concurrent retries spawn exactly **one** execution run.

---

[← Previous: SSE Streaming](./sse-streaming.md) | [Next Section: AI Engine →](../04-ai-engine/graph-orchestration.md)
