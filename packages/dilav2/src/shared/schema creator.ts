/* eslint-disable @typescript-eslint/no-explicit-any */
import { builder } from './builder'
import type {
  SchemaTypes,
  SafeParseFn,
  MinimumSchema,
  TypedMinimumSchema,
  BasicSchema2,
  BasicSchema3C,
  BasicSchema2WithCustom,
  CreateParserB,
  CreateParser,
  BasicSchema1WithCustom,
} from './schema'
import { ValidatorLibrary, BaseValidatorLibrary } from '../validations/validations'
import { createSchema } from './create schema'
import {
  appendDefaultSchemaProtoCreateBuilderValidations,
  appendMinimumSchemaPrototype,
} from './append default schemaproto'

/**
 * takes the form:
 * ```typescript
 * {
 *   (input: I, ...args: Args) => SafeParseOutput<O>
 *   readonly type: Type;
 *   readonly schemaType: SchemaType;
 *   parse(input: I): O;
 *   toString(): string;
 * }
 * ```
 */
export function createMinimumSchema<
  const O,
  const I,
  const Args extends unknown[],
  const SchemaType extends SchemaTypes,
  const Type extends string,
>(options: {
  schemaType: SchemaType
  type: Type
  parser: SafeParseFn<O, I, Args>
}): TypedMinimumSchema<{
  output: O
  input: I
  args: Args
  schemaType: SchemaType
  type: Type
}>
export function createMinimumSchema(options: {
  schemaType: SchemaTypes
  type: string
  parser: SafeParseFn<any, any, any>
}): MinimumSchema {
  const { schemaType, type, parser } = options
  return createSchema(
    appendMinimumSchemaPrototype({
      prototype: undefined,
      schemaType,
      type,
      parser,
      breakOnFirstError: false,
    }),
  )
}

/**
 * BasicSchema1 wih validations, builder and validators takes the form:
 * ```typescript
 * {
 *   (input: I, ...args: Args) => SafeParseOutput<O>
 *   readonly type: Type;
 *   readonly schemaType: SchemaType;
 *   parse(input: I): O;
 *   toString(): string;
 *   readonly validators: Validators;
 *   readonly builder: Builder
 *   validations(validations: BuilderValidations<O> | ValidationFn<O>[]): this;
 * }
 * ```
 */
export function createBasicSchema2<
  const O,
  const I,
  const Args extends unknown[],
  const SchemaType extends SchemaTypes,
  const Type extends string,
  const Validators extends ValidatorLibrary<O>,
>(options: {
  schemaType: SchemaType
  type: Type
  parser: SafeParseFn<O, I, Args>
  validators: Validators
}): BasicSchema2<{
  output: O
  input: I
  args: Args
  schemaType: SchemaType
  type: Type
  validators: Validators
}>
export function createBasicSchema2(options: {
  schemaType: SchemaTypes
  type: string
  parser: SafeParseFn<any, any, any>
  validators: BaseValidatorLibrary
}): MinimumSchema {
  const { schemaType, type, parser, validators } = options
  const schemaDef = appendDefaultSchemaProtoCreateBuilderValidations(
    {
      prototype: undefined,
      schemaType,
      type,
      parser,
      breakOnFirstError: false,
      validators,
    },
    {
      createBuilder() {
        const bObj = builder(schema, validators)
        return bObj
      },
    },
  )

  const schema = createSchema(schemaDef)
  return schema
}

// /**
//  * takes the form:
//  * ```typescript
//  *  {
//  *    (...args: CreateParserArgs) => BasicSchema1
//  *  }
//  * ```
//  * type is known at start
//  */
// function createCreateMinimalSchema<
//   const O,
//   const I,
//   const Args extends unknown[],
//   const CreateParserOptions extends object,
//   const SchemaType extends SchemaTypes,
//   const Type extends string,
// >(schemaDef: {
//   schemaType: SchemaType
//   type: Type
//   parser: CreateParser<O, I, Args, CreateParserOptions>
// }): BasicSchema3A<{
//   output: O
//   input: I
//   args: Args
//   schemaType: SchemaType
//   type: Type
//   createParserOptions: CreateParserOptions
// }>
// function createCreateMinimalSchema(schemaDef: {
//   schemaType: SchemaTypes
//   type: string
//   parser: CreateParser<any, any, any, any>
//   validators?: BaseValidatorLibrary
// }): (createParserOptions: object) => MinimumSchema {
//   return function createCreateMinimalSchemaFn(createParserOptions: object): MinimumSchema {
//     return createMinimumSchema({
//       ...createParserOptions,
//       ...schemaDef,
//       parser: schemaDef.parser(createParserOptions),
//     })
//   }
// }

/**
 * CreateBasicSchema1 with validators, takes the form:
 * ```typescript
 *  {
 *    (...args: CreateParserArgs) => BasicSchema2
 *    readonly validators: Validators;
 *  }
 *```
 * type is known at start
 */
export function createCreateBasicSchema2<
  const O,
  const I,
  const Args extends unknown[],
  const CreateParserOptions extends object,
  const SchemaType extends SchemaTypes,
  const Type extends string,
  const Validators extends ValidatorLibrary<O>,
