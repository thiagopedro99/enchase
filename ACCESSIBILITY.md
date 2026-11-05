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
| The headless hooks: the roles, the states and the keyboard that each one gives (the markup and the names are yours) | jsdom with axe on a bare shell of each hook, and real browsers for the focus, the keyboard, the pointer and right to left | `src/tests/components/common/Tabs/useTabs.test.tsx` and the `use*.spec.tsx` files in `src/tests-browser/components/common/*/` |
| Server rendering and hydration without errors | 6 environment variants (width, saved theme, dark system and reduced motion), and a Next 15 app that imports the components in a Server Component | `src/tests/hydration/` and `scripts/testNext.mjs` (`npm run test:next`) |

The real-browser suite runs on the latest Chromium, Firefox and WebKit of Playwright, on Linux. A few specs are skipped in an engine where the platform cannot run them.

## What is not tested

- **The speech of screen readers.** Nothing was tested with NVDA, JAWS or VoiceOver: the roles, the names and the states are tested, and what a screen reader says about them is not. Testing them is one of the criteria for 1.0, which asks for two combinations: NVDA with Firefox on Windows, and VoiceOver with Safari on macOS, run by hand over the whole script. JAWS and VoiceOver on iOS wait for 1.1. The script of the test and an empty table for the results are in the section "Screen reader tests, not run yet", below.
- **Safari and iOS themselves.** WebKit on Linux stands in for them, and a manual review in real Safari is still needed. Edge is not tested apart from Chromium.
- **Windows high contrast (`forced-colors`).** A few rules exist, for the navbar, the segmented control and the textarea, and the mode is not tested in a real browser.
- **Zoom and reflow.** The layout is tested at the widths of the breakpoints, and not at 400% of zoom.
- **Voice control, switch devices and magnifiers.**
- **The contrast of a custom theme written in `hsl()`, `oklch()` or `oklab()`.** Those formats are not measured, and the warning says how many pairs went unchecked.
- **Manual audits and tests with people.**

## Screen reader tests, not run yet

Nothing in this section has been run. It is the script and the table for the test that the criterion for 1.0 asks for, and the README keeps saying that nothing was tested until the table has results.

The criterion for 1.0 asks for two combinations, run by hand over the 23 lines of the script: NVDA with Firefox on Windows, and VoiceOver with Safari on macOS. The table gets the version of the reader, of the browser and of the system. JAWS and VoiceOver on iOS wait for 1.1: their columns stay in the table, empty and marked as not run, and the README keeps saying that they were not tested.

### How

