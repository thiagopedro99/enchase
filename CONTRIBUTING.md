# Contributing

Contributions are welcome. Before you open a pull request, read [`skill.md`](./skill.md), which describes the code conventions and the component contract (it is written in Portuguese). Consistency with the existing pattern comes before any new abstraction.

## Running it

```bash
npm ci
npm run dev               # demo at http://localhost:5173
npm run storybook         # documentation at http://localhost:6006
```

## Before you open a pull request

All of this has to pass:

```bash
npm run build             # tsc -b and the app build
npm run lint
npm run docs:api:check    # API.md up to date with the types and the stories
npm test                  # jsdom: behavior, axe, hydration and SSR
npm run test:browser      # real Chromium (Playwright)
npm run test:browser:firefox
npm run test:browser:webkit
npm run build:lib
npm run pack:check
npm run test:consumer
npm run test:next
npm run test:size         # what an import costs in the bundle of whoever uses it
```

A change to focus, `inert`, layout or animation also has to be checked in a browser: jsdom does not simulate those. Use `npm run test:browser:repeat [N]` to find flaky tests.

## Conventions

- **No comments in the code**: no `//`, no `/* */`, no `{/* */}`, no file header.
- **Commits** follow [Conventional Commits](https://www.conventionalcommits.org/), in English, in one short line, in the imperative and without a trailing period (`feat: add the Popover`, `fix: close the confirm modal on Esc`). Prefixes: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- **Small public API:** only what is in `lib/` is public (`enchase`, `enchase/theme`, `enchase/styles/<name>`, `enchase/locales`, `enchase/icons`). `src/` is internal, and `demo/` and the stories import only from the public entry. Export little: removing an export later is a breaking change.
- **Tests:** every component has a mirror test in `src/tests/components`. New behavior gets a test, and what jsdom does not cover gets a browser test in `src/tests-browser`. A browser test goes in the folder that mirrors its component, as in `src/tests-browser/components/common/NumberInput/index.spec.tsx`; one that is not about a single component goes in `hooks`, `styles` or `platform`, and the helpers are in `support`.
- **Touch tests:** once the touch emulation of Chromium is on (`Emulation.setTouchEmulationEnabled`), the page never goes back to `hover: hover`, and any fine-pointer test that runs afterwards fails. That is why the tests that turn touch on all live in `src/tests-browser/platform/touch.spec.tsx`, which runs in a Vitest project with a page of its own (`vitest.browser.config.ts`). In Chromium touch is turned on by `enableTouch` and `disableTouch` (`src/tests-browser/support/touchInput.ts`); in WebKit the same project uses the profile of an iPhone, with native touch. Do not turn the emulation on in another file.
- **WebKit without a GPU:** the first composition of a fixed panel with a transform and an opacity can take more than 1 s on Linux without a shader cache. In tests that wait for that first opening, use `expect.poll(..., { timeout: 5000 })`.
- **Browsers in the CI:** `browser-tests.yml` runs each browser in the official Playwright image (`mcr.microsoft.com/playwright`), which already has the three browsers and the system libraries, instead of installing them on every run. The version of the image has to be the one of `playwright` in `package-lock.json`, and `browserImage.test.ts` fails when they differ: when you update Playwright, change the tag of the image in the same commit. The Vite cache is also cold on the CI: when a browser test imports a package that Vite only finds while the tests run, it optimizes the package, reloads the page and tests fail at random. `runBrowserTests.mjs` then fails with the name of the package, which goes into `optimizeDeps.include` in `vitest.browser.config.ts`.
- **Stories accessibility audit:** `npm run test:stories-a11y` runs axe-core in Chromium on every story of the built Storybook, in light and dark and in the `enchase` and `shadcn` styles, and fails on any violation that is not in the `accepted` list of `scripts/auditStories.mjs` (the `incomplete` results of axe never fail it). Run `npm run build-storybook` first, and run it by hand before every release commit: `--only`, `--combo` and `--jobs` narrow or speed up a run, and `--control` checks the pipeline against a page with known defects.
- **Package and tree-shaking:** `npm run build:lib` writes one file per module in `dist-lib` (`preserveModules` in `vite.lib.config.ts`), with `'use client'` only in `index.js`. Do not call functions at the module level in files that the components import (computed constants, global registries): the bundler of whoever uses the library cannot drop that module. `npm run test:size` bundles a few imports (`Icon`, `Button`, `createTheme`, the styles) as a consumer would, from the tarball, and fails when one goes over its budget in `scripts/testBundleSize.mjs`. If a budget is exceeded for a legitimate reason, raise it in the same commit.
- **API.md:** it is generated by `npm run docs:api` from the types of `lib/` and the `argTypes` of the stories, so it is not edited by hand. Every prop of a public component needs a `description` in the `argTypes` of its story (or in `src/docs/shared/apiNotes.ts`, for what has no story, such as `GlobalStyles`), and every component needs `parameters.docs.description.component`. The command fails when a description is missing, when the default written in the story differs from the value in the code, or when a description has an HTML tag or an asterisk outside backticks (they become HTML and emphasis in Markdown). If you changed a prop or a story, run the command and send `API.md` in the same commit; the CI and `prepublishOnly` run `npm run docs:api:check`.
- **Language of the docs:** the text of the documentation (stories, `argTypes`, the `mdx` pages, the generator of `API.md`, `README.md`, this file and `llms.txt`) is written in English, with the terms of `scripts/docsGlossary.json`. `src/tests/lib/docsLanguage.test.ts` fails when it finds Portuguese in them. `README.pt-BR.md`, `skill.md` and `CLAUDE.md` stay in Portuguese.
- **Accessibility and motion:** follow the `Contrato de componente` section of `skill.md` (`className`, `data-slot`, logical properties, motion tokens, hover only on a fine pointer, `prefers-reduced-motion`).

## Branches

Work goes into `dev`. `main` takes no direct commits: it only moves forward by fast-forward from `dev`, and the push to it is what publishes to npm (see "Publishing"). That is why `dev` must always contain `main`, and the release commit is made on `dev`.

While a version is being prepared on `dev`, `main` stays on the last published commit and only moves with the release commit. If an urgent bug shows up in that period, the hotfix comes from `main`: create a branch from it, make the fix and the `chore(release)` commit of the fix version, and push the result to `main` by fast-forward (`git push origin <branch>:main`). Then bring the hotfix back with `git merge main` on `dev`, never with a rebase: `dev` is not rewritten, it keeps containing `main`, and the next release goes forward by fast-forward.

The CI (`package.yml` and `browser-tests.yml`) runs on every push to `dev` and `main` and on every pull request. A new push cancels the previous run of the same branch or pull request, so two matrices of browsers are not queued. On `main` no run is canceled, because the publication waits for the CI of the commit.

## Publishing

The version in `package.json` only changes in the release commit, and it is the push of that commit to `main` that starts the publication. Nothing bumps the version by itself.

1. `npm run changelog` shows what would go into the next CHANGELOG, from the commits since the last tag. Only `feat`, `fix`, `perf`, `refactor` and breaking changes go in (`changelog.config.json`), and the authors are left out on purpose: `changelogen` sends the emails of the authors to an external service when they are listed.
2. `npm run release -- 0.2.0` checks that the version is greater than the current one, writes the section in `CHANGELOG.md`, updates the version in `package.json` and `package-lock.json` and creates the commit `chore(release): v0.2.0` on `dev`. Read the commit with `git show`, adjust the text of the CHANGELOG if you want (`git commit --amend`) and only then push `dev` (`git push origin dev`).
3. `git push origin dev:main`, by fast-forward. `main` takes no direct commits, and this push is what publishes to npm. `.github/workflows/release.yml` runs on every push to `main` and decides by the npm registry (`scripts/release.mjs`):
   - version not published yet: it runs `package.yml` and `browser-tests.yml` on that same commit and, only if both succeed (a skipped check does not count), publishes with trusted publishing, with provenance, and creates the tag `v0.2.0` and the GitHub Release with the section of the CHANGELOG (`src/tests/lib/releaseWorkflow.test.ts` checks the condition of that job);
   - version already published and without a tag: it only creates the tag and the Release;
   - version already published and with a tag: it does nothing.

The workflow turns red if the version is not greater than the greatest one already published, or if the tag exists without the version being on npm. The version `0.0.0` never publishes. Versions with a suffix (`0.2.0-rc.1`) go out with the `next` tag of npm, and the others with `latest`. If a publication fails, for example because the CI of the commit turned red, fix it on `dev` and push the new commit to `main`: since the decision comes from the registry, the next push tries again without touching the version.

The first version (`0.1.0`) was published by hand with `npm publish`, because the trusted publisher can only be set up on npmjs.com after the package exists. That needs 2FA on the npm account (without it the registry answers 403), and after publishing the registry takes a few minutes to show the version, which appears as "Validating". That version came from a build on Windows, without the `'use client'` directive, and was fixed in `0.1.1`: the output of the build changes between systems (line endings, hashes of the CSS Modules classes), so from then on only the CI publishes. `prepublishOnly` checks `API.md`, builds the library and checks the exported files, the `'use client'` directive in `index.js` and the size before publishing.

The trusted publisher lives at npmjs.com > `enchase` > Settings > Trusted Publisher > GitHub Actions, with user `thiagopedro99`, repository `enchase`, workflow `release.yml` and an empty environment. It shows as "Pending validation" until the first publication made by it (`0.1.1`). A published version with a defect cannot be replaced or reused: publish a new version and mark the bad one with `npm deprecate enchase@X.Y.Z "message"`.

## Pull requests

1. Fork the repository and create a branch (`git checkout -b feat/new-thing`).
2. Make small, descriptive commits.
3. Open the pull request describing what changed and why. It can target `dev`, which is where the work comes together, but that is an option and not a rule.
