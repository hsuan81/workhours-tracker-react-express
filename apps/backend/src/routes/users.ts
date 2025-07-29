// apps/backend/routes/users.ts
import express, { Request, Response } from "express"
import {
  registerUser,
  updateUser,
  getAllUsersName,
  getUserById,
} from "../services/userService"
import { registerUserSchema } from "../schemas/userSchemas"
// import { requireRole, secureRoute } from "../middleware/authMiddleware"

const router = express.Router()

// POST /register (Admin only)
router.post(
  "/register",
  //   requireRole(["admin"]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const data = registerUserSchema.parse(req.body)
      const user = await registerUser(data)
      res.status(201).json(user)
    } catch (err) {
      console.error("Error registering user:", err)
      res.status(500).json({ error: "Failed to register user" })
    }
  }
)

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await getAllUsersName()
    res.status(200).json(users)
  } catch (err) {
    console.error("Error fetching users:", err)
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id
    const user = await getUserById(userId)
    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }
    res.status(200).json(user)
  } catch (err) {
    console.error("Error fetching user:", err)
    res.status(500).json({ error: "Failed to fetch user" })
  }
})

// PATCH /users/:id (Admin only)
router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id
    const updatedUser = await updateUser(userId, req.body)
    res.status(200).json({ success: true, user: updatedUser })
  } catch (err) {
    console.error("Error updating user:", err)
    res.status(500).json({ error: "Failed to update user" })
  }
})

export default router
