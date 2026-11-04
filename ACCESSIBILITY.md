# Accessibility

What Enchase tests, what it does not test, and the standard that it aims at, in one place. The claims are the ones that a test or a script backs, and each row names it.

## The standard

The target is WCAG 2.2 level AA. The library checks what its tokens and its tests cover, and it does not claim conformance or a certification: the accessibility of an app also depends on what the app writes (labels, headings, the order of the page, the contrast of its own colors), and an audit of the app is not replaced by this page.

## What is tested

| What | How | Where |
| --- | --- | --- |
| The rules of axe on every component | `vitest-axe` in jsdom, in 63 test files | `src/tests/axe.ts` and `src/tests/components/**`, run by `npm test` |
| The rules of axe on every story (380), light and dark, with the `enchase`, `shadcn` and `workbench` styles | `axe-core` with the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` and `best-practice`. The rules of the whole document that a story cannot meet, and the findings that it accepts, are listed with a reason in the script | `scripts/auditStories.mjs` (`npm run test:stories-a11y`) and `.github/workflows/stories-a11y.yml` |
| Roles, names, states and keyboard of each pattern | specs of each component | `src/tests/components/**` in jsdom, and `src/tests-browser/components/**` in real browsers |
| Focus, `inert`, scroll lock, stacked Esc, the Tab trap and the focus that goes back to where it came from | real Chromium, Firefox and WebKit (Playwright) | `src/tests-browser/hooks/focusTrap.spec.tsx`, `src/tests-browser/hooks/focusTrapScroll.spec.tsx` and the specs of `Modal`, `Drawer`, `Popover`, `Menu`, `Sidebar` and `DatePicker` in `src/tests-browser/components/common/` |
| The contrast of the default palette, light and dark: 4.5:1 for text and 3:1 for the borders of the fields and for the focus ring. `createTheme` throws on an invalid color and `validateTheme` lists the pairs below the minimum | unit tests, including a sweep of hundreds of brand colors | `src/tests/styles/theme/contrast.test.ts`, `src/tests/styles/theme/brand.test.ts`, `src/tests/styles/theme/validateTheme.test.ts` and `src/tests/styles/presets/workbenchPalette.test.ts` |
| Interactive targets of at least 24 by 24 CSS pixels (WCAG 2.5.8), and 44 for the buttons that open or close a navigation | a guard on the CSS, and a measure in a real browser | `src/tests/styles/hitSizes.test.ts` and `src/tests-browser/platform/accessibility.spec.tsx` |
| The focus ring: its width and offset come from the theme, and it is not cut when the focus scrolls to a control | guards on the CSS, and real browsers | `src/tests/styles/focusAndBorder.test.ts`, `src/tests/styles/focusRingMargin.test.ts` and the `focusScroll` specs in `src/tests-browser/components/common/` |
| `prefers-reduced-motion`: the movement goes away and the fade stays | real browsers, and hydration with the preference on | `src/tests-browser/platform/accessibility.spec.tsx`, `src/tests/hydration/reducedMotion.test.tsx` and `src/tests/styles/motionVariables.test.ts` |
| Right to left: the layout mirrors with `dir="rtl"` and does not otherwise | real browsers, and the published CSS | `src/tests-browser/platform/accessibility.spec.tsx`, `src/tests-browser/platform/rtlDist.spec.tsx` and `scripts/checkPackage.mjs` |
| Server rendering and hydration without errors | 6 environment variants (width, saved theme, dark system and reduced motion), and a Next 15 app that imports the components in a Server Component | `src/tests/hydration/` and `scripts/testNext.mjs` (`npm run test:next`) |

The real-browser suite runs on the latest Chromium, Firefox and WebKit of Playwright, on Linux. A few specs are skipped in an engine where the platform cannot run them.

## What is not tested

- **The speech of screen readers.** Nothing was tested with NVDA, JAWS or VoiceOver: the roles, the names and the states are tested, and what a screen reader says about them is not. The issue "Test the components with NVDA, JAWS and VoiceOver" tracks it, and it is one of the criteria for 1.0.
- **Safari and iOS themselves.** WebKit on Linux stands in for them, and a manual review in real Safari is still needed. Edge is not tested apart from Chromium.
- **Windows high contrast (`forced-colors`).** A few rules exist, for the navbar, the segmented control and the textarea, and the mode is not tested in a real browser.
- **Zoom and reflow.** The layout is tested at the widths of the breakpoints, and not at 400% of zoom.
- **Voice control, switch devices and magnifiers.**
- **The contrast of a custom theme written in `hsl()`, `oklch()` or `oklab()`.** Those formats are not measured, and the warning says how many pairs went unchecked.
- **Manual audits and tests with people.**

## Reporting a problem

Open an [issue](https://github.com/thiagopedro99/enchase/issues) with the component, the browser, the assistive technology and what you expected. A fix is a patch of the latest minor version, listed under Fixes in the release notes. The notes of every release also say, in a bullet that starts with "Screen readers:", whether the speech of what is new was heard, and today it never was.
