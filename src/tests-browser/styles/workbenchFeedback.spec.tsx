import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { InlineLoading, Loading } from '@components/common/Loading/index.tsx'
import { demoSections } from '@tests/shared/fixtures/layoutBranding.tsx'
import { at, part, parts, style } from '../support/hookProbes.ts'
import { Progress } from '@components/common/Progress/index.tsx'
import { Skeleton } from '@components/common/Skeleton/index.tsx'
import { Divider } from '@components/common/Divider/index.tsx'
import { Tooltip } from '@components/common/Tooltip/index.tsx'
import { Avatar } from '@components/common/Avatar/index.tsx'
import { Badge } from '@components/common/Badge/index.tsx'
import { Alert } from '@components/common/Alert/index.tsx'
import { workbench } from '@styles/presets/workbench.ts'
import { renderInBrowser } from '../support/harness.tsx'
import { Tag } from '@components/common/Tag/index.tsx'
import { waitForSettled } from '../support/settle.ts'
import { useToast } from '@components/toast/index.ts'
import Layout from '@components/layout/index.tsx'
import Footer from '@components/footer/index.tsx'

import type { ReactElement } from 'react'

const styled = { style: workbench } as const

const show = (ui: ReactElement, mode: 'light' | 'dark' = 'light') => renderInBrowser(ui, 'never', mode, styled)

const showDark = async (ui: ReactElement) => {
  show(ui, 'dark')
  await expect.poll(() => document.documentElement.dataset.theme).toBe('dark')
  await waitForSettled(() => document.body)
}

const px = (value: string) => parseFloat(value)

const popupShadow = 'rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px'

const alerts = (
  <>
    <Alert variant="info">Info</Alert>
    <Alert variant="success">Success</Alert>
    <Alert variant="warning">Warning</Alert>
    <Alert variant="error">Error</Alert>
  </>
)

const badges = (
  <>
    <Badge variant="neutral">Neutral</Badge>
    <Badge variant="primary">Primary</Badge>
    <Badge variant="success">Success</Badge>
    <Badge variant="warning">Warning</Badge>
    <Badge variant="error">Error</Badge>
    <Badge variant="info">Info</Badge>
  </>
)

const Notifier = () => {
  const toast = useToast()

  return (
    <button type="button" onClick={() => toast.success('Saved', 0)}>
      Notify
    </button>
  )
}

const toasted = async (mode: 'light' | 'dark' = 'light') => {
  if (mode === 'dark') await showDark(<Notifier />)
  else show(<Notifier />)

  await userEvent.click(page.getByRole('button', { name: 'Notify' }))
  await expect.poll(() => parts('toast').length).toBe(1)
  await waitForSettled(at('toast'))
}

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

