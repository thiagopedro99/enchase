import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import Breadcrumbs from '@components/common/Breadcrumbs/index.tsx'
import Pagination from '@components/common/Pagination/index.tsx'
import { Sidebar } from '@components/common/Sidebar/index.tsx'
import Footer from '@components/footer/index.tsx'
import Layout from '@components/layout/index.tsx'
import Brand from '@components/layout/subcomponentes/Brand/index.tsx'
import MenuToggleIcon from '@components/layout/subcomponentes/MenuToggleIcon/index.tsx'
import SidebarUser from '@components/layout/subcomponentes/SidebarUser/index.tsx'
import Navbar from '@components/navbar/index.tsx'
import { demoSections } from '@tests/shared/fixtures/layoutBranding.tsx'
import { unlessFirefox } from './browserSkips.ts'
import { renderInBrowser } from './harness.tsx'
import { at, becomes, expectHooks, hooked, onRoot, part, parts, style } from './hookProbes.ts'
import { setContrast } from './media.ts'
import { pressMouse, releaseMouse } from './pointer.ts'
import { supportsTranslucency, surfaceOf } from './translucency.ts'

import type { Probe } from './hookProbes.ts'

const translucentIt = supportsTranslucency ? it : it.skip

const links = [{ label: 'Docs', href: '/docs' }]

afterEach(async () => {
  await releaseMouse()
  await setContrast('no-preference')
  document.documentElement.removeAttribute('style')
  await page.viewport(1280, 800)
})

const trail = [
  { id: 'a', label: 'Home', href: '/' },
  { id: 'b', label: 'Docs', href: '/docs' },
  { id: 'c', label: 'Guide', href: '/guide' },
  { id: 'd', label: 'Page', href: '/page' },
  { id: 'e', label: 'Now' }
]

describe('the breadcrumbs from the hooks', () => {
  it('takes the gaps, the sizes and the colors of the trail from their hooks', () => {
    hooked(
      [
        ['--enchase-breadcrumbs-list-gap', '9px', at('breadcrumbs-list'), 'column-gap'],
        ['--enchase-breadcrumbs-item-gap', '11px', at('breadcrumbs-item', 3), 'column-gap'],
        ['--enchase-breadcrumbs-item-min-width', '37px', at('breadcrumbs-item', 2), 'min-width'],
        ['--enchase-breadcrumbs-item-min-width-low', '41px', at('breadcrumbs-item', 0), 'min-width'],
        ['--enchase-breadcrumbs-separator-color', 'rgb(1, 2, 3)', at('breadcrumbs-separator'), 'color'],
        ['--enchase-breadcrumbs-link-min-height', '43px', at('breadcrumbs-link', 1), 'min-height'],
        ['--enchase-breadcrumbs-link-min-height', '43px', at('breadcrumbs-link', 0), 'line-height'],
        ['--enchase-breadcrumbs-link-padding-inline', '15px', at('breadcrumbs-link', 1), 'padding-left'],
        ['--enchase-breadcrumbs-link-color', 'rgb(4, 5, 6)', at('breadcrumbs-link', 1), 'color'],
        ['--enchase-breadcrumbs-current-padding-inline', '17px', at('breadcrumbs-current'), 'padding-left'],
        ['--enchase-breadcrumbs-current-color', 'rgb(7, 8, 9)', at('breadcrumbs-current'), 'color'],
        ['--enchase-breadcrumbs-ellipsis-min-width', '47px', at('breadcrumbs-ellipsis'), 'min-width'],
        ['--enchase-breadcrumbs-ellipsis-min-height', '45px', at('breadcrumbs-ellipsis'), 'min-height'],
        ['--enchase-breadcrumbs-ellipsis-color', 'rgb(10, 11, 12)', at('breadcrumbs-ellipsis'), 'color']
      ],
      <Breadcrumbs items={trail} />
    )
  })

  it('takes the padding and the color of a crumb that is not a link from their hooks', () => {
    hooked(
      [
        ['--enchase-breadcrumbs-text-padding-inline', '19px', at('breadcrumbs-text'), 'padding-left'],
        ['--enchase-breadcrumbs-text-color', 'rgb(13, 14, 15)', at('breadcrumbs-text'), 'color']
      ],
      <Breadcrumbs
        items={[
          { id: 'a', label: 'Home', href: '/' },
          { id: 'b', label: 'Section' },
          { id: 'c', label: 'Page' }
        ]}
      />
    )
  })

  it('takes the color of a hovered link from its hook', async () => {
    onRoot({ '--enchase-breadcrumbs-link-color-hover': 'rgb(1, 2, 3)' })
    renderInBrowser(<Breadcrumbs items={trail} />)
    await userEvent.hover(part('breadcrumbs-link', 1))
    await becomes(() => part('breadcrumbs-link', 1), 'color', 'rgb(1, 2, 3)')
  })
})

