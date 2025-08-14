// apps/frontend/src/api/manager.ts
import { apiGet, type ApiResult } from "../utils/api"

export interface Team {
  id: string
  name: string
}

export interface TeamOverview extends Team {
  summary?: TeamSummary
  members: OvertimeMemberEntry[]
}

export async function fetchTeams(userId: string): Promise<ApiResult<Team[]>> {
  const params = new URLSearchParams({ userId })
  return await apiGet<Team[]>(`/manager/teams?${params.toString()}`)
}

export async function fetchAllTeams(): Promise<ApiResult<Team[]>> {
  return await apiGet<Team[]>("/manager/teams")
}

// export async function fetchTeamOverviews(
//   userId: string,
//   teamId?: string
// ): Promise<ApiResult<TeamOverview[]>> {
//   const params = new URLSearchParams({ userId })
//   if (teamId) params.append("teamId", teamId)
//   const teams = await apiGet<Team[]>(`/manager/teams?${params.toString()}`)
//   return teams.map((team) => ({
//     ...team,
//     summary: undefined, // Will be filled later
//     members: [],
//   }))
// }

export interface TeamMember {
  id: string
  firstName: string
  lastName: string
}

export async function fetchTeamMembers(userId: string, teamId?: string) {
  const params = new URLSearchParams({ userId })
  if (teamId) params.append("teamId", teamId)
  return await apiGet<TeamMember[]>(
    `/manager/team-members?${params.toString()}`
  )
}

export interface TeamSummary {
  teamId: string
  month: string // YYYY-MM
  totalOvertime: number
  avgDailyOvertime: number
  totalOtCost: number
}

export async function fetchTeamSummaries(
  managerId: string,
  month?: string,
  teamId?: string
): Promise<ApiResult<TeamSummary[]>> {
  const params = new URLSearchParams({ managerId })
  if (month) params.append("month", month)
  if (teamId) params.append("teamId", teamId)
  return await apiGet<TeamSummary[]>(
    `/manager/team-summary?${params.toString()}`
  )
}

export interface OvertimeRange {
  start: string // ISO date
  end: string
}

export interface OvertimeMemberEntry {
  userId: string
  firstName: string
  lastName: string
  monthlyOvertime: number
  last7WorkdaysAvgHours: number
}

export interface TeamEntry {
  teamId: string
  month: string
  last7WorkdaysRange: OvertimeRange
  members: OvertimeMemberEntry[]
}

export async function fetchTeamEntries(
  managerId: string,
  month?: string,
  teamId?: string
): Promise<ApiResult<TeamEntry[]>> {
  const params = new URLSearchParams({ managerId })
  if (month) params.append("month", month)
  if (teamId) params.append("teamId", teamId)
  return await apiGet<TeamEntry[]>(`/manager/team-entries?${params.toString()}`)
}
