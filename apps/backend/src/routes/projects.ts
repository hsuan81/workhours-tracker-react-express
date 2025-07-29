import express, { Request, Response } from "express"
import {
  getAllActiveProjects,
  getProjectById,
} from "../services/projectService"

const router = express.Router()
// GET /projects
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await getAllActiveProjects()
    res.status(200).json(projects)
  } catch (err) {
    console.error("Error fetching projects:", err)
    res.status(500).json({ error: "Failed to fetch projects" })
  }
})
// GET /projects/:id
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.params.id
    if (!projectId) {
      res.status(500).json({ error: "Project ID is required" })
      return
    }
    const project = await getProjectById(projectId)
    if (!project) {
      res.status(404).json({ error: "Project not found" })
      return
    }
    res.status(200).json(project)
  } catch (err) {
    console.error("Error fetching project:", err)
    res.status(500).json({ error: "Failed to fetch project" })
  }
})
export default router
