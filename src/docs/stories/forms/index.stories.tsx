import { Alert, Card, Container, Flex } from 'enchase'
import { useState } from 'react'

import { FormRecipe } from '@docs/components/FormRecipe/index.tsx'

import type { Registration } from '@docs/components/FormRecipe/index.tsx'
import type { Meta, StoryObj } from '@storybook/react-vite'

const RecipeDemo = () => {
  const [submitted, setSubmitted] = useState<Registration | null>(null)

  return (
    <Container maxWidth="sm" center={false} padding={false}>
      <Card variant="outlined" padding="1.5rem">
        <Flex direction="column" gap="1.25rem">
          <FormRecipe onSubmit={setSubmitted} />

          {submitted && (
            <Alert variant="success" title="Submitted values">
              <pre>{JSON.stringify(submitted, null, 2)}</pre>
            </Alert>
          )}
        </Flex>
      </Card>
    </Container>
  )
}

const meta = {
  title: 'Pages/Forms recipe',
  tags: ['!dev', '!autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Recipe: Story = {
  render: () => <RecipeDemo />
}