describe('the pagination from the hooks', () => {
  it('takes the gap, the colors and the padding of the controls from their hooks', () => {
    hooked(
      [
        ['--enchase-pagination-list-gap', '9px', at('pagination-list'), 'column-gap'],
        ['--enchase-pagination-control-color', 'rgb(1, 2, 3)', at('pagination-page', 1), 'color'],
        ['--enchase-pagination-control-padding-inline', '11px', at('pagination-page', 1), 'padding-left'],
        ['--enchase-pagination-control-color-current', 'rgb(4, 5, 6)', at('pagination-page', 0), 'color'],
        ['--enchase-pagination-control-background-current', 'rgb(7, 8, 9)', at('pagination-page', 0), 'background-color'],
        ['--enchase-pagination-control-color-disabled', 'rgb(10, 11, 12)', at('pagination-previous'), 'color'],
        ['--enchase-pagination-ellipsis-color', 'rgb(13, 14, 15)', at('pagination-ellipsis'), 'color']
      ],
      <Pagination pageCount={10} page={1} />
    )
  })

  it('takes the padding of the small size from its own hook', () => {
    hooked([['--enchase-pagination-control-padding-inline-sm', '5px', at('pagination-page', 1), 'padding-left']], <Pagination pageCount={10} page={1} size="sm" />)
  })
})

const sections = [
  {
    id: 's1',
    title: 'Main',
    items: [
      { id: 'home', label: 'Home', href: '/', badge: '3' },
      { id: 'docs', label: 'Docs', href: '/docs' },
      { id: 'act', label: 'Action', onClick: () => undefined }
    ]
  },
  { id: 's2', title: 'More', items: [{ id: 'about', label: 'About', href: '/about' }] }
]

const sidebar = <Sidebar variant="permanent" currentHref="/" sections={sections} header={<span>Header</span>} footer={<span>Footer</span>} onToggleCollapsed={() => undefined} />

const sidebarLink = (index: number) => () => part('sidebar-nav').querySelectorAll('a')[index]

