/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError } from 'toolbelt'
import { DeepWriteable, OmitTuple, PickTuple, Identity } from 'toolbelt'
import {
  SafeParseFn,
  VInfer,
  MinimumSafeParsableObject,
  ParseFn,
  defaultErrorFnSym,
  createFinalBaseObject,
  parserObject,
  ParserObject,
} from './base'
import {
  DeepPartial,
  DeepPartialFiniteArray,
  IsOptional,
  OptionalMSPO,
  OptionalVAI,
  RequiredMSPO,
  RequiredVAI,
  UnwrappedDeepPartial,
  optional,
  required,
  unWrappedDeepPartial,
} from './shared'

import {
  SingleValidationError,
  ValidationErrors,
  createValidationBuilder,
} from './base validations'
import { VNullable, VNullish, VOptional, VUnion } from './union'
import defaultErrorFn, { DefaultErrorFn } from './errorFns'
import { VIntersectionT } from './intersection'
import { VDefault } from './default'

let errorFns: DefaultErrorFn = defaultErrorFn

export const stratifiedParserProp = Symbol('stratifiedParserProp')
export type StratifiedParserProp = typeof stratifiedParserProp

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * types and constants
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export type SingleArrayValidationError = [index: number, errors: SingleValidationError[]]

type ArrayErrorOptions = {
  parseArray: typeof errorFns.parseArray
  invalidArrayElementsFn: typeof errorFns.invalidArrayElementsFn
  arrayDefinitionElementMustBeOptional: typeof errorFns.arrayDefinitionElementMustBeOptional
  elementRequiredAt: typeof errorFns.elementRequiredAt
  extraArrayItemsFn: typeof errorFns.extraArrayItemsFn
  restCantFollowRest: typeof errorFns.restCantFollowRest
  optionalElementCantFollowRest: typeof errorFns.optionalElementCantFollowRest
  missingItemInItemParsers: typeof errorFns.missingItemInItemParsers
  unableToSelectItemFromArray: typeof errorFns.unableToSelectItemFromArray
}

export type StratifiedParsers = [
  MinimumSafeParsableObject[],
  MinimumSafeParsableObject | undefined,
  MinimumSafeParsableObject[],
]

export interface MinimumSafeParsableArray extends MinimumSafeParsableObject {
  [parserObject]: ParserObject<
    unknown[],
    string,
    'infinite array' | 'finite array',
    any,
    {
      readonly [stratifiedParserProp]: StratifiedParsers
      readonly itemParsers?: ValidArrayItems
      readonly itemParser?: MinimumSafeParsableObject
    }
  >
  readonly definition: {
    readonly [stratifiedParserProp]: StratifiedParsers
    readonly itemParsers?: ValidArrayItems
    readonly itemParser?: MinimumSafeParsableObject
  }
  readonly spread: MinimumSafeParsableRestArray
  parse: ParseFn<any, unknown[]>
  safeParse: SafeParseFn<any, unknown[]>
  partial(): MinimumSafeParsableArray
  deepPartial(...keysToDeepPartial: (keyof any)[]): MinimumSafeParsableArray
  // [internalDeepPartial](...keysToDeepPartial: (keyof any)[]): MinimumSafeParsableObject
  required(...keysToRequire: (keyof any)[]): MinimumSafeParsableArray
  deepRequired(...keysToRequire: (keyof any)[]): MinimumSafeParsableArray
}

