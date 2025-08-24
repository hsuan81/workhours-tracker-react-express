// src/utils/csrf.ts

import { fetchCsrfToken } from "../api/csrf"

let cachedToken: string | null = null
let inflight: Promise<string> | null = null
let version = 0 // bump when you intentionally invalidate (e.g., after 403, logout)

export function clearCsrfToken() {
  cachedToken = null
  version++
}

export async function getCsrfToken(): Promise<string> {
  if (cachedToken) return cachedToken
  if (inflight) return await inflight

  const myVersion = version
  inflight = (async () => {
    // const r = await fetch(`${BASE_URL}/api/csrf-token`, {
    //   credentials: "include",
    // })
    const r = await fetchCsrfToken()
    if (!r.ok) throw new Error(`Failed to fetch CSRF token: ${r.error.message}`)
    const { csrfToken } = r.data
    // Only commit if nothing invalidated during the request
    if (myVersion === version) cachedToken = csrfToken
    return csrfToken
  })()

  try {
    return await inflight
  } finally {
    inflight = null
  }
}