describe('the alert of the workbench style', () => {
  it.each([
    ['info', 'rgb(9, 88, 217)', 'rgb(230, 244, 255)'],
    ['success', 'rgb(35, 120, 4)', 'rgb(246, 255, 237)'],
    ['warning', 'rgb(135, 77, 0)', 'rgb(255, 251, 230)'],
    ['error', 'rgb(207, 19, 34)', 'rgb(255, 242, 240)']
  ] as const)('draws the %s alert with a 1px border and an icon in the color of the type, %s, over the container %s, where the original borders are the tints #91CAFF, #B7EB8F, #FFE58F and #FFCCC7', (variant, color, container) => {
    show(<Alert variant={variant}>Message</Alert>)
    const alert = style('alert')

    expect(alert.borderTopWidth).toBe('1px')
    expect(alert.borderTopStyle).toBe('solid')
    expect(alert.borderTopColor).toBe(color)
    expect(alert.backgroundColor).toBe(container)
    expect(style('alert-icon').color).toBe(color)
  })

  it('writes the message in 0.88 black, as the original does, and not in the color of the type', () => {
    show(alerts)

    for (const index of [0, 1, 2, 3]) expect(style('alert', index).color).toBe('rgba(0, 0, 0, 0.88)')
  })

  it('pads the alert by 8px above and 12px at the sides, rounds it at 8px and puts 8px between the icon and the text, as the original does', () => {
    show(<Alert variant="info">Message</Alert>)
    const alert = style('alert')

    expect([px(alert.paddingTop), px(alert.paddingBottom)]).toEqual([8, 8])
    expect([px(alert.paddingLeft), px(alert.paddingRight)]).toEqual([12, 12])
    expect(px(alert.borderTopLeftRadius)).toBe(8)
    expect(px(alert.fontSize)).toBe(14)
    expect(alert.columnGap).toBe('8px')
  })

  it('makes the alert 43px high, where the original is 40px, because the row of the icon and the close button keep 24px, the floor for a target', () => {
    show(<Alert variant="info">Message</Alert>)

    expect(part('alert').getBoundingClientRect().height).toBeCloseTo(43, 0)
  })

  it('keeps 8px of padding and 14px of type when there is a title, where the original has 20px by 24px and 16px for the title, because neither the title nor the padding has a hook of its own for the case', () => {
    show(
      <Alert variant="info" title="Heads up">
        Message
      </Alert>
    )
    const alert = style('alert')

    expect(px(alert.paddingTop)).toBe(8)
    expect(style('alert-title').fontWeight).toBe('600')
    expect(px(style('alert-title').fontSize)).toBe(14)
    expect(style('alert-content').rowGap).toBe('8px')
  })

  it('keeps the close button at 24px by 24px', () => {
    show(
      <Alert variant="info" onClose={() => undefined}>
        Message
      </Alert>
    )
    const box = part('alert-close').getBoundingClientRect()

    expect([box.width, box.height]).toEqual([24, 24])
  })

  it('paints the borders, the icons and the containers of the four types in the colors of the dark mode', async () => {
    await showDark(alerts)

    expect([0, 1, 2, 3].map((index) => style('alert', index).borderTopColor)).toEqual(['rgb(101, 169, 243)', 'rgb(106, 190, 57)', 'rgb(216, 150, 20)', 'rgb(243, 156, 151)'])
    expect([0, 1, 2, 3].map((index) => style('alert', index).backgroundColor)).toEqual(['rgb(17, 26, 44)', 'rgb(22, 35, 18)', 'rgb(43, 33, 17)', 'rgb(44, 22, 24)'])
    expect([0, 1, 2, 3].map((index) => style('alert-icon', index).color)).toEqual(['rgb(101, 169, 243)', 'rgb(106, 190, 57)', 'rgb(216, 150, 20)', 'rgb(243, 156, 151)'])
    expect(style('alert').color).toBe('rgba(255, 255, 255, 0.85)')
  })
})

describe('the badge of the workbench style', () => {
  it('makes the badge 22px high with 7px of inline padding, a 1px border, 4px corners and 12px regular type, as the original tag does', () => {
    show(<Badge>Label</Badge>)
    const badge = style('badge')

    expect(part('badge').getBoundingClientRect().height).toBe(22)
    expect([px(badge.paddingLeft), px(badge.paddingRight)]).toEqual([7, 7])
    expect(badge.borderTopWidth).toBe('1px')
    expect(badge.borderTopStyle).toBe('solid')
    expect(px(badge.borderTopLeftRadius)).toBe(4)
    expect(px(badge.fontSize)).toBe(12)
    expect(badge.fontWeight).toBe('400')
  })

  it('draws the border of each variant in its own role, the strong border color for the neutral one, over the colors of the container', () => {
    show(badges)

    expect([0, 1, 2, 3, 4, 5].map((index) => style('badge', index).borderTopColor)).toEqual(['rgba(0, 0, 0, 0.45)', 'rgb(9, 88, 217)', 'rgb(35, 120, 4)', 'rgb(135, 77, 0)', 'rgb(207, 19, 34)', 'rgb(9, 88, 217)'])
    expect([0, 1, 2, 3, 4, 5].map((index) => style('badge', index).backgroundColor)).toEqual(['rgb(240, 240, 240)', 'rgb(230, 244, 255)', 'rgb(246, 255, 237)', 'rgb(255, 251, 230)', 'rgb(255, 242, 240)', 'rgb(230, 244, 255)'])
    expect([1, 2, 3, 4].map((index) => style('badge', index).color)).toEqual(['rgb(9, 88, 217)', 'rgb(35, 120, 4)', 'rgb(135, 77, 0)', 'rgb(207, 19, 34)'])
  })

  it('paints the borders in the colors of the dark mode', async () => {
    await showDark(badges)

    expect([0, 1, 2, 3, 4, 5].map((index) => style('badge', index).borderTopColor)).toEqual(['rgba(255, 255, 255, 0.45)', 'rgb(101, 169, 243)', 'rgb(106, 190, 57)', 'rgb(216, 150, 20)', 'rgb(243, 156, 151)', 'rgb(101, 169, 243)'])
  })
})

