/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { IntersectType1 } from '@trevthedev/toolbelt'
import { ResultError } from '@trevthedev/toolbelt'
import type {
  BaseValidations,
  BaseValidatorLibrary,
  CustomValidations,
  SingleValidationError,
  ValidationFn,
  ValidatorLibrary,
} from '../validations/validations'
import type { VInferSafeParseType, VInferSafeParse, VInfer } from './infer'
import type { Builder, BuilderValidations } from './builder'
import { DefaultErrorFn } from './errorFns'

export type ValidationErrors = {
  input: unknown
  errors: SingleValidationError[]
}

export type SafeParseOutput<T> = ResultError<ValidationErrors, T>

export type SchemaTypes = (typeof schemaTypes)[number]
export const schemaTypes = [
  'string',
  'number',
  'NaN',
  'boolean',
  'function',
  'coerced string',
  'coerced number',
  'coerced bigint',
  'coerced boolean',
  'object',
  // 'object all properties', // internal
  'object known properties', // internal
  'object index signature',
  'literal',
  'any',
  'unknown',
  'never',
  'null',
  'exclude',
  // 'infinite array',
  // 'finite array',
  'bigint',
  // 'boolean',
  // 'date',
  // 'enum',
  // 'instanceof',
  // 'intersection',
  // 'map',
  // 'set',

  // 'symbol',
  'union',
  // 'discriminated union',
  'literal union',
  'optional',
  'nullable',
  'nullish',
  // 'function',

  // 'partial object',
  // 'promise',
  // 'record',
  // 'lazy',
  // 'preprocess',
  // 'postprocess',
  // 'custom',
] as const

export const groupedSchemaTypes = [
  'enum',
  'intersection',
  'union',
  'discriminated union',
  'literal union',
  'optional',
  'nullable',
  'nullish',
  'object',
]

export type BaseSafeParseFn = (input: any, ...args: any) => SafeParseOutput<any>
export type SafeParseFn<Output, Input = unknown, Args extends unknown[] = []> = ((
  input: Input,
  ...args: Args
) => SafeParseOutput<Output>) extends infer O extends BaseSafeParseFn
  ? O
  : never

export interface MinimumSchemaProtoType {
  readonly type: string
  readonly schemaType: SchemaTypes
  parse(input: any): any
  toString(): string
}

export interface MinimumSchema extends BaseSafeParseFn, MinimumSchemaProtoType {}

export interface MinimumObjectSchema extends MinimumSchema {
  readonly schemaType: 'object'
  readonly propertySchemas: { [P: PropertyKey]: MinimumSchema }
  readonly unmatchedSchema: MinimumSchema
}

export type TypedMinimumSchema<
  T extends {
    output: any
    input: any
    args: unknown[]
    schemaType: SchemaTypes
    type: string
  },
  RT extends MinimumSchema = {
    (input: T['input'], ...args: T['args']): SafeParseOutput<T['output']>
    readonly type: T['type']
    readonly schemaType: T['schemaType']
    parse(input: T['input']): T['output']
    toString(): string
  } extends infer O extends MinimumSchema
    ? O
    : never,
> = RT

export interface Schema<
  T extends {
    output: unknown
    input: unknown
    args: unknown[]
    schemaType: SchemaTypes
    type: string
  },
> extends TypedMinimumSchema<T> {
  optional(): VOptional<this>
}

export interface SchemaV<
  T extends {
    output: unknown
    input: unknown
    args: unknown[]
    schemaType: SchemaTypes
    type: string
    validators: ValidatorLibrary<T['output']>
  },
> extends Schema<T> {
  readonly validators: T['validators']
  validations(validations: BuilderValidations<T['output']> | ValidationFn<T['output']>[]): this
}

export interface SchemaVB<
  T extends {
    output: unknown
    input: unknown
    args: unknown[]
    schemaType: SchemaTypes
    type: string
    validators: ValidatorLibrary<T['output']>
    builder: object
  },
> extends SchemaV<T> {
  readonly builder: T['builder']
}

export type SchemaPrototype<T extends MinimumSchema> = { [P in keyof T]: T[P] }

export interface BaseSchemaDefinition {
  prototype: MinimumSchemaProtoType
  parser: BaseSafeParseFn
  schemaType: SchemaTypes
  type: string
  breakOnFirstError: boolean
  validations?: BaseValidations
  // builder?: object
  // validators?: BaseValidatorLibrary
}

