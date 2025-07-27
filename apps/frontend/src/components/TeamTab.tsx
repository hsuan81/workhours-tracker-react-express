import type { TeamOverview } from "../api/manager"

interface TeamTabProps {
  team: TeamOverview
  isActive: boolean
  onClick: (id: string) => void
}

export function TeamTab({ team, isActive, onClick }: TeamTabProps) {
  return (
    <button
      className={`px-4 py-2 rounded-t border-b-2 border-custom-black bg-custom-white text-custom-black text-sm font-medium ${
        isActive
          ? "border-custom-black-500"
          : "border-transparent text-gray-600"
      }`}
      onClick={() => onClick(team.id)}
    >
      {team.name}
    </button>
  )
}
