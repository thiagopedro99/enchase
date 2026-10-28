import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const circles: Record<string, number> = {
  'common/Avatar/styles.module.css': 1,
  'common/Progress/styles.module.css': 1,
  'common/Slider/styles.module.css': 2,
  'common/Switch/styles.module.css': 2,
  'common/RadioGroup/styles.module.css': 2,
  'layout/subcomponentes/SidebarUser/styles.module.css': 1
}

const buttons = [
  'common/Button/styles.module.css',
  'common/Badge/styles.module.css',
  'common/Tag/styles.module.css',
  'common/Alert/styles.module.css',
  'common/Breadcrumbs/styles.module.css',
  'common/Combobox/subcomponentes/ComboboxOptions/styles.module.css',
  'common/Combobox/subcomponentes/ComboboxToggle/styles.module.css',
  'common/DatePicker/subcomponentes/DatePickerToggle/styles.module.css',
  'common/DatePicker/subcomponentes/Calendar/subcomponentes/CalendarGrid/styles.module.css',
  'common/DatePicker/subcomponentes/Calendar/subcomponentes/CalendarHeader/styles.module.css',
  'common/Drawer/styles.module.css',
  'common/Input/styles.module.css',
  'common/Menu/styles.module.css',
  'common/Modal/styles.module.css',
  'common/NumberInput/styles.module.css',
  'common/SegmentedControl/styles.module.css',
  'common/Sidebar/styles.module.css',
  'common/ThemeToggle/styles.module.css',
  'layout/subcomponentes/AppBar/styles.module.css',
  'layout/subcomponentes/SidebarUser/styles.module.css',
  'navbar/styles.module.css',
  'toast/styles.module.css'
]

const root = path.resolve(__dirname, '../../components')

const cssFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)

    return statSync(full).isDirectory() ? cssFiles(full) : full.endsWith('.module.css') ? [full] : []
  })

const relative = (file: string) => path.relative(root, file).split(path.sep).join('/')

const countOf = (css: string, variable: string) => css.split(`var(--enchase-radius-${variable})`).length - 1

describe('the radius of the pills', () => {
  const files = cssFiles(root).map((file) => [relative(file), readFileSync(file, 'utf8')] as const)

  it('uses the full radius only where the shape must stay round, whatever the preset', () => {
    const used = Object.fromEntries(files.filter(([, css]) => countOf(css, 'full') > 0).map(([name, css]) => [name, countOf(css, 'full')]))

    expect(used).toEqual(circles)
  })

  it('gives the shape of buttons, badges and menu items to the button role, so a shape preset reaches them', () => {
    const missing = buttons.filter((name) => countOf(files.find(([file]) => file === name)?.[1] ?? '', 'button') === 0)

    expect(missing).toEqual([])
  })

  it('keeps the hook of the Button that reads its own radius before the role', () => {
    const css = files.find(([name]) => name === 'common/Button/styles.module.css')?.[1] ?? ''

    expect(css).toContain('var(--enchase-button-radius, var(--enchase-radius-button))')
  })
})
