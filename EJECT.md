# Eject

`enchase eject` copies the source of a component into your project, so that the code is yours: you change the markup, the behavior and the styles without waiting for the library and without a fork.

It is the way out of the library, not the way to use it. A copy stops following the library: nothing updates it, and the accessibility contract of the package holds for what the package publishes, not for your copy. Most changes do not need it: the CSS hooks (`--enchase-<part>-<property>`), the styles (`createTheme({ style })`) and the `data-slot` of every part change how a component looks, and the props change what it does. Eject when you need another markup or another behavior.

**Experimental in 0.16 and 0.17.** The command, its options and the format of `enchase.eject.json` can still change in a minor.

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
- Nothing about TypeScript beyond `moduleResolution` set to `bundler` or `node`: the imports of the copies have no extension, and `allowImportingTsExtensions` is not needed.

The entry of every copy starts with `'use client'`, as the package does, so a copy works inside a tree of Server Components. The CSS of the copy reads the same `--enchase-*` hooks as the package, so the theme, the styles and your own hooks keep applying.

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

The sources travel in the package, so it is 114 kB bigger (402.6 kB, from 288.5 kB) and 0.65 MB bigger unpacked. They are not an entry of the package: nothing imports them, and no bundle of yours carries them.
