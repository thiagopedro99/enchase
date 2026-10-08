# Revisão do posicionador

Revisão linha a linha do [`../position.ts`](../position.ts) e medição de cobertura contra o `@floating-ui/dom` 1.8.0 configurado como um Popover usaria: `strategy: 'fixed'`, elemento flutuante no `body`, `[offset, flip({ padding }), shift({ padding }), size({ padding }), hide()]`. Tudo rodou no Chromium 141; Firefox e WebKit não foram testados.

## Arquivos

- [`position-fixed.ts`](./position-fixed.ts): versão com todas as correções abaixo (288 linhas; precisa ser dividida para caber na regra de ~200 linhas do `skill.md`).
- [`position-naive.ts`](./position-naive.ts): só a primeira correção, para mostrar o segundo bug que ela expõe.
- [`position-style.ts`](./position-style.ts): o original reescrito sem `for`, com `map`/`find` e recursão, no estilo do `skill.md`. Mesmo resultado.
- `t1` a `t16`: um teste por achado. Cada um recebe o bundle como argumento (`node t1-everyframe.mjs ./bundle-fixed.js`).
- [`h.mjs`](./h.mjs): abre o Chromium (com `scrollbars: true` tira o `--hide-scrollbars` do Playwright) e injeta o bundle.

```bash
npm install
npm run bundle
node t1-everyframe.mjs ./bundle.js
node t1-everyframe.mjs ./bundle-fixed.js
```

## O que está certo

A matemática de posição, troca de lado, deslizamento e tamanho disponível (linhas 56-107 e 142-151) bate com o floating-ui: 0 divergências em 13.000 casos aleatórios, incluindo RTL, âncora de tamanho zero, `offset` fracionário e elemento maior que a janela. Zoom de pinça, rolagem longa da página, ancestral com `transform` e âncora virtual também batem.

## Bugs confirmados

| # | Linhas | Problema | Correção (em `position-fixed.ts`) |
|---|---|---|---|
| 1 | 157-162, 170-177 | Com `everyFrame`, o primeiro callback do `ResizeObserver` chama `schedule`, que cancela o `frame` do laço. O laço morre: 2 atualizações em 40 quadros, o popover fica 130px atrás da âncora animada. | Handles separados para o laço e para o agendamento. |
| 2 | 170-176 | Com o bug 1 corrigido, chamar o cleanup de dentro do `update` deixa o laço rodando para sempre. | Flag `active` checada antes de reagendar. |
| 3 | 159-164 | Atualizações do `ResizeObserver` passam por `requestAnimationFrame` e chegam um quadro atrasadas: um quadro pintado com o popover sobre a âncora. | Chamar o `update` direto, com a mesma guarda do floating-ui contra o erro "ResizeObserver loop". |
| 4 | 129 | `offsetWidth`/`offsetHeight` arredondam: 5.003 de 6.000 casos fracionários divergem em até 0,5px, e às vezes outro lado é escolhido. | Ler a largura do `getComputedStyle`, com `offset*` só como reserva, como o floating-ui. |
| 5 | 125-153 | O tamanho disponível é devolvido mas não aplicado antes de posicionar: com `top`, o popover sai da tela depois que quem chama aplica o `maxHeight`. | Opção `apply` que aplica o tamanho, mede de novo e recalcula. |
| 6 | 48-54 | Ignora `scrollbar-gutter: stable` (que o `global.ts` do Enchase usa): em página curta ou com a trava de rolagem do Modal, os últimos 15px do popover ficam cortados. | Medir a área que elementos `fixed` realmente usam. |
| 7 | 109-123 | `referenceHidden` errado: usa a borda dos contêineres (âncora sob a borda ou a barra de rolagem conta como visível) e não considera bloco contenedor (âncora `fixed` ou `absolute` que escapa do recorte é dada como escondida). | Caixa interna (`clientLeft`/`clientWidth`) e o filtro de ancestrais do floating-ui. |

## Lacunas (documentar ou implementar)

- Sem detecção de mudança de layout: se a âncora se move sem rolagem nem redimensionamento, o popover fica parado. A versão corrigida porta o `observeMove` do floating-ui (`IntersectionObserver`, ~45 linhas).
- O listener de rolagem em captura atualiza a cada rolagem da página, inclusive dentro do próprio popover. Não erra, só gasta.
- Sem suporte (o floating-ui 1.8 também falha): `zoom` CSS no `<html>`, bloco contenedor `fixed` criado por `transform`/`filter`/`will-change`/`contain` no `html` ou `body`, `scrollbar-gutter: stable both-edges`.
- Sem opção de elemento de limite: o limite é sempre a janela visível. Para um Popover no `body`, é o mesmo padrão do floating-ui.
- Os ramos específicos do WebKit (deslocamento do `visualViewport`) e do Firefox (barra de rolagem à esquerda em RTL) não foram exercitados.

## Para o teste permanente

O `diff-test.mjs` original era cego a três cenários: só tamanhos inteiros, contêiner sem borda e o `--hide-scrollbars` padrão do Playwright. O teste de propriedade definitivo deve incluir tamanhos fracionários e definidos pelo texto, bordas de contêiner, `scrollbar-gutter`, âncoras que escapam do recorte e um navegador sem `--hide-scrollbars`, e rodar no Chromium, Firefox e WebKit.
