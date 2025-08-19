import { type UserRole } from "../types/types"

export const ROUTER_PERMISSIONS: Record<string, UserRole[]> = {
  "/dashboard": ["EMPLOYEE", "MANAGER"],
  "/log-hours": ["EMPLOYEE", "MANAGER"],
  "/manager": ["MANAGER"],
  "/admin": ["ADMINISTRATOR"],
  "/change-password": ["EMPLOYEE", "MANAGER", "ADMINISTRATOR"],
  //   "/": ["EMPLOYEE", "MANAGER", "ADMINISTRATOR"], // Default route
}

export function canAccessRoute(userRole: UserRole, routePath: string) {
  const allowedRoles = ROUTER_PERMISSIONS[routePath]
  if (!allowedRoles) return true
  return allowedRoles.includes(userRole)
}
