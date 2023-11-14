import { Identity, Or, RMerge, isError } from '@trevthedev/toolbelt'
import {
  PropertySchemasDef,
  ObjectDefToObjectType,
  allKeys,
  parseObjectProperties,
} from '../parsers/parse object properties'
import { DefaultErrorFn } from '../shared/errorFns'
import { BasicSchema2, MinimumSchema } from '../shared/schema'
import { createBasicSchema2 } from '../shared/schema creator'
import { isOptionalSchema, isTransformed, unwrappedSchema } from '../shared/shared'
import { CustomValidations, customValidations } from '../validations/validations'
import { type MustTransform } from './object'

type ObjectValidatorLibrary<O> = CustomValidations<O>

export interface VObjectKnownPropertiesSchema<
  O extends object,
  I,
  Transformed extends boolean,
  PriorO extends object = object,
  KeysIncluded extends keyof O = keyof O,
> extends BasicSchema2<{
    output: O
    input: I
    args: []
    schemaType: 'object known properties'
    type: string
    validators: ObjectValidatorLibrary<O>
  }> {
  extends<S extends PropertySchemasDef>(
    propertySchemas: S,
  ): VObjectKnownPropertiesSchema<
    O & ObjectDefToObjectType<S>,
    O & { [P in PropertyKey]: unknown },
    Or<Transformed, MustTransform<S>>,
    O,
    keyof S
  >
  merge<S extends PropertySchemasDef>(
    propertySchemas: S,
  ): VObjectKnownPropertiesSchema<
    RMerge<[O, ObjectDefToObjectType<S>]>,
    I,
    Or<Transformed, MustTransform<S>>,
    O,
    keyof S | KeysIncluded
  >
  pick<const S extends [KeysIncluded, ...KeysIncluded[]]>(
    ...S
  ): VObjectKnownPropertiesSchema<PriorO & Pick<O, S[number]>, I, Transformed, PriorO, S[number]>
  omit<const S extends [KeysIncluded, ...KeysIncluded[]]>(
    ...S
  ): VObjectKnownPropertiesSchema<
    PriorO & Omit<O, S[number]>,
    I,
    Transformed,
    PriorO,
    Exclude<KeysIncluded, S[number]>
  >
  readonly validatedProperties: (keyof O)[]
  readonly transformed: Transformed
}

export type ObjectKnownPropertiesOptions<
  T extends PropertySchemasDef,
  Transformed extends boolean = boolean,
> = {
  propertySchemas: T
  missingPropertyError?: DefaultErrorFn['missingPropertyError']
  typePrefix?: string
  transform?: Transformed
  upStreamPropertySchemaKeys?: PropertyKey[]
  breakOnFirstError?: boolean
  objectTypeOfParser?: MinimumSchema
}

// export type VObjectKnownProperties<
//   T extends PropertySchemasDef,
//   Transformed extends boolean,
//   I,
//   O extends object = [keyof I] extends [never]
//     ? ObjectDefToObjectType<T>
//     : I & ObjectDefToObjectType<T>,
// > = (
//   options?: ObjectKnownPropertiesOptions<T, Transformed>,
// ) => VObjectKnownPropertiesSchema<O, I, Transformed>

export function vObjectKnownProperties<
  T extends PropertySchemasDef,
  Transformed extends boolean,
  I,
  O extends object = [keyof I] extends [never]
    ? ObjectDefToObjectType<T>
    : I & ObjectDefToObjectType<T>,
>(
  options: ObjectKnownPropertiesOptions<T, Transformed>,
): VObjectKnownPropertiesSchema<O, I, Transformed>
export function vObjectKnownProperties<
  T extends PropertySchemasDef,
  Transformed extends boolean,
  O extends object = ObjectDefToObjectType<T>,
>(options: {
  propertySchemas: T
  objectTypeOfParser: MinimumSchema
  missingPropertyError?: DefaultErrorFn['missingPropertyError']
  breakOnFirstError?: boolean
}): VObjectKnownPropertiesSchema<O, unknown, Transformed>
export function vObjectKnownProperties<
  T extends PropertySchemasDef,
  Transformed extends boolean,
  I extends object,
  O extends object = I & ObjectDefToObjectType<T>,
>(options: {
  propertySchemas: T
  missingPropertyError?: DefaultErrorFn['missingPropertyError']
  typePrefix?: string
  transform?: boolean
  upStreamPropertySchemaKeys?: PropertyKey[]
  breakOnFirstError?: boolean
}): VObjectKnownPropertiesSchema<O, I, Transformed>
export function vObjectKnownProperties(options: {
  propertySchemas: PropertySchemasDef
  missingPropertyError?: DefaultErrorFn['missingPropertyError']
  typePrefix?: string
  transform?: boolean
  upStreamPropertySchemaKeys?: PropertyKey[]
  breakOnFirstError?: boolean
  objectTypeOfParser?: MinimumSchema
}): MinimumSchema {
  const {
    propertySchemas,
    missingPropertyError,
    breakOnFirstError = false,
    typePrefix,
    transform = false,
    upStreamPropertySchemaKeys = [],
    objectTypeOfParser,
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

  const baseParser = parseObjectProperties({
    propertySchemas,
    missingPropertyError,
    propertySchemaKeys,
    breakOnFirstError,
  })
  // const parser = transformed ? (input, newObject = {}) => baseParser(input, newObject) : baseParser
  let parser
  if (objectTypeOfParser) {
    parser = function parserT1(input: unknown, newObject?: object) {
      const result = objectTypeOfParser(input)
      if (isError(result)) return result
      return baseParser(input as object, transformed ? newObject ?? {} : newObject)
    }
  } else {
    parser = function parserT2(input: object, newObject?: object) {
      return transformed ? baseParser(input, newObject ?? {}) : baseParser(input, newObject)
    }
  }

  const objSchema = createBasicSchema2({
    schemaType: 'object known properties' as const,
    type,
    parser,
    validators: customValidations(),
  })

  Object.defineProperties(objSchema, {
    validatedProperties: {
      get() {
        return [...upStreamPropertySchemaKeys, ...propertySchemaKeys]
      },
    },
    extends: {
      value(extendedPropertySchemas: PropertySchemasDef) {
        return vObjectKnownProperties({
          propertySchemas: extendedPropertySchemas,
          missingPropertyError: missingPropertyError as DefaultErrorFn['missingPropertyError'],
          breakOnFirstError,
          typePrefix: type,
          transform: transformed,
          upStreamPropertySchemaKeys: this.validatedProperties,
        })
      },
    },
    merge: {
      value(additionalPropertySchemas: PropertySchemasDef) {
        return vObjectKnownProperties({
          propertySchemas: { ...propertySchemas, ...additionalPropertySchemas },
          missingPropertyError: missingPropertyError as DefaultErrorFn['missingPropertyError'],
          breakOnFirstError,
          typePrefix: typePrefix as string,
          transform: transformed,
          upStreamPropertySchemaKeys,
        })
      },
    },
    pick: {
      value(...keys: PropertyKey[]) {
        const newPropertySchemas = Object.fromEntries(
          Object.entries(propertySchemas).filter(([key]) => keys.includes(key)),
        )
        return vObjectKnownProperties({
          propertySchemas: newPropertySchemas,
          missingPropertyError: missingPropertyError as DefaultErrorFn['missingPropertyError'],
          breakOnFirstError,
          typePrefix: typePrefix as string,
          transform: transformed,
          upStreamPropertySchemaKeys,
        })
      },
    },
    transformed: {
      get() {
        return transformed
      },
    },
  })

  return objSchema
}
