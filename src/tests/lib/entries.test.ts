import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

import * as main from 'enchase'
import * as icons from 'enchase/icons'
import * as locales from 'enchase/locales'
import * as enchaseStyle from 'enchase/styles/enchase'
import * as shadcnStyle from 'enchase/styles/shadcn'
import * as theme from 'enchase/theme'

const typeExportsOf = (file: string) => {
  const source = ts.createSourceFile(file, readFileSync(path.resolve(__dirname, '../../..', file), 'utf8'), ts.ScriptTarget.Latest, true)

  return source.statements.filter(ts.isExportDeclaration).flatMap((statement) => (statement.isTypeOnly && statement.exportClause && ts.isNamedExports(statement.exportClause) ? statement.exportClause.elements.map((element) => element.name.text) : []))
}

describe('public entries', () => {
  it('exports the components, providers and hooks from enchase', () => {
    for (const name of ['Button', 'Textarea', 'Badge', 'Alert', 'Switch', 'RadioGroup', 'Tabs', 'Accordion', 'Pagination', 'Table', 'NumberInput', 'Modal', 'Popover', 'Sidebar', 'Layout', 'Navbar', 'Footer', 'Icon', 'Link', 'CardButton', 'CardLink', 'UIProvider', 'ColorModeProvider', 'ToastProvider', 'GlobalStyles', 'useToast', 'useColorMode', 'useScrollSpy', 'useUIConfig']) {
      expect(main, name).toHaveProperty(name)
    }
  })

  it('keeps the example icons and the internals out of enchase', () => {
    expect(main).not.toHaveProperty('HomeIcon')
    expect(main).not.toHaveProperty('useControllableState')
    expect(main).not.toHaveProperty('createTheme')
  })

  it('exports exactly the theme tools from enchase/theme, with the checks and the internals kept out', () => {
    expect(Object.keys(theme).sort()).toEqual(['baseTokens', 'breakpoints', 'colorRoles', 'contrastRatio', 'createTheme', 'darkTheme', 'defaultTheme', 'defaultThemeCss', 'defineStyle', 'lightTheme', 'spring', 'themeCss', 'themeModes', 'timedSpring', 'validateMotion', 'validateTheme'])
    expect(typeExportsOf('lib/theme.ts').sort()).toEqual(['BaseTokens', 'ColorRole', 'ColorTokens', 'ContrastCheck', 'ContrastIssue', 'FontOverrides', 'HookValues', 'LabelPlacement', 'ModeTokens', 'MotionIssue', 'MotionOverrides', 'RadiusOverrides', 'RadiusTokens', 'ShadowTokens', 'ShapePreset', 'SpringInput', 'SpringName', 'SpringOverride', 'SpringPerceptual', 'SpringPhysics', 'SpringResult', 'SpringTiming', 'ThemeCssOptions', 'ThemeDefaults', 'ThemeInput', 'ThemeMode', 'ThemeOverrides', 'ThemeSet', 'ThemeStyle', 'ThemeStyleMode', 'VariableGroup'])
  })

  it('exports each style from an entry of its own, with that style and nothing else', () => {
    expect(Object.keys(enchaseStyle)).toEqual(['enchase'])
    expect(Object.keys(shadcnStyle)).toEqual(['shadcn'])
  })

  it('keeps the data of the styles out of every other entry', () => {
    for (const entry of [main, theme, icons, locales]) {
      expect(entry).not.toHaveProperty('shadcn')
      expect(entry).not.toHaveProperty('enchase')
    }
  })

  it('exports the icons of the components from enchase/icons and nothing else', () => {
    expect(Object.keys(icons)).toHaveLength(19)
    expect(icons).toHaveProperty('CloseIcon')
    expect(icons).toHaveProperty('ChevronDownIcon')
    expect(icons).not.toHaveProperty('Icon')
    expect(icons).not.toHaveProperty('Button')
    expect(icons).not.toHaveProperty('HomeIcon')
  })

  it('exports the locale data from enchase/locales', () => {
    expect(locales.en.locale).toBe('en')
    expect(locales.ptBR.locale).toBe('pt-BR')
  })
})
