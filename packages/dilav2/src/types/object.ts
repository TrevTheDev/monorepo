import { isError } from '@trevthedev/toolbelt'
import { Builder } from '../builder'
import { DefaultErrorFn } from '../errorFns'
import { parsers } from '../parsers/parsers'
import { PropertySchemasDef, ObjectDefToObjectType } from '../parsers/parse object properties'
import {
  Schema,
  SchemaPrototype,
  MinimumSchema,
  SafeParseFn,
  sharedSchemaProperties,
} from '../schema'
import {
  SharedCreateSchemaProperties,
  sharedCreateSchemaProperties,
  CreateSchema,
  schemaCreator,
} from '../schemaCreator'
import { ObjectValidations, ValidationFn, objectValidations } from '../validations/validations'
import { ObjectAllPropertiesOptions, vObjectAllProperties } from './object all properties'

interface VObjectSchemaRoot<O extends object = object, I extends object = object>
  extends Schema<O, I, [], SchemaPrototype<O, I, 'object', string>> {
  transformed?: boolean
}

interface VObjectSchema<O extends object = object, I extends object = object>
  extends VObjectSchemaRoot<O, I>,
    SharedCreateSchemaProperties<ObjectValidations<O>> {
  validations(
    validations?: Builder<ObjectValidations<O>> | ValidationFn<O>[],
  ): VObjectSchemaRoot<O, I>
  extends<S extends PropertySchemasDef, R extends MinimumSchema>(
    propertySchemas: S,
    unmatchedPropertiesSchema?: R,
  ): VObjectSchema<O & ObjectDefToObjectType<S>, O>
}

interface ObjectOptions<
  T extends PropertySchemasDef,
  UnmatchedPropertiesSchema extends MinimumSchema,
> extends ObjectAllPropertiesOptions<T, UnmatchedPropertiesSchema> {
  parseObjectError?: DefaultErrorFn['parseObjectError']
}

export type VObject<
  T extends PropertySchemasDef,
  UnmatchedPropertiesSchema extends MinimumSchema,
  I extends object = object,
  O extends object = [keyof I] extends [never]
    ? ObjectDefToObjectType<T>
    : I & ObjectDefToObjectType<T>,
> = (options?: ObjectOptions<T, UnmatchedPropertiesSchema>) => VObjectSchema<O, I>

export function vObject<
  T extends PropertySchemasDef,
  UnmatchedPropertiesSchema extends MinimumSchema,
  I extends object = object,
  O extends object = [keyof I] extends [never]
    ? ObjectDefToObjectType<T>
    : I & ObjectDefToObjectType<T>,
>(options: ObjectOptions<T, UnmatchedPropertiesSchema>): VObjectSchema<O, I> {
  const { breakOnFirstError } = options
  const objectParser = parsers.object(options)
  const propertyParser = vObjectAllProperties(options)
  const { transformed } = propertyParser

  const createParserFn: (...args: any[]) => SafeParseFn<any, any, any[]> = () =>
    function parser(input) {
      const result = objectParser(input)
      if (isError(result)) return result
      return propertyParser(input)
    }
  const schemaBaseObj = {
    get type() {
      return propertyParser.type
    },
    schemaType: 'object' as const,
  }
  const schemaPrototype = sharedSchemaProperties(schemaBaseObj)
  if (transformed) {
    Object.defineProperty(schemaPrototype, 'transformed', {
      get() {
        return true
      },
    })
  }

  const createSchemaPrototype = Object.defineProperties(
    sharedCreateSchemaProperties({
      validators: objectValidations,
      baseObject: Object.create(schemaPrototype),
    }),
    {
      validations: {
        value(
          validations: Exclude<
            Exclude<Parameters<typeof baseSchemaObj>[0], undefined>['validations'],
            undefined
          >,
        ) {
          return baseSchemaObj({
            validations,
            breakOnFirstError,
          } as any)
        },
      },
      extends: {
        value(extendedPropertySchemas: PropertySchemasDef) {
          return propertyParser.extends(extendedPropertySchemas)
        },
      },
    },
  )

  const baseSchemaObj: CreateSchema<
    O,
    I,
    [],
    Exclude<ObjectOptions<T, UnmatchedPropertiesSchema>, 'propertySchema'>,
    object,
    SchemaPrototype<object, unknown, 'object', string>
  > = schemaCreator({
    createParserFn,
    createSchemaPrototype: {},
    schemaPrototype: createSchemaPrototype as SchemaPrototype<object, unknown, 'object', string>,
  })
  const defaultObjectSchema = baseSchemaObj({ validations: [], breakOnFirstError } as any)
  return Object.setPrototypeOf(
    function SchemaObjFn(value) {
      return defaultObjectSchema(value)
    } as VObjectSchema<O, I>,
    createSchemaPrototype,
  )
}
