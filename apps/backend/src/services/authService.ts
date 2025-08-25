import { Request, Response } from "express"
import { PrismaClient } from "../generated/prisma/index.js"
import { comparePasswords } from "../utils/passwordUtils"
import { sendFail, sendOk, sendUnexpected } from "../utils/http"
import { toISODate } from "../utils/calendarUtils.js"

const prisma = new PrismaClient()

export async function loginController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    console.log("Api: /auth/login POST", req.body.email)
    const { email, password } = req.body
    if (!email || !password) {
      sendFail(res, "VALIDATION_FAILED", "Email and password required", {
        fields: {
          email: !email ? "required" : undefined,
          password: !password ? "required" : undefined,
        },
      })
      console.error("Api: /auth/login POST Error: Email and password required")
      return
    }

    // Mitigate timing attacks by always calling comparePasswords and using a dummy hash if user not found
    const user = await prisma.user.findUnique({ where: { email } })
    const dummyHash = "$2b$12$dummy.hash.to.prevent.timing.attacks.here"
    const hashToCheck = user?.passwordHash || dummyHash
    const isValidPassword = await comparePasswords(password, hashToCheck)
    if (!user || !isValidPassword || !user.isActive) {
      sendFail(res, "INVALID_CREDENTIALS", "Invalid credentials")
      console.error("Api: /auth/login POST Error: Invalid credentials")
      return
    }

    // Modify session
    req.session.user = {
      userId: user.id,
      role: user.role,
      teamId: user.teamId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      changePassword: user.mustChangePassword,
      sessionCreatedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    }

    // Express-session automatically saves when response ends
    // res.json({ success: true, message: "Login successful" })
    sendOk(res, undefined, "Login successful")
    console.log("Api: /auth/login POST - finished")
    // What happens when response ends:
    // 1. Express-session calls: store.set(sessionId, sessionData, callback)
    // 2. Our store saves to database and calls: callback(null)
    // 3. Express-session receives success confirmation
    // 4. Response is sent to browser
  } catch (error) {
    const err = error as Error
    console.error("Api: /auth/login POST Error:", err)
    sendUnexpected(res, err)
  }
}

export async function logoutController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    console.log("Api: /auth/logout POST")
    // What req.session.destroy() does:
    // 1. Express-session calls: store.destroy(sessionId, callback)
    // 2. Our store deletes from database and calls: callback(null)
    // 3. Express-session calls the callback WE provided: (err) => { ... }
    req.session.destroy((err) => {
      // if (err) return res.status(500).json({ message: "Logout failed" })
      if (err) {
        console.error("Api: /auth/logout POST Error:", err)
        return sendFail(res, "INTERNAL_ERROR", "Logout failed")
      }
      res.clearCookie("sessionId")
      sendOk(res, undefined, "Logout successful")
      console.log("Api: /auth/logout POST - finished")
    })
  } catch (error) {
    const err = error as Error
    console.error("Api: /auth/logout POST Error:", err)
    sendUnexpected(res, err)
  }
}

export async function sessionCheckController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    console.log("Api: /auth/session GET")
    if (!req.session.user || req.session.user === undefined) {
      console.warn("Api: /auth/session Error: Invalid session, clearing cookie")
      res.clearCookie("sessionId")
      sendFail(res, "SESSION_EXPIRED", "No active session")
      return
    }

    req.session.user!.lastActivity = new Date().toISOString()

    sendOk(
      res,
      {
        authenticated: true,
        user: {
          id: req.session.user!.userId,
          email: req.session.user!.email,
          firstName: req.session.user!.firstName,
          lastName: req.session.user!.lastName,
          role: req.session.user!.role,
        },
      },
      "Authenticated"
    )
    console.log("Api: /auth/session GET - finished")
  } catch (error) {
    // Log error but don't expose internals
    res.clearCookie("sessionId")

    const err = error as Error
    console.error("Api: /auth/session GET Error:", err)
    sendUnexpected(res, err)
  }
}
