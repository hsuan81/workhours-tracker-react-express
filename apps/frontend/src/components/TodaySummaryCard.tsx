// apps/frontend/src/components/TodaySummaryCard.tsx
import { useEffect, useState } from "react"
import { type DailySummary, fetchTodaySummary } from "../api/timeEntry"

export function TodaySummaryCard() {
  const todayString = new Date().toISOString().split("T")[0]
  console.log(todayString)
  const [summary, setSummary] = useState<DailySummary>({
    date: todayString,
    totalHours: 0,
    regularHours: 0,
    overtimeHours: 0,
    overtimePay: 0,
    projects: [],
  })
  const [showData, setShowData] = useState(false)
  const userId = "user1"

  useEffect(() => {
    const getTodaySummary = async () => {
      const result = await fetchTodaySummary(userId, todayString)
      if (result.ok) {
        console.log("response ok", result)
        setSummary(result.data)
        // setSummary({ ...result.data, projects: result.data.projects ?? [] })
        setShowData(true)
        console.log("regular", result.data)
      }
    }
    getTodaySummary()
  }, [])

  if (!summary) return <div>Loading today's summary...</div>

  return (
    <div className="p-4 bg-custom-white rounded-xl w-full max-w-full">
      <h2 className="text-lg font-semibold mb-2">Today's Summary</h2>
      <p>
        Hours: {summary.regularHours}/8 + {summary.overtimeHours}
      </p>
      <p>
        Projects:{" "}
        {showData &&
          summary.projects
            .map((p) => {
              return p.name + " - " + p.hours + "hrs"
            })
            .join(", ")}
      </p>
    </div>
  )
}