>(schemaDef: {
  schemaType: SchemaType
  type: Type
  parser: CreateParser<O, I, Args, CreateParserOptions>
  validators: Validators
}): BasicSchema3C<{
  output: O
  input: I
  args: Args
  schemaType: SchemaType
  type: Type
  validators: Validators
  createParserOptions: CreateParserOptions
}>
export function createCreateBasicSchema2(schemaDef: {
  schemaType: SchemaTypes
  type: string
  parser: CreateParser<any, any, any, any>
  validators: BaseValidatorLibrary
}): (createParserOptions: object) => MinimumSchema {
  const { parser, validators } = schemaDef
  function createBasicSchema2Fn(createParserOptions: object): MinimumSchema {
    return createBasicSchema2({
      ...createParserOptions,
      ...schemaDef,
      parser: parser(createParserOptions),
    })
  }
  Object.defineProperties(createBasicSchema2Fn, {
    validators: {
      get() {
        return validators
      },
    },
  })
  return createBasicSchema2Fn
}

/**
 * takes the form
 * ```typescript
 * {
 *    (input: I, ...args: Args) => SafeParseOutput<O>
 *    readonly type: Type;
 *    readonly schemaType: SchemaType;
 *    parse(input: I): O;
 *    toString(): string;
 *    custom(...args: CreateParserArgs) => BasicSchema2
 *  }
 * ```
 */
export function createMinimalSchemaWithCustom<
  const O,
  const I,
  const SchemaType extends SchemaTypes,
  const Type extends string,
  const CreateParserOptions extends object,
  const Args extends unknown[] = [],
>(schemaDef: {
  schemaType: SchemaType
  type: Type
  parser: CreateParser<O, I, Args, CreateParserOptions>
}): BasicSchema1WithCustom<{
  output: O
  input: I
  args: Args
  schemaType: SchemaType
  type: Type
  createParserOptions: CreateParserOptions
}> {
  const baseSchemaCreator = function createCreateMinimalSchemaFn(
    createParserOptions: CreateParserOptions,
  ): MinimumSchema {
    return createMinimumSchema({
      ...createParserOptions,
      ...schemaDef,
      parser: schemaDef.parser(createParserOptions),
    })
  }
  const baseSchema = baseSchemaCreator({} as CreateParserOptions)
  Object.defineProperty(baseSchema, 'custom', { value: baseSchemaCreator })
  return baseSchema as unknown as BasicSchema1WithCustom<{
    output: O
    input: I
    args: Args
    schemaType: SchemaType
    type: Type
    createParserOptions: CreateParserOptions
  }>
}

/**
 * takes the form
 * ```typescript
 * {
 *    (input: I, ...args: Args) => SafeParseOutput<O>
 *    readonly type: Type;
 *    readonly schemaType: SchemaType;
 *    parse(input: I): O;
 *    toString(): string;
 *    readonly validators: Validators;
 *    readonly builder: Builder
 *    validations(validations: BuilderValidations<O> | ValidationFn<O>[]): this;
 *    custom(...args: CreateParserArgs) => BasicSchema2
 *    readonly coerce?: BasicSchema2
 *  }
 * ```
 */
export function createBasicSchema2WithCustom<
  const O,
  const I,
  const SchemaType extends SchemaTypes,
  const Type extends string,
  const CreateParserOptions extends object,
  const Args extends unknown[],
  const Validators extends ValidatorLibrary<O>,
>(schemaDef: {
  schemaType: SchemaType
  type: Type
  parser: CreateParser<O, I, Args, CreateParserOptions>
  validators: Validators
}): BasicSchema2WithCustom<{
  output: O
  input: I
  args: Args
  schemaType: SchemaType
  type: Type
  validators: Validators
  createParserOptions: CreateParserOptions
}> {
  const baseSchemaCreator = createCreateBasicSchema2(schemaDef)
  const baseSchema = baseSchemaCreator()
  Object.defineProperty(baseSchema, 'custom', { value: baseSchemaCreator })
  return baseSchema as unknown as BasicSchema2WithCustom<{
    output: O
    input: I
    args: Args
    schemaType: SchemaType
    type: Type
    validators: Validators
    createParserOptions: CreateParserOptions
  }>
}

/**
 * takes the form
 * ```typescript
 * {
 *   ( createParserOption: CreateParserOptions & { type: Type } ) => BasicSchema2
 *   readonly validators: Validators;
 * }
 * type is probably broken, so return type will have to be
 * typed
 */
export function createBasicSchema3Broken(schemaDef: {
  schemaType: SchemaTypes
  createParser: CreateParserB
}) {
  const { createParser, schemaType } = schemaDef
  return function createBasicSchema3Fn<
    CreateParserOptions extends object,
    Type extends string,
    Validators extends ValidatorLibrary<any> = never,
  >(createParserOption: CreateParserOptions & { type: Type; validators: Validators }) {
    const { parser, type, validators } = createParser(createParserOption)
    return createBasicSchema2({
      ...createParserOption,
      validators,
      schemaType,
      type,
      parser,
    })
  }
}
