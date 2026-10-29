import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { FormRecipe } from '@docs/components/FormRecipe/index.tsx'
import { axe } from '@tests/axe.ts'
import { en } from '@locales/en.ts'

const root = path.resolve(__dirname, '../../../../..')

const email = () => screen.getByRole('textbox', { name: 'Email' })

const ticket = () => screen.getByRole('combobox', { name: 'Ticket' })

const country = () => screen.getByRole('combobox', { name: 'Country' })

const date = () => screen.getByRole('textbox', { name: 'Session date' })

const attendance = () => screen.getByRole('radiogroup', { name: 'Attendance' })

const terms = () => screen.getByRole('checkbox', { name: 'I accept the terms' })

const submit = () => screen.getByRole('button', { name: 'Register' })

const fields = [email, ticket, country, date, attendance, terms]

const messages = ['Enter a valid email', 'Choose a ticket', 'Choose a country', 'Pick a date', 'Choose how you will attend', 'Accept the terms to continue']

const helpers = ['We send the confirmation here', 'Type to filter the list', 'Type it or pick it in the calendar']

const alerts = () => screen.queryAllByRole('alert').map((alert) => alert.textContent)

const renderRecipe = (onSubmit = vi.fn()) => ({ onSubmit, user: userEvent.setup(), ...renderWithProviders(<FormRecipe onSubmit={onSubmit} />, { locale: en }) })

const fillInEverything = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(email(), 'ada@example.com')
  await user.selectOptions(ticket(), 'student')
  await user.click(country())
  await user.click(screen.getByRole('option', { name: 'Brazil' }))
  await user.type(date(), '11/03/2026')
  await user.tab()
  await user.click(within(attendance()).getByRole('radio', { name: 'Online' }))
  await user.click(terms())
}

