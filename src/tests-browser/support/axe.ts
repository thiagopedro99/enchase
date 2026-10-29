import axe from 'axe-core'

import type { ElementContext } from 'axe-core'

const pageRules = {
  region: 'a component is audited alone, so its content has no page landmarks around it',
  'landmark-one-main': 'a page rule: the test page has no main landmark of its own',
  'page-has-heading-one': 'a page rule: the test page has no h1 of its own',
  bypass: 'a page rule: there is no block of repeated content to skip'
} as const

const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']

export const accessibilityViolations = async (context: ElementContext) => {
  const rules = Object.fromEntries([['color-contrast', { enabled: true }], ...Object.keys(pageRules).map((id) => [id, { enabled: false }])])
  const results = await axe.run(context, { runOnly: { type: 'tag', values: tags }, rules })

  return results.violations.flatMap((rule) => rule.nodes.map((node) => `${rule.id}: ${node.target.join(' ')}: ${node.failureSummary ?? ''}`))
}
