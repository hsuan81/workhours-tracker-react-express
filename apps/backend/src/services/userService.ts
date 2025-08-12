// apps/backend/services/userService.ts
import { PrismaClient, UserRole } from "../generated/prisma/index.js"
import { toISODate } from "../utils/calendarUtils.js"
import {
  hash,
  generatePassword,
  comparePasswords,
} from "../utils/passwordUtils"
import { sendWelcomeEmail } from "../utils/emailUtils"

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
  hireDate?: string | null
  monthlySalary: number
  isActive: boolean
  hourlyRate: number
}

interface UserName {
  id: string
  firstName: string
  lastName: string
}

interface ChangePasswordInput {
  userId: string
  currentPassword: string
  newPassword: string
}

const prisma = new PrismaClient()

async function updateTeamManagerAssignment(
  tx: any, // Prisma transaction client
  userId: string,
  teamId: string | null,
  newRole: UserRole, // Using the enum type
  previousRole?: UserRole,
  previousTeamId?: string | null
) {
  // If becoming a manager, assign to team
  if (newRole === UserRole.MANAGER && teamId) {
    await tx.team.update({
      where: { id: teamId },
      data: { managerId: userId },
    })
    if (previousTeamId && teamId !== previousTeamId) {
      // If changing teams, remove from previous team
      await tx.team.updateMany({
        where: { managerId: userId, id: { not: teamId } },
        data: { managerId: null },
      })
    }
  }

  // If was a manager but no longer, remove from any team they managed
  if (previousRole === UserRole.MANAGER && newRole !== UserRole.MANAGER) {
    await tx.team.updateMany({
      where: { managerId: userId },
      data: { managerId: null },
    })
  }
}

export async function getAllUsersName(): Promise<UserName[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  })

  return users
}

export async function getUserById(userId: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      teamId: true,
      hireDate: true,
      monthlySalary: true,
      isActive: true,
      hourlyRate: true,
    },
  })
  return user
    ? {
        ...user,
        hireDate: user.hireDate ? toISODate(user.hireDate) : null,
        monthlySalary: user.monthlySalary.toNumber(),
        hourlyRate: user.hourlyRate.toNumber(),
      }
    : null
}

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

  const result = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        id,
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

    await updateTeamManagerAssignment(tx, createdUser.id, teamId, role)

    return createdUser
  })

  await sendWelcomeEmail(email, rawPassword)

  return {
    id: result.id,
    firstName: result.firstName,
    lastName: result.lastName,
    email: result.email,
    role: result.role,
    teamId: result.teamId!,
    hireDate: toISODate(result.hireDate!),
    monthlySalary: result.monthlySalary.toNumber(),
    isActive: result.isActive,
    hourlyRate: result.hourlyRate.toNumber(),
  }
}

export async function updateUser(
  userId: string,
  updates: Partial<UpdateUserInput>
): Promise<Partial<User>> {
  // const data: Partial<UpdateUserInput> = { ...updates }
  const data: Record<string, any> = { ...updates }
  const previousUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, teamId: true },
  })
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

  // return updated
  const updatedUser = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: data,
    })

    await updateTeamManagerAssignment(
      tx,
      userId,
      data.teamId,
      data.role,
      previousUser?.role,
      previousUser?.teamId
    )

    return updatedUser
  })
  return {
    id: updatedUser.id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    role: updatedUser.role,
    teamId: updatedUser.teamId!,
    hireDate: toISODate(updatedUser.hireDate!),
    monthlySalary: updatedUser.monthlySalary!.toNumber(),
    hourlyRate: updatedUser.hourlyRate!.toNumber(),
    isActive: updatedUser.isActive,
  }
}

export async function changePassword({
  userId,
  currentPassword,
  newPassword,
}: ChangePasswordInput) {
  // BUSINESS VALIDATION (Domain rules)
  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters long")
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  })

  if (!user) {
    throw new Error("User not found")
  }

  // Verify current password (business rule)
  const isCurrentPasswordValid = await comparePasswords(
    currentPassword,
    user.passwordHash
  )

  if (!isCurrentPasswordValid) {
    throw new Error("Current password is incorrect")
  }

  // Check if new password is different (business rule)
  const isSamePassword = await comparePasswords(newPassword, user.passwordHash)
  if (isSamePassword) {
    throw new Error("New password must be different from current password")
  }

  // Business logic
  const hashedNewPassword = await hash(newPassword)
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashedNewPassword },
  })

  return { success: true }
}
