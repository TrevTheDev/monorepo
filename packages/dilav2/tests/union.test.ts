import { it } from 'vitest'
import { v } from '../src/dilav2'
import { basicSchemaTests, testValidations } from './shared'

const literalUnion = v.literalUnion(['A', 'B', 1], {
  noMatchFoundInLiteralUnionError: () => 'L UNION',
})

it('literal union', () => {
  basicSchemaTests({
    parser: literalUnion,
    passValues: [{ passValue: 'A' }, { passValue: 1 }],
    failValues: [{ failValue: 'C', failError: 'L UNION' }],
    type: `"A"|"B"|1`,
    schemaType: 'literal union',
  })
})

it('literal union validations', () => {
  const { custom } = literalUnion.validators
  testValidations(literalUnion.validations, [
    {
      validations: [custom((value) => (value === 'A' ? undefined : 'not A'))],
      passValues: [{ passValue: 'A' }],
      failValues: [{ failValue: 'B', failError: 'not A' }],
    },
  ])
})

const union = v.union([v.string, v.number], {
  noMatchFoundInUnionError: () => 'UNION',
})

it('union', () => {
  const x = union(undefined)
  console.log(x)
  basicSchemaTests({
    parser: union,
    passValues: [{ passValue: 'A' }, { passValue: 1 }],
    failValues: [{ failValue: undefined, failError: 'UNION' }],
    type: `string|number`,
    schemaType: 'union',
  })
})

it('union validations', () => {
  const { custom } = union.validators
  testValidations(union.validations, [
    {
      validations: [custom((value) => (value === 'A' ? undefined : 'not A'))],
      passValues: [{ passValue: 'A' }],
      failValues: [{ failValue: 'B', failError: 'not A' }],
    },
  ])
})

it('literal union validations', () => {
  const { custom } = literalUnion.validators
  testValidations(literalUnion.validations, [
    {
      validations: [custom((value) => (value === 'A' ? undefined : 'not A'))],
      passValues: [{ passValue: 'A' }],
      failValues: [{ failValue: 'B', failError: 'not A' }],
    },
  ])
})

it('optional', () => {
  const x = v.optional(v.string)
  debugger
  basicSchemaTests({
    parser: v.optional(v.string),
    passValues: [{ passValue: 'A' }, { passValue: undefined }],
    failValues: [{ failValue: 1, failError: '1 is not a string' }],
    type: `string|undefined`,
    schemaType: 'optional',
  })
  basicSchemaTests({
    parser: v.optional(v.string, { optionalParseError: () => 'OPTIONAL' }),
    passValues: [{ passValue: 'A' }],
    failValues: [{ failValue: 1, failError: 'OPTIONAL' }],
    type: `string|undefined`,
    schemaType: 'optional',
  })
})

it('optional validations', () => {
  const optional = v.optional(v.string, { optionalParseError: () => 'OPTIONAL' })
  const { custom } = optional.validators
  testValidations(optional.validations, [
    {
      validations: [custom((value) => (value === 'A' ? undefined : 'not A'))],
      passValues: [{ passValue: 'A' }],
      failValues: [{ failValue: 'B', failError: 'not A' }],
    },
  ])
})
