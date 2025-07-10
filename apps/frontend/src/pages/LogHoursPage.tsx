import LogHoursForm from "../components/LogHoursForm";

export default function LogHoursPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <h1 className="text-center text-xl font-bold mb-4">Log Working Hours</h1>
      <LogHoursForm />
    </div>
  );
}