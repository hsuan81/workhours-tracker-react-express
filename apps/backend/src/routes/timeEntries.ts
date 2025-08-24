// src/routes/entries.ts
import express, { Request, Response } from "express"
import { PrismaClient, Prisma } from "../generated/prisma/index.js"
import { TimeEntry } from "../types/types"
import { allow } from "../auth/auth.js"
import { fetchTimeEntriesByUser } from "../services/timeEntriesService.js"
import {
  ApiErrorCode,
  sendFail,
  sendOk,
  sendUnexpected,
} from "../utils/http.js"
import { toISODate } from "../utils/calendarUtils.js"
import { syncOvertimeSummary } from "../utils/overtime.js"

const router = express.Router()

const prisma = new PrismaClient()

const OVERTIME_LIMIT = 46 // Legal limit for overtime hours in a month

// Create or update time entries
router.post(
  "/",
  allow({ anyOf: ["EMPLOYEE", "MANAGER"] }),
  async (req: Request, res: Response) => {
    console.log("Api: /timeEntries POST", req.body)
    if (!req.body || req.body.length == 0) {
      console.warn("No time entries provided")
      sendOk(res, { updated: [], created: [] })
      return
    }
    const entries = req.body as TimeEntry[]
    const userId = req.session.user!.userId!
    const dataDate = new Date(entries[0].date)

    const toCreate = entries
      .filter((e) => !e.id)
      .map((e) => ({
        userId: e.userId,
        projectId: e.projectId,
        date: new Date(e.date),
        hours: new Prisma.Decimal(e.hours.toFixed(2)),
      }))
    const toUpdate = entries.filter((e) => e.id)
    const toUpdateIdSet = new Set(toUpdate.map((e) => e.id!))

    // Check if update targets exist
    const existingIds = await prisma.timeEntry.findMany({
      where: { id: { in: toUpdate.map((e) => e.id!) } },
      select: { id: true },
    })
    const existingIdSet = new Set(existingIds.map((e) => e.id))

    const notFoundIds = new Set(
      [...toUpdateIdSet].filter((id) => !existingIdSet.has(id))
    )

    if (notFoundIds.size > 0) {
      console.warn("Time entry IDs not found for update:", notFoundIds)
      sendFail(
        res,
        "NOT_FOUND",
        `Time entry ids not found: ${Array.from(notFoundIds).join(", ")}`
      )
      return
    }

    // Check deleted target
    const toDeletedIdSet: Set<string> = new Set()
    for (const e of existingIdSet) {
      if (!toUpdateIdSet.has(e)) {
        toDeletedIdSet.add(e)
      }
    }

    console.log("->toCreate", toCreate)
    console.log("->toUpdate", toUpdate)
    console.log("->toDeletedIdSet", toDeletedIdSet)

    const results = await prisma.$transaction(async (tx) => {
      const resultStats: {
        updated: TimeEntry[]
        created: TimeEntry[]
        deleted: TimeEntry[]
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
        const created = await tx.timeEntry.createManyAndReturn({
          data: toCreate,
          skipDuplicates: true,
          select: {
            id: true,
            userId: true,
            projectId: true,
            hours: true,
            date: true,
          },
        })
        resultStats.created = created.map((e) => ({
          ...e,
          hours: e.hours.toNumber(),
          date: toISODate(e.date),
        }))

        for (const entry of toUpdate) {
          const updated = await tx.timeEntry.update({
            where: { id: entry.id! },
            data: {
              userId: entry.userId,
              projectId: entry.projectId,
              date: new Date(entry.date),
              hours: new Prisma.Decimal(entry.hours.toFixed(2)),
              updatedAt: new Date(),
            },
          })
          resultStats.updated.push({
            id: updated.id,
            userId: updated.userId,
            projectId: updated.projectId,
            date: toISODate(updated.date),
            hours: updated.hours.toNumber(),
          })
        }

        for (const d of toDeletedIdSet) {
          const deleted = await tx.timeEntry.delete({
            where: { id: d },
          })
          resultStats.deleted.push({
            id: deleted.id,
            userId: deleted.userId,
            projectId: deleted.projectId,
            date: toISODate(deleted.date),
            hours: deleted.hours.toNumber(),
          })
        }

        console.log("->updating daily overtime")
        await syncOvertimeSummary(tx, userId, dataDate)

        const test = await tx.timeEntry.findMany({
          where: { userId, date: dataDate },
          select: { hours: true },
        })
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
        const after = await prisma.timeEntry.findMany({
          where: { userId },
          select: { hours: true },
        })
        return resultStats
      }
    })
    if (results.error) {
      sendFail(res, results.code!, results.error)
    }
    console.log("Api: /timeEntries POST - finished", results)

    sendOk(res, { updated: results.updated, created: results.created })
  }
)

