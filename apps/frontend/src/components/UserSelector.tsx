import React, { type JSX } from "react"

export interface UserOption {
  userId: string
  name: string
}

interface Props {
  users: UserOption[]
  selectedId: string
  onSelect: (userId: string) => void
}

export function UserSelector({
  users,
  selectedId,
  onSelect,
}: Props): JSX.Element {
  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    onSelect(event.target.value)
  }

  return (
    <select
      value={selectedId}
      onChange={handleChange}
      className="border p-1 w-full bg-custom-white text-custom-black"
    >
      <option value="">-- Select a user --</option>
      {users.map((u) => (
        <option key={u.userId} value={u.userId}>
          {u.name}
        </option>
      ))}
    </select>
  )
}
