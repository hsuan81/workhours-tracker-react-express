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
import { sendFail, sendOk, sendUnexpected } from "../utils/http"
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
      sendOk(res, user)
    } catch (error) {
      const err = error as Error
      console.error("Error registering user:", err)
      sendUnexpected(res, err)
    }
  }
)

router.post("/password", async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body

    // CHECK SESSION FIRST
    if (!req.session || !req.session.user || !req.session.user.userId) {
      sendFail(res, "INVALID_CREDENTIALS", "Not authenticated")
      return
    }

    // Input validation
    if (!currentPassword || !newPassword) {
      sendFail(res, "VALIDATION_FAILED", "Missing required fields")
      return
    }

    if (newPassword.length < 8) {
      sendFail(
        res,
        "VALIDATION_FAILED",
        "New password must be at least 8 characters"
      )
      return
    }

    // Call service - now safe to access userId
    await changePassword({
      userId: req.session.user.userId,
      currentPassword,
      newPassword,
    })

    sendOk(res, undefined, "Password updated successfully")
  } catch (error) {
    const err = error as Error
    console.error("Password change error:", err)

    // Handle known errors
    if (err.message === "User not found") {
      sendFail(res, "NOT_FOUND", "User not found")
      return
    }

    if (err.message === "Current password is incorrect") {
      sendFail(res, "INVALID_CREDENTIALS", "Current password is incorrect")
      return
    }

    sendUnexpected(res, err)
  }
})

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await getAllUsersName()
    sendOk(res, users)
  } catch (error) {
    const err = error as Error
    console.error("Error fetching users:", err)
    sendUnexpected(res, err)
  }
})

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id
    const user = await getUserById(userId)
    if (!user) {
      sendFail(res, "NOT_FOUND", "User not found")
      return
    }
    // res.status(200).json(user)
    sendOk(res, user)
  } catch (error) {
    const err = error as Error
    console.error("Error fetching user:", err)
    sendUnexpected(res, err)
  }
})

// PUT /users/:id (Admin only)
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id
    const data = updateUserSchema.parse(req.body)
    const updatedUser = await updateUser(userId, data)
    sendOk(res, updatedUser)
  } catch (error) {
    const err = error as Error

    console.error("Error updating user:", err)
    sendUnexpected(res, err)
  }
})

export default router
