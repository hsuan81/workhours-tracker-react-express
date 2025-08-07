// apps/frontend/components/UserForm.tsx
import React, { useEffect, type JSX } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Team } from "../api/manager"
import type { UpdateUserInputWithId } from "../types"
import type { UserRole } from "../../../../shared/types"
import { RoleDropdown } from "./RoleDropdown"
import { TeamDropdown } from "./TeamDropdown"
import {
  userFormSchema,
  type RegisterUserInput,
  type FormData,
} from "../schemas/userSchemas"

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

export function UserForm(props: UserFormProps): JSX.Element {
  const { type, teams, onSubmit } = props

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues:
      type === "register"
        ? {
            id: "",
            firstName: "",
            lastName: "",
            email: "",
            role: "EMPLOYEE" as UserRole,
            teamId: teams[0]?.id || "",
            hireDate: "",
            monthlySalary: 0,
            // isActive is undefined for register form
          }
        : {
            id: props.user.id,
            firstName: props.user.firstName,
            lastName: props.user.lastName,
            role: props.user.role,
            teamId: props.user.teamId,
            hireDate: props.user.hireDate,
            monthlySalary: props.user.monthlySalary,
            isActive: props.user.isActive,
            // email is undefined for update form
          },
    mode: "onChange",
  })

  // Update form when user changes (update form only)
  useEffect(() => {
    if (type === "update") {
      reset({
        id: props.user.id,
        firstName: props.user.firstName,
        lastName: props.user.lastName,
        role: props.user.role,
        teamId: props.user.teamId,
        hireDate: props.user.hireDate,
        monthlySalary: props.user.monthlySalary,
        isActive: props.user.isActive,
        // email is undefined for update form
      })
    }
  }, [type === "update" ? props.user : null, reset])

  const onFormSubmit = (data: FormData) => {
    if (type === "register") {
      // For register form, email is required (validated by schema)
      const registerData: RegisterUserInput = {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email!, // Non-null assertion is safe due to schema validation
        role: data.role,
        teamId: data.teamId,
        hireDate: data.hireDate,
        monthlySalary: data.monthlySalary,
      }
      ;(onSubmit as RegisterFormProps["onSubmit"])(registerData)
    } else {
      // For update form, isActive is required (set in defaultValues)
      const updateData: UpdateUserInputWithId = {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        teamId: data.teamId,
        hireDate: data.hireDate,
        monthlySalary: data.monthlySalary,
        isActive: data.isActive!, // Non-null assertion is safe due to defaultValues
      }
      ;(onSubmit as UpdateFormProps["onSubmit"])(updateData)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-3 border p-4 bg-custom-white text-custom-black rounded"
    >
      <div>
        <label className="block mb-2 font-semibold">User ID</label>
        <input
          placeholder="KK12345A"
          {...register("id")}
          className="border p-1 w-full"
          disabled={type === "update"}
        />
        {errors.id && (
          <p className="text-red-500 text-sm mt-1">{errors.id.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-2 font-semibold">First Name</label>
        <input
          placeholder="Mike"
          {...register("firstName")}
          className="border p-1 w-full"
        />
        {errors.firstName && (
          <p className="text-red-500 text-sm mt-1">
            {errors.firstName.message}
          </p>
        )}
      </div>

      <div>
        <label className="block mb-2 font-semibold">Last Name</label>
        <input
          placeholder="Smith"
          {...register("lastName")}
          className="border p-1 w-full"
        />
        {errors.lastName && (
          <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
        )}
      </div>

      {type === "register" && (
        <div>
          <label className="block mb-2 font-semibold">Email</label>
          <input
            placeholder="msmith123@gmail.com"
            type="email"
            {...register("email")}
            className="border p-1 w-full"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
      )}

      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <div>
            <RoleDropdown value={field.value} onChange={field.onChange} />
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="teamId"
        control={control}
        render={({ field }) => (
          <div>
            <TeamDropdown
              value={field.value}
              teams={teams}
              onChange={field.onChange}
            />
            {errors.teamId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.teamId.message}
              </p>
            )}
          </div>
        )}
      />

      <div>
        <label className="block mb-2 font-semibold">Hire Date</label>
        <input
          type="date"
          {...register("hireDate")}
          className="border p-1 w-full"
        />
        {errors.hireDate && (
          <p className="text-red-500 text-sm mt-1">{errors.hireDate.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-2 font-semibold">Monthly Salary</label>
        <input
          type="number"
          step="0.01"
          placeholder="Monthly Salary"
          {...register("monthlySalary", { valueAsNumber: true })}
          className="border p-1 w-full text-custom-black"
        />
        {errors.monthlySalary && (
          <p className="text-red-500 text-sm mt-1">
            {errors.monthlySalary.message}
          </p>
        )}
      </div>

      {type === "update" && (
        <div>
          <label className="flex items-center space-x-2">
            <span>Active:</span>
            <input type="checkbox" {...register("isActive")} />
          </label>
          {errors.isActive && (
            <p className="text-red-500 text-sm mt-1">
              {errors.isActive.message}
            </p>
          )}
        </div>
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
