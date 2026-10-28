export interface CalendarProps {
  today: string
  value?: string | null | undefined
  min?: string | undefined
  max?: string | undefined
  isDateDisabled?: ((date: string) => boolean) | undefined
  firstDayOfWeek?: number | undefined
  autoFocus?: boolean | undefined
  onSelect: (date: string) => void
}
