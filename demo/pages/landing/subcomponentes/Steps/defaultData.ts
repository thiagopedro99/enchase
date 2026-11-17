import { installCommand } from '../../defaultData.ts'

import type { CodeLanguage } from '../CodeBlock/types.ts'

export const steps: { id: string; title: string; text: string; blocks: { label: string; language: CodeLanguage; code: string }[] }[] = [
  {
    id: 'install',
    title: 'Instale',
    text: 'Um pacote, sem dependências além do React 19.',
    blocks: [{ label: 'Terminal', language: 'bash', code: `$ ${installCommand}` }]
  },
  {
    id: 'provide',
    title: 'Envolva o app',
    text: 'O provedor entrega o tema e o modo de cor. Uma cor de marca já gera as paletas clara e escura.',
    blocks: [
      {
        label: 'main.tsx',
        language: 'tsx',
        code: `import { ColorModeProvider, GlobalStyles, UIProvider } from 'enchase'
import 'enchase/styles.css'

<ColorModeProvider theme={{ brand: '#0F766E' }}>
  <GlobalStyles />
  <UIProvider>
    <App />
  </UIProvider>
</ColorModeProvider>`
      }
    ]
  },
  {
    id: 'use',
    title: 'Use. E mude com CSS normal',
    text: 'Cada regra da biblioteca pesa mais que um nome de elemento e menos que uma classe sua. Sem !important e sem decorar a ordem dos imports.',
    blocks: [
      {
        label: 'styles.module.css',
        language: 'css',
        code: `.salvar {
  border-radius: var(--enchase-radius-sm);
  background: var(--enchase-color-inverse-surface);
  color: var(--enchase-color-inverse-on-surface);
}`
      },
      {
        label: 'Salvar.tsx',
        language: 'tsx',
        code: `import { Button } from 'enchase'
import styles from './styles.module.css'

<Button className={styles.salvar}>Salvar</Button>`
      }
    ]
  }
]
