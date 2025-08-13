// File: apps/backend/routes/managerRoutes.ts
import express, { Request, Response } from "express"
import {
  getTeamSummary,
  getTeamEntries,
  getTeams,
  getTeamMembers,
} from "../services/managerService"
import { sendOk, sendUnexpected } from "../utils/http"

const router = express.Router()

// Get team overtime summary, average daily overtime, and total overtime cost for a specific month under a manager
// Example: GET /manager/team-summary?departmentId=456&month=2023-10
// Returns: { totalOvertimeHours: number, averageDailyOvertime: number, totalOvertimeCost: number }
// Note: managerId is assumed to be available in req.user.id or passed as a query parameter for testing
// router.get("/team-summary", async (req: Request, res: Response, next) => {
router.get("/team-summary", async (req: Request, res: Response) => {
  try {
    // const managerId = req.user.id
    const managerId = req.query.managerId as string // Assuming managerId is passed as a query parameter
    const { teamId, month } = req.query
    const result = await getTeamSummary({
      managerId,
      teamId: teamId as string | undefined,
      month: month as string | undefined,
    })
    sendOk(res, result)
  } catch (error) {
    const err = error as Error
    sendUnexpected(res, err)
    // next(err)
  }
})

// Get overtime entries of all team members under a manager for a specific month and last 7 days respectively
// Example: GET /manager/team-entries?departmentId=456&month=2023-10
// Returns: [{ userId: string, name: string, overtimeHours: number, date: string }, ...]
// Note: managerId is assumed to be available in req.user.id or passed as a query parameter for testing
// router.get("/team-entries", async (req: Request, res: Response, next) => {
router.get("/team-entries", async (req: Request, res: Response) => {
  try {
    // const managerId = req.user.id
    const managerId = req.query.managerId as string // Assuming managerId is passed as a query parameter

    const { teamId, month } = req.query
    const result = await getTeamEntries({
      managerId,
      teamId: teamId as string | undefined,
      month: month as string | undefined,
    })
    sendOk(res, result)
  } catch (error) {
    const err = error as Error
    sendUnexpected(res, err)
    // next(err)
  }
})

// Get all teams under a manager
// Example: GET /manager/teams
// Returns: [{ id: string, name: string, managerId: string }, ...]
// Note: managerId is assumed to be available in req.user.id or passed as a query parameter for testing
// Note: If the user is a super admin, return all teams
router.get("/teams", async (req: Request, res: Response) => {
  try {
    // const managerId = req.user.id
    const managerId = req.query.managerId as string | undefined // Assuming managerId is passed as a query parameter
    const result = await getTeams(managerId)
    sendOk(res, result)
  } catch (error) {
    const err = error as Error
    sendUnexpected(res, err)
    // next(err)
  }
})

// Get team members under a manager
// Example: GET /manager/team-members?teamId=123
// Returns: [{id: string, firstName: string, lastName: string},...]
router.get("/team-members", async (req: Request, res: Response) => {
  try {
    // const managerId = req.user.id
    const managerId = req.query.managerId as string // Assuming managerId is passed as a query parameter
    const { teamId } = req.query
    const result = await getTeamMembers({
      managerId,
      teamId: teamId as string | undefined,
    })
    sendOk(res, result)
  } catch (error) {
    const err = error as Error
    sendUnexpected(res, err)
    // next(err)
  }
})

export default router
