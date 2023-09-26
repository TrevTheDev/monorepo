/* eslint-disable no-restricted-syntax */
import { difference, isError } from '../toolbelt'
import type { DeepWriteable } from '../toolbelt'
import { deepPartial, isObjectType, isOptional, isTransformed, optional, required } from './shared'
import { createFinalBaseObject } from './base'
import {
  MinimumObjectSchema,
  MinimumObjectDefinition,
  MinimumSchema,
  ObjectDefToObjectType,
  PropertySchemasDef,
  SingleValidationError,
  VNever,
  VObject,
  VOptional,
  VUnknown,
  defaultErrorFnSym,
  parserObject,
  SafeParseFn,
  SafeParseOutput,
  MinimumPartialObjectSchema,
  VPartialObject,
  MinimumPartialObjectDefinition,
  VInfer,
} from './types'

import { createValidationBuilder } from './base validations'
import defaultErrorFn, { DefaultErrorFn } from './errorFns'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * types
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export type SingleObjectValidationError = [key: PropertyKey, errors: SingleValidationError[]]

let errorFns = defaultErrorFn

type ObjectErrorOptions = {
  invalidObjectFn: DefaultErrorFn['parseObject']
  invalidObjectPropertiesFn: DefaultErrorFn['invalidObjectPropertiesFn']
  missingProperty: DefaultErrorFn['missingProperty']
  missingPropertyInDef: DefaultErrorFn['missingPropertyInDef']
}

// type ParseObjectErrorMessageFns = Pick<
//   ObjectErrorOptions,
//   'invalidObjectFn' | 'missingProperty' | 'invalidObjectPropertiesFn'
// >

// type ObjectParserFn<T extends object> = (value: unknown) => SafeParseOutput<T>

// export type ObjectOptions<T extends object = object> = Partial<ObjectErrorOptions> & {
//   type: string
// } & ({ parser?: ObjectParserFn<T> } | { transformObject?: true })

// type FlattenedObjectOptions<T extends object = object> = FlattenObjectUnion<ParseObjectOptions<T>>

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export function allKeys(propertySchemas: object) {
  return [...Object.keys(propertySchemas), ...Object.getOwnPropertySymbols(propertySchemas)]
}

function objectValidationErrorsToValidationErrors(
  errors: SingleObjectValidationError[],
): SingleValidationError[] {
  const newErrors = [] as SingleValidationError[]
  for (const error of errors) newErrors.push(`${String(error[0])}: ${error[1]}`)
  return newErrors
}

interface SafeParseObjectFn<Output> extends SafeParseFn<Output, object> {
  (input: object, newObject?: object): SafeParseOutput<Output>
}

export function parsePropertySchemas<
  T extends PropertySchemasDef,
  Output extends object = ObjectDefToObjectType<T, VUnknown>,
>(
  propertySchemas: T,
  options: {
    missingProperty?: DefaultErrorFn['missingProperty']
    propertySchemaKeys?: PropertyKey[]
    breakOnFirstError?: boolean
  } = {},
): SafeParseObjectFn<Output> {
  const definedKeys = options.propertySchemaKeys ?? allKeys(propertySchemas)

  return function ParsePartialObjectFn(value: object, newObject?: object): SafeParseOutput<Output> {
    const propertyErrors = [] as SingleObjectValidationError[]

    for (const key of definedKeys) {
      const schema = propertySchemas[key] as MinimumSchema
      if (key in value || newObject) {
        const result = schema.safeParse(value[key])
        if (result[0] !== undefined) {
          propertyErrors.push([key, result[0].errors])
          if (options.breakOnFirstError) break
        } else if (newObject) {
          Object.defineProperty(newObject, key, {
            value: result[1],
            enumerable: true,
            configurable: false,
            writable: false,
          })
        }
      } else if (!isOptional(schema) && schema.baseType !== 'never') {
        propertyErrors.push([
          key,
          [(options.missingProperty ?? errorFns.missingProperty)(value, key)],
        ])
      }
    }
    const errors: SingleValidationError[] | undefined =
      propertyErrors.length !== 0
        ? objectValidationErrorsToValidationErrors(propertyErrors)
        : undefined

    return errors === undefined
      ? [undefined, (newObject ?? value) as Output]
      : [{ input: value, errors }, undefined]
  }
}

