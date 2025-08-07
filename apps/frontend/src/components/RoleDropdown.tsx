import React, { type JSX } from "react"
import { USER_ROLES, type UserRole } from "../../../../shared/types"

interface Props {
  value: UserRole
  onChange: (role: UserRole) => void
}

export function RoleDropdown({ value, onChange }: Props): JSX.Element {
  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    onChange(event.target.value as UserRole)
  }

  return (
    <div>
      <label htmlFor="role-dropdown" className="block mb-2 font-semibold">
        Role
      </label>
      <select
        value={value}
        onChange={handleChange}
        className="border bg-custom-white p-1 w-full"
        id="role-dropdown"
      >
        {USER_ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </div>
  )
}
