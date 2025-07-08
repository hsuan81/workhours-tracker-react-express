// src/types/api.ts
export type ProjectSummary = {
  id: string
  name: string
  hours: number
}

// API Response Types

export type DailySummary = {
  date: string
  totalHours: number
  regularHours: number
  overtimeHours: number
  pay: number
  projects: ProjectSummary[]
}

export type MonthlyOverview = {
  year: number
  month: number
  daysWorked: number
  regularHours: number
  overtimeHours: number
  overtimePay: number
  regularHourLimit: number
  overtimeLimit: number
}
