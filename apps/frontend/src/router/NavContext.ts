import { createContext } from "react"

export type Page = "login" | "dashboard" | "log" | "manager" | "admin"

type NavContextType = {
  page: Page
  setPage: (to: Page) => void
}

export const NavContext = createContext<NavContextType | null>(null)
