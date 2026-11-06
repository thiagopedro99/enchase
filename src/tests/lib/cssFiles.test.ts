import { describe, expect, it } from 'vitest'

import { componentOf, cssComponents, cssFileProblems, cssMap, joinModules, kebab, keepsMapOrder, keepsOrder, normalizeCss, orderModules, reachable, rulesOf, sameRules } from '../../../scripts/cssFiles.mjs'

import type { CssMap } from '../../../scripts/cssFiles.mjs'

const icon = { path: 'components/common/Icon/styles.module.css', css: '.i{display:inline-block}\n' }

const button = { path: 'components/common/Button/styles.module.css', css: '.b{margin:0;color:red}\n' }

const buttonLink = { path: 'components/common/ButtonLink/styles.module.css', css: '.bl{gap:4px}\n' }

const swap = { path: 'components/common/Icon/swap.module.css', css: '.s{flex-shrink:0}\n' }

const toast = { path: 'components/toast/styles.module.css', css: '.t{position:fixed}\n' }

const stylesOf = (...modules: { css: string }[]) => `${modules.map(({ css }) => css.replace(/\n$/, '')).join('')}\n/*$vite$:1*/`

describe('kebab', () => {
  it('writes the name of a component folder as the name of its file', () => {
    expect(['Button', 'ButtonLink', 'DatePicker', 'CardButton', 'NumberInput', 'VisuallyHidden', 'SegmentedControl', 'toast', 'layout'].map(kebab)).toEqual(['button', 'button-link', 'date-picker', 'card-button', 'number-input', 'visually-hidden', 'segmented-control', 'toast', 'layout'])
  })
})

describe('componentOf', () => {
  it('names the component of a css module by its folder, sub folders and extra modules included', () => {
    expect(componentOf('components/common/Button/styles.module.css')).toEqual({ key: 'button', folder: 'components/common/Button/' })
    expect(componentOf('components/common/Combobox/subcomponentes/ListboxPopup/styles.module.css')).toEqual({ key: 'combobox', folder: 'components/common/Combobox/' })
    expect(componentOf('components/common/Icon/swap.module.css')).toEqual({ key: 'icon', folder: 'components/common/Icon/' })
    expect(componentOf('components/common/DatePicker/subcomponentes/Calendar/styles.module.css').key).toBe('date-picker')
    expect(componentOf('components/layout/subcomponentes/AppBar/styles.module.css')).toEqual({ key: 'layout', folder: 'components/layout/' })
    expect(componentOf('components/toast/styles.module.css')).toEqual({ key: 'toast', folder: 'components/toast/' })
  })

  it('refuses a css module that is not inside the folder of a component', () => {
    expect(() => componentOf('styles/shared.module.css')).toThrow('not inside the folder of a component')
    expect(() => componentOf('components/shared.module.css')).toThrow('not inside the folder of a component')
  })
})

describe('orderModules', () => {
  it('puts the modules in the order of styles.css, whatever the order they come in', () => {
    const styles = stylesOf(icon, button, swap, toast)

    expect(orderModules(styles, [toast, swap, icon, button]).map(({ path }) => path)).toEqual([icon.path, button.path, swap.path, toast.path])
  })

  it('finds a module by its first rule, so a later declaration that the second build moved does not hide it', () => {
    const moved = { path: toast.path, css: '.t{position:fixed}.u{margin:0;color:red}\n' }
    const styles = stylesOf(icon, { css: '.t{position:fixed}.u{color:red;margin:0}\n' }, button)

    expect(orderModules(styles, [button, moved, icon]).map(({ path }) => path)).toEqual([icon.path, toast.path, button.path])
  })

  it('refuses a module whose first rule is not in styles.css, or is there twice', () => {
    expect(() => orderModules(stylesOf(icon), [icon, button])).toThrow('components/common/Button/styles.module.css is not in styles.css')
    expect(() => orderModules(stylesOf(icon, icon), [icon])).toThrow('appears more than once')
    expect(() => orderModules(stylesOf(icon), [{ path: 'components/toast/styles.module.css', css: '' }])).toThrow('is not in styles.css')
  })
})

