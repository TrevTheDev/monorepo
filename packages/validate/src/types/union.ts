/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError, DeepWriteable, Identity } from 'toolbelt'

import type { VNever, VNull, VUndefined } from './literal'
import { parseObject } from './object'
import type { MinimumObject } from './object'

import {
  MinimumSafeParsableObject,
  ParseFn,
  ParserObject,
  SafeParsableObject,
  SafeParseFn,
  VInfer,
  createFinalBaseObject,
  defaultErrorFnSym,
  parserObject,
} from './base'
import {
  SingleValidationError,
  ValidationErrors,
  createValidationBuilder,
} from './base validations'
import defaultErrorFn, { DefaultErrorFn } from './errorFns'
import { VIntersectionT } from './intersection'
import { VArrayInfinite } from './array'
import { VDefault } from './default'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * types and constants
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
let errorFns = defaultErrorFn

// type UnionParseErrorMessageFns = {
//   invalidObjectFn: DefaultErrorFn['parseObject']
//   invalidObjectPropertiesFn: DefaultErrorFn['invalidObjectPropertiesFn']
//   missingProperty: DefaultErrorFn['missingProperty']
//   missingPropertyInDef: DefaultErrorFn['missingPropertyInDef']
//   keyNotFoundInDiscriminatedUnionDef: DefaultErrorFn['keyNotFoundInDiscriminatedUnionDef']
//   keyNotFoundInDiscriminatedUnion: DefaultErrorFn['keyNotFoundInDiscriminatedUnion']
//   noKeyMatchFoundInDiscriminatedUnion: DefaultErrorFn['noKeyMatchFoundInDiscriminatedUnion']
//   parserIsNotOfTypeObject: DefaultErrorFn['parserIsNotOfTypeObject']
//   discriminatedUnionValueIsNotAnObject: DefaultErrorFn['discriminatedUnionValueIsNotAnObject']
// }

type DiscriminatedUnionParseErrorMessageFns = Pick<
  DefaultErrorFn,
  | 'parseObject'
  | 'invalidObjectPropertiesFn'
  | 'missingProperty'
  | 'missingPropertyInDef'
  | 'keyNotFoundInDiscriminatedUnionDef'
  | 'keyNotFoundInDiscriminatedUnion'
  | 'noKeyMatchFoundInDiscriminatedUnion'
  | 'parserIsNotOfTypeObject'
  | 'discriminatedUnionValueIsNotAnObject'
>

export type UnionType = MinimumSafeParsableObject[]

type ObjectUnionType = MinimumObject[]

type VUnionOutput<
  T extends UnionType,
  O extends any[] = {
    [I in keyof T]: VInfer<T[I]>
  },
> = O[number]

interface VUnion3<Output extends string, Type extends string = string, Input = unknown>
  extends SafeParsableObject<Output, Type, 'union', Input> {
  [parserObject]: ParserObject<Output, Type, 'union', Input, { readonly unionTypes: Output[] }>
  readonly definition: { readonly unionTypes: Output[] }
  customValidation<S extends unknown[]>(
    customValidator: (value: Output, ...otherArgs: S) => SingleValidationError | undefined,
    ...otherArgs: S
  ): this
}

interface VUnion2<
  T extends UnionType,
  Output = VUnionOutput<T>,
  Type extends string = string,
  Input = unknown,
> extends SafeParsableObject<Output, Type, 'union', Input> {
  [parserObject]: ParserObject<Output, Type, 'union', Input, { readonly unionTypes: T }>
  readonly definition: { readonly unionTypes: T }
  customValidation<S extends unknown[]>(
    customValidator: (value: Output, ...otherArgs: S) => SingleValidationError | undefined,
    ...otherArgs: S
  ): this
}

export type VUnion<
  T extends UnionType,
  Output = VUnionOutput<T>,
  Type extends string = string,
  Input = unknown,
> = Identity<VUnion2<T, Output, Type, Input>>

interface VOptional2<
  T extends MinimumSafeParsableObject,
  Type extends string = string,
  Input = unknown,
  Output = VInfer<T> | undefined,
