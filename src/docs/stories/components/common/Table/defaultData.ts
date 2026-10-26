export const defaultSize = 'md'

export const defaultStriped = false

export type Order = {
  id: string
  customer: string
  status: 'paid' | 'pending' | 'late'
  date: string
  total: number
}

export const statusLabels = { paid: 'Paid', pending: 'Pending', late: 'Late' } as const

export const statusVariants = { paid: 'success', pending: 'warning', late: 'error' } as const

export const pageSize = 5

export const orders: Order[] = [
  { id: '#1042', customer: 'Alice Johnson', status: 'paid', date: '2026-10-12', total: 1289.9 },
  { id: '#1041', customer: 'Ben Carter', status: 'pending', date: '2026-10-11', total: 349 },
  { id: '#1040', customer: 'Chloe Martin', status: 'paid', date: '2026-10-11', total: 87.5 },
  { id: '#1039', customer: 'Daniel Foster', status: 'late', date: '2026-10-09', total: 2150 },
  { id: '#1038', customer: 'Emma Brooks', status: 'paid', date: '2026-10-08', total: 560.4 },
  { id: '#1037', customer: 'Felix Hayes', status: 'pending', date: '2026-10-08', total: 99.9 },
  { id: '#1036', customer: 'Grace Bennett', status: 'paid', date: '2026-10-07', total: 1740 },
  { id: '#1035', customer: 'Henry Walsh', status: 'late', date: '2026-10-05', total: 312.75 },
  { id: '#1034', customer: 'Isla Morgan', status: 'paid', date: '2026-10-05', total: 45 },
  { id: '#1033', customer: 'Jack Turner', status: 'pending', date: '2026-10-04', total: 820 },
  { id: '#1032', customer: 'Kate Sullivan', status: 'paid', date: '2026-10-03', total: 1999.99 },
  { id: '#1031', customer: 'Liam Parker', status: 'paid', date: '2026-10-02', total: 275.3 }
]
