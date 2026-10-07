import type { CommandEntry } from './types.ts'

export const commandEntries: CommandEntry[] = [
  { label: 'Desenvolvimento:', command: 'npm run dev' },
  { label: 'Build para produção:', command: 'npm run build' },
  { label: 'Preview da build:', command: 'npm run preview' },
  { label: 'Lint (verificar código):', command: 'npm run lint' },
  { label: 'Type check:', command: 'npm run type-check' }
]
