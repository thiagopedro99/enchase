import { useState } from 'react'
import { Button, Card, Checkbox, InlineLoading, Loading, Skeleton } from 'enchase'

import { Demo } from './Demo.tsx'

export const CheckboxDemo = () => {
  const [checked, setChecked] = useState(false)

  return (
    <Demo title="Checkbox" hint="A marca entra com fade e uma escala curta.">
      <Checkbox label="Receber novidades" checked={checked} onChange={(event) => setChecked(event.target.checked)} />
    </Demo>
  )
}

export const ButtonDemo = () => (
  <Demo title="Button" hint="Press com escala 0,97 em 150 ms. Ação frequente: sem mola.">
    <Button>Primário</Button>
    <Button variant="outline">Contorno</Button>
    <Button variant="ghost">Texto</Button>
  </Demo>
)

export const CardDemo = () => (
  <Demo title="Card" hint="Em ponteiro fino, o card elevado sobe 2 px ao passar o mouse.">
    <Card variant="elevated" padding="1rem">
      Passe o mouse aqui
    </Card>
  </Demo>
)

export const LoadingDemo = () => {
  const [overlay, setOverlay] = useState(false)

  const show = () => {
    setOverlay(true)
    window.setTimeout(() => setOverlay(false), 1800)
  }

  return (
    <Demo title="Loading e Skeleton" hint="Rotação e brilho lineares em loop. Em reduced motion viram um pulso de opacidade.">
      <InlineLoading label="Carregando" />
      <Skeleton width="8rem" height="1rem" />
      <Skeleton variant="circular" width="2rem" height="2rem" />
      <Button variant="outline" onClick={show}>
        Overlay
      </Button>
      {overlay && <Loading overlay text="Carregando" />}
    </Demo>
  )
}
