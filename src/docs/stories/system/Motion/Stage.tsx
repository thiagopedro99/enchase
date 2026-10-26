import { ColorModeProvider, ToastProvider, UIProvider, useColorMode } from 'enchase'

import { buildMotionTheme } from './defaultData.ts'

import type { ReactNode } from 'react'
import type { MotionStoryArgs } from './types.ts'

type StageProps = { args: MotionStoryArgs; children: ReactNode }

export const Stage = ({ args, children }: StageProps) => {
  const { mode } = useColorMode()

  return (
    <ColorModeProvider mode={mode} theme={buildMotionTheme(args)} storage={null}>
      <UIProvider motion={{ mode: args.mode, preset: args.preset }}>
        <ToastProvider>{children}</ToastProvider>
      </UIProvider>
    </ColorModeProvider>
  )
}
