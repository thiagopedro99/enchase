import { Badge, Button, Textarea } from 'enchase'

export default function Page() {
  return (
    <main>
      <h1>Styled server page</h1>
      <Button>Rendered with the shadcn style</Button>
      <Badge variant="success">Styled badge</Badge>
      <Textarea label="Styled textarea" />
    </main>
  )
}
