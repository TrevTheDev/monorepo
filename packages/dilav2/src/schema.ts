/* eslint-disable @typescript-eslint/no-explicit-any */
import { isError } from '@trevthedev/toolbelt'
import { Builder, BaseBuilder, builder } from './builder'
import {
  BaseValidations,
  BaseValidatorLibrary,
  Validations,
  ValidatorLibrary,
} from './validations/validations'
import { SafeParseOutput } from './parsers/parsers'
import { baseSchemaPrototype, createSchema } from './schema creator'
import { VInferBaseSchemaCreatorDefToSchemaDef } from './infer'

export type SchemaTypes = (typeof schemaTypes)[number]
export const schemaTypes = [
  'string',
  'number',
  'boolean',
  'function',
  // 'coerced string',
  // 'coerced number',
  // 'coerced boolean',
  'object',
  'object all properties', // internal
  'object known properties', // internal
  'literal',
  'any',
  'unknown',
  'never',
  'null',
  // 'infinite array',
  // 'finite array',
  // 'bigint',
  // 'boolean',
  // 'date',
  // 'enum',
  // 'instanceof',
  // 'intersection',
  // 'map',
  // 'set',

  // 'symbol',
  // 'union',
  // 'discriminated union',
  'literal union',
  'optional',
  // 'nullable',
  // 'nullish',
  // 'function',

  // 'partial object',
  // 'promise',
  // 'record',
  // 'lazy',
  // 'preprocess',
  // 'postprocess',
  // 'custom',
] as const

//   export const groupBaseTypes = [
//     'enum',
//     'intersection',
//     'union',
//     'discriminated union',
//     'literal union',
//     'optional',
//     'nullable',
//     'nullish',
//     'object',
//   ]

export type BaseSafeParseFn = (input: any, ...args: any) => SafeParseOutput<any>
export type SafeParseFn<
  Output,
  Input = unknown,
  Args extends unknown[] = [],
  RT extends BaseSafeParseFn = (input: Input, ...args: Args) => SafeParseOutput<Output>,
> = RT

export type BaseSchemaPrototype = {
  readonly type: string
  readonly schemaType: SchemaTypes
  parse(input: any): any
  toString(): string
}

export interface MinimumSchema
  extends BaseSafeParseFn,
    Pick<BaseSchemaPrototype, 'type' | 'schemaType'> {}

export interface SchemaPrototype<O, I, SchemaType extends SchemaTypes, Type extends string>
  extends BaseSchemaPrototype {
  readonly type: Type
  readonly schemaType: SchemaType
  parse(input: I): O
  toString(): string
}

export interface BaseSchema extends BaseSchemaPrototype, SafeParseFn<any, any, any> {}

export type Schema<
  O,
  I,
  Args extends unknown[],
  SchemaProto extends BaseSchemaPrototype,
  RT = SafeParseFn<O, I, Args> & SchemaProto,
> = RT extends MinimumSchema ? RT : never
export type SchemaPrototypeType = BaseSchemaPrototype & { [P in PropertyKey]: any }
export type BaseSchemaDefinition = {
  // schemaCreatorDef: Pick<BaseSchemaCreatorDefinition, 'schemaType'>
  schemaPrototype: BaseSchemaPrototype
  parser: BaseSafeParseFn
  schemaType: SchemaTypes
  type: string
  breakOnFirstError: boolean
  validations?: BaseValidations
  wrappedType?: MinimumSchema
  builder?: BaseBuilder
  validators?: BaseValidatorLibrary
}

export type PartialBaseSchemaDef = Omit<BaseSchemaDefinition, 'parser'>

export interface SchemaDefinition<
  O,
  I,
  Args extends unknown[],
  Type extends string,
  ParserOptions extends object,
  SchemaProtoType extends BaseSchemaPrototype,
> extends BaseSchemaDefinition {
  schemaCreatorDef: BaseSchemaCreatorDefinition
  schemaPrototype: SchemaProtoType
  parser: SafeParseFn<O, I, Args>
  parserOptions: ParserOptions
  type: Type
  validations: Validations<O>
}

type BaseGetSchemaDefinitionFn = (options: any, partialBaseSchemaDef: any) => BaseSchemaDefinition

export type GetSchemaDefinitionFn<
  O,
  I,
  Args extends unknown[],
  Type extends string,
  ParserOptions extends object,
  SchemaProtoType extends BaseSchemaPrototype,
> = (
  options: ParserOptions,
  partialBaseSchemaDef: Omit<
    SchemaDefinition<O, I, Args, Type, ParserOptions, SchemaProtoType>,
    'parser'
  >,
) => SchemaDefinition<O, I, Args, Type, ParserOptions, SchemaProtoType>

export type BaseSchemaCreatorDefinition = {
  schemaType: SchemaTypes
  type: string
  createSchemaPrototype: object
  validators: BaseValidatorLibrary
  getSchemaDefinitionFn: BaseGetSchemaDefinitionFn
  // builder: BaseBuilder
}

