import "express-session"

declare module "express-session" {
  interface SessionUser {
    userId: string
    email: string
    firstName: string | null
    lastName: string | null
    role: string
    changePassword: boolean
    sessionCreatedAt: string
    lastActivity: string
  }

  interface SessionCookie {
    originalMaxAge: number
    expires: Date
    secure: boolean
    httpOnly: boolean
    path: string
    sameSite?: "strict" | "lax" | "none"
  }

  interface SessionData {
    user?: SessionUser
    cookie?: SessionCookie
    // Allow for additional session properties while maintaining type safety
    [key: string]: unknown
  }
}