describe('FormRecipe', () => {
  it('starts without errors, with the helper text of each field and the placeholders of the empty choices', () => {
    renderRecipe()

    helpers.forEach((helper) => expect(screen.getByText(helper)).toBeInTheDocument())
    fields.forEach((field) => expect(field()).not.toHaveAttribute('aria-invalid'))
    expect(alerts()).toEqual([])
    expect(ticket()).toHaveValue('')
    expect(country()).toHaveValue('')
    expect(date()).toHaveValue('')
    expect(terms()).not.toBeChecked()
  })

  it('submits the empty form without calling the handler: every field shows its message as an alert and is marked invalid', async () => {
    const { user, onSubmit } = renderRecipe()

    await user.click(submit())

    await waitFor(() => expect(alerts()).toEqual(messages))
    fields.forEach((field) => expect(field()).toHaveAttribute('aria-invalid', 'true'))
    expect(email()).toHaveFocus()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('describes each invalid field with its own message', async () => {
    const { user } = renderRecipe()

    await user.click(submit())
    await waitFor(() => expect(alerts()).toEqual(messages))

    fields.forEach((field, index) => expect(field()).toHaveAccessibleDescription(messages[index]))
  })

  it('swaps the helper text for the message and brings it back when the field becomes valid', async () => {
    const { user } = renderRecipe()

    await user.click(submit())
    await waitFor(() => expect(alerts()).toEqual(messages))
    helpers.forEach((helper) => expect(screen.queryByText(helper)).not.toBeInTheDocument())

    await user.type(email(), 'ada@example.com')

    await waitFor(() => expect(alerts()).toEqual(messages.slice(1)))
    expect(email()).not.toHaveAttribute('aria-invalid')
    expect(screen.getByText(helpers[0])).toBeInTheDocument()

    await user.click(country())
    await user.click(screen.getByRole('option', { name: 'Portugal' }))

    await waitFor(() => expect(alerts()).not.toContain(messages[2]))
    expect(country()).toHaveValue('Portugal')
    expect(country()).not.toHaveAttribute('aria-invalid')
    expect(screen.getByText(helpers[1])).toBeInTheDocument()
  })

  it('clears the message of each choice and of the terms as soon as they get a valid answer', async () => {
    const { user } = renderRecipe()

    await user.click(submit())
    await waitFor(() => expect(alerts()).toEqual(messages))

    await user.selectOptions(ticket(), 'team')
    await waitFor(() => expect(alerts()).not.toContain(messages[1]))
    expect(ticket()).not.toHaveAttribute('aria-invalid')

    await user.type(date(), '11/03/2026')
    await user.tab()
    await waitFor(() => expect(alerts()).not.toContain(messages[3]))
    expect(date()).not.toHaveAttribute('aria-invalid')
    expect(screen.getByText(helpers[2])).toBeInTheDocument()

    await user.click(within(attendance()).getByRole('radio', { name: 'In person' }))
    await waitFor(() => expect(alerts()).not.toContain(messages[4]))
    expect(attendance()).not.toHaveAttribute('aria-invalid')

    await user.click(terms())
    await waitFor(() => expect(alerts()).not.toContain(messages[5]))
    expect(terms()).not.toHaveAttribute('aria-invalid')
    expect(terms()).not.toHaveAccessibleDescription()
  })

  it('puts the focus on the terms when they are the only invalid field, on the same input that was there before the message', async () => {
    const { user } = renderRecipe()
    const before = terms()

    await fillInEverything(user)
    await user.click(terms())
    await user.click(submit())

    await waitFor(() => expect(alerts()).toEqual([messages[5]]))
    await waitFor(() => expect(terms()).toHaveFocus())
    expect(terms()).toBe(before)
  })

  it('keeps the same input of the terms, checked and focused, from the first message to the moment it goes away', async () => {
    const { user } = renderRecipe()
    const before = terms()

    await user.click(submit())
    await waitFor(() => expect(alerts()).toEqual(messages))
    expect(terms()).toBe(before)

    await user.click(before)
    await waitFor(() => expect(alerts()).not.toContain(messages[5]))

    expect(terms()).toBe(before)
    expect(before).toBeChecked()
    expect(before).toHaveFocus()
  })

  it('hands the handler the typed values, with the date as the ISO text and not as a Date', async () => {
    const { user, onSubmit } = renderRecipe()

    await fillInEverything(user)
    await user.click(submit())

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const values = onSubmit.mock.calls[0][0]

    expect(values).toEqual({ email: 'ada@example.com', ticket: 'student', country: 'br', date: '2026-11-03', attendance: 'online', terms: true })
    expect(typeof values.date).toBe('string')
    expect(alerts()).toEqual([])
  })

  it('rejects an email that is not valid and a date that was cleared, even after the other fields are right', async () => {
    const { user, onSubmit } = renderRecipe()

    await fillInEverything(user)
    await user.clear(email())
    await user.type(email(), 'ada@example')
    await user.clear(date())
    await user.tab()
    await user.click(submit())

    await waitFor(() => expect(alerts()).toEqual([messages[0], messages[3]]))
    expect(email()).toHaveAttribute('aria-invalid', 'true')
    expect(date()).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('has no axe violations before and after the submit with errors', async () => {
    const { user, container } = renderRecipe()

    expect(await axe(container)).toHaveNoViolations()

    await user.click(submit())
    await waitFor(() => expect(alerts()).toEqual(messages))

    expect(await axe(container)).toHaveNoViolations()
  }, 20000)
})

describe('the copies of the recipe', () => {
  const read = (file: string) => readFileSync(path.join(root, file), 'utf8')

  it('shows the same code in the tsx block of the README.pt-BR.md', () => {
    const section = read('README.pt-BR.md').split(/^## /m).find((part) => part.startsWith('Formulários com react-hook-form e Zod'))

    const code = /```tsx\n([\s\S]*?)```/.exec(section ?? '')?.[1]

    expect(code, 'the section "Formulários com react-hook-form e Zod" of README.pt-BR.md needs a tsx block').toBeDefined()
    expect(code, 'the tsx block of that section must be src/docs/components/FormRecipe/index.tsx as it is: copy the file into the block').toBe(read('src/docs/components/FormRecipe/index.tsx'))
  })

  it('reads the Storybook page from the file itself, so the code on the page cannot differ', () => {
    const page = read('src/docs/pages/forms.mdx')

    expect(page).toMatch(/^import \w+ from '\.\.\/components\/FormRecipe\/index\.tsx\?raw'$/m)
    expect(page).toMatch(/<Source code=\{\w+\} language="tsx" \/>/)
  })
})
