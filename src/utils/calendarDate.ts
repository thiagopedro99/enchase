export type CalendarDate = { year: number; month: number; day: number }

const firstYear = 1

const lastYear = 9999

const pad = (value: number, length: number) => String(value).padStart(length, '0')

const isoPattern = /^(\d{4})-(\d{2})-(\d{2})$/

export const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0

export const daysInMonth = (year: number, month: number) => (month === 2 ? (isLeapYear(year) ? 29 : 28) : [4, 6, 9, 11].includes(month) ? 30 : 31)

export const isValidDate = ({ year, month, day }: CalendarDate) =>
  Number.isInteger(year) && Number.isInteger(month) && Number.isInteger(day) && year >= firstYear && year <= lastYear && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month)

export const parseIsoDate = (text: string): CalendarDate | null => {
  const match = isoPattern.exec(text)

  if (!match) return null

  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }

  return isValidDate(date) ? date : null
}

export const formatIsoDate = ({ year, month, day }: CalendarDate) => `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`

const daysFromCivil = ({ year, month, day }: CalendarDate) => {
  const shifted = month <= 2 ? year - 1 : year
  const era = Math.floor(shifted / 400)
  const yearOfEra = shifted - era * 400
  const dayOfYear = Math.floor((153 * (month > 2 ? month - 3 : month + 9) + 2) / 5) + day - 1
  const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear

  return era * 146097 + dayOfEra - 719468
}

const civilFromDays = (count: number): CalendarDate => {
  const shifted = count + 719468
  const era = Math.floor(shifted / 146097)
  const dayOfEra = shifted - era * 146097
  const yearOfEra = Math.floor((dayOfEra - Math.floor(dayOfEra / 1460) + Math.floor(dayOfEra / 36524) - Math.floor(dayOfEra / 146096)) / 365)
  const dayOfYear = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100))
  const monthIndex = Math.floor((5 * dayOfYear + 2) / 153)
  const month = monthIndex < 10 ? monthIndex + 3 : monthIndex - 9

  return { year: yearOfEra + era * 400 + (month <= 2 ? 1 : 0), month, day: dayOfYear - Math.floor((153 * monthIndex + 2) / 5) + 1 }
}

const earliest = daysFromCivil({ year: firstYear, month: 1, day: 1 })

const latest = daysFromCivil({ year: lastYear, month: 12, day: 31 })

export const addDays = (date: CalendarDate, amount: number) => civilFromDays(Math.min(Math.max(daysFromCivil(date) + amount, earliest), latest))

export const dayOfWeek = (date: CalendarDate) => (((daysFromCivil(date) + 4) % 7) + 7) % 7

export const addMonths = (date: CalendarDate, amount: number): CalendarDate => {
  const total = date.year * 12 + date.month - 1 + amount
  const year = Math.floor(total / 12)

  if (year < firstYear) return { year: firstYear, month: 1, day: 1 }
  if (year > lastYear) return { year: lastYear, month: 12, day: 31 }

  const month = total - year * 12 + 1

  return { year, month, day: Math.min(date.day, daysInMonth(year, month)) }
}

export const addYears = (date: CalendarDate, amount: number) => addMonths(date, amount * 12)

export const compareDates = (first: CalendarDate, second: CalendarDate) => first.year - second.year || first.month - second.month || first.day - second.day

export const isSameDate = (first: CalendarDate, second: CalendarDate) => compareDates(first, second) === 0

export const isSameMonth = (first: CalendarDate, second: CalendarDate) => first.year === second.year && first.month === second.month

export const startOfMonth = ({ year, month }: CalendarDate): CalendarDate => ({ year, month, day: 1 })

export const endOfMonth = ({ year, month }: CalendarDate): CalendarDate => ({ year, month, day: daysInMonth(year, month) })

export const startOfWeek = (date: CalendarDate, firstDay: number) => addDays(date, -((dayOfWeek(date) - firstDay + 7) % 7))

export const endOfWeek = (date: CalendarDate, firstDay: number) => addDays(startOfWeek(date, firstDay), 6)

export const clampDate = (date: CalendarDate, min?: CalendarDate | null, max?: CalendarDate | null) => {
  if (min && compareDates(date, min) < 0) return min
  if (max && compareDates(date, max) > 0) return max

  return date
}

export const isWithin = (date: CalendarDate, min?: CalendarDate | null, max?: CalendarDate | null) => (!min || compareDates(date, min) >= 0) && (!max || compareDates(date, max) <= 0)

export const monthWeeks = (date: CalendarDate, firstDay: number, weeks = 6) => {
  const start = startOfWeek(startOfMonth(date), firstDay)

  return Array.from({ length: weeks }, (_, week) => Array.from({ length: 7 }, (__, day) => addDays(start, week * 7 + day)))
}

export const todayDate = (): CalendarDate => {
  const now = new Date()

  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
}
