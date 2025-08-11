// apps/frontend/src/api/users.ts
import { apiPost, apiPut, apiGet } from "../utils/api"
import type { UserRole } from "../../../../shared/types"

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
): Promise<UserResponse> {
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
): Promise<UserResponse> {
  return await apiPut<UserResponse, Partial<UpdateUserInput>>(
    `/users/${id}`,
    data
  )
}

export async function fetchUserById(userId: string): Promise<UserResponse> {
  return await apiGet<UserResponse>(`/users/${userId}`)
}

export async function fetchAllUserNames(): Promise<UserName[]> {
  return await apiGet<UserResponse[]>("/users")
}
