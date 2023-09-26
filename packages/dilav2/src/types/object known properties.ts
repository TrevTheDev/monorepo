import { Builder } from '../builder'
import { DefaultErrorFn } from '../errorFns'
import { parsers } from '../parsers/parsers'
import {
  PropertySchemasDef,
  ObjectDefToObjectType,
  allKeys,
} from '../parsers/parse object properties'
import { Schema, SchemaPrototype, MinimumSchema, SafeParseFn } from '../schema'

import { isOptionalSchema, unwrappedSchema, isTransformed } from '../shared'
import { ObjectValidations, ValidationFn, objectValidations } from '../validations/validations'

interface VObjectKnownPropertiesSchemaRoot<O extends object = object, I extends object = object>
  extends Schema<O, I, [], SchemaPrototype<O, I, 'object known properties', string>> {
  transformed?: boolean
}

interface VObjectKnownPropertiesSchema<O extends object = object, I extends object = object>
  extends VObjectKnownPropertiesSchemaRoot<O, I>,
    SharedCreateSchemaProperties<ObjectValidations<O>> {
  validations(
    validations?: Builder<ObjectValidations<O>> | ValidationFn<O>[],
  ): VObjectKnownPropertiesSchemaRoot<O, I>
  extends<S extends PropertySchemasDef>(
    propertySchemas: S,
  ): VObjectKnownPropertiesSchema<O & ObjectDefToObjectType<S>, O>
  readonly validatedProperties: (keyof O)[]
}

export type ObjectKnownPropertiesOptions<T extends PropertySchemasDef> = {
  propertySchemas: T
  missingPropertyError?: DefaultErrorFn['missingPropertyError']
  typePrefix?: string
  transform?: boolean
  upStreamPropertySchemaKeys?: PropertyKey[]
  breakOnFirstError?: boolean
}

export type VObjectKnownProperties<
  T extends PropertySchemasDef,
  I extends object = object,
  O extends object = [keyof I] extends [never]
    ? ObjectDefToObjectType<T>
    : I & ObjectDefToObjectType<T>,
> = (options?: ObjectKnownPropertiesOptions<T>) => VObjectKnownPropertiesSchema<O, I>

export function vObjectKnownProperties<
  T extends PropertySchemasDef,
  I extends object = object,
  O extends object = [keyof I] extends [never]
    ? ObjectDefToObjectType<T>
    : I & ObjectDefToObjectType<T>,
>(options: ObjectKnownPropertiesOptions<T>): VObjectKnownPropertiesSchema<O, I> {
  const {
    propertySchemas,
    missingPropertyError,
    breakOnFirstError = false,
    typePrefix,
    transform = false,
    upStreamPropertySchemaKeys = [],
    // validatedPropertySchemaKeys = [],
  } = options

  const propertySchemaKeys = allKeys(propertySchemas)
  let type = `${typePrefix ? `${typePrefix}&` : ''}{`
  let middleType = ''
  let transformed = transform
  for (const key of propertySchemaKeys) {
    const schema = propertySchemas[key] as MinimumSchema
    middleType += isOptionalSchema(schema)
      ? `${String(key)}?: ${unwrappedSchema(schema).type}, `
      : `${String(key)}: ${schema.type}, `

    if (isTransformed(schema)) transformed = true
  }
  type = `${typePrefix ? `${typePrefix} & ` : ''}{ ${middleType.slice(0, -2)} }`

  const baseParser = parsers.objectProperties({
    propertySchemas,
    missingPropertyError,
    propertySchemaKeys,
    breakOnFirstError,
  })
  const parser = transformed ? (input, newObject = {}) => baseParser(input, newObject) : baseParser

  const createParserFn: (...args: any[]) => SafeParseFn<any, any, any[]> = () => parser

  const schemaPrototype = sharedSchemaProperties<
    object,
    unknown,
    'object known properties',
    string
  >({
    type,
    schemaType: 'object known properties',
  })
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
      validatedProperties: {
        get() {
          return [...upStreamPropertySchemaKeys, ...propertySchemaKeys]
        },
      },
      extends: {
        value(extendedPropertySchemas: PropertySchemasDef) {
          return vObjectKnownProperties({
            propertySchemas: extendedPropertySchemas,
            missingPropertyError: missingPropertyError as unknown as any,
            breakOnFirstError,
            typePrefix: type,
            transform: transformed,
            upStreamPropertySchemaKeys: this.validatedProperties,
          })
        },
      },
    },
  )

  // type opts = Omit<ObjectPropertiesOptions<T>, 'propertySchemas'>

  const baseSchemaObj: CreateSchema<
    O,
    I,
    [],
    Exclude<ObjectKnownPropertiesOptions<T>, 'propertySchema'>,
    object,
    SchemaPrototype<object, unknown, 'object known properties', string>
  > = schemaCreator({
    createParserFn,
    createSchemaPrototype: {},
    schemaPrototype: createSchemaPrototype as SchemaPrototype<
      object,
      unknown,
      'object known properties',
      string
    >,
  })
  const defaultObjectSchema = baseSchemaObj({ validations: [], breakOnFirstError } as any)
  return Object.setPrototypeOf(
    function SchemaObjFn(value) {
      return defaultObjectSchema(value)
    } as VObjectKnownPropertiesSchema<O, I>,
    createSchemaPrototype,
  )
}