describe('the tag of the workbench style', () => {
  it('makes the tag 22px high with 7px of inline padding, 4px corners and 12px regular type, as the original does', () => {
    show(<Tag>Label</Tag>)
    const tag = style('tag')

    expect(part('tag').getBoundingClientRect().height).toBe(22)
    expect([px(tag.paddingLeft), px(tag.paddingRight)]).toEqual([7, 7])
    expect(px(tag.borderTopLeftRadius)).toBe(4)
    expect(px(tag.fontSize)).toBe(12)
    expect(tag.fontWeight).toBe('400')
  })

  it('makes the small tag 20px high', () => {
    show(<Tag size="sm">Label</Tag>)

    expect(part('tag').getBoundingClientRect().height).toBe(20)
  })

  it('keeps the remove button at 24px by 24px with 4px corners, which makes the removable tag 26px high where the original has a 10px icon in a 22px tag, under the floor of 24px for a target', () => {
    show(<Tag onRemove={() => undefined}>Label</Tag>)
    const box = part('tag-remove').getBoundingClientRect()

    expect([box.width, box.height]).toEqual([24, 24])
    expect(px(style('tag-remove').borderTopLeftRadius)).toBe(4)
    expect(part('tag').getBoundingClientRect().height).toBe(26)
  })

  it('puts 3px between the label and the remove button, as the original puts 3px of margin before its close icon', () => {
    show(<Tag onRemove={() => undefined}>Label</Tag>)

    expect(style('tag').columnGap).toBe('3px')
    expect(part('tag-remove').getBoundingClientRect().left - part('tag-label').getBoundingClientRect().right).toBeCloseTo(3, 1)
  })

  it('draws the border in the strong border color, which holds 3.35:1 against the page where the #D9D9D9 of the original holds 1.41:1', () => {
    show(<Tag>Label</Tag>)

    expect(style('tag').borderTopColor).toBe('rgba(0, 0, 0, 0.45)')
    expect(style('tag').borderTopWidth).toBe('1px')
  })
})

describe('the tooltip of the workbench style', () => {
  const opened = async (mode: 'light' | 'dark' = 'light') => {
    const ui = (
      <Tooltip text="Tip" openDelay={0}>
        <button type="button">Trigger</button>
      </Tooltip>
    )

    if (mode === 'dark') await showDark(ui)
    else show(ui)

    await userEvent.hover(page.getByRole('button', { name: 'Trigger' }))
    await expect.poll(() => part('tooltip-bubble').getAttribute('data-state')).toBe('open')
    await waitForSettled(at('tooltip-bubble'))
  }

  it('fills the bubble with the dark surface #262626 and writes it in white 14px regular type, as the original does', async () => {
    await opened()
    const bubble = style('tooltip-bubble')

    expect(bubble.backgroundColor).toBe('rgb(38, 38, 38)')
    expect(bubble.color).toBe('rgb(255, 255, 255)')
    expect(px(bubble.fontSize)).toBe(14)
    expect(bubble.fontWeight).toBe('400')
  })

  it('pads the bubble by 6px and 8px and rounds it at 6px, which makes it 34px high, as the original does', async () => {
    await opened()
    const bubble = style('tooltip-bubble')

    expect([px(bubble.paddingTop), px(bubble.paddingLeft)]).toEqual([6, 8])
    expect(px(bubble.borderTopLeftRadius)).toBe(6)
    expect(part('tooltip-bubble').getBoundingClientRect().height).toBeCloseTo(34, 0)
  })

  it('fills the bubble with #424242 in the dark mode, as the original keeps its bubble dark', async () => {
    await opened('dark')

    expect(style('tooltip-bubble').backgroundColor).toBe('rgb(66, 66, 66)')
  })
})

