# Headless hooks

**Stable since 0.20.** The hooks and their types are part of the public API, as [VERSIONING.md](VERSIONING.md) says. They were experimental in 0.18 and 0.19, and the old `enchase/experimental/<name>` paths still work, flagged as deprecated, until 1.0 (see the end of this page).

A hook gives you the behavior of a component, which is its state, its keyboard, its roles and its ARIA attributes, and none of its markup or CSS. You write the elements, and the hook hands you what to spread on each one. Five components have one: `Tabs`, `Pagination`, `SegmentedControl`, `Accordion` and `Slider`, and the components of the package are built on the very same hooks.

Which one to use:

- A component, when its look is enough or the CSS hooks, the styles and the props can change it.
- `enchase eject`, when you want the whole component with its markup and CSS, as code that is yours ([EJECT.md](EJECT.md)).
- A hook, when the markup has to be different: another element, another structure, your own design system.

## Use one

Each hook has an entry of its own, with the hook and its types and nothing else: `enchase/headless/tabs`, `enchase/headless/pagination`, `enchase/headless/segmented-control`, `enchase/headless/accordion` and `enchase/headless/slider`. An entry starts with `'use client'` and a hook is called in a Client Component. A hook brings no CSS, no component and no `UIProvider`: it works outside one, and the text of every label is yours.

```tsx
'use client'

import { useTabs } from 'enchase/headless/tabs'

const items = [
  { value: 'profile', label: 'Profile' },
  { value: 'billing', label: 'Billing', disabled: true },
  { value: 'team', label: 'Team' }
]

export const Sections = () => {
  const tabs = useTabs({ items })

  return (
    <div>
      <div {...tabs.getListProps({ 'aria-label': 'Account' })}>
        {items.map((item) => (
          <button key={item.value} {...tabs.getTabProps(item.value, { className: 'tab', 'data-selected': item.value === tabs.selected ? '' : undefined })}>
            {item.label}
          </button>
        ))}
      </div>

      {items.map((item) => (
        <div key={item.value} {...tabs.getPanelProps(item.value)}>
          {item.label} panel
        </div>
      ))}
    </div>
  )
}
```

## The prop getters

A hook returns its state and one getter for each part of the component. A getter returns an object to spread on your element, with what that part needs: the roles, the ARIA attributes, the `tabIndex`, the handlers and, when the hook has to reach the element, a `ref`. The getter of a part that belongs to an item takes the `value` of the item, or the page number in `Pagination`: `getTabProps(value)`, `getPanelProps(value)`, `getItemProps(value)`, `getTriggerProps(value)`, `getPageProps(page)`.

The last argument of a getter is yours, and it is how you add props without losing what the hook did:

- Your handlers run first, and the handler of the hook runs after them even if yours calls `preventDefault()`.
- Your `ref` is kept, and the hook gets its own too.
- Any other prop wins over the hook, an `id` included. A getter never rewrites what another one gives, so if you replace the `id` of a tab, pass the new `aria-labelledby` to its panel in the second argument of `getPanelProps`.
- The type of the argument is the attributes of an HTML element plus what you pass, so a handler written there has its event typed and an inline `style` is checked.

Write your props in that argument, and not after the spread: `<button {...tabs.getTabProps(value)} onClick={handle}>` replaces the handler of the hook, and the tab stops working.

The state that your CSS needs, such as `data-state="on"`, `data-open` or `data-dragging`, is not in the getters. Each hook returns the state (`selected`, `expanded`, `dragging`...), and you set the attribute that suits your markup.

## Values, ids and direction

- A value that is not in `items` gives a part that is not selected or open. Pass the values of the items.
- `useTabs` and `useAccordion` build the ids that tie a tab or a trigger to its panel from `useId` and from the position of the value in `items`, so they are the same on the server and in the browser.
- The keys that depend on the side (the arrows of the tabs, of the segmented control and of the slider, and the pointer of the slider) read the `direction` of the element when the key is pressed or the pointer goes down. Put `dir="rtl"` on a parent, and use logical properties (`inset-inline-start`) to position what follows the value.
- The hooks do not animate: motion is the work of your CSS.

