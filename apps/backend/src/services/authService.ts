import { Request, Response } from "express"
import { PrismaClient } from "../generated/prisma/index.js"
import { comparePasswords } from "../utils/passwordUtils"

const prisma = new PrismaClient()

export async function loginController(
  req: Request,
  res: Response
): Promise<void> {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({ message: "Email and password required" })
    return
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await comparePasswords(password, user.passwordHash))) {
    res.status(401).json({ message: "Invalid credentials" })
    return
  }

  // Modify session
  req.session.user = {
    userId: user.id,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    sessionCreatedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  }

  // Express-session automatically saves when response ends
  res.json({ success: true, message: "Login successful" })
  // What happens when response ends:
  // 1. Express-session calls: store.set(sessionId, sessionData, callback)
  // 2. Our store saves to database and calls: callback(null)
  // 3. Express-session receives success confirmation
  // 4. Response is sent to browser
}

export async function logoutController(
  req: Request,
  res: Response
): Promise<void> {
  // What req.session.destroy() does:
  // 1. Express-session calls: store.destroy(sessionId, callback)
  // 2. Our store deletes from database and calls: callback(null)
  // 3. Express-session calls the callback WE provided: (err) => { ... }
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" })
    res.clearCookie("sessionId")
    res.json({ success: true, message: "Logout successful" })
  })
}

export async function sessionCheckController(
  req: Request,
  res: Response
): Promise<void> {
  //   if (req.session.user) {
  //   }
  try {
    if (!req.session?.user) {
      res.status(401).json({
        authenticated: false,
        message: "No active session",
      })
    }

    req.session.user!.lastActivity = new Date().toISOString()

    res.json({
      authenticated: true,
      user: {
        id: req.session.user!.userId,
        email: req.session.user!.email,
        firstName: req.session.user!.firstName,
        lastName: req.session.user!.lastName,
        roles: req.session.user!.role,
      },
    })
  } catch (error) {
    // Log error but don't expose internals
    console.error("Session check error:", error)

    res.status(500).json({
      authenticated: false,
      message: "Unable to verify session",
    })
  }
}
