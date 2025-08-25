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
import { allow } from "../auth/auth"
import { sendFail, sendOk, sendUnexpected } from "../utils/http"
import { USER_ROLES } from "../types/types"
// import { requireRole, secureRoute } from "../middleware/authMiddleware"

const router = express.Router()

// POST /register (Admin only)
router.post(
  "/register",
  allow({ anyOf: ["ADMINISTRATOR"] }), // Only allow admin role to register users
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Api: /users/register POST", req.body)
      const data = registerUserSchema.parse(req.body)
      const user = await registerUser(data)
      console.log("Api: /users/register POST - finished")
      sendOk(res, user)
    } catch (error) {
      const err = error as Error
      console.error("Api: /users/register POST Error:", err)
      sendUnexpected(res, err)
    }
  }
)

router.post("/password", async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Api: /users/password POST")

    const { currentPassword, newPassword } = req.body

    // CHECK SESSION FIRST
    if (!req.session || !req.session.user || !req.session.user.userId) {
      sendFail(res, "INVALID_CREDENTIALS", "Not authenticated")
      console.error("Api: /users/password POST Error: Not authenticated")

      return
    }

    // Input validation
    if (!currentPassword || !newPassword) {
      sendFail(res, "VALIDATION_FAILED", "Missing required fields")
      console.error("Api: /users/password POST Error: Missing required fields")
      return
    }

    if (newPassword.length < 8) {
      sendFail(
        res,
        "VALIDATION_FAILED",
        "New password must be at least 8 characters"
      )
      console.error(
        "Api: /users/password POST Error: New password must be at least 8 characters"
      )

      return
    }

    // Call service - now safe to access userId
    await changePassword({
      userId: req.session.user.userId,
      currentPassword,
      newPassword,
    })
    console.log("Api: /users/password POST - finished")
    sendOk(res, undefined, "Password updated successfully")
  } catch (error) {
    const err = error as Error

    // Handle known errors
    if (err.message === "User not found") {
      console.error("Api: /users/password POST Error: User not found")
      sendFail(res, "NOT_FOUND", "User not found")
      return
    }

    if (err.message === "Current password is incorrect") {
      console.error(
        "Api: /users/password POST Error: Current password is incorrect"
      )
      sendFail(res, "INVALID_CREDENTIALS", "Current password is incorrect")
      return
    }
    console.error("Api: /users/password POST Error:", err)
    sendUnexpected(res, err)
  }
})

router.get("/me", async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Api: /me GET")
    const userId = req.session.user!.userId
    const user = await getUserById(userId)
    if (!user) {
      sendFail(res, "NOT_FOUND", "User not found")
      console.error("Api: /users/me GET Error: User not found")
      return
    }
    // res.status(200).json(user)
    sendOk(res, user)
  } catch (error) {
    const err = error as Error
    console.error("Api: /users/me GET Error:", err)
    sendUnexpected(res, err)
  }
})

router.get(
  "/",
  allow({ anyOf: ["ADMINISTRATOR"] }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Api: /users/ GET")
      const users = await getAllUsersName()
      sendOk(res, users)
      console.log("Api: /users/ GET - finished")
    } catch (error) {
      const err = error as Error
      console.error("Api: /users/ GET Error:", err)
      sendUnexpected(res, err)
    }
  }
)

router.get(
  "/:id",
  allow({ anyOf: ["MANAGER", "ADMINISTRATOR"] }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Api: /users/:id GET", req.params.id)
      const userId = req.params.id
      const user = await getUserById(userId)
      if (!user) {
        sendFail(res, "NOT_FOUND", "User not found")
        console.error("Api: /users/:id GET Error: User not found")
        return
      }
      sendOk(res, user)
      console.log("Api: /users/:id GET - finished")
    } catch (error) {
      const err = error as Error
      console.error("Api: /users/:id GET Error:", err)
      sendUnexpected(res, err)
    }
  }
)

// PUT /users/:id (Admin only)
router.put(
  "/:id",
  allow({ anyOf: ["ADMINISTRATOR"] }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Api: /users/:id PUT", req.params.id, req.body)
      const userId = req.params.id
      const data = updateUserSchema.parse(req.body)
      const updatedUser = await updateUser(userId, data)
      sendOk(res, updatedUser)
      console.log("Api: /users/:id PUT - finished")
    } catch (error) {
      const err = error as Error
      console.error("Api: /users/:id PUT Error:", err)
      sendUnexpected(res, err)
    }
  }
)

export default router
