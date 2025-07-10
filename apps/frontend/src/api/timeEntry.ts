import type { TimeEntry, ProjectSummary } from "../types/api"

export async function fetchProjects(): Promise<
  Omit<ProjectSummary, "hours">[]
> {
  // To-do: Use better error handling
  const response = await fetch("/api/projects")
  if (!response.ok) {
    throw new Error("Failed to fetch projects")
  }
  return response.json()
}

export async function submitTimeEntry(data: TimeEntry[]): Promise<void> {
  await fetch("/api/time-entry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}
