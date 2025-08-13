// src/utils/http.ts
import type { Response } from "express"
import { randomUUID } from "crypto"

export type ApiErrorCode =
  | "INVALID_CREDENTIALS"
  | "VALIDATION_FAILED"
  | "SESSION_EXPIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "BAD_REQUEST"
  | "INTERNAL_ERROR"
  | "DATABASE_ERROR"
  | "INVALID_QUERY"
  | "CONFLICT"

// One place to maintain all codes & statuses
export const ApiErrorStatusMap: Record<ApiErrorCode, number> = {
  INVALID_CREDENTIALS: 401, // Unauthorized - bad credentials
  VALIDATION_FAILED: 400, // Bad Request - invalid input data
  SESSION_EXPIRED: 401, // Unauthorized - expired token/session
  FORBIDDEN: 403, // Forbidden - authenticated but no permission
  NOT_FOUND: 404, // Not Found - resource doesn't exist
  RATE_LIMITED: 429, // Too Many Requests
  BAD_REQUEST: 400, // Bad Request (or change to 500 if server fault)
  INTERNAL_ERROR: 500, // Internal Server Error
  // Database related errors
  DATABASE_ERROR: 500, // A query failed unexpectedly due to server-side issues (e.g., connection failure, unhandled ORM error)
  INVALID_QUERY: 400, // The request parameters are invalid for the database operation (e.g., invalid column name, negative value where positive is required)
  CONFLICT: 409, // The request is syntactically correct, but can’t be processed because it would result in a duplicate resource (e.g., trying to register an email that’s already taken)
}

export function sendFail<C extends ApiErrorCode>(
  res: Response,
  code: C,
  message: string,
  details?: unknown
) {
  const status = ApiErrorStatusMap[code] ?? 500
  return res.status(status).json({
    success: false,
    code,
    message,
    details,
  })
}

export function sendOk<T extends object = {}>(
  res: Response,
  body?: T,
  message = "OK",
  status = 200
) {
  return res.status(status).json({
    success: true,
    message,
    data: body ?? {},
  })
}

/** For unexpected errors: returns a traceId you can search in logs */
export function sendUnexpected(res: Response, err: Error) {
  const traceId = randomUUID()
  console.error("[UNEXPECTED]", { traceId, err })
  return sendFail(res, "INTERNAL_ERROR", "Something went wrong", {
    traceId,
    err,
  })
}
