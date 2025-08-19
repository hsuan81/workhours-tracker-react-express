// src/pages/Dashboard.tsx
import { TodaySummaryCard } from "../components/TodaySummaryCard"
import { MonthlyOverviewCard } from "../components/MonthlyOverviewCard"
import { type User } from "../types/types"
// import { useNavigate } from "react-router-dom"

export default function EmployeeDashboard({ user }: { user: User }) {
  return (
    <div className="bg-custom-gray p-6 w-full min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <div className="text-custom-black font-bold">
          {user.firstName} {user.lastName}
        </div>
        <div>{new Date().toLocaleDateString()}</div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2 bg-custom-white rounded-xl p-4">
          <TodaySummaryCard user={user} />
        </div>
        <div className="w-full md:w-1/2 bg-custom-white rounded-xl p-4">
          <MonthlyOverviewCard user={user} />
        </div>
      </div>

      {/* <div className="mt-6">
        <p className="text-yellow-600 font-medium">⚠️ Alerts:</p>
        <ul className="text-custom-black list-disc list-inside">
          <li>Monthly overtime: 28/46 hours (approaching limit)</li>
        </ul>
      </div> */}
      {/* <div className="mt-4">
        <button
          className="bg-custom-blue text-custom-white"
          onClick={() => navigate("/change-password")}
        >
          Change Password
        </button>
      </div> */}
    </div>
  )
}
