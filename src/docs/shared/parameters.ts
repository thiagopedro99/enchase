import { storyDensityNames, storyDensityTitles } from './densities.ts'
import { storyStyleNames, storyStyleTitles } from './styles.ts'

import type { Preview } from '@storybook/react-vite'

export const globalTypes: NonNullable<Preview['globalTypes']> = {
  theme: {
    description: 'Theme',
    toolbar: {
      title: 'Theme',
      icon: 'circlehollow',
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' }
      ],
      dynamicTitle: true
    }
  },
  style: {
    description: 'Visual style',
    toolbar: {
      title: 'Style',
      icon: 'paintbrush',
      items: storyStyleNames.map((value) => ({ value, title: storyStyleTitles[value] })),
      dynamicTitle: true
    }
  },
  density: {
    description: 'Density',
    toolbar: {
      title: 'Density',
      icon: 'collapse',
      items: storyDensityNames.map((value) => ({ value, title: storyDensityTitles[value] })),
      dynamicTitle: true
    }
  },
  motion: {
    description: 'Motion mode',
    toolbar: {
      title: 'Motion',
      icon: 'play',
      items: [
        { value: 'auto', title: 'Automatic' },
        { value: 'never', title: 'No motion' }
      ],
      dynamicTitle: true
    }
  }
}

export const initialGlobals = { theme: 'light', style: 'enchase', density: 'default', motion: 'auto' }

export const parameters: NonNullable<Preview['parameters']> = {
  layout: 'centered',
  controls: { expanded: true },
  options: {
    storySort: { order: ['Introduction', 'Foundations', 'System', 'Components'] }
  }
}
