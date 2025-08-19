import type { User } from "../types/types"
import { apiPost, apiGet, type ApiResult } from "../utils/api"

interface loginInput {
  email: string
  password: string
}

interface loginResponse {
  success: boolean
  message: string
}

interface sessionCheckResponse {
  authenticated: true
  user?: User
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

export async function loginUser(
  loginInput: loginInput
): Promise<ApiResult<loginResponse>> {
  return apiPost<loginResponse>("/auth/login", loginInput)
}

export async function logoutUser(): Promise<ApiResult<loginResponse>> {
  return apiPost<loginResponse>("/auth/logout", {})
}

export async function checkAuthenticated(): Promise<
  ApiResult<sessionCheckResponse>
> {
  return apiGet<sessionCheckResponse>("/auth/session")
}
