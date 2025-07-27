// apps/backend/services/summaryService.ts
import { Decimal } from "@prisma/client/runtime/library.js"
import { PrismaClient, Prisma } from "../generated/prisma/index.js"
import {
  getCurrentMonth,
  getMonthRange,
  getLastNWorkdays,
  toISODate,
} from "../utils/calendarUtils"

const prisma = new PrismaClient()

interface TeamSummary {
  teamId: string
  month: string // YYYY-MM
  totalOvertime: number
  avgDailyOvertime: number
  totalOtCost: number
}

interface TeamMemberEntryOverview {
  userId: string
  name: string
  monthlyOvertime: number
  last7WorkdaysAvgHours: number
}

interface TeamMembersEntryOverview {
  teamId: string
  month: string // YYYY-MM
  last7WorkdaysRange: {
    start: string // ISO date
    end: string // ISO date
  }
  members: TeamMemberEntryOverview[]
  //   members: {
  //     userId: string
  //     name: string
  //     monthlyOvertime: number
  //     last7WorkdaysAvgHours: number
  //   }[]
}

export async function getTeamSummary({
  managerId,
  teamId,
  month,
}: {
  managerId: string
  teamId?: string
  month?: string
}): Promise<TeamSummary[]> {
  const targetMonth = month ?? getCurrentMonth()
  const teams: string[] = teamId ? [teamId] : await getManagerTeamIds(managerId)

  if (!teams.length) {
    throw new Error("No team(s) found")
  }

  const summaries = await Promise.all(
    teams.map((teamId) => getTeamSummaryData(teamId, targetMonth))
  )

  return summaries
}

export async function getTeamEntries({
  managerId,
  teamId,
  month,
}: {
  managerId: string
  teamId?: string
  month?: string
}): Promise<TeamMembersEntryOverview[]> {
  const targetMonth: string = month ?? getCurrentMonth()
  const teams: string[] = teamId ? [teamId] : await getManagerTeamIds(managerId)

  if (!teams.length) {
    throw new Error("No team(s) found")
  }

  const { start: monthStart, end: monthEnd }: { start: Date; end: Date } =
    getMonthRange(targetMonth)
  const workingDates: Date[] = getLastNWorkdays(new Date(), 7)
  const [dayRangeStart, dayRangeEnd] = [workingDates[0], workingDates[6]]

  const result = await Promise.all(
    teams.map(async (teamId) => {
      const members = await getTeamMembersWithEntries(teamId, {
        monthStart,
        monthEnd,
        dayRangeStart,
        dayRangeEnd,
      })
      return {
        teamId: teamId,
        month: targetMonth,
        last7WorkdaysRange: {
          start: toISODate(dayRangeStart),
          end: toISODate(dayRangeEnd),
        },
        members,
      }
    })
  )

  return result
}

export async function getTeams(
  managerId: string
): Promise<{ id: string; name: string }[]> {
  return await prisma.team.findMany({
    where: { managerId },
    select: { id: true, name: true },
  })
}

// Mock/stub implementations for demonstration
async function getManagerTeamIds(managerId: string): Promise<string[]> {
  const teams = await prisma.team.findMany({
    where: { managerId },
    select: { id: true },
  })
  return teams.map((d) => d.id)
}

