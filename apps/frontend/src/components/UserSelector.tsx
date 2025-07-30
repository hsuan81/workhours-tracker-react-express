// apps/frontend/src/components/UserSelector.tsx
import React, { type JSX } from "react"
import type { UserName } from "../api/users"

interface Props {
  users: UserName[]
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
        <option key={u.id} value={u.id}>
          {u.id} {u.firstName} {u.lastName}
        </option>
      ))}
    </select>
  )
}