export interface SchemaCreatorDefinition<
  O,
  I,
  Args extends unknown[],
  SchemaType extends SchemaTypes,
  Type extends string,
  CreateSchemaPrototype extends object,
  ParserOptions extends object,
  SchemaProtoType extends BaseSchemaPrototype,
  GetSchemaDefFn extends GetSchemaDefinitionFn<O, I, Args, Type, ParserOptions, SchemaProtoType>,
  Validators extends ValidatorLibrary<O>,
> extends BaseSchemaCreatorDefinition {
  schemaType: SchemaType
  type: Type
  validators: Validators
  getSchemaDefinitionFn: GetSchemaDefFn
  createSchemaPrototype: CreateSchemaPrototype
}

export type DefaultCreateSchemaPrototype<
  SchemaType extends SchemaTypes,
  Type extends string,
  Validators extends BaseValidatorLibrary,
  BuilderT extends BaseBuilder,
> = [keyof Validators] extends [never]
  ? {
      readonly type: Type
      readonly schemaType: SchemaType
    }
  : {
      readonly builder: BuilderT
      readonly validators: Validators
      readonly type: Type
      readonly schemaType: SchemaType
    }

export type BaseCreateSchemaPrototype = {
  readonly builder: BaseBuilder
  readonly validators: BaseValidatorLibrary
}

export interface CreateSchemaPrototype<
  Validators extends BaseValidatorLibrary,
  BuilderObj extends BaseBuilder,
> extends BaseCreateSchemaPrototype {
  readonly builder: BuilderObj
  readonly validators: Validators
}

export function basicCreateSchemaPrototype<
  const Validators extends BaseValidatorLibrary,
  const BuilderObj extends BaseBuilder,
  I extends object = object,
>(options: {
  validators: Validators
  builder: BuilderObj
  baseObject?: I
}): CreateSchemaPrototype<Validators, BuilderObj> & I {
  const { validators, baseObject = {}, builder: builderObj } = options
  // const builderObj = builder(validators, safeParser)
  return Object.defineProperties(baseObject as CreateSchemaPrototype<Validators, BuilderObj> & I, {
    builder: {
      get() {
        return builderObj
      },
    },
    validators: {
      get() {
        return validators
      },
    },
  })
}

type IsReadonly<
  T extends PropertyDescriptor,
  WritableKeys extends PropertyKey,
> = keyof T extends 'set'
  ? true
  : keyof T extends 'value'
  ? T extends { writable: true }
    ? true
    : WritableKeys extends keyof T
    ? false
    : true
  : false

declare global {
  // type TypedPropertyDescriptor<T> = {
  //   enumerable?: boolean
  //   configurable?: boolean
  // } & (
  //   | {
  //       set?: (value: T) => void
  //     }
  //   | {
  //       get?: () => T
  //     }
  //   | {
  //       writable?: boolean
  //       value?: T
  //     }
  // )

  // type PropertyDescriptor = {
  //   enumerable?: boolean
  //   configurable?: boolean
  // } & (
  //   | {
  //       set?: (value: any) => void
  //     }
  //   | {
  //       get?: () => any
  //     }
  //   | {
  //       writable?: boolean
  //       value?: any
  //     }
  // )
  interface ObjectConstructor {
    setPrototypeOf<T extends object, S extends object>(o: T, proto: S): T & S
    setPrototypeOf<T extends object>(o: object, proto: object): T
    defineProperty<
      Target,
      Property extends PropertyKey,
      Descriptor extends TypedPropertyDescriptor<any>,
      V = Descriptor extends TypedPropertyDescriptor<infer T> ? T : never,
      W extends boolean = keyof Descriptor extends 'set'
        ? true
        : keyof Descriptor extends 'value'
        ? Descriptor extends { writable: true }
          ? true
          : keyof Target extends keyof Property
          ? false
          : true
        : false,
      RT = Omit<Target, Property> &
        (W extends true ? { -readonly [K in Property]: V } : { readonly [K in Property]: V }),
    >(
      target: Target,
      property: Property,
      descriptor: Descriptor & ThisType<RT>,
    ): RT
    defineProperties<
      Target,
      Properties extends Record<string | symbol, PropertyDescriptor>,
      PropKeys extends keyof Properties = keyof Properties,
      RT = Omit<Target, PropKeys> & {
        readonly [P in PropKeys as IsReadonly<Properties[P], PropKeys> extends true
          ? P
          : never]: Properties[P] extends TypedPropertyDescriptor<infer V> ? V : never
      } & {
        -readonly [P in PropKeys as IsReadonly<Properties[P], PropKeys> extends false
          ? P
          : never]: Properties[P] extends TypedPropertyDescriptor<infer V> ? V : never
      } extends infer O
        ? { [P in keyof O]: O[P] }
        : never,
    >(
      target: Target,
      properties: Properties & ThisType<RT>,
    ): RT
  }
}

