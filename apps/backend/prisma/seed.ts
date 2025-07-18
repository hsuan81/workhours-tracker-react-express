// prisma/seed.ts
import { PrismaClient, Prisma } from "../src/generated/prisma/index.js"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  // Create Users
  const user1 = await prisma.user.upsert({
    where: { id: "user1" },
    update: {},
    create: {
      id: "user1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      hourlyRate: new Prisma.Decimal(75.0),
      role: "EMPLOYEE",
      passwordHash: "hashed-password-123", // Mocked hash
    },
  })

  const user2 = await prisma.user.upsert({
    where: { id: "user2" },
    update: {},
    create: {
      id: "user2",
      firstName: "Sarah",
      lastName: "Smith",
      email: "sarah@example.com",
      hourlyRate: new Prisma.Decimal(65.0),
      role: "MANAGER",
      passwordHash: "hashed-password-456", // Mocked hash
    },
  })

  // Create Projects
  const project1 = await prisma.project.upsert({
    where: { id: "proj1" },
    update: {},
    create: {
      id: "proj1",
      name: "E-commerce Platform",
      description: "Building the new e-commerce site",
    },
  })

  const project2 = await prisma.project.upsert({
    where: { id: "proj2" },
    update: {},
    create: {
      id: "proj2",
      name: "Mobile App",
      description: "iOS/Android mobile application",
    },
  })

  const project3 = await prisma.project.upsert({
    where: { id: "proj3" },
    update: {},
    create: {
      id: "proj3",
      name: "Design System",
      description: "Company-wide design system",
    },
  })

  // Get current date for realistic testing
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(today.getDate() - 2)

  const threeDaysAgo = new Date(today)
  threeDaysAgo.setDate(today.getDate() - 3)

  // Create Time Entries - Mixed scenarios
  const timeEntries = [
    // John's entries - includes overtime day
    {
      userId: "user1",
      projectId: "proj1",
      date: today,
      hours: new Prisma.Decimal(6.5),
    },
    {
      userId: "user1",
      projectId: "proj2",
      date: today,
      hours: new Prisma.Decimal(2.0),
    },
    {
      userId: "user1",
      projectId: "proj1",
      date: yesterday,
      hours: new Prisma.Decimal(9.5), // Overtime day
    },
    {
      userId: "user1",
      projectId: "proj1",
      date: twoDaysAgo,
      hours: new Prisma.Decimal(7.0),
    },
    {
      userId: "user1",
      projectId: "proj2",
      date: threeDaysAgo,
      hours: new Prisma.Decimal(8.0),
    },

    // Sarah's entries
    {
      userId: "user2",
      projectId: "proj3",
      date: today,
      hours: new Prisma.Decimal(8.0),
    },
    {
      userId: "user2",
      projectId: "proj3",
      date: yesterday,
      hours: new Prisma.Decimal(6.0),
    },
    {
      userId: "user2",
      projectId: "proj1",
      date: yesterday,
      hours: new Prisma.Decimal(3.5), // Split day
    },
    {
      userId: "user2",
      projectId: "proj3",
      date: twoDaysAgo,
      hours: new Prisma.Decimal(10.0), // Overtime day
    },
  ]

  for (const entry of timeEntries) {
    await prisma.timeEntry.create({
      data: entry,
    })
  }

  // Create Daily Overtime records (for monthly overview)
  const dailyOvertimes = [
    {
      userId: "user1",
      date: yesterday,
      overtimeHours: new Prisma.Decimal(1.5), // 9.5 - 8
      overtimePay: new Prisma.Decimal(149.63), // 1.5 * 75 * 1.33
    },
    {
      userId: "user1",
      date: today,
      overtimeHours: new Prisma.Decimal(0.5), // 9.5 - 8
      overtimePay: new Prisma.Decimal(49.88), // 0.5 * 75 * 1.33
    },
    {
      userId: "user2",
      date: twoDaysAgo,
      overtimeHours: new Prisma.Decimal(2.0), // 10 - 8
      overtimePay: new Prisma.Decimal(173.2), // 2 * 65 * 1.33
    },
  ]

  for (const overtime of dailyOvertimes) {
    await prisma.dailyOvertime.create({
      data: overtime,
    })
  }

  console.log("✅ Seed completed!")
  console.log("📊 Created:")
  console.log("  - 2 users (user1, user2)")
  console.log("  - 3 projects (proj1, proj2, proj3)")
  console.log("  - 9 time entries (various dates)")
  console.log("  - 2 daily overtime records")
  //   console.log("\n🧪 Test with:")
  //   console.log(
  //     "  GET /api/time-entries/summary?userId=user1&date=" +
  //       today.toISOString().split("T")[0]
  //   )
  //   console.log(
  //     "  GET /api/time-entries/monthly-overview?userId=user1&month=" +
  //       (today.getMonth() + 1) +
  //       "&year=" +
  //       today.getFullYear()
  //   )
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
