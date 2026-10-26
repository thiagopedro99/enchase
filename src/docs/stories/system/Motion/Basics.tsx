import { useState } from 'react'
import { Button, Card, Checkbox, InlineLoading, Loading, Skeleton } from 'enchase'

import { Demo } from './Demo.tsx'

export const CheckboxDemo = () => {
  const [checked, setChecked] = useState(false)

  return (
    <Demo title="Checkbox" hint="The check mark enters with a fade and a short scale.">
      <Checkbox label="Receive updates" checked={checked} onChange={(event) => setChecked(event.target.checked)} />
    </Demo>
  )
}

export const ButtonDemo = () => (
  <Demo title="Button" hint="Press with a 0.97 scale in 150 ms. Frequent action: no spring.">
    <Button>Primary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Text</Button>
  </Demo>
)

export const CardDemo = () => (
  <Demo title="Card" hint="With a fine pointer, the elevated card rises 2 px on mouse hover.">
    <Card variant="elevated" padding="1rem">
      Hover here
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
    <Demo title="Loading and Skeleton" hint="Linear rotation and shimmer in a loop. With reduced motion they become an opacity pulse.">
      <InlineLoading label="Loading" />
      <Skeleton width="8rem" height="1rem" />
      <Skeleton variant="circular" width="2rem" height="2rem" />
      <Button variant="outline" onClick={show}>
        Overlay
      </Button>
      {overlay && <Loading overlay text="Loading" />}
    </Demo>
  )
}
