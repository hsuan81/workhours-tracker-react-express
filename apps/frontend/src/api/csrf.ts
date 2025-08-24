import { apiGet, type ApiResult } from "../utils/api"

export async function fetchCsrfToken(): Promise<
  ApiResult<{ csrfToken: string }>
> {
  return apiGet<{ csrfToken: string }>("/csrf-token")
}
