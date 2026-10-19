# Changelog

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
