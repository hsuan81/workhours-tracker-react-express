import { useEffect, useState, useRef } from "react";
import { submitTimeEntry } from "../api/timeEntry";
import type { Project, TimeEntry } from "../types/api";

const userId = "user-001"; // Mock user id

const projectsMock: Project[] = [{id: "A", name: "Proj A"}, {id: "B", name: "Proj B"}]

export default function LogHoursForm() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<{ [projectId: string]: number }>({});
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10)); // yyyy-mm-dd
  const originalEntriesRef = useRef<{[projectId: string]: number}>({});
//   const [originalEntries, setOriginalEntries] = useState<{[projectId: string]: number}>({});

  useEffect(() => {
    setProjects(projectsMock);
    // fetchProjects().then(setProjects);
  }, []);

  useEffect(() => {
    const fetchTimeEntry = async () => {
    //   const res = await fetch(`/api/time-entry?date=${date}`);
    //   const data: TimeEntry[] = await res.json();

    //   const mapped: Record<string, number> = {};
    //   data.forEach(entry => {
    //     mapped[entry.projectId] = entry.hours;
    //   });
    //   setEntries(mapped);
    setEntries({"A": 2,
      "B": 3
    }); // Mock data for testing
    // setOriginalEntries({"A": 2, "B": 3}); // Mock data for testing
    originalEntriesRef.current = {"A": 2, "B": 3}; // Mock data for testing
    };

    fetchTimeEntry();
  }, [date]);

  const handleChange = (projectId: string, value: string) => {
    setEntries({ ...entries, [projectId]: parseFloat(value) || 0 });
  };

  const totalHours = Object.values(entries).reduce((a, b) => a + b, 0);
  const regularHours = Math.min(totalHours, 8);
  const overtimeHours = Math.max(totalHours - 8, 0);
  const rate = 25;
  const dailyPay = overtimeHours * rate * 1.33;

  const handleSubmit = async () => {
    const payload: TimeEntry[] = Object.entries(entries).map(([projectId, hours]) => ({
      userId,
      projectId,
      date,
      hours,
    }));
    await submitTimeEntry(payload);
    setEntries(entries)
    originalEntriesRef.current = { ...entries }; // Update original entries
    // setOriginalEntries(entries);
    alert("Saved!");
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4 bg-black shadow-md rounded">
      <div className="flex justify-between items-center">
        <input
          type="date"
          className="border p-2 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <div className="space-x-2">
          <button onClick={handleSubmit} className="bg-blue-500 text-white px-3 py-1 rounded">Save Entry</button>
          <button onClick={() => setEntries(originalEntriesRef.current)} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
        </div>
      </div>

      <div className="bg-black">
        <h2 className="font-semibold mb-2">Project Hours Entry</h2>
        <div className="space-y-2">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center gap-2">
              <label className="w-32">{project.name}:</label>
              <input
                type="number"
                className="border px-2 py-1 rounded w-24"
                value={entries[project.id] || ""}
                onChange={(e) => handleChange(project.id, e.target.value)}
              />
              <span>hours</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-sm">
        <h3 className="font-semibold">Daily Summary</h3>
        <p>Total Hours: {totalHours.toFixed(1)}</p>
        <p>Regular Hours: {regularHours.toFixed(1)}</p>
        <p>Overtime Hours: {overtimeHours.toFixed(1)} (${rate} × 1.33/hr) = ${(overtimeHours * rate * 1.33).toFixed(2)}</p>
        <p className="font-bold">Overtime Pay: ${dailyPay.toFixed(2)}</p>
      </div>
    </div>
  );
}