> extends MinimumSafeParsableObject {
  // SafeParsableObject
  [parserObject]: ParserObject<Output, Type, 'optional', Input, { readonly wrappedType: T }>
  readonly definition: { readonly wrappedType: T }
  readonly type: Type
  readonly baseType: 'optional'
  parse: ParseFn<Input, Output>
  safeParse: SafeParseFn<Input, Output>
  optional(): this
  nullable(): VNullable<this>
  nullish(): VNullish<this>
  or<S extends MinimumSafeParsableObject>(type: S): VUnion<[this, S]>
  and<S extends MinimumSafeParsableObject>(type: S): VIntersectionT<[this, S]>
  array(): VArrayInfinite<this>
  default(defaultValue: Output): VDefault<Output, this>
  required(): T

  customValidation<S extends unknown[]>(
    customValidator: (value: Output, ...otherArgs: S) => SingleValidationError | undefined,
    ...otherArgs: S
  ): this
}

export type VOptional<
  T extends MinimumSafeParsableObject,
  Type extends string = string,
  Input = unknown,
  Output = VInfer<T> | undefined,
> = Identity<VOptional2<T, Type, Input, Output>>

interface VNullable2<
  T extends MinimumSafeParsableObject,
  Output = VInfer<T> | null,
  Type extends string = string,
  Input = unknown,
> extends MinimumSafeParsableObject {
  // SafeParsableObject
  [parserObject]: ParserObject<Output, Type, 'nullable', Input, { readonly wrappedType: T }>
  readonly definition: { readonly wrappedType: T }
  readonly type: Type
  readonly baseType: 'nullable'
  parse: ParseFn<Input, Output>
  safeParse: SafeParseFn<Input, Output>
  optional(): VOptional<this>
  nullable(): this
  nullish(): VNullish<this>
  or<S extends MinimumSafeParsableObject>(type: S): VUnion<[this, S]>
  and<S extends MinimumSafeParsableObject>(type: S): VIntersectionT<[this, S]>
  array(): VArrayInfinite<this>
  default(defaultValue: Output): VDefault<Output, this>

  customValidation<S extends unknown[]>(
    customValidator: (value: Output, ...otherArgs: S) => SingleValidationError | undefined,
    ...otherArgs: S
  ): this
}

export type VNullable<
  T extends MinimumSafeParsableObject,
  Output = VInfer<T> | null,
  Type extends string = string,
  Input = unknown,
> = Identity<VNullable2<T, Output, Type, Input>>

interface VNullish2<
  T extends MinimumSafeParsableObject,
  Output = VInfer<T> | null | undefined,
  Type extends string = string,
  Input = unknown,
> extends MinimumSafeParsableObject {
  // SafeParsableObject
  [parserObject]: ParserObject<Output, Type, 'nullish', Input, { readonly wrappedType: T }>
  readonly definition: { readonly wrappedType: T }
  readonly type: Type
  readonly baseType: 'nullish'
  parse: ParseFn<Input, Output>
  safeParse: SafeParseFn<Input, Output>
  optional(): VOptional<this>
  nullable(): VNullish<this>
  nullish(): this
  or<S extends MinimumSafeParsableObject>(type: S): VUnion<[this, S]>
  and<S extends MinimumSafeParsableObject>(type: S): VIntersectionT<[this, S]>
  array(): VArrayInfinite<this>
  default(defaultValue: Output): VDefault<Output, this>

  customValidation<S extends unknown[]>(
    customValidator: (value: Output, ...otherArgs: S) => SingleValidationError | undefined,
    ...otherArgs: S
  ): this
}

export type VNullish<
  T extends MinimumSafeParsableObject,
  Output = VInfer<T> | null | undefined,
  Type extends string = string,
  Input = unknown,
> = Identity<VNullish2<T, Output, Type, Input>>

type UnionOptions<Output = any> = {
  parser?: SafeParseFn<unknown, Output>
  type?: string
}

type DiscriminatedUnionOptions = {
  discriminatedUnionKey: string
  unmatchedPropertyParser: MinimumSafeParsableObject
  errorMessageFns?: Partial<DiscriminatedUnionParseErrorMessageFns>
  type: string
}

type StringLiteralUnionOptions<T extends string> = {
  stringLiteralUnion: true
  parser?: SafeParseFn<unknown, T>
  type?: string
  parseStringUnion?: Pick<DefaultErrorFn, 'parseStringUnion'>
}

interface PartialDiscriminatedUnionOptions {
  parser?: (
    typeParsers: ObjectUnionType,
    options: DiscriminatedUnionOptions,
  ) => (value: unknown) => ResultError<ValidationErrors, object>
  discriminatedUnionKey: string
  unmatchedPropertyParser?: MinimumSafeParsableObject
  errorMessageFns?: Partial<DiscriminatedUnionParseErrorMessageFns>
}

