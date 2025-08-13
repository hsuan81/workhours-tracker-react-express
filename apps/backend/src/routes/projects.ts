import express, { Request, Response } from "express"
import {
  getAllActiveProjects,
  getProjectById,
} from "../services/projectService"
import { sendFail, sendOk, sendUnexpected } from "../utils/http"

const router = express.Router()
// GET /projects
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await getAllActiveProjects()
    sendOk(res, projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    const err = error as Error
    sendUnexpected(res, err)
  }
})
// GET /projects/:id
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.params.id
    if (!projectId) {
      sendFail(res, "VALIDATION_FAILED", "Project ID is required")
      return
    }
    const project = await getProjectById(projectId)
    if (!project) {
      sendFail(res, "NOT_FOUND", "Project not found")
      return
    }
    sendOk(res, project)
  } catch (error) {
    console.error("Error fetching project:", error)
    const err = error as Error
    sendUnexpected(res, err)
  }
})
export default router
