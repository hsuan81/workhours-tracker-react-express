import { Prisma, PrismaClient } from "../generated/prisma/index.js"
import { TimeEntry } from "../types/types.js"
import { toISODate } from "../utils/calendarUtils.js"
import { ApiErrorCode } from "../utils/http.js"
import { syncOvertimeSummary } from "../utils/overtime.js"

const prisma = new PrismaClient()

export async function fetchTimeEntriesByUser(
  userId: string,
  date: Date
): Promise<TimeEntry[]> {
  const entries = await prisma.timeEntry.findMany({
    where: { userId, date },
  })
  return entries.map((entry) => ({
    id: entry.id ?? "",
    userId: entry.userId ?? "",
    projectId: entry.projectId ?? "",
    date: toISODate(entry.date),
    hours: parseFloat(entry.hours.toString()) ?? 0,
  }))
}

export type TimeEntryWithStatus = TimeEntry & {
  status: "new" | "updated" | "deleted"
}

interface UpdateTimeEntriesResult {
  updated: TimeEntry[]
  created: TimeEntry[]
  deleted: Pick<TimeEntry, "id" | "projectId">[]
  code: ApiErrorCode | null
  error: string | null
}

export async function updateTimeEntries(
  userId: string,
  dataDate: Date,
  entries: TimeEntryWithStatus[]
): Promise<UpdateTimeEntriesResult> {
  if (entries.length === 0) {
    return {
      updated: [],
      created: [],
      deleted: [],
      code: null,
      error: null,
    }
  }

  // Validate all entries belong to the same date
  const firstDate = entries[0].date
  if (!entries.every((e) => e.date === firstDate)) {
    throw new Error("All time entries must have the same date")
  }

  // Separate entries into toCreate, toUpdate, and toDelete
  const toCreate = entries
    .filter((e) => e.status === "new")
    .map((e) => ({
      userId: e.userId,
      projectId: e.projectId,
      date: new Date(e.date),
      hours: e.hours,
    }))
  const toUpdate = entries
    .filter((e) => e.status === "updated")
    .map((e) => ({
      id: e.id,
      userId: e.userId,
      projectId: e.projectId,
      date: new Date(e.date),
      hours: e.hours,
    }))
  const toDelete = entries
    .filter((e) => e.status === "deleted")
    .map((e) => ({
      id: e.id,
      userId: e.userId,
      projectId: e.projectId,
      date: new Date(e.date),
      hours: e.hours,
    }))

  const results = await prisma.$transaction(async (tx) => {
    const resultStats: {
      updated: TimeEntry[]
      created: TimeEntry[]
      deleted: Pick<TimeEntry, "id" | "projectId">[]
      code: ApiErrorCode | null
      error: string | null
    } = {
      updated: [],
      created: [],
      deleted: [],
      code: null,
      error: null,
    }
    try {
      // Create new entries
      const createdEntries = await tx.timeEntry.createManyAndReturn({
        data: toCreate,
      })

      resultStats.created = createdEntries.map((e) => ({
        ...e,
        hours: e.hours.toNumber(),
        date: toISODate(e.date),
      }))

      // Update existing entries
      const updatedEntriesPromises = toUpdate.map((e) =>
        tx.timeEntry.update({
          where: {
            userId_date_projectId: {
              userId: e.userId,
              date: dataDate,
              projectId: e.projectId,
            },
          },
          data: {
            hours: e.hours,
          },
        })
      )
      const updatedEntries = await Promise.all(updatedEntriesPromises)
      resultStats.updated = updatedEntries.map((e) => ({
        ...e,
        date: toISODate(e.date),
        hours: e.hours.toNumber(),
      }))

      // Delete removed entries
      const deletedEntriesPromises = toDelete.map((e) =>
        tx.timeEntry.delete({
          where: { id: e.id! },
        })
      )
      const deletedEntries = await Promise.all(deletedEntriesPromises)
      resultStats.deleted = deletedEntries.map((e) => ({
        id: e.id!,
        projectId: e.projectId,
      }))
      console.log(
        `Created: ${createdEntries.length}, Updated: ${updatedEntries.length}, Deleted: ${deletedEntries.length}`
      )

      await syncOvertimeSummary(tx, userId, dataDate)
    } catch (error) {
      // Simple error handling
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2002":
            resultStats.code = "CONFLICT"
            resultStats.error = "Duplicate entry - record already exists"
            break
          case "P2025":
            resultStats.code = "NOT_FOUND"
            resultStats.error = "Record not found"
            break
          case "P2003":
            resultStats.code = "CONFLICT"
            resultStats.error = "Foreign key constraint violation"
            break
          default:
            resultStats.code = "DATABASE_ERROR"
            resultStats.error = `Database error: ${error.message}`
        }
        console.error("Database error:", error)
      } else {
        resultStats.code = "DATABASE_ERROR"
        resultStats.error = "An unexpected error occurred"
        console.error("Unexpected error:", error)
      }
    } finally {
      return resultStats
    }
  })
  return results
}
