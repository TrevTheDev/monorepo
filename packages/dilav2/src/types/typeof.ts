/* eslint-disable @typescript-eslint/no-explicit-any */
import { capitalise } from '@trevthedev/toolbelt'
import {
  BasicSchema2,
  BasicSchema2WithCustom,
  SafeParseFn,
  SafeParseOutput,
  SchemaTypes,
} from '../shared/schema'
import {
  SingleValidationError,
  ValidatorLibrary,
  booleanValidations,
  customValidations,
  // functionValidations,
  // objectValidations,
} from '../validations/validations'
import { stringValidations } from '../validations/string'
import defaultErrorFn, { DefaultErrorFn } from '../shared/errorFns'
import { numberValidations } from '../validations/number'
import { createBasicSchema2, createBasicSchema2WithCustom } from '../shared/schema creator'
import { bigIntValidations } from '../validations/bigint'

// import { basicSchemaCreator } from '../schema creator'

type VTypes = {
  string: string
  object: object
  number: number
  boolean: boolean
  // eslint-disable-next-line @typescript-eslint/ban-types
  function: Function
  bigint: bigint
}

interface VTypeT {
  output: any
  input: any
  args: unknown[]
  schemaType: SchemaTypes
  type: string
  validators: ValidatorLibrary<this['output']>
  createParserOptions: object
  coerceSchema?: object
}

export type VTypeOf<T extends VTypeT> = BasicSchema2WithCustom<Omit<T, 'coerceSchema'>> &
  ('coerceSchema' extends keyof T ? { readonly coerce: T['coerceSchema'] } : object)

function vTypeOf<
  const Type extends keyof VTypes & SchemaTypes & string,
  const Validators extends ValidatorLibrary<VTypes[Type]>,
  const CoerceSchema extends object = never,
  VTypeTT extends VTypeT = {
    output: VTypes[Type]
    input: unknown
    args: []
    schemaType: Type
    type: Type
    validators: Validators
    createParserOptions: {
      [K in `parse${Capitalize<Type>}Error`]?: DefaultErrorFn[`parse${Capitalize<Type>}Error`]
    }
  } & ([CoerceSchema] extends [never] ? object : { coerceSchema: CoerceSchema }),
>(options: {
  type: Type
  validators: Validators
  coerceSchema?: () => CoerceSchema
}): VTypeOf<VTypeTT> {
  type O = VTypes[Type]
  type ParseTypeErrorOptionString = `parse${Capitalize<Type>}Error`
  const { type, validators, coerceSchema } = options
  const parseTypeErrorOptionString = `parse${capitalise(type)}Error`
  function parser(
    opts: {
      [K in ParseTypeErrorOptionString]?: (value: unknown) => SingleValidationError
    } = {},
  ): SafeParseFn<O, unknown, []> {
    return (input: unknown): SafeParseOutput<O> =>
      // eslint-disable-next-line valid-typeof
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
  const vTypeSchema = createBasicSchema2WithCustom({
    parser,
    type,
    schemaType: type,
    validators,
  })
  if (coerceSchema)
    Object.defineProperty(vTypeSchema, 'coerce', {
      get() {
        return coerceSchema()
      },
    })
  return vTypeSchema as unknown as VTypeOf<VTypeTT>
}

export const vString = vTypeOf({
  type: 'string',
  validators: stringValidations,
  coerceSchema: () => vStringCoerce,
})

export const vNumber = vTypeOf({
  type: 'number',
  validators: numberValidations,
  coerceSchema: () => vNumberCoerce,
})

export const vBigInt = vTypeOf({
  type: 'bigint',
  validators: bigIntValidations,
  coerceSchema: () => vBigIntCoerce,
})

export const vBoolean = vTypeOf({
  type: 'boolean',
  validators: booleanValidations,
  coerceSchema: () => vBooleanCoerce,
})

export type VObject = typeof vObject
export const vObject = vTypeOf({
  type: 'object',
  validators: customValidations<object>(),
})

export const vFunction = vTypeOf({
  type: 'function',
  // eslint-disable-next-line @typescript-eslint/ban-types
  validators: customValidations<Function>(),
})

function createCoerceSchema<
  const O,
  const I0,
  const I1,
  const SchemaType extends Extract<SchemaTypes, 'string' | 'number' | 'bigint' | 'boolean'>,
  const Type extends string,
  const Validators extends ValidatorLibrary<O>,
  NewSchemaType extends SchemaTypes = `coerced ${SchemaType}`,
>(
  schema: VTypeOf<{
    output: O
    input: I1
    args: []
    schemaType: SchemaType
    type: Type
    validators: Validators
    createParserOptions: any
    coerceSchema: any
  }>,
  coerceFn: (input: I0) => I1,
): BasicSchema2<{
  output: O
  input: I0
  args: []
  schemaType: NewSchemaType
  type: Type
  validators: Validators
}> {
  //   if (!('validators' in schema)) throw new Error('exit')
  const { type, schemaType, validators } = schema
  function parser(input: I0): SafeParseOutput<O> {
    return schema(coerceFn(input))
  }
  return createBasicSchema2({
    parser,
    type,
    schemaType: `coerced ${schemaType}` as NewSchemaType,
    validators,
  }) as unknown as BasicSchema2<{
    output: O
    input: I0
    args: []
    schemaType: NewSchemaType
    type: Type
    validators: Validators
  }>
}

const vStringCoerce = createCoerceSchema(vString, String) as BasicSchema2<{
  output: string
  input: unknown
  args: []
  schemaType: 'coerced string'
  type: 'string'
  validators: typeof stringValidations
}>

const vNumberCoerce: BasicSchema2<{
  output: number
  input: unknown
  args: []
  schemaType: 'coerced number'
  type: 'number'
  validators: typeof numberValidations
}> = createCoerceSchema(vNumber, Number)
const vBooleanCoerce: BasicSchema2<{
  output: boolean
  input: unknown
  args: []
  schemaType: 'coerced boolean'
  type: 'boolean'
  validators: typeof booleanValidations
}> = createCoerceSchema(vBoolean, Boolean)
const vBigIntCoerce: BasicSchema2<{
  output: bigint
  input: string | number | bigint | boolean
  args: []
  schemaType: 'coerced bigint'
  type: 'bigint'
  validators: typeof bigIntValidations
}> = createCoerceSchema(vBigInt, BigInt)
// export const vDateCoerce = createCoerceSchema(vDate, (x) => new Date(x))
