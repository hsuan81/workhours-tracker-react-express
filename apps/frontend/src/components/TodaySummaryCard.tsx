// src/components/TodaySummaryCard.tsx
import { useEffect, useState } from 'react'
import type { DailySummary } from '../types/api'

export function TodaySummaryCard() {
  const [summary, setSummary] = useState<DailySummary | null>(null)

  useEffect(() => {
    const mock: DailySummary = {
        date: '2025-07-07',
        totalHours: 8.5,
        regularHours: 8,
        overtimeHours: 0.5,
        overtimePay: 250,
        projects: [
          { id: '1', name: 'Project A', hours: 5 },
          { id: '2', name: 'Project B', hours: 3.5 },
        ],
      }
    
    setTimeout(() => setSummary(mock), 300)
    // fetch('/api/entries/summary')
    //   .then(res => res.json())
    //   .then(setSummary)
  }, [])

  if (!summary) return <div>Loading today's summary...</div>

  return (
    <div className="p-4 border rounded-xl shadow w-full max-w-full">
      <h2 className="text-lg font-semibold mb-2">Today's Summary</h2>
      <p>Hours: {summary.totalHours}/8 + {summary.overtimeHours}</p>
      <p>Projects: {summary.projects.map(p => {return p.name + ' - ' + p.hours + 'hrs'}).join(', ')}</p>
      <p>Status: 🟡</p>
    </div>
  )
}