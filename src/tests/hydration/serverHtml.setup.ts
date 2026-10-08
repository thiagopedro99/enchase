import { renderToString } from 'react-dom/server'

import { hydrationCases, withProviders } from './cases.tsx'

import type { TestProject } from 'vitest/node'

export default function setup(project: TestProject) {
  const html = Object.fromEntries(hydrationCases.map((hydrationCase) => [hydrationCase.name, renderToString(withProviders(hydrationCase))]))

  project.provide('serverHtml', html)
}
