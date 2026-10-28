export interface CalendarHeaderProps {
  title: string
  titleId: string
  previousLabel?: string | undefined
  nextLabel?: string | undefined
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void
}
