import React, { useState, useEffect, type JSX } from "react"
import {
  registerUser,
  updateUser,
  fetchUserById,
  fetchAllUserNames,
} from "../api/users"
import type {
  RegisterUserInput,
  UserResponse,
  UserName,
  UpdateUserInput,
} from "../api/users"
import type { UpdateUserInputWithId } from "../types"
import { type Team, fetchAllTeams } from "../api/manager"
import { UserForm } from "../components/UserForm"
import { UserSelector } from "../components/UserSelector"

export default function AdminDashboard(): JSX.Element {
  const [activeTab, setActiveTab] = useState<"register" | "update">("register")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [userData, setUserData] = useState<UserResponse | null>(null)
  const [userList, setUserList] = useState<UserName[]>([])
  const [teamList, setTeamList] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalStatus, setModalStatus] = useState<
    "loading" | "success" | "error"
  >()
  const [modalMessage, setModalMessage] = useState("")

  // const userId = "user2"

  async function handleRegister(data: RegisterUserInput) {
    setModalStatus("loading")
    setModalMessage("Registering user...")
    setShowModal(true)

    try {
      console.log("Registering user:", data)
      await registerUser(data)
      setModalStatus("success")
      setModalMessage("User registered successfully!")

      // Auto-close modal after 2 seconds on success
      setTimeout(() => setShowModal(false), 2000)
    } catch (error) {
      setModalStatus("error")
      setModalMessage("Failed to register user. Error: " + error)
    }
  }

  async function handleUpdate(data: UpdateUserInputWithId) {
    setModalStatus("loading")
    setModalMessage("Updating user...")
    setShowModal(true)

    try {
      console.log("Updating user:", data)
      await updateUser(data.id, data as UpdateUserInput)
      setModalStatus("success")
      setModalMessage("User updated successfully!")

      // Auto-close modal after 2 seconds on success
      setTimeout(() => setShowModal(false), 2000)
    } catch (error) {
      setModalStatus("error")
      setModalMessage("Failed to update user.  Error: " + error)
    }
  }

  function handleTabChange(tab: "register" | "update") {
    setActiveTab(tab)
  }

  function handleUserSelect(userId: string) {
    setSelectedUserId(userId)
  }

  // function closeModal() {
  //   setShowModal(false)
  // }

  useEffect(() => {
    const getSelectedUserData = async () => {
      if (selectedUserId) {
        await fetchUserById(selectedUserId).then(setUserData)
      }
    }
    getSelectedUserData()
  }, [selectedUserId])

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchAllUserNames().then(setUserList),
          fetchAllTeams().then(setTeamList),
        ])
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

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

        {activeTab === "register" && !isLoading && (
          <UserForm
            type="register"
            onSubmit={handleRegister}
            teams={teamList}
          />
        )}

        {activeTab === "update" && !isLoading && (
          <div className="space-y-4 bg-custom-white">
            <UserSelector
              users={userList}
              selectedId={selectedUserId}
              onSelect={handleUserSelect}
            />
            {userData && (
              <UserForm
                type="update"
                user={userData}
                onSubmit={handleUpdate}
                teams={teamList}
              />
            )}
          </div>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              {modalStatus === "loading" && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-blue"></div>
              )}
              {modalStatus === "success" && (
                <div className="text-green-500 text-2xl">✓</div>
              )}
              {modalStatus === "error" && (
                <div className="text-red-500 text-2xl">✗</div>
              )}
            </div>

            <p className="text-center text-custom-black mb-4">{modalMessage}</p>

            {modalStatus !== "loading" && (
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-custom-red text-white py-2 px-4 rounded hover:bg-opacity-90"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
