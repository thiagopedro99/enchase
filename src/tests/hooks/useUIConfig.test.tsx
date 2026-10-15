import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'

import { ptBR } from '@locales/ptBR.ts'
import UIProvider from '@components/uiProvider/index.tsx'
import { useUIConfig } from '@hooks/useUIConfig.ts'

import type { UIProviderProps } from '@components/uiProvider/types.ts'
import type { ReactNode } from 'react'

const createWrapper =
  (props: Omit<UIProviderProps, 'children'> = {}) =>
  ({ children }: { children: ReactNode }) => <UIProvider {...props}>{children}</UIProvider>

describe('useUIConfig', () => {
  it('merges partial labels over the defaults', () => {
    const { result } = renderHook(() => useUIConfig(), { wrapper: createWrapper({ labels: { closeModal: 'Close' } }) })

    expect(result.current.labels.closeModal).toBe('Close')
    expect(result.current.labels.closeToast).toBe('Close notification')
  })

  it('uses the English locale by default and the given locale over it', () => {
    const { result: fallback } = renderHook(() => useUIConfig(), { wrapper: createWrapper() })
    const { result: translated } = renderHook(() => useUIConfig(), { wrapper: createWrapper({ locale: ptBR, labels: { closeModal: 'Fechar' } }) })

    expect(fallback.current.dir).toBe('ltr')
    expect(translated.current.labels.closeToast).toBe('Fechar notificação')
    expect(translated.current.labels.closeModal).toBe('Fechar')
  })
})
