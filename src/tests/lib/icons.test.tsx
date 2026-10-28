import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import * as main from 'enchase'
import * as icons from 'enchase/icons'

import type { ComponentType } from 'react'
import type { IconProps } from 'enchase/icons'

const root = path.resolve(__dirname, '../../components')

const iconsDirectory = path.join(root, 'common/Icon/icons')

const directional = ['ChevronLeftIcon', 'ChevronRightIcon', 'ChevronsLeftIcon', 'ChevronsRightIcon', 'ExternalLinkIcon', 'LogOutIcon', 'MenuOpenIcon']

const names = Object.keys(icons).sort()

const components = Object.entries(icons) as [string, ComponentType<IconProps>][]

const sourceFiles = (directory: string): string[] =>
  readdirSync(directory).flatMap((name) => {
    const full = path.join(directory, name)

    return statSync(full).isDirectory() ? sourceFiles(full) : /\.tsx?$/.test(name) ? [full] : []
  })

const kebab = (name: string) =>
  name
    .replace(/Icon$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()

const svgOf = (container: HTMLElement) => container.querySelector('svg') as SVGSVGElement

describe('enchase/icons', () => {
  it('exports the icons that the components use, and no icon that none of them uses', () => {
    const used = new Set(
      sourceFiles(root)
        .filter((file) => !file.startsWith(iconsDirectory))
        .flatMap((file) => [...readFileSync(file, 'utf8').matchAll(/Icon\/icons\/(\w+Icon)\.tsx/g)].map((match) => match[1]))
    )

    expect(names).toEqual([...used].sort())
    expect(names).toHaveLength(20)
  })

  it('has a source file for every icon it exports and exports every source file', () => {
    const files = readdirSync(iconsDirectory)
      .map((file) => file.replace(/\.tsx$/, ''))
      .sort()

    expect(names).toEqual(files)
  })

  it('names every icon the same way: a component ending in Icon and a data-icon in kebab case', () => {
    for (const [name, Icon] of components) {
      const { container, unmount } = render(<Icon />)

      expect(name, name).toMatch(/^[A-Z][A-Za-z]+Icon$/)
      expect(svgOf(container).getAttribute('data-icon'), name).toBe(kebab(name))
      unmount()
    }
  })

  it('draws every icon the same way, decorative by default', () => {
    for (const [name, Icon] of components) {
      const { container, unmount } = render(<Icon />)
      const svg = svgOf(container)

      expect(svg, name).toHaveAttribute('width', '24')
      expect(svg, name).toHaveAttribute('height', '24')
      expect(svg, name).toHaveAttribute('viewBox', '0 0 24 24')
      expect(svg, name).toHaveAttribute('fill', 'none')
      expect(svg, name).toHaveAttribute('stroke', 'currentColor')
      expect(svg, name).toHaveAttribute('stroke-width', '2')
      expect(svg, name).toHaveAttribute('aria-hidden', 'true')
      expect(svg, name).toHaveAttribute('focusable', 'false')
      expect(svg, name).toHaveAttribute('data-slot', 'icon')
      expect(svg.querySelectorAll('path, circle, rect, line, polyline').length, name).toBeGreaterThan(0)
      unmount()
    }
  })

  it('takes a size, a class and any attribute of an svg', () => {
    for (const [name, Icon] of components) {
      const { container, unmount } = render(<Icon size={16} className="mine" data-testid="icon" strokeWidth={1.5} />)
      const svg = svgOf(container)

      expect(svg, name).toHaveAttribute('width', '16')
      expect(svg, name).toHaveAttribute('height', '16')
      expect(svg, name).toHaveClass('mine')
      expect(svg, name).toHaveAttribute('stroke-width', '1.5')
      expect(svg, name).toHaveAttribute('data-testid', 'icon')
      unmount()
    }
  })

  it('becomes an image with an accessible name when given a title', () => {
    for (const [name, Icon] of components) {
      const { unmount } = render(<Icon title={`Ícone ${name}`} />)

      expect(screen.getByRole('img', { name: `Ícone ${name}` }), name).not.toHaveAttribute('aria-hidden')
      unmount()
    }
  })

  it('flags for mirroring in right-to-left text exactly the icons that point somewhere', () => {
    const flagged = components.filter(([, Icon]) => {
      const { container, unmount } = render(<Icon />)
      const result = svgOf(container).hasAttribute('data-directional')

      unmount()

      return result
    })

    expect(flagged.map(([name]) => name).sort()).toEqual([...directional].sort())
  })

  it('keeps the icons out of the main entry, which only has the Icon container', () => {
    for (const name of names) expect(main, name).not.toHaveProperty(name)

    expect(main).toHaveProperty('Icon')
    expect(Object.keys(icons).every((name) => name.endsWith('Icon'))).toBe(true)
  })

  it('has no axe violations as decorations beside a text or as named images', async () => {
    const { container } = render(
      <div>
        {components.map(([name, Icon]) => (
          <button key={name} type="button">
            <Icon />
            {name}
          </button>
        ))}
        {components.map(([name, Icon]) => (
          <Icon key={`${name}-image`} title={`Imagem ${name}`} />
        ))}
      </div>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
