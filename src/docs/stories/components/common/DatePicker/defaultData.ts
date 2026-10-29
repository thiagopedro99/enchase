export const defaultFullWidth = false

export const defaultOpen = false

export const firstWeekday = 1

export const minDate = '2026-10-05'

export const maxDate = '2026-10-25'

export const isWeekend = (date: string) => {
  const weekday = new Date(`${date}T12:00:00`).getDay()

  return weekday === 0 || weekday === 6
}

export const dateFormats: Record<string, string> = {
  en: 'mm/dd/yyyy',
  'en-GB': 'dd/mm/yyyy',
  'en-CA': 'yyyy-mm-dd',
  de: 'dd.mm.yyyy',
  ja: 'yyyy/mm/dd'
}
