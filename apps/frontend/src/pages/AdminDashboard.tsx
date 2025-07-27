// import React, { useEffect, useState, type JSX } from "react"
// import { UserForm } from "../components/UserForm"
// import { UserSelector, type UserOption } from "../components/UserSelector"
// import type { RegisterUserPayload, UpdateUserPayload } from "../types"

// const mockTeams = [
//   { id: "team1", name: "Engineering" },
//   { id: "team2", name: "Sales" },
// ]

// const mockUsers: UserOption[] = [
//   { userId: "user123", name: "Alice Johnson" },
//   { userId: "user456", name: "Bob Lee" },
// ]

// async function fetchUserData(userId: string): Promise<UpdateUserPayload> {
//   // Replace this with a real API call
//   return {
//     userId,
//     firstName: "John",
//     lastName: "Doe",
//     role: "EMPLOYEE",
//     teamId: "team1",
//     hireDate: "2024-01-01",
//     monthlySalary: 5000,
//     isActive: true,
//   }
// }

// export default function AdminDashboard(): JSX.Element {
//   const [activeTab, setActiveTab] = useState<"register" | "update">("register")
//   const [selectedUserId, setSelectedUserId] = useState("")
//   const [userData, setUserData] = useState<UpdateUserPayload | null>(null)

//   function handleRegister(data: RegisterUserPayload) {
//     console.log("Registering user:", data)
//     // TODO: Call API
//   }

//   function handleUpdate(data: UpdateUserPayload) {
//     console.log("Updating user:", data)
//     // TODO: Call API
//   }

//   function handleTabChange(tab: "register" | "update") {
//     setActiveTab(tab)
//   }

//   function handleUserSelect(userId: string) {
//     setSelectedUserId(userId)
//   }

//   useEffect(() => {
//     if (selectedUserId) {
//       fetchUserData(selectedUserId).then(setUserData)
//     }
//   }, [selectedUserId])

//     return (
//   <div className="max-w-2xl mx-auto mt-10">
//     <div className="flex border-b mb-4">
//       <button
//         className={`px-4 py-2 ${
//           activeTab === "register"
//             ? "border-b-2 border-blue-600 font-semibold"
//             : "text-gray-500"
//         }`}
//         onClick={() => handleTabChange("register")}
//       >
//         Register User
//       </button>
//       <button
//         className={`px-4 py-2 ${
//           activeTab === "update"
//             ? "border-b-2 border-blue-600 font-semibold"
//             : "text-gray-500"
//         }`}
//         onClick={() => handleTabChange("update")}
//       >
//         Update User
//       </button>
//     </div>

//     {activeTab === "register" && (
//       <UserForm type="register" onSubmit={handleRegister} teams={mockTeams} />
//     )}

//     {activeTab === "update" && (
//       <div className="space-y-4">
//         <UserSelector
//           users={mockUsers}
//           selectedId={selectedUserId}
//           onSelect={handleUserSelect}
//         />
//         {userData && (
//           <UserForm
//             type="update"
//             user={userData}
//             onSubmit={handleUpdate}
//             teams={mockTeams}
//           />
//         )}
//   </div>
//   </div>
//     )
// }

import React, { useState, useEffect, type JSX } from "react"
import type { RegisterUserPayload, UpdateUserPayload } from "../types"
import { UserForm } from "../components/UserForm"
import { UserSelector } from "../components/UserSelector"

// Mock data - replace with actual data
const mockTeams = [
  { id: "1", name: "Engineering" },
  { id: "2", name: "Marketing" },
  { id: "3", name: "Sales" },
]

const mockUsers = [
  { userId: "1", name: "John Doe" },
  { userId: "2", name: "Jane Smith" },
]

// Mock API function - replace with actual API call
async function fetchUserData(userId: string): Promise<UpdateUserPayload> {
  // Simulate API call
  return {
    userId,
    firstName: "John",
    lastName: "Doe",
    role: "EMPLOYEE",
    teamId: "1",
    hireDate: "2023-01-01",
    monthlySalary: 5000,
    isActive: true,
  }
}

export default function AdminDashboard(): JSX.Element {
  const [activeTab, setActiveTab] = useState<"register" | "update">("register")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [userData, setUserData] = useState<UpdateUserPayload | null>(null)

  function handleRegister(data: RegisterUserPayload) {
    console.log("Registering user:", data)
    // TODO: Call API
  }

  function handleUpdate(data: UpdateUserPayload) {
    console.log("Updating user:", data)
    // TODO: Call API
  }

  function handleTabChange(tab: "register" | "update") {
    setActiveTab(tab)
  }

  function handleUserSelect(userId: string) {
    setSelectedUserId(userId)
  }

  useEffect(() => {
    if (selectedUserId) {
      fetchUserData(selectedUserId).then(setUserData)
    }
  }, [selectedUserId])

  return (
    <div className="bg-custom-gray min-h-screen py-8">
      <h1 className="text-center text-2xl font-bold">
        Administrator Dashboard
      </h1>
      <div className="max-w-2xl mx-auto mt-10">
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${
              activeTab === "register"
                ? "border-b-2 bg-custom-white text-custom-black font-semibold"
                : "bg-custom-gray text-custom-black"
            }`}
            onClick={() => handleTabChange("register")}
          >
            Register User
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "update"
                ? "border-b-2 bg-custom-white text-custom-black font-semibold"
                : "bg-custom-gray text-custom-black"
            }`}
            onClick={() => handleTabChange("update")}
          >
            Update User
          </button>
        </div>

        {activeTab === "register" && (
          <UserForm
            type="register"
            onSubmit={handleRegister}
            teams={mockTeams}
          />
        )}

        {activeTab === "update" && (
          <div className="space-y-4 bg-custom-white">
            <UserSelector
              users={mockUsers}
              selectedId={selectedUserId}
              onSelect={handleUserSelect}
            />
            {userData && (
              <UserForm
                type="update"
                user={userData}
                onSubmit={handleUpdate}
                teams={mockTeams}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
