export function getMonthName(monthNumber: number, locale: string = "en-US") {
  // monthNumber: 0–11
  return new Intl.DateTimeFormat(locale, { month: "long" }).format(
    new Date(2000, monthNumber)
  )
}
