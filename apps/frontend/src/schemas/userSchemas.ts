// frontend/src/schemas/userSchemas.ts
import { z } from "zod"
import { USER_ROLES } from "../../../../shared/types"

export const userFormSchema = z
  .object({
    id: z.string().min(1, "User ID is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.email("Invalid email address").optional(),
    role: z.enum(USER_ROLES),
    teamId: z.string().min(1, "Team is required"),
    hireDate: z.string().refine((date: string) => !isNaN(Date.parse(date)), {
      message: "Invalid hire date format",
    }),
    monthlySalary: z.number().positive("Salary must be a positive number"),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // If we have isActive, we don't need email (update form)
      // If we don't have isActive, we need email (register form)
      if (data.isActive !== undefined) {
        return true // Update form - no email required
      }
      return data.email !== undefined && data.email.length > 0 // Register form - email required
    },
    {
      message: "Email is required for registration",
      path: ["email"], // Show error on email field
    }
  )

export type FormData = z.infer<typeof userFormSchema>
export type RegisterUserInput = Omit<FormData, "isActive"> & { email: string }
