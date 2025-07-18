import { useEffect, useState } from "react"
import type { TimeEntry } from "../types/api"
import EntryRow from "./EntryRow"

export default function LogHoursForm() {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [initialEntries, setInitialEntries] = useState<TimeEntry[]>([])
  const [allProjects, setAllProjects] = useState<
    { id: string; name: string }[]
  >([])

  useEffect(() => {
    async function fetchProjects() {
      const projects = await Promise.resolve([
        { id: "projA", name: "Project A" },
        { id: "projB", name: "Project B" },
        { id: "projC", name: "Project C" },
        { id: "projD", name: "Project D" },
      ])
      setAllProjects(projects)
    }
    fetchProjects()
  }, [])

  useEffect(() => {
    async function fetchSavedEntries() {
      const saved = await Promise.resolve<TimeEntry[]>([
        {
          id: "1",
          projectId: "projA",
          projectName: "Project A",
          date,
          hours: 3.5,
          status: "unchanged",
        },
        {
          id: "2",
          projectId: "projB",
          projectName: "Project B",
          date,
          hours: 4,
          status: "unchanged",
        },
      ])
      setEntries(saved)
      setInitialEntries(saved)
    }
    fetchSavedEntries()
  }, [date])

  const handleAdd = () => {
    const selectedProjectIds = entries
      .filter((e) => e.status !== "deleted")
      .map((e) => e.projectId)
    const available = allProjects.find(
      (p) => !selectedProjectIds.includes(p.id)
    )
    if (available) {
      setEntries((prev) => [
        ...prev,
        {
          projectId: available.id,
          projectName: available.name,
          date,
          hours: null,
          status: "new",
        },
      ])
    }
  }

  const handleProjectChange = (index: number, projectId: string) => {
    const project = allProjects.find((p) => p.id === projectId)
    if (!project) return
    setEntries((prev) => {
      const updated = [...prev]
      updated[index].projectId = project.id
      updated[index].projectName = project.name
      updated[index].status =
        updated[index].status === "unchanged" ? "edited" : updated[index].status
      return updated
    })
  }

  const handleUpdate = (index: number, value: number | null) => {
    setEntries((prev) => {
      const updated = [...prev]
      updated[index].hours = value
      if (updated[index].status === "unchanged") {
        updated[index].status = "edited"
      }
      return updated
    })
  }

  const handleDelete = (index: number) => {
    setEntries((prev) => {
      const updated = [...prev]
      if (updated[index].status === "new") {
        updated.splice(index, 1)
      } else {
        updated[index].status = "deleted"
      }
      return updated
    })
  }

  const handleCancel = () => {
    setEntries(initialEntries.map((e) => ({ ...e })))
  }

  const handleSave = () => {
    const created = entries.filter((e) => e.status === "new")
    const updated = entries.filter((e) => e.status === "edited")
    const deleted = entries
      .filter((e) => e.status === "deleted" && e.id)
      .map((e) => ({ id: e.id }))
    console.log({ created, updated, deleted })
    // Send to backend
  }

  const selectedProjectIds = entries
    .filter((e) => e.status !== "deleted")
    .map((e) => e.projectId)
  const total = entries
    .filter((e) => e.status !== "deleted")
    .reduce((sum, e) => sum + (e.hours ?? 0), 0)
  const regular = Math.min(total, 8)
  const overtime = Math.max(total - 8, 0)
  const rate = 25
  const otPay = overtime * rate * 1.33
  const regularPay = regular * rate

  const hasInvalidEntry = entries.some(
    (e) =>
      e.status !== "deleted" &&
      (!e.projectId || e.hours === null || e.hours <= 0)
  )

  const hasAvailableProject = allProjects.some(
    (p) => !selectedProjectIds.includes(p.id)
  )

  return (
    <div className="p-6 max-w-2xl mx-auto border bg-custom-white rounded shadow">
      <h2 className="text-lg text-center text-custom-black font-semibold mb-4">
        Log Hours for {date}
      </h2>

      <div className="flex gap-4 items-center mb-4">
        <label>Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          onClick={handleSave}
          className="bg-custom-blue text-custom-white px-3 py-1 rounded disabled:opacity-50"
          disabled={hasInvalidEntry}
        >
          Save Entry
        </button>
        <button
          onClick={handleCancel}
          className="bg-custom-red text-custom-white px-3 py-1"
        >
          Cancel
        </button>
      </div>

      <div className="mb-4">
        <p className="font-semibold mb-1">Project Hours Entry:</p>
        <div className="border p-3 rounded bg-gray-50">
          {entries.map(
            (entry, index) =>
              entry.status !== "deleted" && (
                <EntryRow
                  key={entry.id ?? `temp-${index}`}
                  entry={entry}
                  index={index}
                  allProjects={allProjects}
                  selectedProjectIds={selectedProjectIds}
                  onProjectChange={handleProjectChange}
                  onHourChange={handleUpdate}
                  onDelete={handleDelete}
                />
              )
          )}
          <button
            onClick={handleAdd}
            disabled={!hasAvailableProject}
            className="bg-custom-blue text-custom-white mt-2 disabled:opacity-50"
          >
            + Add Project
          </button>
        </div>
      </div>

      <div className="mb-2 text-custom-black">
        <p className="font-semibold">Daily Summary:</p>
        <ul className="list-disc ml-6">
          <li>Total Hours: {total.toFixed(1)}</li>
          <li>Regular Hours: {regular.toFixed(1)}</li>
          <li>Overtime Hours: {overtime.toFixed(1)}</li>
          <li>Overtime Pay: ${otPay.toFixed(2)} (Rate: $25 × 1.33/hr)</li>
        </ul>
      </div>

      <div className="mb-2 text-custom-black">
        <p className="font-semibold">Week Summary:</p>
        <ul className="list-disc ml-6">
          <li>Total Hours: {total.toFixed(1)}</li>
          <li>
            Regular Hours: {regular.toFixed(1)} (Rate: $25/hr) = $
            {regularPay.toFixed(0)}
          </li>
          <li>
            Overtime Hours: {overtime.toFixed(1)} (Rate: $25 × 1.33/hr) = $
            {otPay.toFixed(2)}
          </li>
        </ul>
      </div>
    </div>
  )
}