export interface BaseSchemaDefinitionV extends BaseSchemaDefinition {
  validators: BaseValidatorLibrary
}

export interface BaseSchemaDefinitionVB extends BaseSchemaDefinitionV {
  builder: object
}

export type SchemaDefinitionToSchema<
  T extends BaseSchemaDefinition,
  InferredSafeParseType extends VInferSafeParseType = VInferSafeParse<T['parser']>,
  OtherTypes extends object = Omit<T['prototype'], keyof MinimumSchemaProtoType>,
> = TypedMinimumSchema<{
  output: InferredSafeParseType['output']
  input: InferredSafeParseType['input']
  args: InferredSafeParseType['args']
  schemaType: T['schemaType']
  type: T['type']
}> &
  OtherTypes

// export type SchemaDefinitionToSchema<
//   T extends BaseSchemaDefinition,
//   InferredSafeParseType extends VInferSafeParseType = VInferSafeParse<T['parser']>,
//   OtherTypes extends object = Omit<T['prototype'], keyof SchemaBaseType>,
// > = InferredSafeParseType &
//   Pick<T, 'validators' | 'builder' | 'type' | 'schemaType'> extends infer O extends SchemaTType
//   ? Schema<O> & OtherTypes
//   : never

// export type Schema<
//   T extends {
//     output: any
//     input: any
//     args: unknown[]
//     prototype: BaseSchemaPrototype
//   },
// > = SafeParseFn<T['output'], T['input'], T['args']> & T['prototype']

// export type SchemaPrototypeType = BaseSchemaPrototype & { [P in PropertyKey]: any }

// export type SchemaDefinition<
//   T extends {
//     output: any
//     input: any
//     args: unknown[]
//     schemaType: SchemaTypes
//     type: string
//     prototype: BaseSchemaPrototype
//     validators?: ValidatorLibrary<any>
//     wrappedType?: MinimumSchema
//     builder?: MinimumBuilder
//   },
// > = {
//   prototype: T['prototype']
//   parser: SafeParseFn<T['output'], T['input'], T['args']>
//   schemaType: T['schemaType']
//   type: T['type']
//   breakOnFirstError: boolean
// } & {
//   [P in 'validators' | 'wrappedType' | 'builder' as P extends keyof T ? P : never]: T[P]
// } extends infer S extends BaseSchemaDefinition
//   ? S
//   : never
/* ******************************************************************************************************************************
 ******************************************************************************************************************************
 ******************************************************************************************************************************
 ******************************************************************************************************************************
 ***************************************************************************************************************************** */
export type CreateParser<O, I, Args extends unknown[], CreateParserOptions extends object> = ((
  createParserArgs: CreateParserOptions,
) => SafeParseFn<O, I, Args>) &
  (() => SafeParseFn<O, I, Args>)

export interface BasicSchema2<
  T extends {
    output: unknown
    input: unknown
    args: unknown[]
    schemaType: SchemaTypes
    type: string
    validators: ValidatorLibrary<T['output']>
  },
> extends SchemaVB<
    T & {
      builder: Builder<T>
    }
  > {}

export type BasicSchema3A<
  T extends {
    output: unknown
    input: unknown
    args: unknown[]
    schemaType: SchemaTypes
    type: string
    createParserOptions: object
  },
> = ((createParserOptions: T['createParserOptions']) => Schema<Omit<T, 'createParserOptions'>>) &
  (() => Schema<Omit<T, 'createParserOptions'>>)

export type BasicSchema3C<
  T extends {
    output: unknown
    input: unknown
    args: unknown[]
    schemaType: SchemaTypes
    type: string
    validators: ValidatorLibrary<T['output']>
    createParserOptions: object
  },
> = ((
  createParserOptions: T['createParserOptions'],
) => BasicSchema2<Omit<T, 'createParserOptions'>>) &
  (() => BasicSchema2<Omit<T, 'createParserOptions'>>) & {
    readonly validators: T['validators']
  }

export interface BasicSchema2WithCustom<
  T extends {
    output: unknown
    input: unknown
    args: unknown[]
    schemaType: SchemaTypes
    type: string
    validators: ValidatorLibrary<T['output']>
    createParserOptions: object
  },
  SchemaT extends {
    output: T['output']
    input: unknown
    args: unknown[]
    schemaType: SchemaTypes
    type: string
    validators: ValidatorLibrary<T['output']>
  } = Omit<T, 'createParserOptions'>,
