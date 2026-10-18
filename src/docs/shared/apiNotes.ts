export const apiNotes = {
  ColorModeScript: {
    description: 'Script inline que aplica `data-theme` e `color-scheme` no `<html>` antes da primeira pintura, para a página renderizada no servidor não mostrar o tema errado por um instante. Renderize-o no começo do `<body>` ou no `<head>`, com `suppressHydrationWarning` no `<html>`.',
    argTypes: {
      storageKey: { description: 'Chave lida no `localStorage`. Use a mesma do `ColorModeProvider`.', table: { defaultValue: { summary: "'enchase-color-mode'" } } },
      defaultMode: { description: 'Modo usado quando não há escolha guardada. `system` segue a preferência do sistema.', table: { defaultValue: { summary: "'system'" } } },
      nonce: { description: '`nonce` da Content-Security-Policy, para o script inline ser aceito.' }
    }
  },
  GlobalStyles: {
    description: 'Reset e base tipográfica da biblioteca em um `<style>`: `box-sizing`, margens zeradas, fonte, cor e fundo do `body` a partir do tema, tamanho dos títulos e imagens responsivas. O CSS fica na camada `enchase-base`. Renderize uma vez, na raiz do app.',
    argTypes: {}
  },
  ThemeVariables: {
    description: 'Um `<style>` com as variáveis CSS `--enchase-*` do tema. O `ColorModeProvider` já faz isso; use `ThemeVariables` só para renderizar um CSS de tema seu, como o resultado de `themeCss`, de `enchase/theme`.',
    argTypes: {
      css: { description: 'O CSS das variáveis do tema, usado como conteúdo do `<style>`.' }
    }
  }
}