export function addDefaultCreateSchemaPrototype<const T extends BaseSchemaCreatorDefinition>(
  createSchemaDefinition: T,
): T & {
  createSchemaPrototype: T['createSchemaPrototype'] & {
    readonly builder: Builder<VInferBaseSchemaCreatorDefToSchemaDef<T>>
    readonly validators: T['validators']
    readonly type: T['type']
    readonly schemaType: T['schemaType']
  }
}
export function addDefaultCreateSchemaPrototype(
  schemaCreatorDef: BaseSchemaCreatorDefinition,
): BaseSchemaCreatorDefinition & {
  readonly builder: BaseBuilder
  readonly validators: BaseValidatorLibrary
  readonly type: string
  readonly schemaType: SchemaTypes
} {
  const { validators, createSchemaPrototype, type, schemaType, getSchemaDefinitionFn } =
    schemaCreatorDef

  const updatedCreateSchemaPrototype = Object.defineProperties(createSchemaPrototype ?? {}, {
    builder: {
      get() {
        return builder({
          parser: (input: any, ...args: any[]) => {
            const schemaDef = getSchemaDefinitionFn({}, {})
            const schema = createSchema(schemaDef)
            return schema(input, ...args)
          },
          schemaType,
          type,
          validators,
          breakOnFirstError: false,
          schemaPrototype: baseSchemaPrototype,
        })
      },
    },
    validators: {
      get() {
        return validators
      },
    },
    type: {
      get() {
        return type
      },
    },
    schemaType: {
      get() {
        return schemaType
      },
    },
  })
  schemaCreatorDef.createSchemaPrototype = updatedCreateSchemaPrototype
  return schemaCreatorDef as BaseSchemaCreatorDefinition & {
    readonly builder: BaseBuilder
    readonly validators: BaseValidatorLibrary
    readonly type: string
    readonly schemaType: SchemaTypes
  }
}
export function parse(schema: BaseSafeParseFn) {
  return function parseFn(input) {
    const result = schema(input)
    if (isError(result)) throw result[0]
    return result[1]
  }
}

// export function newBasicSchema<
//   T extends BaseSchemaDefinition,
//   X extends BaseVInferSafeParse = VInferSafeParse<T['parser']>,
// >(
//   schemaDef: T,
// ): {
//   readonly type: T['type']
//   readonly schemaType: T['schemaType']
//   parse(input: X['input']): X['output']
//   toString(): string
// }
// export function newBasicSchema(
//   schemaDef: BaseSchemaDefinition = {
//     parser: undefined as unknown as BaseSafeParseFn,
//     schemaType: undefined as unknown as SchemaTypes,
//     type: undefined as unknown as string,
//     breakOnFirstError: false as boolean,
//     validations: undefined as unknown as BaseValidations,
//     wrappedType: undefined as unknown as MinimumSchema,
//     builder: undefined as unknown as BaseBuilder,
//     validators: undefined as unknown as BaseValidatorLibrary,
//     schemaPrototype: undefined as unknown as BaseSchemaPrototype,
//   },
// ): {
//   readonly type: string
//   readonly schemaType: SchemaTypes
//   parse(input: any): any
//   toString(): string
// } {
//   const basicSchema = Object.create(schemaBase, {
//     [schemaDefinitionPropertyKey]: { value: schemaDef },
//   })
//   schemaDef.schemaPrototype = basicSchema
//   return basicSchema
// }

// export function addDefaultSchemaProtoType<
//   Type extends string,
//   SchemaType extends SchemaTypes,
//   T extends {
//     type: Type
//     schemaCreatorDef: { schemaType: SchemaType }
//     schemaPrototype: object
//   },
//   O = any,
//   I = any,
//   RT = {
//     [P in keyof T]: P extends 'schemaPrototype'
//       ? [keyof T[P]] extends [never]
//         ? T['schemaPrototype'] & {
//             readonly type: Type
//             readonly schemaType: SchemaType
//             parse(input: I): O
//             toString(): string
//           }
//         : T[P] & {
//             readonly type: Type
//             readonly schemaType: SchemaType
//             parse(input: I): O
//             toString(): string
//           }
//       : T[P]
//   },
// >(schemaDefinition: T, schema: BaseSafeParseFn): RT {
//   const { schemaCreatorDef, schemaPrototype } = schemaDefinition
//   schemaDefinition.schemaPrototype = Object.defineProperties(schemaPrototype, {
//     type: {
//       get() {
//         return schemaDefinition.type
//       },
//     },
//     schemaType: {
//       get() {
//         return schemaCreatorDef.schemaType
//       },
//     },
//     parse: {
//       value: parse(schema),
//     },
//     toString: {
//       value() {
//         return `schema:${schemaCreatorDef.schemaType}:${schemaDefinition.type}`
//       },
//     },
//   })
//   return schemaDefinition as unknown as RT
// }
