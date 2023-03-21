/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError } from 'toolbelt'
import { DeepWriteable, Identity, OmitTuple, PickTuple } from 'toolbelt'
import { MinimumSafeParsableRestArray, SafeParsableRestArray } from './array rest'
import {
  SafeParseFn,
  SingleValidationError,
  ValidationArray,
  ValidationErrors,
  VInfer,
  ValidationItem,
  CreateBaseValidationBuilderGn,
  MinimumSafeParsableObject,
  ParseFn,
} from './base'
import defaultErrorFn from './defaultErrors'
import { VNullable, VOptional } from './union'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export type SingleArrayValidationError = [index: number, errors: SingleValidationError[]]

const internalDeepPartial = Symbol('internalDeepPartial')
export type InternalDeepPartial = typeof internalDeepPartial
const internalPartial = Symbol('internalPartial')
export type InternalPartial = typeof internalDeepPartial

const defaultArrayErrors = {
  invalidArrayFn: defaultErrorFn.parseArray,
  invalidArrayElementsFn: defaultErrorFn.invalidArrayElementsFn,
  arrayDefinitionElementMustBeOptional: defaultErrorFn.arrayDefinitionElementMustBeOptional,
  elementRequiredAt: defaultErrorFn.elementRequiredAt,
  extraArrayItemsFn: defaultErrorFn.extraArrayItemsFn,
  restCantFollowRest: defaultErrorFn.restCantFollowRest,
  optionalElementCantFollowRest: defaultErrorFn.optionalElementCantFollowRest,
  missingItemInItemParsers: defaultErrorFn.missingItemInItemParsers,
  unableToSelectItemFromArray: defaultErrorFn.unableToSelectItemFromArray,
}

type ArrayErrorOptions = typeof defaultArrayErrors

export type StratifiedParsers = [
  MinimumSafeParsableObject[],
  MinimumSafeParsableObject | undefined,
  MinimumSafeParsableObject[],
]

export interface MinimumSafeParsableArray extends MinimumSafeParsableObject {
  parse: ParseFn<any, unknown[]>
  safeParse: SafeParseFn<any, unknown[]>
  partial(): MinimumSafeParsableObject
  [internalPartial](): MinimumSafeParsableArray
  deepPartial(): MinimumSafeParsableObject
  [internalDeepPartial](): MinimumSafeParsableArray
  required(): MinimumSafeParsableArray
  deepRequired(): MinimumSafeParsableArray
  isOptional(): false
  isNullable(): false
  readonly spread: MinimumSafeParsableRestArray
  readonly stratifiedParsers: StratifiedParsers
}

interface SafeParsableArray<Output extends unknown[], Type extends string, Input>
  extends MinimumSafeParsableArray {
  readonly spread: SafeParsableRestArray<this>
  readonly type: Type
  parse: ParseFn<Input, Output>
  safeParse: SafeParseFn<Input, Output>
  optional(): VOptional<this>
  nullable(): VNullable<this>
  partial(): ReturnType<ReturnType<this[InternalPartial]>['optional']>
  deepPartial(): ReturnType<ReturnType<this[InternalDeepPartial]>['optional']>
}

export type ValidArrayItem = MinimumSafeParsableObject | MinimumSafeParsableRestArray
type ValidArrayItems = ValidArrayItem[]

type ParseInfiniteArray = <T extends MinimumSafeParsableObject>(
  itemParser: T,
  errorMessageFns?: Pick<ArrayErrorOptions, 'invalidArrayFn' | 'invalidArrayElementsFn'>,
) => (value: unknown) => ResultError<ValidationErrors, T[]>

