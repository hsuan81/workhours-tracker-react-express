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
