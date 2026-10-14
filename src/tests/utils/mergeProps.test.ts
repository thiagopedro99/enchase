import { describe, expect, it, vi } from 'vitest'

import { mergeProps, slot } from '@utils/mergeProps.ts'

import type { SyntheticEvent } from 'react'

const event = (defaultPrevented = false) => ({ defaultPrevented }) as SyntheticEvent

describe('slot', () => {
  it('names a component and a part', () => {
    expect(slot('modal')).toEqual({ 'data-slot': 'modal' })
    expect(slot('modal', 'panel')).toEqual({ 'data-slot': 'modal-panel' })
  })
})

describe('mergeProps', () => {
  it('returns the own props when there is nothing from the user', () => {
    const own = { className: 'a' }

    expect(mergeProps(own, undefined)).toBe(own)
  })

  it('puts the user class after the own class so the user wins the cascade', () => {
    expect(mergeProps({ className: 'own' }, { className: 'mine' }).className).toBe('own mine')
    expect(mergeProps({ className: 'own' }, {}).className).toBe('own')
    expect(mergeProps({}, {}).className).toBeUndefined()
  })

  it('merges styles with the user value winning on conflicts', () => {
    expect(mergeProps({ style: { color: 'red', width: 1 } }, { style: { color: 'blue' } }).style).toEqual({ color: 'blue', width: 1 })
    expect(mergeProps({}, {}).style).toBeUndefined()
  })

  it('keeps the data-slot of the component even when the user passes one', () => {
    expect(mergeProps({ 'data-slot': 'button' }, { 'data-slot': 'other' })['data-slot']).toBe('button')
    expect(mergeProps({}, { 'data-slot': 'other' })['data-slot']).toBe('other')
  })

  it('lets the user override plain props', () => {
    expect(mergeProps({ type: 'button', id: 'a' }, { id: 'b' })).toMatchObject({ type: 'button', id: 'b' })
  })

  it('calls both handlers, the user first, and skips the own one after preventDefault', () => {
    const order: string[] = []
    const own = vi.fn<(event: SyntheticEvent) => unknown>(() => order.push('own'))
    const user = vi.fn<(event: SyntheticEvent) => unknown>(() => order.push('user'))
    const { onClick } = mergeProps({ onClick: own }, { onClick: user })

    onClick(event())
    expect(order).toEqual(['user', 'own'])

    onClick(event(true))
    expect(own).toHaveBeenCalledTimes(1)
    expect(user).toHaveBeenCalledTimes(2)
  })

  it('keeps the own handler when the user has none for that event', () => {
    const own = vi.fn()

    expect(mergeProps({ onClick: own }, { onKeyDown: vi.fn() }).onClick).toBe(own)
  })
})
