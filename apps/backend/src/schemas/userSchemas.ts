import { z } from "zod"
// import { UserRole } from "../generated/prisma/index.js"
import { USER_ROLES } from "../types/types"

export const registerUserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email address"),
  // role: z.enum(["EMPLOYEE", "MANAGER", "ADMINISTRATOR"]),
  role: z.enum(USER_ROLES),
  teamId: z.string().min(1, "Team ID is required"),
  hireDate: z.string().refine((date: string) => !isNaN(Date.parse(date)), {
    message: "Invalid hire date format",
  }),
  monthlySalary: z.number().positive("Salary must be a positive number"),
})

export const updateUserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  // email: z.email("Invalid email address"),
  // role: z.enum(["EMPLOYEE", "MANAGER", "ADMINISTRATOR"]),
  role: z.enum(USER_ROLES),
  teamId: z.string().min(1, "Team ID is required"),
  hireDate: z.string().refine((date: string) => !isNaN(Date.parse(date)), {
    message: "Invalid hire date format",
  }),
  monthlySalary: z.number().positive("Salary must be a positive number"),
  isActive: z.boolean(),
})

export type RegisterUserInput = z.infer<typeof registerUserSchema>
