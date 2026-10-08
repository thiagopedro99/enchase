# positioner

Posicionador próprio em TypeScript ([`position.ts`](./position.ts), 186 linhas, 1,46 KB comprimido), candidato a motor do Popover. Reproduz `computePosition` com `offset`, `flip`, `shift`, `size` e `hide`, mais `autoUpdate`, do `@floating-ui/dom`.

## O que ele assume

- Estratégia `fixed`, com o elemento flutuante num portal no `body` (ou na camada superior do navegador).
- O limite para virar e deslizar é a janela visível (`visualViewport`). Ancestrais com rolagem só entram no cálculo de `referenceHidden`.
- Cobre: lados com `start`/`end`, `offset`, `padding`, virar de lado, deslizar, tamanho disponível, esconder quando a âncora sai de vista, RTL e âncora virtual.
- Não cobre: seta, `inline`, `autoPlacement`, `limitShift`, estratégia `absolute`, bloco contenedor com `transform`, iframes, correção de `scrollbar-gutter` e tamanhos fracionários (usa `offsetWidth`, que arredonda).

## Comparação com o floating-ui

```bash
npm install
npm run bundle
npm run diff-test
```

O [`diff-test.mjs`](./diff-test.mjs) gera 5.000 casos com semente fixa (12 posições, LTR e RTL, `offset` 0 ou 8, `padding` 0 ou 8) e compara `x`, `y`, `placement`, `availableWidth`, `availableHeight` e `referenceHidden`. Resultado no Chromium 141: 0 divergências, com 2.310 trocas de lado e 1.210 deslizamentos.

O teste só usa tamanhos inteiros e a janela como limite. Fracionários, zoom, contêiner com rolagem e ancestral com `transform` não foram medidos.

## CSS Anchor Positioning

Os `css-anchor-test*.mjs` conferem no Chromium 141: `position-area`, `position-try-fallbacks: flip-block`, o bug de `position-area: bottom` sozinho (corrigido com `justify-self: anchor-center`), `position-try-order: most-height`, `position-visibility: anchors-visible`, âncora implícita por `showPopover({ source })`, contêiner com rolagem e RTL.

## Antes de usar

Revisão linha a linha e testes dentro do repositório. A comparação com o floating-ui pode virar um teste permanente, com o floating-ui só como devDependency.
