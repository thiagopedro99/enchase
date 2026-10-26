import { Avatar, Flex } from 'enchase'
import { defaultSize, people, portrait, sizes } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  args: {
    name: 'Ada Lovelace',
    size: defaultSize
  },
  parameters: {
    docs: {
      description: {
        component: 'A round picture for a person or an entity. It shows the image when there is one and falls back to the initials of the name while the image loads, when it fails and when there is no `src`. With a `name` it is announced as an image with that name; when the name is already written next to it, pass `aria-hidden="true"`. It is a `<span>` and accepts the attributes of the `<span>`.'
      }
    }
  },
  argTypes: {
    name: {
      description: 'Name of the person or the entity. It gives the initials of the fallback (the first letter of the first and of the last word) and the accessible name of the avatar. Without it the avatar shows a question mark that assistive technology skips.',
      control: 'text'
    },
    src: {
      description: 'Address of the image. While it loads, and if it fails, the avatar shows the initials. Change it and the avatar waits for the new image.',
      control: 'text'
    },
    size: {
      description: 'Size of the avatar: sm is 2 rem, md is 2.5 rem and lg is 3.5 rem.',
      control: 'inline-radio',
      options: sizes,
      table: { defaultValue: { summary: `'${defaultSize}'` } }
    },
    children: {
      description: 'Content shown instead of the initials when there is no image, for example an icon. It does not change the accessible name.',
      control: false
    }
  }
} satisfies Meta<typeof Avatar>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithAnImage: Story = {
  args: { src: portrait }
}

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Flex align="center" gap="1rem">
      {sizes.map((size) => (
        <Avatar key={size} {...args} size={size} />
      ))}
    </Flex>
  )
}

export const Fallbacks: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex align="center" gap="1rem">
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace" />
      <Avatar />
      <Avatar name="Acme Labs">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 20V8l8-4 8 4v12M9 20v-6h6v6" />
        </svg>
      </Avatar>
    </Flex>
  )
}

export const NextToTheName: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex as="ul" direction="column" gap="0.75rem" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
      {people.map((person, index) => (
        <li key={person} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Avatar name={person} src={index === 0 ? portrait : undefined} aria-hidden="true" />
          <span>{person}</span>
        </li>
      ))}
    </Flex>
  )
}
