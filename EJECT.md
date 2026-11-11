# Eject

`enchase eject` copies the source of a component into your project, so that the code is yours: you change the markup, the behavior and the styles without waiting for the library and without a fork.

It is the way out of the library, not the way to use it. A copy stops following the library: nothing updates it, and the accessibility contract of the package holds for what the package publishes, not for your copy. Most changes do not need it: the CSS hooks (`--enchase-<part>-<property>`), the styles (`createTheme({ style })`) and the `data-slot` of every part change how a component looks, and the props change what it does. Eject when you need another markup or another behavior. If it is the behavior of `Tabs`, `Pagination`, `SegmentedControl`, `Accordion` or `Slider` that you want under your own markup, a [headless hook](HEADLESS.md) is lighter than a copy.

**Stable since 0.20.** The command, its options and the format of `enchase.eject.json` are part of the public API, as [VERSIONING.md](VERSIONING.md) says, and every component that `eject/index.json` lists is ejectable and compiles next to the package (`npm run test:eject`). What is not frozen is the layout of the folders and the files of a component: a copy is the one place where that layout, which is not public API, becomes part of your project, and `--diff` is how a copy meets a change of it. The set of files of each component was the same from 0.18 to 0.19, which is what the promotion asked for, and it is the evidence for the promotion and not a promise from now on.

## The premise

The code is yours, and so is what comes with it. What eject promises:

- The copy is the code of the library at the version that you ejected, file by file. `enchase.eject.json` records the version and a hash of every file, and `--diff` uses it to tell what changed on each side.
- It is MIT code that you can change without asking: the command writes the `LICENSE` next to the copies.
- It works next to the package that is installed: it shares the contexts and the overlays with it. Every release compiles and bundles all the copies in a project that installs the packed package, and runs the jsdom specs of `Button`, `Tabs` and `Menu` against them (`npm run test:eject`).
- It does not overwrite your work. Without `--force` the command stops before it writes anything, and `--diff` writes nothing.
- It does not depend on the hooks of the package: a component that has a hook copies it as a file of its own, and no copy imports `enchase/headless` or `enchase/experimental`.

What it does not promise:

- That a copy follows the library. Nothing updates it, and a fix of the library reaches it only when you take it, with `--diff`.
- That a copy keeps compiling after an upgrade. It imports from `enchase` (the other components, `useUIConfig`, the types, the icons and the theme types), so a minor that breaks one of those breaks the copy, and the notes of the release say what.
- The accessibility contract. [ACCESSIBILITY.md](ACCESSIBILITY.md) holds for what the package publishes, not for a copy that you change.
- Support for a copy. An issue is welcome when it reproduces with the component of the library.
- That the folders and the files of a component stay as they are. They are not public API, even though the command is stable: a minor may move them, the notes of the release say so, and `--diff` tells what changed on each side.

## Eject, a hook or the CSS

| You want | Take | Where |
| --- | --- | --- |
| Another color, size, corner or density, or a look for the whole kit | The CSS hooks, the styles and `createTheme` | [README.md](README.md), [API.md](API.md) |
| The same component with other options | The props | [API.md](API.md) |
| The behavior of `Tabs`, `Pagination`, `SegmentedControl`, `Accordion` or `Slider` under your own markup | The hook of `enchase/headless/<name>` | [HEADLESS.md](HEADLESS.md) |
| Another markup or another behavior of any component, or the code itself | `enchase eject` | this file |

The decision on the public headless hooks, taken in 0.18 and kept when they were promoted in 0.20: the behavior of those five components is public as hooks under `enchase/headless/`, and the components of the package are built on them. So ejecting one of them also copies its hook, and you can change the behavior without the entry of the package. The other components have no hook, and eject is how you own their behavior.

## Use

```bash
npx enchase eject Button Tabs     # copy into src/enchase
npx enchase eject --list          # the components that can be ejected, and the files of each
npx enchase eject --diff Button   # what changed, on each side, since you ejected
```

| Option | What it does |
| --- | --- |
| `--dir <folder>` | Where the copies are, relative to the current folder. The default is `src/enchase`. |
| `--force` | Overwrite files that already exist and differ from the library. Without it, the command stops before it writes anything. |
| `--diff` | Compare the copies with the library that is installed now. It writes nothing. |
| `--list` | Print the components that can be ejected. |

