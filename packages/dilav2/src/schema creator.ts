/* eslint-disable @typescript-eslint/no-explicit-any */
import { isError } from '@trevthedev/toolbelt'
import { Builder, BuilderValidations } from './builder'
import { SafeParseOutput } from './parsers/parsers'
import {
  SchemaTypes,
  SafeParseFn,
  DefaultCreateSchemaPrototype,
  Schema,
  SchemaPrototype,
  addDefaultCreateSchemaPrototype,
  BaseSchemaDefinition,
  BaseSchema,
  BaseSchemaCreatorDefinition,
  BaseSchemaPrototype,
  BaseSafeParseFn,
  parse,
  SchemaDefinition,
} from './schema'
import {
  ValidatorLibrary,
  BaseValidatorLibrary,
  ValidationFn,
  validate,
} from './validations/validations'
import {
  BaseVInferBaseSchemaCreatorDef,
  BaseVInferBaseSchemaDefinition,
  VInferBaseSchemaCreatorDef,
  VInferBaseSchemaDefinition,
} from './infer'

export function basicSchemaCreator<
  const O,
  const I,
  const ParserOptions extends object,
  const Args extends unknown[],
  const SchemaType extends SchemaTypes,
  const Type extends string,
  const Validators extends ValidatorLibrary<O>,
>(options: {
  parser: (opts: ParserOptions) => SafeParseFn<O, I, Args>
  type: Type
  schemaType: SchemaType
  validators: Validators
}): CreateSchema<
  O,
  ParserOptions,
  DefaultCreateSchemaPrototype<
    SchemaType,
    Type,
    Validators,
    Builder<
      SchemaDefinition<O, I, Args, Type, ParserOptions, SchemaPrototype<O, I, SchemaType, Type>> & {
        validators: Validators
      }
    >
  >,
  Schema<O, I, Args, SchemaPrototype<O, I, SchemaType, Type>>
>
export function basicSchemaCreator(options: {
  parser: (opts?: object) => (input: unknown, ...args: unknown[]) => SafeParseOutput<any>
  type: string
  schemaType: SchemaTypes
  validators: BaseValidatorLibrary
}): CreateSchema<any, any, any, any> {
  const { parser, type, schemaType, validators } = options
  return createCreateSchemaFunction(
    addDefaultCreateSchemaPrototype({
      type,
      schemaType,
      validators,
      getSchemaDefinitionFn(opts: object, partialBaseSchemaDef: BaseSchemaDefinition) {
        partialBaseSchemaDef.parser = parser(opts)
        return partialBaseSchemaDef
      },
      createSchemaPrototype: {} as any,
    }),
  )
}

type TypedPropertyDescriptor<T> = {
  enumerable?: boolean
  configurable?: boolean
} & (
  | {
      set?: (value: T) => void
    }
  | {
      get?: () => T
    }
  | {
      writable?: boolean
      value?: T
    }
)

type PropertyDescriptor = {
  enumerable?: boolean
  configurable?: boolean
} & (
  | {
      set?: (value: any) => void
    }
  | {
      get?: () => any
    }
  | {
      writable?: boolean
      value?: any
    }
)

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

export type CreateSchema<
  O,
  ParserOptions extends object,
  CreateSchemaProto extends object,
  SchemaProto extends BaseSchemaPrototype,
> = CreateSchemaProto & {
  (
    options?: ParserOptions & {
      validations?: ValidationFn<O>[] | BuilderValidations<O>
      breakOnFirstError?: boolean
    },
  ): SchemaProto
}

// export function createCreateSchemaFunction<
//   const T extends BaseSchemaCreatorDefinition,
//   S extends VInferBaseSchemaCreatorDefTypes = VInferBaseSchemaCreatorDef<T>,
//   O = S['output'],
//   CreateSchemaProto extends object = S['createSchemaPrototype'],
//   SchemaProto extends BaseSchemaPrototype = S['schemaPrototype'],
// >(createSchemaDef: T): CreateSchema<O, S['schemaCreatorOptions'], CreateSchemaProto, SchemaProto>
// export function createCreateSchemaFunction(
//   createSchemaDef: BaseSchemaCreatorDefinition,
// ): CreateSchema<any, any, any, any> {
//   const { type, getSchemaDefinitionFn: getSchemaDefFn, createSchemaPrototype } = createSchemaDef
//   function createSchemaFn(options: object): BaseSchema {
//     const tmpSchema = addDefaultSchemaProtoType({
//       breakOnFirstError: false,
//       ...options,
//       schemaCreatorDef: createSchemaDef,
//       type,
//       schemaProtoType: {},
//       parser: undefined,
//     })

