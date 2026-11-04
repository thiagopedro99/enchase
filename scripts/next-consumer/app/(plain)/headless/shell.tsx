'use client'

import { useSegmentedControl } from 'enchase/experimental/segmented-control'
import { usePagination } from 'enchase/experimental/pagination'
import { useAccordion } from 'enchase/experimental/accordion'
import { useSlider } from 'enchase/experimental/slider'
import { useTabs } from 'enchase/experimental/tabs'

const items = [{ value: 'a' }, { value: 'b' }]

export default function Shell() {
  const tabs = useTabs({ items })
  const pager = usePagination({ pageCount: 3 })
  const group = useSegmentedControl({ items })
  const accordion = useAccordion({ items, defaultValue: ['a'] })
  const slider = useSlider({ defaultValue: 30 })

  return (
    <div>
      <div {...tabs.getListProps({ 'aria-label': 'Headless tabs' })}>
        {items.map((item) => (
          <button key={item.value} {...tabs.getTabProps(item.value)}>
            {item.value}
          </button>
        ))}
      </div>

      {items.map((item) => (
        <div key={item.value} {...tabs.getPanelProps(item.value)}>
          {item.value} panel
        </div>
      ))}

      <nav aria-label="Headless pages">
        <button {...pager.getPreviousProps({ 'aria-label': 'Previous' })} />

        {pager.items.map((item) =>
          typeof item === 'number' ? (
            <button key={item} {...pager.getPageProps(item)}>
              {item}
            </button>
          ) : (
            <span key={item}>...</span>
          )
        )}

        <button {...pager.getNextProps({ 'aria-label': 'Next' })} />
      </nav>

      <div {...group.getGroupProps({ 'aria-label': 'Headless view' })}>
        {items.map((item) => (
          <button key={item.value} {...group.getItemProps(item.value)}>
            {item.value}
          </button>
        ))}
      </div>

      {items.map((item) => (
        <div key={item.value}>
          <h3>
            <button {...accordion.getTriggerProps(item.value)}>{item.value}</button>
          </h3>

          <div {...accordion.getPanelProps(item.value)}>{item.value} content</div>
        </div>
      ))}

      <div {...slider.getControlProps()}>
        <div {...slider.getTrackProps()}>
          <div {...slider.getThumbProps({ 'aria-label': 'Headless volume' })} />
        </div>
      </div>
    </div>
  )
}
