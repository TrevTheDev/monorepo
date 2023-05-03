/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type ResultError,
  type DeepWriteable,
  intersection,
  difference,
} from '@trevthedev/toolbelt'

import { parseObject } from './object'

import { createFinalBaseObject } from './base'
import {
  MinimumObjectSchema,
  MinimumSchema,
  SafeParsableObjectTypes,
  SafeParseFn,
  UnionType,
  VInfer,
  VNever,
  VNull,
  VNullable,
  VNullish,
  VOptional,
  VUndefined,
  VUnion,
  VUnionStringLiterals,
  VUnionOutput,
  ValidationErrors,
  defaultErrorFnSym,
} from './types'
import defaultErrorFn, { DefaultErrorFn } from './errorFns'
import { isTransformed } from './shared'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * types and constants
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
let errorFns = defaultErrorFn

type DiscriminatedUnionParseErrorMessageFns = Pick<
  DefaultErrorFn,
  | 'parseObject'
  | 'invalidObjectPropertiesFn'
  | 'missingProperty'
  | 'missingPropertyInDef'
  | 'keyNotFoundInDiscriminatedUnionDef'
  | 'keyNotFoundInDiscriminatedUnion'
  | 'noKeyMatchFoundInDiscriminatedUnion'
  | 'schemaIsNotOfTypeObject'
  | 'discriminatedUnionValueIsNotAnObject'
>

type ObjectUnionSchemas = [MinimumObjectSchema, ...MinimumObjectSchema[]]
type StringUnionType = [string, ...string[]]

type UnionOptions<Output = any> = {
  parser?: SafeParseFn<unknown, Output>
  type?: string
}

type DiscriminatedUnionOptions = {
  discriminatedUnionKey: string
  unmatchedPropertySchema: MinimumSchema
  errorMessageFns?: Partial<DiscriminatedUnionParseErrorMessageFns>
  type: string
}

export type StringLiteralUnionOptions<T extends string> = {
  stringLiteralUnion: true
  parser?: SafeParseFn<unknown, T>
  type?: string
  parseStringUnion?: DefaultErrorFn['parseStringUnion']
}

interface PartialDiscriminatedUnionOptions {
  parser?: (
    typeSchemas: ObjectUnionSchemas,
    options: DiscriminatedUnionOptions,
  ) => (value: unknown) => ResultError<ValidationErrors, object>
  discriminatedUnionKey: string
  unmatchedPropertySchema?: MinimumSchema
  errorMessageFns?: Partial<DiscriminatedUnionParseErrorMessageFns>
}

type BasicOptions<Output = any> = {
  parser?: SafeParseFn<unknown, Output>
}

export type VUnionFn = {
  <T extends Readonly<ObjectUnionSchemas>, TW extends ObjectUnionSchemas = DeepWriteable<T>>(
    types: T,
    options: PartialDiscriminatedUnionOptions,
  ): VUnion<TW>
  <const T extends Readonly<StringUnionType>>(
    types: T,
    options: StringLiteralUnionOptions<T[number]>,
  ): VUnionStringLiterals<T[number]>
  <T extends Readonly<UnionType>, TW extends UnionType = DeepWriteable<T>>(
    types: T,
    options?: UnionOptions<VUnionOutput<TW>>,
  ): VUnion<TW>
  (
    types: UnionType,
    options: PartialDiscriminatedUnionOptions | UnionOptions<any> | StringLiteralUnionOptions<any>,
  ): MinimumSchema
}
export type VOptionalFn = <T extends MinimumSchema>(
  type: T,
  undefinedInstance?: VUndefined,
  options?: BasicOptions<VUnionOutput<[T, VUndefined]>>,
) => VOptional<T>
export type VNullableFn = <T extends MinimumSchema>(
  type: T,
  nullInstance?: VNull,
  options?: BasicOptions<VUnionOutput<[T, VNull]>>,
) => VNullable<T>
export type VNullishFn = <T extends MinimumSchema>(
  type: T,
  undefinedInstance?: VUndefined,
  nullInstance?: VNull,
  options?: BasicOptions<VUnionOutput<[T, VNull, VUndefined]>>,
) => VNullish<T>

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export function parseUnion<T extends UnionType, Output = { [K in keyof T]: VInfer<T[K]> }[number]>(
  types: T,
) {
  const typeSchemas = types.map((type) => (value: unknown) => type.safeParse(value))
  return (value: unknown): ResultError<ValidationErrors, Output> => {
    const errors: string[] = []
    // eslint-disable-next-line no-restricted-syntax
    for (const vType of typeSchemas) {
      const result = vType(value)
      if (result[0] === undefined) return result
      errors.push(...result[0].errors)
    }
    return [{ input: value, errors }, undefined]
  }
}

