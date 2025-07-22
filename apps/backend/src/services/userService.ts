// apps/backend/services/userService.ts
import { PrismaClient, UserRole } from "../generated/prisma/index.js"
import { hash, generatePassword } from "../utils/passwordUtils"
// import { sendWelcomeEmail } from "../utils/emailUtils.ts"

interface RegisterUserInput {
  firstName: string
  lastName: string
  email: string
  role: UserRole
  teamId: string
  hireDate: string
  monthlySalary: number
}

interface UpdateUserInput {
  role?: string
  monthlySalary?: number
  teamId?: string
  hireDate?: string
  isActive?: boolean
}

const prisma = new PrismaClient()

export async function registerUser(data: RegisterUserInput) {
  const { firstName, lastName, email, role, teamId, hireDate, monthlySalary } =
    data

  const hourlyRate = monthlySalary / 30 / 8
  const rawPassword = generatePassword()
  const passwordHash = await hash(rawPassword)

  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      role,
      teamId,
      hireDate: new Date(hireDate),
      monthlySalary,
      hourlyRate,
      passwordHash: passwordHash,
      mustChangePassword: true,
    },
  })

  //   await sendWelcomeEmail(email, rawPassword)

  return newUser
}

export async function updateUser(userId: string, updates: UpdateUserInput) {
  const data: any = { ...updates }

  if (updates.monthlySalary !== undefined) {
    data.hourlyRate = updates.monthlySalary / 30 / 8
  }
  if (updates.hireDate) {
    data.hireDate = new Date(updates.hireDate)
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
  })

  return updated
}
