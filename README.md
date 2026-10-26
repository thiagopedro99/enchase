<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/thiagopedro99/enchase/main/public/enchase-logo-branco.svg">
    <img src="https://raw.githubusercontent.com/thiagopedro99/enchase/main/public/enchase-logo.svg" alt="Enchase" width="360">
  </picture>
</p>

<p align="center"><b>English</b> · <a href="https://github.com/thiagopedro99/enchase/blob/main/README.pt-BR.md">Português</a></p>

# Enchase

Accessible React components, by contract: a theme with validated contrast, CSS first, its own motion, SSR and RTL, and no runtime dependency besides React.

<p align="center">
  <img src="https://raw.githubusercontent.com/thiagopedro99/enchase/main/public/preview.png" alt="A sign-in form built with Enchase, in the light theme on the left and in the dark theme on the right" width="900">
</p>

[Storybook](https://enchase.othiagosilva.com.br/docs/) · [Demo](https://enchase.othiagosilva.com.br/) · [API reference](API.md) · [Changelog](CHANGELOG.md)

> Version `0.x`: the API can still change between minor versions, and the changelog says what changed in each release.

## Install

```bash
npm install enchase
```

`react` and `react-dom` (version 19) are peer dependencies. The package is ESM and ships its types.

Supported browsers: Chrome and Edge 120, Firefox 129 and Safari 17.5 (iOS 17.5), or newer. The list is the `browserslist` field of `package.json`, which also sets the target of the published CSS, and it is the support policy of the library. The one hard requirement is `inert`, which isolates the page behind a modal (Chrome 102, Safari 15.5 and Firefox 112). The rest degrades gracefully in an older browser: without `@starting-style` the entry animation is gone, without `linear()` the spring falls back to the `ease` curve, and without `color-mix()` some state backgrounds (hover and disabled) don't show.

## Quick start

### Next.js (App Router)

```tsx
import { ColorModeProvider, ColorModeScript, GlobalStyles, ToastProvider, UIProvider } from 'enchase'
import 'enchase/styles.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorModeScript />
      </head>
      <body>
        <ColorModeProvider>
          <GlobalStyles />
          <UIProvider>
            <ToastProvider>{children}</ToastProvider>
          </UIProvider>
        </ColorModeProvider>
      </body>
    </html>
  )
}
```

`ColorModeScript` applies the saved or system color mode before the first paint, which is why `<html>` has `suppressHydrationWarning`.

### Vite

```tsx
import { createRoot } from 'react-dom/client'
import { ColorModeProvider, GlobalStyles, ToastProvider, UIProvider } from 'enchase'
import 'enchase/styles.css'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <ColorModeProvider>
    <GlobalStyles />
    <UIProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </UIProvider>
  </ColorModeProvider>
)
```

The default font is Figtree: load it in your app (for example with `@fontsource-variable/figtree`) or set another family in the theme.

`GlobalStyles` is optional. It adds a small stylesheet, in `@layer enchase-base`: a reset of `box-sizing`, margin and padding, the theme's font, color and background on `<body>`, the size of the headings, thin scrollbars, the focus ring, the selection color and shortened animations under `prefers-reduced-motion`. Leave it out if your app already has its own base styles: the components style themselves. In that case, give `<body>` the theme's colors (`background-color: var(--enchase-color-background)` and `color: var(--enchase-color-text-primary)`) and set `scrollbar-gutter: stable` on `<html>`, so the page doesn't shift sideways when a modal locks the scroll.

### Your first screen

```tsx
import { Button, Card, Checkbox, Input } from 'enchase'

export const SignIn = () => (
  <Card variant="elevated">
    <Input label="Email" type="email" helperText="We never share your address." fullWidth />
    <Input label="Password" type="password" passwordToggle fullWidth />
    <Checkbox label="Remember me" defaultChecked />
    <Button>Sign in</Button>
  </Card>
)
```

That one is safe in a Server Component. Hooks need a Client Component:

```tsx
'use client'

import { Button, useToast } from 'enchase'

export const SaveButton = () => {
  const { success } = useToast()

  return <Button onClick={() => success('Saved')}>Save</Button>
}
```

Each toast method (`success`, `error`, `warning`, `info` and `addToast`) returns the id of the notification, which `removeToast` takes to close it.

## Components

- **Actions:** `Button`, `ButtonLink`, `Link`, `ThemeToggle`
- **Forms:** `Input`, `Textarea`, `NumberInput`, `Select`, `Checkbox`, `Switch`, `RadioGroup`
- **Content:** `Accordion`, `Alert`, `Avatar`, `Badge`, `Card`, `CardButton`, `CardLink`, `Divider`, `Skeleton`, `Table`, `Tabs`, `Tag`
- **Feedback and overlays:** `Loading`, `InlineLoading`, `Progress`, `Modal`, `ConfirmModal`, `Popover`, `Tooltip`, and the toasts (`ToastProvider` and `useToast`)
- **Navigation and layout:** `Breadcrumbs`, `Footer`, `Layout`, `Navbar`, `Pagination`, `Sidebar`, `Container`, `Flex`, `Grid`
- **Utilities:** `Icon`, `VisuallyHidden`, and the 19 icons the components use inside, in `enchase/icons`

Each one has a page in the [Storybook](https://enchase.othiagosilva.com.br/docs/) and a section in [API.md](API.md).

## Make it yours

`ColorModeProvider` takes a `theme`. Three options cover most apps:

```tsx
import { ColorModeProvider } from 'enchase'
import { shadcn } from 'enchase/styles/shadcn'

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <ColorModeProvider theme={{ style: shadcn, brand: '#0F766E', shape: 'soft' }}>{children}</ColorModeProvider>
)
```

- `brand` is one color (hex or `rgb()`, without transparency), and `createTheme` derives the light and dark palettes from it. The tests of the library sweep hundreds of brand colors, from very light to very dark and from gray to vivid, and require that `validateTheme` finds no pair below the minimum contrast.
- `shape` is the corner radius: `pill` (the default), `soft` or `square`.
- `style` changes the look of the whole kit at once. `enchase` is the default, and `shadcn` comes closer to shadcn/ui: a neutral palette, borders instead of shadows, 36 px controls and the label above the field. Each style is its own entry (`enchase/styles/<name>`), so only the one you import reaches your bundle.

What you pass overrides the style, and your own CSS overrides both: every part has a `data-slot` and reads variables named `--enchase-<slot>-<property>`, and the full list, generated from the CSS, is in [API.md](API.md). In development the provider warns in the console about color pairs below the minimum contrast. Outside React (build, server, CI), run `validateTheme(createTheme(theme))` from `enchase/theme`.

## Good to know

- **No router needed.** `Link`, `ButtonLink`, the items of `Sidebar` and `Navbar`, `Breadcrumbs` and the links of `Footer` are real `<a href>`. Give `UIProvider` a `navigate` function and a plain click on a route of your app goes through it; without one, the links reload the page. `currentHref` marks the active item.
- **Languages and RTL.** The accessibility texts come from the `locale` of `UIProvider`: English by default, and `ptBR` ships in `enchase/locales`. A custom locale with `dir: 'rtl'` covers right-to-left languages. The CSS uses logical properties, and what has to be mirrored (the directional icons, the thumb of the switch, the notch of the floating labels) follows the `dir` attribute of the document or of an ancestor, whatever its `lang`, through plain attribute selectors that no build step rewrites. Setting `dir="rtl"` on `<html>` is up to your app, and a `dir="ltr"` island inside a right-to-left page is not un-mirrored.
- **Server rendering.** The components render on the server without hydration errors. The package is marked `'use client'`, so server pages and layouts import the components directly.
- **Two stylesheets.** `enchase/styles.css` is the one in the quick start. `enchase/styles.layer.css` is the same CSS inside `@layer enchase`, so any unlayered CSS of yours wins in any order. Import one of them, never both.

## Package entries

| Entry | Contents |
| --- | --- |
| `enchase` | Components, providers, hooks and types. Marked `'use client'`. |
| `enchase/theme` | `createTheme`, `defineStyle`, `validateTheme`, `validateMotion`, `contrastRatio`, `spring`, `timedSpring`, `themeCss` and the tokens (`baseTokens`, `defaultTheme`, `lightTheme`, `darkTheme`, `breakpoints`, `colorRoles`, `themeModes`, `defaultThemeCss`), with their types. Nothing else is public. No React. |
| `enchase/styles/<name>` | One visual style per entry: `enchase/styles/shadcn` and `enchase/styles/enchase`. Data only, no React, and only in the bundle of whoever imports it. |
| `enchase/locales` | `en` and `ptBR` (`{ locale, dir, messages }`). Data only. |
| `enchase/icons` | The 19 icons the components use inside, one component per icon. Works in Server Components. |
| `enchase/styles.css` | The CSS of the components. |
| `enchase/styles.layer.css` | The same CSS inside `@layer enchase`. |
| `enchase/theme.css` | The variables of the default theme, light and dark, as a static file. |

Consumers import only from these entries. The internal code (`src/`) is not public.

## What is verified, and what is not

Verified by automated tests:

- Every component passes axe (vitest-axe) in jsdom, and the flows of focus, `inert`, scroll lock, stacked Esc and focus restoration run in real Chromium, Firefox and WebKit.
- The color pairs of the default palette (light and dark) reach 4.5:1 for text and 3:1 for field borders and the focus ring. `createTheme` throws on an invalid color, and `validateTheme` lists the pairs below the minimum.
- Interactive targets are at least 24 × 24 px, and the components respect `prefers-reduced-motion` (the movement goes away, the fade stays).
- Server rendering and hydration run without errors in 6 environment variants (width, saved theme, dark system and reduced motion), plus a minimal Next 15 app (`npm run test:next`) that imports the components in a Server Component.
- Your `className` wins over the library's, proved in browsers (for the layered stylesheet, in any load order).

Not guaranteed:

- Full WCAG conformance. The library checks what its tokens and tests cover, and it does not replace an audit or testing with screen readers: nothing was tested with NVDA, JAWS or VoiceOver, and manual review in real Safari is still needed.
- The contrast of custom themes written in `hsl()`, `oklch()` or `oklab()`. Those formats are not measured, and the warning says how many pairs went unchecked.
- Velocity gestures (swipe to dismiss, inertia), Material 3 and Ant Design styles, and a density option apart from the styles. They don't exist yet.

## Documentation

- [Storybook](https://enchase.othiagosilva.com.br/docs/): every component, interactive, plus the pages about the theme, the shape, the styles and the motion.
- [API.md](API.md): props, types, defaults, hooks and CSS hooks of every component. It ships inside the package, in `node_modules/enchase/API.md`.
- [README.pt-BR.md](https://github.com/thiagopedro99/enchase/blob/main/README.pt-BR.md): the full guide, with routing and how each `href` is handled, the theme in depth, how to create a style, motion, customization by CSS, server rendering and tests.

The full guide, the Storybook and `API.md` are in Portuguese for now. The code, the prop names and the types are in English.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md), in Portuguese.

## License

MIT. See the [LICENSE](LICENSE) file.

## Author

**Thiago Silva** — [GitHub](https://github.com/thiagopedro99)
