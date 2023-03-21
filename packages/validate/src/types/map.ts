/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResultError, isError } from 'toolbelt'

import type {
  SafeParseFn,
  SafeParsableObject,
  SingleValidationError,
  ValidationErrors,
  ValidationItem,
  MinimumSafeParsableObject,
  VInfer,
} from './base'
import defaultErrorFn from './defaultErrors'
import { createBaseValidationBuilder } from './init'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

type MapDef = [key: MinimumSafeParsableObject, value: MinimumSafeParsableObject]
type MapDefToMapType<T extends [key: MinimumSafeParsableObject, value: MinimumSafeParsableObject]> =
  Map<VInfer<T[0]>, VInfer<T[1]>>

export function parseMap<T extends MapDef>(
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
    return [{ input: value, errors: [options.notAMap(value)] }, undefined]
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
  ) => SingleValidationError = defaultErrorFn.minimumMapLength,
) {
  return (value: T) => (value.size < length ? errorReturnValueFn(value, length) : undefined)
}

export function maximumMapLength<T extends Map<unknown, unknown>>(
  length: number,
  errorReturnValueFn: (
    invalidValue: T,
    maxLength: number,
  ) => SingleValidationError = defaultErrorFn.maximumMapLength,
) {
  return (value: T) => (value.size > length ? errorReturnValueFn(value, length) : undefined)
}

export function requiredMapLength<T extends Map<unknown, unknown>>(
  length: number,
  errorReturnValueFn: (
    invalidValue: T,
    requiredLength: number,
  ) => SingleValidationError = defaultErrorFn.requiredMapLength,
) {
  return (value: T) => (value.size !== length ? errorReturnValueFn(value, length) : undefined)
}

export function nonEmpty<T extends Map<unknown, unknown>>(
  errorReturnValueFn: (invalidValue: T) => SingleValidationError = defaultErrorFn.mapNonEmpty,
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
  ['length', typeof requiredMapLength<T>],
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
  ['length', requiredMapLength],
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
  T extends MapDef,
  Output extends Map<any, any> = MapDefToMapType<T>,
  Input = unknown,
  Validations extends MapValidations<Output> = MapValidations<Output>,
> = SafeParsableObject<Output, 'Map', Input> & {
  // default validations
  [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
    ? Validations[I] extends ValidationItem<any>
      ? Validations[I][0]
      : never
    : never]: (...args: Parameters<Validations[I][1]>) => VMap<T, Output, Input, Validations>
}

type MapOptions<T extends MapDef> = {
  parser?: SafeParseFn<unknown, MapDefToMapType<T>>
  breakOnFirstError: boolean
  notAMap: typeof defaultErrorFn.notAMap
}

export const vMap = <T extends MapDef>(
  mapDefinitionParsers: T,
  options: Partial<MapOptions<T>> = {},
) => {
  const fOptions: MapOptions<T> = {
    breakOnFirstError: true,
    notAMap: defaultErrorFn.notAMap,
    ...options,
  }
  return createBaseValidationBuilder(
    fOptions.parser ? fOptions.parser : parseMap(mapDefinitionParsers, fOptions),
    mapValidations as MapValidations<MapDefToMapType<T>>,
    `Map<${mapDefinitionParsers[0].type},${mapDefinitionParsers[1].type}>`,
  ) as unknown as VMap<T>
}
