'use client'

import { useSegmentedControl } from 'enchase/experimental/segmented-control'
import { usePagination } from 'enchase/experimental/pagination'
import { useAccordion } from 'enchase/experimental/accordion'
import { useSlider } from 'enchase/experimental/slider'
import { useTabs } from 'enchase/experimental/tabs'

const items = [{ value: 'a' }, { value: 'b' }]

export default function Legacy() {
  const tabs = useTabs({ items })
  const pager = usePagination({ pageCount: 3 })
  const group = useSegmentedControl({ items })
  const accordion = useAccordion({ items, defaultValue: ['a'] })
  const slider = useSlider({ defaultValue: 30 })

  return (
    <section>
      <div {...tabs.getListProps({ 'aria-label': 'Old tabs' })} />

      <nav aria-label="Old pages">
        <button {...pager.getPageProps(pager.page)}>{pager.page}</button>
      </nav>

      <div {...group.getGroupProps({ 'aria-label': 'Old view' })} />

      <div {...accordion.getPanelProps('a', { 'aria-label': 'Old answer' })} />

      <div {...slider.getThumbProps({ 'aria-label': 'Old volume' })} />
    </section>
  )
}
