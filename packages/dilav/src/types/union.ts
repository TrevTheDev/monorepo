/* eslint-disable no-unreachable-loop */
/* eslint-disable no-restricted-syntax */
import { type DeepWriteable, intersection, difference, isResult } from '../toolbelt'

// import { parseObject } from './object'

import { createFinalBaseObject } from './base'
import {
  MinimumObjectSchema,
  MinimumSchema,
  BaseTypes,
  SafeParseFn,
  UnionSchemas,
  VNull,
  VNullable,
  VNullish,
  VOptional,
  VUndefined,
  VUnion,
  VUnionLiterals,
  VUnionOutput,
  defaultErrorFnSym,
  groupBaseTypes,
  ObjectUnionSchemas,
  SafeParseOutput,
  PropertySchemasDef,
  SingleValidationError,
  VUnionAdvanced,
  VUnionKey,
} from './types'
import defaultErrorFn, { DefaultErrorFn } from './errorFns'
import { isObjectType, isTransformed } from './shared'
import { parsePropertySchemas } from './object'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * types and constants
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
let errorFns = defaultErrorFn

export type LiteralUnionType = [unknown, ...unknown[]]

type BaseOptions<Output = unknown> = {
  parser?: SafeParseFn<Output>
  baseType?: BaseTypes
  type?: string
  definitionObject?: object
}

type BasicOptions<Output = unknown> = Pick<VUnionOptions<Output>, 'noMatchFoundInUnion' | 'parser'>

interface VUnionOptions<Output = unknown> extends BaseOptions<Output> {
  noMatchFoundInUnion?: DefaultErrorFn['noMatchFoundInUnion']
}

export interface VLiteralOptions<Output = unknown> extends BaseOptions<Output> {
  noMatchFoundInLiteralUnion?: DefaultErrorFn['noMatchFoundInLiteralUnion']
}

interface VUnionKeyOptions<Output = unknown> extends VUnionOptions<Output> {
  keyNotFoundInDiscriminatedUnionDef?: DefaultErrorFn['keyNotFoundInDiscriminatedUnionDef']
  oneMatchOnly?: boolean
}

