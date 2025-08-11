import { useState, type ReactNode } from "react"
import { NavContext, type Page } from "./NavContext"

export default function NavigationProvider({
  children,
}: {
  children: ReactNode
}) {
  const [page, setPage] = useState<Page>("login")
  return (
    <NavContext.Provider value={{ page, setPage }}>
      {children}
    </NavContext.Provider>
  )
}