describe('joinModules', () => {
  it('joins the modules with no separator, as styles.css does, and ends with one newline', () => {
    expect(joinModules([icon, button])).toBe('.i{display:inline-block}.b{margin:0;color:red}\n')
    expect(joinModules([icon])).toBe('.i{display:inline-block}\n')
  })
})

describe('normalizeCss', () => {
  it('drops the marker that Vite adds at the end', () => {
    expect(normalizeCss('.a{color:red}\n/*$vite$:1*/')).toBe(normalizeCss('.a{color:red}\n'))
  })

  it('ignores the order of the declarations inside a rule, but not the order of the rules', () => {
    expect(normalizeCss('.a{margin:0;color:red}.b{top:0}')).toBe(normalizeCss('.a{color:red;margin:0}.b{top:0}'))
    expect(normalizeCss('.a{color:red}.b{top:0}')).not.toBe(normalizeCss('.b{top:0}.a{color:red}'))
  })

  it('tells apart a rule that differs in a value, a property, a selector or a missing declaration', () => {
    const base = normalizeCss('.a{color:red;margin:0}')

    expect([normalizeCss('.a{color:blue;margin:0}'), normalizeCss('.a{color:red;padding:0}'), normalizeCss('.c{color:red;margin:0}'), normalizeCss('.a{color:red}')].every((other) => other !== base)).toBe(true)
  })

  it('sorts the declarations inside a media query and inside a nested rule too', () => {
    expect(normalizeCss('@media (min-width:1px){.a{margin:0;color:red}}')).toBe(normalizeCss('@media (min-width:1px){.a{color:red;margin:0}}'))
    expect(normalizeCss('.a{margin:0;color:red;&:hover{top:0;left:0}}')).toBe(normalizeCss('.a{color:red;margin:0;&:hover{left:0;top:0}}'))
  })

  it('keeps the position of a nested rule among the declarations', () => {
    expect(normalizeCss('.a{color:red;&:hover{top:0}margin:0}')).not.toBe(normalizeCss('.a{color:red;margin:0;&:hover{top:0}}'))
  })

  it('does not split on a semicolon or a brace inside a string or a parenthesis', () => {
    const css = '.a{background:url(data:image/png;base64,AAAA);content:"a;b}c";quotes:\'{\' \'}\'}'

    expect(rulesOf(css)).toHaveLength(1)
    expect(normalizeCss(css)).toBe(normalizeCss('.a{quotes:\'{\' \'}\';content:"a;b}c";background:url(data:image/png;base64,AAAA)}'))
  })

  it('leaves comments out and rejects braces that do not match', () => {
    expect(normalizeCss('/* keep { out */.a{color:red}')).toBe(normalizeCss('.a{color:red}'))
    expect(() => normalizeCss('.a{color:red}}')).toThrow('closing brace')
    expect(() => normalizeCss('.a{color:red')).toThrow('ends inside a rule')
  })

  it('keeps the statements at the top level in order', () => {
    expect(normalizeCss('@layer b,a;.x{top:0}')).toBe('@layer b,a;.x{top:0;}')
  })
})

