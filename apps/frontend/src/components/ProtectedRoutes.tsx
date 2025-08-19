import { Navigate, useLocation } from "react-router-dom"
import type { User } from "../types/types"
import { canAccessRoute } from "../utils/permissions"

interface ProtectedRoutesProps {
  children: React.ReactNode
  user: User | null
  isAuthenticated: boolean
}

export function ProtectedRoute({
  children,
  user,
  isAuthenticated,
}: ProtectedRoutesProps) {
  const location = useLocation()
  if (!isAuthenticated || !user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (!canAccessRoute(user.role, location.pathname)) {
    // Redirect to unauthorized page if user doesn't have access
    return (
      <div className="bg-custom-gray min-h-screen py-8 text-center">
        <h2 className="text-2xl font-bold text-custom-red mb-4">
          Access Denied
        </h2>
        <p className="text-custom-black mb-4">
          You don't have permission to access this page.
        </p>
        <button
          onClick={() => window.history.back()}
          className="bg-custom-blue text-custom-white px-4 py-1 mt-4 rounded"
        >
          Go Back
        </button>
      </div>
    )
  }
  return <>{children}</>
}