export type VUnionFn = {
  <T extends Readonly<ObjectUnionType>, TW extends ObjectUnionType = DeepWriteable<T>>(
    types: T,
    options: PartialDiscriminatedUnionOptions,
  ): VUnion<TW>
  <T extends readonly string[], TW extends string[] = DeepWriteable<T>>(
    types: T,
    options: StringLiteralUnionOptions<TW[number]>,
  ): VUnion3<TW[number]>
  <T extends Readonly<UnionType>, TW extends UnionType = DeepWriteable<T>>(
    types: T,
    options?: UnionOptions<VUnionOutput<TW>>,
  ): VUnion<TW>
  (
    types: [MinimumSafeParsableObject, MinimumSafeParsableObject, ...MinimumSafeParsableObject[]],
    options: PartialDiscriminatedUnionOptions | UnionOptions<any>,
  ): MinimumSafeParsableObject
}
export type VOptionalFn = <T extends MinimumSafeParsableObject>(
  type: T,
  parser?: (
    typeParsers: SafeParseFn<unknown, any>[],
    value: unknown,
  ) => ResultError<ValidationErrors, any>,
) => VOptional<T>
export type VNullableFn = <T extends MinimumSafeParsableObject>(
  type: T,
  parser?: (
    typeParsers: SafeParseFn<unknown, any>[],
    value: unknown,
  ) => ResultError<ValidationErrors, any>,
) => VNullable<T>
export type VNullishFn = <T extends MinimumSafeParsableObject>(
  type: T,
  parser?: (
    typeParsers: SafeParseFn<unknown, any>[],
    value: unknown,
  ) => ResultError<ValidationErrors, any>,
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
  const typeParsers = types.map((type) => (value: unknown) => type.safeParse(value))
  return (value: unknown): ResultError<ValidationErrors, Output> => {
    const errors: string[] = []
    // eslint-disable-next-line no-restricted-syntax
    for (const vType of typeParsers) {
      const result = vType(value)
      if (result[0] === undefined) return result
      errors.push(...result[0].errors)
    }
    return [{ input: value, errors }, undefined]
  }
}

function isObject(mspo: MinimumSafeParsableObject | MinimumObject): mspo is MinimumObject {
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
          (options.parseStringUnion as any) || errorFns.parseStringUnion(value, stringUnionDef),
        ],
      },
      undefined,
    ]
  }
}

export function parseDiscriminatedUnion<
  T extends ObjectUnionType,
  Output extends object = {
    [K in keyof T]: VInfer<T[K]> extends object ? VInfer<T[K]> : never
  }[number],