describe('the sidebar from the hooks', () => {
  it('takes the box, the header, the sections and the items from their hooks', () => {
    hooked(
      [
        ['--enchase-sidebar-background', 'rgb(1, 2, 3)', at('sidebar'), 'background-color'],
        ['--enchase-sidebar-color', 'rgb(4, 5, 6)', at('sidebar'), 'color'],
        ['--enchase-sidebar-header-min-height', '81px', at('sidebar-header'), 'min-height'],
        ['--enchase-sidebar-header-padding-inline', '17px', at('sidebar-header'), 'padding-left'],
        ['--enchase-sidebar-nav-gap', '9px', at('sidebar-nav'), 'row-gap'],
        ['--enchase-sidebar-nav-padding-block', '5px', at('sidebar-nav'), 'padding-top'],
        ['--enchase-sidebar-nav-padding-inline', '7px', at('sidebar-nav'), 'padding-left'],
        ['--enchase-sidebar-nav-padding-inline', '7px', at('sidebar-indicator'), 'left'],
        ['--enchase-sidebar-section-gap', '11px', at('sidebar-section'), 'row-gap'],
        ['--enchase-sidebar-section-title-padding-block', '3px', at('sidebar-section-title'), 'padding-top'],
        ['--enchase-sidebar-section-title-padding-inline', '13px', at('sidebar-section-title'), 'padding-left'],
        ['--enchase-sidebar-section-title-color', 'rgb(7, 8, 9)', at('sidebar-section-title'), 'color'],
        ['--enchase-sidebar-item-list-gap', '6px', () => part('sidebar-nav').querySelector('ul'), 'row-gap'],
        ['--enchase-sidebar-footer-gap', '7px', at('sidebar-footer'), 'row-gap'],
        ['--enchase-sidebar-footer-padding', '13px', at('sidebar-footer'), 'padding-top'],
        ['--enchase-sidebar-collapse-button-color', 'rgb(25, 26, 27)', at('sidebar-collapse-button'), 'color']
      ],
      sidebar
    )
  })

  it('takes the height, the padding, the gap and the colors of an item from their hooks', () => {
    hooked(
      [
        ['--enchase-sidebar-item-control-gap', '8px', sidebarLink(1), 'column-gap'],
        ['--enchase-sidebar-item-control-height', '47px', sidebarLink(1), 'height'],
        ['--enchase-sidebar-item-control-padding-inline', '19px', sidebarLink(1), 'padding-left'],
        ['--enchase-sidebar-item-control-color', 'rgb(10, 11, 12)', sidebarLink(1), 'color'],
        ['--enchase-sidebar-item-control-color-current', 'rgb(16, 17, 18)', sidebarLink(0), 'color'],
        ['--enchase-sidebar-item-icon-width', '29px', at('sidebar-item-icon'), 'width'],
        ['--enchase-sidebar-item-icon-height', '27px', at('sidebar-item-icon'), 'height'],
        ['--enchase-sidebar-item-badge-padding-block', '3px', at('sidebar-item-badge'), 'padding-top'],
        ['--enchase-sidebar-item-badge-padding-inline', '9px', at('sidebar-item-badge'), 'padding-left'],
        ['--enchase-sidebar-item-badge-background', 'rgb(19, 20, 21)', at('sidebar-item-badge'), 'background-color'],
        ['--enchase-sidebar-item-badge-color', 'rgb(22, 23, 24)', at('sidebar-item-badge'), 'color']
      ],
      sidebar
    )
  })

  it('paints the sliding indicator with the current color of the item until its own hook says otherwise', () => {
    onRoot({ '--enchase-sidebar-item-control-background-current': 'rgb(13, 14, 15)' })
    renderInBrowser(sidebar)

    expect(style('sidebar-indicator').backgroundColor).toBe('rgb(13, 14, 15)')

    document.documentElement.style.setProperty('--enchase-sidebar-indicator-background', 'rgb(1, 2, 3)')

    expect(style('sidebar-indicator').backgroundColor).toBe('rgb(1, 2, 3)')
  })

  it('colors the current item itself when the sliding indicator is off', () => {
    onRoot({ '--enchase-sidebar-item-control-background-current': 'rgb(13, 14, 15)' })
    renderInBrowser(sidebar)
    part('sidebar-nav').removeAttribute('data-indicator')

    expect(getComputedStyle(sidebarLink(0)() as Element).backgroundColor).toBe('rgb(13, 14, 15)')
  })

  it('takes the color of an item while hovered and while pressed from their hooks', async () => {
    onRoot({ '--enchase-sidebar-item-control-color-hover': 'rgb(1, 2, 3)', '--enchase-sidebar-item-control-color-active': 'rgb(4, 5, 6)' })
    renderInBrowser(sidebar)

    const link = sidebarLink(1)() as HTMLElement

    link.draggable = false
    await userEvent.hover(link)
    await becomes(() => link, 'color', 'rgb(1, 2, 3)')

    await pressMouse('[data-slot="sidebar-nav"] li:nth-of-type(2) a')
    await becomes(() => link, 'color', 'rgb(4, 5, 6)')
  })

  it('takes the color of the collapse button while hovered and while pressed from their hooks', async () => {
    onRoot({ '--enchase-sidebar-collapse-button-color-hover': 'rgb(7, 8, 9)', '--enchase-sidebar-collapse-button-color-active': 'rgb(10, 11, 12)' })
    renderInBrowser(sidebar)

    const collapse = part('sidebar-collapse-button')

    await userEvent.hover(collapse)
    await becomes(() => collapse, 'color', 'rgb(7, 8, 9)')

    await pressMouse('[data-slot="sidebar-collapse-button"]')
    await becomes(() => collapse, 'color', 'rgb(10, 11, 12)')
  })

  it('takes the margins and the color of the divider between the sections of a collapsed sidebar from their hooks', () => {
    hooked(
      [
        ['--enchase-sidebar-section-divider-margin-block', '9px', at('sidebar-section-divider'), 'margin-top'],
        ['--enchase-sidebar-section-divider-margin-inline', '11px', at('sidebar-section-divider'), 'margin-left'],
        ['--enchase-sidebar-section-divider-border-color', 'rgb(1, 2, 3)', at('sidebar-section-divider'), 'border-top-color']
      ],
      <Sidebar variant="permanent" collapsed currentHref="/" sections={sections} />
    )
  })

  it('takes the overlay, the panel and the shadow of the drawer from their hooks', () => {
    hooked(
      [
        ['--enchase-sidebar-overlay-background', 'rgb(1, 2, 3)', at('sidebar-overlay'), 'background-color'],
        ['--enchase-sidebar-background', 'rgb(4, 5, 6)', at('sidebar-panel'), 'background-color'],
        ['--enchase-sidebar-panel-shadow', '0 0 0 3px rgb(7, 8, 9)', at('sidebar-panel'), 'box-shadow', /rgb\(7, 8, 9\)/]
      ],
      <Sidebar variant="modal" open onClose={() => undefined} sections={sections} />
    )
  })
})

