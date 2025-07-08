// src/pages/Dashboard.tsx
import { TodaySummaryCard } from '../components/TodaySummaryCard'
import { MonthlyOverviewCard } from '../components/MonthlyOverviewCard'

export default function EmployeeDashboard() {
  return (
<div className="bg-black p-6 w-full min-h-screen">
  <div className="flex justify-between items-center mb-4">
    <div className="font-bold">User Name</div>
    <div>{new Date().toLocaleDateString()}</div>
    <button className="text-blue-500">Logout</button>
  </div>

  <div className="flex flex-col md:flex-row gap-4">
    <div className="w-full md:w-1/2 bg-blue-400 p-4">
      <TodaySummaryCard />
    </div>
    <div className="w-full md:w-1/2 bg-blue-400 p-4">
      <MonthlyOverviewCard />
    </div>
  </div>

  <div className="mt-6">
    <h3 className="font-semibold">Quick Actions</h3>
    <div className="space-x-4 mt-2">
      <button className="bg-blue-500 text-white px-3 py-1 rounded">Log Hours</button>
      <button className="bg-green-500 text-white px-3 py-1 rounded">Request Leave</button>
      <button className="bg-gray-500 text-white px-3 py-1 rounded">View Details</button>
    </div>
  </div>

  <div className="mt-6">
    <p className="text-yellow-600 font-medium">⚠️ Alerts:</p>
    <ul className="list-disc list-inside">
      <li>Monthly overtime: 28/46 hours (approaching limit)</li>
    </ul>
  </div>
</div>
  )
}