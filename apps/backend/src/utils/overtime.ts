// /src/utils/overtime.ts

import { PrismaClient, Prisma } from "../generated/prisma/index.js"
import { Decimal as PrismaDecimal } from "@prisma/client/runtime/library"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

const OVERTIME_THRESHOLD = new PrismaDecimal(8)
const OVERTIME_PAY_RATE_1 = new PrismaDecimal(1.33)
const OVERTIME_PAY_RATE_2 = new PrismaDecimal(1.66)

// Max retry attempts
const MAX_RETRIES = 3

async function safeUpsertOvertimeSummary(
  prisma: Prisma.TransactionClient | PrismaClient,
  userId: string,
  date: Date,
  overtimeHours: PrismaDecimal,
  overtimePay: PrismaDecimal
) {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await prisma.dailyOvertime.upsert({
        where: { userId_date: { userId, date } },
        update: { overtimeHours, overtimePay },
        create: { userId, date, overtimeHours, overtimePay },
      })
      return
    } catch (err) {
      const isConflict =
        err instanceof PrismaClientKnownRequestError && err.code === "P2002"
      if (!isConflict || i === MAX_RETRIES - 1) throw err
      // Retry after a tiny delay (optional)
      await new Promise((resolve) => setTimeout(resolve, 10))
    }
  }
}

/**
 * Syncs the overtime hours and pay for a user on a specific date.
 * @param prisma Prisma transaction client
 * @param userId User ID
 * @param date Date only
 */
export async function syncOvertimeSummary(
  prisma: Prisma.TransactionClient | PrismaClient,
  userId: string,
  date: Date
): Promise<void> {
  const entries = await prisma.timeEntry.findMany({
    where: { userId, date },
    select: { hoursWorked: true },
  })

  const totalHours = entries.reduce(
    (sum, e) => sum.plus(e.hoursWorked),
    new PrismaDecimal(0)
  )

  const overtimeHours = totalHours.greaterThan(OVERTIME_THRESHOLD)
    ? totalHours.minus(OVERTIME_THRESHOLD)
    : new PrismaDecimal(0)

  const overtimeFirstPart = PrismaDecimal.min(
    overtimeHours,
    new PrismaDecimal(2) // First 2 hours of overtime
  )
  const overtimeSecondPart = overtimeFirstPart.equals(2)
    ? overtimeHours.minus(overtimeFirstPart)
    : new PrismaDecimal(0)

  const overtimePay = PrismaDecimal.add(
    overtimeFirstPart.times(OVERTIME_PAY_RATE_1),
    overtimeSecondPart.times(OVERTIME_PAY_RATE_2)
  )

  await safeUpsertOvertimeSummary(
    prisma,
    userId,
    date,
    overtimeHours,
    overtimePay
  )
}
