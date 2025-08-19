// shared/types.ts
// API Request Types
export interface TimeEntry {
  id?: string
  userId: string
  projectId: string
  date: string // YYYY-MM-DD
  hours: number
}

export const USER_ROLES = ["EMPLOYEE", "ADMINISTRATOR", "MANAGER"] as const
export type UserRole = (typeof USER_ROLES)[number]

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
}
