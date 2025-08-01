// src/types/api.ts
import type { UpdateUserInput } from "./api/users"
export interface ProjectSummary {
  id: string
  name: string
  hours: number
}

export type Project = Omit<ProjectSummary, "hours">

// API Request Types
// export interface TimeEntry {
//   id?: string
//   userId: string
//   projectId: string
//   date: string // YYYY-MM-DD
//   hours: number
// }

// API Response Types

export interface DailySummary {
  date: string
  totalHours: number
  regularHours: number
  overtimeHours: number
  overtimePay: number | null
  projects: ProjectSummary[]
}

export interface UserOverview {
  id: string
  name: string
  email: string
  role: "EMPLOYEE" | "MANAGER" | "ADMINISTRATOR"
  teamId: string
  hireDate: string // ISO date
  monthlySalary: number
  isActive: boolean
}

// Administration Page Types
export const USER_ROLES = ["EMPLOYEE", "ADMINISTRATOR", "MANAGER"] as const
export type UserRole = (typeof USER_ROLES)[number]

export interface UpdateUserInputWithId extends UpdateUserInput {
  id: string
}