> extends BasicSchema2<SchemaT> {
  custom(createParserOptions: T['createParserOptions']): BasicSchema2<SchemaT>
}

export interface BasicSchema1WithCustom<
  T extends {
    output: unknown
    input: unknown
    args: unknown[]
    schemaType: SchemaTypes
    type: string
    createParserOptions: object
  },
  SchemaT extends {
    output: T['output']
    input: unknown
    args: unknown[]
    schemaType: SchemaTypes
    type: string
  } = Omit<T, 'createParserOptions'>,
> extends Schema<SchemaT> {
  custom(createParserOptions: T['createParserOptions']): Schema<SchemaT>
}

export type CreateParserB = (createParserOption: any) => {
  parser: SafeParseFn<any, any>
  type: string
  validators: ValidatorLibrary<any>
}

export type BasicSchema3B<CreateParserT extends CreateParserB, SchemaType extends SchemaTypes> = <
  O,
  I,
  Type extends string,
  Validators extends ValidatorLibrary<O>,
>(
  createParserOption: Parameters<CreateParserT>[0],
) => BasicSchema2<{
  output: O
  input: I
  args: []
  schemaType: SchemaType
  type: Type
  validators: Validators
}>

/* ******************************************************************************************************************************
 ******************************************************************************************************************************
 ******************************************************************************************************************************
 ******************************************************************************************************************************
 ***************************************************************************************************************************** */
export type UnionSchemas = [MinimumSchema, ...MinimumSchema[]]

export type VUnionOutput<T extends UnionSchemas> = {
  [I in keyof T]: VInfer<T[I]>['output']
}[number]

export type VUndefined = BasicSchema2WithCustom<{
  output: undefined
  input: unknown
  args: []
  schemaType: 'literal'
  type: 'undefined'
  validators: CustomValidations<undefined>
  createParserOptions: { parseUndefinedError: DefaultErrorFn['parseLiteralError'] }
}>

export type VNull = BasicSchema2WithCustom<{
  output: null
  input: unknown
  args: []
  schemaType: 'literal'
  type: 'null'
  validators: CustomValidations<null>
  createParserOptions: { parseNullError: DefaultErrorFn['parseLiteralError'] }
}>

export type VTrue = BasicSchema2WithCustom<{
  output: true
  input: unknown
  args: []
  schemaType: 'literal'
  type: 'true'
  validators: CustomValidations<true>
  createParserOptions: { parseTrueError: DefaultErrorFn['parseLiteralError'] }
}>

export type VFalse = BasicSchema2WithCustom<{
  output: false
  input: unknown
  args: []
  schemaType: 'literal'
  type: 'false'
  validators: CustomValidations<false>
  createParserOptions: { parseFalseError: DefaultErrorFn['parseFalseError'] }
}>

export type VAny = BasicSchema2<{
  output: any
  input: unknown
  args: []
  schemaType: 'any'
  type: 'any'
  validators: CustomValidations<any>
}>

export type VUnknown = BasicSchema2<{
  output: unknown
  input: unknown
  args: []
  schemaType: 'unknown'
  type: 'unknown'
  validators: CustomValidations<unknown>
}>

export interface VOptional<T extends MinimumSchema, O = VUnionOutput<[T, VUndefined]>>
  extends Omit<
    BasicSchema2<{
      output: O
      input: unknown
      args: []
      schemaType: 'optional'
      type: string
      validators: CustomValidations<O>
    }>,
    'optional'
  > {
  (input: unknown): SafeParseOutput<O>
  optional(): this
  require(): T
  readonly wrappedSchema: T
}

export interface VNullable<T extends MinimumSchema, O = VUnionOutput<[T, VNull]>>
  extends BasicSchema2<{
    output: O
    input: unknown
    args: []
    schemaType: 'nullable'
    type: string
    validators: CustomValidations<O>
  }> {
  readonly wrappedSchema: T
}

export interface VNullish<T extends MinimumSchema, O = VUnionOutput<[T, VUndefined, VNull]>>
  extends BasicSchema2<{
    output: O
    input: unknown
    args: []
    schemaType: 'nullish'
    type: string
    validators: CustomValidations<O>
  }> {
  readonly wrappedSchema: T
}
