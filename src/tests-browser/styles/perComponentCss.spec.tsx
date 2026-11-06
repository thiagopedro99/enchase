import { render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Button, ButtonLink, Card, CardButton, CardLink, ColorModeProvider, Combobox, DatePicker, Layout, Navbar, Pagination, Sidebar, Table, Tag, UIProvider } from '../../../dist-lib/index.js'
import mapText from '../../../dist-lib/css/index.json?raw'
import plainCss from '../../../dist-lib/styles.css?inline'
import themeCss from '../../../dist-lib/theme.css?inline'

import type { ReactElement } from 'react'

type CssMap = { components: Record<string, { file: string; needs: string[] }> }

const map = JSON.parse(mapText) as CssMap
const order = Object.keys(map.components)
const files = import.meta.glob<string>('../../../dist-lib/css/*.css', { query: '?inline', import: 'default', eager: true })
const added: HTMLStyleElement[] = []

const cssOf = (key: string) => files[`../../../dist-lib/css/${map.components[key]?.file}`] as string

const closureOf = (keys: string[]) => [...new Set(keys.flatMap((key) => [...(map.components[key]?.needs ?? []), key]))].sort((first, second) => order.indexOf(first) - order.indexOf(second))

const addStyle = (css: string) => {
  const style = document.createElement('style')

  style.textContent = css
  document.head.append(style)
  added.push(style)
}

type Described = { name: string; values: Record<string, string> }

const describeElement = (element: Element): Described[] => {
  const tag = `${element.localName}${element.getAttribute('data-slot') ? `[${element.getAttribute('data-slot')}]` : ''}`

  return ['', '::before', '::after'].map((pseudo) => {
    const style = pseudo === '' ? getComputedStyle(element) : getComputedStyle(element, pseudo)
    const drawn = pseudo === '' || !['', 'none', 'normal'].includes(style.content)

    return { name: `${tag}${pseudo}`, values: drawn ? Object.fromEntries([...style].map((property) => [property, style.getPropertyValue(property)])) : {} }
  })
}

const snapshot = (root: Element) => [root, ...root.querySelectorAll('*')].flatMap(describeElement)

const stylesWith = (cssList: string[], element: ReactElement) => {
  addStyle(themeCss)
  cssList.forEach(addStyle)

  const { container, unmount } = render(
    <ColorModeProvider defaultMode="light" storage={null}>
      <UIProvider>
        <div style={{ inlineSize: 960 }}>{element}</div>
      </UIProvider>
    </ColorModeProvider>
  )
  const result = snapshot(container)

  unmount()
  added.splice(0).forEach((style) => style.remove())

  return result
}

const differences = (first: Described[], second: Described[]) => {
  if (first.length !== second.length) return [`${first.length} elements and pseudo elements against ${second.length}`]

  return first.flatMap((entry, index) => {
    const other = second[index]?.values ?? {}

    return Object.keys({ ...entry.values, ...other })
      .filter((property) => entry.values[property] !== other[property])
      .map((property) => `${entry.name} ${property}: ${entry.values[property]} against ${other[property]}`)
  })
}

const sections = [{ id: 'main', items: [{ id: 'home', label: 'Home', href: '/' }, { id: 'docs', label: 'Docs', href: '/docs' }] }]

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' }
]

const columns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'total', header: 'Total', align: 'end' as const }
]

const rows = [
  { name: 'Ana', total: 10 },
  { name: 'Bia', total: 20 }
]

const specimens: [string, string[], ReactElement][] = [
  [
    'Button',
    ['button'],
    <>
      <Button size="sm">Small</Button>
      <Button>Medium</Button>
      <Button variant="outline">Outline</Button>
    </>
  ],
  [
    'ButtonLink',
    ['button-link'],
    <>
      <ButtonLink href="/docs">Docs</ButtonLink>
      <ButtonLink href="https://example.com" target="_blank" variant="outline">
        External
      </ButtonLink>
    </>
  ],
  ['Card', ['card'], <Card header="Title">Body</Card>],
  ['CardButton', ['card-button'], <CardButton>Tile button</CardButton>],
  [
    'CardLink',
    ['card-link'],
    <>
      <CardLink href="/docs">Tile link</CardLink>
      <CardLink href="https://example.com" target="_blank">
        External tile
      </CardLink>
    </>
  ],
  ['Tag', ['tag'], <Tag onRemove={() => undefined}>Tag</Tag>],
  ['Pagination', ['pagination'], <Pagination pageCount={5} defaultPage={2} />],
  ['Combobox', ['combobox'], <Combobox label="Fruits" options={fruits} multiple defaultValue={['apple']} />],
  ['DatePicker', ['date-picker'], <DatePicker label="Date" />],
  ['Table', ['table'], <Table caption="Orders" columns={columns} rows={rows} selectedKeys={[0]} onSelectedKeysChange={() => undefined} />],
  ['Navbar', ['navbar'], <Navbar sections={sections} />],
  ['Sidebar', ['sidebar'], <Sidebar sections={sections} currentHref="/docs" header={<span>Brand</span>} style={{ blockSize: 360 }} />],
  [
    'Layout',
    ['layout'],
    <Layout pageTitle="Home" brand="Brand" navigationSections={sections}>
      <p>Content</p>
    </Layout>
  ]
]

afterEach(() => {
  added.splice(0).forEach((style) => style.remove())
})

describe('the css of each component in a real browser', () => {
  it('has a file for each specimen, and the map lists components in an order with every need before the component', () => {
    expect(specimens.flatMap(([, keys]) => keys).filter((key) => map.components[key] === undefined)).toEqual([])

    for (const key of order) expect(map.components[key]?.needs.every((need) => order.indexOf(need) < order.indexOf(key))).toBe(true)
  })

  it.each(specimens)('styles %s the same as styles.css does, with its own file and the files that it needs, in the order of the map', (_, keys, element) => {
    expect(differences(stylesWith(closureOf(keys).map(cssOf), element), stylesWith([plainCss], element))).toEqual([])
  })

  it('styles all of them together the same as styles.css does', () => {
    const all = (
      <>
        {specimens.map(([name, , element]) => (
          <div key={name}>{element}</div>
        ))}
      </>
    )

    expect(differences(stylesWith(closureOf(specimens.flatMap(([, keys]) => keys)).map(cssOf), all), stylesWith([plainCss], all))).toEqual([])
  })

  it('notices a file that is missing, so a map with a need left out would fail the spec', () => {
    const [, keys, element] = specimens.find(([name]) => name === 'ButtonLink') as [string, string[], ReactElement]
    const lacking = closureOf(keys).filter((key) => key !== 'button')

    expect(differences(stylesWith(lacking.map(cssOf), element), stylesWith([plainCss], element)).length).toBeGreaterThan(0)
  })
})
