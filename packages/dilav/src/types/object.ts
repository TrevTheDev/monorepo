/* eslint-disable no-restricted-syntax */
import { difference, isError } from '@trevthedev/toolbelt'
import type { DeepWriteable, FlattenObjectUnion, ResultError } from '@trevthedev/toolbelt'
import { deepPartial, isObjectType, isOptional, isTransformed, optional, required } from './shared'
import { createFinalBaseObject } from './base'
import {
  MinimumObjectSchema,
  MinimumObjectDefinition,
  MinimumSchema,
  ObjectDefToObjectType,
  ObjectDefinition,
  SingleValidationError,
  VNever,
  VObject,
  VOptional,
  VUnknown,
  ValidationErrors,
  defaultErrorFnSym,
  parserObject,
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

type ParseObjectErrorMessageFns = Pick<
  ObjectErrorOptions,
  'invalidObjectFn' | 'missingProperty' | 'invalidObjectPropertiesFn'
>

type ObjectParserFn<T extends object> = (value: unknown) => ResultError<ValidationErrors, T>

export type ObjectOptions<T extends object = object> = Partial<ObjectErrorOptions> & {
  type: string
} & ({ parser?: ObjectParserFn<T> } | { transformObject?: true })

type FlattenedObjectOptions<T extends object = object> = FlattenObjectUnion<ObjectOptions<T>>

interface FullObjectDefinition extends MinimumObjectDefinition {
  options: ObjectOptions
  transformed: boolean
}

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

export function parseObject<T extends MinimumObjectDefinition & { transformed: boolean }>(
  objectDefinition: T,
  options?: Partial<ParseObjectErrorMessageFns>,
): (
  value: unknown,
) => ResultError<
  ValidationErrors,
  ObjectDefToObjectType<T['propertySchemas'], T['unmatchedPropertySchema']>
> {
  const errorMessageFns: ParseObjectErrorMessageFns = {
    invalidObjectFn: errorFns.parseObject,
    invalidObjectPropertiesFn: errorFns.invalidObjectPropertiesFn,
    missingProperty: errorFns.missingProperty,
    ...options,
  }
  const definedKeys = allKeys(objectDefinition.propertySchemas)
  const unmatchedPropSchema = objectDefinition.unmatchedPropertySchema
  const transform: boolean = objectDefinition.transformed === true
  return function ParseObject(
    value: unknown,
  ): ResultError<
    ValidationErrors,
    ObjectDefToObjectType<T['propertySchemas'], T['unmatchedPropertySchema']>
  > {
    if (isObjectType(value)) {
      let newObject
      if (transform) newObject = {}
      const errors = [] as SingleValidationError[]
      const propertyErrors = [] as SingleObjectValidationError[]

      const { propertySchemas } = objectDefinition

      // const allKeysToValidate = [
      //   ...Object.keys(propertySchemas),
      //   ...Object.getOwnPropertySymbols(objectDefinition.propertySchemas),
      // ]

      for (const key of definedKeys) {
        const schema = propertySchemas[key] as MinimumSchema
        if (key in value || transform) {
          const result = schema.safeParse(value[key])
          if (result[0] !== undefined) propertyErrors.push([key, result[0].errors])
          else if (transform) {
            Object.defineProperty(newObject, key, {
              value: result[1],
              enumerable: true,
              configurable: false,
              writable: false,
            })
          }
        } else if (!isOptional(schema))
          propertyErrors.push([key, [errorMessageFns.missingProperty(value, key)]])
      }

      const valueKeys = allKeys(value)
      const diff = difference(valueKeys, definedKeys)

      for (const key of diff) {
        const result = unmatchedPropSchema.safeParse(value[key])
        if (isError(result)) propertyErrors.push([key, result[0].errors])
        else if (transform) {
          Object.defineProperty(newObject, key, {
            value: result[1],
            enumerable: true,
            configurable: false,
            writable: false,
          })
        }
      }

      if (propertyErrors.length !== 0) {
        errors.push(
          errorMessageFns.invalidObjectPropertiesFn(
            value,
            objectDefinition.options.type,
            propertyErrors,
          ),
        )
      }

      // eslint-disable-next-line no-nested-ternary
      return errors.length === 0
        ? transform
          ? [undefined, newObject]
          : [
              undefined,
              value as ObjectDefToObjectType<T['propertySchemas'], T['unmatchedPropertySchema']>,
            ]
        : [{ input: value, errors }, undefined]
    }
    return [
      {
        input: value,
        errors: [errorMessageFns.invalidObjectFn(value, objectDefinition.options.type)],
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
  <T extends ObjectDefinition>(propertySchemas: T): VObject<T>
  <T extends ObjectDefinition, S extends MinimumSchema>(
    propertySchemas: T,
    unmatchedPropertySchema: S,
    options?: Partial<ObjectOptions<T>>,
  ): VObject<T, S>
  <T extends ObjectDefinition, S extends MinimumSchema, O extends { type: string }>(
    propertySchemas: T,
    unmatchedPropertySchema: S,
    options: O,
  ): VObject<T, S, O>
}

export function initVObject(baseObject: MinimumSchema): {
  vObject: VObjectFn
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
    propertySchemas: ObjectDefinition,
    unmatchedPropertySchema: MinimumSchema,
    options: Partial<ObjectOptions>,
    oldObject: MinimumObjectSchema,
  ) {
    const nextObj = vObject(propertySchemas, unmatchedPropertySchema, options)
    nextObj[parserObject].validators.push(...oldObject[parserObject].validators)
    return nextObj
  }

  errorFns = baseObject[defaultErrorFnSym]
  const vObject: VObjectFn = function VObjectFN(
    propertySchemas: ObjectDefinition,
    unmatchedPropertySchema: MinimumSchema = vNeverInstance,
    options: Partial<FlattenedObjectOptions<ObjectDefinition>> = {},
  ) {
    // const t1 = `{${Object.entries(propertySchemas).map(([key, value]) =>
    //   isOptional(value)
    //     ? `${key}?:${(value as VOptional<any>).definition.wrappedSchema.type}`
    //     : `${key}:${value.type}`,
    // )}}`
    let transformed = false
    const typeStrings = [] as string[]
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
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

    const t2 =
      unmatchedPropertySchema.type === 'never'
        ? t1
        : `${t1}&{[K in PropertyKey]: ${unmatchedPropertySchema.type}}`
    const finalOptions: FlattenedObjectOptions<ObjectDefinition> = {
      ...options,
      type: options.type ?? t2,
    }

    const def: FullObjectDefinition = {
      propertySchemas,
      unmatchedPropertySchema,
      options: finalOptions,
      transformed,
    }

    type ReturnT = VObject<ObjectDefinition, VNever>

    const builder = createFinalBaseObject(
      baseObjectObject,
      // eslint-disable-next-line no-nested-ternary
      finalOptions.parser ? finalOptions.parser : parseObject(def, finalOptions),
      finalOptions.type,
      'object',
      def,
      false,
    ) as unknown as ReturnT
    // const builder = createBaseValidationBuilder(
    //   parser,
    //   objectValidations,
    //   finalOptions.type,
    // ) as unknown as ReturnT

    Object.defineProperties(builder, {
      // shape: {
      //   value: def,
      // },
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
          extendPropertySchemas: ObjectDefinition,
          newUnmatchedPropertySchema: MinimumSchema = unmatchedPropertySchema,
          newOptions: Partial<ObjectOptions> = options,
        ) {
          return nextObject(
            { ...propertySchemas, ...extendPropertySchemas },
            newUnmatchedPropertySchema,
            newOptions,
            this,
          )
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
              options: newOptions,
            } = objectToMerge.definition
            return newObject.extends(extendPropertySchemas, newUnmatchedPropertySchema, newOptions)
          }, this)
          return result
        },
        enumerable: true,
        configurable: false,
        writable: false,
      },
      partial: {
        value(...keysToPartial) {
          if (transformed)
            throw new Error('partial on objects that included transformed schemas is not supported')
          const keys = keysToPartial.length === 0 ? Object.keys(propertySchemas) : keysToPartial
          const newPropertySchemas = Object.entries(propertySchemas).reduce(
            (newPropertySchemasI, entry) => {
              const [key, propertySchema] = entry
              return Object.assign(newPropertySchemasI, {
                // eslint-disable-next-line no-nested-ternary
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
    })
    return builder
  }

  return { vObject, setObjectInstances }
}
