import { afterAll, describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

import { applyBreaks, compareSurfaces, diffLines, isWidened, lowerBound, readSurface, renderReport, resolveBaseline, topLevelIndex, unionMembers } from '../../../scripts/checkApi.mjs'
import { breaksAgainstNotes, checkNotes, namesOfKey, notesOf } from '../../../scripts/apiBreaks.mjs'

interface Toy {
  manifest?: Record<string, unknown>
  files?: Record<string, string | null>
}

const folders: string[] = []

const manifest = {
  name: 'toy',
  version: '1.0.0',
  exports: {
    '.': { types: './dist-lib/types/lib/index.d.ts', import: './dist-lib/index.js', default: './dist-lib/index.js' },
    './styles/plain': { types: './dist-lib/types/lib/styles/plain.d.ts', import: './dist-lib/styles/plain.js', default: './dist-lib/styles/plain.js' },
    './experimental/thing': { types: './dist-lib/types/lib/experimental/thing.d.ts', import: './dist-lib/experimental/thing.js', default: './dist-lib/experimental/thing.js' },
    './styles.css': './dist-lib/styles.css'
  },
  bin: { toy: 'bin/toy.mjs' },
  engines: { node: '>=22' },
  peerDependencies: { react: '^19.0.0' },
  browserslist: ['chrome >= 120', 'firefox >= 129']
}

const files: Record<string, string> = {
  'dist-lib/types/lib/index.d.ts': "export { Tabs } from '../src/tabs.js';\nexport type { TabsProps, Mode, Result } from '../src/tabs.js';\n",
  'dist-lib/types/src/tabs.d.ts': "export type Mode = 'a' | 'b';\nexport interface TabsProps {\n    items: string[];\n    mode?: Mode | undefined;\n    label?: string | undefined;\n    onChange?: ((value: string) => void) | undefined;\n}\nexport interface Result {\n    value: string;\n}\nexport declare const Tabs: (props: TabsProps) => string;\n",
  'dist-lib/types/lib/styles/plain.d.ts': 'export declare const plain: { hooks: Record<string, string> };\n',
  'dist-lib/types/lib/experimental/thing.d.ts': 'export declare const useThing: (options: ThingOptions) => ThingReturn;\nexport interface ThingOptions {\n    a: string;\n}\nexport interface ThingReturn {\n    b: string;\n}\n',
  'dist-lib/styles.css': "[data-slot='tabs'] { height: var(--enchase-tabs-height, 2rem); }\n.panel { color: var(--enchase-tabs-color, red); }\n",
  'dist-lib/index.js': "export const parts = [slot('tabs'), slot('tabs', 'tab')]\n",
  'dist-lib/styles/plain.js': "export const plain = { hooks: { '--enchase-tabs-height': '2rem', '--enchase-tabs-color': 'red' } }\n",
  'dist-lib/experimental/thing.js': 'export const useThing = () => ({})\n'
}

const load = async (url: string) => {
  const exported: Record<string, unknown> = {}

  new Function('exports', readFileSync(fileURLToPath(url), 'utf8').replace(/export const (\w+) =/g, 'exports.$1 ='))(exported)

  return exported
}

const surfaceOf = (toy: Toy = {}) => {
  const folder = mkdtempSync(join(tmpdir(), 'enchase-check-api-'))
  const all: Record<string, string | null | undefined> = { ...files, ...toy.files }

  folders.push(folder)
  writeFileSync(join(folder, 'package.json'), JSON.stringify({ ...manifest, ...toy.manifest }))

  for (const [path, content] of Object.entries(all)) {
    if (content === null || content === undefined) continue

    mkdirSync(dirname(join(folder, path)), { recursive: true })
    writeFileSync(join(folder, path), content)
  }

  return readSurface(folder, load)
}

const compare = async (after: Toy = {}, before: Toy = {}) => compareSurfaces(await surfaceOf(before), await surfaceOf(after))

const keys = (result: Awaited<ReturnType<typeof compare>>) => result.breaks.map((item) => item.key)

const withTabs = (text: string) => ({ files: { 'dist-lib/types/src/tabs.d.ts': text } })

const tabs = (members: string, extra = '') => `export type Mode = 'a' | 'b';\nexport interface TabsProps {\n${members}\n}\nexport interface Result {\n    value: string;${extra}\n}\nexport declare const Tabs: (props: TabsProps) => string;\n`

const members = {
  items: '    items: string[];',
  mode: '    mode?: Mode | undefined;',
  label: '    label?: string | undefined;',
  onChange: '    onChange?: ((value: string) => void) | undefined;'
}

const withMembers = (...lines: string[]) => withTabs(tabs(lines.join('\n')))

afterAll(() => {
  for (const folder of folders) rmSync(folder, { recursive: true, force: true })
})

describe('the helpers of the API check', () => {
  it('splits a type on the unions of the top level only, and reads through parentheses, brackets and arrows', () => {
    expect(unionMembers("'a' | 'b'")).toEqual(["'a'", "'b'"])
    expect(unionMembers('((value: string) => void) | undefined')).toEqual(['(value: string) => void', 'undefined'])
    expect(unionMembers('Array<string | number> | null')).toEqual(['Array<string | number>', 'null'])
    expect(unionMembers("{ kind: 'a' | 'b' } | string")).toEqual(["{ kind: 'a' | 'b' }", 'string'])
    expect(unionMembers("'a|b' | 'c'")).toEqual(["'a|b'", "'c'"])
    expect(topLevelIndex("name?: 'a:b'", ':')).toBe(5)
  })

  it('calls a type widened only when the new union holds every member of the old one, with the same name and optionality', () => {
    expect(isWidened('size?: string | undefined', 'size?: string | number | undefined')).toBe(true)
    expect(isWidened("mode: 'a' | 'b'", "mode: 'a' | 'b' | 'c'")).toBe(true)
    expect(isWidened('value: string', 'value: string | number')).toBe(true)
    expect(isWidened("type Mode = 'a' | 'b'", "type Mode = 'a' | 'b' | 'c'")).toBe(true)
    expect(isWidened('onChange?: (value: string) => void', 'onChange?: ((value: string) => void) | undefined')).toBe(true)
    expect(isWidened('value: string | number', 'value: string')).toBe(false)
    expect(isWidened('value: string', 'value: number | boolean')).toBe(false)
    expect(isWidened('size?: string', 'size: string | number')).toBe(false)
    expect(isWidened('value: string', 'value: string')).toBe(false)
    expect(isWidened('function f(a: string): string', 'function f(a: string): string | number')).toBe(false)
    expect(isWidened('read(): string', 'read(): string | number')).toBe(false)
  })

  it('reads the lowest version that a range allows', () => {
    expect(lowerBound('>=22')).toEqual([22, 0, 0])
    expect(lowerBound('^19.0.0')).toEqual([19, 0, 0])
    expect(lowerBound('^18.2.0 || ^19.0.0')).toEqual([18, 2, 0])
    expect(lowerBound('~20.1')).toEqual([20, 1, 0])
    expect(lowerBound('<5')).toEqual([0, 0, 0])
  })

  it('diffs two maps of lines by key, and does not list the members of a type that was removed or added', () => {
    const before = new Map([
      ['Gone', 'interface Gone'],
      ['Gone.a', 'a: string'],
      ['Kept', 'interface Kept'],
      ['Kept.a', 'a: string']
    ])

    const after = new Map([
      ['Kept', 'interface Kept'],
      ['Kept.a', 'a: number'],
      ['Fresh', 'interface Fresh'],
      ['Fresh.a', 'a: string']
    ])

    const diff = diffLines(before, after)

    expect(diff.removed.map((item) => item.key)).toEqual(['Gone'])
    expect(diff.changed.map((item) => item.key)).toEqual(['Kept.a'])
    expect(diff.added.map((item) => item.key)).toEqual(['Fresh'])
  })
})

describe('the comparison of two builds of the package', () => {
  it('finds nothing between two identical builds, and nothing in the experimental entries', async () => {
    const result = await compare()

    expect(result).toEqual({ breaks: [], notes: [], widened: [], added: [], experimental: [] })
  })

  it('reads the exports, the commands, the minimums, the declarations, the css and the styles of a build', async () => {
    const surface = await surfaceOf()

    expect(Object.keys(surface.exports)).toEqual(['.', './styles/plain', './experimental/thing', './styles.css'])
    expect(surface.bin).toEqual({ toy: 'bin/toy.mjs' })
    expect(surface.minimums.node).toBe('>=22')
    expect(surface.entries.map((entry) => [entry.label, entry.experimental])).toEqual([
      ['toy', false],
      ['toy/styles/plain', false],
      ['toy/experimental/thing', true]
    ])
    expect(surface.entries[0].lines.map(([key]) => key)).toEqual(['Tabs', 'TabsProps', 'TabsProps.items', 'TabsProps.mode', 'TabsProps.label', 'TabsProps.onChange', 'Mode', 'Result', 'Result.value'])
    expect(surface.css).toEqual({ hooks: ['--enchase-tabs-color', '--enchase-tabs-height'], slots: ['tabs', 'tabs-tab'] })
    expect(surface.styles).toEqual({ plain: ['--enchase-tabs-color', '--enchase-tabs-height'] })
  })

  it('fails when an export or one of its conditions is gone, and lets a new one and a new target through', async () => {
    const gone = { manifest: { exports: { ...manifest.exports, './styles.css': undefined } } }

    expect(keys(await compare(gone))).toEqual(['removed exports ./styles.css'])

    const lessConditions = { manifest: { exports: { ...manifest.exports, '.': { import: './dist-lib/index.js', default: './dist-lib/index.js' } } } }

    expect(keys(await compare(lessConditions))).toEqual(['removed exports . types'])

    const moved = await compare({ manifest: { exports: { ...manifest.exports, '.': { ...manifest.exports['.'], import: './dist-lib/main.js' }, './extra': './extra.css' } } })

    expect(moved.breaks).toEqual([])
    expect(moved.notes).toEqual(['exports . import: ./dist-lib/index.js -> ./dist-lib/main.js'])
    expect(moved.added).toEqual(['exports ./extra'])
  })

  it('fails when a member of a public type is removed, and names it by its entry and its owner', async () => {
    const result = await compare(withMembers(members.items, members.mode, members.onChange))

    expect(keys(result)).toEqual(['removed toy TabsProps.label'])
    expect(result.breaks[0].names).toEqual(['TabsProps', 'TabsProps.label'])
  })

  it('fails when a type of a member changes in a way that is not a widening, or when an optional member becomes required', async () => {
    expect(keys(await compare(withMembers(members.items, '    mode?: "a" | undefined;', members.label, members.onChange)))).toEqual(['changed toy TabsProps.mode'])
    expect(keys(await compare(withMembers(members.items, members.mode, '    label: string | undefined;', members.onChange)))).toEqual(['changed toy TabsProps.label'])
    expect(keys(await compare(withMembers('    items: number[];', members.mode, members.label, members.onChange)))).toEqual(['changed toy TabsProps.items'])
  })

  it('reports a widening without failing it, whether in a member or in a union alias', async () => {
    const result = await compare({ files: { 'dist-lib/types/src/tabs.d.ts': tabs([members.items, '    mode?: Mode | "c" | undefined;', members.label, members.onChange].join('\n')).replace("'a' | 'b'", "'a' | 'b' | 'c'") } })

    expect(result.breaks).toEqual([])
    expect(result.widened).toEqual(['toy TabsProps.mode: mode?: Mode | undefined -> mode?: Mode | "c" | undefined', "toy Mode: type Mode = 'a' | 'b' -> type Mode = 'a' | 'b' | 'c'"])
  })

  it('lets a new optional member through, and fails a new required member of a type that the app writes', async () => {
    const optional = await compare(withMembers(members.items, members.mode, members.label, members.onChange, '    extra?: string | undefined;'))

    expect(optional.breaks).toEqual([])
    expect(optional.added).toEqual(['toy TabsProps.extra'])

    expect(keys(await compare(withMembers(members.items, members.mode, members.label, members.onChange, '    extra: string;')))).toEqual(['added required toy TabsProps.extra'])
  })

  it('lets a new required member through in a type that the app only reads', async () => {
    const result = await compare(withTabs(tabs(Object.values(members).join('\n'), '\n    count: number;')))

    expect(result.breaks).toEqual([])
    expect(result.added).toEqual(['toy Result.count'])
  })

  it('fails when a whole type or a whole entry is gone, once and not once for each member', async () => {
    const noResult = "export { Tabs } from '../src/tabs.js';\nexport type { TabsProps, Mode } from '../src/tabs.js';\n"
    const result = await compare({ files: { 'dist-lib/types/lib/index.d.ts': noResult, 'dist-lib/types/src/tabs.d.ts': tabs(Object.values(members).join('\n')).replace(/export interface Result \{[^}]*\}\n/, '') } })

    expect(keys(result)).toEqual(['removed toy Result'])

    const entry = await compare({ manifest: { exports: { '.': manifest.exports['.'], './experimental/thing': manifest.exports['./experimental/thing'], './styles.css': manifest.exports['./styles.css'] } } })

    expect(keys(entry)).toEqual(['removed exports ./styles/plain'])
  })

  it('fails when a hook of the css, a data-slot or a hook of a style is gone, and reports the new ones', async () => {
    const result = await compare({
      files: {
        'dist-lib/styles.css': ".panel { color: var(--enchase-tabs-color, red); }\n.fresh { color: var(--enchase-tabs-fresh, red); }\n",
        'dist-lib/index.js': "export const parts = [slot('tabs'), slot('tabs', 'fresh')]\n",
        'dist-lib/styles/plain.js': "export const plain = { hooks: { '--enchase-tabs-height': '2rem' } }\n"
      }
    })

    expect(keys(result)).toEqual(['removed css hook --enchase-tabs-height', 'removed data-slot tabs-tab', 'removed style plain --enchase-tabs-color'])
    expect(result.added).toEqual(['css hook --enchase-tabs-fresh', 'data-slot tabs-fresh'])
  })

  it('reads a data-slot from a selector of the stylesheet, from slot() and from a literal', async () => {
    const surface = await surfaceOf({ files: { 'dist-lib/styles.css': "[data-slot='from-css'] { color: red; }\n", 'dist-lib/index.js': "slot('from-call', 'part'); const props = { 'data-slot': 'from-literal' }\n" } })

    expect(surface.css.slots).toEqual(['from-call-part', 'from-css', 'from-literal'])
  })

  it('fails when a command is gone', async () => {
    expect(keys(await compare({ manifest: { bin: {} } }))).toEqual(['removed bin toy'])
  })

  it('fails when a minimum goes up or a requirement is new, and lets one go down', async () => {
    expect(keys(await compare({ manifest: { engines: { node: '>=24' } } }))).toEqual(['raised engines.node'])
    expect(keys(await compare({ manifest: { engines: { node: '>=20' } } }))).toEqual([])
    expect(keys(await compare({ manifest: { engines: undefined } }, { manifest: { engines: undefined } }))).toEqual([])
    expect(keys(await compare({ manifest: { peerDependencies: { react: '^20.0.0' } } }))).toEqual(['raised peerDependencies.react'])
    expect(keys(await compare({ manifest: { peerDependencies: { react: '^18.0.0 || ^19.0.0' } } }))).toEqual([])
    expect(keys(await compare({ manifest: { peerDependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' } } }))).toEqual(['added peerDependencies.react-dom'])
    expect(keys(await compare({ manifest: { peerDependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' }, peerDependenciesMeta: { 'react-dom': { optional: true } } } }))).toEqual([])
    expect(keys(await compare({ manifest: { browserslist: ['chrome >= 121', 'firefox >= 129'] } }))).toEqual(['raised browserslist chrome'])
    expect(keys(await compare({ manifest: { browserslist: ['chrome >= 120'] } }))).toEqual(['removed browserslist firefox'])
    expect(keys(await compare({ manifest: { browserslist: ['chrome >= 119', 'firefox >= 129', 'safari >= 17'] } }))).toEqual([])
  })

  it('treats a first minimum, where there was none, as raising it', async () => {
    expect(keys(await compare({ manifest: { engines: { node: '>=22' } } }, { manifest: { engines: undefined } }))).toEqual(['raised engines.node'])
  })

  it('only reports the experimental entries, with the name of the hook, and never fails them', async () => {
    const changed = await compare({ files: { 'dist-lib/types/lib/experimental/thing.d.ts': 'export declare const useThing: (options: ThingOptions) => ThingReturn;\nexport interface ThingOptions {\n    a: number;\n}\nexport interface ThingReturn {\n}\n' } })

    expect(changed.breaks).toEqual([])
    expect(changed.experimental).toEqual([{ label: 'toy/experimental/thing', hook: 'useThing', kind: 'changed', items: ['removed ThingReturn.b', 'changed ThingOptions.a: a: string -> a: number'] }])

    const gone = await compare({ manifest: { exports: { '.': manifest.exports['.'], './styles/plain': manifest.exports['./styles/plain'], './styles.css': manifest.exports['./styles.css'] } } })

    expect(gone.breaks).toEqual([])
    expect(gone.experimental).toEqual([{ label: 'toy/experimental/thing', hook: 'useThing', kind: 'removed', items: ['entry toy/experimental/thing'] }])

    const fresh = await compare({}, { manifest: { exports: { '.': manifest.exports['.'], './styles/plain': manifest.exports['./styles/plain'], './styles.css': manifest.exports['./styles.css'] } } })

    expect(fresh.experimental.map((change) => [change.hook, change.kind])).toEqual([['useThing', 'added']])
  })
})

describe('the breaks that a release declares', () => {
  const detected = [
    { section: 'declarations', key: 'removed toy TabsProps.label', detail: 'label?: string', names: ['TabsProps', 'TabsProps.label'] },
    { section: 'bin', key: 'removed bin toy', detail: 'the command is gone', names: ['toy'] }
  ]

  it('fails every break when there is no file', () => {
    expect(applyBreaks({ detected, file: undefined, baseline: '1.0.0' }).errors).toEqual(['removed toy TabsProps.label: label?: string (not declared in api-breaks.json)', 'removed bin toy: the command is gone (not declared in api-breaks.json)'])
    expect(applyBreaks({ detected: [], file: undefined, baseline: '1.0.0' }).errors).toEqual([])
  })

  it('accepts the breaks that the file lists, and returns their keys', () => {
    const result = applyBreaks({ detected, file: { since: '1.0.0', breaks: detected.map(({ key }) => ({ key, note: 'on purpose' })) }, baseline: '1.0.0' })

    expect(result.errors).toEqual([])
    expect(result.declared).toEqual(['removed toy TabsProps.label', 'removed bin toy'])
  })

  it('fails a break that is not listed, and a listed item that did not break', () => {
    const result = applyBreaks({ detected, file: { since: '1.0.0', breaks: [{ key: 'removed toy TabsProps.label', note: 'on purpose' }, { key: 'removed toy TabsProps.mode', note: 'by mistake' }] }, baseline: '1.0.0' })

    expect(result.errors).toEqual(['removed bin toy: the command is gone (not declared in api-breaks.json)', 'api-breaks.json lists "removed toy TabsProps.mode", which did not break'])
  })

  it('ignores a file of an older release with a warning, and fails what it was hiding', () => {
    const result = applyBreaks({ detected, file: { since: '0.9.0', breaks: detected.map(({ key }) => ({ key, note: 'old' })) }, baseline: '1.0.0' })

    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0]).toContain('it was ignored')
    expect(result.errors).toHaveLength(2)
    expect(applyBreaks({ detected: [], file: { since: '0.9.0', breaks: [{ key: 'removed x', note: 'old' }] }, baseline: '1.0.0' })).toMatchObject({ errors: [], warnings: [expect.stringContaining('0.9.0')] })
  })

  it('fails a file that does not have the shape', () => {
    expect(applyBreaks({ detected: [], file: { since: '1.0.0' }, baseline: '1.0.0' }).errors).toHaveLength(1)
    expect(applyBreaks({ detected: [], file: { since: '1.0.0', breaks: [{ key: 'removed x' }] }, baseline: '1.0.0' }).errors).toHaveLength(1)
    expect(applyBreaks({ detected: [], file: [], baseline: '1.0.0' }).errors).toHaveLength(1)
  })
})

describe('the Notes of a release', () => {
  const changelog = '# Changelog\n\n## v1.1.0\n\n[compare changes](x)\n\n### Notes\n\n- This release removes `TabsProps.label` and the command.\n- Other things, such as `useThing`.\n\n### Docs\n\n- not a note\n\n## v1.0.0\n\n### Notes\n\n- old\n'

  const declared = [
    { section: 'declarations', key: 'removed toy TabsProps.label', detail: '', names: ['TabsProps', 'TabsProps.label'] },
    { section: 'bin', key: 'removed bin toy', detail: '', names: ['toy'] }
  ]

  it('reads the notes of one version, and the first bullet among them', () => {
    const notes = notesOf(changelog, '1.1.0')

    expect(notes?.first).toBe('- This release removes `TabsProps.label` and the command.')
    expect(notes?.text).toContain('useThing')
    expect(notes?.text).not.toContain('not a note')
    expect(notes?.text).not.toContain('old')
    expect(notesOf(changelog, '9.9.9')).toBeUndefined()
    expect(notesOf('## v2.0.0\n\n### Fixes\n\n- x\n', '2.0.0')).toEqual({ text: '', first: '' })
  })

  it('wants the first bullet to cite each declared break, by its key or by the name of the symbol in code', () => {
    const notes = notesOf(changelog, '1.1.0')

    expect(checkNotes({ notes: notes!, declared: [declared[0]] })).toEqual([])
    expect(checkNotes({ notes: notes!, declared })).toEqual(['the first bullet of the Notes must cite "removed bin toy" (or `toy`) as a break'])
    expect(checkNotes({ notes: { text: '', first: '- removed toy TabsProps.label' }, declared: [declared[0]] })).toEqual([])
  })

  it('wants the Notes to name each experimental hook that changed', () => {
    const notes = notesOf(changelog, '1.1.0')!
    const change = { label: 'toy/experimental/thing', hook: 'useThing', kind: 'changed' as const, items: ['changed x'] }

    expect(checkNotes({ notes, declared: [], experimental: [change] })).toEqual([])
    expect(checkNotes({ notes, declared: [], experimental: [{ ...change, hook: 'useOther' }] })).toEqual(['the Notes must name `useOther`, which changed in toy/experimental/thing'])
  })
})

describe('the breaks file in the decision of a release', () => {
  const changelog = '# Changelog\n\n## v1.1.0\n\n### Notes\n\n- This release removes `TabsProps.label`.\n- Other things.\n\n## v1.0.0\n\n### Notes\n\n- old\n'
  const file = { since: '1.0.0', breaks: [{ key: 'removed toy TabsProps.label', note: 'on purpose' }] }

  it('names a break by the last word of its key and by the type that owns it', () => {
    expect(namesOfKey('removed toy TabsProps.label')).toEqual(['TabsProps.label', 'TabsProps'])
    expect(namesOfKey('removed css hook --enchase-tabs-height')).toEqual(['--enchase-tabs-height'])
    expect(namesOfKey('raised engines.node')).toEqual(['engines.node', 'engines'])
  })

  it('has nothing to say when there is no file', () => {
    expect(breaksAgainstNotes({ file: undefined, changelog, version: '1.1.0', highest: '1.0.0' })).toEqual({ errors: [], warnings: [] })
  })

  it('passes a file whose breaks the first bullet cites', () => {
    expect(breaksAgainstNotes({ file, changelog, version: '1.1.0', highest: '1.0.0' })).toEqual({ errors: [], warnings: [] })
  })

  it('fails a file whose break the first bullet does not cite', () => {
    const other = { since: '1.0.0', breaks: [{ key: 'removed bin toy', note: 'on purpose' }] }

    expect(breaksAgainstNotes({ file: other, changelog, version: '1.1.0', highest: '1.0.0' }).errors).toEqual(['the first bullet of the Notes must cite "removed bin toy" (or `toy`) as a break'])
  })

  it('fails a file when the changelog has no section of the version', () => {
    expect(breaksAgainstNotes({ file, changelog, version: '1.2.0', highest: '1.0.0' }).errors).toHaveLength(1)
  })

  it('ignores a file of another release with a warning, and fails a file without the shape', () => {
    const old = breaksAgainstNotes({ file: { ...file, since: '0.9.0' }, changelog, version: '1.1.0', highest: '1.0.0' })

    expect(old.errors).toEqual([])
    expect(old.warnings).toHaveLength(1)
    expect(breaksAgainstNotes({ file: { since: '1.0.0' }, changelog, version: '1.1.0', highest: '1.0.0' }).errors).toHaveLength(1)
  })
})

describe('the report and the baseline', () => {
  it('prints one line for each section and the result', async () => {
    const before = await surfaceOf()
    const after = await surfaceOf(withMembers(members.items, members.mode, members.onChange))
    const result = compareSurfaces(before, after)
    const report = renderReport({ before, after, result, errors: result.breaks.map((item) => `${item.key}: ${item.detail}`), warnings: [] })

    expect(report).toContain('check:api: toy 1.0.0 (this build) against toy 1.0.0 (published)')
    expect(report).toContain('declarations  2 stable entries')
    expect(report).toContain('1 removed or changed')
    expect(report).toContain('not accepted:')
    expect(report).toContain('result: 1 problem')
    expect(renderReport({ before, after: before, result: compareSurfaces(before, before), errors: [], warnings: [] })).toContain('result: ok')
  })

  it('takes a folder as the baseline and refuses anything else', async () => {
    const folder = mkdtempSync(join(tmpdir(), 'enchase-check-api-'))

    folders.push(folder)
    writeFileSync(join(folder, 'package.json'), '{}')

    expect(resolveBaseline('toy', folder)).toEqual({ dir: folder })
    expect(() => resolveBaseline('toy', join(folder, 'missing'))).toThrow('neither a package folder nor a .tgz')
  })
})