const menu = [
  {
    id: 'm',
    items: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'docs', label: 'Docs', href: '/docs' }
    ]
  }
]

const navbar = <Navbar sections={menu} actions={<button type="button">Go</button>} />

const menuLink = (index: number) => () => part('navbar-menu').querySelectorAll('a')[index]

describe('the navbar from the hooks', () => {
  it('takes the bar, the gaps, the logo and the links from their hooks', () => {
    hooked(
      [
        ['--enchase-navbar-background-solid', 'rgb(1, 2, 3)', at('navbar'), 'background-color'],
        ['--enchase-navbar-bar-height', '73px', at('navbar-bar'), 'height'],
        ['--enchase-navbar-actions-gap', '9px', at('navbar-actions'), 'column-gap'],
        ['--enchase-navbar-logo-color', 'rgb(4, 5, 6)', at('navbar-logo'), 'color'],
        ['--enchase-navbar-menu-gap', '11px', at('navbar-menu'), 'column-gap'],
        ['--enchase-navbar-cta-gap', '13px', at('navbar-cta'), 'column-gap'],
        ['--enchase-navbar-menu-link-padding-inline', '15px', menuLink(1), 'padding-left'],
        ['--enchase-navbar-menu-link-color', 'rgb(7, 8, 9)', menuLink(1), 'color'],
        ['--enchase-navbar-menu-link-color-current', 'rgb(10, 11, 12)', menuLink(0), 'color'],
        ['--enchase-navbar-menu-link-background-current', 'rgb(13, 14, 15)', menuLink(0), 'background-color'],
        ['--enchase-navbar-menu-button-color', 'rgb(16, 17, 18)', at('navbar-menu-button'), 'color']
      ],
      navbar
    )
  })

  it('takes the color of the logo and of the links while hovered and while pressed from their hooks', async () => {
    onRoot({
      '--enchase-navbar-logo-color-hover': 'rgb(1, 2, 3)',
      '--enchase-navbar-menu-link-color-hover': 'rgb(4, 5, 6)',
      '--enchase-navbar-menu-link-color-active': 'rgb(7, 8, 9)'
    })
    renderInBrowser(navbar)
    await userEvent.hover(part('navbar-logo'))
    await becomes(() => part('navbar-logo'), 'color', 'rgb(1, 2, 3)')

    const link = menuLink(1)() as HTMLElement

    link.draggable = false
    await userEvent.hover(link)
    await becomes(() => link, 'color', 'rgb(4, 5, 6)')

    await pressMouse('[data-slot="navbar-menu"] a:nth-of-type(2)')
    await becomes(() => link, 'color', 'rgb(7, 8, 9)')
  })

  translucentIt('derives the translucent fill from the solid color and the alpha, and lets the translucent hook win', () => {
    onRoot({ '--enchase-navbar-background-solid': 'rgb(200, 100, 50)', '--enchase-navbar-background-alpha': '0.5' })

    const { unmount } = renderInBrowser(<Navbar sections={menu} translucent />)
    const derived = surfaceOf(part('navbar'))

    expect([derived.r, derived.g, derived.b]).toEqual([200, 100, 50])
    expect(derived.a).toBeCloseTo(0.5, 2)

    unmount()
    document.documentElement.style.setProperty('--enchase-navbar-background', 'rgb(10 20 30 / 25%)')
    renderInBrowser(<Navbar sections={menu} translucent />)

    const explicit = surfaceOf(part('navbar'))

    expect([explicit.r, explicit.g, explicit.b]).toEqual([10, 20, 30])
    expect(explicit.a).toBeCloseTo(0.25, 2)
  })

  translucentIt('draws the line under the translucent bar with its own hook', () => {
    hooked([['--enchase-navbar-border-color-translucent', 'rgb(1, 2, 3)', at('navbar'), 'box-shadow', /rgb\(1, 2, 3\)/]], <Navbar sections={menu} translucent />)
  })

  const contrast = supportsTranslucency && unlessFirefox('contrastEmulation') ? it : it.skip

  contrast('falls back to the solid hook, not to the translucent color, when the system asks for more contrast', async () => {
    onRoot({ '--enchase-navbar-background-solid': 'rgb(200, 100, 50)', '--enchase-navbar-background': 'rgb(10 20 30 / 25%)' })
    renderInBrowser(<Navbar sections={menu} translucent />)

    expect(surfaceOf(part('navbar')).a).toBeCloseTo(0.25, 2)

    await setContrast('more')
    await expect.poll(() => surfaceOf(part('navbar')).a).toBe(1)

    expect([surfaceOf(part('navbar')).r, surfaceOf(part('navbar')).g, surfaceOf(part('navbar')).b]).toEqual([200, 100, 50])
  })

  it('takes the overlay, the drawer and its spacing from their hooks', async () => {
    await page.viewport(400, 800)
    onRoot({
      '--enchase-navbar-overlay-background': 'rgb(1, 2, 3)',
      '--enchase-navbar-drawer-width': '277px',
      '--enchase-navbar-drawer-background': 'rgb(4, 5, 6)',
      '--enchase-navbar-drawer-shadow': '0 0 0 3px rgb(7, 8, 9)',
      '--enchase-navbar-drawer-padding': '19px',
      '--enchase-navbar-drawer-gap': '7px',
      '--enchase-navbar-drawer-header-margin-block-end': '23px',
      '--enchase-navbar-drawer-nav-gap': '5px',
      '--enchase-navbar-drawer-cta-gap': '3px',
      '--enchase-navbar-drawer-cta-margin-block-start': '29px',
      '--enchase-navbar-mobile-menu-link-min-height': '53px',
      '--enchase-navbar-mobile-menu-link-padding-block': '4px',
      '--enchase-navbar-menu-button-color': 'rgb(10, 11, 12)'
    })
    renderInBrowser(navbar)
    await userEvent.click(part('navbar-menu-button'))
    await expect.poll(() => parts('navbar-drawer').length).toBe(1)

    const mobileLink = () => part('navbar-drawer-nav').querySelectorAll('a')[1]
    const probes: Probe[] = [
      ['--enchase-navbar-overlay-background', 'rgb(1, 2, 3)', at('navbar-overlay'), 'background-color'],
      ['--enchase-navbar-drawer-width', '277px', at('navbar-drawer'), 'width'],
      ['--enchase-navbar-drawer-background', 'rgb(4, 5, 6)', at('navbar-drawer'), 'background-color'],
      ['--enchase-navbar-drawer-shadow', '0 0 0 3px rgb(7, 8, 9)', at('navbar-drawer'), 'box-shadow', /rgb\(7, 8, 9\)/],
      ['--enchase-navbar-drawer-padding', '19px', at('navbar-drawer'), 'padding-left'],
      ['--enchase-navbar-drawer-padding', '19px', at('navbar-drawer'), 'padding-top'],
      ['--enchase-navbar-drawer-gap', '7px', at('navbar-drawer'), 'row-gap'],
      ['--enchase-navbar-drawer-header-margin-block-end', '23px', at('navbar-drawer-header'), 'margin-bottom'],
      ['--enchase-navbar-drawer-nav-gap', '5px', at('navbar-drawer-nav'), 'row-gap'],
      ['--enchase-navbar-drawer-cta-gap', '3px', at('navbar-drawer-cta'), 'row-gap'],
      ['--enchase-navbar-drawer-cta-margin-block-start', '29px', at('navbar-drawer-cta'), 'margin-top'],
      ['--enchase-navbar-mobile-menu-link-min-height', '53px', mobileLink, 'min-height'],
      ['--enchase-navbar-mobile-menu-link-padding-block', '4px', mobileLink, 'padding-top'],
      ['--enchase-navbar-menu-button-color', 'rgb(10, 11, 12)', at('navbar-drawer-close'), 'color']
    ]

    expectHooks(probes)
  })
})

