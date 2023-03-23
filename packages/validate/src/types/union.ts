/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError, DeepWriteable } from 'toolbelt'

import {
  SafeParseFn,
  SingleValidationError,
  ValidationArray,
  ValidationErrors,
  SafeParsableObject,
  VInfer,
  // ValidationItem,
  CreateBaseValidationBuilderGn,
  MinimumSafeParsableObject,
  SafeParsableObjectBase,
} from './base'
import type { VNull, VUndefined } from './literal'
import defaultErrorFn from './defaultErrors'
import { MinimumObject, parseObject } from './object'
import { vNeverInstance } from './init'

function unionParse(types: UnionType) {
  const typeParsers = types.map((type) => (value: unknown) => type.safeParse(value))
  return (value: unknown): ResultError<ValidationErrors, any> => {
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

const defaultUnionErrors = {
  // ...defaultObjectErrors,
  invalidObjectFn: defaultErrorFn.parseObject,
  invalidObjectPropertiesFn: defaultErrorFn.invalidObjectPropertiesFn,
  missingProperty: defaultErrorFn.missingProperty,
  missingPropertyInDef: defaultErrorFn.missingPropertyInDef,
  keyNotFoundInDiscriminatedUnionDef: defaultErrorFn.keyNotFoundInDiscriminatedUnionDef,
  keyNotFoundInDiscriminatedUnion: defaultErrorFn.keyNotFoundInDiscriminatedUnion,
  noKeyMatchFoundInDiscriminatedUnion: defaultErrorFn.noKeyMatchFoundInDiscriminatedUnion,
  parserIsNotOfTypeObject: defaultErrorFn.parserIsNotOfTypeObject,
  discriminatedUnionValueIsNotAnObject: defaultErrorFn.discriminatedUnionValueIsNotAnObject,
}

type UnionParseErrorMessageFns = typeof defaultUnionErrors

function discriminatedUnionParse(
  parsers: UnionType | ObjectUnionType,
  options: DiscriminatedUnionOptions,
) {
  const { discriminatedUnionKey, unmatchedPropertyParser, errorMessageFns } = options
  const typeParsers = parsers.map((parser: MinimumSafeParsableObject | MinimumObject) => {
    if (!('shape' in parser)) throw new Error(errorMessageFns.parserIsNotOfTypeObject(parser))
    const propertyParser = parser.shape.propertyParsers /// [key]
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
  return (value: unknown): ResultError<ValidationErrors, object> => {
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
          if (oResult[0] === undefined) return oResult
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
export type UnionValidations<T> = [
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
export const unionValidations = unionValidations_ as UnionValidations<any>

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * VUnion
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

type UnionType = MinimumSafeParsableObject[]

type ObjectUnionType = MinimumObject[]

type VUnionOutput<
  T extends UnionType,
  O extends any[] = {
    [I in keyof T]: VInfer<T[I]>
  },
> = O[number]

// interface VUnion2<Output, Type extends string, Input, T extends UnionType>
//   extends SafeParsableObject<Output, Type, Input> {
//   unionTypes: T
//   customValidation(
//     customValidator: (value: Output, ...otherArgs: unknown[]) => SingleValidationError | undefined,
//     ...otherArgs: unknown[]
//   ): (value: Output) => SingleValidationError | undefined
// }

export interface VUnion<
  T extends UnionType,
  Output = VUnionOutput<T>,
  // Validations extends ValidationArray<Output> = UnionValidations<Output>,
  Type extends string = string,
  Input = unknown,
> extends SafeParsableObject<Output, Type, Input> {
  unionTypes: T
  customValidation<S extends unknown[]>(
    customValidator: (value: Output, ...otherArgs: S) => SingleValidationError | undefined,
    ...otherArgs: S
  ): this
}

// interface VOptional2<Output, Type extends string, Input, T extends MinimumSafeParsableObject>
//   extends SafeParsableObjectBase<Output, Type, Input> {
//   nonOptionalType: T
//   optional(): this
//   nullable(): VNullable<this>
//   required(): T
//   isOptional(): true
//   isNullable(): false
// }

export interface VOptional<
  T extends MinimumSafeParsableObject,
  // Validations extends ValidationArray<VInfer<T> | undefined> = UnionValidations<
  //   VInfer<T> | undefined
  // >,
  Type extends string = string,
  Input = unknown,
  Output = VInfer<T> | undefined,
> extends SafeParsableObjectBase<Output, Type, Input> {
  nonOptionalType: T
  optional(): this
  nullable(): VNullable<this>
  required(): T
  isOptional(): true
  // isNullable(): false
  customValidation<S extends unknown[]>(
    customValidator: (value: Output, ...otherArgs: S) => SingleValidationError | undefined,
    ...otherArgs: S
  ): this
}

// interface VNullable2<Output, Type extends string, Input, T extends MinimumSafeParsableObject>
//   extends SafeParsableObjectBase<Output, Type, Input> {
//   nonNullableType: T
//   optional(): VOptional<this>
//   nullable(): this
//   required(): this
//   isOptional(): false
//   isNullable(): true
// }

export interface VNullable<
  T extends MinimumSafeParsableObject,
  Output = VInfer<T> | null,
  // Validations extends ValidationArray<Output> = UnionValidations<Output>,
  Type extends string = string,
  Input = unknown,
  // RT extends MinimumSafeParsableObject = VNullable2<Output, Type, Input, T> & {
  //   // default validations
  //   [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
  //     ? Validations[I] extends ValidationItem<any>
  //       ? Validations[I][0]
  //       : never
  //     : never]: (
  //     ...args: Parameters<Validations[I][1]>
  //   ) => VNullable<T, Output, Validations, Type, Input>
  // },
> extends SafeParsableObjectBase<Output, Type, Input> {
  nonNullableType: T
  optional(): VOptional<this>
  nullable(): this
  required(): this
  isOptional(): false
  // isNullable(): true
  customValidation<S extends unknown[]>(
    customValidator: (value: Output, ...otherArgs: S) => SingleValidationError | undefined,
    ...otherArgs: S
  ): this
}

// interface VNullishable2<Output, Type extends string, Input, T extends MinimumSafeParsableObject>
//   extends SafeParsableObjectBase<Output, Type, Input> {
//   nonNullableType: T
//   optional(): this
//   nullable(): this
//   mullish(): this
//   required(): this
//   isOptional(): false
//   isNullable(): false
//   isNullish(): true
// }

export interface VNullish<
  T extends MinimumSafeParsableObject,
  Output = VInfer<T> | null | undefined,
  // Validations extends ValidationArray<Output> = UnionValidations<Output>,
  Type extends string = string,
  Input = unknown,
  // RT extends MinimumSafeParsableObject = VNullishable2<Output, Type, Input, T> & {
  //   // default validations
  //   [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
  //     ? Validations[I] extends ValidationItem<any>
  //       ? Validations[I][0]
  //       : never
  //     : never]: (
  //     ...args: Parameters<Validations[I][1]>
  //   ) => VNullable<T, Output, Validations, Type, Input>
  // },
> extends SafeParsableObjectBase<Output, Type, Input> {
  nonNullableType: T
  optional(): VOptional<this>
  nullable(): this
  mullish(): this
  required(): this
  isOptional(): false
  // isNullable(): false
  // isNullish(): true
  customValidation<S extends unknown[]>(
    customValidator: (value: Output, ...otherArgs: S) => SingleValidationError | undefined,
    ...otherArgs: S
  ): this
}

type UnionOptions<Output = any> = {
  parser?: (
    typeParsers: UnionType,
    options: object,
  ) => (value: unknown) => ResultError<ValidationErrors, Output>
  errorMessageFns: UnionParseErrorMessageFns
  type: string
}

type DiscriminatedUnionOptions = {
  discriminatedUnionKey: string
  unmatchedPropertyParser: MinimumSafeParsableObject
  errorMessageFns: UnionParseErrorMessageFns
  type: string
}

interface PartialDiscriminatedUnionOptions {
  parser?: (
    typeParsers: ObjectUnionType,
    options: DiscriminatedUnionOptions,
  ) => (value: unknown) => ResultError<ValidationErrors, object>
  discriminatedUnionKey: string
  unmatchedPropertyParser?: MinimumSafeParsableObject
  errorMessageFns?: Partial<UnionParseErrorMessageFns>
}

// type DiscriminatedVUnionOutput<
//   T extends ObjectUnionType,
//   O = {
//     [I in keyof T]: VInfer<T[I]> extends object ? VInfer<T[I]> : never
//   },
// > = O[number & string]

// interface VUnion2<Output, Type extends string, Input, T extends UnionType>
//   extends SafeParsableObject<Output, Type, Input> {
//   unionTypes: T
// }

export type VUnionFn = {
  <T extends Readonly<ObjectUnionType>, TW extends ObjectUnionType = DeepWriteable<T>>(
    types: T,
    options: PartialDiscriminatedUnionOptions,
  ): VUnion<TW>
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

export function initUnionTypes(createBaseValidationBuilder: CreateBaseValidationBuilderGn) {
  let vUndefinedInstance: VUndefined
  let vNullInstance: VNull
  function setInstances(undefinedInstance: VUndefined, nullInstance: VNull) {
    vUndefinedInstance = undefinedInstance
    vNullInstance = nullInstance
  }

  // TODO: Add const for T below
  const vUnion = function vUnionFn(
    types: UnionType,
    options: PartialDiscriminatedUnionOptions | Partial<UnionOptions> = {},
  ) {
    const typeString = stringArrayToUnionTypeString(types.map((type) => type.type))

    let finalParser

    if ('discriminatedUnionKey' in options) {
      const fOptions = {
        unmatchedPropertyParser: vNeverInstance,
        ...options,
        errorMessageFns: { ...defaultUnionErrors, ...(options.errorMessageFns ?? {}) },
        type: typeString,
      } as DiscriminatedUnionOptions
      finalParser = discriminatedUnionParse(types, fOptions)
    } else {
      const fOptions = { ...options, type: typeString } as UnionOptions
      finalParser = options.parser
        ? options.parser(types as any, fOptions as any)
        : unionParse(types)
    }
    const uUnion = createBaseValidationBuilder(
      finalParser,
      unionValidations_ as unknown as ValidationArray<any>,
      typeString,
    )
    return Object.defineProperty(uUnion, 'unionTypes', { value: types })
  } as VUnionFn

  const vOptional = function vOptionalFn<T extends MinimumSafeParsableObject>(
    type: T,
    parser?: (
      typeParsers: SafeParseFn<unknown, any>[],
      value: unknown,
    ) => ResultError<ValidationErrors, any>,
  ): VOptional<T> {
    const result = (vUnion as unknown as any)([type, vUndefinedInstance], parser)
    Object.defineProperties(result, {
      nonOptionalType: { value: type },
      required: {
        value() {
          return type.required()
        },
      },
    })
    return result as unknown as VOptional<T>
  } as VOptionalFn

  const vNullable: VNullableFn = function vNullableFn<T extends MinimumSafeParsableObject>(
    type: T,
    parser?: (
      typeParsers: SafeParseFn<unknown, any>[],
      value: unknown,
    ) => ResultError<ValidationErrors, any>,
  ): VNullable<T> {
    const result = (vUnion as unknown as any)([type, vNullInstance], parser)
    Object.defineProperties(result, {
      nonNullableType: { value: type },
    })
    return result as unknown as VNullable<T>
  } as VNullableFn

  const vNullish: VNullishFn = function vNullableFn<T extends MinimumSafeParsableObject>(
    type: T,
    parser?: (
      typeParsers: SafeParseFn<unknown, any>[],
      value: unknown,
    ) => ResultError<ValidationErrors, any>,
  ): VNullish<T> {
    const result = (vUnion as unknown as any)([type, vNullInstance, vUndefinedInstance], parser)
    Object.defineProperties(result, {
      nonNullishType: { value: type },
    })
    return result as unknown as VNullish<T>
  } as VNullishFn

  return { vUnion, vOptional, vNullable, vNullish, setInstances }
}
