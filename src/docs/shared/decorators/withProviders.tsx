import { ColorModeProvider, GlobalStyles, ToastProvider, UIProvider } from 'enchase'
import { enchase } from 'enchase/styles/enchase'

import { DensityAttribute } from '../components/DensityAttribute.tsx'
import { storyStyles } from '../styles.ts'

import type { Decorator } from '@storybook/react-vite'
import type { ThemeInput } from 'enchase/theme'

const themes: Record<string, ThemeInput | undefined> = Object.fromEntries(Object.entries(storyStyles).map(([name, style]) => [name, style === enchase ? undefined : { style }]))

export const withProviders: Decorator = (Story, context) => {
  const theme = context.globals.theme === 'dark' ? 'dark' : 'light'
  const motion = context.globals.motion === 'never' ? 'never' : 'auto'
  const density = context.globals.density === 'compact' ? 'compact' : 'default'

  return (
    <ColorModeProvider mode={theme} theme={themes[String(context.globals.style)]}>
      <DensityAttribute density={density} />
      <GlobalStyles />
      <UIProvider motion={{ mode: motion }}>
        {context.parameters.ownToastProvider === true ? (
          <Story />
        ) : (
          <ToastProvider>
            <Story />
          </ToastProvider>
        )}
      </UIProvider>
    </ColorModeProvider>
  )
}