//     const schemaDef = getSchemaDefFn(options, tmpSchema)

//     const { parser } = schemaDef
//     if (!('validations' in schemaDef) || schemaDef.validations === undefined)
//       return Object.setPrototypeOf(parser, schemaDef.schemaProtoType)

//     const validationFn = validate(
//       schemaDef as {
//         validations: ValidationFn<unknown>[] | Builder<ValidatorLibrary<unknown>>
//         breakOnFirstError?: boolean
//       },
//     )

//     function SafeParse(value, ...args): SafeParseOutput<unknown> {
//       const parsedOutput = parser(value, ...args)
//       if (isError(parsedOutput)) return parsedOutput
//       const validationErrors = validationFn(parsedOutput[1])
//       return validationErrors !== undefined
//         ? [{ input: value, errors: validationErrors }, undefined]
//         : parsedOutput
//     }
//     return Object.setPrototypeOf(SafeParse, schemaDef.schemaProtoType)
//   }
//   return Object.setPrototypeOf(createSchemaFn, createSchemaPrototype)
// }

export function createCreateSchemaFunction<
  const T extends BaseSchemaCreatorDefinition,
  S extends BaseVInferBaseSchemaCreatorDef = VInferBaseSchemaCreatorDef<T>,
>(
  createSchemaDef: T,
): CreateSchema<
  S['output'],
  S['schemaCreatorOptions'],
  S['createSchemaPrototype'],
  S['schemaPrototype']
>
export function createCreateSchemaFunction(
  createSchemaDef: BaseSchemaCreatorDefinition,
): CreateSchema<any, any, any, any> {
  const {
    type,
    getSchemaDefinitionFn: getSchemaDefFn,
    createSchemaPrototype,
    schemaType,
  } = createSchemaDef
  function createSchemaFn(options: object): BaseSchema {
    return createSchema(
      getSchemaDefFn(options, {
        breakOnFirstError: false,
        ...options,
        schemaPrototype: baseSchemaPrototype,
        type,
        schemaType,
        parser: undefined,
      }),
    )
  }
  return Object.setPrototypeOf(createSchemaFn, createSchemaPrototype)
}

export const definitionPropertyKey = Symbol('definition')

export const baseSchemaPrototype = {
  get type(): string {
    return this[definitionPropertyKey].type
  },

  get schemaType(): SchemaTypes {
    return this[definitionPropertyKey].schemaType
  },

  parse(input: any): any {
    return parse(this as any)(input)
  },

  toString(): string {
    return `schema:${this.schemaType}:${this.type}`
  },
}

export type SchemaDefinitionToSchema<
  T extends BaseSchemaDefinition,
  I extends BaseVInferBaseSchemaDefinition = VInferBaseSchemaDefinition<T>,
  SchemaProto extends BaseSchemaPrototype = [keyof T['schemaPrototype']] extends [never]
    ? SchemaPrototype<I['output'], I['input'], I['schemaType'], T['type']>
    : T['schemaPrototype'] & SchemaPrototype<I['output'], I['input'], I['schemaType'], T['type']>,
> = Schema<I['output'], I['input'], I['args'], SchemaProto>

export function createSchema<T extends BaseSchemaDefinition>(
  schemaDefinition: T,
): SchemaDefinitionToSchema<T>
export function createSchema(schemaDefinition: BaseSchemaDefinition): BaseSchema {
  const { parser, validations, schemaPrototype } = schemaDefinition
  let safeParser: BaseSafeParseFn
  if (validations === undefined) safeParser = parser
  else {
    const validationFn = validate(schemaDefinition as Required<BaseSchemaDefinition>)

    safeParser = function SafeParse(value, ...args): SafeParseOutput<unknown> {
      const parsedOutput = parser(value, ...args)
      if (isError(parsedOutput)) return parsedOutput
      const validationErrors = validationFn(parsedOutput[1])
      return validationErrors !== undefined
        ? [{ input: value, errors: validationErrors }, undefined]
        : parsedOutput
    }
  }

  Object.setPrototypeOf(safeParser, schemaPrototype)
  Object.defineProperty(safeParser, definitionPropertyKey, { value: schemaDefinition })
  return safeParser as BaseSchema
}
