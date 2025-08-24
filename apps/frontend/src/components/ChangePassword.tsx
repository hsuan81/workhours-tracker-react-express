import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { changePassword } from "../api/users"
import type { User } from "../types/types"

interface FormErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
  [key: string]: string | undefined
}

export function ChangePassword({ user }: { user: User | null }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  if (!user) {
    return (
      <div className="text-red-500">
        You must be logged in to change your password.
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    // Required fields
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "New password must be at least 6 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password"
    }

    // Password match validation
    if (formData.newPassword && formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    // New password different from current
    if (formData.currentPassword && formData.newPassword) {
      if (formData.currentPassword === formData.newPassword) {
        newErrors.newPassword =
          "New password must be different from current password"
      }
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })

    // Frontend validation
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const response = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })

      if (response.ok) {
        setMessage({ text: "Password changed successfully!", type: "success" })
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })

        // Navigate to account page after success
        setTimeout(() => {
          if (user.role === "ADMINISTRATOR") {
            navigate("/admin")
          } else {
            navigate("/dashboard")
          }
        }, 2000)
      } else {
        setMessage({
          text: response.error.message || "Failed to change password",
          type: "error",
        })
      }
    } catch (error) {
      setMessage({
        text: `Network error. Please try again.\nError: ${error}`,
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-custom-gray flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-custom-white text-custom-black rounded-lg shadow-md p-6">
        <h1 className="text-center text-xl font-bold mb-4">Change Password</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="currentPassword"
              className="block text-sm mb-1 font-medium"
            >
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md text-custom-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.currentPassword ? "error" : ""
              }`}
            />
            {errors.currentPassword && (
              <span className="text-red-500 text-sm mt-1">
                {errors.currentPassword}
              </span>
            )}
          </div>

          <div className="mb-5">
            <label
              htmlFor="newPassword"
              className="block text-sm mb-1 font-medium"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md text-custom-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.newPassword ? "error" : ""
              }`}
            />
            {errors.newPassword && (
              <span className="text-red-500 text-sm mt-1">
                {errors.newPassword}
              </span>
            )}
          </div>

          <div className="mb-5">
            <label
              htmlFor="confirmPassword"
              className="block text-sm mb-1 font-medium"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md text-custom-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? "error" : ""
              }`}
            />
            {errors.confirmPassword && (
              <span className="text-custom-red text-sm mt-1">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-custom-blue text-custom-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            disabled={isLoading}
          >
            {isLoading ? "Changing..." : "Change Password"}
          </button>
        </form>

        <div className="back-link">
          <button
            type="button"
            className="bg-transparent cursor-pointer border-0 text-sm no-underline text-custom-blue hover:underline hover:text-custom-blue"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>

        {message.text && (
          <div
            className={`mb-5 p-3 text-sm text-custom-red rounded alert-${message.type}`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}