function parseArrayElements(
  value: unknown[],
  stratifiedParsers: StratifiedParsers,
  errorMessageFns: Pick<ArrayErrorOptions, 'elementRequiredAt' | 'extraArrayItemsFn'>,
): ResultError<SingleArrayValidationError[], unknown[]> {
  const valueErrors = [] as SingleArrayValidationError[]

  stratifiedParsers[0].forEach((parser, index) => {
    const result = parser.safeParse(value[index])
    if (result[0]) valueErrors.push([index, result[0].errors])
  })
  const startLength = stratifiedParsers[0].length
  const endLength = stratifiedParsers[2].length
  const valueLength = value.length
  const requiredLength = stratifiedParsers[2].length + stratifiedParsers[0].length
  const infiniteParser = stratifiedParsers[1]
  if (endLength !== 0) {
    if (requiredLength > valueLength) {
      let missing = requiredLength - valueLength
      while (missing > 0) {
        valueErrors.push([
          requiredLength - missing,
          [errorMessageFns.elementRequiredAt(value, requiredLength - missing)],
        ])
        missing -= 1
      }
    } else {
      stratifiedParsers[2].forEach((parser, index) => {
        const i = valueLength - endLength + index
        const result = parser.safeParse(value[i])
        if (result[0]) valueErrors.push([i, result[0].errors])
      })
    }
  } else if (infiniteParser === undefined) {
    let sLength = startLength
    while (sLength < valueLength) {
      valueErrors.push([sLength, [errorMessageFns.extraArrayItemsFn(value, sLength)]])
      sLength += 1
    }
  }

  if (infiniteParser !== undefined) {
    for (let i = startLength; i < valueLength - endLength; i += 1) {
      const result = infiniteParser.safeParse(value[i])
      if (result[0]) valueErrors.push([i, result[0].errors])
    }
  }

  return valueErrors.length === 0 ? [undefined, value] : [valueErrors, undefined]
}

type ParseFiniteArray = typeof parseFiniteArray

