# layered-css

Build de biblioteca no Vite com três componentes reais (Button, Card e ThemeToggle, com stubs para o que eles importam), para medir nomes de classe e a variante de CSS em camada.

## Arquivos

- [`layeredCss.js`](./layeredCss.js): plugin do Vite que roda depois do build e, para cada `.css` gerado, emite uma cópia `.layer.css`.
- [`wrapInLayer.js`](./wrapInLayer.js): plugin do PostCSS que põe cada regra de primeiro nível dentro de `@layer enchase {}`, deixando `@charset`, `@import`, `@namespace` e `@layer a, b;` de fora.
- [`scopedName.js`](./scopedName.js): `generateScopedName` em forma de função: `enchase-<Componente>-<classe>-<hash com a versão>`.
- [`vite.config.js`](./vite.config.js): `SCOPE=default|pattern|fn` escolhe o nome das classes; `INLINE_LAYER=1` testa a alternativa com PostCSS no pipeline.
- [`probe.mjs`](./probe.mjs) e [`render.mjs`](./render.mjs): renderizam os componentes no Chromium e leem os estilos calculados.

## Como rodar

```bash
npm install
npx vite build
SCOPE=pattern OUT=dist-pattern npx vite build
SCOPE=fn OUT=dist-fn npx vite build
node probe.mjs
```

## Resultados

- Um build e o plugin pós-build geram `styles.css` (4,78 kB) e `styles.layer.css` (4,74 kB) com as mesmas classes. Funciona no Vite 6.4.3 e no 8.3.4.
- O PostCSS dentro do pipeline também funciona, mas exigiria dois builds.
- `generateScopedName: 'enchase-[local]'` colide: os dois `.button` (Button e ThemeToggle) viram a mesma classe, e o Button recebe as regras do ThemeToggle. A forma de função resolve.
- Hoje o `className` de quem usa não sobrescreve: `.button[data-variant=primary]` (0,2,0) vence `.my-btn` (0,1,0). Com `:where()` nos seletores de atributo, vence.
- `styles.layer.css` junto com o `GlobalStyles` atual (sem camada) quebra o Button, e um `@layer app { :root { --enchase-color-primary: ... } }` de quem usa perde para o `<style>` do tema injetado em runtime.
