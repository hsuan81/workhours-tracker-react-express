import type { TimeEntry } from "../types/api"

type EntryRowProps = {
  entry: TimeEntry
  index: number
  allProjects: { id: string; name: string }[]
  selectedProjectIds: string[]
  onProjectChange: (index: number, projectId: string) => void
  onHourChange: (index: number, hours: number | null) => void
  onDelete: (index: number) => void
}

export default function EntryRow({
  entry,
  index,
  allProjects,
  selectedProjectIds,
  onProjectChange,
  onHourChange,
  onDelete,
}: EntryRowProps) {
  const isInvalid = !entry.projectId || entry.hours === null || entry.hours <= 0

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2">
        <select
          value={entry.projectId}
          onChange={(e) => onProjectChange(index, e.target.value)}
          className="border px-1"
        >
          <option value="">Select Project</option>
          {allProjects.map((p) => (
            <option
              key={p.id}
              value={p.id}
              disabled={
                selectedProjectIds.includes(p.id) && p.id !== entry.projectId
              }
            >
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.1"
          value={entry.hours ?? ""}
          onChange={(e) => {
            const val = e.target.value
            onHourChange(index, val === "" ? null : parseFloat(val))
          }}
          className={`w-24 border px-1 ${isInvalid ? "border-red-500" : ""}`}
        />
        <span>hours</span>
        <button
          onClick={() => onDelete(index)}
          className="bg-custom-red text-custom-white px-2 py-1 rounded"
        >
          ×
        </button>
      </div>
      {isInvalid && (
        <p className="text-red-500 text-sm ml-1">
          {!entry.projectId
            ? "Please select a project."
            : "Hours must be greater than 0."}
        </p>
      )}
    </div>
  )
}