const layout = (props: Partial<Parameters<typeof Layout>[0]> = {}) => (
  <Layout pageTitle="Teste" navigationSections={demoSections} {...props}>
    <h1>Conteúdo</h1>
  </Layout>
)

describe('the layout and its top bar from the hooks', () => {
  it('takes the top bar, the skip link and the main area from their hooks', () => {
    hooked(
      [
        ['--enchase-layout-header-gap', '9px', at('layout-header'), 'column-gap'],
        ['--enchase-layout-header-height', '77px', at('layout-header'), 'height'],
        ['--enchase-layout-header-padding-inline', '13px', at('layout-header'), 'padding-left'],
        ['--enchase-app-bar-background-solid', 'rgb(1, 2, 3)', at('layout-header'), 'background-color'],
        ['--enchase-layout-header-border-color', 'rgb(4, 5, 6)', at('layout-header'), 'border-bottom-color'],
        ['--enchase-layout-header-menu-button-color', 'rgb(7, 8, 9)', at('layout-header-menu-button'), 'color'],
        ['--enchase-layout-header-actions-gap', '11px', at('layout-header-actions'), 'column-gap'],
        ['--enchase-layout-skip-link-padding-block', '3px', at('layout-skip-link'), 'padding-top'],
        ['--enchase-layout-skip-link-padding-inline', '23px', at('layout-skip-link'), 'padding-left'],
        ['--enchase-layout-skip-link-background', 'rgb(10, 11, 12)', at('layout-skip-link'), 'background-color'],
        ['--enchase-layout-skip-link-color', 'rgb(13, 14, 15)', at('layout-skip-link'), 'color'],
        ['--enchase-layout-main-padding-block', '17px 31px', at('layout-main'), 'padding-top', '17px'],
        ['--enchase-layout-main-padding-block', '17px 31px', at('layout-main'), 'padding-bottom', '31px']
      ],
      layout()
    )
  })

  it('takes the color of the skip link when focused and of the menu button when hovered from their hooks', async () => {
    onRoot({ '--enchase-layout-skip-link-color-focus': 'rgb(1, 2, 3)', '--enchase-layout-header-menu-button-color-hover': 'rgb(4, 5, 6)' })
    renderInBrowser(layout())
    part('layout-skip-link').focus()

    expect(style('layout-skip-link').color).toBe('rgb(1, 2, 3)')

    await userEvent.hover(part('layout-header-menu-button'))
    await becomes(() => part('layout-header-menu-button'), 'color', 'rgb(4, 5, 6)')
  })

  translucentIt('derives the translucent fill of the top bar from its solid color and its alpha', () => {
    onRoot({ '--enchase-app-bar-background-solid': 'rgb(200, 100, 50)', '--enchase-app-bar-background-alpha': '0.5' })
    renderInBrowser(layout({ translucent: true }))

    const derived = surfaceOf(part('layout-header'))

    expect([derived.r, derived.g, derived.b]).toEqual([200, 100, 50])
    expect(derived.a).toBeCloseTo(0.5, 2)
  })
})