interface SafeParsableArray<Output extends unknown[], Type extends string, Input>
  extends MinimumSafeParsableArray {
  readonly spread: SafeParsableRestArray<this>
  readonly type: Type
  parse: ParseFn<Input, Output>
  safeParse: SafeParseFn<Input, Output>
  // BaseObject
  optional(): VOptional<this>
  nullable(): VNullable<this>
  nullish(): VNullish<this>
  or<
    S extends MinimumSafeParsableObject,
    RT extends MinimumSafeParsableObject = Identity<VUnion<[this, S]>>,
  >(
    type: S,
  ): RT
  and<
    S extends MinimumSafeParsableObject,
    RT extends MinimumSafeParsableObject = Identity<VIntersectionT<[this, S]>>,
  >(
    type: S,
  ): RT
  array(): VArrayInfinite<this>
  default(defaultValue: Output): VDefault<Output, this>
  min(
    length: number,
    errorReturnValueFn?:
      | ((invalidValue: Output, minLength: number) => SingleValidationError)
      | undefined,
  ): this
  max(
    length: number,
    errorReturnValueFn?:
      | ((invalidValue: Output, maxLength: number) => SingleValidationError)
      | undefined,
  ): this
  length(
    length: number,
    errorReturnValueFn?:
      | ((invalidValue: Output, requiredLength: number) => SingleValidationError)
      | undefined,
  ): this
  nonempty(errorReturnValueFn?: ((invalidValue: Output) => SingleValidationError) | undefined): this
  customValidation<S extends unknown[]>(
    customValidator: (value: Output, ...otherArgs: S) => SingleValidationError | undefined,
    ...otherArgs: S
  ): this
}

export type ValidArrayItem = MinimumSafeParsableObject | MinimumSafeParsableRestArray
export type ValidArrayItems = ValidArrayItem[]

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * spread types
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export interface MinimumSafeParsableRestArray {
  vArray: MinimumSafeParsableArray
  isSpread: true
  optional(): MinimumSafeParsableRestArray
  required(): MinimumSafeParsableRestArray
  deepPartial(...keysToDeepPartial: (keyof any)[]): MinimumSafeParsableRestArray
  deepRequired(): MinimumSafeParsableRestArray
  stratifiedParsers: StratifiedParsers
  type: string
}

