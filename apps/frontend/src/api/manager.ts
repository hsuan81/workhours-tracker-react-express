// src/api/manager.ts
// Manager Dashboard Types
import { apiGet } from "../utils/api"

export interface TeamMemberEntryOverview {
  userId: string
  name: string
  monthlyOvertime: number
  last7WorkdaysAvgHours: number
}

interface TeamMembersOverviewApi {
  teamId: string
  month: string // YYYY-MM
  last7WorkdaysRange: {
    start: string // ISO date
    end: string // ISO date
  }
  members: TeamMemberEntryOverview[]
}

export interface TeamSummary {
  totalOvertime: number
  avgDailyOvertime: number
  totalOvertimeCost: number
}

interface TeamSummaryApi extends TeamSummary {
  teamId: string
  month: string // YYYY-MM
  //   totalOvertime: number
  //   avgDailyOvertime: number
  //   totalOvertimeCost: number
}

export interface TeamOverview {
  id: string
  name: string
  summary?: TeamSummary
  members: TeamMemberEntryOverview[]
}

interface TeamApi {
  id: string
  name: string
}

// API functions that return clean frontend types
export async function getTeams(managerId?: string): Promise<TeamOverview[]> {
  if (!managerId) {
    throw new Error("Manager ID is required to fetch teams")
  }
  const apiTeam = await apiGet<TeamApi[]>(
    `/manager/teams?managerId=${managerId}`
  )
  return apiTeam.map((team: TeamApi) => ({
    id: team.id,
    name: team.name,
    summary: undefined, // Will be filled later
    members: [],
  }))
}

export async function getTeamSummary(
  activeTeamId: string,
  month: string
): Promise<TeamSummary> {
  const teamSummaryApi = await apiGet<TeamSummaryApi[]>(
    `/manager/team-summary?managerId=user2&teamId=${activeTeamId}&month=${month}`
  )

  return {
    totalOvertime: teamSummaryApi[0].totalOvertime,
    avgDailyOvertime: teamSummaryApi[0].avgDailyOvertime,
    totalOvertimeCost: teamSummaryApi[0].totalOvertimeCost,
  }
}

export async function getTeamEntries(
  activeTeamId: string,
  month: string
): Promise<TeamMemberEntryOverview[]> {
  const teamEntriesApi = await apiGet<TeamMembersOverviewApi[]>(
    `/manager/team-entries?managerId=user2&teamId=${activeTeamId}&month=${month}`
  )

  console.log("Team Entries API Response:", teamEntriesApi)

  return teamEntriesApi[0]?.members
}
