import { clearCsrfToken, getCsrfToken } from "./csrf"

// src/utils/api.ts
const BASE_URL =
  import.meta.env.VITE_API_URL + "/api" || "http://localhost:3000/api"

export type ApiResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      error: {
        status: number
        code: string
        message: string
        details?: unknown
      }
    }

export interface UnexpectedError {
  traceId: string
  err: Error
}

function isWrite(method?: string) {
  const m = (method || "GET").toUpperCase()
  return m === "POST" || m === "PUT" || m === "PATCH" || m === "DELETE"
}

function emitAuthExpired() {
  window.dispatchEvent(new CustomEvent("auth:expired"))
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  allowRetry = true
): Promise<ApiResult<T>> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const method = (options.method || "GET").toUpperCase()
  const url = `${BASE_URL}${normalizedPath}`

  const headers: Headers = new Headers({
    "Content-Type": "application/json",
    ...(options.headers || {}),
  })

  if (isWrite(method)) {
    headers.append("x-csrf-token", await getCsrfToken())
  }

  let res = await fetch(url, {
    credentials: "include",
    headers,
    ...options,
  })

  // If CSRF failed, drop cached token and retry once with a fresh one
  if (res.status === 403 && allowRetry) {
    clearCsrfToken()
    const fresh = await getCsrfToken()
    res = await fetch(url, {
      credentials: "include",
      ...options,
      headers: { ...headers, "x-csrf-token": fresh },
    })
  }

  // Emit auth expired event for 401, 419, 440 status codes
  if (res.status === 401 || res.status === 419 || res.status === 440) {
    emitAuthExpired()
  }

  let body = null
  body = res.status !== 204 ? await res.json() : null

  if (res.ok) {
    return { ok: true, data: (body.data as T) ?? ({} as T) }
  }

  // Expected server error (your new uniform shape)
  if (body && body.success === false) {
    const error = {
      status: res.status,
      code: body.code ?? "UNKNOWN",
      message: body.message ?? "Request failed",
      details: body.details,
    }
    return { ok: false, error }
  }

  // Unexpected shape — log everything for debugging
  throw new Error(`Unexpected API error (HTTP ${res.status})`)
}

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  return apiRequest<T>(path, { credentials: "include" })
}

export async function apiPost<T, U = unknown>(
  path: string,
  body: U
): Promise<ApiResult<T>> {
  return apiRequest<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function apiPut<T, U = unknown>(
  path: string,
  body: U
): Promise<ApiResult<T>> {
  return apiRequest<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

export async function apiDelete<T>(path: string): Promise<ApiResult<T>> {
  return apiRequest<T>(path, { method: "DELETE" })
}
