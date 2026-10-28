import { describe, expect, it } from 'vitest'

import { rowKeysOf, rowSelection } from '@components/common/Table/rowSelection.ts'

describe('rowKeysOf', () => {
  it('uses getRowKey for every row, with the row and its index', () => {
    const rows = [{ id: 'a' }, { id: 'b' }]

    expect(rowKeysOf(rows, (row, index) => `${row.id}${index}`)).toEqual(['a0', 'b1'])
  })

  it('uses the index of the row when there is no getRowKey', () => {
    expect(rowKeysOf([{}, {}, {}], undefined)).toEqual([0, 1, 2])
  })

  it('gives no keys for no rows', () => {
    expect(rowKeysOf([], undefined)).toEqual([])
  })
})

describe('rowSelection', () => {
  it('says which keys are selected', () => {
    const selection = rowSelection(['a', 'b', 'c'], ['b'])

    expect(selection.isSelected('b')).toBe(true)
    expect(selection.isSelected('a')).toBe(false)
  })

  it('is neither all nor some when no row is selected', () => {
    expect(rowSelection(['a', 'b'], [])).toMatchObject({ all: false, some: false })
  })

  it('is some when part of the rows is selected', () => {
    expect(rowSelection(['a', 'b'], ['a'])).toMatchObject({ all: false, some: true })
  })

  it('is all and not some when every row is selected', () => {
    expect(rowSelection(['a', 'b'], ['b', 'a'])).toMatchObject({ all: true, some: false })
  })

  it('is neither all nor some when there are no rows, even with keys selected', () => {
    expect(rowSelection([], ['a'])).toMatchObject({ all: false, some: false })
  })

  it('does not count the keys that are not among the rows', () => {
    expect(rowSelection(['a', 'b'], ['x', 'y', 'z'])).toMatchObject({ all: false, some: false })
    expect(rowSelection(['a', 'b'], ['x', 'a'])).toMatchObject({ all: false, some: true })
  })

  it('counts a number and its text as different keys', () => {
    expect(rowSelection([1, 2], ['1'])).toMatchObject({ all: false, some: false })
  })

  it('adds a key at the end and removes a key that is there, leaving the others in order', () => {
    const selection = rowSelection(['a', 'b', 'c'], ['c', 'a'])

    expect(selection.withRowToggled('b')).toEqual(['c', 'a', 'b'])
    expect(selection.withRowToggled('c')).toEqual(['a'])
  })

  it('does not change the list it was given', () => {
    const selected = ['a']

    rowSelection(['a', 'b'], selected).withRowToggled('b')
    rowSelection(['a', 'b'], selected).withAllToggled()

    expect(selected).toEqual(['a'])
  })

  it('selects every row when not all are selected, keeping what was selected first and the order of the rows after', () => {
    expect(rowSelection(['a', 'b', 'c'], []).withAllToggled()).toEqual(['a', 'b', 'c'])
    expect(rowSelection(['a', 'b', 'c'], ['c', 'x']).withAllToggled()).toEqual(['c', 'x', 'a', 'b'])
  })

  it('does not repeat a key when two rows share it', () => {
    expect(rowSelection(['a', 'a', 'b'], []).withAllToggled()).toEqual(['a', 'b'])
  })

  it('clears the rows and keeps the keys of other pages when all are selected', () => {
    expect(rowSelection(['a', 'b'], ['x', 'a', 'b']).withAllToggled()).toEqual(['x'])
  })

  it('selects every row of an empty selection of a table with no rows as nothing', () => {
    expect(rowSelection([], []).withAllToggled()).toEqual([])
  })
})
