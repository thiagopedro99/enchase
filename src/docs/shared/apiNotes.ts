export const apiNotes = {
  ColorModeScript: {
    description: 'Inline script that applies `data-theme` and `color-scheme` on the `<html>` before the first paint, so a page rendered on the server does not show the wrong theme for a moment. Render it at the start of the `<body>` or in the `<head>`, with `suppressHydrationWarning` on the `<html>`.',
    argTypes: {
      storageKey: { description: 'Key read from `localStorage`. Use the same one as the `ColorModeProvider`.', table: { defaultValue: { summary: "'enchase-color-mode'" } } },
      defaultMode: { description: 'Mode used when there is no saved choice. `system` follows the preference of the system.', table: { defaultValue: { summary: "'system'" } } },
      nonce: { description: '`nonce` of the Content-Security-Policy, so the inline script is accepted.' }
    }
  },
  GlobalStyles: {
    description: 'Reset and typographic base of the library in a `<style>`: `box-sizing`, zeroed margins, font, color and background of the `body` from the theme, size of the headings and responsive images. The CSS lives in the `enchase-base` layer. Render it once, at the root of the app.',
    argTypes: {}
  },
  ThemeVariables: {
    description: 'A `<style>` with the `--enchase-*` CSS variables of the theme. The `ColorModeProvider` already does this; use `ThemeVariables` only to render a theme CSS of your own, such as the result of `themeCss`, from `enchase/theme`.',
    argTypes: {
      css: { description: 'The CSS of the theme variables, used as the content of the `<style>`.' }
    }
  }
}
