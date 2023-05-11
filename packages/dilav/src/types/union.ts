/* eslint-disable no-restricted-syntax */
import { type ResultError, type DeepWriteable, intersection, difference } from '../toolbelt'

import { parseObject } from './object'

import { createFinalBaseObject } from './base'
import {
  MinimumObjectSchema,
  MinimumSchema,
  BaseTypes,
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
  VUnionLiterals,
  VUnionOutput,
  ValidationErrors,
  defaultErrorFnSym,
  groupBaseTypes,
} from './types'
import defaultErrorFn, { DefaultErrorFn } from './errorFns'
import { isObjectType, isTransformed } from './shared'

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
export type LiteralUnionType = [unknown, ...unknown[]]

type UnionOptions<Output = unknown> = {
  parser?: SafeParseFn<ValidationErrors, Output>
  type?: string
  baseType?: BaseTypes
  definitionObject?: object
}

type DiscriminatedUnionOptions = {
  discriminatedUnionKey: string
  unmatchedPropertySchema: MinimumSchema
  errorMessageFns?: Partial<DiscriminatedUnionParseErrorMessageFns>
  type: string
}

export type LiteralUnionOptions<
  T,
  RT = {
    literalUnion: true
    parser?: SafeParseFn<ValidationErrors, T>
    type?: string
    parseLiteralUnion?: DefaultErrorFn['parseLiteralUnion']
    baseType?: BaseTypes
    definitionObject?: object
  },
> = RT

interface PartialDiscriminatedUnionOptions {
  parser?: (
    typeSchemas: ObjectUnionSchemas,
    options: DiscriminatedUnionOptions,
  ) => (value: unknown) => ResultError<ValidationErrors, object>
  discriminatedUnionKey: string
  unmatchedPropertySchema?: MinimumSchema
  errorMessageFns?: Partial<DiscriminatedUnionParseErrorMessageFns>
}

type BasicOptions<Output = unknown> = {
  parser?: SafeParseFn<unknown, Output>
}

