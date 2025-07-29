// apps/backend/services/userService.ts
import { PrismaClient, UserRole } from "../generated/prisma/index.js"
import { toISODate } from "../utils/calendarUtils.js"
import { hash, generatePassword } from "../utils/passwordUtils"
// import { sendWelcomeEmail } from "../utils/emailUtils.ts"

interface RegisterUserInput {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  teamId: string
  hireDate: string
  monthlySalary: number
}

interface UpdateUserInput {
  firstName: string
  lastName: string
  role: string
  monthlySalary: number
  hourlyRate: number
  teamId: string
  hireDate: string | Date
  isActive: boolean
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  teamId: string
  hireDate: string
  monthlySalary: number
  isActive: boolean
  hourlyRate: number
}

const prisma = new PrismaClient()

export async function registerUser(data: RegisterUserInput): Promise<User> {
  const {
    id,
    firstName,
    lastName,
    email,
    role,
    teamId,
    hireDate,
    monthlySalary,
  } = data

  const hourlyRate = monthlySalary / 30 / 8
  const rawPassword = generatePassword()
  const passwordHash = await hash(rawPassword)

  const newUser = await prisma.user
    .create({
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
    .then((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      teamId: user.teamId!,
      hireDate: toISODate(user.hireDate!),
      monthlySalary: user.monthlySalary!.toNumber(),
      isActive: user.isActive,
      hourlyRate: user.hourlyRate!.toNumber(),
    }))

  //   await sendWelcomeEmail(email, rawPassword)

  return newUser
}

export async function updateUser(
  userId: string,
  updates: Partial<UpdateUserInput>
): Promise<Partial<User>> {
  // const data: Partial<UpdateUserInput> = { ...updates }
  const data: Record<string, any> = { ...updates }
  if (updates.firstName !== undefined) {
    data.firstName = updates.firstName
  }
  if (updates.lastName !== undefined) {
    data.lastName = updates.lastName
  }
  if (updates.role !== undefined) {
    data.role = updates.role as UserRole
  }
  if (updates.teamId !== undefined) {
    data.teamId = updates.teamId
  }
  if (updates.isActive !== undefined) {
    data.isActive = updates.isActive
  }
  if (updates.monthlySalary !== undefined) {
    data.monthlySalary = updates.monthlySalary
    data.hourlyRate = updates.monthlySalary / 30 / 8
  }
  if (updates.hireDate) {
    data.hireDate = new Date(updates.hireDate)
  }

  const updated = await prisma.user
    .update({
      where: { id: userId },
      data,
    })
    .then((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      teamId: user.teamId!,
      hireDate: toISODate(user.hireDate!),
      monthlySalary: user.monthlySalary!.toNumber(),
      hourlyRate: user.hourlyRate!.toNumber(),
      isActive: user.isActive,
    }))

  return updated
}
