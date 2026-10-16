# Changelog

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
