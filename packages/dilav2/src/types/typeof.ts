import { capitalise } from '@trevthedev/toolbelt'
import { SafeParseFn, SchemaTypes } from '../schema'
import {
  SingleValidationError,
  ValidatorLibrary,
  booleanValidations,
  functionValidations,
  objectValidations,
} from '../validations/validations'
import { stringValidations } from '../validations/string'
import defaultErrorFn from '../errorFns'
import { numberValidations } from '../validations/number'
import { SafeParseOutput } from '../parsers/parsers'
import { basicSchemaCreator } from '../schema creator'

type VTypes = {
  string: string
  object: object
  number: number
  boolean: boolean
  // eslint-disable-next-line @typescript-eslint/ban-types
  function: Function
}
function vType<
  const Type extends keyof VTypes & SchemaTypes,
  const Validators extends ValidatorLibrary<VTypes[Type]>,
>(options: { type: Type; validators: Validators }) {
  type O = VTypes[Type]
  type ParseTypeErrorOptionString = `parse${Capitalize<Type>}Error`
  const { type, validators } = options
  const parseTypeErrorOptionString = `parse${capitalise(type)}Error`
  function parser(
    opts: {
      [K in ParseTypeErrorOptionString]?: (value: unknown) => SingleValidationError
    } = {},
  ): SafeParseFn<O, unknown, []> {
    return (input: unknown): SafeParseOutput<O> =>
      typeof input === type
        ? [undefined, input as O]
        : [
            {
              input,
              errors: [
                (parseTypeErrorOptionString in opts
                  ? (opts[parseTypeErrorOptionString] as (value: unknown) => SingleValidationError)
                  : defaultErrorFn[parseTypeErrorOptionString])(input),
              ],
            },
          ]
  }
  return basicSchemaCreator({
    parser: parser as (opts: {
      [K in ParseTypeErrorOptionString]?: (value: unknown) => SingleValidationError
    }) => (input: unknown) => SafeParseOutput<O>,
    type,
    schemaType: type,
    validators,
  })
}

export const vString = vType({
  type: 'string',
  validators: stringValidations,
})

export const vNumber = vType({
  type: 'number',
  validators: numberValidations,
})

export const vBoolean = vType({
  type: 'boolean',
  validators: booleanValidations,
})

export const vObject = vType({
  type: 'object',
  validators: objectValidations,
})

export const vFunction = vType({
  type: 'function',
  validators: functionValidations,
})
