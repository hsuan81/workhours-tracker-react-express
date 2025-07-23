// apps/backend/utils/calendarUtils.ts

const HOLIDAYS: string[] = [] // Post-MVP: add custom holidays here

export function isWorkday(date: Date): boolean {
  const day = date.getDay()
  const isoDate = toISODate(date)
  return day !== 0 && day !== 6 && !HOLIDAYS.includes(isoDate)
}

export function getLastNWorkdays(endDate: Date, n: number): Date[] {
  const workdays: Date[] = []
  const current = new Date(endDate)

  while (workdays.length < n) {
    if (isWorkday(current)) {
      workdays.unshift(new Date(current))
    }
    current.setDate(current.getDate() - 1)
  }
  return workdays
}

export function getMonthRange(monthStr: string): { start: Date; end: Date } {
  const [year, month] = monthStr.split("-").map(Number)
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0) // 0th day of next month = last day of current month
  return { start, end }
}

export function toISODate(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}