// Get time entries summary for a specific user and date
router.get(
  "/summary",
  allow({ anyOf: ["EMPLOYEE", "MANAGER"] }),
  async (req: Request, res: Response) => {
    console.log("Api: /timeEntries/summary GET", req.query)
    try {
      const userId = req.session.user!.userId!
      const dateParam = req.query.date as string | undefined

      const date = dateParam ? new Date(dateParam) : new Date()

      console.log("-> fetching data for userId:", userId, "date:", date)
      const entries = await prisma.timeEntry.findMany({
        where: {
          userId,
          date,
        },
        include: { project: true },
      })

      const totalHours = entries.reduce(
        (sum, e) => sum.plus(e.hours),
        new Prisma.Decimal(0)
      )
      const totalHoursNumber = totalHours.toNumber()
      const regularHoursNumber = totalHours
        ? Math.min(totalHoursNumber, 8.0)
        : 0.0

      const overtimeRecord = await prisma.dailyOvertime.findFirst({
        where: { userId, date },
        select: { overtimeHours: true, overtimePay: true },
      })

      console.log("Api: /timeEntries/summary GET - finished")

      sendOk(res, {
        date: toISODate(date),
        totalHours: totalHoursNumber ?? 0.0,
        regularHours: regularHoursNumber ?? 0.0,
        overtimeHours: overtimeRecord
          ? overtimeRecord.overtimeHours.toNumber()
          : 0.0,
        overtimePay: overtimeRecord
          ? overtimeRecord.overtimePay.toNumber()
          : 0.0,
        projects: entries
          ? entries.map((e) => ({
              name: e.project.name,
              hours: e.hours,
            }))
          : [],
      })
    } catch (error) {
      const err = error as Error
      console.error("Api: /timeEntries/summary GET - Error:", err)
      sendUnexpected(res, err)
    }
  }
)

// Get monthly overview for a user for a specific month
router.get(
  "/monthly-overview",
  allow({ anyOf: ["EMPLOYEE", "MANAGER"] }),
  async (req: Request, res: Response) => {
    console.log("Api: /timeEntries/monthly-overview GET", req.query)

    try {
      const userId = req.session.user!.userId!
      const month =
        parseInt(req.query.month as string, 10) || new Date().getMonth() + 1
      const year =
        parseInt(req.query.year as string, 10) || new Date().getFullYear()

      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)

      console.log(
        "-> fetching data for userId:",
        userId,
        "month:",
        month,
        "year:",
        year
      )
      const dayEntries = await prisma.timeEntry.groupBy({
        by: ["date"],
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          hours: true,
        },
      })

      const daysWorked = dayEntries.length

      const totalHours = dayEntries.reduce(
        (sum, e) => sum.plus(e._sum.hours ?? 0),
        new Prisma.Decimal(0)
      )
      const regularHoursNumber = dayEntries.reduce(
        (sum, e) =>
          (sum += e._sum.hours ? Math.min(Number(e._sum.hours), 8) : 0),
        0
      )

      console.log("-> fetching overtime data")
      // Calculate overtime hours and pay
      const { _sum } = await prisma.dailyOvertime.aggregate({
        _sum: {
          overtimeHours: true,
          overtimePay: true,
        },
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      })

      console.log("Api: /timeEntries/monthly-overview GET - finished")
      sendOk(res, {
        year,
        month,
        daysWorked,
        regularHours: regularHoursNumber,
        overtimeHours: _sum.overtimeHours?.toNumber() ?? 0,
        overtimePay: _sum.overtimePay?.toNumber() ?? 0,
        overtimeLimit: OVERTIME_LIMIT,
      })
    } catch (error) {
      const err = error as Error
      console.error("Api: /timeEntries/monthly-overview GET - Error:", err)
      sendUnexpected(res, err)
    }
  }
)

// Get time entries for a specific user and date
router.get(
  "/:userId",
  allow({ anyOf: ["EMPLOYEE", "MANAGER"] }),
  async (req: Request, res: Response) => {
    console.log("Api: /timeEntries/:userId GET", req.params.userId, req.query)
    try {
      const userId = req.params.userId
      const dateParam = req.query.date as string | undefined
      const date = dateParam ? new Date(dateParam) : new Date()

      console.log("-> fetching data for userId:", userId, "date:", date)
      const entries = (await fetchTimeEntriesByUser(userId, date)) ?? []
      console.log("Api: /timeEntries/:userId GET - finished")
      sendOk(res, entries)
    } catch (error) {
      const err = error as Error
      console.error("Api: /timeEntries/:userId GET - Error:", err)
      sendUnexpected(res, err)
    }
  }
)

export default router
