import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const hoverQuery = '@media (hover: hover) and (pointer: fine)'

const filesUnder = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)

    return statSync(full).isDirectory() ? filesUnder(full) : full.endsWith('.module.css') ? [full] : []
  })

const ungatedHovers = (css: string) => {
  const stack: boolean[] = []
  const found: string[] = []
  let selector = ''

  for (const char of css) {
    if (char === '{') {
      const gated = selector.includes(hoverQuery) || stack.some(Boolean)

      if (selector.includes(':hover') && !gated) found.push(selector.trim().replace(/\s+/g, ' '))
      stack.push(selector.includes(hoverQuery))
      selector = ''
    } else if (char === '}') {
      stack.pop()
      selector = ''
    } else if (char === ';') {
      selector = ''
    } else {
      selector += char
    }
  }

  return found
}

const baseline: Record<string, number> = {
  'common/Breadcrumbs': 2,
  'common/Card': 1,
  'common/Sidebar': 2,
  'common/ThemeToggle': 1,
  'footer': 1,
  'layout/subcomponentes/AppBar': 1,
  'layout/subcomponentes/Brand': 1,
  'layout/subcomponentes/SidebarUser': 1,
  'navbar': 4,
  'toast': 1
}

describe('hover gating', () => {
  const root = path.resolve(__dirname, '../../components')
  const counts = Object.fromEntries(
    filesUnder(root)
      .map((file) => [path.relative(root, path.dirname(file)).replace(/\\/g, '/'), ungatedHovers(readFileSync(file, 'utf8')).length] as const)
      .filter(([, count]) => count > 0)
  )

  it('detects an ungated hover rule', () => {
    expect(ungatedHovers('.a:hover { color: red; }')).toHaveLength(1)
    expect(ungatedHovers(`${hoverQuery} { .a:hover { color: red; } }`)).toHaveLength(0)
  })

  it('never adds an ungated :hover to a component that is not in the baseline', () => {
    const added = Object.keys(counts).filter((folder) => !(folder in baseline))

    expect(added).toEqual([])
  })

  it('never lets a component in the baseline grow, and drops it from the baseline once fixed', () => {
    const changed = Object.entries(baseline).filter(([folder, count]) => (counts[folder] ?? 0) !== count)

    expect(changed).toEqual([])
  })
})
