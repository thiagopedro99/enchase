import { Mine } from './mine'

export default function Page() {
  return (
    <main>
      <h1>Styled components server page</h1>
      <Mine>Salvar</Mine>
      <Mine disabled>Salvar</Mine>
    </main>
  )
}