function isObject(mspo: MinimumSchema | MinimumObjectSchema): mspo is MinimumObjectSchema {
  return mspo.baseType === 'object'
}

export function parseStringUnion<T extends readonly string[], Output extends string = T[number]>(
  stringUnionDef: T,
  options: StringLiteralUnionOptions<Output>,
): (value: unknown) => ResultError<ValidationErrors, Output> {
  return (value: unknown): ResultError<ValidationErrors, Output> => {
    if (typeof value === 'string' && stringUnionDef.includes(value))
      return [undefined, value as Output]
    return [
      {
        input: value,
        errors: [
          ((options.parseStringUnion as any) ?? errorFns.parseStringUnion)(value, stringUnionDef),
        ],
      },
      undefined,
    ]
  }
}

export function parseDiscriminatedUnion<
  T extends ObjectUnionSchemas,
  Output extends object = {
    [K in keyof T]: VInfer<T[K]> extends object ? VInfer<T[K]> : never
  }[number],
>(
  schemas: T,
  options: DiscriminatedUnionOptions,
): (value: unknown) => ResultError<ValidationErrors, Output> {
  const errorMessageFns = {
    // invalidObjectFn: errorFns.parseObject,
    // invalidObjectPropertiesFn: errorFns.invalidObjectPropertiesFn,
    // missingProperty: errorFns.missingProperty,
    // missingPropertyInDef: errorFns.missingPropertyInDef,
    keyNotFoundInDiscriminatedUnionDef: errorFns.keyNotFoundInDiscriminatedUnionDef,
    keyNotFoundInDiscriminatedUnion: errorFns.keyNotFoundInDiscriminatedUnion,
    noKeyMatchFoundInDiscriminatedUnion: errorFns.noKeyMatchFoundInDiscriminatedUnion,
    schemaIsNotOfTypeObject: errorFns.schemaIsNotOfTypeObject,
    discriminatedUnionValueIsNotAnObject: errorFns.discriminatedUnionValueIsNotAnObject,
    ...options.errorMessageFns,
  }
  const { discriminatedUnionKey, unmatchedPropertySchema } = options
  const typeSchemas = schemas.map((schema: MinimumSchema | MinimumObjectSchema) => {
    if (!isObject(schema)) throw new Error(errorMessageFns.schemaIsNotOfTypeObject(schema))
    const { propertySchemas } = schema.definition
    const keySchema = propertySchemas[discriminatedUnionKey]
    if (keySchema === undefined) {
      throw new Error(
        errorMessageFns.keyNotFoundInDiscriminatedUnionDef(discriminatedUnionKey, schema.type),
      )
    }

    return [
      (value) => keySchema.safeParse(value),
      parseObject(
        {
          propertySchemas,
          unmatchedPropertySchema,
          options: { type: options.type },
          transformed: isTransformed(schema),
        },
        errorMessageFns,
      ),
    ] as [
      (value: unknown) => ResultError<ValidationErrors, unknown>,
      (value: unknown) => ResultError<ValidationErrors, object>,
    ]
  })
  return (value: unknown): ResultError<ValidationErrors, Output> => {
    const errors: string[] = []
    if (typeof value !== 'object' || Array.isArray(value) || value === null) {
      return [
        {
          input: value,
          errors: [errorMessageFns.discriminatedUnionValueIsNotAnObject(value)],
        },
        undefined,
      ]
    }
    if (discriminatedUnionKey in value) {
      const keyValueToMatch = value[discriminatedUnionKey]
      // eslint-disable-next-line no-restricted-syntax
      for (const vType of typeSchemas) {
        const [keySchema, propertySchema] = vType
        const result = keySchema(keyValueToMatch)
        if (result[0] === undefined) {
          const oResult = propertySchema(value)
          if (oResult[0] === undefined) return oResult as ResultError<ValidationErrors, Output>
          errors.push(...oResult[0].errors)
        }
      }
      return [
        errors.length === 0
          ? {
              input: value,
              errors: [
                errorMessageFns.noKeyMatchFoundInDiscriminatedUnion(
                  value,
                  discriminatedUnionKey,
                  schemas as ObjectUnionSchemas,
                ),
              ],
            }
          : { input: value, errors },
        undefined,
      ]
    }
    return [
      {
        input: value,
        errors: [errorMessageFns.keyNotFoundInDiscriminatedUnion(discriminatedUnionKey, value)],
      },
      undefined,
    ]
  }
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * Utils
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

/**
 * joins strings into a union e.g. ['A','B'] becomes 'A|B'
 * @param typeStrings - any array of strings
 * @returns
 */
const stringArrayToUnionTypeString = (typeStrings: string[]) => typeStrings.join('|')
// /**
//  * Wraps each item in a string array in single quotes e.g. ['A','B'] becomes ["'A'","'B'"]
//  * @param typeStrings - any array of strings
//  * @returns
//  */
// const wrapStringArrayInSingleQuotes = (typeStrings: string[]) =>
//   typeStrings.map((string) => `'${string}'`)

// export function deepRequired(mspObj: MinimumSafeParsableObject): MinimumSafeParsableObject {
//   return 'deepRequired' in mspObj ? deepRequired(mspObj.deepRequired()) : required(mspObj)
// }
/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * VUnion
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

// function isStringUnionType(
//   types: UnionType | StringUnionType | ObjectUnionSchemas,
// ): types is StringUnionType {
//   if (types.length === 0) return false
//   return (types as any[]).every((type) => type !== 'string')
// }

// function isObjectUnionType(
//   schemas: UnionType | StringUnionType | ObjectUnionSchemas,
// ): schemas is ObjectUnionSchemas {
//   if (schemas.length === 0) return false
//   for (const schema of schemas) {
//     if (typeof schema !== 'object' || !('baseType' in schema)) return false
//     if (schema.baseType !== 'object') return false
//     if (isTransformed(schema)) throw new Error('transformed schemas cannot be included in a union')
//   }
//   return (schemas as any[]).every((type) => type.baseType === 'object')
// }

export function initUnionTypes(baseObject: MinimumSchema) {
  errorFns = baseObject[defaultErrorFnSym]
  let vUndefinedInstance: VUndefined
  let vNullInstance: VNull
  let vNeverInstance: VNever
  function setUnionInstances(
    undefinedInstance: VUndefined,
    nullInstance: VNull,
    neverInstance: VNever,
  ) {
    vUndefinedInstance = undefinedInstance
    vNullInstance = nullInstance
    vNeverInstance = neverInstance
  }

  const baseUnionObject = Object.create(baseObject)

  function vUnionFn(
    schemasOrStrings: UnionType | StringUnionType | ObjectUnionSchemas,
    options:
      | PartialDiscriminatedUnionOptions
      | UnionOptions<VUnionOutput<UnionType>>
      | StringLiteralUnionOptions<string> = {},
    baseType: SafeParsableObjectTypes = 'union',
    definitionObject: object | undefined = undefined,
  ): VUnion<any> | VUnionStringLiterals<string> {
    if (!Array.isArray(schemasOrStrings)) throw new Error('types must be an array')

    let lastType: string | undefined
    let baseTypes: SafeParsableObjectTypes | 'mixed' | undefined
    for (const schema of schemasOrStrings) {
      const currentType = typeof schema
      if (lastType === undefined) lastType = currentType
      if (currentType === 'string') {
        if (lastType !== 'string')
          throw new Error('schemasOrStrings must be all strings, or no strings')
      } else if (currentType === 'object') {
        if ('baseType' in (schema as MinimumSchema | MinimumObjectSchema)) {
          if (isTransformed(schema as MinimumSchema | MinimumObjectSchema))
            throw new Error('transformed schemas cannot be included in a union')
          if (baseTypes === undefined)
            baseTypes = (schema as MinimumSchema | MinimumObjectSchema).baseType
          else if (baseTypes !== (schema as MinimumSchema | MinimumObjectSchema).baseType)
            baseTypes = 'mixed'
        } else throw new Error('must be of type schema')
      } else throw new Error('must be of type schema')
    }

    if ('stringLiteralUnion' in options && options.stringLiteralUnion === true) {
      if (lastType !== 'string') throw new Error('stringLiteralUnion must include only strings')
      const typeString = stringArrayToUnionTypeString(schemasOrStrings as StringUnionType)
      return Object.defineProperties(
        createFinalBaseObject(
          baseUnionObject,
          options.parser
            ? options.parser
            : parseStringUnion(schemasOrStrings as StringUnionType, options),
          typeString,
          'string union',
          {
            unionTypes: schemasOrStrings,
          },
        ),
        {
          enum: {
            value: (schemasOrStrings as StringUnionType).reduce(
              (obj, type) =>
                Object.defineProperty(obj, type, {
                  value: type,
                  enumerable: true,
                  configurable: false,
                  writable: false,
                }),
              {},
            ),
            enumerable: true,
            configurable: false,
            writable: false,
          },
          extract: {
            value(keys: [string, ...string[]]) {
              const newKeys = intersection(schemasOrStrings, keys) as unknown as StringUnionType
              return vUnionFn(newKeys, options)
            },
            enumerable: true,
            configurable: false,
            writable: false,
          },
          exclude: {
            value(keys: [string, ...string[]]) {
              const newKeys = difference(schemasOrStrings, keys) as unknown as StringUnionType
              return vUnionFn(newKeys, options)
            },
            enumerable: true,
            configurable: false,
            writable: false,
          },
        },
      ) as VUnionStringLiterals<string>
    }

    const typeString = stringArrayToUnionTypeString(schemasOrStrings.map((type) => type.type))

    if ('discriminatedUnionKey' in options && typeof options.discriminatedUnionKey === 'string') {
      if (baseTypes === 'object') {
        const fOptions = {
          unmatchedPropertySchema: vNeverInstance,
          ...options,
          errorMessageFns: { ...options.errorMessageFns },
          type: typeString,
        } as DiscriminatedUnionOptions
        const parserFn = options.parser
          ? options.parser(schemasOrStrings as ObjectUnionSchemas, fOptions as any)
          : parseDiscriminatedUnion(schemasOrStrings as ObjectUnionSchemas, fOptions)
        return createFinalBaseObject(baseUnionObject, parserFn, typeString, 'discriminated union', {
          unionTypes: schemasOrStrings,
          discriminatedUnionKey: fOptions.discriminatedUnionKey,
          unmatchedPropertySchema: fOptions.unmatchedPropertySchema,
        }) as VUnion<any>
      }
      throw new Error('all elements must be a object schemas')
    }

    return createFinalBaseObject(
      baseUnionObject,
      options.parser ? (options.parser as any) : parseUnion(schemasOrStrings as UnionType),
      typeString,
      baseType,
      definitionObject === undefined
        ? {
            unionTypes: schemasOrStrings,
          }
        : definitionObject,
    ) as VUnion<any>
  }

  const vUnion: VUnionFn = ((types, options) => vUnionFn(types, options)) as VUnionFn

  const vOptional: VOptionalFn = function vOptionalFn<T extends MinimumSchema>(
    type: T,
    undefinedInstance: VUndefined = vUndefinedInstance,
    options: BasicOptions<VUnionOutput<[T, VUndefined]>> = {},
  ): VOptional<T> {
    return Object.defineProperty(
      vUnionFn([type, undefinedInstance], options, 'optional', {
        wrappedSchema: type,
      }),
      'required',
      {
        value() {
          return type
        },
        enumerable: true,
        configurable: false,
        writable: false,
      },
    ) as unknown as VOptional<T>
  }

  const vNullable: VNullableFn = function vNullableFn<T extends MinimumSchema>(
    type: T,
    nullInstance: VNull = vNullInstance,
    options: BasicOptions<VUnionOutput<[T, VNull]>> = {},
  ): VNullable<T> {
    const result = vUnionFn([type, nullInstance], options, 'nullable', {
      wrappedSchema: type,
    })
    return result as unknown as VNullable<T>
  }

  const vNullish: VNullishFn = function vNullableFn<T extends MinimumSchema>(
    type: T,
    undefinedInstance: VUndefined = vUndefinedInstance,
    nullInstance: VNull = vNullInstance,
    options: BasicOptions<VUnionOutput<[T, VNull, VUndefined]>> = {},
  ): VNullish<T> {
    return vUnionFn([type, nullInstance, undefinedInstance], options, 'nullish', {
      wrappedSchema: type,
    }) as unknown as VNullish<T>
  }

  return { vUnion, vOptional, vNullable, vNullish, setUnionInstances }
}
