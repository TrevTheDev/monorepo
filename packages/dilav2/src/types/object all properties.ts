import { isError } from '@trevthedev/toolbelt'
import { Builder } from '../builder'
import { SafeParseOutput, parsers } from '../parsers/parsers'
import { PropertySchemasDef, ObjectDefToObjectType } from '../parsers/parse object properties'
import { Schema, SchemaPrototype, MinimumSchema, SafeParseFn } from '../schema'
import {
  SharedCreateSchemaProperties,
  sharedCreateSchemaProperties,
  CreateSchema,
  schemaCreator,
} from '../schemaCreator'
import { isNeverSchema } from '../shared'
import { ObjectValidations, ValidationFn, objectValidations } from '../validations/validations'
import { ObjectKnownPropertiesOptions, vObjectKnownProperties } from './object known properties'
import { ParseUnmatchedKeysOptions } from '../parsers/parse unmatched properties'

interface VObjectAllPropertiesSchemaRoot<O extends object = object, I extends object = object>
  extends Schema<O, I, [], SchemaPrototype<O, I, 'object', string>> {
  transformed?: boolean
}

interface VObjectAllPropertiesSchema<O extends object = object, I extends object = object>
  extends VObjectAllPropertiesSchemaRoot<O, I>,
    SharedCreateSchemaProperties<ObjectValidations<O>> {
  validations(
    validations?: Builder<ObjectValidations<O>> | ValidationFn<O>[],
  ): VObjectAllPropertiesSchemaRoot<O, I>
  extends<S extends PropertySchemasDef, R extends MinimumSchema>(
    propertySchemas: S,
    unmatchedPropertiesSchema?: R,
  ): VObjectAllPropertiesSchema<O & ObjectDefToObjectType<S>, O>
}

export interface ObjectAllPropertiesOptions<
  T extends PropertySchemasDef,
  UnmatchedPropertiesSchema extends MinimumSchema,
> extends Omit<ParseUnmatchedKeysOptions<UnmatchedPropertiesSchema>, 'matchedKeys'>,
    ObjectKnownPropertiesOptions<T> {}

function noopUnmatchedPropertiesParse(input: object, newObj?: object) {
  return [undefined, newObj ?? input] as unknown as SafeParseOutput<object>
}

export type VObjectAllProperties<
  T extends PropertySchemasDef,
  UnmatchedPropertiesSchema extends MinimumSchema,
  I extends object = object,
  O extends object = [keyof I] extends [never]
    ? ObjectDefToObjectType<T>
    : I & ObjectDefToObjectType<T>,
> = (
  options?: ObjectAllPropertiesOptions<T, UnmatchedPropertiesSchema>,
) => VObjectAllPropertiesSchema<O, I>

export function vObjectAllProperties<
  T extends PropertySchemasDef,
  UnmatchedPropertiesSchema extends MinimumSchema,
  I extends object = object,
  O extends object = [keyof I] extends [never]
    ? ObjectDefToObjectType<T>
    : I & ObjectDefToObjectType<T>,
>(
  options: ObjectAllPropertiesOptions<T, UnmatchedPropertiesSchema>,
): VObjectAllPropertiesSchema<O, I> {
  const { unmatchedPropertiesSchema, breakOnFirstError = false } = options

  const propertyParser = vObjectKnownProperties(options)
  let unmatchedParser =
    unmatchedPropertiesSchema === undefined
      ? noopUnmatchedPropertiesParse
      : parsers.unmatchedKeys({
          matchedKeys: propertyParser.validatedProperties,
          unmatchedPropertiesSchema,
          breakOnFirstError,
        })

  const { transformed = false } = propertyParser
  const type =
    unmatchedPropertiesSchema && isNeverSchema(unmatchedPropertiesSchema)
      ? propertyParser.type
      : `${propertyParser.type} & { [P: PropertyKey]: ${unmatchedPropertiesSchema.type} }`

  const createParserFn: (...args: any[]) => SafeParseFn<any, any, any[]> = () =>
    function parser(input): SafeParseOutput<object> {
      const result1 = propertyParser(input)
      if (isError(result1)) return result1
      return transformed ? unmatchedParser(input, result1[1]) : unmatchedParser(input)
    }

  const schemaBaseObj = {
    type,
    schemaType: 'object all properties' as const,
  }

  const schemaPrototype = sharedSchemaProperties<object, unknown, 'object all properties', string>(
    schemaBaseObj,
  )
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
      extends: {
        value(extendedPropertySchemas: PropertySchemasDef) {
          unmatchedParser = noopUnmatchedPropertiesParse
          schemaBaseObj.type = propertyParser.type
          return vObjectAllProperties({
            propertySchemas: extendedPropertySchemas,
            unmatchedPropertiesSchema,
            missingPropertyError: options.missingPropertyError as unknown as any,
            breakOnFirstError,
            typePrefix: propertyParser.type,
            transform: transformed,
            upStreamPropertySchemaKeys: propertyParser.validatedProperties,
          })
        },
      },
    },
  )

  const baseSchemaObj: CreateSchema<
    O,
    I,
    [],
    Exclude<ObjectAllPropertiesOptions<T, UnmatchedPropertiesSchema>, 'propertySchema'>,
    object,
    SchemaPrototype<object, unknown, 'object all properties', string>
  > = schemaCreator({
    createParserFn,
    createSchemaPrototype: {},
    schemaPrototype: createSchemaPrototype as SchemaPrototype<
      object,
      unknown,
      'object all properties',
      string
    >,
  })
  const defaultObjectSchema = baseSchemaObj({ validations: [], breakOnFirstError } as any)
  return Object.setPrototypeOf(
    function SchemaObjFn(value) {
      return defaultObjectSchema(value)
    } as VObjectAllPropertiesSchema<O, I>,
    createSchemaPrototype,
  )
}
