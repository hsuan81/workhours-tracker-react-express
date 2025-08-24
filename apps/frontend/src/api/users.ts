// apps/frontend/src/api/users.ts
import { apiPost, apiPut, apiGet, type ApiResult } from "../utils/api"
import type { UserRole } from "../types/types"

// export type UserRole = "EMPLOYEE" | "ADMINISTRATOR" | "MANAGER"

export interface RegisterUserInput {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  teamId: string
  hireDate: string // YYYY-MM-DD
  monthlySalary: number
}

export interface UserResponse {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  teamId: string
  hireDate: string
  monthlySalary: number
  hourlyRate: number
  isActive: boolean
}

export type UserName = Pick<UserResponse, "id" | "firstName" | "lastName">

export async function registerUser(
  data: RegisterUserInput
): Promise<ApiResult<UserResponse>> {
  return await apiPost<UserResponse, RegisterUserInput>("/users/register", data)
}

export interface UpdateUserInput {
  firstName: string
  lastName: string
  role: UserRole
  teamId: string
  hireDate: string
  monthlySalary: number
  isActive: boolean
}

export async function updateUser(
  id: string,
  data: Partial<UpdateUserInput>
): Promise<ApiResult<UserResponse>> {
  return await apiPut<UserResponse, Partial<UpdateUserInput>>(
    `/users/${id}`,
    data
  )
}

export async function fetchLoggedInUser(): Promise<ApiResult<UserResponse>> {
  return await apiGet<UserResponse>("/users/me")
}

export async function fetchUserById(
  userId: string
): Promise<ApiResult<UserResponse>> {
  return await apiGet<UserResponse>(`/users/${userId}`)
}

export async function fetchAllUserNames(): Promise<ApiResult<UserName[]>> {
  return await apiGet<UserResponse[]>("/users")
}

interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

interface ChangePasswordResponse {
  success: boolean
  message: string
}

export async function changePassword(
  passwordInput: ChangePasswordInput
): Promise<ApiResult<ChangePasswordResponse>> {
  return await apiPost<ChangePasswordResponse>("/users/password", passwordInput)
}