## useTabs

```ts
useTabs({ items, value?, defaultValue?, onValueChange?, activation? })
```

`activation` is `'automatic'` (the default) or `'manual'`. The arrows and `Home` and `End` move the focus along the enabled tabs (the arrows wrap around and swap in right to left), and in automatic activation the focused tab is the selected one; in manual activation `Enter`, `Space` or a click selects. Only the selected tab (or the first enabled one) is in the tab order. It returns `selected`, `activeIndex`, `tabbableIndex`, `select(value)`, `getListProps`, `getTabProps(value)` and `getPanelProps(value)`. Put the list `aria-label` in the argument of `getListProps`.

## usePagination

```ts
usePagination({ pageCount, page?, defaultPage?, onPageChange?, siblingCount?, boundaryCount? })
```

It returns the current `page`, the `pageCount`, the `items` to draw (page numbers and the strings `'start-ellipsis'` and `'end-ellipsis'`), `hasPrevious`, `hasNext`, `goTo(page)` and the getters `getPreviousProps`, `getNextProps` and `getPageProps(page)`. The counts are read as whole numbers that are not negative and the page stays inside the range. The page that is current has `aria-current="page"`, and the previous and next buttons stay focusable at the ends with `aria-disabled`, so the focus does not jump. Their `aria-label` is yours.

```tsx
'use client'

import { usePagination } from 'enchase/headless/pagination'

export const Pages = ({ pageCount }: { pageCount: number }) => {
  const pagination = usePagination({ pageCount })

  return (
    <nav aria-label="Pages">
      <button {...pagination.getPreviousProps({ 'aria-label': 'Previous page' })}>Previous</button>

      {pagination.items.map((item) =>
        typeof item === 'number' ? (
          <button key={item} {...pagination.getPageProps(item)}>
            {item}
          </button>
        ) : (
          <span key={item} aria-hidden="true">
            ...
          </span>
        )
      )}

      <button {...pagination.getNextProps({ 'aria-label': 'Next page' })}>Next</button>
    </nav>
  )
}
```

## useSegmentedControl

```ts
useSegmentedControl({ items, multiple?, value?, defaultValue?, onValueChange?, disabled? })
```

The options follow the component: with `multiple` the value is a list and `onValueChange` gets a list, and without it the value is a string. By default the group is a radio group (`getGroupProps` gives `role="radiogroup"`, and each item is a `role="radio"` with `aria-checked`), with one tab stop; the arrows, `Home` and `End` move the focus and check what they focus. With `multiple` it is a `role="group"` of toggle buttons (`aria-pressed`) that all stay in the tab order, and the arrows do not move. It returns `selected` (always a list), `choose(value)`, `getGroupProps` and `getItemProps(value)`. `disabled` turns off every item, and the `disabled` of an item turns off that one.

```tsx
'use client'

import { useSegmentedControl } from 'enchase/headless/segmented-control'

const views = ['list', 'board', 'calendar']

export const Views = () => {
  const segmented = useSegmentedControl({ items: views.map((value) => ({ value })), defaultValue: 'list' })

  return (
    <div {...segmented.getGroupProps({ 'aria-label': 'View' })}>
      {views.map((view) => (
        <button key={view} {...segmented.getItemProps(view, { 'data-state': segmented.selected.includes(view) ? 'on' : 'off' })}>
          {view}
        </button>
      ))}
    </div>
  )
}
```

## useAccordion

```ts
useAccordion({ items, multiple?, value?, defaultValue?, onValueChange? })
```

The value is a list of the open values. One item is open at a time unless `multiple` is set. Every enabled trigger is in the tab order, and the arrows, `Home` and `End` move the focus along them without opening anything; `Enter` and `Space` toggle. The panel is `role="region"` named by its trigger, and `hidden` while it is closed. The heading around the trigger is yours, and so is its level. It returns `expanded`, `toggle(value)`, `getTriggerProps(value)` and `getPanelProps(value)`.

