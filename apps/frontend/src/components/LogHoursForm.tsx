import { useEffect, useState } from "react"
import EntryRow from "./EntryRow"
import {
  fetchActiveProjects,
  fetchTimeEntriesByUser,
  logTimeEntries,
  type Project,
  type TimeEntryWithStatus,
} from "../api/timeEntry"
import { fetchUserById, type UserResponse } from "../api/users"

export default function LogHoursForm() {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [entries, setEntries] = useState<TimeEntryWithStatus[]>([])
  const [initialEntries, setInitialEntries] = useState<TimeEntryWithStatus[]>(
    []
  ) // to recover to original if cancel
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [user, setUser] = useState<UserResponse>()
  const [isLoading, setIsLoading] = useState(true)

  const userId = "user1"

  useEffect(() => {
    const getActiveProjects = async () => {
      const activeProjects = await fetchActiveProjects()
      setAllProjects(activeProjects)
    }
    const getUserById = async () => {
      const fetchedUser = await fetchUserById(userId)
      setUser(fetchedUser)
      setIsLoading(false)
    }
    getActiveProjects()
    getUserById()
  }, [])

  useEffect(() => {
    async function getSavedEntries() {
      // const saved = await Promise.resolve<TimeEntry[]>([
      //   {
      //     id: "1",
      //     projectId: "projA",
      //     projectName: "Project A",
      //     date,
      //     hours: 3.5,
      //     status: "unchanged",
      //   },
      //   {
      //     id: "2",
      //     projectId: "projB",
      //     projectName: "Project B",
      //     date,
      //     hours: 4,
      //     status: "unchanged",
      //   },
      // ])
      const saved = await fetchTimeEntriesByUser(userId, date)

      setEntries(saved)
      setInitialEntries(saved)
    }
    getSavedEntries()
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
          userId,
          projectId: available.id,
          projectName: available.name,
          date,
          hours: 0,
          status: "new" as const,
        },
      ])
    }
  }

  const handleProjectChange = (index: number, projectId: string) => {
    // const project = allProjects.find((p) => p.id === projectId)
    // if (!project) return
    // setEntries((prev) => {
    //   const updated = [...prev]
    //   updated[index].projectId = project.id
    //   // updated[index].projectName = project.name
    //   updated[index].status =
    //     updated[index].status === "unchanged" ? "edited" : updated[index].status
    //   return updated
    // })
    const project = allProjects.find((p) => p.id === projectId)
    if (!project) return

    setEntries((prev) => {
      return prev.map((entry, i) =>
        i === index
          ? {
              ...entry, // Create new object
              projectId: project.id,
              status:
                entry.status === "unchanged"
                  ? ("edited" as const)
                  : entry.status,
            }
          : entry
      )
    })
  }

  const handleUpdate = (index: number, value: number) => {
    setEntries((prev) => {
      return prev.map(
        (entry, i) =>
          i === index
            ? {
                ...entry, // Create new object
                hours: value,
                status:
                  entry.status === "unchanged"
                    ? ("edited" as const)
                    : entry.status,
              }
            : entry // Keep existing object unchanged
      )
    })
    // setEntries((prev) => {
    //   const updated = [...prev]
    //   updated[index].hours = value
    //   if (updated[index].status === "unchanged") {
    //     updated[index].status = "edited"
    //   }
    //   return updated
    // })
  }

  const handleDelete = (index: number) => {
    // setEntries((prev) => {
    //   const updated = [...prev]
    //   if (updated[index].status === "new") {
    //     updated.splice(index, 1)
    //   } else {
    //     updated[index].status = "deleted"
    //   }
    //   return updated
    // })
    setEntries((prev) => {
      const entryToDelete = prev[index]

      if (entryToDelete.status === "new") {
        // Remove from array completely
        return prev.slice(0, index).concat(prev.slice(index + 1))
      } else {
        // Mark as deleted with new object
        const newEntry = { ...entryToDelete, status: "deleted" as const }
        return prev.map((entry, i) => (i === index ? newEntry : entry))
      }
    })
  }

  const handleCancel = () => {
    setEntries(initialEntries)
  }

  const handleSave = async () => {
    const created = entries.filter((e) => e.status === "new")
    const updated = entries.filter((e) => e.status === "edited")
    const deleted = entries
      .filter((e) => e.status === "deleted" && e.id)
      .map((e) => ({ id: e.id }))
    console.log({ created, updated, deleted })
    // Send to backend
    await logTimeEntries(entries)
  }

  // Only calculate if user data is loaded
  if (isLoading || !user) {
    return <div>Loading...</div>
  }

  const selectedProjectIds = entries
    .filter((e) => e.status !== "deleted")
    .map((e) => e.projectId)

  const hasInvalidEntry = entries.some(
    (e) =>
      e.status !== "deleted" &&
      (!e.projectId || e.hours === null || e.hours <= 0)
  )

  const hasAvailableProject = allProjects.some(
    (p) => !selectedProjectIds.includes(p.id)
  )

  return (
    <div className="p-6 max-w-2xl mx-auto border bg-custom-white text-custom-black rounded shadow">
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
        <div className="border p-3 rounded bg-custom-white">
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

      {/* <div className="mb-2 text-custom-black">
        <p className="font-semibold">Daily Summary:</p>
        <ul className="list-disc ml-6">
          <li>Total Hours: {total.toFixed(1)}</li>
          <li>Regular Hours: {regular.toFixed(1)}</li>
          <li>Overtime Hours: {overtime.toFixed(1)}</li>
          <li>Overtime Pay: ${otPay.toFixed(2)} (Rate: $25 × 1.33/hr)</li>
        </ul>
      </div> */}
      <div>
        {isLoading || !user?.hourlyRate ? (
          <div>Loading overtime calculations...</div>
        ) : (
          <OvertimeCalculator user={user} entries={entries} />
        )}
      </div>

      {/* <div className="mb-2 text-custom-black">
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
      </div> */}
    </div>
  )
}

interface HelperProps {
  user: UserResponse
  entries: TimeEntryWithStatus[]
}

const OvertimeCalculator = ({ user, entries }: HelperProps) => {
  const rate1 = 1.33
  const rate2 = 1.66
  const total = entries
    .filter((e) => e.status !== "deleted")
    .reduce((sum, e) => sum + (e.hours ?? 0), 0)
  const regular = Math.min(total, 8)
  const overtime = Math.max(total - 8, 0)
  const overtime1 = Math.min(overtime, 2)
  const overtime2 = overtime1 == 2 ? Math.min(overtime - overtime1, 2) : 0
  const otPay =
    overtime1 * user.hourlyRate * rate1 + overtime2 * user.hourlyRate * rate2

  return (
    <div className="mb-2 text-custom-black">
      <p className="font-semibold">Daily Summary:</p>
      <ul className="list-disc ml-6">
        <li>Total Hours: {total.toFixed(1)}</li>
        <li>Regular Hours: {regular.toFixed(1)}</li>
        <li>Overtime Hours: {overtime.toFixed(1)}</li>
        <li>
          Overtime Pay: ${otPay.toFixed(2)} (Rate: {overtime1.toFixed(1)} x{" "}
          {user.hourlyRate} × {rate1} /hr + {overtime2.toFixed(1)} x{" "}
          {user.hourlyRate} ×{rate2} /hr)
        </li>
      </ul>
    </div>
  )
}
