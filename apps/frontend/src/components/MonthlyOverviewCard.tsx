// src/components/MonthlyOverviewCard.tsx
import { useEffect, useState } from "react"
import type { MonthlyOverview } from "../types/api"

export function MonthlyOverviewCard() {
    const [overview, setOverview] = useState<MonthlyOverview | null>(null)
    // const [loading, setLoading] = useState(true)
    const month = new Date().getMonth() + 1 // 1-12

    useEffect(() => {
        const mock: MonthlyOverview = {
            year: 2025,
            month: month,
            daysWorked: 20,
            regularHours: 160,
            overtimeHours: 10,
            overtimePay: 300,
            overtimeLimit: 20
        }

        setTimeout(() => setOverview(mock), 300)
        // fetch('/api/time-entries/monthly-overview?month=' + month).then(res => res.json()).then(setOverview)
    }, [])
    
    if (!overview) {
        return <div>Loading monthly overview...</div>
    }

    return <div className="p-4 border rounded-xl shadow w-full max-w-full">
        <h2 className="text-lg font-semibold mb-2">Monthly Overview</h2>
        <p>Days Worked: {overview.daysWorked}</p>
        <p>Regular Hours: {overview.regularHours}</p>
        <p>Overtime: {overview.overtimeHours} / {overview.overtimeLimit}</p>
        <p>Est. Overtime Pay: {overview.overtimePay}</p>
        </div>
}