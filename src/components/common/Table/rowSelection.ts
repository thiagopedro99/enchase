import type { TableRowKey } from './types.ts'

export const rowKeysOf = <Row>(rows: Row[], getRowKey: ((row: Row, index: number) => TableRowKey) | undefined) => rows.map((row, index) => (getRowKey ? getRowKey(row, index) : index))

export const rowSelection = (rowKeys: TableRowKey[], selectedKeys: TableRowKey[]) => {
  const selected = new Set(selectedKeys)
  const onPage = new Set(rowKeys)
  const count = rowKeys.filter((key) => selected.has(key)).length
  const all = rowKeys.length > 0 && count === rowKeys.length

  return {
    isSelected: (key: TableRowKey) => selected.has(key),
    all,
    some: count > 0 && !all,
    withRowToggled: (key: TableRowKey) => (selected.has(key) ? selectedKeys.filter((selectedKey) => selectedKey !== key) : [...selectedKeys, key]),
    withAllToggled: () => (all ? selectedKeys.filter((key) => !onPage.has(key)) : [...new Set([...selectedKeys, ...rowKeys])])
  }
}
