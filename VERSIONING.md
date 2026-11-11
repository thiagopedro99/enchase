# Versioning and deprecation

Enchase follows [semantic versioning](https://semver.org), with the rules below for what counts as the public API, for the versions before 1.0, for deprecations and for the support of React, browsers and Node. The [changelog](CHANGELOG.md) says what changed in each release, and the [migration guide](MIGRATION.md) says what to check when you upgrade.

## What is the public API

A change to any of these can break an app:

- the exports of every entry of the package (`enchase`, `enchase/theme`, `enchase/styles/<name>`, `enchase/locales`, `enchase/icons`, `enchase/headless/<name>`, `enchase/styles.css`, `enchase/styles.layer.css`, `enchase/theme.css`, `enchase/css/<name>.css` and `enchase/css/index.json`), with their types, and the `enchase` command;
- the css of each component: the names of the files of `enchase/css/` (the name of the component in kebab-case, as `button-link.css`), the format of `enchase/css/index.json` (`format: 1`, and for each component the `file`, the `needs`, the `files`, the `bytes` and the `gzip`) and that the files, all together, have the rules of `enchase/styles.css`, each file with its rules in the order they have there (a declaration can sit in another place inside a rule). A new file, or a new field, is a minor version; renaming or removing a file, changing what a field means or the format, or taking a rule out of a file, is a break;
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

## The cascade

Each rule of the library weighs more than an element selector and less than a class. So a class of yours wins over the library, and an element selector of yours loses to it, in both stylesheets, `styles.css` and `styles.layer.css`. This is part of the contract of the package, and [STYLING.md](STYLING.md) says what it means for your CSS.

A change in the cascade is a change of behavior that the API check does not see: `npm run check:api` compares the types and the exports, not the weights. Such a change is listed in `api-breaks.json` under `behavior`, with its key and a note, and the first bullet of the notes of the release cites each key. The list is checked against those notes and against nothing else.

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

## Names kept until 1.0

When a name is replaced by a more fitting one and the old one costs nothing to keep, both work until 1.0, the notes of the release that adds the new name say so, and the types do not flag the old one. Today there is one:

- `id` in the items of `Breadcrumbs` and in the `breadcrumbs` of `Layout`. The name is `value`, as in `Tabs`, `Accordion` and `SegmentedControl`. An item takes either, `value` wins when both are given, and an item with neither is keyed by its position in the trail: the type does not ask for a name. The page is the same with either name, and `id` is accepted until 1.0.

## Experimental

An entry under `enchase/experimental/*` is experimental: it may change or go away in a minor version, and the notes list every change. The path of an experimental entry says so, and it does not count for the three minor versions in a row without a break that 1.0 asks for.

Nothing new is experimental today. A hook or a command that was experimental is promoted when it has stayed the same for two minor versions in a row and is documented and tested: for a hook, its signature, [HEADLESS.md](HEADLESS.md) and a spec in real browsers that covers its focus and its pointer; for the `enchase eject` command, its interface (the commands and the options), the format of `enchase.eject.json` and the set of files that each component copies (`eject/index.json`). The notes of the release that promotes it say so, and say where it lives from then on.

0.20 promoted both, because 0.18 and 0.19 had the same signatures, the same interface, the same format and the same files:

- The five hooks of [HEADLESS.md](HEADLESS.md) live in `enchase/headless/<name>`, and are part of the stable API. The old `enchase/experimental/<name>` paths are deprecated aliases of them: they keep working, the editor and `tsc` flag every import, and 1.0 removes them.
- `enchase eject` is stable. What is frozen is its interface (the commands and the options), the format of `enchase.eject.json` (`format: 1`) and that every component that `eject/index.json` lists is ejectable and compiles next to the package (`npm run test:eject`). What is not frozen is the layout of the folders and the files of a component, which is not public API: the set of files that was the same from 0.18 to 0.19 was the evidence for the promotion, and it is not a promise. A minor may move it, the notes say so, and `--diff` is how a copy meets the change ([EJECT.md](EJECT.md)).

## Which versions get fixes

Fixes, security ones included, go to the latest minor version, as a patch. There are no backports.

## React, browsers and Node

The [support matrix](README.md#support) lists the minimum versions. Raising a minimum is a breaking change: before 1.0 it comes in a minor, with a note, and from 1.0 it comes in a major.
