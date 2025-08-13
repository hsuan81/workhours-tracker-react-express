// src/routes/entries.ts
import express, { Request, Response } from "express"
import { PrismaClient, Prisma } from "../generated/prisma/index.js"
import { TimeEntry } from "shared/types"
import { fetchTimeEntriesByUser } from "../services/timeEntriesService.js"
import {
  ApiErrorCode,
  sendFail,
  sendOk,
  sendUnexpected,
} from "../utils/http.js"

const router = express.Router()

const prisma = new PrismaClient()

const OVERTIME_LIMIT = 46 // Legal limit for overtime hours in a month

router.post("/", async (req: Request, res: Response) => {
  const entries = req.body as TimeEntry[]

  const toCreate = entries
    .filter((e) => !e.id)
    .map((e) => ({
      userId: e.userId,
      projectId: e.projectId,
      date: new Date(e.date),
      hours: new Prisma.Decimal(e.hours.toFixed(2)),
    }))
  const toUpdate = entries.filter((e) => e.id)
  const toUpdateSet = new Set(toUpdate.map((e) => e.id!))

  // Check if update targets exist
  const existingIds = await prisma.timeEntry.findMany({
    where: { id: { in: toUpdate.map((e) => e.id!) } },
    select: { id: true },
  })
  const existingIdSet = new Set(existingIds.map((e) => e.id))

  const notFoundIds = new Set(
    [...toUpdateSet].filter((id) => !existingIdSet.has(id))
  )

  if (notFoundIds.size > 0) {
    sendFail(
      res,
      "NOT_FOUND",
      `Time entry ids not found: ${Array.from(notFoundIds).join(", ")}`
    )
    return
  }

  const results = await prisma.$transaction(async (tx) => {
    const resultStats: {
      updated: TimeEntry[]
      created: { id: string }[]
      code: ApiErrorCode | null
      error: string | null
    } = {
      updated: [],
      created: [],
      code: null,
      error: null,
    }
    try {
      const created = await tx.timeEntry.createManyAndReturn({
        data: toCreate,
        skipDuplicates: true,
        select: { id: true, projectId: true, hours: true, date: true },
      })
      resultStats.created = created

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
          date: updated.date.toISOString().split("T")[0],
          hours: updated.hours.toNumber(),
        })
      }
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
      } else {
        resultStats.code = "DATABASE_ERROR"
        resultStats.error = "An unexpected error occurred"
      }
    } finally {
      return resultStats
    }
  })
  if (results.error) {
    sendFail(res, results.code!, results.error)
  }

  sendOk(res, { updated: results.updated, created: results.created })
})

router.get("/summary", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string // simulate login, for testing purposes
    const dateParam = req.query.date as string | undefined

    const date = dateParam ? new Date(dateParam) : new Date()

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
    const regularHoursNumber = Math.min(totalHoursNumber, 8)

    const overtimeRecord = await prisma.dailyOvertime.findFirst({
      where: { userId, date },
      select: { overtimeHours: true, overtimePay: true },
    })

    sendOk(res, {
      date: date.toISOString().split("T")[0],
      totalHours,
      regularHours: regularHoursNumber,
      overtimeHours: overtimeRecord
        ? overtimeRecord.overtimeHours.toNumber()
        : 0,
      overtimePay: overtimeRecord ? overtimeRecord.overtimePay.toNumber() : 0,
      projects: entries.map((e) => ({
        name: e.project.name,
        hours: e.hours,
      })),
    })
  } catch (error) {
    const err = error as Error
    sendUnexpected(res, err)
  }
})

router.get("/monthly-overview", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string // simulate login, for testing purposes
    const month =
      parseInt(req.query.month as string, 10) || new Date().getMonth() + 1
    const year =
      parseInt(req.query.year as string, 10) || new Date().getFullYear()

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

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
      (sum, e) => (sum += e._sum.hours ? Math.min(Number(e._sum.hours), 8) : 0),
      0
    )

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
    sendUnexpected(res, err)
  }
})

router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId
    const dateParam = req.query.date as string | undefined
    const date = dateParam ? new Date(dateParam) : new Date()
    const entries = await fetchTimeEntriesByUser(userId, date)
    sendOk(res, entries)
  } catch (error) {
    console.error("Error fetching time entries:", error)
    const err = error as Error

    sendUnexpected(res, err)
  }
})

export default router
