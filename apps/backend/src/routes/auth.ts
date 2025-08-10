import express from "express"
import {
  loginController,
  logoutController,
  sessionCheckController,
} from "../services/authService"

const router = express.Router()

router.post("/login", loginController)
router.post("/logout", logoutController)
router.get("/session", sessionCheckController)

export default router
