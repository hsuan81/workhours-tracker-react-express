import { z } from "zod"
import { UserRole } from "../generated/prisma/index.js"

export const registerUserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email address"),
  // role: z.enum(["EMPLOYEE", "MANAGER", "ADMINISTRATOR"]),
  role: z.enum(UserRole),
  teamId: z.string().min(1, "Team ID is required"),
  hireDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid hire date format",
  }),
  monthlySalary: z.number().positive("Salary must be a positive number"),
})

export type RegisterUserInput = z.infer<typeof registerUserSchema>
