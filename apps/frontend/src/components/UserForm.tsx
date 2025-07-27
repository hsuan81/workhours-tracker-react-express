//

import React, { useState, type JSX } from "react"
import type { RegisterUserPayload, UpdateUserPayload } from "../types"
import { RoleDropdown } from "./RoleDropdown"
import { TeamDropdown } from "./TeamDropdown"

// Conditional type that maps form type to payload type
type FormDataType<T extends "register" | "update"> = T extends "register"
  ? RegisterUserPayload
  : UpdateUserPayload

// Props interface using conditional types
interface Props<T extends "register" | "update"> {
  type: T
  user?: T extends "update" ? UpdateUserPayload : never
  teams: { id: string; name: string }[]
  onSubmit: (data: FormDataType<T>) => void
}

// Function overloads for different form types
export function UserForm(props: Props<"register">): JSX.Element
export function UserForm(props: Props<"update">): JSX.Element
export function UserForm<T extends "register" | "update">({
  type,
  user,
  teams,
  onSubmit,
}: Props<T>): JSX.Element {
  // Type-safe initialization
  const [formData, setFormData] = useState<FormDataType<T>>(() => {
    if (type === "register") {
      return {
        userId: "",
        firstName: "",
        lastName: "",
        email: "",
        role: "EMPLOYEE",
        teamId: teams[0]?.id || "",
        hireDate: "",
        monthlySalary: 0,
      } as FormDataType<T>
    } else {
      return {
        ...user,
      } as FormDataType<T>
    }
  })

  function handleChange<K extends keyof FormDataType<T>>(
    field: K,
    value: FormDataType<T>[K]
  ): void {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 border p-4 bg-custom-white text-custom-black rounded"
    >
      {type === "register" && (
        <>
          <label className="block mb-2 font-semibold">User ID</label>
          <input
            placeholder="KK12345A"
            value={
              "userId" in formData
                ? (formData as RegisterUserPayload).userId
                : ""
            }
            onChange={(e) =>
              handleChange(
                "userId" as keyof FormDataType<T>,
                e.target.value as FormDataType<T>[keyof FormDataType<T>]
              )
            }
            className="border p-1 w-full"
            required
          />
          <label className="block mb-2 font-semibold">First Name</label>
          <input
            placeholder="Mike"
            value={
              "firstName" in formData
                ? (formData as RegisterUserPayload).firstName
                : ""
            }
            onChange={(e) =>
              handleChange(
                "firstName" as keyof FormDataType<T>,
                e.target.value as FormDataType<T>[keyof FormDataType<T>]
              )
            }
            className="border p-1 w-full"
            required
          />

          <label className="block mb-2 font-semibold">Last Name</label>

          <input
            placeholder="Smith"
            value={
              "lastName" in formData
                ? (formData as RegisterUserPayload).lastName
                : ""
            }
            onChange={(e) =>
              handleChange(
                "lastName" as keyof FormDataType<T>,
                e.target.value as FormDataType<T>[keyof FormDataType<T>]
              )
            }
            className="border p-1 w-full"
            required
          />
          <label className="block mb-2 font-semibold">Email</label>

          <input
            placeholder="msmith123@gmail.com"
            type="email"
            value={
              "email" in formData ? (formData as RegisterUserPayload).email : ""
            }
            onChange={(e) =>
              handleChange(
                "email" as keyof FormDataType<T>,
                e.target.value as FormDataType<T>[keyof FormDataType<T>]
              )
            }
            className="border p-1 w-full"
            required
          />
        </>
      )}

      <RoleDropdown
        value={formData.role}
        onChange={(role) =>
          handleChange(
            "role" as keyof FormDataType<T>,
            role as FormDataType<T>[keyof FormDataType<T>]
          )
        }
      />
      <TeamDropdown
        value={formData.teamId}
        teams={teams}
        onChange={(id) =>
          handleChange(
            "teamId" as keyof FormDataType<T>,
            id as FormDataType<T>[keyof FormDataType<T>]
          )
        }
      />
      <label className="block mb-2 font-semibold">Hire Date</label>

      <input
        type="date"
        value={formData.hireDate}
        onChange={(e) =>
          handleChange(
            "hireDate" as keyof FormDataType<T>,
            e.target.value as FormDataType<T>[keyof FormDataType<T>]
          )
        }
        className="border p-1 w-full"
        required
      />

      <label className="block mb-2 font-semibold">Monthly Salary</label>
      <input
        type="number"
        step="0.01"
        placeholder="Monthly Salary"
        value={formData.monthlySalary}
        onChange={(e) =>
          handleChange(
            "monthlySalary" as keyof FormDataType<T>,
            parseFloat(e.target.value) as FormDataType<T>[keyof FormDataType<T>]
          )
        }
        className="border p-1 w-full text-custom-black"
        required
      />

      {type === "update" && (
        <label className="flex items-center space-x-2">
          <span>Active:</span>
          <input
            type="checkbox"
            checked={
              "isActive" in formData
                ? (formData as UpdateUserPayload).isActive
                : true
            }
            onChange={(e) =>
              handleChange(
                "isActive" as keyof FormDataType<T>,
                e.target.checked as FormDataType<T>[keyof FormDataType<T>]
              )
            }
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
