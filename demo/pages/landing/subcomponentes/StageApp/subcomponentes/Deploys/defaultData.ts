import type { BadgeProps, SegmentedControlItem } from 'enchase'
import type { Deploy } from './types.ts'

export const deploys: Deploy[] = [
  { id: 'd1', name: 'atlas-web', branch: 'main', status: 'live', author: 'Ana Ribeiro' },
  { id: 'd2', name: 'atlas-api', branch: 'feat/faturas', status: 'building', author: 'Caio Lima' },
  { id: 'd3', name: 'atlas-docs', branch: 'main', status: 'live', author: 'Bia Santos' },
  { id: 'd4', name: 'atlas-jobs', branch: 'fix/fila', status: 'failed', author: 'Davi Moura' }
]

export const statuses: Record<Deploy['status'], { label: string; variant: NonNullable<BadgeProps['variant']> }> = {
  live: { label: 'No ar', variant: 'success' },
  building: { label: 'Construindo', variant: 'info' },
  failed: { label: 'Falhou', variant: 'error' }
}

export const periods: SegmentedControlItem[] = [
  { value: 'day', label: 'Dia' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' }
]

export const defaultPeriod = 'week'
