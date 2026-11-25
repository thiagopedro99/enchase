import type { BoardColumn, BoardMove } from 'enchase/experimental/board'

export type BoardCard = { id: string; columnId: string; title: string }

export const defaultSortable = true

export const defaultReadOnly = false

export const defaultColumns: BoardColumn[] = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'In progress' },
  { id: 'review', title: 'In review' },
  { id: 'done', title: 'Done' }
]

export const defaultCards: BoardCard[] = [
  { id: '1', columnId: 'todo', title: 'Write the onboarding email' },
  { id: '2', columnId: 'todo', title: 'Pick a color for the new badge' },
  { id: '3', columnId: 'doing', title: 'Fix the invoice PDF margins' },
  { id: '4', columnId: 'doing', title: 'Add pagination to the orders table' },
  { id: '5', columnId: 'review', title: 'Review the pricing page copy' },
  { id: '6', columnId: 'done', title: 'Set up the staging environment' },
  { id: '7', columnId: 'done', title: 'Migrate the login page to the new design' }
]

export const manyCards: BoardCard[] = Array.from({ length: 18 }, (_, index) => ({ id: `many-${index + 1}`, columnId: 'todo', title: `Task ${index + 1}` }))

export const applyMove = (cards: BoardCard[], move: BoardMove<BoardCard>): BoardCard[] => {
  const grouped = new Map<string, BoardCard[]>()

  for (const card of cards.filter((candidate) => candidate.id !== move.item.id)) grouped.set(card.columnId, [...(grouped.get(card.columnId) ?? []), card])

  const target = grouped.get(move.to.columnId) ?? []
  target.splice(move.to.index, 0, { ...move.item, columnId: move.to.columnId })
  grouped.set(move.to.columnId, target)

  return [...grouped.values()].flat()
}
