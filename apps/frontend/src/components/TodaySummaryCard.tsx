// apps/frontend/src/components/TodaySummaryCard.tsx
import { useEffect, useState } from "react"
import { type DailySummary, fetchTodaySummary } from "../api/timeEntry"

export function TodaySummaryCard() {
  const [summary, setSummary] = useState<DailySummary | null>(null)

  useEffect(() => {
    fetchTodaySummary("user1", "2025-07-28").then(setSummary)
  }, [])

  if (!summary) return <div>Loading today's summary...</div>

  return (
    <div className="p-4 bg-custom-white rounded-xl w-full max-w-full">
      <h2 className="text-lg font-semibold mb-2">Today's Summary</h2>
      <p>
        Hours: {summary.totalHours}/8 + {summary.overtimeHours}
      </p>
      <p>
        Projects:{" "}
        {summary.projects
          .map((p) => {
            return p.name + " - " + p.hours + "hrs"
          })
          .join(", ")}
      </p>
    </div>
  )
}
