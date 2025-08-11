import { apiPost, apiPut, apiGet } from "../utils/api"

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
): Promise<loginResponse> {
  return apiPost("/auth/login", loginInput)
}

export async function logoutUser(): Promise<loginResponse> {
  return apiPost("/auth/logout", {})
}

export async function changePassword() {}
