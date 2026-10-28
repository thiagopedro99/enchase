import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const prefixes: Record<string, string> = {
  'common/Alert/styles.module.css': 'alert',
  'common/Breadcrumbs/styles.module.css': 'breadcrumbs',
  'common/Button/styles.module.css': 'button',
  'common/Card/styles.module.css': 'card',
  'common/CardButton/styles.module.css': 'card',
  'common/Checkbox/styles.module.css': 'checkbox',
  'common/Drawer/styles.module.css': 'drawer',
  'common/Icon/swap.module.css': 'icon-swap',
  'common/Input/styles.module.css': 'input',
  'common/Link/styles.module.css': 'link',
  'common/Loading/styles.module.css': 'loading',
  'common/Menu/styles.module.css': 'menu',
  'common/Modal/styles.module.css': 'modal',
  'common/NumberInput/styles.module.css': 'number-input',
  'common/Pagination/styles.module.css': 'pagination',
  'common/Popover/styles.module.css': 'popover',
  'common/Progress/styles.module.css': 'progress',
  'common/SegmentedControl/styles.module.css': 'segmented-control',
  'common/Select/styles.module.css': 'select',
  'common/Sidebar/styles.module.css': 'sidebar',
  'common/Skeleton/styles.module.css': 'skeleton',
  'common/Slider/styles.module.css': 'slider',
  'common/Switch/styles.module.css': 'switch',
  'common/Tag/styles.module.css': 'tag',
  'common/RadioGroup/styles.module.css': 'radio-group',
  'common/Tabs/styles.module.css': 'tabs',
  'common/Accordion/styles.module.css': 'accordion',
  'common/Textarea/styles.module.css': 'textarea',
  'common/ThemeToggle/styles.module.css': 'theme-toggle',
  'common/Tooltip/styles.module.css': 'tooltip',
  'footer/styles.module.css': 'footer',
  'layout/subcomponentes/AppBar/styles.module.css': 'app-bar',
  'navbar/styles.module.css': 'navbar',
  'toast/styles.module.css': 'toast'
}

const exempt = ['layout/subcomponentes/SidebarUser/styles.module.css']

const root = path.resolve(__dirname, '../../components')

const cssFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)

    return statSync(full).isDirectory() ? cssFiles(full) : full.endsWith('.module.css') ? [full] : []
  })

const relative = (file: string) => path.relative(root, file).split(path.sep).join('/')

const animated = (css: string) => /(^|[\s;{])(transition|animation)[\s:-]/.test(css) || css.includes('--enchase-motion-')

describe('motion variables per component', () => {
  const files = cssFiles(root).filter((file) => animated(readFileSync(file, 'utf8')))

  it('names a prefix for every css module that animates', () => {
    expect(files.map(relative).filter((name) => !(name in prefixes) && !exempt.includes(name))).toEqual([])
  })

  for (const [name, prefix] of Object.entries(prefixes)) {
    it(`${name} reads --enchase-${prefix}-duration and never a bare motion token`, () => {
      const css = readFileSync(path.join(root, name), 'utf8')

      expect(css).toContain(`--enchase-${prefix}-duration`)
      expect(css.match(/(?<!, )var\(--enchase-motion-(duration|ease)-[\w-]+\)/g)).toBeNull()
    })
  }

  it('reads an ease variable wherever it uses an easing token', () => {
    for (const [name, prefix] of Object.entries(prefixes)) {
      const css = readFileSync(path.join(root, name), 'utf8')

      if (css.includes('--enchase-motion-ease-')) expect(css, name).toContain(`--enchase-${prefix}-ease`)
    }
  })
})
