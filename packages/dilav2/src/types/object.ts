/* eslint-disable @typescript-eslint/no-explicit-any */
import { KeysMatching, isError } from '@trevthedev/toolbelt'
import { PropertySchemasDef, ObjectDefToObjectType } from '../parsers/parse object properties'
import parseUnmatchedKeys, {
  ParseUnmatchedKeysOptions,
} from '../parsers/parse unmatched properties'
import { MinimumSchema, SafeParseOutput, BasicSchema2 } from '../shared/schema'
import { isNeverSchema } from '../shared/shared'
import {
  ObjectKnownPropertiesOptions,
  VObjectKnownPropertiesSchema,
  vObjectKnownProperties,
} from './object known properties'
import { CustomValidations, customValidations } from '../validations/validations'
import { createBasicSchema2 } from '../shared/schema creator'
import { DefaultErrorFn } from '../shared/errorFns'
import { vObject as vObjectTypeOf, type VObject as VObjectTypeOf } from './typeof'
import { VInfer } from '../shared/infer'

interface VObjectAllPropertiesSchema<
  O extends object,
  I extends object,
  Transformed extends boolean,
> extends BasicSchema2<{
    output: O
    input: I
    args: []
    schemaType: 'object'
    type: string
    validators: ObjectValidations<O>
  }> {
  extends<S extends PropertySchemasDef, R extends MinimumSchema>(
    propertySchemas: S,
    unmatchedPropertiesSchema?: R,
  ): VObjectAllPropertiesSchema<O & ObjectDefToObjectType<S>, O, Transformed>
  readonly transformed: Transformed
}

interface ObjectAllPropertiesOptions<
  T extends PropertySchemasDef,
  UnmatchedPropertiesSchema extends MinimumSchema,
> extends Omit<ParseUnmatchedKeysOptions<UnmatchedPropertiesSchema>, 'matchedKeys'>,
    ObjectKnownPropertiesOptions<T> {}

function parseThroughParser(input: object, newObj?: object) {
  return [undefined, newObj ?? input] as unknown as SafeParseOutput<object>
}
Object.defineProperties(parseThroughParser, {
  validatedProperties: { value: [] },
  transformed: { value: false },
})

export type VObjectAllProperties<
  T extends PropertySchemasDef,
  UnmatchedPropertiesSchema extends MinimumSchema,
  Transformed extends boolean = false,
  I extends object = object,
  O extends object = [keyof I] extends [never]
    ? ObjectDefToObjectType<T>
    : I & ObjectDefToObjectType<T>,
> = (
  options?: ObjectAllPropertiesOptions<T, UnmatchedPropertiesSchema>,
) => VObjectAllPropertiesSchema<O, I, Transformed>

export type ObjectValidations<O extends object> = CustomValidations<O>
interface VObject<O extends object = object>
  extends BasicSchema2<{
    output: O
    input: unknown
    args: []
    schemaType: 'object'
    type: string
    validators: ObjectValidations<O>
  }> {
  extends<S extends PropertySchemasDef, R extends MinimumSchema>(
    propertySchemas: S,
    unmatchedPropertiesSchema?: R,
  ): VObject<O & ObjectDefToObjectType<S>>
}

export type VObjectFn = typeof vObject

export type MustTransform<T extends PropertySchemasDef> = [
  KeysMatching<T, { readonly transformed: true }>,
] extends [never]
  ? false
  : true

export function vObject<
  T extends PropertySchemasDef,
  O extends object = ObjectDefToObjectType<T>,
>(options: {
  propertySchemas: T
  unmatchedPropertiesSchema: MinimumSchema
  parseObjectError?: DefaultErrorFn['parseObjectError']
  missingPropertyError?: DefaultErrorFn['missingPropertyError']
  breakOnFirstError?: boolean
}): VObject<O>
export function vObject<
  T extends PropertySchemasDef,
  O extends object = ObjectDefToObjectType<T>,
>(options: {
  propertySchemas: T
  parseObjectError?: DefaultErrorFn['parseObjectError']
  missingPropertyError?: DefaultErrorFn['missingPropertyError']
  breakOnFirstError?: boolean
}): VObjectKnownPropertiesSchema<O, unknown, MustTransform<T>>
export function vObject<T extends MinimumSchema>(options: {
  unmatchedPropertiesSchema: T
  parseObjectError?: DefaultErrorFn['parseObjectError']
  // missingPropertyError?: DefaultErrorFn['missingPropertyError']
  breakOnFirstError?: boolean
}): BasicSchema2<{
  output: { [P in PropertyKey]: VInfer<T>['output'] }
  input: unknown
  args: []
  schemaType: 'object index signature'
  type: string
  validators: CustomValidations<{ [P in PropertyKey]: VInfer<T>['output'] }>
}>
export function vObject(options?: {
  parseObjectError?: DefaultErrorFn['parseObjectError']
  breakOnFirstError?: boolean
}): VObjectTypeOf
export function vObject(
  options: {
    propertySchemas?: PropertySchemasDef
    unmatchedPropertiesSchema?: MinimumSchema
    parseObjectError?: DefaultErrorFn['parseObjectError']
    missingPropertyError?: DefaultErrorFn['missingPropertyError']
    typePrefix?: string
    transform?: boolean
    upStreamPropertySchemaKeys?: PropertyKey[]
    breakOnFirstError?: boolean
    // matchedKeys?: PropertyKey[]
  } = {},
): MinimumSchema {
  const { unmatchedPropertiesSchema, propertySchemas, breakOnFirstError = false } = options
  const objectTypeOfParser = vObjectTypeOf.custom(options)

  if (unmatchedPropertiesSchema !== undefined && propertySchemas !== undefined) {
    const propertyParser = vObjectKnownProperties(options as any)
    const unmatchedParser = parseUnmatchedKeys({
      matchedKeys: propertyParser.validatedProperties,
      unmatchedPropertiesSchema,
      breakOnFirstError,
    })

    const { transformed } = propertyParser
    const type = isNeverSchema(unmatchedPropertiesSchema)
      ? propertyParser.type
      : `${propertyParser.type} & { [P: PropertyKey]: ${unmatchedPropertiesSchema.type} }`

    // eslint-disable-next-line no-inner-declarations
    function parser(input: object): SafeParseOutput<object> {
      const result = objectTypeOfParser(input)
      if (isError(result)) return result
      const result1 = propertyParser(input)
      if (isError(result1)) return result1
      return transformed ? unmatchedParser(input, result1[1]) : unmatchedParser(input)
    }

    const objSchema = createBasicSchema2({
      schemaType: 'object' as const,
      type,
      parser,
      validators: customValidations<object>(),
    })

    Object.defineProperties(objSchema, {
      transformed: {
        get() {
          return transformed
        },
      },
    })
    return objSchema
  }
  if (propertySchemas !== undefined) {
    return vObjectKnownProperties({ ...options, objectTypeOfParser } as any)
  }
  if (unmatchedPropertiesSchema !== undefined) {
    const unmatchedParser = parseUnmatchedKeys({
      matchedKeys: [],
      unmatchedPropertiesSchema,
      breakOnFirstError,
    })
    // eslint-disable-next-line no-inner-declarations
    function parser(input: object): SafeParseOutput<object> {
      const result = objectTypeOfParser(input)
      if (isError(result)) return result
      return unmatchedParser(input)
    }
    const type = `{ [P: PropertyKey]: ${unmatchedPropertiesSchema.type} }`
    const objSchema = createBasicSchema2({
      schemaType: 'object index signature' as const,
      type,
      parser,
      validators: customValidations<object>(),
    })
    return objSchema
  }
  return objectTypeOfParser
}
