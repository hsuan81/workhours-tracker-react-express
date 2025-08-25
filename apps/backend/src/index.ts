import express, { NextFunction, Request, Response } from "express"
import session from "express-session"
import cors from "cors"
import dotenv from "dotenv"
import { csrfSync } from "csrf-sync"
import { PrismaSessionStore } from "@quixo3/prisma-session-store"
import { PrismaClient } from "./generated/prisma/index.js"
import authRoutes from "./routes/auth"
import timeEntryRoutes from "./routes/timeEntries"
import userRoutes from "./routes/users"
import managerRoutes from "./routes/manager" // Import manager routes
import projectRoutes from "./routes/projects" // Import project routes
import { requireAuth } from "./auth/auth"
import { sendFail, sendOk } from "./utils/http"

dotenv.config({ path: "../.env" }) // load environment variables from .env file

const app = express()
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true, // If using cookie or auth header, add this line
  })
) // Enable CORS for a limited set of origins
app.use(express.json())

// Session middleware
app.use(
  session({
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 5 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }), // Use Prisma session store
    name: "sessionId",
    secret: "your-secret", // use env var in prod
    resave: false, // Only save if session modified
    rolling: true,
    saveUninitialized: false, // Don't save empty sessions
    cookie: { sameSite: "strict", secure: false, maxAge: 1000 * 60 * 60 }, // secure: true if using HTTPS
  })
)

// login, logout and chaeck auth does not require CSRF
app.use("/api/auth", authRoutes)

// Pull out helpers/middleware from csrf-sync
const {
  // error marker (useful if you delegate formatting to a generic handler)
  invalidCsrfTokenError,
  // create/store/get token on the session
  generateToken,
  // default protection middleware (reads token from header by default)
  csrfSynchronisedProtection,
} = csrfSync({
  // Optional customization:
  // errorConfig: {
  //   statusCode: 403,
  //   message: "invalid csrf token",
  //   code: "EBADCSRFTOKEN",
  // },
  // getTokenFromRequest: (req) => req.headers["x-csrf-token"] as string | undefined, // default
})

// A route to ISSUE a token (fetch this after login or before first write)
app.get("/api/csrf-token", (req: Request, res: Response) => {
  const token = generateToken(req) // won’t overwrite if one already exists
  // res.json({ csrfToken: token })
  console.log("Issuing CSRF token:", token)
  sendOk(res, { csrfToken: token })
})

// Protect state-changing routes (global protection)
app.use((req, res, next) => {
  // Skip safe methods; protect writes
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next()
  return csrfSynchronisedProtection(req, res, next)
})

app.use(requireAuth)
app.use("/api/time-entries", timeEntryRoutes)
app.use("/api/users", userRoutes) // Import user routes
app.use("/api/manager", managerRoutes) // Import manager routes
app.use("/api/projects", projectRoutes) // Import project routes

// CSRF-specific error mapping (before your generic handler)
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err === invalidCsrfTokenError) {
    sendFail(res, "CSRF_FAILED", "Invalid CSRF token")
  }
  next(err)
})

const PORT = process.env.BACKEND_PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
