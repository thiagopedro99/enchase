import { describe, expect, it } from 'vitest'

const componentSources = Object.keys(import.meta.glob('/src/components/**/*.{ts,tsx}')).map((path) => path.replace('/src/components/', ''))
const componentTests = Object.keys(import.meta.glob('/src/tests/components/**/*.test.{ts,tsx}')).map((path) => path.replace('/src/tests/components/', ''))

const withoutExtension = (path: string) => path.replace(/\.(ts|tsx)$/, '')

const exemptions: Record<string, string> = {
  'footer': 'static markup without behavior',
  'uiProvider': 'covered through renderWithProviders in every test',
  'common/Container': 'pure layout primitive',
  'common/Flex': 'pure layout primitive',
  'common/Grid': 'pure layout primitive',
  'common/VisuallyHidden': 'covered through the components that use it',
  'layout/subcomponentes/AppSidebar': 'covered by the Layout tests',
  'layout/subcomponentes/Brand': 'covered by the Layout tests'
}

const componentFolders = componentSources
  .filter((path) => path.endsWith('/index.tsx'))
  .map((path) => path.replace(/\/index\.tsx$/, ''))
  .filter((folder) => folder !== '')

const sourceKeys = new Set(componentSources.map(withoutExtension))

describe('tests mirror the components folder', () => {
  it('has a mirror test for every component unless exempt', () => {
    const testedFolders = new Set(componentTests.filter((path) => path.endsWith('/index.test.tsx')).map((path) => path.replace(/\/index\.test\.tsx$/, '')))
    const missing = componentFolders.filter((folder) => !testedFolders.has(folder) && !(folder in exemptions))

    expect(missing).toEqual([])
  })

  it('has no test without a matching source file', () => {
    const orphans = componentTests.filter((path) => !sourceKeys.has(path.replace(/\.test\.(ts|tsx)$/, '')))

    expect(orphans).toEqual([])
  })

  it('has no exemption for a component that is gone or already tested', () => {
    const testedFolders = new Set(componentTests.filter((path) => path.endsWith('/index.test.tsx')).map((path) => path.replace(/\/index\.test\.tsx$/, '')))
    const stale = Object.keys(exemptions).filter((folder) => !componentFolders.includes(folder) || testedFolders.has(folder))

    expect(stale).toEqual([])
  })
})
