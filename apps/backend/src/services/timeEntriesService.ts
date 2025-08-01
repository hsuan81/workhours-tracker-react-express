import { PrismaClient } from "../generated/prisma/index.js"
import { TimeEntry } from "shared/types.js"
import { toISODate } from "../utils/calendarUtils.js"

const prisma = new PrismaClient()

export async function fetchTimeEntriesByUser(
  userId: string,
  date: Date
): Promise<TimeEntry[]> {
  const entries = await prisma.timeEntry.findMany({
    where: { userId, date },
  })
  return entries.map((entry) => ({
    id: entry.id,
    userId: entry.userId,
    projectId: entry.projectId,
    date: toISODate(entry.date),
    hours: parseFloat(entry.hours.toString()),
  }))
}
