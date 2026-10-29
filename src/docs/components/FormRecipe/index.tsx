import { Alert, Button, Checkbox, Combobox, DatePicker, Flex, Input, RadioGroup, Select } from 'enchase'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useId } from 'react'
import { z } from 'zod'

const ticketOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'student', label: 'Student' },
  { value: 'team', label: 'Team' }
]

const countryOptions = [
  { value: 'br', label: 'Brazil' },
  { value: 'pt', label: 'Portugal' },
  { value: 'ar', label: 'Argentina' }
]

const attendanceOptions = [
  { value: 'in-person', label: 'In person' },
  { value: 'online', label: 'Online' }
]

const schema = z.object({
  email: z.email('Enter a valid email'),
  ticket: z.string().min(1, 'Choose a ticket'),
  country: z.string().nullable().pipe(z.string('Choose a country')),
  date: z.string().nullable().pipe(z.iso.date('Pick a date')),
  attendance: z.string().min(1, 'Choose how you will attend'),
  terms: z.boolean().pipe(z.literal(true, 'Accept the terms to continue'))
})

type FormValues = z.input<typeof schema>

export type Registration = z.output<typeof schema>

const defaultValues: FormValues = {
  email: '',
  ticket: '',
  country: null,
  date: null,
  attendance: '',
  terms: false
}

export const FormRecipe = ({ onSubmit }: { onSubmit: (values: Registration) => void }) => {
  const termsErrorId = useId()

  const { register, control, handleSubmit, formState } = useForm<FormValues, unknown, Registration>({
    resolver: zodResolver(schema),
    defaultValues
  })
  const { errors } = formState

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap="1.25rem">
        <Input
          label="Email"
          type="email"
          helperText="We send the confirmation here"
          error={errors.email?.message}
          {...register('email')}
        />

        <Select
          label="Ticket"
          placeholder="Choose a ticket"
          options={ticketOptions}
          error={errors.ticket?.message}
          {...register('ticket')}
        />

        <Controller
          name="country"
          control={control}
          render={({ field, fieldState }) => (
            <Combobox
              label="Country"
              helperText="Type to filter the list"
              options={countryOptions}
              value={field.value}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="date"
          control={control}
          render={({ field, fieldState }) => (
            <DatePicker
              label="Session date"
              helperText="Type it or pick it in the calendar"
              value={field.value}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="attendance"
          control={control}
          render={({ field, fieldState }) => (
            <RadioGroup
              label="Attendance"
              orientation="horizontal"
              options={attendanceOptions}
              value={field.value}
              onValueChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Checkbox
          label="I accept the terms"
          aria-invalid={errors.terms ? true : undefined}
          aria-describedby={errors.terms ? termsErrorId : undefined}
          {...register('terms')}
        />

        {errors.terms && (
          <Alert id={termsErrorId} variant="error">
            {errors.terms.message}
          </Alert>
        )}

        <Button type="submit">Register</Button>
      </Flex>
    </form>
  )
}
