import type { TeamOverview } from "../api/manager"
import {
  ComposedChart,
  CartesianGrid,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"

interface TeamPanelProps {
  team: TeamOverview | undefined
}

export function TeamPanel({ team }: TeamPanelProps) {
  if (!team) {
    return <div className="text-center text-gray-500">No team selected</div>
  }
  console.log("Rendering TeamPanel for team:", team)
  const chartData = team.members.map((m) => ({
    name: `${m.firstName} ${m.lastName}`,
    monthlyOvertime: m.monthlyOvertime,
    last7WorkdaysAvgHours: m.last7WorkdaysAvgHours,
  }))

  return (
    <div className="space-y-4">
      <div className="bg-custom-white border rounded p-4">
        <h2 className="text-lg font-semibold mb-2">Team: {team.name}</h2>
        <p>Total Overtime: {team.summary?.totalOvertime} hrs</p>
        <p>Avg Daily Overtime: {team.summary?.avgDailyOvertime} hrs</p>
        <p>Total OT Cost: ${team.summary?.totalOtCost}</p>
      </div>

      <div className="bg-custom-white border rounded p-4">
        <h3 className="font-semibold mb-2">Team Member Overview</h3>
        <table className="w-full text-sm text-custom-black border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Total OT (Month)</th>
              <th className="p-2 text-left">Avg Daily (Last 7d)</th>
            </tr>
          </thead>
          <tbody>
            {team.members.map((member, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">
                  {member.firstName + " " + member.lastName}
                </td>
                <td className="p-2">{member.monthlyOvertime} hrs</td>
                <td className="p-2">{member.last7WorkdaysAvgHours} hrs</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-custom-white border rounded p-4">
        <h3 className="text-center font-semibold mb-2">
          Overtime Comparison (unit: hours)
        </h3>
        <div className="flex justify-center">
          <ComposedChart
            width={700}
            height={350}
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#181d2a" />

            {/* Primary Y-Axis for Bar Chart (Monthly OT) */}
            <YAxis yAxisId="left" orientation="left" stroke="#748efe" />

            {/* Secondary Y-Axis for Line Chart (Avg 7d OT) */}
            <YAxis yAxisId="right" orientation="right" stroke="#ee4b2b" />

            <Tooltip />
            <Legend />

            {/* Bar for Monthly OT (uses 'left' Y-axis) */}
            <Bar
              yAxisId="left"
              dataKey="monthlyOvertime"
              fill="#748efe"
              name="Monthly OT"
            />

            {/* Line for Avg 7d OT (uses 'right' Y-axis) */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="last7WorkdaysAvgHours"
              stroke="#ee4b2b"
              strokeWidth={3}
              name="Avg OT (7d)"
            />
          </ComposedChart>
        </div>
      </div>
    </div>
  )
}
