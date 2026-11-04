import { Button } from '../../../enchase/components/common/Button'
import { Pagination } from '../../../enchase/components/common/Pagination'
import { Tabs } from '../../../enchase/components/common/Tabs'

export default function Page() {
  return (
    <main>
      <h1>Ejected server page</h1>
      <Button>Ejected button</Button>
      <Tabs ariaLabel="Ejected" items={[{ value: 'a', label: 'One', content: 'First' }]} />
      <Pagination pageCount={3} />
    </main>
  )
}
