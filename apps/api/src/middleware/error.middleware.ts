/**
 * NeuralDesk RFC 7807 Global Error Handling Middleware
 * Guarantees standard Problem Details (RFC 7807) and NeuralDesk API Error Envelopes.
 */

import type { Context, ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import type { ApiErrorResponse, ApiErrorDetail } from "@neuraldesk/shared";

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: ApiErrorDetail[];
  public readonly typeUrl?: string;

  constructor(
    message: string,
    status: number = 500,
    code: string = "INTERNAL_SERVER_ERROR",
    details?: ApiErrorDetail[],
    typeUrl?: string
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.typeUrl = typeUrl;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export interface Rfc7807ProblemDetails extends ApiErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  invalidParams?: ApiErrorDetail[];
}

function getTitleForStatus(status: number): string {
  switch (status) {
    case 400:
      return "Bad Request";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "Not Found";
    case 409:
      return "Conflict";
    case 422:
      return "Unprocessable Entity";
    case 429:
      return "Too Many Requests";
    case 500:
      return "Internal Server Error";
    case 502:
      return "Bad Gateway";
    case 503:
      return "Service Unavailable";
    case 504:
      return "Gateway Timeout";
    default:
      return "Error";
  }
}

function getCodeForStatus(status: number): string {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 422:
      return "VALIDATION_FAILED";
    case 429:
      return "RATE_LIMIT_EXCEEDED";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
}

/**
 * Maps ZodError issues to ApiErrorDetail list.
 */
function mapZodIssues(error: ZodError): ApiErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    issue: issue.message,
    code: issue.code,
  }));
}

/**
 * Global Hono Error Handler conforming to RFC 7807 and NeuralDesk Wire Protocol.
 */
export const errorHandler: ErrorHandler = (err: Error, c: Context) => {
  const path = c.req.path;
  const traceId =
    c.req.header("X-Request-Id") ||
    c.req.header("x-request-id") ||
    crypto.randomUUID();
  const timestamp = new Date().toISOString();

  let status = 500;
  let code = "INTERNAL_SERVER_ERROR";
  let title = "Internal Server Error";
  let detail = err.message || "An unexpected error occurred.";
  let details: ApiErrorDetail[] | undefined = undefined;
  let typeUri = `https://api.neuraldesk.ai/errors/${code.toLowerCase().replace(/_/g, "-")}`;

  if (err instanceof ZodError) {
    status = 400;
    code = "VALIDATION_FAILED";
    title = "Validation Failed";
    detail = "Request validation failed. Verify payload against API schema.";
    details = mapZodIssues(err);
    typeUri = "https://api.neuraldesk.ai/errors/validation-failed";
  } else if (err instanceof AppError) {
    status = err.status;
    code = err.code;
    title = getTitleForStatus(err.status);
    detail = err.message;
    details = err.details;
    typeUri =
      err.typeUrl ||
      `https://api.neuraldesk.ai/errors/${code.toLowerCase().replace(/_/g, "-")}`;
  } else if (err instanceof HTTPException) {
    status = err.status;
    code = getCodeForStatus(err.status);
    title = getTitleForStatus(err.status);
    detail = err.message || title;
    typeUri = `https://api.neuraldesk.ai/errors/${code.toLowerCase().replace(/_/g, "-")}`;
  }

  const responseBody: Rfc7807ProblemDetails = {
    type: typeUri,
    title,
    status,
    detail,
    instance: path,
    ...(details ? { invalidParams: details } : {}),
    error: {
      code,
      message: detail,
      status,
      ...(details ? { details } : {}),
      timestamp,
      path,
      traceId,
    },
  };

  // Structured Logging in non-test environments
  if (process.env.NODE_ENV !== "test") {
    console.error(`[API Error] [${status}] ${code}: ${detail}`, {
      path,
      traceId,
      stack: status >= 500 ? err.stack : undefined,
    });
  }

  return c.newResponse(JSON.stringify(responseBody), status as any, {
    "Content-Type": "application/problem+json; charset=utf-8",
    "X-Trace-Id": traceId,
  });
};

/**
 * 404 Route Not Found Handler.
 */
export const notFoundHandler: NotFoundHandler = (c: Context) => {
  const path = c.req.path;
  const traceId =
    c.req.header("X-Request-Id") ||
    c.req.header("x-request-id") ||
    crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const responseBody: Rfc7807ProblemDetails = {
    type: "https://api.neuraldesk.ai/errors/not-found",
    title: "Not Found",
    status: 404,
    detail: `Route ${c.req.method} ${path} does not exist.`,
    instance: path,
    error: {
      code: "NOT_FOUND",
      message: `Route ${c.req.method} ${path} does not exist.`,
      status: 404,
      timestamp,
      path,
      traceId,
    },
  };

  return c.newResponse(JSON.stringify(responseBody), 404, {
    "Content-Type": "application/problem+json; charset=utf-8",
    "X-Trace-Id": traceId,
  });
};
