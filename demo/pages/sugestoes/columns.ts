import { statuses } from './defaultData.ts'

import type { Column, Filters, Suggestion } from './types.ts'

const day = 24 * 60 * 60 * 1000

const month = 30

const year = 365

const relative = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'always' })

export const ageOf = (createdAt: string, now = Date.now()) => {
  const days = Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / day))

  if (days === 0) return 'hoje'
  if (days < month) return relative.format(-days, 'day')
  if (days < year) return relative.format(-Math.floor(days / month), 'month')

  return relative.format(-Math.floor(days / year), 'year')
}

const matches = ({ title, text, area = '' }: Suggestion, term: string) => term === '' || `${title} ${text} ${area}`.toLowerCase().includes(term)

export const columnsOf = (items: Suggestion[], { query, kind, sort }: Filters): Column[] => {
  const term = query.trim().toLowerCase()
  const shown = items
    .filter((item) => kind === 'todos' || item.kind === kind)
    .filter((item) => matches(item, term))
    .sort((a, b) => (sort === 'votos' ? b.votes - a.votes || b.id - a.id : b.createdAt.localeCompare(a.createdAt)))

  return statuses.map((status) => ({ ...status, items: shown.filter((item) => item.status === status.value) }))
}

export const totalOf = (columns: Column[]) => columns.reduce((sum, { items }) => sum + items.length, 0)
