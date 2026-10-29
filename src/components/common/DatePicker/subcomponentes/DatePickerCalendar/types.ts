export interface DatePickerCalendarProps {
  value: string | null
  min?: string | undefined
  max?: string | undefined
  isDateDisabled?: ((date: string) => boolean) | undefined
  firstDayOfWeek?: number | undefined
  locale?: string | undefined
  autoFocus: boolean
  onSelect: (date: string) => void
}
