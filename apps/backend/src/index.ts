import express, { Request, Response } from "express"
import cors from "cors"
import dotenv from "dotenv"
import { PrismaClient } from "./generated/prisma/index.js"
import timeEntryRoutes from "./routes/timeEntries"

dotenv.config({ path: "../.env" }) // load environment variables from .env file

const app = express()
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    // credentials: true, // If using cookie or auth header, add this line
  })
) // Enable CORS for a limited set of origins
app.use(express.json())

app.use("/api/time-entries", timeEntryRoutes)

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from backend" })
})

const PORT = process.env.BACKEND_PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

const prisma = new PrismaClient()
// 測試 CRUD 例如：
const users = await prisma.user.findMany()
console.log("Connecting prisma", users)