export type VUnionFn = {
  <T extends Readonly<ObjectUnionSchemas>, TW extends ObjectUnionSchemas = DeepWriteable<T>>(
    types: T,
    options: PartialDiscriminatedUnionOptions,
  ): VUnion<TW>
  <T extends Readonly<UnionType>, TW extends UnionType = DeepWriteable<T>>(
    types: T,
    options?: UnionOptions<VUnionOutput<TW>>,
  ): VUnion<TW>
  <const T extends Readonly<LiteralUnionType>>(
    types: T,
    options: LiteralUnionOptions<T[number]>,
  ): VUnionLiterals<T[number]>
  (
    types: UnionType,
    options: PartialDiscriminatedUnionOptions | UnionOptions | LiteralUnionOptions<string>,
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

export function parseLiteralUnion<T extends readonly unknown[]>(
  literalUnionDef: T,
  options: LiteralUnionOptions<T[number]>,
): (value: unknown) => ResultError<ValidationErrors, T[number]> {
  return (value: unknown): ResultError<ValidationErrors, T[number]> => {
    if (literalUnionDef.includes(value)) return [undefined, value as T[number]]
    return [
      {
        input: value,
        errors: [(options.parseLiteralUnion ?? errorFns.parseLiteralUnion)(value, literalUnionDef)],
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
const literalArrayToUnionTypeString = (literalArray: unknown[]) =>
  literalArray.map((value) => JSON.stringify(value)).join('|')
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

  function vUnionFnLiteral(
    literals: LiteralUnionType,
    options: LiteralUnionOptions<LiteralUnionType[number]>,
  ) {
    const typeString = options.type ?? literalArrayToUnionTypeString(literals)

    return Object.defineProperties(
      createFinalBaseObject(
        baseUnionObject,
        options.parser ? options.parser : parseLiteralUnion(literals, options),
        typeString,
        options.baseType ?? 'literal union',
        options.definitionObject ?? { literals },
      ),
      {
        definition: options.definitionObject ?? { literals },
        extract: {
          value(...keys: [unknown, ...unknown[]]) {
            const newKeys = intersection(literals, keys) as unknown as LiteralUnionType
            return vUnionFn(newKeys, options)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        exclude: {
          value(...keys: [unknown, ...unknown[]]) {
            const newKeys = difference(literals, keys) as unknown as LiteralUnionType
            return vUnionFn(newKeys, options)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
      },
    ) as VUnionLiterals<LiteralUnionType[number]>
  }

  function vUnionFnDiscriminatedUnion(
    schemas: ObjectUnionSchemas,
    options: PartialDiscriminatedUnionOptions,
    typeString: string,
  ) {
    const fOptions = {
      unmatchedPropertySchema: vNeverInstance,
      ...options,
      errorMessageFns: { ...options.errorMessageFns },
      type: typeString,
    } as DiscriminatedUnionOptions
    const parserFn = options.parser
      ? options.parser(schemas, fOptions)
      : parseDiscriminatedUnion(schemas, fOptions)
    return createFinalBaseObject(baseUnionObject, parserFn, typeString, 'discriminated union', {
      unionTypes: schemas,
      discriminatedUnionKey: fOptions.discriminatedUnionKey,
      unmatchedPropertySchema: fOptions.unmatchedPropertySchema,
    }) as VUnion<UnionType>
  }

  function vUnionFn(
    schemasOrLiterals: UnionType | LiteralUnionType | ObjectUnionSchemas,
    options:
      | PartialDiscriminatedUnionOptions
      | UnionOptions<VUnionOutput<UnionType>>
      | LiteralUnionOptions<unknown> = {},
  ): VUnion<UnionType> | VUnionLiterals<LiteralUnionType[number]> {
    if (!Array.isArray(schemasOrLiterals)) throw new Error('types must be an array')
    if ('literalUnion' in options && options.literalUnion === true)
      return vUnionFnLiteral(schemasOrLiterals, options)

    let baseTypes: BaseTypes | 'mixed' | undefined
    let typeString = ''
    for (const schema of schemasOrLiterals as MinimumSchema[]) {
      if (!isObjectType(schema)) throw new Error('must be of type schema')
      if (!('baseType' in schema)) throw new Error('must be of type schema')
      if (isTransformed(schema as MinimumSchema | MinimumObjectSchema))
        throw new Error('transformed schemas cannot be included in a union')
      if (baseTypes === undefined)
        baseTypes = (schema as MinimumSchema | MinimumObjectSchema).baseType
      else if (baseTypes !== (schema as MinimumSchema | MinimumObjectSchema).baseType)
        baseTypes = 'mixed'

      typeString = `${typeString}${
        groupBaseTypes.includes(schema.baseType) ? `(${schema.type})` : schema.type
      }|`
    }

    typeString = typeString.slice(0, -1)

    if ('discriminatedUnionKey' in options && typeof options.discriminatedUnionKey === 'string') {
      if (baseTypes !== 'object') throw new Error('all elements must be a object schemas')
      return vUnionFnDiscriminatedUnion(
        schemasOrLiterals as ObjectUnionSchemas,
        options,
        typeString,
      )
    }

    return createFinalBaseObject(
      baseUnionObject,
      (options as UnionOptions<VUnionOutput<UnionType>>).parser ??
        parseUnion(schemasOrLiterals as UnionType),
      typeString,
      (options as UnionOptions<VUnionOutput<UnionType>>).baseType ?? 'union',
      (options as UnionOptions<VUnionOutput<UnionType>>).definitionObject ?? {
        unionTypes: schemasOrLiterals,
      },
    ) as VUnion<UnionType>
  }

  const vUnion: VUnionFn = ((types, options) => vUnionFn(types, options)) as VUnionFn

  const vOptional: VOptionalFn = function vOptionalFn<T extends MinimumSchema>(
    type: T,
    undefinedInstance: VUndefined = vUndefinedInstance,
    options: BasicOptions<VUnionOutput<[T, VUndefined]>> = {},
  ): VOptional<T> {
    return Object.defineProperty(
      vUnionFn([type, undefinedInstance], {
        ...options,
        baseType: 'optional',
        definitionObject: {
          wrappedSchema: type,
        },
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
    return vUnionFn([type, nullInstance], {
      ...options,
      baseType: 'nullable',
      definitionObject: {
        wrappedSchema: type,
      },
    }) as unknown as VNullable<T>
  }

  const vNullish: VNullishFn = function vNullableFn<T extends MinimumSchema>(
    type: T,
    undefinedInstance: VUndefined = vUndefinedInstance,
    nullInstance: VNull = vNullInstance,
    options: BasicOptions<VUnionOutput<[T, VNull, VUndefined]>> = {},
  ): VNullish<T> {
    return vUnionFn([type, nullInstance, undefinedInstance], {
      ...options,
      baseType: 'nullish',
      definitionObject: {
        wrappedSchema: type,
      },
    }) as unknown as VNullish<T>
  }

  return { vUnion, vOptional, vNullable, vNullish, setUnionInstances }
}
