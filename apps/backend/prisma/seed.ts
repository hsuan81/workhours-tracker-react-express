// prisma/seed.ts
import { PrismaClient, Prisma } from "../src/generated/prisma/index.js"
import { hash } from "../src/utils/passwordUtils"

const prisma = new PrismaClient()

async function main() {
  console.log("Clearing existing data...")
  await prisma.dailyOvertime.deleteMany({})
  await prisma.timeEntry.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.team.deleteMany({})

  console.log("🌱 Starting seed...")

  const passwordHash = await hash("password12345")

  // Team created

  await prisma.team.upsert({
    where: { id: "team0" },
    update: {},
    create: {
      id: "team0",
      name: "Admins",
    },
  })

  await prisma.team.upsert({
    where: { id: "team1" },
    update: {},
    create: {
      id: "team1",
      name: "Development Team",
    },
  })

  await prisma.team.upsert({
    where: { id: "team2" },
    update: {},
    create: {
      id: "team2",
      name: "Design Team",
    },
  })

  await prisma.team.upsert({
    where: { id: "team3" },
    update: {},
    create: {
      id: "team3",
      name: "QA Team",
    },
  })

  // Create Users
  const user0 = await prisma.user.upsert({
    where: { id: "userAdmin" },
    update: {},
    create: {
      id: "userAdmin",
      firstName: "Jean",
      lastName: "Super",
      email: "super@example.com",
      hourlyRate: new Prisma.Decimal(75.0),
      role: "ADMINISTRATOR",
      passwordHash: passwordHash, // Mocked hash
      team: {
        connect: {
          id: "team0", // Connect to existing team by ID
        },
      },
      hireDate: new Date("2023-01-15"),
      monthlySalary: 999999,
    },
  })

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
      passwordHash: passwordHash, // Mocked hash
      team: {
        connect: {
          id: "team1", // Connect to existing team by ID
        },
      },
      hireDate: new Date("2023-01-15"),
      monthlySalary: 60000,
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
      hourlyRate: new Prisma.Decimal(105.0),
      role: "MANAGER",
      passwordHash: passwordHash, // Mocked hash
      teamId: "team1",
      hireDate: new Date("2022-05-20"),
      monthlySalary: 82000,
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

  await prisma.team.update({
    where: { id: "team1" },
    data: {
      managerId: "user2", // Assign Sarah as the manager of the team
    },
  })

  await prisma.projectMember.createMany({
    data: [
      { userId: "user1", projectId: "proj1" },
      { userId: "user1", projectId: "proj2" },
      { userId: "user2", projectId: "proj3" },
      { userId: "user2", projectId: "proj1" },
    ],
  })

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