export interface SafeParsableRestArray<T extends MinimumSafeParsableArray>
  extends MinimumSafeParsableRestArray {
  vArray: T
  optional(): ReturnType<T['partial']>['spread']
  deepPartial<S extends (keyof any)[]>(
    ...keysToDeepPartial: S
  ): T extends VArrayFinite<infer R, any, any, any>
    ? VArrayFinite<DeepPartialFiniteArray<R, S[number]>>['spread']
    : VArrayInfinite<DeepPartial<T, S[number]>>['spread']
  // deepRequired<S extends (keyof any)[]>(
  //   ...keysToDeepRequired: S
  // ): T extends VArrayFinite<infer R, any, any, any>
  //   ? VArrayFinite<DeepRequiredFiniteArray<R, S[number]>>['spread']
  //   : VArrayInfinite<DeepRequired<T, S[number]>>['spread']
  // required(): ReturnType<T['required']>['spread']
  // deepRequired(): ReturnType<T['deepRequired']>['spread']
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * VArrayInfinite
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export interface VArrayInfinite<
  T extends MinimumSafeParsableObject,
  Output extends any[] = VInfer<T>[],
  Type extends string = string,
  Input = unknown,
> extends SafeParsableArray<Output, Type, Input> {
  // readonly infiniteArrayItemParser: T
  [parserObject]: ParserObject<
    Output,
    Type,
    'infinite array',
    any,
    {
      readonly [stratifiedParserProp]: StratifiedParsers
      readonly itemParser: T
    }
  >
  readonly definition: {
    readonly [stratifiedParserProp]: StratifiedParsers
    readonly itemParser: T
  }
  partial(): VArrayInfinite<OptionalMSPO<T>>
  required(): VArrayInfinite<RequiredMSPO<T>>
  deepPartial(): VArrayInfinite<UnwrappedDeepPartial<T, never>>
  deepPartial<S extends (keyof any)[]>(
    ...keysToDeepPartial: S
  ): VArrayInfinite<UnwrappedDeepPartial<T, S[number]>>
  // deepRequired(): VArrayInfinite<DeepRequired<T, never>>
  // deepRequired<S extends (keyof any)[]>(
  //   ...keysToRequired: S
  // ): VArrayInfinite<DeepRequired<T, S[number]>>
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * VArrayFinite
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

type PartialFiniteArray<T extends ValidArrayItems> = T extends [
  infer H extends ValidArrayItem,
  ...infer R extends ValidArrayItems,
]
  ? [OptionalVAI<H>, ...PartialFiniteArray<R>]
  : []

type RequiredFiniteArray<T extends ValidArrayItems> = T extends [
  infer H extends ValidArrayItem,
  ...infer R extends ValidArrayItems,
]
  ? [RequiredVAI<H>, ...RequiredFiniteArray<R>]
  : []

export interface VArrayFinite<
  T extends ValidArrayItems,
  Output extends any[] = FiniteArrayBuilder<T>,
  Type extends string = string,
  Input = unknown,
  // Validations extends ValidationArray<any[]> = ArrayValidations,
> extends SafeParsableArray<Output, Type, Input> {
  [parserObject]: ParserObject<
    Output,
    Type,
    'finite array',
    any,
    {
      readonly [stratifiedParserProp]: StratifiedParsers
      readonly itemParsers: T
    }
  >
  readonly definition: {
    readonly [stratifiedParserProp]: StratifiedParsers
    readonly itemParsers: T
  }
  partial(): VArrayFinite<PartialFiniteArray<T>>
  required(): VArrayFinite<RequiredFiniteArray<T>>
  deepPartial(): VArrayFinite<DeepPartialFiniteArray<T, never>>
  deepPartial<K extends (keyof any)[]>(
    ...keysToPartial: K
  ): VArrayFinite<DeepPartialFiniteArray<T, K[number]>>
  // deepRequired(): VArrayFinite<DeepRequiredFiniteArray<T, never>>
  // deepRequired<K extends (keyof any)[]>(
  //   ...keysToRequired: K
  // ): VArrayFinite<DeepRequiredFiniteArray<T, K[number]>>
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

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * VArrayFn
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

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
  ? IsOptional<T> extends true
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

interface ArrayOptions extends Partial<ArrayErrorOptions> {
  parser?: ParseArray
}

export type VArrayFn = {
  <T extends MinimumSafeParsableObject>(itemParser: T, options?: ArrayOptions): VArrayInfinite<T>
  <T extends readonly (MinimumSafeParsableObject | MinimumSafeParsableRestArray)[]>(
    itemParsers: T & Readonly<T>,
    options?: ArrayOptions,
  ): VArrayFinite<DeepWriteable<T>>
  (itemParsers: ValidArrayItem, options: ArrayOptions): VArrayInfinite<any> | VArrayFinite<any>
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

function parseArrayElements(
  value: unknown[],
  stratifiedParsers: StratifiedParsers,
  errorMessageFns: Partial<Pick<ArrayErrorOptions, 'elementRequiredAt' | 'extraArrayItemsFn'>>,
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
          [
            (errorMessageFns.elementRequiredAt || errorFns.elementRequiredAt)(
              value,
              requiredLength - missing,
            ),
          ],
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
      valueErrors.push([
        sLength,
        [(errorMessageFns.extraArrayItemsFn || errorFns.extraArrayItemsFn)(value, sLength)],
      ])
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

type ParseArray = typeof parseArray

export function parseArray<T extends unknown[]>(
  typeString: string,
  stratifiedParsers: StratifiedParsers,
  errorMessageFns: Partial<
    Pick<
      ArrayErrorOptions,
      'parseArray' | 'elementRequiredAt' | 'extraArrayItemsFn' | 'invalidArrayElementsFn'
    >
  >,
) {
  return function ParseArrayFn(value: unknown): ResultError<ValidationErrors, T> {
    if (Array.isArray(value)) {
      const result = parseArrayElements(value, stratifiedParsers, errorMessageFns)
      return result[0] === undefined
        ? (result as [error: undefined, result: T])
        : [
            {
              input: value,
              errors: [
                (errorMessageFns.invalidArrayElementsFn || errorFns.invalidArrayElementsFn)(
                  value,
                  typeString,
                  result[0],
                ),
              ],
            },
            undefined,
          ]
    }
    return [
      {
        input: value,
        errors: [(errorMessageFns.parseArray || errorFns.parseArray)(value, typeString)],
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
  ) => SingleValidationError = errorFns.minimumArrayLength,
) {
  return (value: unknown[]) =>
    value.length < length ? errorReturnValueFn(value, length) : undefined
}

export function maximumArrayLength(
  length: number,
  errorReturnValueFn: (
    invalidValue: unknown[],
    maxLength: number,
  ) => SingleValidationError = errorFns.maximumArrayLength,
) {
  return (value: unknown[]) =>
    value.length > length ? errorReturnValueFn(value, length) : undefined
}

export function requiredArrayLength(
  length: number,
  errorReturnValueFn: (
    invalidValue: unknown[],
    requiredLength: number,
  ) => SingleValidationError = errorFns.requiredArrayLength,
) {
  return (value: unknown[]) =>
    value.length !== length ? errorReturnValueFn(value, length) : undefined
}

export function nonEmpty(
  errorReturnValueFn: (invalidValue: unknown[]) => SingleValidationError = errorFns.arrayNonEmpty,
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
type ArrayValidations = DeepWriteable<typeof arrayValidations_>

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

const arrayValidations = arrayValidations_ as ArrayValidations

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vArray
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
function restArrayObject(
  parent: MinimumSafeParsableArray,
  typeString: string,
): MinimumSafeParsableRestArray {
  return {
    vArray: parent,
    isSpread: true,
    optional() {
      return parent.partial().spread
    },
    required() {
      return parent.required().spread
    },
    deepPartial(...keys) {
      return parent.deepPartial(...keys).spread
    },
    deepRequired(...keys) {
      return parent.deepRequired(...keys).spread
    },
    stratifiedParsers: parent[parserObject].definition[stratifiedParserProp],
    type: `...${typeString}`,
  } as MinimumSafeParsableRestArray
}

export function initArray(baseObject: MinimumSafeParsableObject): VArrayFn {
  /** ****************************************************************************************************************************
   * *****************************************************************************************************************************
   * *****************************************************************************************************************************
   * finiteArray
   * *****************************************************************************************************************************
   * *****************************************************************************************************************************
   ***************************************************************************************************************************** */
  errorFns = baseObject[defaultErrorFnSym]

  const baseArrayObject = createValidationBuilder(baseObject, arrayValidations)

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
      if (numberOfStratifications > 1) {
        throw new Error(
          (options.restCantFollowRest || errorFns.restCantFollowRest)(itemParsers, index),
        )
      }
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
      const isOptional = parser.baseType === 'optional'
      if (hasOptional && !isOptional) {
        throw new Error(
          (
            options.arrayDefinitionElementMustBeOptional ||
            errorFns.arrayDefinitionElementMustBeOptional
          )(itemParsers, index),
        )
      }
      hasOptional = isOptional
    })

    // const midStr = restParser ? `...${restParser.type}[]` : undefined
    endParsers.forEach((parser, index) => {
      if (parser.baseType === 'optional') {
        throw new Error(
          (options.optionalElementCantFollowRest || errorFns.optionalElementCantFollowRest)(
            itemParsers,
            startParsers.length + 1 + index,
          ),
        )
      }
      // return parser.type
    })

    const typeString = `[${inType}]` // `[${[startStr, midStr, endStr].filter(Boolean)}]`

    const stratifiedParsers: StratifiedParsers = [startParsers, restParser, endParsers]

    const parser = options.parser
      ? options.parser(typeString, stratifiedParsers, options)
      : parseArray(typeString, stratifiedParsers, options)

    const builder = createFinalBaseObject(baseArrayObject, parser, typeString, 'finite array', {
      [stratifiedParserProp]: stratifiedParsers,
      itemParsers,
    })

    // const builder = createBaseValidationBuilder(parser, arrayValidations, typeString)
    Object.defineProperties(builder, {
      pick: {
        value(...keys: number[]) {
          const newItemParsers = keys.reduce((newItemParsersI, index) => {
            const item = itemParsers[index]
            if (!item) {
              throw new Error(
                (options.missingItemInItemParsers || errorFns.missingItemInItemParsers)(
                  itemParsers,
                  index,
                ),
              )
            }
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
          return (this as VArrayFinite<any>).extends(...vArr.definition.itemParsers)
        },
      },
      partial: {
        value() {
          const newItemParsers = itemParsers.reduce((newPropertyParsersI, itemParser) => {
            newPropertyParsersI.push(optional(itemParser))
            return newPropertyParsersI
          }, [] as ValidArrayItems)
          return vArray(newItemParsers, options)
        },
      },
      deepPartial: {
        value(...keys) {
          const newItemParsers = itemParsers.reduce((newPropertyParsersI, itemParser: any) => {
            newPropertyParsersI.push(unWrappedDeepPartial(itemParser, ...keys))
            return newPropertyParsersI
          }, [] as ValidArrayItems)
          const newArray = vArray(newItemParsers, options)
          newArray[parserObject].validators.push(...this[parserObject].validators)
          return newArray
        },
      },
      required: {
        value() {
          const newItemParsers = itemParsers.reduce((newPropertyParsersI, itemParser) => {
            newPropertyParsersI.push(required(itemParser))
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
                : required(itemParser),
            )
            return newPropertyParsersI
          }, [] as ValidArrayItems)
          return vArray(newItemParsers, options)
        },
      },
      spread: {
        get(): MinimumSafeParsableRestArray {
          return restArrayObject(this, typeString)
        },
      },
    })
    return builder as unknown as VArrayFinite<any>
  }

  /** ****************************************************************************************************************************
   * *****************************************************************************************************************************
   * *****************************************************************************************************************************
   * infiniteArray
   * *****************************************************************************************************************************
   * *****************************************************************************************************************************
   ***************************************************************************************************************************** */

  function infiniteArray<T extends MinimumSafeParsableObject>(
    itemParser: T,
    options: ArrayOptions,
  ) {
    const stratifiedParsers: StratifiedParsers = [[], itemParser, []]
    const typeString = `${itemParser.type}[]`
    const parser = options.parser
      ? options.parser(typeString, stratifiedParsers, options)
      : parseArray(typeString, stratifiedParsers, options)

    const builder = createFinalBaseObject(baseArrayObject, parser, typeString, 'infinite array', {
      [stratifiedParserProp]: stratifiedParsers,
      itemParser,
    }) as unknown as VArrayInfinite<any>

    Object.defineProperties(builder, {
      partial: {
        value() {
          return vArray(optional(itemParser), options)
        },
      },
      deepPartial: {
        value() {
          const newArray = vArray(unWrappedDeepPartial(itemParser), options)
          newArray[parserObject].validators.push(...this[parserObject].validators)
          return newArray
        },
      },
      required: {
        value() {
          return vArray(required(itemParser), options)
        },
      },
      deepRequired: {
        value() {
          return vArray(
            'deepRequired' in itemParser
              ? (itemParser as any).deepRequired()
              : required(itemParser),
            options,
          )
        },
      },
      spread: {
        get(): MinimumSafeParsableRestArray {
          return restArrayObject(this, typeString)
        },
      },
    })
    return builder as unknown as VArrayInfinite<T>
  }

  function vArray(
    itemParsers: ValidArrayItems | MinimumSafeParsableObject,
    options: ArrayOptions = {},
  ): VArrayInfinite<any> | VArrayFinite<any> {
    return (Array.isArray(itemParsers)
      ? finiteArray(itemParsers, options)
      : infiniteArray(itemParsers, options)) as unknown as VArrayInfinite<any> | VArrayFinite<any>
  }
  return vArray as VArrayFn
}
