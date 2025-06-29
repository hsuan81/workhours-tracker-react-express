import express, { Request, Response } from "express"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config({ path: "../../.env" }) // load environment variables from .env file

const app = express()
app.use(cors()) // Enable CORS for all routes
app.use(express.json())

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from backend")
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
