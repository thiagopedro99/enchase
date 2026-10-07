import '@fontsource-variable/figtree'

import { withProviders } from '@docs/shared/decorators/withProviders.tsx'
import { globalTypes, initialGlobals, parameters } from '@docs/shared/parameters.ts'

import type { Preview } from '@storybook/react-vite'

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [withProviders],
  globalTypes,
  initialGlobals,
  parameters
}

export default preview
