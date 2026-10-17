# Changelog

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