Open each story in the [Storybook](https://enchase.othiagosilva.com.br/docs/) (`iframe.html?id=<story>` shows only the story), and test in these combinations:

| Screen reader | System and browser |
| --- | --- |
| NVDA | Windows, with Firefox and with Chrome |
| JAWS | Windows, with Chrome |
| VoiceOver | macOS, with Safari |
| VoiceOver | iOS, with Safari |

For each line of the script, do the step with the keyboard (on iOS, with the swipe and double tap gestures) and write down what was said about the name, the role, the state, the position in a set when there is one, and the change that the step causes. What the column "Listen for" lists is what the markup says, which the jsdom tests and axe already check: the test is about what each reader does with it. Write the version of the reader and of the browser once, at the top of its column. In a cell, `ok` means that what was said covers the column "Listen for", `differs` is followed by the words that were said, and `not announced` means that nothing was. Each `differs` and `not announced` is an issue of its own, with the component, the reader, its version and what was said, and it stays in this file until it is fixed or documented.

### The script

| Component | Stories | Do | Listen for |
| --- | --- | --- | --- |
| Tabs | `components-tabs--playground` | Tab into the list, then ← and →, then Tab again. | The name of the list; each tab as a tab, with its name, selected or not, and its position; the panel when the focus enters it. |
| Accordion | `components-accordion--playground` | Tab to a header, Enter, then ↓ and ↑ between headers. | The header as a button, with the level of its heading, expanded or collapsed; the content after it opens. |
| SegmentedControl | `components-segmentedcontrol--playground`, `components-segmentedcontrol--multiple` | Tab in, then ← and →. In the multiple story, Space on each button. | The name of the group; each option as a radio button, checked or not, or as a toggle button, pressed or not. |
| RadioGroup | `components-radiogroup--playground`, `components-radiogroup--with-error` | Tab in, then the arrows. | The name of the group; each radio button with its state and position; the error. |
| Checkbox and CheckboxGroup | `components-checkbox--with-error`, `components-checkboxgroup--with-error` | Tab in, then Space. | The name; checked or not; the name of the group; the error when it is invalid. |
| Switch | `components-switch--playground` | Tab in, then Space. | The name; the role of switch; on or off. |
| Slider | `components-slider--playground` | Tab to the thumb, then ←, →, Home, End and PageUp. | The name; the value with its minimum and maximum, or the formatted text; the new value after every key. |
| NumberInput | `components-numberinput--playground`, `components-numberinput--with-error` | Type a number, then ↑ and ↓, then the step buttons. | A spin button with its value, minimum and maximum; the names of the step buttons; the new value after a step; the error. |
| Select | `components-select--playground`, `components-select--with-error` | Open the list and move through the options. | The label; the selected value; the options; the error. |
| Combobox | `components-combobox--playground`, `components-combobox--multiple` | Type to filter, then ↓, Enter and Esc. | A combobox, expanded or collapsed; the option that is active; the options that are selected; the number of results or that there are none. |
| DatePicker | `components-datepicker--playground` | Open the calendar, move with the arrows and with PageUp and PageDown, choose a day. | The dialog and its name; the grid; each day with its state (selected, today, unavailable); the month announced when it changes; the focus coming back. |
| Menu | `components-menu--playground` | Open with Enter or ↓, move, choose an item, then open again and press Esc. | The button that opens it, expanded with a popup; each item with its name; the focus coming back to the button. |
| Popover | `components-popover--playground` | Open it, Tab inside, then Esc. | The trigger as expanded or collapsed; the content; the focus coming back. |
| Modal and ConfirmModal | `components-modal--playground`, `components-confirmmodal--playground` | Open it, Tab around, then Esc. | The dialog (or alert dialog) with its name; its description read when it opens; the focus staying inside, and coming back. |
| Drawer | `components-drawer--playground` | Open it, Tab around, then Esc. | The dialog and its name; the focus staying inside, and coming back. |
| Tooltip | `components-tooltip--playground` | Focus the trigger. | The text of the tooltip, read as the description of the trigger. |
| Pagination | `components-pagination--playground` | Tab through the buttons and press one. | The navigation landmark and its name; each page button; the current page; the previous or the next button as unavailable at the ends. |
| Breadcrumbs | `components-breadcrumbs--playground`, `components-breadcrumbs--collapsed` | Tab through the links. | The navigation landmark; the links; the current page; the button that shows the whole path when it is collapsed. |
| Navbar | `components-navbar--playground` | In a narrow window, Tab to the menu button and open it. | The navigation landmarks and their names; the current item; the menu button, expanded or collapsed. |
| Table | `components-table--sortable`, `components-table--selectable`, `components-table--loading` | Move through the cells, activate a sortable header, select a row. | The name of the table; the column header read with each cell; the direction of the sort; the rows that are selected; that it is busy. |
| Alert and Toast | `components-alert--playground`, `components-toast--playground` | Show an alert, then a toast. | The message announced when it appears, without the focus moving; the name of the close button. |
| Input and Textarea | `components-input--with-error`, `components-textarea--with-error` | Tab in and type. | The label; the helper text as the description; the field as invalid; the error announced. |
| Progress and Loading | `components-progress--with-value`, `components-loading--playground` | Reach them with the reading cursor. | The progress bar with its value; the loading status announced. |

### The results

| Component | NVDA | JAWS | VoiceOver macOS | VoiceOver iOS |
| --- | --- | --- | --- | --- |
| Version and browser | | not run, waits for 1.1 | | not run, waits for 1.1 |
| Tabs | | | | |
| Accordion | | | | |
| SegmentedControl | | | | |
| RadioGroup | | | | |
| Checkbox and CheckboxGroup | | | | |
| Switch | | | | |
| Slider | | | | |
| NumberInput | | | | |
| Select | | | | |
| Combobox | | | | |
| DatePicker | | | | |
| Menu | | | | |
| Popover | | | | |
| Modal and ConfirmModal | | | | |
| Drawer | | | | |
| Tooltip | | | | |
| Pagination | | | | |
| Breadcrumbs | | | | |
| Navbar | | | | |
| Table | | | | |
| Alert and Toast | | | | |
| Input and Textarea | | | | |
| Progress and Loading | | | | |

## Reporting a problem

Open an [issue](https://github.com/thiagopedro99/enchase/issues) with the component, the browser, the assistive technology and what you expected. A fix is a patch of the latest minor version, listed under Fixes in the release notes. The notes of every release also say, in a bullet that starts with "Screen readers:", whether the speech of what is new was heard, and today it never was.
