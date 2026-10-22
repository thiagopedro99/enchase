# Next consumer

Minimal Next.js 15 App Router app that consumes the packed `enchase` tarball, to prove the library works with Server Components and server rendering.

Run it from the repository root, after building the library:

```bash
npm run build:lib
node scripts/testNext.mjs
```

The script packs the library, copies this folder to a temporary directory (nothing is installed here), installs the tarball with `next@15`, `react@19` and `react-dom@19`, runs `next build` (type-check included) and `next start`, then fetches `/` and checks the server html:

- the page is a Server Component that imports `Button`, `Layout` and `ToastProvider` straight from `enchase`;
- the `ColorModeScript` in the head and `suppressHydrationWarning` on `<html>`;
- the theme variables inside `@layer enchase-theme` with the `prefers-color-scheme: dark` fallback;
- the stylesheets `enchase/styles.layer.css` and `enchase/theme.css`, fetched from the built page and checked for the layer order and the theme variables;
- the layout rendered in the wide default (`data-layout="auto"`) with the generated responsive rules.

The app has two root layouts, one for each route group. `/` is the plain one, with `shape: 'soft'` and no style, and it must not carry any style hook or label placement. `/styled` has its own layout, which imports `shadcn` from `enchase/styles` in a Server Component and hands it to the `ColorModeProvider`: the script checks that the theme variables, the hooks and the stacked label placement of the style come through the server render.

It does not publish anything and removes the temporary directory and the server process at the end.
