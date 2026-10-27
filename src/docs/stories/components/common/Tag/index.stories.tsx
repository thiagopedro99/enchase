import { useEffect, useRef, useState } from 'react'
import { Button, Flex, Tag } from 'enchase'
import { defaultSize, sizes, stack } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const RemovableDemo = () => {
  const [tags, setTags] = useState(stack)
  const root = useRef<HTMLDivElement>(null)
  const next = useRef<number | null>(null)

  useEffect(() => {
    if (next.current === null) return

    const buttons = root.current?.querySelectorAll('button') ?? []

    buttons[Math.min(next.current, buttons.length - 1)]?.focus()
    next.current = null
  }, [tags])

  const remove = (tag: string) => {
    next.current = tags.indexOf(tag)
    setTags((current) => current.filter((item) => item !== tag))
  }

  const restore = () => {
    next.current = 0
    setTags(stack)
  }

  return (
    <div ref={root}>
      {tags.length === 0 ? (
        <Button variant="outline" onClick={restore}>
          Bring the tags back
        </Button>
      ) : (
        <Flex as="ul" wrap gap="0.5rem" aria-label="Stack" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {tags.map((tag) => (
            <li key={tag}>
              <Tag onRemove={() => remove(tag)}>{tag}</Tag>
            </li>
          ))}
        </Flex>
      )}
    </div>
  )
}

const meta = {
  title: 'Components/Tag',
  component: Tag,
  args: {
    children: 'React',
    size: defaultSize
  },
  parameters: {
    docs: {
      description: {
        component: 'A label for content that belongs to the user, such as a keyword, a filter or a recipient. Unlike the `Badge`, which reports a state or a count, a tag is an outlined chip that can hold longer text and, with `onRemove`, a button to take it away. The button is named with the `removeTag` label of the `UIProvider` followed by the content of the tag, and it is the only thing in the tag that takes the focus. When a tag leaves the page, move the focus yourself. It is a `<span>` and accepts the attributes of the `<span>`.'
      }
    }
  },
  argTypes: {
    children: {
      description: 'Content of the tag: a short text. Long text is cut with an ellipsis when the tag has no room.',
      control: 'text'
    },
    size: {
      description: 'Size of the tag: sm is 1.75 rem tall and md is 2 rem.',
      control: 'inline-radio',
      options: sizes,
      table: { defaultValue: { summary: `'${defaultSize}'` } }
    },
    onRemove: {
      description: 'Called, with no arguments, when the remove button is activated. The button only exists when this is set. The tag does not remove itself: take it out of your list.',
      control: false
    }
  }
} satisfies Meta<typeof Tag>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Removable: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'A tag does not move the focus when it leaves, so the story does: it goes to the button of the tag that takes its place, to the last one when the last tag was removed, and to the button that brings the tags back when none is left.' } }
  },
  render: () => <RemovableDemo />
}

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex align="center" gap="0.75rem" wrap>
      <Tag size="sm">Small</Tag>
      <Tag size="sm" onRemove={() => undefined}>
        Small removable
      </Tag>
      <Tag size="md">Medium</Tag>
      <Tag size="md" onRemove={() => undefined}>
        Medium removable
      </Tag>
    </Flex>
  )
}

export const LongText: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ inlineSize: '12rem' }}>
      <Tag onRemove={() => undefined}>A keyword that is too long for the room it has</Tag>
    </div>
  )
}
