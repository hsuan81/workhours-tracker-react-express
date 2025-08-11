// middleware/auth.ts - Improved with proper types
import { Request, Response, NextFunction } from "express"
import { SessionUser, SessionData } from "express-session"

// Extend Express Request type to include our session structure
// declare module "express-session" {
//   interface SessionData {
//     user?: SessionUser
//   }
// }

// Type guard to check if user exists in session
function hasSessionUser(
  req: Request
): req is Request & { session: { user: SessionUser } } {
  return !!req.session?.user
}

// Check if user is authenticated - properly typed
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!hasSessionUser(req)) {
    res.status(401).json({ error: "Authentication required" })
    return
  }

  // Update last activity
  req.session.user.lastActivity = new Date().toISOString()
  next()
}

// Check if user has specific role - properly typed
export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!hasSessionUser(req)) {
      res.status(401).json({ error: "Authentication required" })
      return
    }

    const userRole: string = req.session.user.role

    if (!userRole.includes(role)) {
      res.status(403).json({
        error: `Role '${role}' required`,
      })
      return
    }

    req.session.user.lastActivity = new Date().toISOString()
    next()
  }
}

// Check if user has any of the specified roles - properly typed
export const requireAnyRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!hasSessionUser(req)) {
      res.status(401).json({ error: "Authentication required" })
      return
    }

    const userRole: string = req.session.user.role
    const hasRole = roles.some((role) => userRole.includes(role))

    if (!hasRole) {
      res.status(403).json({
        error: `One of these roles required: ${roles.join(", ")}`,
      })
      return
    }

    req.session.user.lastActivity = new Date().toISOString()
    next()
  }
}
