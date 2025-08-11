// // App.tsx
// import { useState } from "react"
// import { logoutUser } from "./api/auth"
// import Modal from "./components/Modal"
import NavigationProvider from "./router/NavigationProvider"
import { useNavigate, usePage } from "./router/navHooks"
import { routes } from "./router/routes"

function Navbar() {
  const navigate = useNavigate()
  const page = usePage() // current page from our context

  const isLoggedIn = page !== "login"

  return (
    <nav className="space-x-4 bg-custom-gray p-4">
      {isLoggedIn && (
        <>
          <button onClick={() => navigate("dashboard")}>Dashboard</button>
          <button onClick={() => navigate("log")}>Log Hours</button>
          <button onClick={() => navigate("manager")}>Manager Dashboard</button>
          <button onClick={() => navigate("admin")}>
            Administrator Dashboard
          </button>
          <button
            className="bg-custom-red text-custom-white"
            onClick={() => {
              // logout logic
              navigate("login")
            }}
          >
            Logout
          </button>
        </>
      )}
    </nav>
  )
}

function PageRenderer() {
  const page = usePage()
  // MVP render: simple map lookup
  return routes[page]
}

export default function App() {
  return (
    <NavigationProvider>
      <Navbar />
      <PageRenderer />
    </NavigationProvider>
  )
}
// import { useState } from "react"
// import LoginPage from "./pages/LoginPage"
// import EmployeeDashboard from "./pages/EmployeeDashboard"
// import LogHoursPage from "./pages/LogHoursPage"
// import ManagerDashboard from "./pages/ManagerDashboard"
// import AdminDashboard from "./pages/AdminDashboard"
// import { logoutUser } from "./api/auth"

// function App() {
//   const [page, setPage] = useState("login")

//   function redirect(pagePath: string): void {
//     setPage(pagePath)
//   }

//   return (
//     <div>
//       <nav className="space-x-4 p-4 bg-custom-gray">
//         <button onClick={() => setPage("dashboard")}>Dashboard</button>
//         <button onClick={() => setPage("log")}>Log Hours</button>
//         <button onClick={() => setPage("manager")}>Manager Dashboard</button>
//         <button onClick={() => setPage("admin")}>
//           Administrator Dashboard
//         </button>
//         <button
//           className="bg-custom-red text-custom-white"
//           onClick={async () => {
//             const res = await logoutUser()
//             if (res.success) {
//               redirect("login")
//             } else {
//               return
//             }
//           }}
//         >
//           Logout
//         </button>
//       </nav>
//       {page === "login" && <LoginPage redirect={redirect} />}
//       {page === "dashboard" && <EmployeeDashboard />}
//       {page === "log" && <LogHoursPage />}
//       {page === "manager" && <ManagerDashboard />}
//       {page === "admin" && <AdminDashboard />}
//     </div>
//   )
// }
// export default App
