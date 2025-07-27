import React, { type JSX } from "react"

interface Props {
  value: string
  onChange: (teamId: string) => void
  teams: { id: string; name: string }[]
}

export function TeamDropdown({ value, onChange, teams }: Props): JSX.Element {
  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    onChange(event.target.value)
  }

  return (
    <div>
      <label htmlFor="team-dropdown" className="block mb-2 font-semibold">
        Team
      </label>

      <select
        value={value}
        onChange={handleChange}
        className="border bg-custom-white p-1 w-full"
        id="team-dropdown"
      >
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </div>
  )
}
