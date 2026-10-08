# browser-mode

Testes do repositório rodando no Vitest em modo navegador, com Playwright e Chromium.

## Arquivos

- [`changes.patch`](./changes.patch): mudanças em `package.json` e `src/tests/` (axe, viewport, setup, contrato de diálogo, testes de Modal, Layout e Navbar, e três testes de sondagem em `src/tests/probe/`).
- [`vitest.projects.config.ts`](./vitest.projects.config.ts): dois projetos, `unit` (jsdom) e `browser` (Chromium, Firefox e WebKit).
- [`vitest.browser.config.ts`](./vitest.browser.config.ts): a configuração usada nas medições, com comandos de Playwright para roda do mouse e movimento contínuo do ponteiro.
- [`user-event.shim.ts`](./user-event.shim.ts): troca o `@testing-library/user-event` pelo `userEvent` de `vitest/browser` (input real), ligado por `REAL_EVENTS=1`.

## Como reproduzir

```bash
git apply -p1 research/browser-mode/changes.patch
cp research/browser-mode/vitest.*.config.ts .
npm install
npx vitest run --config vitest.browser.config.ts src/tests/components/common/Modal src/tests/components/common/Sidebar
```

Use `PW_EXECUTABLE=/caminho/do/chromium` para apontar um Chromium já instalado.

## Ajustes necessários

1. O `vitest-axe` usa o `createRequire` do Node e não roda no navegador: o `axe.ts` passa a chamar o `axe-core` direto.
2. O mock de `matchMedia` do `setup.ts` só entra no jsdom, senão esconde o real.
3. `setViewportWidth` usa `page.viewport()`, e o `before`/`after` do contrato vira assíncrono.
4. Viewport de 1280×800 (o padrão de 414×896 esconde os Breadcrumbs).
5. `optimizeDeps.include` explícito, senão o React carrega duas vezes.
6. `include` em cada projeto, porque o global é somado ao de cada um.

## Resultados

- Contratos do Modal e da Sidebar: 46/46 no Chromium. Com input real, 45/46: o clique no fundo precisa ser em (5, 5), o centro fica coberto pelo diálogo.
- Foco preso, `inert` e trava de rolagem passam de verdade.
- Mutação (ordem dos hooks trocada): o navegador pega em 4 testes; o jsdom só no teste com monkey-patch.
- Suíte inteira: 13–16 s no Chromium contra 29–33 s no jsdom. Só os contratos: 7–9 s contra 5 s.
- Com CSS real, a regra de contraste do axe tem 0 violações, desde que espere as animações terminarem.
- Firefox, WebKit e Windows não foram testados.
