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
npm run test:size         # o que um import único custa no bundle de quem usa
```

Mudança em foco, `inert`, layout ou animação também deve ser conferida no navegador: o jsdom não simula esses recursos. Use `npm run test:browser:repeat [N]` para detectar testes instáveis.

## Convenções

- **Sem comentários no código**, nem `//`, `/* */`, `{/* */}`, nem cabeçalho de arquivo.
- **Commits** no padrão [Conventional Commits](https://www.conventionalcommits.org/), em inglês, com uma linha curta, no imperativo e sem ponto final (`feat: add the Popover`, `fix: close the confirm modal on Esc`). Prefixos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- **API pública pequena:** só o que está em `lib/` é público (`enchase`, `enchase/theme`, `enchase/locales`). `src/` é interno, e `demo/` e as stories importam só da entrada pública. Exportar pouco: remover um export depois é uma quebra de versão.
- **Testes:** todo componente tem um teste espelho em `src/tests/components`. Comportamento novo ganha teste, e o que o jsdom não cobre ganha teste de navegador em `src/tests-browser`.
- **Testes de toque:** depois de ligar a emulação de toque do Chromium (`Emulation.setTouchEmulationEnabled`), a página não volta mais a `hover: hover`, e qualquer teste de ponteiro fino que rodar depois falha. Por isso os testes que ligam toque ficam todos em `src/tests-browser/touch.spec.tsx`, que roda num projeto do Vitest com página própria (`vitest.browser.config.ts`). No Chromium o toque é ligado por `enableTouch` e `disableTouch` (`src/tests-browser/touchInput.ts`); no WebKit o mesmo projeto usa o perfil de um iPhone, com toque nativo. Não ligue a emulação em outro arquivo.
- **WebKit sem GPU:** a primeira composição de um painel fixo com transformação e opacidade pode passar de 1 s em Linux sem cache de shaders. Em testes que esperam essa primeira abertura, use `expect.poll(..., { timeout: 5000 })`.
- **Pacote e tree-shaking:** `npm run build:lib` gera um arquivo por módulo em `dist-lib` (`preserveModules` em `vite.lib.config.ts`), com `'use client'` só no `index.js`. Não chame funções no nível do módulo em arquivos que os componentes importam (constantes calculadas, registros globais): o bundler de quem usa não consegue descartar esse módulo. O `npm run test:size` empacota só o `Icon` e só o `Button` como um consumidor (a partir do tarball) e falha se passarem do limite em `scripts/testBundleSize.mjs` (hoje cerca de 1,4 KB e 7,2 KB minificados, com limites de 4 KB e 12 KB). Se um limite estourar por um motivo legítimo, suba o limite no mesmo commit.
- **Acessibilidade e movimento:** siga a seção "Contrato de componente" do `skill.md` (`className`, `data-slot`, propriedades lógicas, tokens de movimento, hover só em ponteiro fino, `prefers-reduced-motion`).

## Publicação

A versão do `package.json` só muda no commit de release, e é esse commit que dispara a publicação. Nada sobe a versão sozinho.

1. `npm run changelog` mostra o que entraria no próximo CHANGELOG, a partir dos commits desde a última tag. Só entram `feat`, `fix`, `perf`, `refactor` e mudanças que quebram (`changelog.config.json`), e os autores ficam de fora de propósito: o `changelogen` envia o e-mail dos autores a um serviço externo quando eles são listados.
2. `npm run release -- 0.2.0` confere que a versão é maior que a atual, escreve a seção no `CHANGELOG.md`, atualiza a versão no `package.json` e no `package-lock.json` e cria o commit `chore(release): v0.2.0`. Leia o commit com `git show`, ajuste o texto do CHANGELOG se quiser (`git commit --amend`) e só então envie.
3. `git push` na `main`. O `.github/workflows/release.yml` roda em todo push na `main` e decide pelo registro do npm (`scripts/release.mjs`):
   - versão ainda não publicada: roda `package.yml` e `browser-tests.yml` nesse mesmo commit e, só se passarem, publica por trusted publishing, com proveniência, e cria a tag `v0.2.0` e a GitHub Release com a seção do CHANGELOG;
   - versão já publicada e sem tag: só cria a tag e a Release;
   - versão já publicada e com tag: não faz nada.

O workflow fica vermelho se a versão não for maior que a maior já publicada, ou se a tag existir sem a versão estar no npm. A versão `0.0.0` nunca publica. Versões com sufixo (`0.2.0-rc.1`) saem com a tag `next` do npm, e as demais com `latest`. Se uma publicação falhar, por exemplo porque o CI do commit ficou vermelho, corrija e envie um novo commit: como a decisão é pelo registro, o push seguinte tenta de novo sem precisar mexer na versão.

A primeira versão (`0.1.0`) é publicada à mão com `npm publish`, porque o trusted publisher só pode ser configurado no npmjs.com depois que o pacote existe. O `prepublishOnly` constrói a biblioteca e confere os arquivos exportados e o tamanho antes de publicar.

## Pull requests

1. Faça um fork e crie uma branch (`git checkout -b feat/nova-coisa`).
2. Faça commits pequenos e descritivos.
3. Abra o pull request descrevendo o que mudou e por quê.
