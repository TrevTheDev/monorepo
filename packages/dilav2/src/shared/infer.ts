/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SafeParseFn,
  MinimumSchema,
  SchemaTypes,
  // BaseSchemaPrototype,
  // // BaseSchemaCreatorDefinition,
  // BaseSchemaDefinition,
  BaseSafeParseFn,
} from './schema'
import { ValidatorLibrary } from '../validations/validations'

export type VInferSafeParseType = {
  input: unknown
  output: unknown
  args: unknown[]
}

export interface VInferSafeParse<
  T extends BaseSafeParseFn,
  RT extends {
    input: unknown
    output: unknown
    args: unknown[]
  } = T extends SafeParseFn<infer O, infer I, infer Args>
    ? {
        input: I
        output: O
        args: Args
      }
    : never,
> extends VInferSafeParseType {
  input: RT['input']
  output: RT['output']
  args: RT['args']
}

export interface VInferType {
  input: unknown
  output: unknown
  args: unknown[]
  type: string
  schemaType: SchemaTypes
}

export interface VInfer<
  T extends MinimumSchema,
  SchemaType extends SchemaTypes = T['schemaType'],
  Type extends string = T['type'],
> extends VInferSafeParse<T> {
  type: Type
  schemaType: SchemaType
}

// export interface VInferBaseSchemaDefinitionType {
//   input: unknown
//   output: unknown
//   args: unknown[]
//   type: string
//   schemaType: SchemaTypes
//   prototype: BaseSchemaPrototype
// }

export type VInferBaseSchemaDefinition<T extends MinimumSchema> =
  VInferSafeParse<T> extends infer S extends VInferSafeParseType
    ? S & {
        schemaType: T['schemaType']
        type: T['type']
      } & T extends { readonly validators: ValidatorLibrary<S['output']> }
      ? 'validators' extends keyof T
        ? { validators: T['validators'] }
        : object
      : object & T extends { readonly builder: object }
      ? 'builder' extends keyof T
        ? { builder: T['builder'] }
        : object
      : object &
          Exclude<
            keyof T,
            'type' | 'schemaType' | 'parse' | 'toString' | 'validators' | 'builder'
          > extends infer AdditionalProps extends keyof T
      ? { other: { [K in AdditionalProps]: T[K] } }
      : object
    : never
// {
//   validators?: ValidatorLibrary<T['output']>
//   builder?: object
//   other?: object
// }
