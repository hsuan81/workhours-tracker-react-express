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
  const userId = user.id

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
  }, [])

  // console.log("Teams state:", teams)

  useEffect(() => {
    const getTeamData = async () => {
      if (!activeTeamId) return

      const month = "2025-07" // or dynamically calculate

      const [summaryRes, entriesRes]: [
        ApiResult<TeamSummary[]>,
        ApiResult<TeamEntry[]>
      ] = await Promise.all([
        fetchTeamSummaries(userId, month, activeTeamId),
        fetchTeamEntries(userId, month, activeTeamId),
      ])

      console.log("Fetched summary:", summaryRes)
      console.log("Fetched entries:", entriesRes)

      const teamsToUpdate = teams.map((team) => {
        if (team.id === activeTeamId) {
          return {
            ...team,
            summary: summaryRes.ok ? summaryRes.data[0] : undefined,
            members: entriesRes.ok ? entriesRes.data[0].members : [],
          }
        }
        return team
      })
      setTeams(teamsToUpdate)
    }

    getTeamData()
  }, [activeTeamId])

  const activeTeam = teams.find((t) => t.id === activeTeamId)!
  console.log("Active team data:", activeTeam)

  return (
    <div className="bg-custom-gray p-6 space-y-6">
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
        <TeamPanel team={teams.find((team) => team.id === activeTeamId)} />
      </div>
    </div>
  )
}
