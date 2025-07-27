// src/types/api.ts
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

export interface TimeEntry {
  id?: string
  projectId: string
  projectName: string
  date: string
  hours: number | null
  status: "new" | "edited" | "deleted" | "unchanged"
}

// API Response Types

export interface DailySummary {
  date: string
  totalHours: number
  regularHours: number
  overtimeHours: number
  overtimePay: number | null
  projects: ProjectSummary[]
}

export interface MonthlyOverview {
  year: number
  month: number
  daysWorked: number
  regularHours: number
  overtimeHours: number
  overtimePay: number
  overtimeLimit: number
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

export interface RegisterUserPayload {
  userId: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  teamId: string
  hireDate: string
  monthlySalary: number
}

export interface UpdateUserPayload {
  userId: string
  firstName: string // Add this
  lastName: string
  role: UserRole
  teamId: string
  hireDate: string
  monthlySalary: number
  isActive: boolean
}