async function getTeamSummaryData(
  teamId: string,
  month: string
): Promise<TeamSummary> {
  const { start: monthStart, end: monthEnd } = getMonthRange(month)
  const memberIds = await prisma.user.findMany({
    where: { teamId, isActive: true },
    select: { id: true },
  })
  const membersOvertimeData = await prisma.dailyOvertime.findMany({
    where: {
      userId: { in: memberIds.map((m) => m.id) },
      date: { gte: monthStart, lte: monthEnd },
    },
    select: { overtimeHours: true, overtimePay: true, date: true },
  })
  const totalOvertimeHours = membersOvertimeData.reduce(
    (sum, entry) => sum.add(entry.overtimeHours),
    new Decimal(0)
  )

  const totalOvertimeCost = membersOvertimeData.reduce(
    (sum, entry) => sum.add(entry.overtimePay),
    new Decimal(0)
  )
  const totalDistinctDays = await prisma.timeEntry.findMany({
    where: {
      userId: { in: memberIds.map((m) => m.id) },
      date: { gte: monthStart, lte: monthEnd },
    },
    select: { date: true },
    distinct: ["date"],
  })
  const dayCount = totalDistinctDays.length
  const avgDailyOvertime =
    dayCount > 0 ? totalOvertimeHours.dividedBy(dayCount).toNumber() : 0

  return {
    teamId: teamId,
    month: month,
    totalOvertime: totalOvertimeHours.toNumber(),
    avgDailyOvertime: avgDailyOvertime,
    totalOtCost: totalOvertimeCost.toNumber(),
  }

  //   return {
  //     teamId: teamId,
  //     month,
  //     totalOvertime: 100,
  //     avgDailyOT: 1.3,
  //     totalOtCost: 1500,
  //   }
}

interface Last7WorkdayData {
  userId: string
  totalHours: Decimal
  workingDays: number
  avgDailyHours: Decimal
}

async function getTeamMembersWithEntries(
  teamId: string,
  range: {
    monthStart: Date
    monthEnd: Date
    dayRangeStart: Date
    dayRangeEnd: Date
  }
) {
  const members = await prisma.user.findMany({
    where: { teamId, isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  })

  const userIds = members.map((m) => m.id)

  // Get total hours and average daily hours for last 7 working days
  const last7WorkdayData = await prisma.$queryRaw<Last7WorkdayData[]>`
  SELECT
    "userId",
    SUM("hours") AS "totalHours",
    COUNT(DISTINCT "date") AS "workingDays",
    SUM("hours") / COUNT(DISTINCT "date") AS "avgDailyHours"
  FROM "TimeEntry"
  WHERE "userId" IN (${Prisma.join(userIds)})
    AND "date" BETWEEN ${range.dayRangeStart} AND ${range.dayRangeEnd}
  GROUP BY "userId"
`
  // Monthly Overtime hours sum by user
  const monthlyOvertimeSumByUser = await prisma.dailyOvertime.groupBy({
    by: ["userId"],
    where: {
      userId: { in: userIds },
      date: { gte: range.monthStart, lte: range.monthEnd },
    },
    _sum: {
      overtimeHours: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      userId: "asc",
    },
  })

  const result = new Map<
    string,
    {
      firstName: string
      lastName: string
      monthlyOvertime: Decimal
      last7WorkdaysAvgHours: Decimal
    }
  >()

  for (const member of members) {
    if (!result.has(member.id)) {
      result.set(member.id, {
        firstName: member.firstName,
        lastName: member.lastName,
        monthlyOvertime: new Decimal(0),
        last7WorkdaysAvgHours: new Decimal(0),
      })
    }
  }

  for (const entry of last7WorkdayData) {
    const user = result.get(entry.userId)
    if (user) {
      user.last7WorkdaysAvgHours = entry.avgDailyHours
    }
  }

  for (const entry of monthlyOvertimeSumByUser) {
    const user = result.get(entry.userId)
    if (user) {
      user.monthlyOvertime = new Decimal(entry._sum.overtimeHours ?? 0)
    }
  }

  return Array.from(result.entries()).map(([userId, user]) => ({
    userId,
    name: `${user.firstName} ${user.lastName}`,
    monthlyOvertime: user.monthlyOvertime.toNumber(),
    last7WorkdaysAvgHours: user.last7WorkdaysAvgHours.toNumber(),
  }))

  //   return [
  //     { name: "Alice", totalOt: "10.0 hrs", avgDaily: "8.0 hrs" },
  //     { name: "Bob", totalOt: "5.5 hrs", avgDaily: "7.4 hrs" },
  //   ]
}
