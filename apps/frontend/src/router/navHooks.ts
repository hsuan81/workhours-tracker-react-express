import { useCallback, useContext } from "react"
import { NavContext, type Page } from "./NavContext"

export function useNavigate(): (to: Page) => void {
  const ctx = useContext(NavContext)
  if (!ctx)
    throw new Error("useNavigate must be used within <NavigationProvider>")
  return useCallback((to: Page) => ctx.setPage(to), [ctx])
}

export function usePage(): Page {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error("usePage must be used within <NavigationProvider>")
  return ctx.page
}
