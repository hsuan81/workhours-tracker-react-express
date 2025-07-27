// App.tsx
import { useState } from "react"
import EmployeeDashboard from "./pages/EmployeeDashboard"
import LogHoursPage from "./pages/LogHoursPage"
import ManagerDashboard from "./pages/ManagerDashboard"
import AdminDashboard from "./pages/AdminDashboard"

function App() {
  const [page, setPage] = useState("dashboard")

  return (
    <div>
      <nav className="space-x-4 p-4 bg-custom-gray">
        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("log")}>Log Hours</button>
        <button onClick={() => setPage("manager")}>Manager Dashboard</button>
        <button onClick={() => setPage("admin")}>
          Administrator Dashboard
        </button>
        <button className="bg-custom-red text-custom-white">Logout</button>
      </nav>
      {page === "dashboard" && <EmployeeDashboard />}
      {page === "log" && <LogHoursPage />}
      {page === "manager" && <ManagerDashboard />}
      {page === "admin" && <AdminDashboard />}
    </div>
  )
}
export default App
