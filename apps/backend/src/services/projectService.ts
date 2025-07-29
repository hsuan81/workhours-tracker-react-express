import { PrismaClient, UserRole } from "../generated/prisma/index.js"

const prisma = new PrismaClient()

interface Project {
  id: string
  name: string
}

export async function getAllActiveProjects(): Promise<Project[]> {
  return await prisma.project.findMany({
    where: { isActive: true }, // Assuming we only want active projects
    select: {
      id: true,
      name: true,
    },
  })
}
export async function getProjectById(
  projectId: string
): Promise<Project | null> {
  return await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
    },
  })
}