export function parseUnmatchedKeys(
  matchedKeys: PropertyKey[],
  unmatchedPropSchema: MinimumSchema,
): SafeParseObjectFn<object> {
  return function ParseExtraKeysFn(value: object, newObject?: object): SafeParseOutput<object> {
    const errors = [] as SingleObjectValidationError[]

    const unmatchedKeys = difference(allKeys(value), matchedKeys)

    for (const unmatchedKey of unmatchedKeys) {
      const result = unmatchedPropSchema.safeParse(value[unmatchedKey])
      if (isError(result)) errors.push([unmatchedKey, result[0].errors])
      else if (newObject !== undefined) {
        Object.defineProperty(newObject, unmatchedKey, {
          value: result[1],
          enumerable: true,
          configurable: false,
          writable: false,
        })
      }
    }

    return errors.length === 0
      ? [undefined, newObject ?? value]
      : [{ input: value as unknown, errors: objectValidationErrorsToValidationErrors(errors) }]
  }
}

type MetaArray<
  T extends { transformObject?: boolean; type?: string } = {
    transformObject: boolean
    type: string
  },
> = [
  finalOptions: T & { transformObject: boolean; type: string; propertySchemaKeys: PropertyKey[] },
  allKeys: PropertyKey[],
]

function metaObjectDefinition<T extends { transformObject?: boolean; type?: string }>(
  propertySchemas: PropertySchemasDef,
  unmatchedPropertySchema: MinimumSchema,
  options: T,
): MetaArray<T> {
  let transformed = false
  const typeStrings = [] as string[]
  const definedKeys = allKeys(propertySchemas)
  for (const key of definedKeys) {
    const schema = propertySchemas[key] as MinimumSchema
    typeStrings.push(
      isOptional(schema)
        ? `${String(key)}?:${(schema as VOptional<MinimumSchema>).definition.wrappedSchema.type}`
        : `${String(key)}:${schema.type}`,
    )
    if (isTransformed(schema)) transformed = true
  }
  const t1 = `{${typeStrings}}`
  const typeString =
    unmatchedPropertySchema.type === 'never'
      ? t1
      : `${t1}&{[K in PropertyKey]: ${unmatchedPropertySchema.type}}`
  return [
    {
      ...options,
      transformObject: options.transformObject ?? transformed,
      propertySchemaKeys: definedKeys,
      type: options.type ?? typeString,
    },
    definedKeys,
    // typeString,
    // transformed,
  ]
}

function getAllPropertySchemas(
  obj: MinimumObjectSchema | MinimumPartialObjectSchema,
): PropertySchemasDef {
  const parent =
    'parentSchema' in obj.definition
      ? getAllPropertySchemas(obj.definition.parentSchema as MinimumObjectSchema)
      : {}
  return { ...parent, ...obj.definition.propertySchemas }
}

type MetaArray2<
  T extends { transformObject?: boolean; type?: string } = {
    transformObject: boolean
    type: string
  },
> = [
  finalOptions: T & { transformObject?: true; type: string; propertySchemaKeys: PropertyKey[] },
  allKeys: PropertyKey[],
]

function metaObjectDefinition2<
  T extends {
    transformObject?: true
    type?: string
    parentSchema?: MinimumObjectSchema | MinimumPartialObjectSchema
  },
>(propertySchemas: PropertySchemasDef, options: T): MetaArray2<T> {
  let transformed = false
  const typeStrings = [] as string[]
  const parent = 'parentSchema' in options ? getAllPropertySchemas(options.parentSchema) : {}
  const allPropertySchemas = { ...propertySchemas, ...parent }
  const propertySchemasKeys = allKeys(propertySchemas)
  const definedKeys = allKeys(allPropertySchemas)
  for (const key of definedKeys) {
    const schema = allPropertySchemas[key] as MinimumSchema
    typeStrings.push(
      isOptional(schema)
        ? `${String(key)}?:${(schema as VOptional<MinimumSchema>).definition.wrappedSchema.type}`
        : `${String(key)}:${schema.type}`,
    )
    if (isTransformed(schema)) transformed = true
  }
  return [
    {
      ...options,
      transformObject: options.transformObject ?? transformed,
      propertySchemaKeys: propertySchemasKeys,
      type: options.type ?? `{${typeStrings}}`,
    },
    definedKeys,
  ]
}

