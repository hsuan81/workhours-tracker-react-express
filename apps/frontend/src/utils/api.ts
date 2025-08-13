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

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  const res = await fetch(`${BASE_URL}${normalizedPath}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  let body = null
  try {
    body = res.status !== 204 ? await res.json() : null
  } catch (e) {
    console.error("JSON parse error", { path, status: res.status, e })
  }

  if (res.ok) {
    return { ok: true, data: (body as T) ?? ({} as T) }
  }

  // if (!res.ok) {
  //   throw new Error(`API error: ${res.status} ${res.statusText}`)
  // }

  // return res.json()
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
  console.error("Unexpected API error", { path, status: res.status, body })
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
    credentials: "include",
  })
}

export async function apiPut<T, U = unknown>(
  path: string,
  body: U
): Promise<ApiResult<T>> {
  return apiRequest<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
    credentials: "include",
  })
}

export async function apiDelete<T>(path: string): Promise<ApiResult<T>> {
  return apiRequest<T>(path, { method: "DELETE", credentials: "include" })
}
