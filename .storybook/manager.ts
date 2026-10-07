import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Enchase',
    brandUrl: './',
    brandImage: 'enchase-logo.svg',
    brandTarget: '_self',
    colorPrimary: '#4F46E5',
    colorSecondary: '#4F46E5'
  })
})
