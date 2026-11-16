import type { BadgeProps } from 'enchase'
import type { Project } from './types.ts'

export const projects: Project[] = [
  { id: 'atlas', name: 'Atlas', status: 'live', progress: 100, owner: 'Ana Ribeiro' },
  { id: 'boreal', name: 'Boreal', status: 'review', progress: 72, owner: 'Caio Lima' },
  { id: 'cometa', name: 'Cometa', status: 'late', progress: 38, owner: 'Bia Santos' },
  { id: 'delta', name: 'Delta', status: 'review', progress: 55, owner: 'Davi Moura' }
]

export const statuses: Record<Project['status'], { label: string; variant: NonNullable<BadgeProps['variant']> }> = {
  live: { label: 'No ar', variant: 'success' },
  review: { label: 'Em revisão', variant: 'info' },
  late: { label: 'Atrasado', variant: 'warning' }
}
