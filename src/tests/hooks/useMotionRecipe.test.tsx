import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import UIProvider from '@components/uiProvider/index.tsx'
import { useUIConfig } from '@hooks/useUIConfig.ts'

import type { UIProviderProps } from '@components/uiProvider/types.ts'
import type { ReactNode } from 'react'

const reducedState = vi.hoisted(() => ({ value: false }))

vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => reducedState.value
}))

const createWrapper =
  (props: Omit<UIProviderProps, 'children'> = {}) =>
  ({ children }: { children: ReactNode }) => <UIProvider {...props}>{children}</UIProvider>

describe('useMotionRecipe', () => {
  beforeEach(() => {
    reducedState.value = false
  })

  it('returns the full recipe when the user has no motion preference', () => {
    const { result } = renderHook(() => useMotionRecipe('pop'), { wrapper: createWrapper() })

    expect(result.current.initial).toMatchObject({ scale: 0.96 })
  })

  it('degrades to an opacity fade when the user prefers reduced motion', () => {
    reducedState.value = true
    const { result } = renderHook(() => useMotionRecipe('pop'), { wrapper: createWrapper() })

    expect(result.current.initial).toEqual({ opacity: 0 })
    expect(result.current.animate).toEqual({ opacity: 1 })
  })

  it('removes press feedback under reduced motion', () => {
    reducedState.value = true
    const { result } = renderHook(() => useMotionRecipe('press'), { wrapper: createWrapper() })

    expect(result.current).toEqual({})
  })

  it('honours the provider preset and per-recipe tuning', () => {
    const { result } = renderHook(() => useMotionRecipe('slide', undefined, 'right'), {
      wrapper: createWrapper({ motion: { preset: 'subtle', recipes: { slide: { distance: 100 } } } })
    })

    expect(result.current.initial).toMatchObject({ x: 100 })
  })

  it('lets a provider disable motion entirely', () => {
    const { result } = renderHook(() => useMotionRecipe('pop'), { wrapper: createWrapper({ motion: { mode: 'never' } }) })

    expect(result.current.initial).toBe(false)
    expect(result.current.transition).toEqual({ duration: 0 })
  })

  it('lets a component opt out with animation={false}', () => {
    const { result } = renderHook(() => useMotionRecipe('pop', false), { wrapper: createWrapper() })

    expect(result.current.initial).toBe(false)
  })

  it('lets a component swap the recipe and side', () => {
    const { result } = renderHook(() => useMotionRecipe('pop', { recipe: 'slide', from: 'left' }), { wrapper: createWrapper() })

    expect(result.current.initial).toMatchObject({ x: -32 })
  })

  it('works without any provider using defaults', () => {
    const { result } = renderHook(() => useMotionRecipe('fade'))

    expect(result.current.initial).toEqual({ opacity: 0 })
  })
})

describe('useUIConfig', () => {
  it('merges partial labels over the defaults', () => {
    const { result } = renderHook(() => useUIConfig(), { wrapper: createWrapper({ labels: { closeModal: 'Close' } }) })

    expect(result.current.labels.closeModal).toBe('Close')
    expect(result.current.labels.closeToast).toBe('Fechar notificação')
  })
})