describe('keepsOrder and sameRules', () => {
  const styles = '.a{top:0}.b{margin:0;color:red}.c{left:0}.a{top:0}'

  it('accepts the rules of a file in the order they have in styles.css, with gaps and repeated rules', () => {
    expect(keepsOrder('.a{top:0}.c{left:0}', styles)).toBe(true)
    expect(keepsOrder('.b{color:red;margin:0}.a{top:0}', styles)).toBe(true)
    expect(keepsOrder('.a{top:0}.a{top:0}', styles)).toBe(true)
  })

  it('refuses rules in another order, a rule that styles.css does not have, and one used more often than it appears', () => {
    expect(keepsOrder('.c{left:0}.b{margin:0;color:red}', styles)).toBe(false)
    expect(keepsOrder('.z{top:0}', styles)).toBe(false)
    expect(keepsOrder('.c{left:0}.c{left:0}', styles)).toBe(false)
  })

  it('accepts the files in the order of their first rule in styles.css, and refuses another order', () => {
    expect(keepsMapOrder(['.a{top:0}.z{top:1}', '.b{margin:0;color:red}', '.c{left:0}'], styles)).toBe(true)
    expect(keepsMapOrder(['.c{left:0}', '.b{color:red;margin:0}'], styles)).toBe(false)
    expect(keepsMapOrder(['.b{margin:0;color:red}', '.a{top:0}'], styles)).toBe(true)
  })

  it('compares the rules of the files, as a whole, with the rules of styles.css', () => {
    expect(sameRules(styles, ['.c{left:0}.a{top:0}', '.a{top:0}.b{color:red;margin:0}'])).toBe(true)
    expect(sameRules(styles, ['.c{left:0}', '.a{top:0}.b{color:red;margin:0}'])).toBe(false)
    expect(sameRules(styles, ['.c{left:0}.a{top:0}.a{top:0}', '.a{top:0}.b{color:red;margin:0}'])).toBe(false)
  })
})

describe('reachable', () => {
  const js = {
    'a/index.js': "import { b } from './b.js'\nimport x from 'react'\nimport './style.css'",
    'a/b.js': "export { c } from '../c/index.js'",
    'c/index.js': 'export const c = 1',
    'z/index.js': 'export const z = 1'
  }

  it('follows the relative imports of javascript files, through any depth, and stops at packages and at anything else', () => {
    expect([...reachable(js, ['a/index.js'])].sort()).toEqual(['a/b.js', 'a/index.js', 'c/index.js'])
    expect([...reachable(js, ['a/index.js', 'z/index.js'])].sort()).toEqual(['a/b.js', 'a/index.js', 'c/index.js', 'z/index.js'])
    expect(reachable(js, ['missing.js']).size).toBe(0)
  })
})

describe('cssComponents', () => {
  const modules = [icon, button, buttonLink, swap, toast]

  const js = {
    'components/common/Icon/index.js': "import styles from './styles.module.js'",
    'components/common/Icon/swap.module.js': 'export default {}',
    'components/common/Icon/styles.module.js': 'export default {}',
    'components/common/Icon/IconSwap.js': "import styles from './swap.module.js'",
    'components/common/Button/index.js': "import styles from './styles.module.js'",
    'components/common/Button/styles.module.js': 'export default {}',
    'components/common/ButtonLink/index.js': "import { Button } from '../Button/index.js'\nimport styles from './styles.module.js'\nimport { Icon } from '../Icon/index.js'",
    'components/common/ButtonLink/styles.module.js': 'export default {}',
    'components/toast/toastContext.js': "import { Item } from './toastItem.js'",
    'components/toast/toastItem.js': "import { IconSwap } from '../common/Icon/IconSwap.js'\nimport styles from './styles.module.js'",
    'components/toast/styles.module.js': 'export default {}'
  }

  it('makes one file for each component, with its modules in the order of the list and the files that its code needs', () => {
    const components = cssComponents({ modules, js })

    expect(components.map(({ key }) => key)).toEqual(['icon', 'button', 'button-link', 'toast'])
    expect(components.map(({ file }) => file)).toEqual(['icon.css', 'button.css', 'button-link.css', 'toast.css'])
    expect(components.map(({ needs }) => needs)).toEqual([[], [], ['icon', 'button'], ['icon']])
    expect(components[0]).toMatchObject({ files: [icon.path, swap.path], css: '.i{display:inline-block}.s{flex-shrink:0}\n' })
  })

  it('measures each file in bytes and in gzip', () => {
    for (const { css, bytes, gzip } of cssComponents({ modules, js })) {
      expect(bytes).toBe(Buffer.byteLength(css))
      expect(gzip).toBeGreaterThan(0)
    }
  })

  it('reaches the css of another component by any file in the folder, and not by the files of other folders', () => {
    const toastOnly = cssComponents({ modules: [toast, button], js: { ...js, 'components/toast/toastItem.js': "import styles from './styles.module.js'" } })

    expect(toastOnly.find(({ key }) => key === 'toast')?.needs).toEqual([])
  })

  it('refuses a component whose folder has no javascript', () => {
    expect(() => cssComponents({ modules: [toast], js: {} })).toThrow('has no javascript in components/toast/')
  })

  it('lists the components as the map of index.json: the format, then the file, the needs, the modules and the size of each', () => {
    const map = cssMap(cssComponents({ modules, js }))

    expect(map.format).toBe(1)
    expect(Object.keys(map.components)).toEqual(['icon', 'button', 'button-link', 'toast'])
    expect(Object.keys(map.components['button-link'] ?? {})).toEqual(['file', 'needs', 'files', 'bytes', 'gzip'])
    expect(map.components['button-link']).toMatchObject({ file: 'button-link.css', needs: ['icon', 'button'], files: [buttonLink.path] })
  })
})

