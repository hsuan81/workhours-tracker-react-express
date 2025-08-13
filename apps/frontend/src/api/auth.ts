import { apiPost, type ApiResult } from "../utils/api"

interface loginInput {
  email: string
  password: string
}

interface loginResponse {
  success: boolean
  message: string
}

export async function loginUser(
  loginInput: loginInput
): Promise<ApiResult<loginResponse>> {
  return apiPost<loginResponse>("/auth/login", loginInput)
}

export async function logoutUser(): Promise<ApiResult<loginResponse>> {
  return apiPost<loginResponse>("/auth/logout", {})
}
