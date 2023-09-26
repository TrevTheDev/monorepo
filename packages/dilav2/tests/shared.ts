/* eslint-disable no-nested-ternary */
/* eslint-disable no-restricted-syntax */
import { expect } from 'vitest'
import { v } from '../src/dilav2'
import { ValidationFn } from '../src/validations/validations'
import { Schema, SchemaTypes, CreateSchema, BaseSchemaPrototype } from '../src/schema'

export function basicSchemaTests<O, I, SchemaType extends SchemaTypes, Type extends string>(
  options: {
    parser: Schema<O, I, [], BaseSchemaPrototype>
    type?: Type
    schemaType?: SchemaType
    transformed?: boolean
  } & ({ passValues?: { passValue: I; passValueOutput?: O }[] } | { passValue?: I }) &
    (
      | {
          failValues?: { failValue: I; failError?: string }[]
        }
      | { failValue?: I }
    ),
) {
  const passValues = (
    'passValues' in options
      ? options.passValues
      : 'passValue' in options
      ? [{ passValue: options.passValue }]
      : []
  ) as { passValue: I; passValueOutput?: O }[]
  const failValues = (
    'failValues' in options
      ? options.failValues
      : 'failValue' in options
      ? [{ failValue: options.failValue }]
      : []
  ) as { failValue: I; failError?: string }[]
  const { parser, type, schemaType, transformed } = options
  for (const { failValue, failError } of failValues) {
    const result1 = parser(failValue)
    expect(v.isError(result1)).toBeTruthy()
    if (v.isError(result1)) {
      expect(result1[0].input).toBe(failValue)
      expect(result1[0].errors.length).toBeGreaterThanOrEqual(1)
      if (failError) expect(v.firstError(result1)).toEqual(failError)
    }
    expect(() => parser.parse(failValue)).toThrow()
  }
  for (const { passValue, passValueOutput } of passValues) {
    const result2 = parser(passValue)
    expect(v.isError(result2)).toBeFalsy()
    if (!v.isError(result2)) expect(result2[1]).toBe(passValueOutput ?? passValue)

    expect(parser.parse(passValue)).toEqual(passValueOutput ?? passValue)
  }

  if (type) expect(parser.type).toEqual(type)
  if (schemaType) expect(parser.schemaType).toEqual(schemaType)
  if (transformed !== undefined) expect((parser as any).transformed).toEqual(transformed)
}

export function testValidations<O>(
  createParser: Schema<O, unknown, any, any>,
  validationsToTest: {
    validations: ValidationFn<O>[]
    passValues?: { passValue: O; passValueOutput?: O }[]
    failValues?: { failValue: unknown; failError?: string }[]
  }[],
) {
  for (const validationToTest of validationsToTest) {
    const { validations, passValues, failValues } = validationToTest
    const parser = createParser({ validations })
    basicSchemaTests({
      parser,
      passValues,
      failValues,
    })
  }
}
