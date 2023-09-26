/* eslint-disable no-restricted-syntax */
import { expect, it } from 'vitest'
import { v } from '../src/dilav2'
import { basicSchemaTests } from './shared'

it('passing validations', () => {
  const objSchema01 = v.object({
    propertySchemas: {
      test: v.string(),
      number: v.number(),
    },
    unmatchedPropertiesSchema: v.number(),
  })
  expect(objSchema01.schemaType).toEqual('object')
  expect(objSchema01.type).toEqual(
    '{ test: string, number: number } & { [P: PropertyKey]: number }',
  )
  basicSchemaTests({
    parser: objSchema01,
    passValues: [
      { passValue: { test: 'test', number: 1 } },
      { passValue: { test: 'test', number: 1, unmatched: 2 } },
    ],
    failValues: [
      { failValue: { test: 'test', number: '1' } },
      { failValue: { test: 'test', number: '1', unmatched: '2' } },
    ],
    type: '{ test: string, number: number } & { [P: PropertyKey]: number }',
    schemaType: 'object',
  })
  const { custom } = objSchema01.validators
  const customValidationFn: ReturnType<typeof custom> = (obj) =>
    obj.test === 'test' ? undefined : 'failed'
  const objSchema02 = objSchema01.validations([custom(customValidationFn)])
  expect(objSchema02.schemaType).toEqual('object')
  expect(objSchema02.type).toEqual(
    '{ test: string, number: number } & { [P: PropertyKey]: number }',
  )
  basicSchemaTests({
    parser: objSchema02,
    passValue: { test: 'test', number: 1 },
    failValue: { test: 'test2', number: 1 },
    type: '{ test: string, number: number } & { [P: PropertyKey]: number }',
    schemaType: 'object',
  })
  const objSchema03 = objSchema01.validations(objSchema01.builder.custom(customValidationFn))
  basicSchemaTests({
    parser: objSchema03,
    passValue: { test: 'test', number: 1 },
    failValue: { test: 'test2', number: 1 },
    type: '{ test: string, number: number } & { [P: PropertyKey]: number }',
    schemaType: 'object',
  })
})

it.skip('extends', () => {
  const objSchema01 = v.object({
    propertySchemas: {
      test: v.string(),
      number: v.number(),
    },
  })

  const objSchema02 = objSchema01.extends({
    third: v.number(),
  })
  expect(objSchema02.schemaType).toEqual('object properties')
  expect(objSchema02.type).toEqual('{ test: string, number: number } & { third: number }')
  basicSchemaTests({
    parser: objSchema02,
    passValue: { test: 'test', number: 1, third: 2 },
    failValue: { test: 'test', number: 1 },
    type: '{ test: string, number: number } & { third: number }',
    schemaType: 'object',
  })
})
