/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseBuilder } from './builder'
import {
  SafeParseFn,
  MinimumSchema,
  SchemaTypes,
  BaseSchemaPrototype,
  BaseSchemaCreatorDefinition,
  BaseSchemaDefinition,
  BaseSafeParseFn,
} from './schema'
import { BaseValidatorLibrary } from './validations/validations'

export type BaseVInferSafeParse = {
  input: unknown
  output: unknown
  args: unknown[]
}

export type VInferSafeParse<T extends BaseSafeParseFn> = T extends SafeParseFn<
  infer I,
  infer O,
  infer Args
>
  ? {
      input: I
      output: O
      args: Args
    }
  : never

export interface BaseVInfer extends BaseVInferSafeParse {
  type: string
  schemaType: SchemaTypes
}

export type VInfer<T extends MinimumSchema> = VInferSafeParse<T> & T extends {
  readonly type: infer Type extends string
  readonly schemaType: infer SchemaType extends SchemaTypes
}
  ? {
      type: Type
      schemaType: SchemaType
    }
  : never

export interface c extends BaseVInfer {
  createSchemaPrototype: object
  validators: BaseValidatorLibrary
  // builder: object
  schemaCreatorOptions: object
  schemaPrototype: object
  parser: BaseSafeParseFn
}

export interface BaseVInferBaseSchemaCreatorDef extends BaseVInferSafeParse {
  schemaType: SchemaTypes
  type: string
  createSchemaPrototype: object
  validators: BaseValidatorLibrary
  schemaCreatorOptions: object
  schemaPrototype: BaseSchemaPrototype
  parser: BaseSafeParseFn
}

export type VInferBaseSchemaCreatorDef<
  T extends BaseSchemaCreatorDefinition,
  RT = T extends {
    getSchemaDefinitionFn: (
      options: infer SchemaCreatorOptions extends object,
      partialBaseSchemaDef: any,
    ) => {
      parser: infer Parser extends BaseSafeParseFn
      schemaPrototype: infer SchemaProto extends BaseSchemaPrototype
    }
  }
    ? VInferSafeParse<Parser> & {
        schemaType: T['schemaType']
        type: T['type']
        createSchemaPrototype: T['createSchemaPrototype']
        validators: T['validators']
        schemaCreatorOptions: SchemaCreatorOptions
        schemaPrototype: SchemaProto
        parser: Parser
      }
    : never,
> = RT extends BaseVInferBaseSchemaCreatorDef ? RT : never

export interface VInferBaseSchemaCreatorDefToSchemaDef<
  T extends BaseSchemaCreatorDefinition,
  S extends BaseVInferBaseSchemaCreatorDef = VInferBaseSchemaCreatorDef<T>,
> extends BaseSchemaDefinition {
  schemaPrototype: S['schemaPrototype']
  parser: S['parser']
  schemaType: S['schemaType']
  type: S['type']
  validators: S['validators']
}

export interface BaseVInferBaseSchemaDefinition extends BaseVInfer {
  schemaType: SchemaTypes
  type: string
  builder: BaseBuilder | undefined
  schemaPrototype: BaseSchemaPrototype
  // createSchemaPrototype: object
  // schemaCreatorOptions: object
}

export type VInferBaseSchemaDefinition<T extends BaseSchemaDefinition> = VInferSafeParse<
  T['parser']
> & {
  schemaType: T['schemaType']
  type: T['type']
  builder: T['builder']
  schemaPrototype: T['schemaPrototype']
}
