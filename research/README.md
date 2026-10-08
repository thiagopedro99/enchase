# research

Experimentos que embasaram o plano de transformar o Enchase em lib. Nada aqui faz parte do pacote, do build, do `tsc` (que só confere `src/`), do lint (o `eslint.config.js` ignora `research/`) nem do `npm run test`.

Todo o código desta pasta foi escrito por agentes num ambiente de teste, em 2026-10-08, e **não foi revisado**. Serve como evidência e ponto de partida, não como código pronto. Os experimentos de navegador rodaram só no Chromium 141 (Playwright 1.56); Firefox e WebKit não estavam disponíveis, e o comportamento deles veio da base de compatibilidade do MDN (BCD/web-features) e das especificações.

| Pasta | O que mede | Resultado principal |
|---|---|---|
| [`hydration/`](./hydration) | Renderização no servidor e hidratação dos componentes atuais | Nenhum quebra no servidor; 8 dos 23 casos listados não hidratam limpo, por 3 causas |
| [`positioner/`](./positioner) | Posicionador próprio (186 linhas) contra o `@floating-ui/dom` 1.8.0, e testes de CSS Anchor Positioning | Matemática igual ao floating-ui; a [revisão](./positioner/review) achou 7 bugs nas bordas, com versão corrigida |
| [`browser-mode/`](./browser-mode) | Testes de contrato no Vitest em modo navegador (Chromium) | Contratos do Modal e da Sidebar 46/46; suíte inteira 13–16 s contra 29–33 s no jsdom |
| [`layered-css/`](./layered-css) | Variante `styles.layer.css` e nomes de classe por componente | Um build e um plugin pós-build geram os dois arquivos; `enchase-[local]` colide |
| [`overlay-stack/`](./overlay-stack) | Popover dentro do Modal com os hooks atuais, e uma pilha de camadas | Hoje um Esc fecha os dois; o protótipo de 66 linhas resolve sem quebrar testes |
| [`native-dialog/`](./native-dialog) | `<dialog>`/`popover` nativos: saída animada, empilhamento, SSR | Funciona no Chromium, com armadilhas; decisão adiada (portais por enquanto) |

## Requisitos para rodar

- Node 22 ou mais novo.
- Um Chromium para o Playwright. Os scripts usam `/opt/pw-browsers/chromium` (o caminho do ambiente onde rodaram); troque pelo seu, ou rode `npx playwright install chromium` e remova o `executablePath`.
- Cada pasta tem o próprio `package.json`: rode `npm install` dentro dela. As exceções são `browser-mode/` e `hydration/`, que dependem do repositório (veja os READMEs delas).
