# 06. Security — Zero-Leak Secrets & BYOK Encryption

[← Back to Documentation Portal](../README.md) | [Next: Sandboxing & Safety →](./sandboxing-and-safety.md)

---

## 1.1 Strict Server-Side Key Isolation

The browser client bundle never imports, inspects, or receives the master `GEMINI_API_KEY`:

```
       UNTRUSTED CLIENT BOUNDARY                         SECURE BACKEND RUNTIME BOUNDARY
┌──────────────────────────────────────┐                ┌──────────────────────────────────────────────┐
│  Browser Client (apps/web)           │                │  API Engine (apps/api)                       │
│                                      │                │                                              │
│  • React Flow Visual DAG             │  REST Commands │  • process.env.GEMINI_API_KEY (Strictly Priv)│
│  • Zustand State Store               │───────────────►│  • Rate Limiter & Workspace Auth Guard       │
│  • Zero knowledge of Gemini Secrets  │  SSE Telemetry │  • Ephemeral BYOK Decryptor                  │
│  • Only receives sanitized chunks    │◄───────────────│  • @google/genai SDK Node Invoker            │
└──────────────────────────────────────┘                └──────────────────────┬───────────────────────┘
                                                                               │ TLS 1.3 Direct
                                                                               ▼
                                                                ┌──────────────────────────────┐
                                                                │ Google Gemini Cloud Endpoint │
                                                                └──────────────────────────────┘
```

---

## 1.2 Multi-Tenant Bring Your Own Key (BYOK) Encryption

For enterprise tenants, API keys are encrypted at rest using **AES-256-GCM** with 96-bit random IVs and 128-bit authentication tags:

```typescript
import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export function encryptApiKey(apiKey: string, masterKeyHex: string): string {
  const masterKey = Buffer.from(masterKeyHex, "hex");
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv, { authTagLength: TAG_LENGTH });

  let encrypted = cipher.update(apiKey, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

export function decryptApiKey(encryptedRecord: string, masterKeyHex: string): string {
  const masterKey = Buffer.from(masterKeyHex, "hex");
  const [ivHex, tagHex, cipherTextHex] = encryptedRecord.split(":");

  if (!ivHex || !tagHex || !cipherTextHex) {
    throw new Error("Invalid encrypted payload format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv, { authTagLength: TAG_LENGTH });

  decipher.setAuthTag(tag);

  let decrypted = decipher.update(cipherTextHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
```

* **Ephemeral In-Memory Lifecycle:** Plaintext API keys are decrypted in-memory only for the exact duration of a model invocation. They are never logged or stored in node execution records.

---

## 1.3 Secure Session Management: `HttpOnly` Cookies vs. LocalStorage

To defend against token theft via Cross-Site Scripting (XSS) in third-party client dependencies, NeuralDesk implements industry-standard cookie isolation:

* **Refresh Tokens:** Issued as `HttpOnly`, `SameSite=Lax`, `Secure` cookies with a 7-day TTL. Inaccessible to client JavaScript.
* **Access Tokens:** Short-lived JWTs (15-minute TTL) stored strictly in client memory (Zustand auth store).
* **Automatic Silent Refresh:** When an access token expires, a silent background `POST /api/v1/auth/refresh` exchanges the secure cookie for a new in-memory access token without user friction.

---

[Next: Sandboxing & Safety →](./sandboxing-and-safety.md)
