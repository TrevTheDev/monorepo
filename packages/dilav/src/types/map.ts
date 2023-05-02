/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResultError, isError } from 'toolbelt'

import { createFinalBaseObject } from './base'
import {
  SafeParseFn,
  BaseSchema,
  MinimumSchema,
  VInfer,
  defaultErrorFnSym,
  SingleValidationError,
  ValidationErrors,
  ValidationItem,
} from './types'

import { baseObject } from './init'
import { createValidationBuilder } from './base validations'
import { DefaultErrorFn } from './errorFns'

const errorFns = baseObject[defaultErrorFnSym]

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

// type MapDef = [key: MinimumSafeParsableObject, value: MinimumSafeParsableObject]
type MapDefToMapType<
  T extends readonly [MinimumSchema, MinimumSchema],
  RT = Map<VInfer<T[0]>, VInfer<T[1]>>,
> = RT

export function parseMap<T extends readonly [MinimumSchema, MinimumSchema]>(
  mapDef: T,
  options: MapOptions<any>,
): (value: unknown) => ResultError<ValidationErrors, MapDefToMapType<T>> {
  const [keyParser, valueParser] = mapDef
  return (value: unknown): ResultError<ValidationErrors, MapDefToMapType<T>> => {
    const errors = [] as SingleValidationError[]
    if (value instanceof Map) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, mapValue] of value.entries()) {
        const keyResult = keyParser.safeParse(key)
        if (isError(keyResult)) {
          if (options.breakOnFirstError) return keyResult
          errors.push(...keyResult[0].errors)
        }
        const valueResult = valueParser.safeParse(mapValue)
        if (isError(valueResult)) {
          if (options.breakOnFirstError) return valueResult
          errors.push(...valueResult[0].errors)
        }
      }
      if (errors.length === 0) return [undefined, value]
      return [
        {
          input: value,
          errors,
        },
      ]
    }
    return [
      { input: value, errors: [((options as any).parseMap ?? errorFns.parseMap)(value)] },
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
export function minimumMapLength<T extends Map<unknown, unknown>>(
  length: number,
  errorReturnValueFn: (
    invalidValue: T,
    minLength: number,
  ) => SingleValidationError = errorFns.minimumMapLength,
) {
  return (value: T) => (value.size < length ? errorReturnValueFn(value, length) : undefined)
}

export function maximumMapLength<T extends Map<unknown, unknown>>(
  length: number,
  errorReturnValueFn: (
    invalidValue: T,
    maxLength: number,
  ) => SingleValidationError = errorFns.maximumMapLength,
) {
  return (value: T) => (value.size > length ? errorReturnValueFn(value, length) : undefined)
}

export function requiredMapLength<T extends Map<unknown, unknown>>(
  length: number,
  errorReturnValueFn: (
    invalidValue: T,
    requiredLength: number,
  ) => SingleValidationError = errorFns.requiredMapLength,
) {
  return (value: T) => (value.size !== length ? errorReturnValueFn(value, length) : undefined)
}

export function nonEmpty<T extends Map<unknown, unknown>>(
  errorReturnValueFn: (invalidValue: T) => SingleValidationError = errorFns.mapNonEmpty,
) {
  return (value: T) => (value.size === 0 ? errorReturnValueFn(value) : undefined)
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * all validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type MapValidations<T extends Map<unknown, unknown>> = [
  ['min', typeof minimumMapLength<T>],
  ['max', typeof maximumMapLength<T>],
  ['size', typeof requiredMapLength<T>],
  ['nonempty', typeof nonEmpty<T>],
  [
    'customValidation',
    (
      customValidator: (value: T, ...otherArgs: unknown[]) => SingleValidationError | undefined,
      ...otherArgs: unknown[]
    ) => (value: T) => SingleValidationError | undefined,
  ],
]

const mapValidations = [
  ['min', minimumMapLength],
  ['max', maximumMapLength],
  ['size', requiredMapLength],
  ['nonempty', nonEmpty],
  [
    'customValidation',
    (customValidator, ...otherArgs) =>
      (value) =>
        customValidator(value, ...otherArgs),
  ],
] as const

// export const mapValidations = instanceOfValidations_ as InstanceOfValidations

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vMap
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export type VMap<
  T extends readonly [MinimumSchema, MinimumSchema],
  Output extends Map<any, any> = MapDefToMapType<T>,
  Input = unknown,
  Validations extends MapValidations<Output> = MapValidations<Output>,
> = BaseSchema<Output, 'Map', 'map', Input> & {
  // default validations
  [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
    ? Validations[I] extends ValidationItem<any>
      ? Validations[I][0]
      : never
    : never]: (...args: Parameters<Validations[I][1]>) => VMap<T, Output, Input, Validations>
}

type MapOptions<T extends readonly [MinimumSchema, MinimumSchema]> = (
  | {
      parser: SafeParseFn<unknown, MapDefToMapType<T>>
    }
  | {
      parseMap: DefaultErrorFn['parseMap']
    }
  // eslint-disable-next-line @typescript-eslint/ban-types
  | {}
) & {
  breakOnFirstError?: boolean
}

const baseMapObject = createValidationBuilder(baseObject, mapValidations as any)

export function vMap<const T extends readonly [MinimumSchema, MinimumSchema]>(
  mapDefinitionParsers: T,
  options: MapOptions<T> = {},
): VMap<T> {
  const fOptions: MapOptions<T> = {
    breakOnFirstError: true,
    ...options,
  }

  return createFinalBaseObject(
    baseMapObject,
    (options as any).parser ?? parseMap(mapDefinitionParsers, fOptions),
    `Map<${mapDefinitionParsers[0].type},${mapDefinitionParsers[1].type}>`,
    'map',
    { mapDefinitionParsers },
  ) as VMap<T>
}
