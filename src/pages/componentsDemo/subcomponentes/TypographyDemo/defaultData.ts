import type { TypeScaleEntry, WeightToken } from './types.ts'

export const typeScale: TypeScaleEntry[] = [
  { token: '5xl', role: 'Display', sample: 'Interfaces claras' },
  { token: '4xl', role: 'Título 1', sample: 'Design system moderno' },
  { token: '3xl', role: 'Título 2', sample: 'Componentes acessíveis' },
  { token: '2xl', role: 'Título 3', sample: 'Movimento com propósito' },
  { token: 'xl', role: 'Título 4', sample: 'Tokens consistentes em todo o projeto' },
  { token: 'lg', role: 'Corpo grande', sample: 'Componentes React prontos para começar a construir.' },
  { token: 'base', role: 'Corpo', sample: 'Texto de leitura com contraste validado em WCAG 2.2 AA.' },
  { token: 'sm', role: 'Rótulo', sample: 'Rótulos, ajudas e botões usam este tamanho.' },
  { token: 'xs', role: 'Legenda', sample: 'Legendas e mensagens de erro de campo.' }
]

export const weights: WeightToken[] = ['regular', 'medium', 'semibold', 'bold']
