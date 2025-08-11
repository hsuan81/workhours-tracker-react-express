import type { JSX } from "react"
import LoginPage from "../pages/LoginPage"
import EmployeeDashboard from "../pages/EmployeeDashboard"
import LogHoursPage from "../pages/LogHoursPage"
import ManagerDashboard from "../pages/ManagerDashboard"
import AdminDashboard from "../pages/AdminDashboard"
import type { Page } from "./NavContext"

export const routes: Record<Page, JSX.Element> = {
  login: <LoginPage />,
  dashboard: <EmployeeDashboard />,
  log: <LogHoursPage />,
  manager: <ManagerDashboard />,
  admin: <AdminDashboard />,
}