describe('the toast of the workbench style', () => {
  it('pads the toast by 12px at the sides, makes it 40px high and rounds it at 8px with the popup shadow, as the original message does', async () => {
    await toasted()
    const toast = style('toast')

    expect([px(toast.paddingLeft), px(toast.paddingRight)]).toEqual([12, 12])
    expect(px(toast.borderTopLeftRadius)).toBe(8)
    expect(toast.boxShadow).toBe(popupShadow)
    expect(part('toast').getBoundingClientRect().height).toBeCloseTo(40, 0)
  })

  it('keeps 4px of padding above the close button of 32px, which puts the text 9px from the edge as the 9px of padding of the original message does, and does not pad it by 9px, which would make the toast 50px high', async () => {
    await toasted()

    expect([px(style('toast').paddingTop), px(style('toast').paddingBottom)]).toEqual([4, 4])
    expect(part('toast-close').getBoundingClientRect().height).toBe(32)
    expect(part('toast-title').getBoundingClientRect().top - part('toast').getBoundingClientRect().top).toBeCloseTo(9, 0)
  })

  it('draws the icon in a box of 16px with 8px after it, as the original does', async () => {
    await toasted()
    const icon = part('toast').querySelector('svg')?.parentElement as HTMLElement

    expect(icon.getBoundingClientRect().width).toBe(16)
    expect(px(getComputedStyle(icon).marginRight)).toBe(8)
  })

  it('tints the toast with the container of its type, where the original message is white with a colored icon', async () => {
    await toasted()

    expect(style('toast').backgroundColor).toBe('rgb(246, 255, 237)')
    expect(style('toast').color).toBe('rgb(35, 120, 4)')
  })
})

describe('the progress of the workbench style', () => {
  it('draws a track of 8px, as the original does, with the primary blue #0958D9 where the original paints #1677FF', () => {
    show(<Progress value={30} />)

    expect(part('progress-track').getBoundingClientRect().height).toBe(8)
    expect(style('progress-indicator').backgroundColor).toBe('rgb(9, 88, 217)')
    expect(style('progress-track').backgroundColor).toBe('rgb(240, 240, 240)')
  })

  it('draws the circle at 120px and the small one at 60px, as the original does, with a 3 unit stroke in the 48 unit box, which is the 6% of the original', () => {
    show(
      <>
        <Progress value={30} variant="circular" />
        <Progress value={30} variant="circular" size="sm" />
      </>
    )

    expect([part('progress', 0).getBoundingClientRect().width, part('progress', 0).getBoundingClientRect().height]).toEqual([120, 120])
    expect([part('progress', 1).getBoundingClientRect().width, part('progress', 1).getBoundingClientRect().height]).toEqual([60, 60])
    expect(px(style('progress-indicator', 0).strokeWidth)).toBe(3)
  })

  it('paints the bar in the light blue in the dark mode', async () => {
    await showDark(<Progress value={30} />)

    expect(style('progress-indicator').backgroundColor).toBe('rgb(101, 169, 243)')
  })
})

describe('the avatar of the workbench style', () => {
  it('draws the avatar 32px wide, the small one 24px and the large one 40px, as the original does', () => {
    show(
      <>
        <Avatar name="Ana Souza" size="sm" />
        <Avatar name="Ana Souza" />
        <Avatar name="Ana Souza" size="lg" />
      </>
    )

    expect([0, 1, 2].map((index) => part('avatar', index).getBoundingClientRect().width)).toEqual([24, 32, 40])
    expect([0, 1, 2].map((index) => part('avatar', index).getBoundingClientRect().height)).toEqual([24, 32, 40])
  })

  it('fills the avatar with the secondary color, #595959, with white letters in 14px regular type, which hold 7.00:1 where the 25% black of the original holds 1.84:1', () => {
    show(<Avatar name="Ana Souza" />)
    const avatar = style('avatar')

    expect(avatar.backgroundColor).toBe('rgb(89, 89, 89)')
    expect(avatar.color).toBe('rgb(255, 255, 255)')
    expect(px(avatar.fontSize)).toBe(14)
    expect(avatar.fontWeight).toBe('400')
    expect(px(avatar.borderTopLeftRadius)).toBeGreaterThanOrEqual(16)
  })

  it('fills the avatar with #ADADAD and writes it in the dark color in the dark mode', async () => {
    await showDark(<Avatar name="Ana Souza" />)

    expect(style('avatar').backgroundColor).toBe('rgb(173, 173, 173)')
    expect(style('avatar').color).toBe('rgb(20, 20, 20)')
  })
})

