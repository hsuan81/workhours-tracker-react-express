// apps/frontend/src/components/MonthlyOverviewCard.tsx
import { useEffect, useState } from "react"
import { type MonthlyOverview, fetchMonthlyOverview } from "../api/timeEntry"
import { getMonthName } from "../utils/calendar"

export function MonthlyOverviewCard() {
  const [overview, setOverview] = useState<MonthlyOverview | null>(null)
  // const [loading, setLoading] = useState(true)
  const month = new Date().getMonth() + 1 // 1-12

  useEffect(() => {
    const getOverview = async () => {
      const overviewRes = await fetchMonthlyOverview(
        "user1",
        new Date().getFullYear(),
        month
      )
      if (overviewRes.ok) setOverview(overviewRes.data)
    }
    getOverview()
  }, [])

  if (!overview) {
    return <div>Loading monthly overview...</div>
  }

  const monthString = getMonthName(month - 1)

  return (
    <div className="p-4 bg-custom-white rounded-xl w-full max-w-full">
      <h2 className="text-lg font-semibold mb-2">
        Monthly Overview ({monthString})
      </h2>
      <p>Days Worked: {overview.daysWorked} days</p>
      <p>Regular Hours: {overview.regularHours} hrs</p>
      <p>
        Overtime: {overview.overtimeHours} / {overview.overtimeLimit} hrs
      </p>
      <p>Est. Overtime Pay: ${overview.overtimePay}</p>
    </div>
  )
}
