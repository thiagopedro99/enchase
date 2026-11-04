# Versioning and deprecation

Enchase follows [semantic versioning](https://semver.org), with the rules below for what counts as the public API, for the versions before 1.0, for deprecations and for the support of React, browsers and Node. The [changelog](CHANGELOG.md) says what changed in each release, and the [migration guide](MIGRATION.md) says what to check when you upgrade.

## What is the public API

A change to any of these can break an app:

- the exports of every entry of the package (`enchase`, `enchase/theme`, `enchase/styles/<name>`, `enchase/locales`, `enchase/icons`, `enchase/styles.css`, `enchase/styles.layer.css` and `enchase/theme.css`), with their types, and the `enchase` command;
- the props of the components, their types and what they do;
- the CSS hooks (`--enchase-<part>-<property>`) and their defaults, and the `data-slot` names of the parts, as [API.md](API.md) lists them;
- the theme: the tokens, the shape of `ThemeStyle` and what `createTheme`, `defineStyle` and `validateTheme` accept and return;
- the roles, names, states and keyboard behavior that [ACCESSIBILITY.md](ACCESSIBILITY.md) promises;
- the minimum versions of React, of the browsers and of Node in the [support matrix](README.md#support).

## What is not

- The DOM around a `data-slot`: an element can appear or go away, and the aim is that the DOM and the CSS render as before unless an option asks for something else, but that aim is not a promise.
- The CSS class names, which are generated.
- The code under `src/`, which is not an entry of the package.
- The `eject/` folder of the package: it is generated, and the `enchase eject` command is the way to read it.
- Anything experimental (see below).

## Before 1.0

A minor version may break. The first bullet of the notes of every release says whether anything does ("No breaking change", or what breaks), the [migration guide](MIGRATION.md) has a page for the minor, and a patch never breaks.

A break that is on purpose is declared: `npm run check:api` compares every build with the last version on npm, and a removal, a change or a raised minimum in the stable API fails until `api-breaks.json` lists it and the first bullet of the notes cites it. [CONTRIBUTING.md](CONTRIBUTING.md) has the details.

## From 1.0

- A **major** version is the only one that breaks the public API.
- A **minor** version adds: what is new is opt-in, and the DOM and the CSS of what already existed are as they were, except for a fix.
- A **patch** version fixes. A fix that changes what an app sees is still a patch when it restores the documented behavior, and the notes say what changed.

## Deprecation

From 1.0 an API is deprecated before it is removed:

- the release that deprecates it says so in its notes and names the replacement, and a development build warns in the console when that costs little;
- it keeps working for at least two minor versions;
- it is removed in a major version.

Before 1.0 the same steps apply when they can, but the removal can come in the next minor, with a note and a page in the migration guide.

## Experimental

An entry under `enchase/experimental/*`, and the `enchase eject` command until the notes say that it was promoted, are experimental: they may change or go away in a minor version, and the notes list every change. The path of an experimental entry says so. They do not count for the three minor versions in a row without a break that 1.0 asks for.

A hook of `enchase/experimental/*` is promoted when its signature stays the same for two minor versions in a row, [HEADLESS.md](HEADLESS.md) covers it, and a spec in real browsers covers its focus and its pointer. The notes of the release that promotes it say so, and say where it lives from then on.

## Which versions get fixes

Fixes, security ones included, go to the latest minor version, as a patch. There are no backports.

## React, browsers and Node

The [support matrix](README.md#support) lists the minimum versions. Raising a minimum is a breaking change: before 1.0 it comes in a minor, with a note, and from 1.0 it comes in a major.
