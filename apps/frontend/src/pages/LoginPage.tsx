import React, { useState } from "react"
import { loginUser } from "../api/auth"
import { useNavigate } from "../router/navHooks"
import type { UnexpectedError } from "../utils/api"

/**
 * Session-Based Authentication Login Component
 *
 * This component handles login using session-based authentication.
 * The server manages sessions via HTTP-only cookies, which are automatically
 * included in requests when using credentials: 'include'.
 *
 * No tokens need to be manually stored - the browser handles session cookies.
 */

// Type definitions
interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

// interface LoginResponse {
//   message?: string
//   user?: {
//     id: string
//     email: string
//     firstName?: string
//     lastName?: string
//     role: string
//   }
//   sessionId?: string
// }

// interface LoginProps {
//   redirect: (pagePath: string) => void
// }

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>("")
  const navigate = useNavigate()

  // Basic email validation regex
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Helper function to check session status (optional)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  const handleSubmit = async (): Promise<void> => {
    setMessage("")

    // Validate form before submission
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // API call to login endpoint for session-based authentication
      // The server will set session cookies automatically upon successful login
      // const response = await fetch("http://localhost:3001/api/auth/login", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   credentials: "include", // Essential for session-based auth - includes cookies
      //   body: JSON.stringify({
      //     email: formData.email,
      //     password: formData.password,
      //   }),
      // })

      // const data: LoginResponse = await response.json()
      const response = await loginUser(formData)

      if (!response.ok) {
        switch (response.error.code) {
          case "INVALID_CREDENTIALS":
            setMessage("Email or password is incorrect.")
            break
          case "VALIDATION_REQUIRED":
            setMessage("Please fill in both email and password.")
            break
          case "INTERNAL_ERROR": {
            const traceId = (response.error.details as UnexpectedError)?.traceId
            setMessage(
              `Something went wrong. Please try again.${
                traceId ? ` (Ref: ${traceId})` : ""
              }`
            )
            break
          }
          default:
            setMessage(response.error.message || "Request failed.")
        }
        return
      }

      // if (response.success) {
      setMessage("Login successful!")
      //   // Handle successful login here (e.g., redirect, update app state, etc.)
      //   console.log("Login successful:", response.message)

      //   // Session is automatically handled via cookies (credentials: 'include')
      //   // No need to manually store tokens - the session cookie is set by the server

      //   // Example: Redirect to dashboard after successful login
      //   // window.location.href = "/dashboard"
      //   // redirect("dashboard")
      navigate("dashboard")

      //   // Example: Update global authentication state
      //   // setAuthenticatedUser(data.user);

      //   // Example: Call a function to verify session was established
      //   // const sessionValid = await checkSessionStatus();
      //   // if (sessionValid) {
      //   //   console.log('Session established successfully');
      //   // }
      // }
    } catch (error) {
      console.error("Login error:", error)
      if (error instanceof Error) {
        setMessage(error.message) // This will be the backend's error message
      } else {
        setMessage("Network error. Please check your connection and try again.")
      }
      setMessage("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-custom-gray flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        <div className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className={`w-full px-3 py-2 border rounded-md text-custom-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-custom-black mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className={`w-full px-3 py-2 border rounded-md text-custom-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-custom-blue text-custom-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-md text-sm ${
              message.includes("successful")
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginPage
