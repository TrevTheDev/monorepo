/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError, DeepWriteable } from '@trevthedev/toolbelt'
import { isError } from '@trevthedev/toolbelt'
import { createFinalBaseObject } from './base'
import {
  MinimumArraySchema,
  MinimumSchema,
  MinimumArrayRestSchema,
  SingleValidationError,
  StratifiedSchemas,
  VArrayFinite,
  VArrayInfinite,
  ValidArrayItem,
  ValidArrayItems,
  ValidArrayItemsT,
  ValidArrayItemsW,
  ValidationErrors,
  defaultErrorFnSym,
  parserObject,
  stratifiedSchemaProp,
  MinimumInfiniteArraySchema,
} from './types'
import {
  isOptional,
  isSpread,
  isTransformed,
  optional,
  required,
  unWrappedDeepPartial,
} from './shared'

import { createValidationBuilder } from './base validations'
import defaultErrorFn, { DefaultErrorFn } from './errorFns'

let errorFns: DefaultErrorFn = defaultErrorFn

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * types and constants
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export type SingleArrayValidationError = [index: number, errors: SingleValidationError[]]

type ArrayErrorOptions = {
  parseArray: DefaultErrorFn['parseArray']
  invalidArrayElementsFn: DefaultErrorFn['invalidArrayElementsFn']
  arrayDefinitionElementMustBeOptional: DefaultErrorFn['arrayDefinitionElementMustBeOptional']
  elementRequiredAt: DefaultErrorFn['elementRequiredAt']
  extraArrayItemsFn: DefaultErrorFn['extraArrayItemsFn']
  restCantFollowRest: DefaultErrorFn['restCantFollowRest']
  optionalElementCantFollowRest: DefaultErrorFn['optionalElementCantFollowRest']
  missingItemInItemSchemas: DefaultErrorFn['missingItemInItemSchemas']
  unableToSelectItemFromArray: DefaultErrorFn['unableToSelectItemFromArray']
}

interface ArrayOptions extends Partial<ArrayErrorOptions> {
  parser?: ParseArray
}

export type VArrayFn = {
  <T extends MinimumSchema>(itemSchema: T, options?: ArrayOptions): VArrayInfinite<T>
  <const T extends ValidArrayItems>(itemSchemas: T, options?: ArrayOptions): VArrayFinite<
    ValidArrayItemsT<T>
  >
  (itemSchemas: ValidArrayItem, options: ArrayOptions): VArrayInfinite<any> | VArrayFinite<any>
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
  stratifiedSchemas: StratifiedSchemas,
  errorMessageFns: Partial<Pick<ArrayErrorOptions, 'elementRequiredAt' | 'extraArrayItemsFn'>>,
  transformed: boolean,
): ResultError<SingleArrayValidationError[], unknown[]> {
  let newArray!: unknown[]
  if (transformed) newArray = []
  const valueErrors = [] as SingleArrayValidationError[]

  const leftHandArray = stratifiedSchemas[0]
  const infiniteSchema = stratifiedSchemas[1]
  const rightHandArray = stratifiedSchemas[2]
  const leftHandLength = leftHandArray.length
  const rightHandLength = rightHandArray.length
  const valueLength = value.length
  const requiredLength = rightHandArray.length + leftHandArray.length

  for (let i = 0; i < leftHandLength; i += 1) {
    const result = (leftHandArray[i] as MinimumSchema).safeParse(value[i])
    if (isError(result)) valueErrors.push([i, result[0].errors])
    else if (transformed) [, newArray[i]] = result
  }

  if (rightHandLength !== 0) {
    if (requiredLength > valueLength) {
      let missing = requiredLength - valueLength
      while (missing > 0) {
        valueErrors.push([
          requiredLength - missing,
          [
            (errorMessageFns.elementRequiredAt ?? errorFns.elementRequiredAt)(
              value,
              requiredLength - missing,
            ),
          ],
        ])
        missing -= 1
      }
    } else {
      for (let i = 0; i < rightHandLength; i += 1) {
        const t = valueLength - rightHandLength + i
        const result = (rightHandArray[i] as MinimumSchema).safeParse(value[t])
        if (isError(result)) valueErrors.push([t, result[0].errors])
        else if (transformed) [, newArray[t]] = result
      }

      // rightHandArray.forEach((schema, index) => {
      //   const i = valueLength - rightHandLength + index
      //   const result = schema.safeParse(value[i])
      //   if (result[0]) valueErrors.push([i, result[0].errors])
      // })
    }
  } else if (infiniteSchema === undefined) {
    let sLength = leftHandLength
    while (sLength < valueLength) {
      valueErrors.push([
        sLength,
        [(errorMessageFns.extraArrayItemsFn ?? errorFns.extraArrayItemsFn)(value, sLength)],
      ])
      sLength += 1
    }
  }

  if (infiniteSchema !== undefined) {
    for (let i = leftHandLength; i < valueLength - rightHandLength; i += 1) {
      const result = infiniteSchema.safeParse(value[i])
      if (isError(result)) valueErrors.push([i, result[0].errors])
      else if (transformed) [, newArray[i]] = result
    }
  }

  // eslint-disable-next-line no-nested-ternary
  return valueErrors.length === 0
    ? transformed
      ? [undefined, newArray]
      : [undefined, value]
    : [valueErrors, undefined]
}

