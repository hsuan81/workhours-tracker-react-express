// apps/backend/routes/users.ts
import express, { Request, Response } from "express"
import {
  registerUser,
  updateUser,
  getAllUsersName,
  getUserById,
  changePassword,
} from "../services/userService"
import { registerUserSchema, updateUserSchema } from "../schemas/userSchemas"
import { error } from "node:console"
// import { requireRole, secureRoute } from "../middleware/authMiddleware"

const router = express.Router()

// POST /register (Admin only)
router.post(
  "/register",
  //   requireRole(["admin"]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Registering user with data:", req.body)
      const data = registerUserSchema.parse(req.body)
      const user = await registerUser(data)
      res.status(201).json(user)
    } catch (err) {
      console.error("Error registering user:", err)
      res.status(500).json({ error: "Failed to register user" })
    }
  }
)

router.post("/password", async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body

    // CHECK SESSION FIRST
    if (!req.session || !req.session.user || !req.session.user.userId) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      })
      return
    }

    // Input validation
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      })
      return
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      })
      return
    }

    // Call service - now safe to access userId
    await changePassword({
      userId: req.session.user.userId,
      currentPassword,
      newPassword,
    })

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    const err = error as Error
    console.error("Password change error:", err)

    // Handle known errors
    if (err.message === "User not found") {
      res.status(404).json({
        success: false,
        message: "User not found",
      })
      return
    }

    if (err.message === "Current password is incorrect") {
      res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      })
      return
    }

    // Unknown errors
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

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

// PUT /users/:id (Admin only)
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id
    const data = updateUserSchema.parse(req.body)
    const updatedUser = await updateUser(userId, data)
    res.status(200).json({ success: true, user: updatedUser })
  } catch (err) {
    console.error("Error updating user:", err)
    res.status(500).json({ error: "Failed to update user" })
  }
})

export default router
