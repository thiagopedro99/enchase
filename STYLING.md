# Styling: what wins over what

The CSS of the library gives each of its rules a weight: more than an element name, less than a class. This page says what that means for the CSS you write around the library, whether it comes from styled-components, CSS Modules, a plain stylesheet or Tailwind.

## Your CSS wins

A class of yours wins over the rules of the library that style the rest of a component, in any order of the stylesheets. A class that names a state wins over the library's rule for that state too, so `.save:hover` wins over the hover of the library:

```css
.save {
  background: #0b6bcb;
}

.save:hover {
  background: #084f94;
}
```

The same holds for styled-components and for CSS Modules, which generate classes:

```tsx
const Save = styled(Button)`
  background: #0b6bcb;

  &:hover {
    background: #084f94;
  }
`
```

With the layered stylesheet, `enchase/styles.layer.css`, the rules of the library are in layers, and a rule of yours outside the layers wins over all of them, whatever its weight. [Tailwind 4](#tailwind-4) says how to order the layers.

## What loses

An element selector on its own (`button`, `h1`, `a`) loses to every rule of the library. A selector with two element names (`div button`) ties with the rules of the library that have neither a class nor an element name, and then the stylesheet that comes last wins.

The hover and focus rules of the library weigh more than a rest class of yours, so a class without the state does not change them: name the state, as `.save:hover` does above. On the links of the library, a rule of yours on `a:hover` or on `:focus` loses to the library's rule for that state. On its navbar links and its breadcrumbs, a rule of yours on `:focus` loses to the focus ring of the library, so give the link a class that names the state.

## Slots

The parts of the components that you may style carry a `data-slot`, such as `modal-panel`, `drawer-panel`, `popover-content` and `menu-item`. The full list is in [API.md](API.md). A `className` passed to a component goes to its root or to the part that the API names, so `styled(Modal)` styles the panel of the dialog.

## Tailwind 4

Tailwind 4 puts its rules in layers. Declare the order before any import, and import the layered stylesheet of the library, `enchase/styles.layer.css`:

```css
@layer theme, base, enchase-theme, enchase-base, enchase, components, utilities;
```

With that order the utilities of Tailwind win over the library, and the library wins over the base of Tailwind.

## Resets

A reset that targets attributes or pseudo-classes weighs like a class, so it wins over the rules of the library that style the rest of a component, where both declare the same property. It does not win over the hover and focus rules of the library. Two known cases:

- The Tailwind 3 preflight sets `cursor: default` on `:disabled`, so a disabled button of the library takes that cursor.
- modern-normalize sets `appearance` on `[type='button']`, which wins over the library where the library declares an appearance.

A reset that must lose to the library goes in a cascade layer below it, such as `@layer base`. A rule in a layer loses to any rule outside the layers, whatever its weight.

## Ejected code

The copies made by `enchase eject` keep the CSS of the source as it is written. They weigh like any CSS of your project, and this page applies to the package that is published. See [EJECT.md](EJECT.md).

## What changed in 0.23

Four behaviors changed, and the [migration guide](docs/migration/0.23.md) shows what to change for each one:

- `element-selectors`: an element selector of yours loses to every rule of the library.
- `rest-class`: a rest class of yours that comes before the library's stylesheet wins over the library's rest rules, and over the disabled look of `Button`.
- `state-class`: a class of yours that names a state wins over the library's rule for that state, also when it comes before the library's stylesheet.
- `link-states`: a rule of yours on an element state no longer changes the hover of the library's links, nor the focus ring of its links, navbar links and breadcrumbs.
