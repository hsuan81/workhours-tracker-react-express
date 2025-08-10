// utils/PrismaSessionStore.ts - Improved implementation
/* 
Session interface contract
interface SessionStore {
    get(sid: string, callback: (err: any, session?: SessionData) => void): void;
    set(sid: string, session: SessionData, callback: (err?: any) => void): void;
    destroy(sid: string, callback: (err?: any) => void): void;
    touch?(sid: string, session: SessionData, callback: (err?: any) => void): void;
    all?(callback: (err: any, obj?: SessionData[]) => void): void;
    clear?(callback: (err?: any) => void): void;
    length?(callback: (err: any, len?: number) => void): void;
  }
*/
import { PrismaClient } from "../generated/prisma/index.js"
import type { SessionData } from "express-session"

// export interface SessionUser {
//   userId: string
//   email: string
//   firstName: string | null
//   lastName: string | null
//   role: string
//   //   sessionCreatedAt: string
//   //   lastActivity: string
// }

// export interface SessionCookie {
//   originalMaxAge: number
//   expires: Date
//   secure: boolean
//   httpOnly: boolean
//   path: string
//   sameSite?: "strict" | "lax" | "none"
// }

// export interface SessionData {
//   user?: SessionUser
//   cookie?: SessionCookie
//   // Allow for additional session properties while maintaining type safety
//   [key: string]: unknown
// }

export interface SessionStoreOptions {
  checkPeriod?: number
  maxAge?: number
}

// Specific callback types for each store method
export type GetSessionCallback = (
  error: Error | null,
  session?: SessionData | null
) => void
export type SetSessionCallback = (error?: Error | null) => void
export type DestroySessionCallback = (error?: Error | null) => void
export type TouchSessionCallback = (error?: Error | null) => void
export type AllSessionsCallback = (
  error: Error | null,
  sessions?: Record<string, SessionData>
) => void
export type LengthCallback = (error: Error | null, length?: number) => void
export type ClearCallback = (error?: Error | null) => void

export class PrismaSessionStore {
  private prisma: PrismaClient
  private options: Required<SessionStoreOptions>
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(prisma: PrismaClient, options: SessionStoreOptions = {}) {
    this.prisma = prisma
    this.options = {
      checkPeriod: options.checkPeriod ?? 5 * 60 * 1000, // 5 minutes
      maxAge: options.maxAge ?? 24 * 60 * 60 * 1000, // 24 hours
    }

    this.startCleanup()
  }

  // Get session by ID - properly typed
  async get(sessionId: string, callback: GetSessionCallback): Promise<void> {
    try {
      const session = await this.prisma.session.findUnique({
        where: { id: sessionId },
      })

      if (!session) {
        return callback(null, null)
      }

      // Check if expired
      if (session.expiresAt < new Date()) {
        await this.destroy(sessionId, () => {})
        return callback(null, null)
      }

      // Type assertion is safe here because we control what goes into the database
      const sessionData = session.data as SessionData
      callback(null, sessionData)
    } catch (error) {
      callback(error as Error)
    }
  }

  // Set/update session - properly typed
  async set(
    sessionId: string,
    sessionData: SessionData,
    callback: SetSessionCallback
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + this.options.maxAge)
      const userId = sessionData.user?.userId

      await this.prisma.session.upsert({
        where: { id: sessionId },
        update: {
          data: JSON.stringify(sessionData as Record<string, unknown>), // Prisma expects Record for Json fields
          expiresAt,
          userId,
          updatedAt: new Date(),
        },
        create: {
          id: sessionId,
          data: JSON.stringify(sessionData as Record<string, unknown>),
          expiresAt,
          userId,
        },
      })

      callback()
    } catch (error) {
      callback(error as Error)
    }
  }

  // Destroy session - properly typed
  async destroy(
    sessionId: string,
    callback: DestroySessionCallback
  ): Promise<void> {
    try {
      await this.prisma.session
        .delete({
          where: { id: sessionId },
        })
        .catch(() => {
          // Session might not exist, this is acceptable for destroy operation
        })

      callback()
    } catch (error) {
      callback(error as Error)
    }
  }

  // Touch session (update expiry) - properly typed
  async touch(
    sessionId: string,
    sessionData: SessionData,
    callback: TouchSessionCallback
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + this.options.maxAge)

      await this.prisma.session
        .update({
          where: { id: sessionId },
          data: {
            expiresAt,
            updatedAt: new Date(),
          },
        })
        .catch(() => {
          // Session might not exist, create it
          this.set(sessionId, sessionData, callback)
          return
        })

      callback()
    } catch (error) {
      callback(error as Error)
    }
  }

  // Get all sessions (optional) - properly typed
  async all(callback: AllSessionsCallback): Promise<void> {
    try {
      const sessions = await this.prisma.session.findMany({
        where: {
          expiresAt: { gte: new Date() },
        },
      })

      const result: Record<string, SessionData> = sessions.reduce(
        (acc, session) => {
          acc[session.id] = session.data as SessionData
          return acc
        },
        {} as Record<string, SessionData>
      )

      callback(null, result)
    } catch (error) {
      callback(error as Error)
    }
  }

  // Get session count - properly typed
  async length(callback: LengthCallback): Promise<void> {
    try {
      const count = await this.prisma.session.count({
        where: {
          expiresAt: { gte: new Date() },
        },
      })

      callback(null, count)
    } catch (error) {
      callback(error as Error)
    }
  }

  // Clear all sessions - properly typed
  async clear(callback: ClearCallback): Promise<void> {
    try {
      await this.prisma.session.deleteMany({})
      callback()
    } catch (error) {
      callback(error as Error)
    }
  }

  // Cleanup expired sessions - properly typed
  private async cleanup(): Promise<void> {
    try {
      const result = await this.prisma.session.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      })

      if (result.count > 0) {
        console.log(`Cleaned up ${result.count} expired sessions`)
      }
    } catch (error) {
      console.error("Session cleanup error:", error)
    }
  }

  // Start cleanup interval - properly typed
  private startCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, this.options.checkPeriod)
  }

  // Stop cleanup interval - properly typed
  public stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  // Additional utility methods with proper types
  async getUserSessions(userId: string): Promise<SessionData[]> {
    try {
      const sessions = await this.prisma.session.findMany({
        where: {
          userId,
          expiresAt: { gte: new Date() },
        },
      })

      return sessions.map((session) => session.data as SessionData)
    } catch (error) {
      console.error("Get user sessions error:", error)
      return []
    }
  }

  async logoutUserEverywhere(userId: string): Promise<number> {
    try {
      const result = await this.prisma.session.deleteMany({
        where: { userId },
      })

      return result.count
    } catch (error) {
      console.error("Logout user everywhere error:", error)
      return 0
    }
  }

  async getSessionStats(): Promise<{
    total: number
    active: number
    expired: number
  }> {
    try {
      const [total, active] = await Promise.all([
        this.prisma.session.count(),
        this.prisma.session.count({
          where: { expiresAt: { gte: new Date() } },
        }),
      ])

      return { total, active, expired: total - active }
    } catch (error) {
      console.error("Get session stats error:", error)
      return { total: 0, active: 0, expired: 0 }
    }
  }
}
