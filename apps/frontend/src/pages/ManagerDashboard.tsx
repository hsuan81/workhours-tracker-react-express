import { useEffect, useState } from "react"
import type {
  TeamOverview,
  TeamSummary,
  TeamMemberEntryOverview,
} from "../api/manager"
import { getTeams, getTeamSummary, getTeamEntries } from "../api/manager"
import { TeamTab } from "../components/TeamTab"
import { TeamPanel } from "../components/TeamPanel"

// const mockTeams: Team[] = [
//   {
//     id: "sales",
//     name: "Sales",
//     summary: {
//       totalOvertime: 103.5,
//       avgDailyOvertime: 1.4,
//       totalOvertimeCost: 2020,
//     },
//     members: [
//       {
//         userId: "1",
//         name: "Alice Chen",
//         monthlyOvertime: 12.3,
//         last7WorkdaysAvgHours: 8.1,
//       },
//       {
//         userId: "2",
//         name: "Bob Lin",
//         monthlyOvertime: 5.5,
//         last7WorkdaysAvgHours: 7.4,
//       },
//     ],
//   },
//   // Add more teams here
// ]

// async function fetchTeamData(teams: Team[]) {
//   const [summaryRes, entriesRes] = await Promise.all([
//     fetch(
//       `/api/manager/team-summary?managerId=user2&teamId=${activeTeamId}&month=${month}`
//     ),
//     fetch(
//       `/api/manager/team-entries?managerId=user2&teamId=${activeTeamId}&month=${month}`
//     ),
//   ])

//   const summary = await summaryRes.json()
//   const entries = await entriesRes.json()

//   const teamsToUpdate = teams

//   const summaryMap = new Map<string, TeamSummary>()
//   summary.forEach(
//     (s: {
//       teamId: string
//       month: string // YYYY-MM
//       totalOvertime: number
//       avgDailyOvertime: number
//       totalOtCost: number
//     }) => {
//       summaryMap.set(s.teamId, {
//         totalOvertime: s.totalOvertime,
//         avgDailyOvertime: s.avgDailyOvertime,
//         totalOvertimeCost: s.totalOtCost,
//       })
//     }
//   )

//   const entriesMap = new Map<string, TeamMemberEntryOverview[]>()
//   entries.forEach(
//     (e: {
//       teamId: string
//       month: string // YYYY-MM
//       last7WorkdaysRange: {
//         start: string // ISO date
//         end: string // ISO date
//       }
//       members: {
//         userId: string
//         name: string
//         monthlyOvertime: number
//         last7WorkdaysAvgHours: number
//       }[]
//     }) => {
//       entriesMap.set(e.teamId, e.members)
//     }
//   )

//   for (const team of teamsToUpdate) {
//     if (summaryMap.has(team.id)) {
//       team.summary = summaryMap.get(team.id)!
//     }
//     if (entriesMap.has(team.id)) {
//       team.members = entriesMap.get(team.id)!
//     }
//   }
//   setTeams(teamsToUpdate)
// }

export default function ManagerDashboard() {
  const [teams, setTeams] = useState<TeamOverview[]>([])
  const [activeTeamId, setActiveTeamId] = useState("")

  //   const baseUrl = import.meta.env.VITE_API_URL

  useEffect(() => {
    const fetchTeams = async () => {
      //   const res = await apiGet<TeamItem[]>("/manager/teams?managerId=user2")
      //   //   const data = await res.json()

      //   console.log("Fetched teams:", res)

      //   const processed = res.map((d: { id: string; name: string }) => ({
      //     id: d.id,
      //     name: d.name,
      //     summary: undefined, // Will be filled later
      //     members: [],
      //   }))
      const res = await getTeams("user2")
      setTeams(res)
      setActiveTeamId(res[0]?.id ?? null)
    }
    fetchTeams()
  }, [])

  console.log("Teams state:", teams)

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!activeTeamId) return

      const month = "2025-07" // or dynamically calculate

      const [summaryRes, entriesRes]: [TeamSummary, TeamMemberEntryOverview[]] =
        await Promise.all([
          getTeamSummary(activeTeamId, month),
          getTeamEntries(activeTeamId, month),
          // fetch(
          //   `${baseUrl}/api/manager/team-summary?managerId=user2&teamId=${activeTeamId}&month=${month}`
          // ),
          // fetch(
          //   `${baseUrl}/api/manager/team-entries?managerId=user2&teamId=${activeTeamId}&month=${month}`
          // ),
        ])

      //   const summary = await summaryRes.json()
      //   const entries = await entriesRes.json()
      console.log("Fetched summary:", summaryRes)
      console.log("Fetched entries:", entriesRes)

      const teamsToUpdate = teams
      teamsToUpdate.forEach((team) => {
        if (team.id === activeTeamId) {
          team.summary = summaryRes
          team.members = entriesRes
        }
      })
      setTeams(teamsToUpdate)

      //   const summaryMap = new Map<string, TeamSummary>()
      //   summary.forEach(
      //     (s: {
      //       teamId: string
      //       month: string // YYYY-MM
      //       totalOvertime: number
      //       avgDailyOvertime: number
      //       totalOtCost: number
      //     }) => {
      //       summaryMap.set(s.teamId, {
      //         totalOvertime: s.totalOvertime,
      //         avgDailyOvertime: s.avgDailyOvertime,
      //         totalOvertimeCost: s.totalOtCost,
      //       })
      //     }
      //   )

      //   const entriesMap = new Map<string, TeamMemberEntryOverview[]>()
      //   entries.forEach(
      //     (e: {
      //       teamId: string
      //       month: string // YYYY-MM
      //       last7WorkdaysRange: {
      //         start: string // ISO date
      //         end: string // ISO date
      //       }
      //       members: {
      //         userId: string
      //         name: string
      //         monthlyOvertime: number
      //         last7WorkdaysAvgHours: number
      //       }[]
      //     }) => {
      //       entriesMap.set(e.teamId, e.members)
      //     }
      //   )

      //   for (const team of teamsToUpdate) {
      //     if (summaryMap.has(team.id)) {
      //       team.summary = summaryMap.get(team.id)!
      //     }
      //     if (entriesMap.has(team.id)) {
      //       team.members = entriesMap.get(team.id)!
      //     }
      //   }
      //   setTeams(teamsToUpdate)
    }

    fetchTeamData()
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
