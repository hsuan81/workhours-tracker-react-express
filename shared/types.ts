// API Request Types
export interface TimeEntry {
  id?: string
  userId: string
  projectId: string
  date: string // YYYY-MM-DD
  hours: number
}
