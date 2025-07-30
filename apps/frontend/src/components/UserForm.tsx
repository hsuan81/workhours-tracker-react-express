// apps/frontend/components/UserForm.tsx
import React, { useState, useEffect, type JSX } from "react"
import type { RegisterUserInput } from "../api/users"
import type { Team } from "../api/manager"
import type { UpdateUserInputWithId, UserRole } from "../types"
import { RoleDropdown } from "./RoleDropdown"
import { TeamDropdown } from "./TeamDropdown"

interface RegisterFormProps {
  type: "register"
  teams: Team[]
  onSubmit: (data: RegisterUserInput) => void
}

interface UpdateFormProps {
  type: "update"
  user: UpdateUserInputWithId
  teams: Team[]
  onSubmit: (data: UpdateUserInputWithId) => void
}

type UserFormProps = RegisterFormProps | UpdateFormProps

// Union type for form data - represents the superset of both forms
type FormData = {
  id: string
  firstName: string
  lastName: string
  email?: string // Optional - only for register
  role: UserRole
  teamId: string
  hireDate: string
  monthlySalary: number
  isActive?: boolean // Optional - only for update
}

export function UserForm(props: UserFormProps): JSX.Element {
  const { type, teams, onSubmit } = props

  const [formData, setFormData] = useState<FormData>(() => {
    if (type === "register") {
      return {
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        role: "EMPLOYEE",
        teamId: teams[0].id,
        hireDate: "",
        monthlySalary: 0,
      }
    } else {
      return {
        id: props.user.id,
        firstName: props.user.firstName,
        lastName: props.user.lastName,
        role: props.user.role,
        teamId: props.user.teamId,
        hireDate: props.user.hireDate,
        monthlySalary: props.user.monthlySalary,
        isActive: props.user.isActive,
      }
    }
  })

  // Update form data when user changes (update form only)
  useEffect(() => {
    if (type === "update") {
      setFormData({
        id: props.user.id,
        firstName: props.user.firstName,
        lastName: props.user.lastName,
        role: props.user.role,
        teamId: props.user.teamId,
        hireDate: props.user.hireDate,
        monthlySalary: props.user.monthlySalary,
        isActive: props.user.isActive,
      })
    }
  }, [type === "update" ? props.user : null])

  // Single, simple change handler
  function handleChange<K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ): void {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (type === "register") {
      const registerData: RegisterUserInput = {
        id: formData.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email!,
        role: formData.role,
        teamId: formData.teamId,
        hireDate: formData.hireDate,
        monthlySalary: formData.monthlySalary,
      }
      ;(onSubmit as RegisterFormProps["onSubmit"])(registerData)
    } else {
      const updateData: UpdateUserInputWithId = {
        id: formData.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        teamId: formData.teamId,
        hireDate: formData.hireDate,
        monthlySalary: formData.monthlySalary,
        isActive: formData.isActive!,
      }
      ;(onSubmit as UpdateFormProps["onSubmit"])(updateData)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 border p-4 bg-custom-white text-custom-black rounded"
    >
      <label className="block mb-2 font-semibold">User ID</label>
      <input
        placeholder="KK12345A"
        value={formData.id}
        onChange={(e) => handleChange("id", e.target.value)}
        className="border p-1 w-full"
        disabled={type === "update"} // Disable editing ID for updates
        required
      />

      <label className="block mb-2 font-semibold">First Name</label>
      <input
        placeholder="Mike"
        value={formData.firstName}
        onChange={(e) => handleChange("firstName", e.target.value)}
        className="border p-1 w-full"
        required
      />

      <label className="block mb-2 font-semibold">Last Name</label>
      <input
        placeholder="Smith"
        value={formData.lastName}
        onChange={(e) => handleChange("lastName", e.target.value)}
        className="border p-1 w-full"
        required
      />

      {type === "register" && (
        <>
          <label className="block mb-2 font-semibold">Email</label>
          <input
            placeholder="msmith123@gmail.com"
            type="email"
            value={formData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            className="border p-1 w-full"
            required
          />
        </>
      )}

      <RoleDropdown
        value={formData.role}
        onChange={(role) => handleChange("role", role)}
      />

      <TeamDropdown
        value={formData.teamId}
        teams={teams}
        onChange={(id) => handleChange("teamId", id)}
      />

      <label className="block mb-2 font-semibold">Hire Date</label>
      <input
        type="date"
        value={formData.hireDate}
        onChange={(e) => handleChange("hireDate", e.target.value)}
        className="border p-1 w-full"
        required
      />

      <label className="block mb-2 font-semibold">Monthly Salary</label>
      <input
        type="number"
        step="0.01"
        placeholder="Monthly Salary"
        value={formData.monthlySalary ?? ""}
        onChange={(e) =>
          handleChange("monthlySalary", parseFloat(e.target.value) || 0)
        }
        className="border p-1 w-full text-custom-black"
        required
      />

      {type === "update" && (
        <label className="flex items-center space-x-2">
          <span>Active:</span>
          <input
            type="checkbox"
            checked={formData.isActive ?? true}
            onChange={(e) => handleChange("isActive", e.target.checked)}
          />
        </label>
      )}

      <button
        type="submit"
        className="bg-custom-blue text-white px-4 py-1 rounded"
      >
        {type === "register" ? "Register User" : "Update User"}
      </button>
    </form>
  )
}
