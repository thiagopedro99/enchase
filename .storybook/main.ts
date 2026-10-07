import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/docs/**/*.mdx', '../src/docs/stories/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: '@storybook/react-vite',
  staticDirs: ['../public'],
  core: { disableTelemetry: true },
  managerHead: (head) => `${head}<link rel="icon" type="image/svg+xml" href="enchase-marca.svg" />`
}

export default config
