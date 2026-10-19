export const defaultSize = 'md'

export const defaultStriped = false

export type Order = {
  id: string
  customer: string
  status: 'paid' | 'pending' | 'late'
  date: string
  total: number
}

export const statusLabels = { paid: 'Pago', pending: 'Pendente', late: 'Atrasado' } as const

export const statusVariants = { paid: 'success', pending: 'warning', late: 'error' } as const

export const pageSize = 5

export const orders: Order[] = [
  { id: '#1042', customer: 'Ana Souza', status: 'paid', date: '12/10/2026', total: 1289.9 },
  { id: '#1041', customer: 'Bruno Lima', status: 'pending', date: '11/10/2026', total: 349 },
  { id: '#1040', customer: 'Carla Mendes', status: 'paid', date: '11/10/2026', total: 87.5 },
  { id: '#1039', customer: 'Diego Alves', status: 'late', date: '09/10/2026', total: 2150 },
  { id: '#1038', customer: 'Elisa Prado', status: 'paid', date: '08/10/2026', total: 560.4 },
  { id: '#1037', customer: 'Fábio Rocha', status: 'pending', date: '08/10/2026', total: 99.9 },
  { id: '#1036', customer: 'Gabriela Dias', status: 'paid', date: '07/10/2026', total: 1740 },
  { id: '#1035', customer: 'Heitor Nunes', status: 'late', date: '05/10/2026', total: 312.75 },
  { id: '#1034', customer: 'Isabela Reis', status: 'paid', date: '05/10/2026', total: 45 },
  { id: '#1033', customer: 'João Teixeira', status: 'pending', date: '04/10/2026', total: 820 },
  { id: '#1032', customer: 'Karen Duarte', status: 'paid', date: '03/10/2026', total: 1999.99 },
  { id: '#1031', customer: 'Lucas Barros', status: 'paid', date: '02/10/2026', total: 275.3 }
]
