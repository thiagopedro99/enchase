# Contribuindo

Contribuições são bem-vindas. Antes de abrir um pull request, leia o [`skill.md`](./skill.md), que descreve as convenções de código e o contrato de componente. A consistência com o padrão existente vem antes de qualquer abstração nova.

## Como rodar

```bash
npm ci
npm run dev               # demo em http://localhost:5173
npm run storybook         # documentação em http://localhost:6006
```

## Antes de abrir o PR

Tudo isto precisa passar:

```bash
npm run build             # tsc -b e build do app
npm run lint
npm test                  # jsdom: comportamento, axe, hidratação e SSR
npm run test:browser      # Chromium real (Playwright)
npm run test:browser:firefox
npm run test:browser:webkit
npm run build:lib
npm run pack:check
npm run test:consumer
npm run test:next
```

Mudança em foco, `inert`, layout ou animação também deve ser conferida no navegador: o jsdom não simula esses recursos. Use `npm run test:browser:repeat [N]` para detectar testes instáveis.

## Convenções

- **Sem comentários no código**, nem `//`, `/* */`, `{/* */}`, nem cabeçalho de arquivo.
- **Commits** no padrão [Conventional Commits](https://www.conventionalcommits.org/), em inglês, com uma linha curta, no imperativo e sem ponto final (`feat: add the Popover`, `fix: close the confirm modal on Esc`). Prefixos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- **API pública pequena:** só o que está em `lib/` é público (`enchase`, `enchase/theme`, `enchase/locales`). `src/` é interno, e `demo/` e as stories importam só da entrada pública. Exportar pouco: remover um export depois é uma quebra de versão.
- **Testes:** todo componente tem um teste espelho em `src/tests/components`. Comportamento novo ganha teste, e o que o jsdom não cobre ganha teste de navegador em `src/tests-browser`.
- **Testes de toque:** depois de ligar a emulação de toque do Chromium (`Emulation.setTouchEmulationEnabled`), a página não volta mais a `hover: hover`, e qualquer teste de ponteiro fino que rodar depois falha. Por isso os testes que ligam toque ficam todos em `src/tests-browser/touch.spec.tsx`, que roda num projeto do Vitest com página própria (`vitest.browser.config.ts`). No Chromium o toque é ligado por `enableTouch` e `disableTouch` (`src/tests-browser/touchInput.ts`); no WebKit o mesmo projeto usa o perfil de um iPhone, com toque nativo. Não ligue a emulação em outro arquivo.
- **WebKit sem GPU:** a primeira composição de um painel fixo com transformação e opacidade pode passar de 1 s em Linux sem cache de shaders. Em testes que esperam essa primeira abertura, use `expect.poll(..., { timeout: 5000 })`.
- **Pacote e tree-shaking:** `npm run build:lib` gera um arquivo por módulo em `dist-lib` (`preserveModules` em `vite.lib.config.ts`), com `'use client'` só no `index.js`. Não chame funções no nível do módulo em arquivos que os componentes importam (constantes calculadas, registros globais): o bundler de quem usa não consegue descartar esse módulo. Para conferir, empacote só `import { Icon } from 'enchase'` (hoje cerca de 1 KB minificado, e o `Button` cerca de 6 KB).
- **Acessibilidade e movimento:** siga a seção "Contrato de componente" do `skill.md` (`className`, `data-slot`, propriedades lógicas, tokens de movimento, hover só em ponteiro fino, `prefers-reduced-motion`).

## Pull requests

1. Faça um fork e crie uma branch (`git checkout -b feat/nova-coisa`).
2. Faça commits pequenos e descritivos.
3. Abra o pull request descrevendo o que mudou e por quê.
