import { hookRows, sizeGroups, tokenRows } from './defaultData.ts'

const CodeCell = ({ value }: { value: string }) => (
  <td>
    <code>{value}</code>
  </td>
)

export const TokenTable = () => (
  <table>
    <thead>
      <tr>
        <th>Token</th>
        <th>
          Default in <code>enchase</code>
        </th>
        <th>
          Default in <code>shadcn</code>
        </th>
        <th>Compact</th>
      </tr>
    </thead>
    <tbody>
      {tokenRows.map((row) => (
        <tr key={row.name}>
          <CodeCell value={row.name} />
          <CodeCell value={row.enchase} />
          <CodeCell value={row.shadcn} />
          <CodeCell value={row.compact} />
        </tr>
      ))}
    </tbody>
  </table>
)

export const HookTable = () => (
  <table>
    <thead>
      <tr>
        <th>Hook</th>
        <th>
          Default in <code>enchase</code>
        </th>
        <th>Compact</th>
        <th>
          Declared by <code>shadcn</code>
        </th>
        <th>
          <code>shadcn</code> in compact
        </th>
        <th>
          Followed by <code>shadcn</code>
        </th>
      </tr>
    </thead>
    <tbody>
      {hookRows.map((row) => (
        <tr key={row.name}>
          <CodeCell value={row.name} />
          <CodeCell value={row.enchase} />
          <CodeCell value={row.compact} />
          <CodeCell value={row.shadcn} />
          <CodeCell value={row.shadcnCompact} />
          <td>{row.follows ? 'Yes' : 'No'}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

export const HookNames = ({ follows }: { follows: boolean }) => (
  <>
    {hookRows
      .filter((row) => row.follows === follows)
      .map((row, index) => (
        <span key={row.name}>
          {index > 0 && ', '}
          <code>{row.name}</code>
        </span>
      ))}
  </>
)

export const SizeTables = () => (
  <>
    {sizeGroups.map((group) => (
      <table key={group.title}>
        <caption>{group.title}</caption>
        <thead>
          <tr>
            <th>Part</th>
            <th>
              <code>enchase</code>
            </th>
            <th>
              <code>shadcn</code>
            </th>
          </tr>
        </thead>
        <tbody>
          {group.rows.map((row) => (
            <tr key={row.part}>
              <td>{row.part}</td>
              <td>{row.enchase}</td>
              <td>{row.shadcn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ))}
  </>
)