>(
  parsers: T,
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
    parserIsNotOfTypeObject: errorFns.parserIsNotOfTypeObject,
    discriminatedUnionValueIsNotAnObject: errorFns.discriminatedUnionValueIsNotAnObject,
    ...options.errorMessageFns,
  }
  const { discriminatedUnionKey, unmatchedPropertyParser } = options
  const typeParsers = parsers.map((parser: MinimumSafeParsableObject | MinimumObject) => {
    if (!isObject(parser)) throw new Error(errorMessageFns.parserIsNotOfTypeObject(parser))
    // console.log(parser.definition.shape.propertyParsers)
    const propertyParser = parser.definition.propertyParsers /// [key]
    const keyParser = propertyParser[discriminatedUnionKey]
    if (keyParser === undefined) {
      throw new Error(
        errorMessageFns.keyNotFoundInDiscriminatedUnionDef(discriminatedUnionKey, parser.type),
      )
    }
    const minimumObjectDefinition = {
      propertyParsers: propertyParser,
      unmatchedPropertyParser,
      options: { type: options.type },
    }
    const propParser = parseObject(minimumObjectDefinition, errorMessageFns)
    return [(value) => keyParser.safeParse(value), propParser] as [
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
      for (const vType of typeParsers) {
        const [keyParser, propertyParser] = vType
        const result = keyParser(keyValueToMatch)
        if (result[0] === undefined) {
          const oResult = propertyParser(value)
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
                  parsers as ObjectUnionType,
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
 * all validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type UnionValidations<T> = [
  [
    'customValidation',
    (
      customValidator: (value: T, ...otherArgs: unknown[]) => SingleValidationError | undefined,
      ...otherArgs: unknown[]
    ) => (value: T) => SingleValidationError | undefined,
  ],
]
const unionValidations_ = [
  [
    'customValidation',
    <T>(
        customValidator: (value: T, ...otherArgs: unknown[]) => SingleValidationError | undefined,
        ...otherArgs: unknown[]
      ) =>
      (value: T) =>
        customValidator(value, ...otherArgs),
  ],
] as const
const unionValidations = unionValidations_ as UnionValidations<any>

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
export const stringArrayToUnionTypeString = (typeStrings: string[]) => typeStrings.join('|')
/**
 * Wraps each item in a string array in single quotes e.g. ['A','B'] becomes ["'A'","'B'"]
 * @param typeStrings - any array of strings
 * @returns
 */
export const wrapStringArrayInSingleQuotes = (typeStrings: string[]) =>
  typeStrings.map((string) => `'${string}'`)

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

export function initUnionTypes(baseObject: MinimumSafeParsableObject) {
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

  const baseUnionObject = createValidationBuilder(baseObject, unionValidations)

  function vUnionFn(
    types: UnionType | ObjectUnionType | string[],
    options:
      | PartialDiscriminatedUnionOptions
      | UnionOptions<VUnionOutput<UnionType>>
      | StringLiteralUnionOptions<string> = {},
    baseType = 'union',
    definitionObject: object | undefined = undefined,
  ): VUnion<any> | VUnion3<string> {
    const typeString = stringArrayToUnionTypeString(types.map((type) => type.type))

    if ('discriminatedUnionKey' in options) {
      const fOptions = {
        unmatchedPropertyParser: vNeverInstance,
        ...options,
        errorMessageFns: { ...options.errorMessageFns },
        type: typeString,
      } as DiscriminatedUnionOptions
      const parserFn = options.parser
        ? options.parser(types as any, fOptions as any)
        : parseDiscriminatedUnion(types as ObjectUnionType, fOptions)
      return createFinalBaseObject(baseUnionObject, parserFn, typeString, 'discriminated union', {
        unionTypes: types,
        discriminatedUnionKey: fOptions.discriminatedUnionKey,
        unmatchedPropertyParser: fOptions.unmatchedPropertyParser,
      }) as VUnion<any>
    }
    if ('stringLiteralUnion' in options) {
      return createFinalBaseObject(
        baseUnionObject,
        options.parser ? options.parser : parseStringUnion(types as string[], options),
        typeString,
        'string union',
        {
          unionTypes: types,
        },
      ) as VUnion3<string>
    }
    return createFinalBaseObject(
      baseUnionObject,
      options.parser ? options.parser : parseUnion(types as UnionType),
      typeString,
      baseType,
      definitionObject === undefined
        ? {
            unionTypes: types,
          }
        : definitionObject,
    ) as VUnion<any>
  }

  const vUnion: VUnionFn = ((types, options) => vUnionFn(types, options)) as VUnionFn

  type BasicOptions<Output = any> = {
    parser?: SafeParseFn<unknown, Output>
  }

  const vOptional = function vOptionalFn<T extends MinimumSafeParsableObject>(
    type: T,
    options: BasicOptions<VUnionOutput<[T, VUndefined]>> = {},
  ): VOptional<T> {
    const result = vUnionFn([type, vUndefinedInstance], options, 'optional', {
      wrappedType: type,
    })
    Object.defineProperties(result, {
      required: {
        value() {
          return type
        },
      },
    })
    return result as unknown as VOptional<T>
  } as VOptionalFn

  const vNullable: VNullableFn = function vNullableFn<T extends MinimumSafeParsableObject>(
    type: T,
    options: BasicOptions<VUnionOutput<[T, VNull]>> = {},
  ): VNullable<T> {
    const result = vUnionFn([type, vNullInstance], options, 'nullable', {
      wrappedType: type,
    })
    return result as unknown as VNullable<T>
  } as VNullableFn

  const vNullish: VNullishFn = function vNullableFn<T extends MinimumSafeParsableObject>(
    type: T,
    options: BasicOptions<VUnionOutput<[T, VNull, VUndefined]>> = {},
  ): VNullish<T> {
    const result = vUnionFn([type, vNullInstance, vUndefinedInstance], options, 'nullish', {
      wrappedType: type,
    })
    return result as unknown as VNullish<T>
  } as VNullishFn

  return { vUnion, vOptional, vNullable, vNullish, setUnionInstances }
}