export type VUnionFn = {
  <const T extends Readonly<UnionSchemas>, TW extends UnionSchemas = DeepWriteable<T>>(
    schemas: T,
    options?: VUnionOptions<VUnionOutput<TW>>,
  ): VUnion<TW>
  literals<const T extends Readonly<LiteralUnionType>>(
    literals: T,
    options?: VLiteralOptions<T[number]>,
  ): VUnionLiterals<T[number]>
  key<
    const T extends Readonly<ObjectUnionSchemas>,
    TW extends ObjectUnionSchemas = DeepWriteable<T>,
  >(
    key: PropertyKey,
    schemas: T,
    options?: VUnionKeyOptions<VUnionOutput<TW>>,
  ): VUnionKey<TW>
  advanced<const T extends Readonly<UnionSchemas>, TW extends UnionSchemas = DeepWriteable<T>>(
    matches: PropertySchemasDef,
    schemas: T,
    options?: VUnionOptions<VUnionOutput<TW>>,
  ): VUnionAdvanced<TW>
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
function createUnionParser(noMatchFoundInUnion?: DefaultErrorFn['noMatchFoundInUnion']) {
  return function unionParser<Output>(
    schemas: MinimumSchema[],
    value: unknown,
  ): SafeParseOutput<Output> {
    const errors: SingleValidationError[] = []
    for (const schema of schemas) {
      const result = schema.safeParse(value)
      if (isResult(result)) return result
      errors.push(...result[0].errors)
    }
    return errors.length === 0
      ? [
          {
            input: value,
            errors: [(noMatchFoundInUnion ?? errorFns.noMatchFoundInUnion)(value, schemas)],
          },
        ]
      : [{ input: value, errors }]
  }
}

function parseUnion_<
  T extends MinimumSchema[],
  Output extends T extends UnionSchemas ? VUnionOutput<T> : never,
>(
  getSchemasFn: (value: unknown) => T,
  parseSchemasFn: (schemas: T, value: unknown) => SafeParseOutput<Output>,
): SafeParseFn<Output> {
  return function ParseDiscriminatedUnion2(value: unknown): SafeParseOutput<Output> {
    return parseSchemasFn(getSchemasFn(value), value)
  }
}

export function parseUnion<T extends UnionSchemas, Output extends VUnionOutput<T>>(
  schemas: T,
  noMatchFoundInUnion?: DefaultErrorFn['noMatchFoundInUnion'],
): SafeParseFn<Output> {
  const parseSchemasFn = createUnionParser(noMatchFoundInUnion)
  return parseUnion_(() => schemas, parseSchemasFn)
}

function matchFnOnKey<T extends ObjectUnionSchemas>(
  key: PropertyKey,
  schemas: T,
  options: {
    keyNotFoundInDiscriminatedUnionDef?: DefaultErrorFn['keyNotFoundInDiscriminatedUnionDef']
    oneMatchOnly?: boolean
  } = {},
): (value: unknown) => MinimumObjectSchema[] {
  for (const schema of schemas) {
    const { propertySchemas } = schema.definition
    const keySchema = propertySchemas[key]
    if (keySchema === undefined) {
      throw new Error(
        (options.keyNotFoundInDiscriminatedUnionDef ?? errorFns.keyNotFoundInDiscriminatedUnionDef)(
          key,
          schema.type,
        ),
      )
    }
  }
  return function MatchFnOnKeyFn(value: unknown): MinimumObjectSchema[] {
    const matchedSchemas = [] as MinimumObjectSchema[]
    if (!isObjectType(value)) return matchedSchemas
    for (const schema of schemas) {
      const result = (schema.definition.propertySchemas[key] as MinimumSchema).safeParse(value[key])
      if (isResult(result)) {
        matchedSchemas.push(schema)
        if (options.oneMatchOnly ?? false) return matchedSchemas
      }
    }
    return matchedSchemas
  }
}

export function parseUnionKey<T extends ObjectUnionSchemas, Output extends VUnionOutput<T>>(
  key: PropertyKey,
  schemas: T,
  options: {
    noMatchFoundInUnion?: DefaultErrorFn['noMatchFoundInUnion']
    keyNotFoundInDiscriminatedUnionDef?: DefaultErrorFn['keyNotFoundInDiscriminatedUnionDef']
    oneMatchOnly?: boolean
  } = {},
): SafeParseFn<Output> {
  const parseSchemasFn = createUnionParser(options.noMatchFoundInUnion)
  return parseUnion_(matchFnOnKey(key, schemas, options), parseSchemasFn)
}

export function parseUnionLiteral<const T extends Readonly<LiteralUnionType>>(
  literals: T,
  noMatchFoundInLiteralUnion?: DefaultErrorFn['noMatchFoundInLiteralUnion'],
): SafeParseFn<T[number]> {
  return (value: unknown): SafeParseOutput<T[number]> => {
    if (literals.includes(value)) return [undefined, value as T[number]]
    return [
      {
        input: value,
        errors: [
          (noMatchFoundInLiteralUnion ?? errorFns.noMatchFoundInLiteralUnion)(value, literals),
        ],
      },
    ]
  }
}

function matchFnOnPropSchemaDef<T extends MinimumSchema[]>(
  matches: PropertySchemasDef,
  schemas: T,
): (value: unknown) => MinimumSchema[] {
  const parser = parsePropertySchemas(matches)
  return function MatchFnOnKey(value: unknown): MinimumSchema[] {
    if (!isObjectType(value)) return [] as MinimumSchema[]
    return isResult(parser(value)) ? schemas : ([] as MinimumSchema[])
  }
}

export function parseUnionAdvanced<T extends UnionSchemas, Output extends VUnionOutput<T>>(
  matches: PropertySchemasDef,
  schemasIfMatch: T,
  noMatchFoundInUnion?: DefaultErrorFn['noMatchFoundInUnion'],
): SafeParseFn<Output> {
  const parseSchemasFn = createUnionParser(noMatchFoundInUnion)
  return parseUnion_(matchFnOnPropSchemaDef(matches, schemasIfMatch), parseSchemasFn)
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * Utils
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

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

function schemasToTypeString(schemas: MinimumSchema[]) {
  let typeString = ''
  for (const schema of schemas) {
    typeString = `${typeString}${
      groupBaseTypes.includes(schema.baseType) ? `(${schema.type})` : schema.type
    }|`
  }
  return typeString.slice(0, -1)
}

export function initUnionTypes(baseObject: MinimumSchema): {
  vUnion: VUnionFn
  vOptional: VOptionalFn
  vNullable: VNullableFn
  vNullish: VNullishFn
  setUnionInstances: (undefinedInstance: VUndefined, nullInstance: VNull) => void
} {
  errorFns = baseObject[defaultErrorFnSym]
  let vUndefinedInstance: VUndefined
  let vNullInstance: VNull
  function setUnionInstances(undefinedInstance: VUndefined, nullInstance: VNull): void {
    vUndefinedInstance = undefinedInstance
    vNullInstance = nullInstance
  }

  const baseUnionObject = Object.create(baseObject)

  function vUnionLiterals(literals: LiteralUnionType, options: VLiteralOptions = {}) {
    const typeString = options.type ?? literals.map((value) => JSON.stringify(value)).join('|')

    return Object.defineProperties(
      createFinalBaseObject(
        baseUnionObject,
        options.parser ?? parseUnionLiteral(literals, options.noMatchFoundInLiteralUnion),
        typeString,
        options.baseType ?? 'literal union',
        options.definitionObject ?? {
          literals,
        },
      ),
      {
        definition: options.definitionObject ?? { literals },
        extract: {
          value(...keys: [unknown, ...unknown[]]) {
            const newKeys = intersection(literals, keys) as unknown as LiteralUnionType
            return vUnionLiterals(newKeys, options)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
        exclude: {
          value(...keys: [unknown, ...unknown[]]) {
            const newKeys = difference(literals, keys) as unknown as LiteralUnionType
            return vUnionLiterals(newKeys, options)
          },
          enumerable: true,
          configurable: false,
          writable: false,
        },
      },
    ) as VUnionLiterals<LiteralUnionType[number]>
  }

  function vUnionKey(
    key: PropertyKey,
    schemas: ObjectUnionSchemas,
    options: VUnionKeyOptions = {},
  ): VUnionKey<ObjectUnionSchemas> {
    return createFinalBaseObject(
      baseUnionObject,
      options.parser ?? parseUnionKey(key, schemas, options),
      options.type ?? schemasToTypeString(schemas),
      options.baseType ?? 'discriminated union',
      options.definitionObject ?? {
        key,
        schemas,
        get transformed() {
          for (const schema of schemas) if (isTransformed(schema)) return true

          return false
        },
      },
    ) as VUnionKey<ObjectUnionSchemas>
  }

  function vUnionAdv(
    matches: PropertySchemasDef,
    schemas: UnionSchemas,
    options: VUnionOptions = {},
  ): VUnionAdvanced<UnionSchemas> {
    return createFinalBaseObject(
      baseUnionObject,
      options.parser ?? parseUnionAdvanced(matches, schemas, options.noMatchFoundInUnion),
      options.type ?? schemasToTypeString(schemas),
      options.baseType ?? 'discriminated union',
      options.definitionObject ?? {
        matches,
        schemas,
        get transformed() {
          for (const schema of schemas) if (isTransformed(schema)) return true

          return false
        },
      },
    ) as VUnionAdvanced<UnionSchemas>
  }

  function vUnionFn(schemas: UnionSchemas, options: VUnionOptions = {}): VUnion<UnionSchemas> {
    return createFinalBaseObject(
      baseUnionObject,
      options.parser ?? parseUnion(schemas, options.noMatchFoundInUnion),
      options.type ?? schemasToTypeString(schemas),
      options.baseType ?? 'union',
      options.definitionObject ?? {
        schemas,
        get transformed() {
          for (const schema of schemas) if (isTransformed(schema)) return true

          return false
        },
      },
    ) as VUnion<UnionSchemas>
  }

  const vUnion: VUnionFn = Object.defineProperties(vUnionFn, {
    literals: {
      value: vUnionLiterals,
      enumerable: true,
      configurable: false,
      writable: false,
    },
    key: {
      value: vUnionKey,
      enumerable: true,
      configurable: false,
      writable: false,
    },
    advanced: {
      value: vUnionAdv,
      enumerable: true,
      configurable: false,
      writable: false,
    },
  }) as VUnionFn

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
