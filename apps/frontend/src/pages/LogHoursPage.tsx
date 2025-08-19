import LogHoursForm from "../components/LogHoursForm"
import type { User } from "../types/types"

export default function LogHoursPage({ user }: { user: User }) {
  return (
    <div className="bg-custom-gray min-h-screen py-8">
      <h1 className="text-center text-custom-black text-xl font-bold mb-4">
        Log Working Hours
      </h1>
      <LogHoursForm loggedUser={user} />
    </div>
  )
}
