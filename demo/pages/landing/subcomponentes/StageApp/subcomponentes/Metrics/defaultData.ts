import type { BadgeProps } from 'enchase'

export const metrics: { id: string; label: string; value: string; change: string; variant: NonNullable<BadgeProps['variant']>; progress: number }[] = [
  { id: 'revenue', label: 'Receita do mês', value: 'R$ 48,2 mil', change: '+12%', variant: 'success', progress: 78 },
  { id: 'users', label: 'Pessoas ativas', value: '2.431', change: '+184', variant: 'info', progress: 64 },
  { id: 'uptime', label: 'Disponibilidade', value: '99,98%', change: 'Estável', variant: 'neutral', progress: 99 }
]
