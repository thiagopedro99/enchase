# Changelog

## v0.8.0

[compare changes](https://github.com/thiagopedro99/enchase/compare/v0.7.0...v0.8.0)

### Enhancements

- Let createTheme take a style, with the shadcn palette and tokens, and carry its defaults to the components ([f05d150](https://github.com/thiagopedro99/enchase/commit/f05d150))
- Add the hooks the shadcn style needs for shadows, borders and the disabled state, and the css of the stacked label ([f76c700](https://github.com/thiagopedro99/enchase/commit/f76c700))
- Let the fields put the label above the control, by prop or by the style of the theme ([947f7f0](https://github.com/thiagopedro99/enchase/commit/947f7f0))
- Define the shadcn style hooks and add a style switch to the storybook toolbar ([c4f9d10](https://github.com/thiagopedro99/enchase/commit/c4f9d10))
- Tune the shadcn style after the visual review and thicken the field focus in forced colors ([7058e35](https://github.com/thiagopedro99/enchase/commit/7058e35))
- Add the enchase/styles entry and defineStyle ([3022688](https://github.com/thiagopedro99/enchase/commit/3022688))

### Fixes

- Let the pressed color of a link win over the hover color ([5590ec7](https://github.com/thiagopedro99/enchase/commit/5590ec7))

### Refactors

- Read the focus ring and the border width from theme tokens ([bf0e304](https://github.com/thiagopedro99/enchase/commit/bf0e304))
- Read the state layers and the halo from theme tokens ([adf9e7d](https://github.com/thiagopedro99/enchase/commit/adf9e7d))
- Read the target sizes from theme tokens ([fa4344a](https://github.com/thiagopedro99/enchase/commit/fa4344a))
- Read the geometry of the selection controls from hooks ([e1d35ca](https://github.com/thiagopedro99/enchase/commit/e1d35ca))
- Read the padding, font and gap of the button from hooks ([9edec1b](https://github.com/thiagopedro99/enchase/commit/9edec1b))
- Read the geometry of the fields from hooks and derive the label and the room of the buttons ([048fc9e](https://github.com/thiagopedro99/enchase/commit/048fc9e))
- Name the geometry hooks after the data-slot of their part ([96ccc22](https://github.com/thiagopedro99/enchase/commit/96ccc22))
- Add line height and letter spacing scales to the theme tokens ([e02c7c5](https://github.com/thiagopedro99/enchase/commit/e02c7c5))
- Read the typography and the corners of the components from hooks ([43637ce](https://github.com/thiagopedro99/enchase/commit/43637ce))
- Read the space, the size, the colors and the shadows of the containers from hooks ([ced1d6d](https://github.com/thiagopedro99/enchase/commit/ced1d6d))
- Read the space, the size, the colors and the shadows of the bars and the navigation from hooks ([bf34d77](https://github.com/thiagopedro99/enchase/commit/bf34d77))
- Read the space, the colors and the sizes of the controls and the rest of the components from hooks ([317ed27](https://github.com/thiagopedro99/enchase/commit/317ed27))
- Give each style its own entry under enchase/styles ([6b3b1aa](https://github.com/thiagopedro99/enchase/commit/6b3b1aa))

### Notes

- New: visual styles, with the `shadcn` one included (`style` in `createTheme` and in the `theme` prop of the `ColorModeProvider`); `defineStyle`, to write a style of your own; the `labelPlacement` prop on the fields; theme tokens for the focus ring, the borders, the state layers, the halo, the target sizes, the line heights and the letter spacings; and CSS hooks that restyle the space, the size, the color, the shadow and the type of every component. Fixed: the pressed color of a link. It is all in the README, `API.md` has a reference of the 715 CSS hooks, and the Storybook has a Sistema/Estilos page and a Style switch in the toolbar. Besides what is listed below, nothing changed at runtime with the default style.
- `createTheme` takes `style`, and so does the `theme` prop of the `ColorModeProvider`. A style is an object that changes the look of the whole kit at once: the palette, the corners, the heights, the weights, the borders, the shadows and the place of the label of the fields. Without `style` the look is the one of always (the `enchase` style, which changes nothing). What you pass wins over the style, in this order: the defaults of the library, the style, then `shape`, `radius`, `fonts`, `motion`, `brand`, `light` and `dark`. With `brand`, only the accent of the style changes (the `primary` color and what derives from it) and the neutrals stay. A style is made of tokens and CSS hooks that the `ColorModeProvider` writes on `:root` and in the block of each color mode, so the CSS of your app still wins over it. The `ThemeSet` that `createTheme` returns has two new optional keys, `hooks` and `defaults`, so a `ThemeSet` written by hand keeps working, and `ThemeInput` has the new `style` key.
- Each style has its own entry, `enchase/styles/<name>`: `enchase/styles/shadcn` and `enchase/styles/enchase`, as in `import { shadcn } from 'enchase/styles/shadcn'`. A style is only data, with no React, so it works in a Server Component: import it in the server layout and pass it to the `ColorModeProvider`. The entries are separate files of the package, so an app pays only for the styles it imports, even with a bundler that does not drop dead code, and a style can be loaded on demand with `import('enchase/styles/shadcn')`. There is no `enchase/styles` alone on purpose, since the CSS is `enchase/styles.css`: forgetting the `.css` is an error and not an import that does nothing. A style given by name (`style: 'shadcn'`) throws an error that says which import to use.
- The `shadcn` style brings the kit closer to shadcn/ui: a neutral palette, borders instead of shadows, buttons and fields of 36px with 14px text, corners of `0.5rem`, neutral alerts with a colored icon and title, tinted badges, tabs with only the underline, a flat accordion and the label above the field. It is inspired by it, not a copy, and the accessibility contract of the library comes first: the border of the fields and the track of the switch when off are `#808080` (3:1 against the background; the original has 1.26:1), the focus ring is solid, 2px, in the `primary` color, with 2px of offset (the original uses a translucent ring), the secondary text on the gray surfaces and the error red used as text have 4.5:1, the targets keep at least 24px, the fields have 16px text on touch devices, and in forced colors (the Windows high contrast mode) the focus border of the fields is at least 2px, whatever the style, because the ring made with a shadow disappears there. `validateTheme` finds nothing wrong in it, with or without `brand`, and the tests run an `axe` contrast check of the whole kit in both color modes, in the three browsers.
- `defineStyle`, from `enchase/theme`, is how you write a style of your own. It takes an object with the sections `base` (the `control`, `focus`, `border`, `halo`, `hit` and `state` tokens), `fonts` (`sizes`, `weights`, `lineHeights` and `letterSpacings`), `radius`, `hooks`, `colorHooks`, `light` and `dark` (each with `colors`, `shadows` and `hooks`), `brand` (which roles of the palette come from the brand color) and `defaults`; it checks the object, says which part is wrong and returns it frozen. It throws for an unknown section or token, for a CSS value that is not safe (with `;`, `{`, `}`, `<`, `>`, a backslash, a comment, `url()`, `@import`, an unbalanced parenthesis or quote, or more than 400 characters), for a hook name that is not `--enchase-` followed by lowercase words, for a "hook" that is a theme token, and for a root hook that cites a color or a shadow of the theme (that one goes in `colorHooks`, or in `light.hooks` and `dark.hooks`). `createTheme` checks again a style that did not come from `defineStyle`, because a style can arrive as JSON or across the boundary of a Server Component. The contrast of the colors is not checked by `defineStyle`: run `validateTheme` on the result. The types `ThemeStyle`, `ThemeStyleMode`, `HookValues`, `LabelPlacement` and `ThemeDefaults` are exported by `enchase/theme`, and the README has a section on writing a style.
- `Input`, `Textarea`, `NumberInput` and `Select` take `labelPlacement`: `floating` (the default of the `enchase` style) keeps the label inside the field, and it goes up to the outline when the field is focused or filled; `stacked` (the default of the `shadcn` style) puts the label above the control, with no notch in the outline and the helper text and the error below. The prop wins over the style, in both directions, and without a `ColorModeProvider` the label floats. The `<label>` comes before the control in the HTML in both placements, the same on the server and on the client, so there is no hydration mismatch.
- New theme tokens, all read by the components and written by the theme as `--enchase-*` variables, experimental until 1.0: `--enchase-focus-width` (`2px`), `--enchase-focus-offset` (`2px`), `--enchase-focus-offset-inset` (`-2px`, the offset of the ring inside a container such as the tabs, the accordion and the table), `--enchase-focus-offset-selector` (`3px`, for the checkbox, the radio and the switch) and the optional `--enchase-focus-color` (the ring follows `primary` without it); `--enchase-border-width` (`1px`) and `--enchase-border-width-strong` (`2px`); `--enchase-state-row-hover` (`0.06`), `--enchase-state-disabled-container` (`0.12`) and `--enchase-state-disabled-content` (`0.38`), next to the `--enchase-state-hover` and `--enchase-state-pressed` that were already there; `--enchase-halo-size` (`10px`) and `--enchase-halo-size-switch` (`0.5rem`); `--enchase-hit-size` (`40px`) and `--enchase-hit-size-lg` (`44px`), the target sizes, which never go below 24px even if the variable asks for less (WCAG 2.5.8); `--enchase-line-height-none`, `-tight`, `-snug`, `-normal` and `-relaxed` (`1`, `1.2`, `1.4`, `1.5` and `1.6`); and `--enchase-letter-spacing-tight` and `-control` (`-0.01em` and `0.01em`). The values are the ones the components had written in their CSS, so the default look does not change. One consequence for TypeScript: `BaseTokens` gained the keys `focus`, `border`, `halo`, `hit`, `fonts.lineHeights`, `fonts.letterSpacings`, `state.rowHover`, `state.disabledContainer` and `state.disabledContent`. `createTheme` fills them in, but a `BaseTokens` object written by hand needs them.
- Each component reads optional CSS hooks named after the `data-slot` of the part and the property, `--enchase-<data-slot>-<property>`, with the size or the variant when there is more than one (`data-slot="switch-thumb"` and `size` give `--enchase-switch-thumb-size`). They cover the space, the size, the color, the shadow, the font and the corners of the 36 components of the kit, from the buttons and the fields to the bars, the navigation, the containers and the overlays, and they are experimental until 1.0. The theme does not declare them, except the ones a style sets: without a value the component uses what it used before, and a default that points to a theme token keeps following an override of that token. The full list, with the default and the property of each hook, is in `API.md` and is generated from the CSS of the components, so it does not go out of sync. Three details: the four fields share the `--enchase-input-*` hooks; a hook that cites a color role and is declared on `:root` resolves there, so declare it inside the selectors of the color modes if it must change with the mode (the theme does that for the hooks of a style); and the translucent bars now derive their background from `--enchase-navbar-background-solid` and `--enchase-navbar-background-alpha` (`--enchase-app-bar-background-solid` and `-alpha` in the `AppBar`), while `--enchase-navbar-background` and `--enchase-app-bar-background`, documented since 0.7.0, still set the whole translucent background and win over the derivation.
- With the default style the look is the one of 0.7.0, with two small differences. First, the pressed state: in nine places it mixed 12% of the content color, and it now mixes 10%, the value of `--enchase-state-pressed` that the other components already used. Those places are the close button of the `Alert` and of the `Modal`, the buttons of the `NumberInput`, the links and the collapse button of the `Sidebar`, the links and the menu button of the `Navbar`, and the halo of the `Switch` thumb. Second, the `Alert`, the `Card`, the panel of the `Modal`, the `Navbar` and the `Sidebar` now have a transparent border of zero width, which a style can use, so a computed style reads `border-style: solid` where it read `none`, and nothing is drawn. A computed-style audit of the 195 stories of the Storybook, in Chromium, Firefox and WebKit, in the light and dark modes and in the hover, pressed, focus and tab states, found no other difference from 0.7.0. The pressed color of a link (`--enchase-link-color-active`) also wins over the hover color now while the pointer is down; by default the two are the same color.
- Weight: with the default style, `enchase/styles.css` goes from 13.2 to 17.3 kB gzip (108 to 149 kB raw), because every property a hook can set now reads `var(--hook, previous value)`, and `enchase/theme.css` from 2.0 to 2.1 kB gzip. In JavaScript, the bundle of the `ColorModeProvider` goes from 8.8 to 10.9 kB gzip (the new tokens and the check of the styles), and the one of the `Button` from 2.7 to 2.9 kB. A style costs only for the app that imports it: `enchase/styles/shadcn` adds about 2.5 kB gzip.

## v0.7.0

[compare changes](https://github.com/thiagopedro99/enchase/compare/v0.6.0...v0.7.0)

### Enhancements

- Add the translucent Navbar ([d6cf56f](https://github.com/thiagopedro99/enchase/commit/d6cf56f))
- Let the Grid change columns by breakpoint and center its last row ([f93105b](https://github.com/thiagopedro99/enchase/commit/f93105b))
- Add shape presets and a button radius to createTheme ([19f7386](https://github.com/thiagopedro99/enchase/commit/19f7386))
- Let the Layout make its top bar translucent ([9b9277b](https://github.com/thiagopedro99/enchase/commit/9b9277b))

### Fixes

- Keep the Layout navbar at the top while the page scrolls ([608e2f9](https://github.com/thiagopedro99/enchase/commit/608e2f9))

### Notes

- New: `translucent` on the `Navbar` and on the `Layout`, columns by breakpoint and `centerLastRow` on the `Grid`, and the `shape` and `radius` sections of `createTheme`, with the new `--enchase-radius-button` token. Fixed: the `Layout` with `navigation="navbar"` now keeps its top bar at the top while the page scrolls. The new props have stories with controls and are in `API.md`, and the README has a section for the Grid columns and one for the shape of the corners. Besides what is listed below, nothing changed at runtime.
- `Navbar` takes `translucent` (`false` by default). The bar becomes semi-transparent and blurs the content that scrolls under it (`backdrop-filter`), with a hairline at the bottom, and its height does not change. The background and the blur come from two variables you can set in your CSS or in the `style` of the bar: `--enchase-navbar-background` (80% of the `surfaceContainer` color of the theme by default) and `--enchase-navbar-blur` (`12px` by default). Without `translucent` the two variables do nothing and the bar stays opaque, as before. The `className` you pass still wins over the translucent background.
- The translucent bar goes back to the solid background of the theme, even when you set a translucent color of your own, when the system asks for less transparency (`prefers-reduced-transparency`) or more contrast (`prefers-contrast: more`), in forced colors (the Windows high contrast mode) and in browsers without `backdrop-filter`. With the default theme, the text of the brand and of the menu keeps 4.5:1 even over pure black or pure white (3:1 for the accent color of the brand on hover), and a browser test measures it in both color modes. With another background color or a theme of your own, check the contrast over the content that goes behind the bar.
- `Layout` takes `translucent` too, and it applies to the top bar of the chosen navigation: the `AppBar` with `navigation="sidebar"` (80% of the `surface` color, set by `--enchase-app-bar-background` and `--enchase-app-bar-blur`) or the `Navbar` with `navigation="navbar"`. The fallbacks to the solid background are the same as the ones of the `Navbar`.
- Fixed: with `navigation="navbar"`, the top bar of the `Layout` used to scroll away with the page. It now stays fixed at the top while the page scrolls, as the `AppBar` of `navigation="sidebar"` already did. This changes how those pages look while scrolling, and there is no prop to keep the old behavior.
- `Grid` takes `columns` as an object too: the number of columns from each breakpoint up, as in `{ xs: 1, md: 2, lg: 4 }`. It is mobile first: a breakpoint without a value repeats the smaller one before it, and without `xs` the grid starts with one column. The breakpoints are the ones of the `UIProvider`, so a custom `breakpoints` applies here too (and the default ones apply without a `UIProvider`). The rules are plain CSS generated by the `UIProvider`, so the right number of columns is already in the HTML of the server, with no JavaScript and no wrong frame before hydration. The style the `UIProvider` injects now includes the Grid rules, a few more lines in the style it already carried for the `Layout` and the `Navbar`.
- `Grid` also takes `centerLastRow` (`false` by default), which centers the last row when it is incomplete, like the last two cards of five in three columns. For that the grid becomes a flexible row that wraps: each cell has the width of one column, the full rows stay aligned in the columns, and the cells of a row have the same height. It works with `columns` (a number or an object) and is ignored with `minColumnWidth`, because the number of columns then depends on the width. While columns by breakpoint or `centerLastRow` are in use, the grid exposes `data-responsive` or `data-center-last` on its root.
- One change for `columns` as a number: it is now taken as a whole number of at least 1. A fraction is rounded down, and `0`, a negative number or a value that is not a number becomes 1, instead of producing a broken grid. A number still means the maximum number of columns, which the grid reduces by itself when they do not fit, and `minColumnWidth` works as before.
- `createTheme` takes `shape` and `radius`, and so does the `theme` prop of the `ColorModeProvider`. `shape` is a preset for the corners: `pill` (the default, the look of always), `soft` and `square`. `radius` changes one or more tokens on top of the preset: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `control` (the fields and the pagination), `button` (buttons, icon buttons, menu and navigation items, breadcrumb links and badges) and `full`. Each one becomes `--enchase-radius-<name>`. A value is `0` or a number with `rem`, `em`, `px` or `%`, and an invalid value, an unknown token or a preset that does not exist throws an error that says which one failed. `shape` changes only the radii: the contrast of the colors and the motion stay as they are. The types `ShapePreset`, `RadiusOverrides` and `RadiusTokens` are exported by `enchase/theme`. The README has a table with the presets, and the Storybook has a Sistema/Forma page that shows them across the whole kit.
- New token `--enchase-radius-button`, read by the buttons, the icon buttons, the menu and navigation items, the breadcrumb links and the badges instead of `--enchase-radius-full`. Without `shape` and `radius` it points to `--enchase-radius-full`, so the corners are the ones of 0.6.0. One difference to know: since that alias is resolved at `:root`, an override of `--enchase-radius-full` placed on a part of the page (not on `:root`) no longer reaches the buttons inside it. Override `--enchase-radius-button` there instead. An override of `--enchase-radius-full` on `:root` keeps working, and the `Button` still reads `--enchase-button-radius` before the theme, to change a single button. The pill shapes that are not buttons (the track of the `Switch`, the dot of the `RadioGroup`, the avatar) keep following `--enchase-radius-full` in every preset.

## v0.6.0

[compare changes](https://github.com/thiagopedro99/enchase/compare/v0.5.0...v0.6.0)

### Enhancements

- Add the NumberInput ([c617912](https://github.com/thiagopedro99/enchase/commit/c617912))
- Let the ButtonLink hide the external link icon ([44eb970](https://github.com/thiagopedro99/enchase/commit/44eb970))
- Add the enchase/icons entry ([2656f56](https://github.com/thiagopedro99/enchase/commit/2656f56))

### Fixes

- Keep a long label from overflowing the field outline ([3abfe2c](https://github.com/thiagopedro99/enchase/commit/3abfe2c))
- Keep the scroll spy on sections that remount or mount later ([d16d4c0](https://github.com/thiagopedro99/enchase/commit/d16d4c0))

### Notes

- New: the `NumberInput` component, the `enchase/icons` entry with the 19 icons the components use, `externalIcon` on the `ButtonLink` and `locale` in `useUIConfig()`. Fixed: the `useScrollSpy` on sections that remount or mount later, and a long label overflowing the outline of the fields. The `NumberInput` has a story with controls and its props are in `API.md`. Besides what is listed below, nothing changed at runtime.
- `NumberInput` is a field for a number, with `label`, `error`, `helperText`, `fullWidth` and a minus and a plus button. It is an `<input type="text">` with `role="spinbutton"` and a numeric keyboard on phones, not `type="number"`: the text follows the language of the `UIProvider` (a comma for decimals and a dot for thousands in `pt-BR`, the opposite in `en`) and the value comes out as a `number`, or `null` when the field is empty. It takes `value`, `defaultValue` and `onValueChange(value)`, `min`, `max`, `step` (1 by default), `largeStep` (ten times `step` by default), `formatOptions`, `steppers` (`true` by default), `name`, `form`, `wrapperClassName` and `wrapperStyle`. `className`, `style`, the other attributes and the `ref` go to the `<input>`.
- The value is confirmed when the field loses the focus, with Enter, with the arrow keys and with the buttons, never on each key. What was typed is read the way the locale writes numbers (`1.234` in `pt-BR` is a thousand two hundred thirty-four, and `1.5` is one and a half), held between `min` and `max` and rounded to the digits of the format. Letters are refused as they are typed, and so is the minus sign when `min` is 0 or more. The arrows change the value by `step`, Shift with them and Page Up and Page Down by `largeStep`, and Home and End go to `min` and `max`. Steps count from `min` (or 0), so a step of 100 from 1235 goes to 1200. From an empty field, the up arrow goes to `min` (or 0) and the down arrow to `max` (or 0).
- `formatOptions` takes part of `Intl.NumberFormat`: `style` (`decimal`, `currency` or `percent`), `currency`, `currencyDisplay`, `minimumFractionDigits`, `maximumFractionDigits` and `useGrouping`. Without `maximumFractionDigits`, the digits of the style apply (3 for decimals, 2 for currency, 0 for percent) or the ones the `step` asks for. A percentage is the fraction: 0.15 shows as 15%. The currency symbol may be typed or left out, and a language tag that `Intl` does not accept falls back to English. The type is exported as `NumberInputFormat`. With `name`, the number goes to the form through a hidden input as a plain `1234.5`, never with the formatting of the screen.
- The buttons of the `NumberInput` are out of the tab order, because the keyboard already has the arrows, and holding one repeats the step. A polite live region announces the new value when a button is used. On iPhone the numeric keyboard has no minus key: pass `inputMode="text"` to accept negative numbers. The field reads `--enchase-number-input-duration` and `--enchase-number-input-ease` for its motion, listed in the Movimento table of the README. No other theme token was added.
- Two keys were added to `UILabels`, both optional: `increaseValue` and `decreaseValue` (the names of the buttons of the `NumberInput`). They are optional so that a `Locale` of your own, written before this version, still type-checks. The `en` and `ptBR` locales define them, and a locale or a `labels` object that leaves them out falls back to the English text. `useUIConfig()` also returns `locale` now, the language code of the `UIProvider` locale (`pt-BR`, `en`), which is `en` without a provider. The `NumberInput` formats and reads numbers with it, and it can feed your own `Intl` calls.
- New entry `enchase/icons`, with the 19 icons the components use inside, one component per icon: `AlertTriangleIcon`, `CheckIcon`, `ChevronDownIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `ChevronsLeftIcon`, `ChevronsRightIcon`, `CloseIcon`, `ExternalLinkIcon`, `EyeIcon`, `EyeOffIcon`, `InfoIcon`, `LogOutIcon`, `MenuIcon`, `MenuOpenIcon`, `MinusIcon`, `MoonIcon`, `PlusIcon` and `SunIcon`, plus the `IconProps` type. A test keeps the list equal to the icons the components import, so an icon is only added when a component starts to use it. This is not an icon library: for other icons, use one (lucide-react, Phosphor, Heroicons) or the `Icon` container of `enchase` with your own paths.
- Each icon takes `size` (24 by default), `title` and the attributes of an `<svg>`, and is drawn with `currentColor`. Without a `title` it is decorative (`aria-hidden`); with one it becomes an image with an accessible name, and a button with only an icon still needs an `aria-label`. `data-icon` holds the name in kebab case (`chevron-left`). The seven icons that point somewhere (`ChevronLeftIcon`, `ChevronRightIcon`, `ChevronsLeftIcon`, `ChevronsRightIcon`, `ExternalLinkIcon`, `LogOutIcon` and `MenuOpenIcon`) mirror in right-to-left text.
- `enchase/icons` is not marked `'use client'`, so a Server Component can import it (the Next 15 app of the tests renders them on the server), and each icon is its own module, so a bundler keeps only the ones you import: one icon costs about 0.9 kB gzip and all 19 about 1.6 kB. The Storybook has a gallery in the story of the `Icon`. Changing how an icon is drawn is not a breaking change; renaming or removing one is.
- `ButtonLink` takes `externalIcon` (`true` by default). With `target="_blank"` the link shows the external link icon after the text, as before; `externalIcon={false}` removes only the icon and keeps the "opens in a new tab" text for screen readers (`labels.opensInNewTab`). In a link with only an icon and an `aria-label`, put the notice in the label.
- `useScrollSpy` used to keep the elements it found when it mounted, so a section that mounted later or was replaced by a new element with the same `id` was never watched, and the highlight stayed wrong. It now follows the page: a section that mounts later or remounts is watched, one that leaves the page is dropped, and the active `id` is cleared when its section is gone. Only the content of the `ids` array counts, not its identity, so an array written inline does not restart the observer.
- A label longer than the field no longer pushes the notch of the outline of the `Input`, `Textarea` and `Select` past the field: the notch stops at the width of the field.

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
