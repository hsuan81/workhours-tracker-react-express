// App.tsx
import { useState } from "react";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import LogHoursPage from "./pages/LogHoursPage";

function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div>
      <nav className="space-x-4 p-4 bg-gray-100">
        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("log")}>Log Hours</button>
      </nav>
      {page === "dashboard" && <EmployeeDashboard />}
      {page === "log" && <LogHoursPage />}
    </div>
  );
}
export default App;