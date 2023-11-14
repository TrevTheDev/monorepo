/* eslint-disable no-restricted-syntax */
import { expect, it } from 'vitest'
import { v } from '../src/dilav2'
import { basicSchemaTests } from './shared'

it('passing validations', () => {
  const objSchema01 = v.object({
    propertySchemas: {
      test: v.string,
      number: v.number,
    },
    unmatchedPropertiesSchema: v.number,
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
it('object only', () => {
  basicSchemaTests({
    parser: v.object(),
    passValues: [
      { passValue: { test: 'test', number: 1 } },
      { passValue: { test: 'test', number: 1, unmatched: 2 } },
    ],
    failValues: [{ failValue: 'string' }, { failValue: 1 }],
    type: 'object',
    schemaType: 'object',
  })
})

it('object only', () => {
  const objSchema01 = v.object({
    unmatchedPropertiesSchema: v.number,
  })
  basicSchemaTests({
    parser: objSchema01,
    passValues: [
      { passValue: { test: 1, number: 1 } },
      { passValue: { test: 1, number: 1, unmatched: 2 } },
    ],
    failValues: [
      { failValue: 'string' },
      { failValue: 1 },
      { failValue: { test: '1', number: 1 } },
    ],
    type: '{ [P: PropertyKey]: number }',
    schemaType: 'object index signature',
  })
})

it('properties only', () => {
  const objSchema01 = v.object({
    propertySchemas: {
      test: v.string,
      number: v.number,
    },
  })
  basicSchemaTests({
    parser: objSchema01,
    passValues: [
      { passValue: { test: 'a', number: 1 } },
      { passValue: { test: 'a', number: 1, unmatched: 2 } },
    ],
    failValues: [
      { failValue: 'string' },
      { failValue: 1 },
      { failValue: { test: '1', number: '1' } },
      { failValue: { test: '1' } },
    ],
    type: '{ test: string, number: number }',
    schemaType: 'object known properties',
  })
})

it('extends', () => {
  const objSchema01 = v.object({
    propertySchemas: {
      test: v.string,
      number: v.number,
    },
  })

  const objSchema02 = objSchema01.extends({
    third: v.number,
  })
  basicSchemaTests({
    parser: objSchema02,
    passValues: [
      { passValue: { test: 'test', number: 1, third: 2 } },
      // @ts-expect-error extends only parses third
      { passValue: { test: 1, number: '1', third: 2 } },
    ],
    failValue: { test: 'test', number: 1 },
    type: '{ test: string, number: number } & { third: number }',
    schemaType: 'object known properties',
  })
  expect(objSchema02.validatedProperties).toEqual(['test', 'number', 'third'])
})

it('merge', () => {
  const objSchema01 = v
    .object({
      propertySchemas: {
        test: v.string,
        number: v.number,
      },
    })
    .extends({
      third: v.number,
    })
    .merge({
      third: v.string,
      fourth: v.number,
    })
  basicSchemaTests({
    parser: objSchema01,
    passValues: [
      { passValue: { test: 'test', number: 1, third: '2', fourth: 1 } },
      // @ts-expect-error extends only parses third
      { passValue: { test: 1, number: '1', third: '2', fourth: 1 } },
    ],
    failValues: [
      { failValue: { test: 'test', number: 1, third: 1, fourth: 1 } },
      { failValue: { test: 'test', number: 1, third: '1', fourth: '1' } },
    ],
    type: '{ test: string, number: number } & { third: string, fourth: number }',
    schemaType: 'object known properties',
  })
})
it('pick', () => {
  const objSchema01 = v
    .object({
      propertySchemas: {
        test: v.string,
        number: v.number,
      },
    })
    .extends({
      third: v.string,
      fourth: v.number,
    })
    .pick('third')
  basicSchemaTests({
    parser: objSchema01,
    passValues: [
      { passValue: { test: 'test', number: 1, third: '2' } },
      // @ts-expect-error extends only parses third
      { passValue: { test: 1, number: '1', third: '2', fourth: 1 } },
    ],
    failValues: [
      { failValue: { test: 'test', number: 1, third: 1, fourth: 1 } },
      { failValue: { test: 'test', number: 1, third: 2, fourth: '1' } },
    ],
    type: '{ test: string, number: number } & { third: string }',
    schemaType: 'object known properties',
  })
})
