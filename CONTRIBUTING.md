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
npm run docs:api:check     # API.md em dia com os tipos e as stories
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
- **API pública pequena:** só o que está em `lib/` é público (`enchase`, `enchase/theme`, `enchase/styles/<nome>`, `enchase/locales`, `enchase/icons`). `src/` é interno, e `demo/` e as stories importam só da entrada pública. Exportar pouco: remover um export depois é uma quebra de versão.
- **Testes:** todo componente tem um teste espelho em `src/tests/components`. Comportamento novo ganha teste, e o que o jsdom não cobre ganha teste de navegador em `src/tests-browser`.
- **Testes de toque:** depois de ligar a emulação de toque do Chromium (`Emulation.setTouchEmulationEnabled`), a página não volta mais a `hover: hover`, e qualquer teste de ponteiro fino que rodar depois falha. Por isso os testes que ligam toque ficam todos em `src/tests-browser/touch.spec.tsx`, que roda num projeto do Vitest com página própria (`vitest.browser.config.ts`). No Chromium o toque é ligado por `enableTouch` e `disableTouch` (`src/tests-browser/touchInput.ts`); no WebKit o mesmo projeto usa o perfil de um iPhone, com toque nativo. Não ligue a emulação em outro arquivo.
- **WebKit sem GPU:** a primeira composição de um painel fixo com transformação e opacidade pode passar de 1 s em Linux sem cache de shaders. Em testes que esperam essa primeira abertura, use `expect.poll(..., { timeout: 5000 })`.
- **Navegadores na CI:** o `browser-tests.yml` roda cada navegador na imagem oficial do Playwright (`mcr.microsoft.com/playwright`), que já traz os três navegadores e as bibliotecas do sistema, em vez de instalá-los a cada execução. A versão da imagem precisa ser a do `playwright` no `package-lock.json`, e o `browserImage.test.ts` falha se divergirem: ao atualizar o Playwright, troque a tag da imagem no mesmo commit.
- **Pacote e tree-shaking:** `npm run build:lib` gera um arquivo por módulo em `dist-lib` (`preserveModules` em `vite.lib.config.ts`), com `'use client'` só no `index.js`. Não chame funções no nível do módulo em arquivos que os componentes importam (constantes calculadas, registros globais): o bundler de quem usa não consegue descartar esse módulo. O `npm run test:size` empacota só o `Icon` e só o `Button` como um consumidor (a partir do tarball) e falha se passarem do limite em `scripts/testBundleSize.mjs` (hoje cerca de 1,4 KB e 7,2 KB minificados, com limites de 4 KB e 12 KB). Se um limite estourar por um motivo legítimo, suba o limite no mesmo commit.
- **API.md:** é gerado por `npm run docs:api` a partir dos tipos de `lib/` e das `argTypes` das stories, então não se edita à mão. Toda prop de um componente público precisa de `description` no `argTypes` da story (ou em `src/docs/shared/apiNotes.ts`, para o que não tem story, como `GlobalStyles`), e todo componente, de `parameters.docs.description.component`. O comando falha se faltar uma descrição, se o padrão escrito na story divergir do valor no código, ou se uma descrição tiver tag HTML ou asterisco fora de crase (viram HTML e ênfase no Markdown). Mudou uma prop ou uma story: rode o comando e envie o `API.md` no mesmo commit; o CI e o `prepublishOnly` rodam `npm run docs:api:check`.
- **Acessibilidade e movimento:** siga a seção "Contrato de componente" do `skill.md` (`className`, `data-slot`, propriedades lógicas, tokens de movimento, hover só em ponteiro fino, `prefers-reduced-motion`).

## Branches

O trabalho entra na `dev`. A `main` não recebe commit direto: ela só avança por fast-forward a partir da `dev`, e o push nela é o que publica na npm (veja "Publicação"). Por isso a `dev` precisa sempre conter a `main`, e o commit de release sai na `dev`.