type ParseArray = typeof parseArray

export function parseArray<T extends unknown[]>(
  typeString: string,
  stratifiedSchemas: StratifiedSchemas,
  errorMessageFns: Partial<
    Pick<
      ArrayErrorOptions,
      'parseArray' | 'elementRequiredAt' | 'extraArrayItemsFn' | 'invalidArrayElementsFn'
    >
  >,
  transformed: boolean,
) {
  return function ParseArrayFn(value: unknown): ResultError<ValidationErrors, T> {
    if (Array.isArray(value)) {
      const result = parseArrayElements(value, stratifiedSchemas, errorMessageFns, transformed)
      return result[0] === undefined
        ? (result as [error: undefined, result: T])
        : [
            {
              input: value,
              errors: [
                (errorMessageFns.invalidArrayElementsFn ?? errorFns.invalidArrayElementsFn)(
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
        errors: [(errorMessageFns.parseArray ?? errorFns.parseArray)(value, typeString)],
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

type ArrayValidationFn = (value: unknown[]) => string | undefined

export function minimumArrayLength(
  length: number,
  errorReturnValueFn?: DefaultErrorFn['minimumArrayLength'],
): ArrayValidationFn {
  return (value: unknown[]) =>
    value.length < length
      ? (errorReturnValueFn ?? errorFns.minimumArrayLength)(value, length)
      : undefined
}

export function maximumArrayLength(
  length: number,
  errorReturnValueFn?: DefaultErrorFn['maximumArrayLength'],
): ArrayValidationFn {
  return (value: unknown[]) =>
    value.length > length
      ? (errorReturnValueFn ?? errorFns.maximumArrayLength)(value, length)
      : undefined
}

export function requiredArrayLength(
  length: number,
  errorReturnValueFn?: DefaultErrorFn['requiredArrayLength'],
): ArrayValidationFn {
  return (value: unknown[]) =>
    value.length !== length
      ? (errorReturnValueFn ?? errorFns.requiredArrayLength)(value, length)
      : undefined
}

export function nonEmpty(errorReturnValueFn?: DefaultErrorFn['arrayNonEmpty']): ArrayValidationFn {
  return (value: unknown[]) =>
    value.length < 1 ? (errorReturnValueFn ?? errorFns.arrayNonEmpty)(value) : undefined
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
  ['nonEmpty', nonEmpty],
] as const // [propName: string, validationFn: (...args) => (value: string) => string | undefined][]

const arrayValidations = arrayValidations_ as ArrayValidations

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vArray
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
function restArrayObject(parent: MinimumArraySchema, typeString: string): MinimumArrayRestSchema {
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
    stratifiedSchemas: parent.definition[stratifiedSchemaProp],
    type: `...${typeString}`,
  } as MinimumArrayRestSchema
}

export function initArray(baseObject: MinimumSchema): VArrayFn {
  /** ****************************************************************************************************************************
   * *****************************************************************************************************************************
   * *****************************************************************************************************************************
   * finiteArray
   * *****************************************************************************************************************************
   * *****************************************************************************************************************************
   ***************************************************************************************************************************** */
  errorFns = baseObject[defaultErrorFnSym]

  const baseArrayObject = createValidationBuilder(baseObject, arrayValidations)

  function nextFiniteArray(
    itemSchemas: ValidArrayItemsW,
    options: ArrayOptions,
    oldArray: MinimumArraySchema,
  ) {
    const nextObj = finiteArray(itemSchemas, options)
    nextObj[parserObject].validators.push(...oldArray[parserObject].validators)
    return nextObj
  }

  function finiteArray(
    itemSchemas: ValidArrayItemsW,
    options: ArrayOptions,
  ): MinimumInfiniteArraySchema {
    const startSchemas = [] as MinimumSchema[]
    let restSchema: MinimumSchema | undefined
    const endSchemas = [] as MinimumSchema[]

    let numberOfStratifications = 0

    const addSchemas = (...schemas: MinimumSchema[]) => {
      if (numberOfStratifications === 0) startSchemas.push(...schemas)
      else if (numberOfStratifications === 1) endSchemas.push(...schemas)
      else throw new Error('error')
    }

    const addRestSchema = (schema: MinimumSchema, index: number) => {
      numberOfStratifications += 1
      if (numberOfStratifications > 1) {
        throw new Error(
          (options.restCantFollowRest ?? errorFns.restCantFollowRest)(itemSchemas, index),
        )
      }
      restSchema = schema
    }

    const inType = [] as string[]

    let transformed = false
    const itemSchemasLength = itemSchemas.length
    for (let i = 0; i < itemSchemasLength; i += 1) {
      const schema = itemSchemas[i] as ValidArrayItem
      if (isSpread(schema)) {
        inType.push(schema.type)
        const [sSchemas, r, eSchemas] = schema.stratifiedSchemas
        addSchemas(...sSchemas)
        if (r !== undefined) addRestSchema(r, i)
        addSchemas(...eSchemas)
        if (isTransformed(schema.vArray)) transformed = true
      } else {
        addSchemas(schema)
        inType.push(schema.type)
        if (isTransformed(schema)) transformed = true
      }
    }

    // itemSchemas.forEach((schema, index) => {
    //   if ('isSpread' in schema) {
    //     inType.push(schema.type)
    //     const [sSchemas, r, eSchemas] = schema.stratifiedSchemas
    //     addSchemas(...sSchemas)
    //     if (r !== undefined) addRestSchema(r, index)
    //     addSchemas(...eSchemas)
    //   } else {
    //     addSchemas(schema)
    //     inType.push(schema.type)
    //   }
    // })

    let hasOptional = false

    const startSchemasLength = startSchemas.length
    for (let i = 0; i < startSchemasLength; i += 1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const isOptTemp = isOptional(startSchemas[i]!)
      if (hasOptional && !isOptTemp) {
        throw new Error(
          (
            options.arrayDefinitionElementMustBeOptional ??
            errorFns.arrayDefinitionElementMustBeOptional
          )(itemSchemas, i),
        )
      }
      hasOptional = isOptTemp
    }

    // startSchemas.forEach((schema, index) => {
    //   const isOptional = schema.baseType === 'optional'
    //   if (hasOptional && !isOptional) {
    //     throw new Error(
    //       (
    //         options.arrayDefinitionElementMustBeOptional ??
    //         errorFns.arrayDefinitionElementMustBeOptional
    //       )(itemSchemas, index),
    //     )
    //   }
    //   hasOptional = isOptional
    // })

    // const midStr = restParser ? `...${restParser.type}[]` : undefined
    const endSchemasLength = endSchemas.length
    for (let i = 0; i < endSchemasLength; i += 1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (isOptional(endSchemas[i]!)) {
        throw new Error(
          (options.optionalElementCantFollowRest ?? errorFns.optionalElementCantFollowRest)(
            itemSchemas,
            startSchemasLength + 1 + i,
          ),
        )
      }
    }
    // endSchemas.forEach((schema, index) => {
    //   if (schema.baseType === 'optional') {
    //     throw new Error(
    //       (options.optionalElementCantFollowRest ?? errorFns.optionalElementCantFollowRest)(
    //         itemSchemas,
    //         startSchemas.length + 1 + index,
    //       ),
    //     )
    //   }
    //   // return parser.type
    // })

    const typeString = `[${inType}]` // `[${[startStr, midStr, endStr].filter(Boolean)}]`

    const stratifiedSchemas: StratifiedSchemas = [startSchemas, restSchema, endSchemas]

    const parser = options.parser
      ? options.parser(typeString, stratifiedSchemas, options, transformed)
      : parseArray(typeString, stratifiedSchemas, options, transformed)

    const builder = createFinalBaseObject(baseArrayObject, parser, typeString, 'finite array', {
      [stratifiedSchemaProp]: stratifiedSchemas,
      itemSchemas,
      transformed,
    })

    // const builder = createBaseValidationBuilder(parser, arrayValidations, typeString)
    Object.defineProperties(builder, {
      pick: {
        value(...keys: number[]) {
          const newItemSchemas = keys.reduce((newItemSchemasI, index) => {
            const item = itemSchemas[index]
            if (!item) {
              throw new Error(
                (options.missingItemInItemSchemas ?? errorFns.missingItemInItemSchemas)(
                  itemSchemas,
                  index,
                ),
              )
            }
            newItemSchemasI.push(item)
            return newItemSchemasI
          }, [] as ValidArrayItemsW)

          return nextFiniteArray(newItemSchemas, options, this)
        },
        enumerable: true,
        configurable: false,
        writable: false,
      },
      omit: {
        value(...keys: number[]) {
          const newItemSchemas = itemSchemas
            .filter((_item, index) => !keys.includes(index))
            .reduce((newItemSchemasI, item) => {
              newItemSchemasI.push(item)
              return newItemSchemasI
            }, [] as ValidArrayItemsW)
          return vArray(newItemSchemas, options)
        },
        enumerable: true,
        configurable: false,
        writable: false,
      },
      extends: {
        value(...extendedPropertySchemas: [...itemSchemas: ValidArrayItemsW]) {
          return nextFiniteArray([...itemSchemas, ...extendedPropertySchemas], options, this)
        },
        enumerable: true,
        configurable: false,
        writable: false,
      },
      merge: {
        value(vArr: VArrayFinite<any>) {
          return (this as VArrayFinite<any>).extends(...vArr.definition.itemSchemas)
        },
        enumerable: true,
        configurable: false,
        writable: false,
      },
      partial: {
        value() {
          const newItemSchemas = itemSchemas.reduce((newPropertySchemasI, itemSchema) => {
            newPropertySchemasI.push(optional(itemSchema))
            return newPropertySchemasI
          }, [] as ValidArrayItemsW)
          return nextFiniteArray(newItemSchemas as ValidArrayItemsW, options, this)
        },
        enumerable: true,
        configurable: false,
        writable: false,
      },
      deepPartial: {
        value(...keys) {
          const newItemSchemas = itemSchemas.reduce((newPropertySchemasI, itemSchema: any) => {
            newPropertySchemasI.push(unWrappedDeepPartial(itemSchema, ...keys))
            return newPropertySchemasI
          }, [] as ValidArrayItemsW)
          return nextFiniteArray(newItemSchemas as ValidArrayItemsW, options, this)
        },
        enumerable: true,
        configurable: false,
        writable: false,
      },
      required: {
        value() {
          const newItemSchemas = itemSchemas.reduce((newPropertySchemasI, itemSchema) => {
            newPropertySchemasI.push(required(itemSchema))
            return newPropertySchemasI
          }, [] as ValidArrayItemsW)
          return nextFiniteArray(newItemSchemas as ValidArrayItemsW, options, this)
        },
        enumerable: true,
        configurable: false,
        writable: false,
      },
      deepRequired: {
        value() {
          const newItemSchemas = itemSchemas.reduce((newPropertySchemasI, itemSchema) => {
            newPropertySchemasI.push(
              'deepRequired' in itemSchema
                ? (itemSchema as any).deepRequired()
                : required(itemSchema),
            )
            return newPropertySchemasI
          }, [] as ValidArrayItemsW)
          return nextFiniteArray(newItemSchemas as ValidArrayItemsW, options, this)
        },
        enumerable: true,
        configurable: false,
        writable: false,
      },
      spread: {
        get(): MinimumArrayRestSchema {
          return restArrayObject(this, typeString)
        },
        enumerable: true,
        configurable: false,
      },
    })
    return builder as unknown as MinimumInfiniteArraySchema
  }

  /** ****************************************************************************************************************************
   * *****************************************************************************************************************************
   * *****************************************************************************************************************************
   * infiniteArray
   * *****************************************************************************************************************************
   * *****************************************************************************************************************************
   ***************************************************************************************************************************** */
  function nextInfiniteArray(
    itemSchema: MinimumSchema,
    options: ArrayOptions,
    oldArray: MinimumArraySchema,
  ) {
    const nextObj = infiniteArray(itemSchema, options)
    nextObj[parserObject].validators.push(...oldArray[parserObject].validators)
    return nextObj
  }

  function infiniteArray<T extends MinimumSchema>(itemSchema: T, options: ArrayOptions) {
    const stratifiedSchemas: StratifiedSchemas = [[], itemSchema, []]
    const typeString = `${itemSchema.type}[]`
    const transformed = isTransformed(itemSchema)
    const parser = options.parser
      ? options.parser(typeString, stratifiedSchemas, options, transformed)
      : parseArray(typeString, stratifiedSchemas, options, transformed)

    const builder = createFinalBaseObject(baseArrayObject, parser, typeString, 'infinite array', {
      [stratifiedSchemaProp]: stratifiedSchemas,
      itemSchema,
      transformed,
    }) as unknown as VArrayInfinite<any>

    Object.defineProperties(builder, {
      partial: {
        value() {
          return nextInfiniteArray(optional(itemSchema), options, this)
        },
        enumerable: true,
        configurable: false,
        writable: false,
      },
      deepPartial: {
        value() {
          return nextInfiniteArray(unWrappedDeepPartial(itemSchema), options, this)
        },
        enumerable: true,
        configurable: false,
        writable: false,
      },
      required: {
        value() {
          return nextInfiniteArray(required(itemSchema), options, this)
        },
        enumerable: true,
        configurable: false,
        writable: false,
      },
      deepRequired: {
        value() {
          return nextInfiniteArray(
            'deepRequired' in itemSchema
              ? (itemSchema as any).deepRequired()
              : required(itemSchema),
            options,
            this,
          )
        },
        enumerable: true,
        configurable: false,
        writable: false,
      },
      spread: {
        get(): MinimumArrayRestSchema {
          return restArrayObject(this, typeString)
        },
        enumerable: true,
        configurable: false,
      },
    })
    return builder as unknown as VArrayInfinite<T>
  }

  function vArray(
    itemSchemas: ValidArrayItemsW | MinimumSchema,
    options: ArrayOptions = {},
  ): VArrayInfinite<any> | VArrayFinite<any> {
    return (Array.isArray(itemSchemas)
      ? finiteArray(itemSchemas, options)
      : infiniteArray(itemSchemas, options)) as unknown as VArrayInfinite<any> | VArrayFinite<any>
  }
  return vArray as VArrayFn
}