describe('the footer from the hooks', () => {
  it('takes the padding, the colors and the link color from their hooks', () => {
    hooked(
      [
        ['--enchase-footer-padding-block', '21px', at('footer'), 'padding-top'],
        ['--enchase-footer-background', 'rgb(1, 2, 3)', at('footer'), 'background-color'],
        ['--enchase-footer-color', 'rgb(4, 5, 6)', at('footer'), 'color'],
        ['--enchase-footer-link-color', 'rgb(7, 8, 9)', at('footer-link'), 'color'],
        ['--enchase-footer-copyright-color', 'rgb(10, 11, 12)', at('footer-copyright'), 'color']
      ],
      <Footer links={links} />
    )
  })

  it('takes the color of a hovered link from its hook', async () => {
    onRoot({ '--enchase-footer-link-color-hover': 'rgb(1, 2, 3)' })
    renderInBrowser(<Footer links={links} />)
    await userEvent.hover(part('footer-link'))
    await becomes(() => part('footer-link'), 'color', 'rgb(1, 2, 3)')
  })
})

describe('the brand, the user of the sidebar and the menu icon from the hooks', () => {
  it('takes the gap, the colors and the sizes of the brand from their hooks', () => {
    hooked(
      [
        ['--enchase-brand-gap', '9px', at('brand'), 'column-gap'],
        ['--enchase-brand-color', 'rgb(1, 2, 3)', at('brand'), 'color'],
        ['--enchase-brand-mark-width', '37px', at('brand-mark'), 'width'],
        ['--enchase-brand-mark-height', '35px', at('brand-mark'), 'height'],
        ['--enchase-brand-mark-background', 'rgb(4, 5, 6)', at('brand-mark'), 'background-color'],
        ['--enchase-brand-mark-color', 'rgb(7, 8, 9)', at('brand-mark'), 'color']
      ],
      <Brand name="Enchase" />
    )
  })

  it('takes the size of the logo image from its hooks', () => {
    hooked(
      [
        ['--enchase-brand-image-width', '39px', at('brand-image'), 'width'],
        ['--enchase-brand-image-height', '41px', at('brand-image'), 'height']
      ],
      <Brand name="Enchase" logo="/enchase-marca.svg" />
    )
  })

  it('takes the color of the brand while hovered from its hook', async () => {
    onRoot({ '--enchase-brand-color-hover': 'rgb(1, 2, 3)' })
    renderInBrowser(<Brand name="Enchase" />)
    await userEvent.hover(part('brand'))
    await becomes(() => part('brand'), 'color', 'rgb(1, 2, 3)')
  })

  it('takes the gaps, the avatar and the colors of the user from their hooks', () => {
    hooked(
      [
        ['--enchase-sidebar-user-gap', '9px', at('sidebar-user'), 'column-gap'],
        ['--enchase-sidebar-user-info-gap', '11px', at('sidebar-user-info'), 'column-gap'],
        ['--enchase-sidebar-user-avatar-width', '43px', at('sidebar-user-avatar'), 'width'],
        ['--enchase-sidebar-user-avatar-height', '45px', at('sidebar-user-avatar'), 'height'],
        ['--enchase-sidebar-user-avatar-background', 'rgb(1, 2, 3)', at('sidebar-user-avatar'), 'background-color'],
        ['--enchase-sidebar-user-avatar-color', 'rgb(4, 5, 6)', at('sidebar-user-avatar'), 'color'],
        ['--enchase-sidebar-user-name-color', 'rgb(7, 8, 9)', at('sidebar-user-name'), 'color'],
        ['--enchase-sidebar-user-logout-color', 'rgb(10, 11, 12)', at('sidebar-user-logout'), 'color']
      ],
      <SidebarUser name="Ana Silva" collapsed={false} onLogout={() => undefined} />
    )
  })

  it('takes the size of the menu icon from its hooks', () => {
    hooked(
      [
        ['--enchase-menu-toggle-icon-width', '33px', at('menu-toggle-icon'), 'width'],
        ['--enchase-menu-toggle-icon-height', '35px', at('menu-toggle-icon'), 'height']
      ],
      <MenuToggleIcon open={false} />
    )
  })
})
