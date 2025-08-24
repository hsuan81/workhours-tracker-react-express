// src/routes/entries.ts
import express, { Request, Response } from "express"
import { PrismaClient, Prisma } from "../generated/prisma/index.js"
import { type TimeEntryWithStatus } from "../services/timeEntriesService"
import { allow } from "../auth/auth.js"
import {
  fetchTimeEntriesByUser,
  updateTimeEntries,
} from "../services/timeEntriesService.js"
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
    const entries = req.body as TimeEntryWithStatus[]
    const userId = req.session.user!.userId!
    const dataDate = new Date(entries[0].date)

    const results = await updateTimeEntries(userId, dataDate, entries)

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
