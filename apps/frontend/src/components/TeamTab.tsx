import type { TeamOverview } from "../api/manager"

interface TeamTabProps {
  team: TeamOverview
  isActive: boolean
  onClick: (id: string) => void
}

export function TeamTab({ team, isActive, onClick }: TeamTabProps) {
  return (
    <button
      className={`px-4 py-2 rounded-xl text-custom-black text-sm font-medium ${
        isActive
          ? "border-custom-black-500 bg-custom-white font-semibold"
          : "border-transparent text-gray-600 bg-custom-gray"
      }`}
      onClick={() => onClick(team.id)}
    >
      {team.name}
    </button>
  )
}
