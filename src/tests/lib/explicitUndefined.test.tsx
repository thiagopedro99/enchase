import { readFileSync } from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { cleanup } from '@testing-library/react'

import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { Accordion } from '@components/common/Accordion/index.tsx'
import { Alert } from '@components/common/Alert/index.tsx'
import { Badge } from '@components/common/Badge/index.tsx'
import { Breadcrumbs } from '@components/common/Breadcrumbs/index.tsx'
import { Button } from '@components/common/Button/index.tsx'
import { ButtonLink } from '@components/common/ButtonLink/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { Container } from '@components/common/Container/index.tsx'
import { Divider } from '@components/common/Divider/index.tsx'
import { Flex } from '@components/common/Flex/index.tsx'
import { Grid } from '@components/common/Grid/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Loading } from '@components/common/Loading/index.tsx'
import { NumberInput } from '@components/common/NumberInput/index.tsx'
import { Pagination } from '@components/common/Pagination/index.tsx'
import { RadioGroup } from '@components/common/RadioGroup/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import { Skeleton } from '@components/common/Skeleton/index.tsx'
import { Switch } from '@components/common/Switch/index.tsx'
import { Table } from '@components/common/Table/index.tsx'
import { Tabs } from '@components/common/Tabs/index.tsx'
import { Textarea } from '@components/common/Textarea/index.tsx'

import type { ComponentType } from 'react'

const components = path.resolve(__dirname, '../../components/common')

const ownOptionalProps = (folder: string, name: string) => {
  const file = path.join(components, folder, 'types.ts')
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
  const names: string[] = []

  const visit = (node: ts.Node) => {
    if ((ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) && node.name.text === name) {
      const members = ts.isInterfaceDeclaration(node) ? node.members : ts.isTypeLiteralNode(node.type) ? node.type.members : []

      members.forEach((member) => {
        if (ts.isPropertySignature(member) && member.questionToken) names.push(member.name.getText(source))
      })
    }

    ts.forEachChild(node, visit)
  }

  visit(source)

  return names
}

const withoutIds = (html: string) => html.replace(/_r_[a-z0-9]+_/g, '#').replace(/«r[a-z0-9]*»/g, '#').replace(/:r[a-z0-9]*:/g, '#')

const options = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' }
]

const cases: [string, string, ComponentType<never>, Record<string, unknown>][] = [
  ['Accordion', 'AccordionProps', Accordion, { items: [{ value: 'a', title: 'A', content: 'x' }] }],
  ['Alert', 'AlertProps', Alert, { children: 'Saved' }],
  ['Badge', 'BadgeProps', Badge, { children: 'New' }],
  ['Breadcrumbs', 'BreadcrumbsProps', Breadcrumbs, { items: [{ label: 'Home', href: '/' }, { label: 'Page' }] }],
  ['Button', 'ButtonProps', Button, { children: 'Save' }],
  ['ButtonLink', 'ButtonLinkProps', ButtonLink, { href: '/docs', children: 'Docs' }],
  ['Card', 'CardProps', Card, { children: 'Card' }],
  ['Checkbox', 'CheckboxProps', Checkbox, { label: 'Agree' }],
  ['Container', 'ContainerProps', Container, { children: 'x' }],
  ['Divider', 'DividerProps', Divider, {}],
  ['Flex', 'FlexProps', Flex, { children: 'x' }],
  ['Grid', 'GridProps', Grid, { children: 'x' }],
  ['Input', 'InputProps', Input, { label: 'Email' }],
  ['Loading', 'LoadingProps', Loading, {}],
  ['NumberInput', 'NumberInputProps', NumberInput, { label: 'Quantity' }],
  ['Pagination', 'PaginationProps', Pagination, { pageCount: 5 }],
  ['RadioGroup', 'RadioGroupProps', RadioGroup, { label: 'Plan', options }],
  ['Select', 'SelectProps', Select, { label: 'Plan', options }],
  ['Skeleton', 'SkeletonProps', Skeleton, {}],
  ['Switch', 'SwitchProps', Switch, { label: 'Notifications' }],
  ['Table', 'TableProps', Table, { columns: [{ key: 'id', header: 'Id' }], rows: [{ id: 1 }] }],
  ['Tabs', 'TabsProps', Tabs, { ariaLabel: 'Sections', items: [{ value: 'a', label: 'A', content: 'x' }] }],
  ['Textarea', 'TextareaProps', Textarea, { label: 'Message' }]
]

describe('an optional prop that is passed as undefined', () => {
  it.each(cases)('renders %s exactly as if it was not passed', (folder, typeName, Component, required) => {
    const Rendered = Component as ComponentType<Record<string, unknown>>
    const optional = ownOptionalProps(folder, typeName)
    const explicit = Object.fromEntries(optional.filter((name) => !(name in required)).map((name) => [name, undefined]))

    expect(optional.length).toBeGreaterThan(0)

    const omitted = withoutIds(renderWithProviders(<Rendered {...required} />).container.innerHTML)

    cleanup()

    const passed = withoutIds(renderWithProviders(<Rendered {...required} {...explicit} />).container.innerHTML)

    expect(passed).toBe(omitted)
  })
})
