import { describe, expect, it } from 'vitest'

import { componentOf, cssComponents, cssMap, joinModules, kebab, keepsOrder, normalizeCss, orderModules, reachable, rulesOf, sameRules } from '../../../scripts/cssFiles.mjs'

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
