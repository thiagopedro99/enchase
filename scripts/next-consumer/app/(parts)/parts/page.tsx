import { Badge, ButtonLink } from 'enchase'

export default function Page() {
  return (
    <main>
      <h1>Per component css server page</h1>
      <ButtonLink href="/parts">Link with its own css</ButtonLink>
      <Badge variant="success">Badge with its own css</Badge>
    </main>
  )
}