describe('cssFileProblems', () => {
  const modules = [icon, button, buttonLink, swap, toast]

  const js = {
    'components/common/Icon/index.js': "import styles from './styles.module.js'",
    'components/common/Icon/swap.module.js': 'export default {}',
    'components/common/Icon/styles.module.js': 'export default {}',
    'components/common/Button/index.js': "import styles from './styles.module.js'",
    'components/common/Button/styles.module.js': 'export default {}',
    'components/common/ButtonLink/index.js': "import { Button } from '../Button/index.js'\nimport styles from './styles.module.js'",
    'components/common/ButtonLink/styles.module.js': 'export default {}',
    'components/toast/toastContext.js': "import styles from './styles.module.js'",
    'components/toast/styles.module.js': 'export default {}'
  }

  const styles = stylesOf(...modules)
  const components = cssComponents({ modules, js })
  const sources = modules.map(({ path }) => path)
  const files = Object.fromEntries(components.map(({ file, css }) => [file, css]))
  const map = cssMap(components)

  const check = (changes: { map?: CssMap; files?: Record<string, string>; styles?: string; sources?: string[] } = {}) => cssFileProblems({ map, files, styles, sources, js, ...changes })

  const withEntry = (key: string, change: object): CssMap => ({ ...map, components: { ...map.components, [key]: { ...map.components[key]!, ...change } } })

  it('finds nothing wrong in files that are the css of styles.css, split by component, with the map that the javascript gives', () => {
    expect(check()).toEqual([])
  })

  it('refuses a map of another format, a file that is not named as its component, and a file that is missing or not in the map', () => {
    expect(check({ map: { ...map, format: 2 } })).toEqual([expect.stringContaining('format 2')])
    expect(check({ map: withEntry('button', { file: 'press.css' }) }).join('\n')).toContain('gives button the file press.css')
    expect(check({ files: Object.fromEntries(Object.entries(files).filter(([name]) => name !== 'button.css')) }).join('\n')).toContain('css/button.css, the file of button, does not exist')
    expect(check({ files: { ...files, 'extra.css': '.x{top:0}\n' } }).join('\n')).toContain('css/extra.css is not in css/index.json')
  })

  it('refuses a size that is not the size of the file, and a file that does not end with one newline or has the marker of Vite', () => {
    expect(check({ map: withEntry('button', { bytes: 1 }) }).join('\n')).toContain('says that button.css has 1 bytes')
    expect(check({ map: withEntry('button', { gzip: 1 }) }).join('\n')).toContain('says that button.css has 1 bytes in gzip')
    expect(check({ files: { ...files, 'toast.css': '.t{position:fixed}' } }).join('\n')).toContain('css/toast.css must end with one newline')
    expect(check({ files: { ...files, 'toast.css': '.t{position:fixed}\n\n' } }).join('\n')).toContain('css/toast.css must end with one newline')
    expect(check({ files: { ...files, 'toast.css': '.t{position:fixed}\n/*$vite$:1*/\n' } }).join('\n')).toContain('marker that Vite writes')
  })

  it('refuses a file that reads data-density or has a rule that the right to left build rewrote', () => {
    expect(check({ files: { ...files, 'toast.css': ':root[data-density=compact]{top:0}\n' } }).join('\n')).toContain('css/toast.css reads data-density')
    expect(check({ files: { ...files, 'toast.css': ':dir(rtl) .t{top:0}\n' } }).join('\n')).toContain('css/toast.css has a :dir() or a :lang() selector')
  })

  it('refuses rules that styles.css does not have, rules that are missing, and rules in another order inside a file', () => {
    expect(check({ files: { ...files, 'toast.css': '.t{position:absolute}\n' } }).join('\n')).toContain('css/toast.css has rules that styles.css does not have')
    expect(check({ files: { ...files, 'toast.css': '.t{position:fixed}.t{position:fixed}\n' } }).join('\n')).toContain('not the rules of styles.css')
    expect(check({ files: { ...files, 'icon.css': '.s{flex-shrink:0}.i{display:inline-block}\n' } }).join('\n')).toContain('css/icon.css has rules that styles.css does not have, or in another order')
    expect(check({ files: { ...files, 'badge.css': '' }, map: { ...map, components: { ...map.components, badge: { file: 'badge.css', needs: [], files: [], bytes: 0, gzip: 20 } } } }).length).toBeGreaterThan(0)
  })

  it('refuses a map that lists the components in another order than styles.css', () => {
    const reversed: CssMap = { ...map, components: Object.fromEntries(Object.entries(map.components).reverse()) }

    expect(check({ map: reversed }).join('\n')).toContain('lists the components in another order')
  })

  it('accepts a declaration in another place of a rule, which the second build of Vite does', () => {
    expect(check({ files: { ...files, 'button.css': '.b{color:red;margin:0}\n' }, map: withEntry('button', { bytes: 23, gzip: components[1]!.gzip }) }).filter((problem) => !problem.includes('gzip'))).toEqual([])
  })

  it('refuses a css module that is in no file, in two, under another component than its folder, or that the sources do not have', () => {
    expect(check({ sources: [...sources, 'components/common/Card/styles.module.css'] }).join('\n')).toContain('that no file of css/ has: components/common/Card/styles.module.css')
    expect(check({ sources: sources.slice(1) }).join('\n')).toContain(`that the sources do not have: ${icon.path}`)
    expect(check({ map: withEntry('toast', { files: [toast.path, button.path] }) }).join('\n')).toContain(`in more than one file: ${button.path}`)
    expect(check({ map: withEntry('toast', { files: [button.path] }) }).join('\n')).toContain(`${button.path} under toast`)
  })

  it('refuses a map that does not say what the javascript reaches, or that puts a need after the component', () => {
    expect(check({ map: withEntry('button-link', { needs: ['icon'] }) }).join('\n')).toContain('says that button-link needs icon, and its javascript reaches the css of button')
    expect(check({ map: withEntry('toast', { needs: ['icon'] }) }).join('\n')).toContain('says that toast needs icon, and its javascript reaches the css of nothing')
    expect(check({ map: withEntry('icon', { needs: ['toast'] }) }).join('\n')).toContain('says that icon needs toast')
  })

  it('counts the right to left selectors of the files against styles.css', () => {
    const rtl = { path: 'components/common/Badge/styles.module.css', css: '[dir=rtl] .r{top:0}\n' }
    const withRtl = [...modules, rtl]
    const rtlComponents = cssComponents({ modules: withRtl, js: { ...js, 'components/common/Badge/index.js': 'export const Badge = 1' } })
    const rtlFiles = Object.fromEntries(rtlComponents.map(({ file, css }) => [file, css]))

    expect(cssFileProblems({ map: cssMap(rtlComponents), files: rtlFiles, styles: stylesOf(...withRtl), sources: withRtl.map(({ path }) => path), js: { ...js, 'components/common/Badge/index.js': 'export const Badge = 1' } })).toEqual([])
    expect(cssFileProblems({ map: cssMap(rtlComponents), files: rtlFiles, styles: stylesOf(...modules, { css: '.r{top:0}\n' }), sources: withRtl.map(({ path }) => path), js }).join('\n')).toContain('[dir=rtl] selectors')
  })
})
