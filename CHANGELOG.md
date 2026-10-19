# Changelog

## v0.5.0

[compare changes](https://github.com/thiagopedro99/enchase/compare/v0.4.0...v0.5.0)

### Enhancements

- Add the Pagination ([8f567bf](https://github.com/thiagopedro99/enchase/commit/8f567bf))
- Add the Table ([a1c6740](https://github.com/thiagopedro99/enchase/commit/a1c6740))

### Notes

- New components: `Pagination` and `Table`. Each one has a story with controls, and the props of both are in `API.md`. Besides three optional label keys (below), nothing else changed at runtime: no new theme tokens and no change to the existing components.
- `Pagination` is a `<nav>` with a list of buttons: previous, the numbered pages and next. It takes `pageCount`, `page`, `defaultPage` and `onPageChange(page)`, `siblingCount` and `boundaryCount` (1 each by default: the pages kept beside the current one and at both ends of the list before an ellipsis) and `size` (`md` by default, or `sm`). The current page has `aria-current="page"` and the ellipsis is hidden from screen readers. A `pageCount` below 1 renders nothing, and a `page` outside the range or that is not a whole number is brought back to a valid page. There is no `href` mode yet: it renders buttons only, so with a router, navigate inside `onPageChange`.
- Previous and next are `aria-disabled` at the ends of the list instead of `disabled`, so the focus stays on the button that was just pressed. Their chevrons mirror in right-to-left text. The current page gets a thicker border so it stays visible in forced colors, and the highlight of the buttons reads `--enchase-pagination-*` for its motion, listed in the Movimento table of the README.
- Three keys were added to `UILabels`, all optional: `pagination` (the name of the `<nav>`), `previousPage` and `nextPage`. They are optional so that a `Locale` of your own, written before this version, still type-checks. The `en` and `ptBR` locales define them, and a locale or a `labels` object that leaves them out falls back to the English text. `Pagination` also takes `ariaLabel`, to tell two paginations on the same page apart.
- `Table` takes `columns` and `rows` and renders a real `<table>` with scoped headers and cells, and a `<caption>` when you pass `caption`. It is generic: `TableColumn<Row>` ties each column to the type of the rows. A column has `key`, `header` and, optionally, `cell(row, index)` for custom content (without it the column shows `row[key]` as text), `align` (`start`, `center` or `end`), `width` and `rowHeader` (its cells become row headers). The table also takes `getRowKey`, `caption`, `ariaLabel`, `empty` (shown in one cell across all columns when there are no rows), `size` (`md` by default, or `sm`) and `striped`. `className`, `style` and the other attributes go to the container `<div>`, and so does the `ref`.
- A table wider than its space scrolls horizontally inside the container. Only then does the container become a tab stop, so the keyboard can scroll it, and, when the table has a `caption` or an `ariaLabel`, a `region` named after it. The `Table` does not sort, select rows, paginate or keep the header fixed: sort the data before passing it, and put the `Pagination` beside it.

## v0.4.0

[compare changes](https://github.com/thiagopedro99/enchase/compare/v0.3.0...v0.4.0)

### Enhancements

- Add the Switch ([4202cc2](https://github.com/thiagopedro99/enchase/commit/4202cc2))
- Add the RadioGroup ([5141364](https://github.com/thiagopedro99/enchase/commit/5141364))
- Add the Tabs ([8ff3563](https://github.com/thiagopedro99/enchase/commit/8ff3563))
- Add the Accordion ([ddec340](https://github.com/thiagopedro99/enchase/commit/ddec340))

### Notes

- New components: `Switch`, `RadioGroup`, `Tabs` and `Accordion`. Each one has a story with controls, and the props of all four are in `API.md`. Nothing else changed at runtime: no new theme tokens, no new keys in the locales and no change to the existing components.
- `Switch` is a native `<input type="checkbox">` with `role="switch"`, so screen readers announce a switch and a form submits its value only while it is on. It takes `label`, `wrapperClassName`, `wrapperStyle`, `animation`, a `ref` and the attributes of the input. Use the `Checkbox` for a choice that only counts when the form is sent.
- `RadioGroup` takes its choices as `options` (`{ value, label, disabled? }`), and there is no standalone `Radio` yet. It renders a `<fieldset role="radiogroup">` titled by `label`, with `value`, `defaultValue` and `onValueChange(value)` (pass `value=""` to control it with nothing selected), `name` (generated when missing), `required`, `error`, `helperText`, `orientation` (`vertical` by default, or `horizontal`) and `disabled`, for the whole group or for one option. `className` and `style` go to the `<fieldset>`, and the arrow keys are the native ones of radio buttons.
- `Tabs` takes `items` (`{ value, label, content, disabled? }`), `value`, `defaultValue` and `onValueChange(value)`, `activation` (`automatic` by default, where an arrow key selects the tab, or `manual`, where it only moves the focus and Enter or Space selects) and `ariaLabel`, which names the tab list for screen readers. The tabs are horizontal only. The selected tab is the single tab stop, the arrow keys (swapped in right-to-left text), Home and End move between tabs, and disabled tabs are skipped. Every panel stays in the document and only the selected one is shown, so the state of the others is kept. A list that does not fit scrolls horizontally.
- The indicator of the `Tabs` slides under the selected tab with `translate` and `scale`. It is measured from its own position, so right-to-left text needs no special case, and it is placed again when the tabs change size or when the `dir` of the `UIProvider` changes. If you flip the `dir` of the page by hand without rendering the `Tabs` again, it is only placed again at the next selection.
- `Accordion` takes `items` (`{ value, title, content, disabled? }`), `multiple` (several items open at once; by default one at a time, and the open one can still be closed), `value`, `defaultValue` and `onValueChange(values)` with the list of open items, and `headingLevel` (2 to 6, 3 by default). Each item is a heading with a button (`aria-expanded`), and its panel is a region linked to the button. Tab goes through the buttons, and the arrow keys, Home and End move the focus. Closed panels stay in the document. The height does not animate, because the collapse of the permanent `Sidebar` is still the only layout animation of the package: the panel fades in with a 6 px slide and the arrow turns.
- The thumb of the `Switch`, the dot of the `RadioGroup` and the indicator of the `Tabs` are drawn with borders, so they stay visible in forced colors (the Windows high contrast mode). The new components read `--enchase-switch-*`, `--enchase-radio-group-*`, `--enchase-tabs-*` and `--enchase-accordion-*` for their motion, listed in the Movimento table of the README.

## v0.3.0

[compare changes](https://github.com/thiagopedro99/enchase/compare/v0.2.1...v0.3.0)

### Enhancements

- Add the Textarea ([f4511c3](https://github.com/thiagopedro99/enchase/commit/f4511c3))
- Add the Badge ([1937652](https://github.com/thiagopedro99/enchase/commit/1937652))
- Add the Alert ([88147ad](https://github.com/thiagopedro99/enchase/commit/88147ad))

### Notes

- New components: `Textarea`, `Badge` and `Alert`. Each one has a story with controls, and the props of all three are in `API.md`. Nothing else changed at runtime: no new theme tokens, no new keys in the locales and no change to the existing components.
- `Textarea` takes the props of the `Input` (`label`, `error`, `helperText`, `fullWidth`, `wrapperClassName`, `wrapperStyle` and a `ref`) and adds `rows` (3 by default) and `resize` (`vertical` by default, or `none`, `horizontal` and `both`). It has no character counter and does not grow with its content.
- `Badge` has the variants `neutral` (default), `primary`, `success`, `warning`, `error` and `info`, and the sizes `sm` and `md` (default). The colors come from the container pairs of the theme, so a custom theme keeps them readable, but the text of the badge has to carry the meaning, not only the color.
- `Alert` has the variants `info` (default), `success`, `warning` and `error`, an optional `title`, an optional `icon` (`null` or `false` hides it) and `onClose`, which shows the close button. The `Alert` never removes itself: remove it when `onClose` runs. The close button is named by `labels.closeToast`, so no key was added to `UILabels`.
- Only the `error` variant of the `Alert` has `role="alert"`. The others have `role="status"`, which screen readers usually do not announce when the alert already appears with its text: pass `role="alert"` for a message inserted after the page has loaded.

## v0.2.1

[compare changes](https://github.com/thiagopedro99/enchase/compare/v0.2.0...v0.2.1)

### Fixes

- Leave hash links of the current page to the browser ([02af617](https://github.com/thiagopedro99/enchase/commit/02af617))
- Route internal button links through navigate ([e87b2d9](https://github.com/thiagopedro99/enchase/commit/e87b2d9))

### Notes

- A link whose `href` has a hash and points to the current page (`/#recursos` on `/`, `/sobre#equipe` on `/sobre`) is now left to the browser, which scrolls to the element. It used to go through the `navigate` of the `UIProvider`, so it needed `native: true` to scroll. The current page is the path of `currentHref` or, when the provider has none, `window.location.pathname` at the time of the click. A hash link to another page still goes through `navigate`, with the hash in the `href`.
- In the `Sidebar`, the `Navbar` and the breadcrumbs derived by the `Layout`, those same-page hash links count as sections, not as routes: they get `aria-current="location"` only when they are the active section, never `aria-current="page"`, and they are left out of the breadcrumb trail.
- `ButtonLink` now calls the `navigate` of the `UIProvider` on a plain click on an internal route, like `Link`, and accepts `native` to skip it. Before, it was always a plain anchor, so an internal `ButtonLink` reloaded the page even with a router connected. Use `native` (or `target`) where you want the browser to load the page.
- The package now ships an `API.md` with the props, types, defaults and hooks of every component (`node_modules/enchase/API.md`), generated from the types and the Storybook stories. The README has a table with how each `href` is handled and the common props, and Storybook has pages for `Link`, `ButtonLink`, `ConfirmModal`, `InlineLoading`, `UIProvider`, `ColorModeProvider` and `ToastProvider`.

## v0.2.0

[compare changes](https://github.com/thiagopedro99/enchase/compare/v0.1.2...v0.2.0)

### Enhancements

- Accept a node and a link for the navbar logo ([c5326b5](https://github.com/thiagopedro99/enchase/commit/c5326b5))
- Add an actions slot to the navbar ([93376e7](https://github.com/thiagopedro99/enchase/commit/93376e7))
- Generate a theme from a brand color ([7cabfcd](https://github.com/thiagopedro99/enchase/commit/7cabfcd))

### Refactors

- Move the rgb color reader out of the contrast module ([a7407ec](https://github.com/thiagopedro99/enchase/commit/a7407ec))

### Notes

- `createTheme({ brand })` builds the light and dark palettes from one opaque hex or `rgb()` color, and it also works in `<ColorModeProvider theme={{ brand }}>`. The brand color is the light `primary` when it passes the contrast checks of the theme, and otherwise a darker shade of the same hue is used, so a yellow or an amber becomes a mustard or a brown on light surfaces. The semantic colors, shadows, fonts and motion are not changed, and the `light.colors` and `dark.colors` you pass still win over the generated ones. `validateTheme` reports no pair for any brand color.
- The generator adds about 1.7 kB gzip to an app that imports `ColorModeProvider`, because the provider uses `createTheme`. Importing only components such as `Button` or `Icon` is unchanged.
- The navbar `actions` are rendered in one place at a time: in the bar on wide screens and in the drawer, under the links, on compact ones. The navbar logo link now has `data-slot="navbar-logo"`; it used to carry the generic `data-slot="link"`.

## v0.1.2

[compare changes](https://github.com/thiagopedro99/enchase/compare/v0.1.1...v0.1.2)

### Fixes

- Start the scroll spy without an active section ([ee9251f](https://github.com/thiagopedro99/enchase/commit/ee9251f))
- Avoid a double period after the footer company name ([01159f4](https://github.com/thiagopedro99/enchase/commit/01159f4))
- Use the library link in the footer ([9496ce2](https://github.com/thiagopedro99/enchase/commit/9496ce2))
- Make the icon name optional ([b4e47f2](https://github.com/thiagopedro99/enchase/commit/b4e47f2))

### Notes

`useScrollSpy` used to return the first id before any section was reached. It now returns `undefined` until a section reaches the reading band, and goes back to `undefined` above the first section, so a hero before the first section no longer marks the first menu item. Make sure the prop that receives the value (`activeSectionId`, `activePageSectionId`) accepts `undefined`.

## v0.1.1

[compare changes](https://github.com/thiagopedro99/enchase/compare/v0.1.0...v0.1.1)

### Fixes

- Emit the use client directive on every platform ([230db91](https://github.com/thiagopedro99/enchase/commit/230db91))

### Notes

v0.1.0 was built on Windows and shipped without the `'use client'` directive in `index.js`, so a Next.js App Router build failed with `createContext is not a function`. Use v0.1.1 or newer.

## v0.1.0

First public release of Enchase, a set of accessible React 19 components with no runtime dependency besides React. While the version is `0.x`, the API may still change between minor versions.

### Highlights

- Components: Button, ButtonLink, Link, Icon, Input, Select, Checkbox, Card, Modal, ConfirmModal, Popover, Tooltip, Toast, Loading, InlineLoading, Skeleton, Sidebar, Navbar, Layout, Breadcrumbs, Footer, Container, Flex, Grid, ThemeToggle and VisuallyHidden.
- Theme with validated contrast: `createTheme` and `validateTheme` in `enchase/theme`, light and dark, and a static `theme.css` for the default theme.
- CSS first: the component styles in `styles.css`, the same rules inside `@layer enchase` in `styles.layer.css`, and the `className` of the caller always wins over the library.
- Motion built in CSS, with spring tokens and `prefers-reduced-motion` support, and no animation library.
- Server rendering and React Server Components (proved with a Next 15 app), RTL, and the `en` and `ptBR` locales in `enchase/locales`.
- Bootstrap 5 breakpoints with `UIProvider breakpoints` and `useBreakpoint`.
- One file per module and `sideEffects` only for CSS, so a bundler drops what is not imported.