The files keep the layout of the library, so `Button` lands in `src/enchase/components/common/Button/index.tsx`, and the command prints the path to import from:

```bash
ejected Button into src/enchase: 9 files written, 0 already there
  Button: ./src/enchase/components/common/Button
```

Ejecting a second component writes the files that it shares with the first one only once. If a shared file in your project differs from the library, the command stops and lists it.

## What is copied

The component and what only it uses: its hooks, its utilities, its CSS Module, and the tokens, the motion and the positioning code that it needs. Whatever the package already exports stays in the package, and the copy imports it from `enchase`: the other components, `useUIConfig`, the types, and the icons (`enchase/icons`). So keep `enchase` installed. A typical copy is small: `Button` is 9 files, `Tabs` 12, `Menu` 28, `DatePicker` 45, `Combobox` 49, and the composite `Layout`, `Navbar` and `Footer` are 35, 30 and 7 (`npx enchase eject --list` prints every number).

Not ejectable: `UIProvider`, `ColorModeProvider`, `ToastProvider`, the styles and the theme. They hold the state that everything shares, or they are data. Configure them, do not copy them.

## What your project needs

- A bundler that handles `*.module.css` (Vite, Next.js, webpack and Parcel do).
- React 19.
- Nothing about TypeScript beyond `moduleResolution` set to `bundler` or `node`: the imports of the copies have no extension, and `allowImportingTsExtensions` is not needed. The copies are written for `strict`, and they are not for `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess` or `noPropertyAccessFromIndexSignature`: with those on, the compiler reports errors in them (12, 38 and 315 today), so keep the folder out of that configuration, or fix the copies, which are yours.

The entry of every copy starts with `'use client'`, as the package does, so a copy works inside a tree of Server Components. The CSS of the copy reads the same `--enchase-*` hooks as the package, so the theme, the styles and your own hooks keep applying. The copy keeps the selectors of the source as they are written: it is code that you own, and it weighs like any CSS of your project, one class or more, while the cascade described in [STYLING.md](STYLING.md) applies to the package that is published.

## One state, whatever the copies

The package and the copies share one instance of the contexts (the configuration of the `UIProvider`, the color mode, the navigation, the popovers and the toasts) and of three pieces of state: the stack of overlays, the lock of the page scroll and the last element that was used. They live on `globalThis`, under keys named `enchase.<name>.v1`. So an ejected `Menu` inside a `Popover` of the package still closes with Escape from the top down, and the page stays locked until the last overlay closes.

## When the library changes

Nothing updates a copy. After you upgrade `enchase`, ask what changed:

```bash
npx enchase eject --diff Button
```

For every file of the component the command compares your file with the library installed now and with the version that you ejected (`enchase.eject.json` records a hash of every file as you ejected it), and says which side changed:

| State | Meaning | What to do |
| --- | --- | --- |
| `library` | The library changed it, yours is as you ejected it. | `eject --force` takes the new one. |
| `yours` | You changed it, the library did not. | Nothing. |
| `both` | The library changed it and so did you. | Merge by hand, with the diff that is printed. |
| `new` | The library has the file now and your copy does not match. | `eject` again, or copy what you need. |
| `missing` | You deleted it. | Nothing, or `eject --force` to bring it back. |

The diff is the usual one: the lines of your file start with `-` and the lines of the library with `+`. The command exits with 1 when the library changed a file, and with 0 otherwise, so a CI job can tell you when a copy is behind. The fixes in the [CHANGELOG](CHANGELOG.md) name the components that they touch.

`eject --force` puts the library file back in place of yours: commit what you have before you use it.

## License

The code is MIT, and the notice has to travel with the copies. The command writes `LICENSE` next to them, and `enchase.eject.json` records the version and the license. Keep both. The files carry no header, because the project does not comment code.

## Support

A copy is your code. An issue about one is welcome when it reproduces with the component of the library, and the library cannot fix a copy that you changed. The package tests the copies: all of them are compiled and bundled in a project that installs the packed package, and the jsdom specs of `Button`, `Tabs` and `Menu` run against their copies.

## Weight

The sources travel in the package, in the `eject/` folder: 305 files, 0.65 MB unpacked and about 134 kB packed. They are not an entry of the package: nothing imports them, and no bundle of yours carries them.