```tsx
'use client'

import { useAccordion } from 'enchase/headless/accordion'

const questions = [
  { value: 'plan', question: 'Which plan do I need?', answer: 'The free one is enough to start.' },
  { value: 'cancel', question: 'Can I cancel?', answer: 'At any time.' }
]

export const Faq = () => {
  const accordion = useAccordion({ items: questions, multiple: true })

  return (
    <div>
      {questions.map((item) => (
        <section key={item.value}>
          <h3>
            <button {...accordion.getTriggerProps(item.value)}>{item.question}</button>
          </h3>

          <div {...accordion.getPanelProps(item.value)}>{item.answer}</div>
        </section>
      ))}
    </div>
  )
}
```

## useSlider

```ts
useSlider({ value?, defaultValue?, onValueChange?, min?, max?, step?, formatValue?, disabled? })
```

The value stays on a step inside the range, and an invalid one is shown at the minimum. The arrows move by one step (the left and right ones swap in right to left), `PageUp` and `PageDown` by a tenth of the range, and `Home` and `End` go to the ends. The mouse and the pen set the value where they go down and follow the drag; a touch waits for the finger to go across (up and down is the page scrolling) and a tap sets the value where the finger is lifted. It returns `value`, `percent`, `valueText` (the formatted value), `dragging`, `pointerFocus` (true after a pointer takes the focus, so that you do not draw a focus ring for it), `setValue(value)` and three getters: `getControlProps` for the area that takes the pointer, `getTrackProps` for the line whose width is the range, and `getThumbProps` for the thumb, which gets the `role="slider"` and the focus. The name of the slider is yours (`aria-label` or `aria-labelledby` in the argument of `getThumbProps`).

The control needs `touch-action: pan-y` and `user-select: none`, so that a vertical drag scrolls the page and a horizontal one does not select text. Position the thumb with `percent` and a logical property, so that it mirrors in right to left.

```tsx
'use client'

import { useSlider } from 'enchase/headless/slider'

export const Volume = () => {
  const slider = useSlider({ defaultValue: 30, formatValue: (value) => `${value}%` })

  return (
    <div>
      <div {...slider.getControlProps({ style: { position: 'relative', inlineSize: 240, blockSize: 24, touchAction: 'pan-y', userSelect: 'none' } })}>
        <div {...slider.getTrackProps({ style: { position: 'absolute', inset: 0 } })}>
          <div {...slider.getThumbProps({ 'aria-label': 'Volume', style: { position: 'absolute', insetInlineStart: `${slider.percent}%`, inlineSize: 16, blockSize: 24 } })} />
        </div>
      </div>

      <output>{slider.valueText}</output>
    </div>
  )
}
```

## What is checked

The jsdom tests of every hook, the specs that run it in real Chromium, Firefox and WebKit (focus, keyboard, pointer and right to left), the size of each entry, a Next 15 app that calls the five hooks in a Client Component under a Server Component, and the compilation of the examples above against the packed package, with `strict` and `exactOptionalPropertyTypes`, which also checks that each old `enchase/experimental/<name>` path still compiles and is flagged as deprecated, and that none of the new ones is. The reference of the options and of what each hook returns is in [API.md](API.md).

## Stability and the old path

The hooks are part of the stable API since 0.20. They were experimental in 0.18 and 0.19, and each one kept its signature in both, which is what [VERSIONING.md](VERSIONING.md) asks for a promotion, together with this page and the specs in real Chromium, Firefox and WebKit that cover their focus and their pointer.

The old paths, `enchase/experimental/tabs`, `pagination`, `segmented-control`, `accordion` and `slider`, are deprecated aliases: each one exports the very hooks and types of the `enchase/headless/<name>` of the same name, so nothing breaks, and the editor and `tsc` flag every import of them as deprecated. They are removed in 1.0. To move, change `experimental` to `headless` in the import and nothing else.
