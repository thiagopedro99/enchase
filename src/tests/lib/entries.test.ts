import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

import * as main from 'enchase'
import * as icons from 'enchase/icons'
import * as locales from 'enchase/locales'
import * as enchaseStyle from 'enchase/styles/enchase'
import * as shadcnStyle from 'enchase/styles/shadcn'
import * as workbenchStyle from 'enchase/styles/workbench'
import * as segmentedControlHook from 'enchase/headless/segmented-control'
import * as paginationHook from 'enchase/headless/pagination'
import * as accordionHook from 'enchase/headless/accordion'
import * as sliderHook from 'enchase/headless/slider'
import * as tabsHook from 'enchase/headless/tabs'
import * as oldSegmentedControlHook from 'enchase/experimental/segmented-control'
import * as oldPaginationHook from 'enchase/experimental/pagination'
import * as oldAccordionHook from 'enchase/experimental/accordion'
import * as oldSliderHook from 'enchase/experimental/slider'
import * as oldTabsHook from 'enchase/experimental/tabs'
import * as theme from 'enchase/theme'

const typeExportsOf = (file: string) => {
  const source = ts.createSourceFile(file, readFileSync(path.resolve(__dirname, '../../..', file), 'utf8'), ts.ScriptTarget.Latest, true)

  return source.statements.filter(ts.isExportDeclaration).flatMap((statement) => (statement.isTypeOnly && statement.exportClause && ts.isNamedExports(statement.exportClause) ? statement.exportClause.elements.map((element) => element.name.text) : []))
}

describe('public entries', () => {
  it('exports the components, providers and hooks from enchase', () => {
    for (const name of ['Button', 'Textarea', 'Badge', 'Alert', 'Switch', 'RadioGroup', 'CheckboxGroup', 'Combobox', 'DatePicker', 'SegmentedControl', 'Slider', 'Tabs', 'Accordion', 'Pagination', 'Table', 'NumberInput', 'Modal', 'Popover', 'Sidebar', 'Layout', 'Navbar', 'Footer', 'Icon', 'Link', 'CardButton', 'CardLink', 'Divider', 'Drawer', 'Menu', 'Avatar', 'Tag', 'Progress', 'UIProvider', 'ColorModeProvider', 'ToastProvider', 'GlobalStyles', 'useToast', 'useColorMode', 'useScrollSpy', 'useUIConfig']) {
      expect(main, name).toHaveProperty(name)
    }
  })

  it('keeps the example icons and the internals out of enchase', () => {
    expect(main).not.toHaveProperty('HomeIcon')
    expect(main).not.toHaveProperty('useControllableState')
    expect(main).not.toHaveProperty('createTheme')
  })

  it('exports exactly the theme tools from enchase/theme, with the internals kept out', () => {
    expect(Object.keys(theme).sort()).toEqual(['baseTokens', 'breakpoints', 'colorRoles', 'contrastChecks', 'contrastRatio', 'createTheme', 'darkTheme', 'defaultTheme', 'defaultThemeCss', 'defineStyle', 'lightTheme', 'spring', 'themeCss', 'themeModes', 'timedSpring', 'validateMotion', 'validateTheme'])
    expect(typeExportsOf('lib/theme.ts').sort()).toEqual(['BaseTokens', 'ColorRole', 'ColorTokens', 'ContrastCheck', 'ContrastIssue', 'FontOverrides', 'HookValues', 'LabelPlacement', 'ModeTokens', 'MotionIssue', 'MotionOverrides', 'RadiusOverrides', 'RadiusTokens', 'ShadowTokens', 'ShapePreset', 'SpringInput', 'SpringName', 'SpringOverride', 'SpringPerceptual', 'SpringPhysics', 'SpringResult', 'SpringTiming', 'ThemeCssOptions', 'ThemeDefaults', 'ThemeInput', 'ThemeMode', 'ThemeOverrides', 'ThemeSet', 'ThemeStyle', 'ThemeStyleMode', 'VariableGroup'])
  })

  it('exports each style from an entry of its own, with that style and nothing else', () => {
    expect(Object.keys(enchaseStyle)).toEqual(['enchase'])
    expect(Object.keys(shadcnStyle)).toEqual(['shadcn'])
    expect(Object.keys(workbenchStyle)).toEqual(['workbench'])
  })

  it('keeps the data of the styles out of every other entry', () => {
    for (const entry of [main, theme, icons, locales]) {
      expect(entry).not.toHaveProperty('shadcn')
      expect(entry).not.toHaveProperty('workbench')
      expect(entry).not.toHaveProperty('enchase')
    }
  })

  it('exports each headless hook from an entry of its own, with that hook and nothing else', () => {
    expect(Object.keys(tabsHook)).toEqual(['useTabs'])
    expect(Object.keys(paginationHook)).toEqual(['usePagination'])
    expect(Object.keys(segmentedControlHook)).toEqual(['useSegmentedControl'])
    expect(Object.keys(accordionHook)).toEqual(['useAccordion'])
    expect(Object.keys(sliderHook)).toEqual(['useSlider'])
  })

  it('exports from each headless entry the types that its hook names, and only those', () => {
    expect(typeExportsOf('lib/headless/tabs.ts').sort()).toEqual(['UseTabsOptions', 'UseTabsReturn'])
    expect(typeExportsOf('lib/headless/pagination.ts').sort()).toEqual(['PaginationItem', 'UsePaginationOptions', 'UsePaginationReturn'])
    expect(typeExportsOf('lib/headless/segmented-control.ts').sort()).toEqual(['UseSegmentedControlOptions', 'UseSegmentedControlReturn'])
    expect(typeExportsOf('lib/headless/accordion.ts').sort()).toEqual(['UseAccordionOptions', 'UseAccordionReturn'])
    expect(typeExportsOf('lib/headless/slider.ts').sort()).toEqual(['UseSliderOptions', 'UseSliderReturn'])
  })

  it('keeps each experimental entry as a re-export of the headless entry of the same name, with the same hook', () => {
    const pairs = [
      ['tabs', tabsHook, oldTabsHook],
      ['pagination', paginationHook, oldPaginationHook],
      ['segmented-control', segmentedControlHook, oldSegmentedControlHook],
      ['accordion', accordionHook, oldAccordionHook],
      ['slider', sliderHook, oldSliderHook]
    ] as const

    for (const [name, headless, experimental] of pairs) {
      expect(readFileSync(path.resolve(__dirname, '../../..', `lib/experimental/${name}.ts`), 'utf8')).toBe(`export * from '../headless/${name}.ts'\n`)
      expect(Object.keys(experimental)).toEqual(Object.keys(headless))

      for (const key of Object.keys(headless)) expect(experimental[key as keyof typeof experimental], `${name}: ${key}`).toBe(headless[key as keyof typeof headless])
    }
  })

  it('keeps the headless hooks out of every other entry', () => {
    for (const entry of [main, theme, icons, locales, enchaseStyle, shadcnStyle, workbenchStyle]) {
      for (const name of ['useTabs', 'usePagination', 'useSegmentedControl', 'useAccordion', 'useSlider']) expect(entry).not.toHaveProperty(name)
    }
  })

  it('exports the icons of the components from enchase/icons and nothing else', () => {
    expect(Object.keys(icons)).toHaveLength(20)
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
