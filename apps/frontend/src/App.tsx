// // App.tsx
import { useState, useEffect } from "react"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import EmployeeDashboard from "./pages/EmployeeDashboard"
import LogHoursPage from "./pages/LogHoursPage"
import ManagerDashboard from "./pages/ManagerDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import { ChangePassword } from "./components/ChangePassword"
import { ProtectedRoute } from "./components/ProtectedRoutes"
import { checkAuthenticated, logoutUser } from "./api/auth"
import type { User } from "./types/types"
import { canAccessRoute } from "./utils/permissions"

function RoleBasedNavbar({
  onLogout,
  user,
}: {
  onLogout: () => void
  user: User | null
}) {
  // const navigate = useNavigate()
  // const page = usePage() // current page from our context
  const navigate = useNavigate() // Function to change pages
  const location = useLocation() // Current URL info
  const isLoggedIn = location.pathname !== "/login"

  // const isLoggedIn = page !== "login"
  if (!isLoggedIn || !user) return null

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/log-hours", label: "Log Hours" },
    { path: "/manager", label: "Manager Dashboard" },
    { path: "/admin", label: "Admin Dashboard" },
    { path: "/change-password", label: "Change Password" },
  ]

  return (
    <nav className="space-x-4 bg-custom-gray p-4">
      {isLoggedIn && (
        <>
          {navItems
            .filter((n) => canAccessRoute(user.role, n.path))
            .map((item) => (
              <button
                key={item.path}
                className="bg-custom-black text-custom-white"
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </button>
            ))}
          <button
            className="bg-custom-red text-custom-white"
            onClick={onLogout}
          >
            Logout
          </button>
        </>
      )}
    </nav>
  )
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Track login status
  const [loading, setLoading] = useState(true) // Track if still checking
  const navigate = useNavigate()
  const location = useLocation() // Current page info
  const [user, setUser] = useState<User | null>(null)

  const checkAuthStatus = async () => {
    const res = await checkAuthenticated()

    if (res.ok && res.data) {
      setIsAuthenticated(res.data.authenticated)
      setUser(res.data.user!)
    } else {
      setIsAuthenticated(false) // Not logged in
      setUser(null)
    }
    setLoading(false) // Stop loading
  }

  // Check authentication when app loads
  useEffect(() => {
    checkAuthStatus()
  }, []) // Run once when app loads}

  // Handle redirects after we know authentication status
  useEffect(() => {
    if (loading) return
    // Only redirect after we've checked auth
    if (isAuthenticated) {
      // Logged in but on login page? Go to dashboard
      if (location.pathname === "/login" || location.pathname === "/") {
        if (user?.role === "ADMINISTRATOR") {
          navigate("/admin")
        } else {
          navigate("/dashboard")
        }
      }
    } else {
      // Not logged in? Go to login page
      if (location.pathname !== "/login") {
        navigate("/login")
      }
    }
  }, [isAuthenticated, loading, location.pathname, navigate])

  // Handle successful login
  const handleLoginSuccess = async () => {
    // Re-check auth status from backend
    await checkAuthStatus() // This will update isAuthenticated
    // Navigation happens automatically via useEffect above
  }

  const handleLogout = async () => {
    try {
      // Call backend to destroy session
      await logoutUser()

      // Update frontend state immediately
      setIsAuthenticated(false)
      setUser(null)

      // Navigate to login page
    } catch (error) {
      // Even if logout API fails, clear frontend state
      console.error("Logout error:", error)
      setIsAuthenticated(false)
      setUser(null)
      navigate("/login")
    }
  }

  // Still checking authentication? Show loading
  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <>
      {isAuthenticated && (
        <RoleBasedNavbar onLogout={handleLogout} user={user} />
      )}
      <main>
        <Routes>
          <Route
            path="/login"
            element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user} isAuthenticated={isAuthenticated}>
                <EmployeeDashboard user={user!} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/log-hours"
            element={
              <ProtectedRoute user={user} isAuthenticated={isAuthenticated}>
                <LogHoursPage user={user!} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <ProtectedRoute user={user} isAuthenticated={isAuthenticated}>
                <ManagerDashboard user={user!} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} isAuthenticated={isAuthenticated}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute user={user} isAuthenticated={isAuthenticated}>
                <ChangePassword user={user} />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<div>Redirecting...</div>} />{" "}
          {/* Default page */}
        </Routes>
      </main>
    </>
  )
}
