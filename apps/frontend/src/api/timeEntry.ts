// apps/frontend/src/api/timeEntry.ts
import { apiGet, apiPost } from "../utils/api"

export interface ProjectHours {
  name: string
  hours: number
}

export interface DailySummary {
  date: string
  totalHours: number
  regularHours: number
  overtimeHours: number
  overtimePay: number
  projects: ProjectHours[]
}

export async function fetchTodaySummary(userId: string, date?: string) {
  const params = new URLSearchParams({ userId })
  if (date) params.append("date", date)
  return await apiGet<DailySummary>(
    `/time-entries/summary?${params.toString()}`
  )
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

export async function fetchMonthlyOverview(
  userId: string,
  year?: number,
  month?: number
): Promise<MonthlyOverview> {
  const params = new URLSearchParams({ userId })
  if (year) params.append("year", year.toString())
  if (month) params.append("month", month.toString())
  return await apiGet<MonthlyOverview>(
    `/time-entries/monthly-overview?${params.toString()}`
  )
}

export interface TimeEntryInput {
  id?: string
  userId: string
  projectId: string
  date: string // YYYY-MM-DD
  hours: number
}

export interface TimeEntryResponse {
  updated: TimeEntryInput[]
  created: TimeEntryInput[]
}

export async function logTimeEntries(
  entries: TimeEntryInput[]
): Promise<TimeEntryResponse> {
  return await apiPost<TimeEntryResponse, TimeEntryInput[]>(
    "/time-entries/",
    entries
  )
}
