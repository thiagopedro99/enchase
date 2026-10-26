import { Button, Card, ColorModeProvider, ThemeToggle, useColorMode } from 'enchase'
import { shadcn } from 'enchase/styles/shadcn'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'

const Preview = () => {
  const { mode, resolvedMode } = useColorMode()

  return (
    <Card variant="outlined" style={{ display: 'grid', gap: '1rem', justifyItems: 'start' }}>
      <span>{`mode: ${mode} / resolvedMode: ${resolvedMode}`}</span>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <ThemeToggle />
        <Button variant="primary">Primary</Button>
        <Button variant="outline">Outline</Button>
      </div>
    </Card>
  )
}

const Stage = ({ theme, mode, defaultMode, onModeChange, storageKey, cssLayer }: ComponentProps<typeof ColorModeProvider>) => {
  const { mode: outerMode } = useColorMode()

  return (
    <ColorModeProvider theme={theme} mode={mode ?? outerMode} defaultMode={defaultMode} onModeChange={onModeChange} storage={null} storageKey={storageKey} cssLayer={cssLayer}>
      <Preview />
    </ColorModeProvider>
  )
}

const meta = {
  title: 'System/ColorModeProvider',
  component: ColorModeProvider,
  args: { children: undefined },
  argTypes: {
    children: { description: 'The app.', control: false },
    theme: {
      description: 'Custom theme, such as `{ style, brand, fonts, motion, shape, radius, light, dark }`, the same input that `createTheme` accepts: `style` changes the look of the whole kit (a style imported from `enchase/styles/<name>`, such as `shadcn`), the brand color (`brand`) generates the palette, `shape` picks the shape of the corners (`pill`, `soft` or `square`), `radius` adjusts a radius, and `light` and `dark` adjust colors per mode. What you pass wins over `style`. Every value is validated, and in development the provider warns in the console about contrast and duration. Without it, the default theme applies.',
      control: 'object'
    },
    mode: {
      description: 'Controlled mode: `light`, `dark` or `system`. With it, the provider does not save the choice, and you change the value in `onModeChange`.',
      control: 'inline-radio',
      options: ['light', 'dark', 'system']
    },
    defaultMode: {
      description: 'Mode used while there is no saved choice and no `mode` prop. `system` follows the preference of the system.',
      control: 'inline-radio',
      options: ['light', 'dark', 'system'],
      table: { defaultValue: { summary: 'system' } }
    },
    onModeChange: {
      description: 'Called with the new mode when `setMode` or `toggleMode` is used, including with a controlled `mode`.',
      control: false
    },
    storage: {
      description: 'Where to save the choice, with `getItem` and `setItem`. The default is `localStorage`, read only after mounting. `null` turns off persistence.',
      control: false,
      table: { type: { summary: '{ getItem, setItem } | null' }, defaultValue: { summary: 'localStorage' } }
    },
    storageKey: {
      description: 'Key of the choice in the storage. Use the same one in the `ColorModeScript`.',
      control: 'text',
      table: { defaultValue: { summary: 'enchase-color-mode' } }
    },
    cssLayer: {
      description: 'Name of an `@layer` for the theme variables. Use it with `enchase/styles.layer.css`, as in `cssLayer="enchase-theme"`.',
      control: 'text'
    }
  },
  parameters: {
    docs: {
      description: {
        component: 'Applies the theme: it injects the `--enchase-*` variables, sets `data-theme` and `color-scheme` on the `<html>` and saves the mode (`light`, `dark` or `system`). The components read the variables, and `useColorMode` returns `{ mode, resolvedMode, setMode, toggleMode }`.'
      }
    }
  },
  render: (args) => <Stage {...args} />
} satisfies Meta<typeof ColorModeProvider>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithBrandColor: Story = {
  args: { theme: { brand: '#0b6bcb' } }
}

export const WithStyle: Story = {
  args: { theme: { style: shadcn } }
}
