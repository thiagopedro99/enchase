# Changelog

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