interface ParseObjectOptions extends Partial<ObjectErrorOptions> {
  type?: string
  transformObject?: true
  breakOnFirstError?: boolean
}

interface ExtentsObjectOptions extends ParseObjectOptions {
  splitParse?: true
}

interface ObjectOptions<Output extends object> extends ParseObjectOptions {
  parser?: SafeParseFn<Output>
}

// interface FullObjectDefinition extends MinimumObjectDefinition {
//   options: ParseObjectOptions
// }

export function parseObject<
  T extends {
    propertySchemas: PropertySchemasDef
    unmatchedPropertySchema: MinimumSchema
  },
  Output extends object = ObjectDefToObjectType<T['propertySchemas'], T['unmatchedPropertySchema']>,
>(
  objectDefinition: T,
  options?: ParseObjectOptions,
  _metaArray?: MetaArray<ParseObjectOptions>,
): SafeParseFn<Output> {
  const { propertySchemas, unmatchedPropertySchema } = objectDefinition

  const [finalOptions, definedKeys] =
    _metaArray ?? metaObjectDefinition(propertySchemas, unmatchedPropertySchema, options ?? {})

  const parsePropertySchemasFn = parsePropertySchemas(propertySchemas, finalOptions)
  const parseUnmatchedKeysFn = parseUnmatchedKeys(
    definedKeys,
    objectDefinition.unmatchedPropertySchema,
  )
  return function ParseObjectFn(value: unknown): SafeParseOutput<Output> {
    if (isObjectType(value)) {
      const newObject = finalOptions.transformObject ? {} : undefined
      const parsePropertySchemasFnResult = parsePropertySchemasFn(value, newObject)
      const parseUnmatchedKeysFnResult = parseUnmatchedKeysFn(value, newObject)
      if (isError(parsePropertySchemasFnResult) || isError(parseUnmatchedKeysFnResult)) {
        const errors = [
          ...(parsePropertySchemasFnResult[0] ? parsePropertySchemasFnResult[0].errors : []),
          ...(parseUnmatchedKeysFnResult[0] ? parseUnmatchedKeysFnResult[0].errors : []),
        ]
        return [{ input: value, errors }]
      }
      return [undefined, (newObject ?? value) as Output]
    }
    return [
      {
        input: value,
        errors: [
          (finalOptions.invalidObjectFn ?? errorFns.parseObject)(
            value,
            finalOptions.type ?? 'object',
          ),
        ],
      },
      undefined,
    ]
  }
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * validators
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * all validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type ObjectValidations = DeepWriteable<typeof objectValidations_>

const objectValidations_ = [] as const // [propName: string, validationFn: (...args) => (value: string) => string | undefined][]

const objectValidations = objectValidations_ as ObjectValidations

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vString
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export type VObjectFn = {
  <T extends PropertySchemasDef>(propertySchemas: T): VObject<T>
  <T extends PropertySchemasDef, S extends MinimumSchema>(
    propertySchemas: T,
    unmatchedPropertySchema: S,
    options?: ObjectOptions<ObjectDefToObjectType<T, S>>,
  ): VObject<T, S>
  <T extends PropertySchemasDef, S extends MinimumSchema>(
    propertySchemas: T,
    unmatchedPropertySchema: S,
    options: ObjectOptions<object>,
  ): VObject<T, S>
}

type PartialObjectOptions<
  T extends MinimumObjectSchema | MinimumPartialObjectSchema =
    | MinimumObjectSchema
    | MinimumPartialObjectSchema,
> = {
  parentSchema?: T
  type?: string
  transformObject?: true
  breakOnFirstError?: boolean
  invalidObjectPropertiesFn?: DefaultErrorFn['invalidObjectPropertiesFn']
  missingProperty?: DefaultErrorFn['missingProperty']
  missingPropertyInDef?: DefaultErrorFn['missingPropertyInDef']
  parser?: SafeParseObjectFn<VInfer<T>>
}

export type VPartialObjectFn = {
  <T extends PropertySchemasDef>(propertySchemas: T): VPartialObject<
    MinimumObjectSchema | MinimumPartialObjectSchema,
    T
  >
  <T extends PropertySchemasDef, P extends MinimumObjectSchema | MinimumPartialObjectSchema>(
    propertySchemas: T,
    options: PartialObjectOptions<P>,
  ): VPartialObject<P, T>
  (propertySchemas: PropertySchemasDef, options: PartialObjectOptions): VPartialObject
}

export function initVObject(baseObject: MinimumSchema): {
  vObject: VObjectFn
  vPartialObject: VPartialObjectFn
  setObjectInstances: (never: VNever, unknown: VUnknown) => void
} {
  let vNeverInstance: VNever
  let vUnknownInstance: VUnknown

  function setObjectInstances(never: VNever, unknown: VUnknown) {
    vNeverInstance = never
    vUnknownInstance = unknown
  }

  const baseObjectObject = createValidationBuilder(baseObject, objectValidations)

  function nextObject(
    propertySchemas: PropertySchemasDef,
    unmatchedPropertySchema: MinimumSchema,
    options: ParseObjectOptions,
    oldObject: MinimumObjectSchema,
  ) {
    const nextObj = vObject(propertySchemas, unmatchedPropertySchema, options)
    nextObj[parserObject].validators.push(...oldObject[parserObject].validators)
    return nextObj
  }

  errorFns = baseObject[defaultErrorFnSym]
  const vObject: VObjectFn = function VObjectFN(
    propertySchemas: PropertySchemasDef,
    unmatchedPropertySchema: MinimumSchema = vNeverInstance,
    options: ObjectOptions<object> = {},
  ): VObject<PropertySchemasDef, VNever> {
    const metaObj = metaObjectDefinition(propertySchemas, unmatchedPropertySchema, options)
    const [finalOptions] = metaObj
    const transformed = finalOptions.transformObject
    const def: MinimumObjectDefinition = {
      propertySchemas,
      unmatchedPropertySchema,
      type: finalOptions.type,
      transformed,
    }

    return Object.defineProperties(
      createFinalBaseObject(
        baseObjectObject,
        finalOptions.parser ?? parseObject(def, finalOptions, metaObj),
        finalOptions.type,
        'object',
        def,
        false,
      ),
      {
        pick: {
          value(...keys: PropertyKey[]) {
            const keyStrings = [] as string[]

            const newPropertySchemas = keys.reduce((newPropertySchemasI, key) => {
              if (key in propertySchemas) {
                keyStrings.push(`${String(key)}:${(propertySchemas[key] as MinimumSchema).type}`)
                return Object.assign(newPropertySchemasI, { [key]: propertySchemas[key] })
              }
              const fn = finalOptions.missingPropertyInDef
                ? finalOptions.missingPropertyInDef
                : errorFns.missingPropertyInDef
              throw new Error(fn(propertySchemas, key))
            }, {})

            return nextObject(newPropertySchemas, unmatchedPropertySchema, options, this)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        omit: {
          value(...keys: PropertyKey[]) {
            const newPropertySchemas = Object.keys(propertySchemas)
              .filter((key) => !keys.includes(key))
              .reduce(
                (newPropertySchemasI, key) =>
                  Object.assign(newPropertySchemasI, { [key]: propertySchemas[key] }),
                {},
              )
            return nextObject(newPropertySchemas, unmatchedPropertySchema, options, this)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        setKey: {
          value(name: PropertyKey, schema: MinimumSchema) {
            return this.extends({ [name]: schema })
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        extends: {
          value(
            extendPropertySchemas: PropertySchemasDef,
            newUnmatchedPropertySchema: MinimumSchema = unmatchedPropertySchema,
            newOptions: ExtentsObjectOptions = options,
          ) {
            if (newOptions.splitParse !== true) {
              return nextObject(
                { ...propertySchemas, ...extendPropertySchemas },
                newUnmatchedPropertySchema,
                newOptions,
                this,
              )
            }
            return vObject(extendPropertySchemas, vUnknownInstance, newOptions)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        merge: {
          value(...objectSchemas: MinimumObjectSchema[]) {
            const result = objectSchemas.reduce((newObject, objectToMerge) => {
              const {
                propertySchemas: extendPropertySchemas,
                unmatchedPropertySchema: newUnmatchedPropertySchema,
              } = objectToMerge.definition
              return newObject.extends(extendPropertySchemas, newUnmatchedPropertySchema, options)
            }, this)
            return result
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        partial: {
          value(...keysToPartial) {
            if (transformed) {
              throw new Error(
                'partial on objects that included transformed schemas is not supported',
              )
            }
            const keys = keysToPartial.length === 0 ? Object.keys(propertySchemas) : keysToPartial
            const newPropertySchemas = Object.entries(propertySchemas).reduce(
              (newPropertySchemasI, entry) => {
                const [key, propertySchema] = entry
                return Object.assign(newPropertySchemasI, {
                  [key]: keys.includes(key) ? optional(propertySchema) : propertySchema,
                })
              },
              {},
            )
            return nextObject(newPropertySchemas, unmatchedPropertySchema, options, this)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        deepPartial: {
          value(...keysToDeepPartial) {
            if (transformed) {
              throw new Error(
                'deepPartial on objects that included transformed schemas is not supported',
              )
            }
            const keys =
              keysToDeepPartial.length === 0 ? Object.keys(propertySchemas) : keysToDeepPartial
            const newPropertySchemas = Object.entries(propertySchemas).reduce(
              (newPropertySchemasI, entry) => {
                const [key, propertySchema] = entry
                return Object.assign(newPropertySchemasI, {
                  // eslint-disable-next-line no-nested-ternary
                  [key]: keys.includes(key)
                    ? deepPartial(propertySchema, keysToDeepPartial)
                    : propertySchema,
                })
              },
              {},
            )
            return nextObject(newPropertySchemas, unmatchedPropertySchema, options, this)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        // [internalDeepPartial]: {
        //   value(...keysToDeepPartial) {
        //     return this.deepPartial(...keysToDeepPartial).optional()
        //   },
        // },
        required: {
          value(...keysToRequire) {
            const keys = keysToRequire.length === 0 ? Object.keys(propertySchemas) : keysToRequire
            const newPropertySchemas = Object.entries(propertySchemas).reduce(
              (newPropertySchemasI, entry) => {
                const [key, propertySchema] = entry
                return Object.assign(newPropertySchemasI, {
                  [key]: keys.includes(key)
                    ? required(propertySchema, keysToRequire)
                    : propertySchema,
                })
              },
              {},
            )
            return nextObject(newPropertySchemas, unmatchedPropertySchema, options, this)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        catchAll: {
          value(schemaForUnmatchedProperties: MinimumSchema) {
            return nextObject(propertySchemas, schemaForUnmatchedProperties, options, this)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        passThrough: {
          value() {
            return this.catchAll(vUnknownInstance)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        strict: {
          value() {
            return this.catchAll(vNeverInstance)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        keyof: {
          value() {
            return Object.keys(propertySchemas)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
      },
    ) as VObject<PropertySchemasDef, VNever>
  }

  function vPartialObject(
    propertySchemas: PropertySchemasDef,
    options: PartialObjectOptions = {},
  ): VPartialObject {
    const metaObj = metaObjectDefinition2(propertySchemas, options)
    const [finalOptions] = metaObj
    const transformed = finalOptions.transformObject
    const def: MinimumPartialObjectDefinition = {
      propertySchemas,
      type: finalOptions.type,
    }
    if (transformed === true) def.transformed = transformed
    if (finalOptions.parentSchema) def.parentSchema = finalOptions.parentSchema

    const vPObj = Object.defineProperties(
      createFinalBaseObject(
        baseObjectObject,
        (finalOptions.parser as SafeParseFn<unknown>) ??
          parsePropertySchemas(propertySchemas, finalOptions),
        finalOptions.type,
        'partial object',
        def,
        false,
      ),
      {
        pick: {
          value(...keys: PropertyKey[]) {
            const keyStrings = [] as string[]

            const newPropertySchemas = keys.reduce((newPropertySchemasI, key) => {
              if (key in propertySchemas) {
                keyStrings.push(`${String(key)}:${(propertySchemas[key] as MinimumSchema).type}`)
                return Object.assign(newPropertySchemasI, { [key]: propertySchemas[key] })
              }
              const fn = finalOptions.missingPropertyInDef
                ? finalOptions.missingPropertyInDef
                : errorFns.missingPropertyInDef
              throw new Error(fn(propertySchemas, key))
            }, {})

            return vPartialObject(newPropertySchemas, options)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        omit: {
          value(...keys: PropertyKey[]) {
            const newPropertySchemas = Object.keys(propertySchemas)
              .filter((key) => !keys.includes(key))
              .reduce(
                (newPropertySchemasI, key) =>
                  Object.assign(newPropertySchemasI, { [key]: propertySchemas[key] }),
                {},
              )
            return vPartialObject(newPropertySchemas, options)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        setKey: {
          value(name: PropertyKey, schema: MinimumSchema) {
            return this.extends({ [name]: schema })
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        extends: {
          value(extendPropertySchemas: PropertySchemasDef) {
            return vPartialObject({ ...propertySchemas, ...extendPropertySchemas }, options)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        merge: {
          value(...objectSchemas: MinimumObjectSchema[]) {
            const result = objectSchemas.reduce((newObject, objectToMerge) => {
              const { propertySchemas: extendPropertySchemas } = objectToMerge.definition
              return newObject.extends(extendPropertySchemas, options)
            }, this)
            return result
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        partial: {
          value(...keysToPartial) {
            if (transformed) {
              throw new Error(
                'partial on objects that included transformed schemas is not supported',
              )
            }
            const keys = keysToPartial.length === 0 ? Object.keys(propertySchemas) : keysToPartial
            const newPropertySchemas = Object.entries(propertySchemas).reduce(
              (newPropertySchemasI, entry) => {
                const [key, propertySchema] = entry
                return Object.assign(newPropertySchemasI, {
                  [key]: keys.includes(key) ? optional(propertySchema) : propertySchema,
                })
              },
              {},
            )
            return vPartialObject(newPropertySchemas, options)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        deepPartial: {
          value(...keysToDeepPartial) {
            if (transformed) {
              throw new Error(
                'deepPartial on objects that included transformed schemas is not supported',
              )
            }
            const keys =
              keysToDeepPartial.length === 0 ? Object.keys(propertySchemas) : keysToDeepPartial
            const newPropertySchemas = Object.entries(propertySchemas).reduce(
              (newPropertySchemasI, entry) => {
                const [key, propertySchema] = entry
                return Object.assign(newPropertySchemasI, {
                  [key]: keys.includes(key)
                    ? deepPartial(propertySchema, keysToDeepPartial)
                    : propertySchema,
                })
              },
              {},
            )
            return vPartialObject(newPropertySchemas, options)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        // [internalDeepPartial]: {
        //   value(...keysToDeepPartial) {
        //     return this.deepPartial(...keysToDeepPartial).optional()
        //   },
        // },
        required: {
          value(...keysToRequire) {
            const keys = keysToRequire.length === 0 ? Object.keys(propertySchemas) : keysToRequire
            const newPropertySchemas = Object.entries(propertySchemas).reduce(
              (newPropertySchemasI, entry) => {
                const [key, propertySchema] = entry
                return Object.assign(newPropertySchemasI, {
                  [key]: keys.includes(key)
                    ? required(propertySchema, keysToRequire)
                    : propertySchema,
                })
              },
              {},
            )
            return vPartialObject(newPropertySchemas, options)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        keyof: {
          value() {
            return Object.keys(propertySchemas)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
      },
    ) as VPartialObject
    return vPObj
  }

  return { vObject, setObjectInstances, vPartialObject }
}