Enquanto uma versão está sendo preparada na `dev`, a `main` fica parada no último commit publicado e só avança no commit de release. Se aparecer um bug urgente nesse período, o hotfix sai da `main`: crie uma branch a partir dela, faça a correção e o `chore(release)` da versão de correção e envie o resultado para a `main` em fast-forward (`git push origin <branch>:main`). Depois traga o hotfix de volta com `git merge main` na `dev`, nunca com rebase: a `dev` não é reescrita, continua contendo a `main`, e o próximo release segue em fast-forward.

A CI (`package.yml` e `browser-tests.yml`) roda em todo push na `dev` e na `main` e em todo pull request. Um push novo cancela a execução anterior da mesma branch ou do mesmo pull request, para não enfileirar duas matrizes de navegadores. Na `main` nenhuma execução é cancelada, porque a publicação espera pela CI do commit.

## Publicação

A versão do `package.json` só muda no commit de release, e é o push desse commit na `main` que dispara a publicação. Nada sobe a versão sozinho.

1. `npm run changelog` mostra o que entraria no próximo CHANGELOG, a partir dos commits desde a última tag. Só entram `feat`, `fix`, `perf`, `refactor` e mudanças que quebram (`changelog.config.json`), e os autores ficam de fora de propósito: o `changelogen` envia o e-mail dos autores a um serviço externo quando eles são listados.
2. `npm run release -- 0.2.0` confere que a versão é maior que a atual, escreve a seção no `CHANGELOG.md`, atualiza a versão no `package.json` e no `package-lock.json` e cria o commit `chore(release): v0.2.0` na `dev`. Leia o commit com `git show`, ajuste o texto do CHANGELOG se quiser (`git commit --amend`) e só então envie a `dev` (`git push origin dev`).
3. `git push origin dev:main`, em fast-forward. A `main` não recebe commit direto, e este push é o que publica na npm. O `.github/workflows/release.yml` roda em todo push na `main` e decide pelo registro do npm (`scripts/release.mjs`):
   - versão ainda não publicada: roda `package.yml` e `browser-tests.yml` nesse mesmo commit e, só se passarem, publica por trusted publishing, com proveniência, e cria a tag `v0.2.0` e a GitHub Release com a seção do CHANGELOG;
   - versão já publicada e sem tag: só cria a tag e a Release;
   - versão já publicada e com tag: não faz nada.

O workflow fica vermelho se a versão não for maior que a maior já publicada, ou se a tag existir sem a versão estar no npm. A versão `0.0.0` nunca publica. Versões com sufixo (`0.2.0-rc.1`) saem com a tag `next` do npm, e as demais com `latest`. Se uma publicação falhar, por exemplo porque o CI do commit ficou vermelho, corrija na `dev` e envie o novo commit para a `main`: como a decisão é pelo registro, o push seguinte tenta de novo sem precisar mexer na versão.

A primeira versão (`0.1.0`) foi publicada à mão com `npm publish`, porque o trusted publisher só pode ser configurado no npmjs.com depois que o pacote existe. Isso exige 2FA ativo na conta do npm (sem ele o registro responde 403), e depois de publicar o registro leva alguns minutos para mostrar a versão, que aparece como "Validating". Essa versão saiu de uma build no Windows, sem a diretiva `'use client'`, e foi corrigida na `0.1.1`: a saída da build muda entre sistemas (quebras de linha, hashes das classes do CSS Modules), então daí em diante só o CI publica. O `prepublishOnly` confere o `API.md`, constrói a biblioteca e confere os arquivos exportados, a diretiva `'use client'` no `index.js` e o tamanho antes de publicar.

O trusted publisher fica em npmjs.com > `enchase` > Settings > Trusted Publisher > GitHub Actions, com usuário `thiagopedro99`, repositório `enchase`, workflow `release.yml` e ambiente vazio. Ele aparece como "Pending validation" até a primeira publicação feita por ele (a `0.1.1`). Uma versão publicada com defeito não pode ser trocada nem reaproveitada: publique uma versão nova e marque a ruim com `npm deprecate enchase@X.Y.Z "mensagem"`.

## Pull requests

1. Faça um fork e crie uma branch (`git checkout -b feat/nova-coisa`).
2. Faça commits pequenos e descritivos.
3. Abra o pull request descrevendo o que mudou e por quê. Ele pode ser contra a `dev`, que é onde o trabalho se integra, mas isso é uma opção e não uma regra.
