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
    console.log("Api: /projects GET")
    const projects = await getAllActiveProjects()
    sendOk(res, projects)
  } catch (error) {
    const err = error as Error
    console.error("Api: /projects GET Error:", err)
    sendUnexpected(res, err)
  }
})
// GET /projects/:id
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Api: /projects/:id GET", req.params.id)
    const projectId = req.params.id
    if (!projectId) {
      sendFail(res, "VALIDATION_FAILED", "Project ID is required")
      return
    }
    const project = await getProjectById(projectId)
    if (!project) {
      console.error("Api: /projects/:id GET Error: Project not found")
      sendFail(res, "NOT_FOUND", "Project not found")
      return
    }
    sendOk(res, project)
    console.log("Api: /projects/:id GET - finished")
  } catch (error) {
    const err = error as Error
    console.error("Api: /projects/:id GET Error:", err)
    sendUnexpected(res, err)
  }
})
export default router
