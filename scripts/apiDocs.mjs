export const hookNotes = {
  useBreakpoint: 'Current screen range, from `xs` to `xxl`, according to the breakpoints of the `UIProvider`. `up(name)` holds when the screen is at least `name` wide and `down(name)` when it is narrower than `name`. On the server and during hydration the `server` argument applies (default `xs`); after mounting, the real width applies.',
  useColorMode: 'The chosen color mode (`light`, `dark` or `system`), the resolved mode (`light` or `dark`) and the functions to change it. Throws an error outside the `ColorModeProvider`.',
  useScrollSpy: 'Returns the `id` of the section that is in the reading band, from `topOffset` px (default 96) below the top to 45% of the screen height, or `undefined` while none has arrived. It follows sections that mount later, remount or leave the page, and only the contents of the `ids` array count, not its identity.',
  useToast: 'Opens notifications through the `success`, `error`, `warning` and `info` methods, for example `success("Saved", 3000)`, and each one returns the id of the notification, which `removeToast(id)` accepts to close it and `update(id, patch)` accepts to change it. The message is text or nodes. `duration` is in milliseconds and 0 keeps the notification open until someone closes it. The third argument takes `className`, `style`, `action` (`{ label, onClick }`, a button that runs `onClick` and closes the notification) and `dismissible` (false removes the close button and the close by click or Esc). `update(id, patch)` changes `message`, `type`, `duration`, `action`, `dismissible`, `className` or `style` in place, and a new `duration` restarts the countdown. `promise(task, { loading, success, error })` shows `loading` as a notification that does not expire and turns it into `success` or `error` when the promise settles (both can be functions of the value or of the reason), and returns the same promise. Throws an error outside the `ToastProvider`.',
  useTabs: 'The state, the keyboard and the roles of a tab list, as prop getters for the list, for each tab and for each panel. The arrows, Home and End move the focus along the enabled tabs (the arrows swap in right to left) and select what they focus, unless `activation` is `manual`. The ids that tie a tab to its panel come from `useId` and from the position of the value in `items`.',
  usePagination: 'The current page, the items to draw (page numbers and the two ellipses) and the prop getters of the previous button, of the next button and of each page button. The counts are read as whole numbers that are not negative and the page stays inside the range. The previous and next buttons stay focusable at the ends and say so with `aria-disabled`.',
  useSegmentedControl: 'The selected values, the keyboard and the roles of a group of options. By default it is a radio group, with one tab stop and the arrows moving the choice; with `multiple` it is a group of toggle buttons that all stay in the tab order. The options follow the `multiple` of the component: a string for one value and a list for several.',
  useAccordion: 'The open items and the prop getters of the triggers and of the panels of a group of disclosures. One item is open at a time unless `multiple` is set, and the arrows, Home and End move the focus along the enabled triggers without opening anything. The heading around each trigger is yours.',
  useSlider: 'The value, its position in percent and the prop getters of the control (which takes the pointer), of the track and of the thumb of a slider. The value stays on a step inside the range, and the pointer, the arrows, Home, End, PageUp and PageDown set it, mirrored in right to left. A touch waits for the finger to go across before it moves. `dragging` and `pointerFocus` tell the states to draw.',
  useUIConfig: 'Configuration of the nearest `UIProvider`: motion, labels, text direction, language code (`locale`, such as `pt-BR`) and breakpoints. Without a provider, it returns the default values.'
}

const collator = (first, second) => (first.name < second.name ? -1 : first.name > second.name ? 1 : 0)

export const escapeCell = (text) => text.replace(/\s*\r?\n\s*/g, ' ').replace(/\|/g, '\\|').trim()

const code = (text) => `\`${escapeCell(text)}\``

const defaultCell = ({ required, default: fallback }) => (required ? '*required*' : fallback ? code(fallback) : '—')

const propRow = (prop) => `| ${code(prop.name)} | ${code(prop.type)} | ${defaultCell(prop)} | ${escapeCell(prop.description ?? '')} |`

const attributeNote = (element) => (element === 'root' ? 'Also accepts the other HTML attributes of the root element.' : `Also accepts the other attributes of ${code(`<${element}>`)}, passed on to the element.`)

const refNote = (element) => (element === 'root' ? 'Forwards the `ref` to the root element.' : `Forwards the \`ref\` to ${code(`<${element}>`)}.`)

const componentSection = ({ name, description, props, element, refElement }) => {
  const notes = [element && attributeNote(element), refElement && refNote(refElement)].filter(Boolean)
  const table = props.length > 0 ? ['| Prop | Type | Default | Description |', '| --- | --- | --- | --- |', ...props.map(propRow)] : ['No props of its own.']

  return [`### ${name}`, '', ...(description ? [description, ''] : []), ...table, ...(notes.length > 0 ? ['', notes.join(' ')] : [])].join('\n')
}

const iconsIntro = 'Exported by `enchase/icons`, one component per icon, and only the ones that some component uses inside. They work in Server Components. They all have the same props. Without `title` the icon is decorative (`aria-hidden`); with `title` it becomes an image with an accessible name. The `data-icon` attribute carries the name in kebab case, to style from outside or in tests, and the ones that point to a side mirror in RTL on their own. Changing the drawing of an icon is not a breaking change; renaming or removing one is.'

