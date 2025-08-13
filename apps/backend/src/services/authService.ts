import { Request, Response } from "express"
import { PrismaClient } from "../generated/prisma/index.js"
import { comparePasswords } from "../utils/passwordUtils"
import { sendFail, sendOk, sendUnexpected } from "../utils/http"

const prisma = new PrismaClient()

export async function loginController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      sendFail(res, "VALIDATION_FAILED", "Email and password required", {
        fields: {
          email: !email ? "required" : undefined,
          password: !password ? "required" : undefined,
        },
      })
      // res.status(400).json({
      //   success: false,
      //   code: "VALIDATION_REQUIRED",
      //   message: "Email and password required",
      // })
      return
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await comparePasswords(password, user.passwordHash))) {
      sendFail(res, "INVALID_CREDENTIALS", "Invalid credentials")
      // res.status(401).json({
      //   success: false,
      //   code: "INVALID_CREDENTIALS",
      //   message: "Invalid credentials",
      // })
      return
    }

    // Modify session
    req.session.user = {
      userId: user.id,
      role: user.role,
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
    // What happens when response ends:
    // 1. Express-session calls: store.set(sessionId, sessionData, callback)
    // 2. Our store saves to database and calls: callback(null)
    // 3. Express-session receives success confirmation
    // 4. Response is sent to browser
  } catch (error) {
    console.error("Login error:", error)
    const err = error as Error
    sendUnexpected(res, err)
  }
}

export async function logoutController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // What req.session.destroy() does:
    // 1. Express-session calls: store.destroy(sessionId, callback)
    // 2. Our store deletes from database and calls: callback(null)
    // 3. Express-session calls the callback WE provided: (err) => { ... }
    req.session.destroy((err) => {
      // if (err) return res.status(500).json({ message: "Logout failed" })
      if (err) return sendFail(res, "INTERNAL_ERROR", "Logout failed")
      res.clearCookie("sessionId")
      // res.json({ success: true, message: "Logout successful" })
      sendOk(res, undefined, "Logout successful")
    })
  } catch (error) {
    console.error("Logout error:", error)
    const err = error as Error
    sendUnexpected(res, err)
  }
}

export async function sessionCheckController(
  req: Request,
  res: Response
): Promise<void> {
  //   if (req.session.user) {
  //   }
  try {
    if (!req.session?.user) {
      // res.status(401).json({
      //   authenticated: false,
      //   message: "No active session",
      // })
      sendFail(res, "SESSION_EXPIRED", "No active session")
    }

    req.session.user!.lastActivity = new Date().toISOString()

    // res.json({
    //   authenticated: true,
    //   user: {
    //     id: req.session.user!.userId,
    //     email: req.session.user!.email,
    //     firstName: req.session.user!.firstName,
    //     lastName: req.session.user!.lastName,
    //     roles: req.session.user!.role,
    //   },
    // })
    sendOk(
      res,
      {
        authenticated: true,
        user: {
          id: req.session.user!.userId,
          email: req.session.user!.email,
          firstName: req.session.user!.firstName,
          lastName: req.session.user!.lastName,
          roles: req.session.user!.role,
        },
      },
      "Authenticated"
    )
  } catch (error) {
    // Log error but don't expose internals
    console.error("Session check error:", error)

    // res.status(500).json({
    //   authenticated: false,
    //   message: "Unable to verify session",
    // })
    const err = error as Error

    sendUnexpected(res, err)
  }
}