describe('the divider of the workbench style', () => {
  it('draws the line 1px wide in the border color and keeps the vertical one at 0.9em, as the original does', () => {
    show(
      <>
        <Divider />
        <Divider orientation="vertical" />
      </>
    )

    expect(style('divider', 0).borderTopWidth).toBe('1px')
    expect(style('divider', 0).borderTopColor).toBe('rgb(240, 240, 240)')
    expect(px(style('divider', 1).minHeight)).toBeCloseTo(12.6, 1)
  })
})

describe('the loading of the workbench style', () => {
  it.each([
    ['sm', 14],
    ['md', 20],
    ['lg', 32]
  ] as const)('draws the %s spinner at %ipx, as the dot of the original', (size, side) => {
    show(<Loading size={size} />)
    const box = part('loading-spinner').getBoundingClientRect()

    expect([box.width, box.height]).toEqual([side, side])
  })

  it('draws the arc in the primary blue over a ring in the border color, 2px thick at 14px, 3px at 20px and 4px at 32px', () => {
    show(
      <>
        <InlineLoading size="sm" />
        <Loading size="md" />
        <Loading size="lg" />
      </>
    )

    expect(style('inline-loading-spinner').borderTopColor).toBe('rgb(9, 88, 217)')
    expect(style('inline-loading-spinner').borderBottomColor).toBe('rgb(240, 240, 240)')
    expect([px(style('inline-loading-spinner').borderTopWidth), px(style('loading-spinner', 0).borderTopWidth), px(style('loading-spinner', 1).borderTopWidth)]).toEqual([2, 3, 4])
  })

  it('draws the extra small spinner at 12px, under the small one', () => {
    show(<Loading size="xs" />)
    const box = part('loading-spinner').getBoundingClientRect()

    expect([box.width, box.height]).toEqual([12, 12])
  })
})

describe('the skeleton of the workbench style', () => {
  it('fills the skeleton with #F0F0F0 and rounds the text and the rectangle at 4px, as the original does', () => {
    show(
      <>
        <Skeleton variant="text" />
        <Skeleton variant="rectangular" />
      </>
    )

    expect(style('skeleton', 0).backgroundColor).toBe('rgb(240, 240, 240)')
    expect([px(style('skeleton', 0).borderTopLeftRadius), px(style('skeleton', 1).borderTopLeftRadius)]).toEqual([4, 4])
  })
})

describe('the layout and the footer of the workbench style', () => {
  it('makes the bar of the layout 64px high and keeps it in the surface color, not in the navy of the original', () => {
    show(
      <Layout pageTitle="Teste" navigationSections={demoSections}>
        <p>Content</p>
      </Layout>
    )

    expect(part('layout-header').getBoundingClientRect().height).toBe(64)
    expect(style('layout-header').backgroundColor).not.toBe('rgb(0, 21, 41)')
  })

  it('pads the footer by 24px above and below and paints it in the page color, #F5F5F5, as the original does, with no hook for the 50px at the sides', () => {
    show(<Footer companyName="Enchase" notice="MIT" />)
    const footer = style('footer')

    expect([px(footer.paddingTop), px(footer.paddingBottom)]).toEqual([24, 24])
    expect(footer.backgroundColor).toBe('rgb(245, 245, 245)')
  })

  it('paints the footer in the black page color in the dark mode, as the original does', async () => {
    await showDark(<Footer companyName="Enchase" notice="MIT" />)

    expect(style('footer').backgroundColor).toBe('rgb(0, 0, 0)')
  })
})