const iconsSection = ({ props, element, items }) => {
  const table = ['| Prop | Type | Default | Description |', '| --- | --- | --- | --- |', ...props.map(propRow)]
  const rows = [...items].sort(collator).map(({ name, dataIcon, directional }) => `| ${code(name)} | ${code(dataIcon)} | ${directional ? 'yes' : '—'} |`)

  return ['## Icons', '', iconsIntro, '', ...table, '', attributeNote(element), '', '| Icon | `data-icon` | Mirrors in RTL |', '| --- | --- | --- |', ...rows].join('\n')
}

const hookSection = ({ name, signature, note, members }) => {
  const returned = members.length > 0 ? ['', 'Returns:', '', '| Member | Type |', '| --- | --- |', ...members.map((member) => `| ${code(member.name)} | ${code(member.type)} |`)] : []

  return [`### ${name}`, '', '```ts', signature, '```', ...(note ? ['', note] : []), ...returned].join('\n')
}

const cssHooksIntro =
  'Optional CSS variables that each component reads to change a measure, a font, a corner or a timing without writing CSS on top. The theme does not declare them: without a value, the component uses the default in the table, and a default that points to a theme token keeps following an override of that token. With `data-density="compact"` on the `<html>`, some of them take a lower value (see System/Density in the Storybook), and a hook of yours wins over it. The name is `--enchase-<data-slot>-<property>`, with the name of the `data-slot` of the part and, when there is more than one size or variant, its suffix (`--enchase-switch-thumb-size`, `--enchase-button-padding-inline-md`). Experimental until version 1.0: a name can change in a minor version.'

const cssHookDefault = ({ default: fallback, token }) => (token ? `${code(fallback)} (${code(token)})` : code(fallback))

const cssHookProperties = ({ properties, components, owner }) => {
  const others = components.filter((component) => component !== owner)

  return `${properties.map(code).join(', ')}${others.length > 0 ? ` (also in ${others.join(', ')})` : ''}`
}

const cssHooksSection = (cssHooks) =>
  [
    '## CSS hooks',
    '',
    cssHooksIntro,
    '',
    cssHooks
      .map(({ component, hooks }) =>
        [`### ${component}`, '', '| Hook | Default | Property |', '| --- | --- | --- |', ...hooks.map((hook) => `| ${code(hook.name)} | ${cssHookDefault(hook)} | ${cssHookProperties(hook)} |`)].join('\n')
      )
      .join('\n\n')
  ].join('\n')

const headlessIntro =
  'Headless hooks: the state, the keyboard and the ARIA of a component, as prop getters that you spread on your own markup, with no CSS and no markup of the library. Each one has an entry of its own, `enchase/headless/<name>`, which exports the hook and its types and is for Client Components. They are part of the stable API since 0.20. [HEADLESS.md](HEADLESS.md) explains how to use them, and what became of the old `enchase/experimental/<name>` paths.'

const headlessSection = (headless) => {
  const sorted = [...headless].sort(collator)

  const hookSection = ({ name, entry, signature, note, options, members }) =>
    [
      `### ${name}`,
      '',
      `Import it from ${code(entry)}.`,
      '',
      '```ts',
      signature,
      '```',
      ...(note ? ['', note] : []),
      '',
      'Options:',
      '',
      '| Option | Type | Required |',
      '| --- | --- | --- |',
      ...options.map((option) => `| ${code(option.name)} | ${code(option.type)} | ${option.required ? 'yes' : '—'} |`),
      '',
      'Returns:',
      '',
      '| Member | Type |',
      '| --- | --- |',
      ...members.map((member) => `| ${code(member.name)} | ${code(member.type)} |`)
    ].join('\n')

  return ['## Headless hooks', '', headlessIntro, '', sorted.map(({ name }) => `[${name}](#${name.toLowerCase()})`).join(' · '), '', sorted.map(hookSection).join('\n\n')].join('\n')
}

export const renderApiDocs = ({ components, hooks, headless = [], icons, cssHooks = [] }) => {
  const sortedComponents = [...components].sort(collator)
  const sortedHooks = [...hooks].sort(collator)
  const index = sortedComponents.map(({ name }) => `[${name}](#${name.toLowerCase()})`).join(' · ')

  return (
    [
      '# API',
      '',
      'Reference of the props, the hooks and the icons exported by `enchase` and `enchase/icons`, and of the headless hooks of `enchase/headless/*`, generated by `npm run docs:api` from the types of the package and the stories of the Storybook. Do not edit this file by hand: change the type or the `argTypes` of the story and generate it again.',
      '',
      'Usage examples are in the [README](README.md), in the [full guide](https://github.com/thiagopedro99/enchase/blob/main/README.pt-BR.md), in Portuguese, and in the [Storybook](https://enchase.othiagosilva.com.br/docs/).',
      '',
      '## Components',
      '',
      index,
      '',
      sortedComponents.map(componentSection).join('\n\n'),
      '',
      '## Hooks',
      '',
      sortedHooks.map(({ name }) => `[${name}](#${name.toLowerCase()})`).join(' · '),
      '',
      sortedHooks.map(hookSection).join('\n\n'),
      ...(headless.length > 0 ? ['', headlessSection(headless)] : []),
      '',
      iconsSection(icons),
      ...(cssHooks.length > 0 ? ['', cssHooksSection(cssHooks)] : [])
    ].join('\n') + '\n'
  )
}