export function parseFiniteArray<T extends unknown[]>(
  typeString: string,
  stratifiedParsers: StratifiedParsers,
  errorMessageFns: Pick<
    ArrayErrorOptions,
    'invalidArrayFn' | 'elementRequiredAt' | 'extraArrayItemsFn' | 'invalidArrayElementsFn'
  >,
) {
  return function ParseFiniteArrayFn(value: unknown): ResultError<ValidationErrors, T> {
    if (Array.isArray(value)) {
      const result = parseArrayElements(value, stratifiedParsers, errorMessageFns)
      return result[0] === undefined
        ? (result as [error: undefined, result: T])
        : [
            {
              input: value,
              errors: [errorMessageFns.invalidArrayElementsFn(value, typeString, result[0])],
            },
            undefined,
          ]
    }
    return [
      {
        input: value,
        errors: [errorMessageFns.invalidArrayFn(value, typeString)],
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

export function minimumArrayLength(
  length: number,
  errorReturnValueFn: (
    invalidValue: unknown[],
    minLength: number,
  ) => SingleValidationError = defaultErrorFn.minimumArrayLength,
) {
  return (value: unknown[]) =>
    value.length < length ? errorReturnValueFn(value, length) : undefined
}

export function maximumArrayLength(
  length: number,
  errorReturnValueFn: (
    invalidValue: unknown[],
    maxLength: number,
  ) => SingleValidationError = defaultErrorFn.maximumArrayLength,
) {
  return (value: unknown[]) =>
    value.length > length ? errorReturnValueFn(value, length) : undefined
}

export function requiredArrayLength(
  length: number,
  errorReturnValueFn: (
    invalidValue: unknown[],
    requiredLength: number,
  ) => SingleValidationError = defaultErrorFn.requiredArrayLength,
) {
  return (value: unknown[]) =>
    value.length !== length ? errorReturnValueFn(value, length) : undefined
}

export function nonEmpty(
  errorReturnValueFn: (
    invalidValue: unknown[],
  ) => SingleValidationError = defaultErrorFn.arrayNonEmpty,
) {
  return (value: unknown[]) => (value.length < 1 ? errorReturnValueFn(value) : undefined)
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * all validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export type ArrayValidations = DeepWriteable<typeof arrayValidations_>

const arrayValidations_ = [
  ['min', minimumArrayLength],
  ['max', maximumArrayLength],
  ['length', requiredArrayLength],
  ['nonempty', nonEmpty],
  [
    'customValidation',
    (
        customValidator: (
          value: any[],
          ...otherArgs: unknown[]
        ) => SingleValidationError | undefined,
        ...otherArgs: unknown[]
      ) =>
      (value: any[]) =>
        customValidator(value, ...otherArgs),
  ],
] as const // [propName: string, validationFn: (...args) => (value: string) => string | undefined][]

export const arrayValidations = arrayValidations_ as ArrayValidations

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vString
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

interface VArrayInfinite2<
  Output extends any[],
  Type extends string,
  Input,
  T extends MinimumSafeParsableObject,
> extends SafeParsableArray<Output, Type, Input> {
  readonly infiniteArrayItemParser: T
  [internalPartial](): VArrayInfinite<T>
  required(): VArrayInfinite<ReturnType<T['required']>>
  [internalDeepPartial](): T extends { deepPartial(): MinimumSafeParsableObject }
    ? VArrayInfinite<ReturnType<T['deepPartial']>>
    : T extends { partial(): MinimumSafeParsableObject }
    ? VArrayInfinite<ReturnType<T['partial']>>
    : VArrayInfinite<T>
  deepRequired(): T extends { deepRequired(): MinimumSafeParsableObject }
    ? VArrayInfinite<ReturnType<T['deepRequired']>>
    : VArrayInfinite<ReturnType<T['required']>>
}

export type VArrayInfinite<
  T extends MinimumSafeParsableObject,
  Output extends any[] = VInfer<T>[],
  Type extends string = string,
  Input = unknown,
  Validations extends ValidationArray<any[]> = ArrayValidations,
> = Identity<
  VArrayInfinite2<Output, Type, Input, T> & {
    // default validations
    [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
      ? Validations[I] extends ValidationItem<any>
        ? Validations[I][0]
        : never
      : never]: (
      ...args: Parameters<Validations[I][1]>
    ) => VArrayInfinite<T, Output, Type, Input, Validations>
  }
>

type ArrayToOptional<
  T extends ValidArrayItems,
  Type extends 'optional' | 'nullable' | 'required',
  Result extends [...itemParsers: ValidArrayItems] = [],
> = T extends [infer H extends ValidArrayItem, ...infer R extends ValidArrayItems]
  ? ArrayToOptional<R, Type, [...Result, ReturnType<H[Type]>]>
  : []
type DeepPartialArray<
  T extends ValidArrayItems,
  Type extends 'deepPartial' | 'deepRequired',
  Result extends [...itemParsers: ValidArrayItems] = [],
> = T extends [infer H extends ValidArrayItem, ...infer R extends ValidArrayItems]
  ? DeepPartialArray<
      R,
      Type,
      Type extends 'deepPartial'
        ? [
            ...Result,
            H extends { deepPartial(): MinimumSafeParsableObject }
              ? ReturnType<H['deepPartial']>
              : ReturnType<H['optional']>,
          ]
        : [
            ...Result,
            H extends { deepRequired(): MinimumSafeParsableObject }
              ? ReturnType<ReturnType<H['deepRequired']>['required']>
              : ReturnType<H['required']>,
          ]
    >
  : Result

interface VArrayFinite2<Output extends any[], Type extends string, Input, T extends ValidArrayItems>
  extends SafeParsableArray<Output, Type, Input> {
  readonly finiteArrayParsers: T
  required(): VArrayFinite<ArrayToOptional<T, 'required'>>
  [internalPartial](): VArrayFinite<ArrayToOptional<T, 'optional'>>
  [internalDeepPartial](): VArrayFinite<DeepPartialArray<T, 'deepPartial'>>
  deepRequired(): VArrayFinite<DeepPartialArray<T, 'deepRequired'>>
  pick<S extends (keyof T & number)[]>(
    ...keys: S
  ): PickTuple<T, S[number]> extends ValidArrayItems ? VArrayFinite<PickTuple<T, S[number]>> : never
  omit<S extends (keyof T & number)[]>(
    ...keys: S
  ): OmitTuple<T, S[number]> extends ValidArrayItems ? VArrayFinite<OmitTuple<T, S[number]>> : never
  extends<R extends ValidArrayItems>(...extendedItemParsers: R): VArrayFinite<[...T, ...R]>
  merge<R extends VArrayFinite<any>>(
    vArray: R,
  ): R extends VArrayFinite<infer S extends ValidArrayItems> ? VArrayFinite<[...T, ...S]> : never
}

export type VArrayFinite<
  T extends ValidArrayItems,
  Output extends any[] = FiniteArrayBuilder<T>,
  Type extends string = string,
  Input = unknown,
  Validations extends ValidationArray<any[]> = ArrayValidations,
> = Identity<
  VArrayFinite2<Output, Type, Input, T> & {
    // default validations
    [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
      ? Validations[I] extends ValidationItem<any>
        ? Validations[I][0]
        : never
      : never]: (
      ...args: Parameters<Validations[I][1]>
    ) => VArrayFinite<T, Output, Type, Input, Validations>
  }
>

type vInferSpreadArrayItem<T extends ValidArrayItem> = T extends MinimumSafeParsableRestArray
  ? VInfer<T['vArray']> extends any[]
    ? VInfer<T['vArray']>
    : never
  : never

type vInferArrayItem<T extends ValidArrayItem> = T extends MinimumSafeParsableRestArray
  ? VInfer<T['vArray']> extends any[]
    ? VInfer<T['vArray']>
    : never
  : T extends MinimumSafeParsableObject
  ? VInfer<T>
  : never

type IfA<State extends 'A' | 'B', Then, Else> = State extends 'A' ? Then : Else
type IfOptional<T extends ValidArrayItem, Then, Else> = T extends MinimumSafeParsableObject
  ? ReturnType<T['isOptional']> extends true
    ? Then
    : Else
  : Else
type IfRest<T extends ValidArrayItem, Then, Else> = T extends MinimumSafeParsableRestArray
  ? Then
  : T extends MinimumSafeParsableObject
  ? Else
  : never
type IfOptionalRequired<MustBeOptional extends boolean, Then, Else> = MustBeOptional extends true
  ? Then
  : Else

type FiniteArrayBuilder<
  T extends ValidArrayItems,
  A extends any[] = [],
  B extends any[] = [],
  C extends any[] = [],
  State extends 'A' | 'B' = 'A',
  MustBeOptional extends boolean = false,
> = T extends [infer H extends ValidArrayItem, ...infer R extends ValidArrayItems]
  ? {
      addToA: FiniteArrayBuilder<R, [...A, vInferArrayItem<H>], [], [], 'A', false>
      addToAOptional: FiniteArrayBuilder<
        R,
        [...A, Exclude<vInferArrayItem<H>, undefined>?],
        [],
        [],
        'A',
        true
      >
      addToB: FiniteArrayBuilder<R, A, vInferSpreadArrayItem<H>, [], 'B'>
      addToC: FiniteArrayBuilder<R, A, B, [...C, vInferArrayItem<H>], 'B', false>
      invalid: never
      ugh: never
    }[IfA<
      State,
      IfRest<
        H,
        'addToB',
        IfOptional<H, 'addToAOptional', IfOptionalRequired<MustBeOptional, 'invalid', 'addToA'>>
      >,
      IfRest<H, 'invalid', IfOptional<H, 'invalid', 'addToC'>>
    >]
  : [...A, ...B, ...C]

export type VArrayFn = {
  <T extends MinimumSafeParsableObject>(
    itemParser: T,
    options?: Partial<ArrayOptions>,
  ): VArrayInfinite<T>
  <T extends readonly (MinimumSafeParsableObject | MinimumSafeParsableRestArray)[]>(
    itemParsers: T & Readonly<T>,
    options?: Partial<ArrayOptions>,
  ): VArrayFinite<DeepWriteable<T>>
  (itemParsers: ValidArrayItem, options: Partial<ArrayOptions>):
    | VArrayInfinite<any>
    | VArrayFinite<any>
}

type ArrayOptions = ArrayErrorOptions & {
  finiteArrayParser?: ParseFiniteArray
  infiniteArrayParser?: ParseInfiniteArray
}

export function initArray(createBaseValidationBuilder: CreateBaseValidationBuilderGn): VArrayFn {
  function finiteArray(itemParsers: ValidArrayItems, options: ArrayOptions): VArrayFinite<any> {
    const startParsers = [] as MinimumSafeParsableObject[]
    let restParser: MinimumSafeParsableObject | undefined
    const endParsers = [] as MinimumSafeParsableObject[]

    let numberOfStratifications = 0

    const addParsers = (...parsers: MinimumSafeParsableObject[]) => {
      if (numberOfStratifications === 0) startParsers.push(...parsers)
      else if (numberOfStratifications === 1) endParsers.push(...parsers)
      else throw new Error('error')
    }

    const addRestParser = (parser: MinimumSafeParsableObject, index: number) => {
      numberOfStratifications += 1
      if (numberOfStratifications > 1)
        throw new Error(options.restCantFollowRest(itemParsers, index))
      restParser = parser
    }

    const inType = [] as string[]

    itemParsers.forEach((parser, index) => {
      // debugger
      if ('isSpread' in parser) {
        inType.push(parser.type)
        const [sParsers, r, eParsers] = parser.stratifiedParsers
        addParsers(...sParsers)
        if (r !== undefined) addRestParser(r, index)
        addParsers(...eParsers)
      } else {
        addParsers(parser)
        inType.push(parser.type)
      }
    })

    let hasOptional = false
    startParsers.forEach((parser, index) => {
      const optional = parser.isOptional()
      if (hasOptional && !optional)
        throw new Error(options.arrayDefinitionElementMustBeOptional(itemParsers, index))
      hasOptional = optional
    })

    // const midStr = restParser ? `...${restParser.type}[]` : undefined
    endParsers.forEach((parser, index) => {
      if (parser.isOptional()) {
        throw new Error(
          options.optionalElementCantFollowRest(itemParsers, startParsers.length + 1 + index),
        )
      }
      // return parser.type
    })

    const typeString = `[${inType}]` // `[${[startStr, midStr, endStr].filter(Boolean)}]`

    const stratifiedParsers: StratifiedParsers = [startParsers, restParser, endParsers]

    const parser = options.finiteArrayParser
      ? options.finiteArrayParser(typeString, stratifiedParsers, options)
      : parseFiniteArray(typeString, stratifiedParsers, options)
    const builder = createBaseValidationBuilder(parser, arrayValidations, typeString)
    Object.defineProperties(builder, {
      finiteArrayParsers: { value: itemParsers },
      stratifiedParsers: { value: stratifiedParsers },
      // eType: { value: `[${inType}]` },
      pick: {
        value(...keys: number[]) {
          const newItemParsers = keys.reduce((newItemParsersI, index) => {
            const item = itemParsers[index]
            if (!item) throw new Error(options.missingItemInItemParsers(itemParsers, index))
            newItemParsersI.push(item)
            return newItemParsersI
          }, [] as ValidArrayItems)

          return vArray(newItemParsers, options)
        },
      },
      omit: {
        value(...keys: number[]) {
          const newItemParsers = itemParsers
            .filter((_item, index) => !keys.includes(index))
            .reduce((newItemParsersI, item) => {
              newItemParsersI.push(item)
              return newItemParsersI
            }, [] as ValidArrayItems)
          return vArray(newItemParsers, options)
        },
      },
      extends: {
        value(...extendedPropertyParsers: [...itemParsers: ValidArrayItems]) {
          return vArray([...itemParsers, ...extendedPropertyParsers], options)
        },
      },
      merge: {
        value(vArr: VArrayFinite<any>) {
          return (builder as VArrayFinite<any>).extends(...vArr.finiteArrayParsers)
        },
      },
      partial: {
        value() {
          return this[internalPartial]().optional()
        },
      },
      [internalPartial]: {
        value() {
          const newItemParsers = itemParsers.reduce((newPropertyParsersI, itemParser) => {
            newPropertyParsersI.push(itemParser.optional())
            return newPropertyParsersI
          }, [] as ValidArrayItems)
          return vArray(newItemParsers, options)
        },
      },
      deepPartial: {
        value() {
          return this[internalDeepPartial]().optional()
        },
      },
      [internalDeepPartial]: {
        value() {
          const newItemParsers = itemParsers.reduce((newPropertyParsersI, itemParser) => {
            newPropertyParsersI.push(
              'deepPartial' in itemParser
                ? (itemParser as any).deepPartial()
                : itemParser.optional(),
            )
            return newPropertyParsersI
          }, [] as ValidArrayItems)
          return vArray(newItemParsers, options)
        },
      },
      required: {
        value() {
          const newItemParsers = itemParsers.reduce((newPropertyParsersI, itemParser) => {
            newPropertyParsersI.push(itemParser.required())
            return newPropertyParsersI
          }, [] as ValidArrayItems)
          return vArray(newItemParsers, options)
        },
      },
      deepRequired: {
        value() {
          const newItemParsers = itemParsers.reduce((newPropertyParsersI, itemParser) => {
            newPropertyParsersI.push(
              'deepRequired' in itemParser
                ? (itemParser as any).deepRequired()
                : itemParser.required(),
            )
            return newPropertyParsersI
          }, [] as ValidArrayItems)
          return vArray(newItemParsers, options)
        },
      },
      spread: {
        get(): MinimumSafeParsableRestArray {
          // debugger
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const parent: MinimumSafeParsableArray = this
          return {
            vArray: parent,
            isSpread: true,
            optional() {
              return parent[internalPartial]().spread
            },
            // nullable() {
            //   return parent[internalPartial]().spread // TODO
            // },
            required() {
              return parent.required().spread
            },
            deepRequired() {
              return parent.deepRequired().spread
            },
            stratifiedParsers: parent.stratifiedParsers,
            type: `...${typeString}`,
          }
        },
      },
    })
    return builder as VArrayFinite<any>
  }

  function infiniteArray<T extends MinimumSafeParsableObject>(
    itemParser: T,
    options: ArrayOptions,
  ) {
    const stratifiedParsers: StratifiedParsers = [[], itemParser, []]
    // const parser = options.infiniteArrayParser
    //   ? options.infiniteArrayParser(itemParser, options)
    //   : parseInfiniteArray(itemParser, options)
    const typeString = `${itemParser.type}[]`
    const parser = options.finiteArrayParser
      ? options.finiteArrayParser(typeString, stratifiedParsers, options)
      : parseFiniteArray(typeString, stratifiedParsers, options)

    const builder = createBaseValidationBuilder(parser, arrayValidations, typeString) as
      | VArrayFinite<any>
      | VArrayInfinite<any>

    Object.defineProperties(builder, {
      infiniteArrayItemParser: { value: itemParser },
      stratifiedParsers: { value: stratifiedParsers },
      partial: {
        value() {
          return this[internalPartial]().optional()
        },
      },
      [internalPartial]: {
        value() {
          return vArray(itemParser.optional(), options)
        },
      },
      deepPartial: {
        value() {
          return this[internalDeepPartial]().optional()
        },
      },
      [internalDeepPartial]: {
        value() {
          return vArray(
            'deepPartial' in itemParser ? (itemParser as any).deepPartial() : itemParser.optional(),
            options,
          )
        },
      },
      required: {
        value() {
          return vArray(itemParser.required(), options)
        },
      },
      deepRequired: {
        value() {
          return vArray(
            'deepRequired' in itemParser
              ? (itemParser as any).deepRequired()
              : itemParser.required(),
            options,
          )
        },
      },
      spread: {
        get(): MinimumSafeParsableRestArray {
          // debugger
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const parent: MinimumSafeParsableArray = this
          return {
            vArray: parent,
            isSpread: true,
            optional() {
              return parent[internalPartial]().spread
            },
            nullable() {
              return parent[internalPartial]().spread // TODO
            },
            required() {
              return parent.required().spread
            },
            deepRequired() {
              return parent.deepRequired().spread
            },
            stratifiedParsers: parent.stratifiedParsers,
            type: `...${typeString}`,
          }
        },
      },
    })
    return builder as unknown as VArrayInfinite<T>
  }

  function vArray(
    itemParsers: ValidArrayItems | MinimumSafeParsableObject,
    options: Partial<ArrayOptions> = {},
  ): VArrayInfinite<any> | VArrayFinite<any> {
    const finalOptions: ArrayOptions = { ...defaultArrayErrors, ...options }
    return (Array.isArray(itemParsers)
      ? finiteArray(itemParsers, finalOptions)
      : infiniteArray(itemParsers, finalOptions)) as unknown as
      | VArrayInfinite<any>
      | VArrayFinite<any>
  }
  return vArray as VArrayFn
}
