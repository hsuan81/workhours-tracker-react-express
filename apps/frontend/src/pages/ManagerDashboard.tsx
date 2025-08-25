import { useEffect, useState } from "react"
import type { ApiResult } from "../utils/api"
import type { TeamOverview, TeamSummary, TeamEntry } from "../api/manager"
import {
  fetchTeams,
  fetchTeamSummaries,
  fetchTeamEntries,
} from "../api/manager"
import { TeamTab } from "../components/TeamTab"
import { TeamPanel } from "../components/TeamPanel"
import type { User } from "../types/types"

export default function ManagerDashboard({ user }: { user: User }) {
  const [teams, setTeams] = useState<TeamOverview[]>([])
  const [activeTeamId, setActiveTeamId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const userId = user.id
  const year = new Date().getFullYear()
  const month = new Date().getMonth()
  const monthString = `${year}-${String(month + 1).padStart(2, "0")}`

  //   const baseUrl = import.meta.env.VITE_API_URL

  useEffect(() => {
    const getTeams = async () => {
      const res = await fetchTeams(userId)
      if (res.ok) {
        const teamOverviews = res.data.map((team) => ({
          ...team,
          summary: undefined,
          members: [],
        }))
        setTeams(teamOverviews)
        setActiveTeamId(res.data[0]?.id ?? null)
      }
    }
    getTeams()
    // setIsLoading(false)
  }, [])

  useEffect(() => {
    setIsLoading(true)
    const getTeamData = async () => {
      if (!activeTeamId) return

      const [summaryRes, entriesRes]: [
        ApiResult<TeamSummary[]>,
        ApiResult<TeamEntry[]>
      ] = await Promise.all([
        fetchTeamSummaries(userId, monthString, activeTeamId),
        fetchTeamEntries(userId, monthString, activeTeamId),
      ])

      const teamsToUpdate = teams.map((team) => {
        if (team.id === activeTeamId) {
          return {
            ...team,
            summary: summaryRes.ok ? summaryRes.data[0] : undefined,
            last7WorkdaysRange: entriesRes.ok
              ? entriesRes.data[0].last7WorkdaysRange
              : undefined,
            members: entriesRes.ok ? entriesRes.data[0].members : [],
          }
        }
        return team
      })
      setTeams(teamsToUpdate)
    }

    getTeamData()
    setIsLoading(false)
  }, [activeTeamId])

  // const activeTeam = teams.find((t) => t.id === activeTeamId)!

  return (
    <div className="bg-custom-gray min-h-screen p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manager Dashboard – July 2025</h1>
      <div className="flex space-x-4 border-b">
        {teams.map((team) => (
          <TeamTab
            key={team.id}
            team={team}
            isActive={team.id === activeTeamId}
            onClick={setActiveTeamId}
          />
        ))}
      </div>

      <div>
        {isLoading ? (
          <div className="text-custom-black">Loading team data...</div>
        ) : (
          <TeamPanel team={teams.find((team) => team.id === activeTeamId)} />
        )}
      </div>
    </div>
  )
}
