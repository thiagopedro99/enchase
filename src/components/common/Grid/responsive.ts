export const gridResponsiveBaseCss = "[data-slot='grid'][data-responsive] {\n  --enchase-grid-n: var(--enchase-grid-n-xs, 1);\n}"

export const gridResponsiveCss = (name: string, min: string) => `@media (min-width: ${min}) {\n  [data-slot='grid'][data-responsive] {\n    --enchase-grid-n: var(--enchase-grid-n-${name}, 1);\n  }\n}`
