import type { Locale } from './types.ts'

export const en: Locale = {
  locale: 'en',
  dir: 'ltr',
  messages: {
    closeModal: 'Close dialog',
    closeToast: 'Close notification',
    notifications: 'Notifications',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    mainNavigation: 'Main navigation',
    mobileNavigation: 'Mobile navigation',
    switchToDark: 'Switch to dark theme',
    switchToLight: 'Switch to light theme',
    loading: 'Loading',
    confirm: 'Confirm',
    cancel: 'Cancel',
    confirmAction: 'Confirm action',
    skipToContent: 'Skip to content',
    collapseSidebar: 'Collapse sidebar',
    expandSidebar: 'Expand sidebar',
    breadcrumb: 'Breadcrumb',
    showFullPath: 'Show full path',
    logout: 'Log out',
    showPassword: 'Show password',
    opensInNewTab: '(opens in a new tab)',
    hidePassword: 'Hide password',
    pagination: 'Pagination',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    increaseValue: 'Increase value',
    decreaseValue: 'Decrease value',
    removeTag: 'Remove',
    selectRow: 'Select row',
    selectAllRows: 'Select all rows',
    noResults: 'No results',
    showOptions: 'Show options',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    openCalendar: 'Open calendar',
    chooseDate: 'Choose date',
    board: 'Board',
    boardMoveCard: (card: string) => `Move ${card}`,
    boardMoveCardTo: (card: string) => `Move ${card} to`,
    boardInstructions: 'Arrows move, space drops, Esc cancels.',
    boardMoveUp: 'Move up one position',
    boardMoveDown: 'Move down one position',
    boardEmptyColumn: 'Drop a card here',
    boardEmptyColumnReadOnly: 'No cards',
    boardCardCount: (count: number) => `${count} ${count === 1 ? 'card' : 'cards'}`,
    boardPickedUp: (card: string, position: number, total: number, column: string) =>
      `${card} picked up, position ${position} of ${total} in ${column}.`,
    boardStep: (card: string, position: number, total: number, column: string) =>
      `${card}: position ${position} of ${total} in ${column}.`,
    boardDropped: (card: string, position: number, total: number, column: string) =>
      `${card} dropped: position ${position} of ${total} in ${column}.`,
    boardCancelled: (card: string, column: string) => `Move cancelled. ${card} returned to ${column}.`,
    boardMovedByMenu: (card: string, position: number, total: number, column: string) =>
      `${card} moved: position ${position} of ${total} in ${column}.`
  }
}

export default en
