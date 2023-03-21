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

type SetDef = MinimumSafeParsableObject
type SetDefToSetType<T extends SetDef> = Set<VInfer<T>>

export function parseSet<T extends SetDef>(
  valueParser: T,
  options: SetOptions<any>,
): (value: unknown) => ResultError<ValidationErrors, SetDefToSetType<T>> {
  return (value: unknown): ResultError<ValidationErrors, SetDefToSetType<T>> => {
    const errors = [] as SingleValidationError[]
    if (value instanceof Set) {
      // eslint-disable-next-line no-restricted-syntax
      for (const setValue of value.values()) {
        const keyResult = valueParser.safeParse(setValue)
        if (isError(keyResult)) {
          if (options.breakOnFirstError) return keyResult
          errors.push(...keyResult[0].errors)
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
    return [{ input: value, errors: [options.notASet(value)] }, undefined]
  }
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * validators
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export function minimumSetLength<T extends Set<unknown>>(
  length: number,
  errorReturnValueFn: (
    invalidValue: T,
    minLength: number,
  ) => SingleValidationError = defaultErrorFn.minimumSetLength,
) {
  return (value: T) => (value.size < length ? errorReturnValueFn(value, length) : undefined)
}

export function maximumSetLength<T extends Set<unknown>>(
  length: number,
  errorReturnValueFn: (
    invalidValue: T,
    maxLength: number,
  ) => SingleValidationError = defaultErrorFn.maximumSetLength,
) {
  return (value: T) => (value.size > length ? errorReturnValueFn(value, length) : undefined)
}

export function requiredSetLength<T extends Set<unknown>>(
  length: number,
  errorReturnValueFn: (
    invalidValue: T,
    requiredLength: number,
  ) => SingleValidationError = defaultErrorFn.requiredSetLength,
) {
  return (value: T) => (value.size !== length ? errorReturnValueFn(value, length) : undefined)
}

export function nonEmpty<T extends Set<unknown>>(
  errorReturnValueFn: (invalidValue: T) => SingleValidationError = defaultErrorFn.setNonEmpty,
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
type SetValidations<T extends Set<unknown>> = [
  ['min', typeof minimumSetLength<T>],
  ['max', typeof maximumSetLength<T>],
  ['size', typeof requiredSetLength<T>],
  ['nonempty', typeof nonEmpty<T>],
  [
    'customValidation',
    (
      customValidator: (value: T, ...otherArgs: unknown[]) => SingleValidationError | undefined,
      ...otherArgs: unknown[]
    ) => (value: T) => SingleValidationError | undefined,
  ],
]

const setValidations = [
  ['min', minimumSetLength],
  ['max', maximumSetLength],
  ['size', requiredSetLength],
  ['nonempty', nonEmpty],
  [
    'customValidation',
    (customValidator, ...otherArgs) =>
      (value) =>
        customValidator(value, ...otherArgs),
  ],
] as const

// export const setValidations = instanceOfValidations_ as InstanceOfValidations

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vSet
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export type VSet<
  T extends SetDef,
  Output extends Set<any> = SetDefToSetType<T>,
  Input = unknown,
  Validations extends SetValidations<Output> = SetValidations<Output>,
> = SafeParsableObject<Output, 'Set', Input> & {
  // default validations
  [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
    ? Validations[I] extends ValidationItem<any>
      ? Validations[I][0]
      : never
    : never]: (...args: Parameters<Validations[I][1]>) => VSet<T, Output, Input, Validations>
}

type SetOptions<T extends SetDef> = {
  parser?: SafeParseFn<unknown, SetDefToSetType<T>>
  breakOnFirstError: boolean
  notASet: typeof defaultErrorFn.notASet
}

export const vSet = <T extends SetDef>(
  setDefinitionParser: T,
  options: Partial<SetOptions<T>> = {},
) => {
  const fOptions: SetOptions<T> = {
    breakOnFirstError: true,
    notASet: defaultErrorFn.notASet,
    ...options,
  }
  return createBaseValidationBuilder(
    fOptions.parser ? fOptions.parser : parseSet(setDefinitionParser, fOptions),
    setValidations as SetValidations<SetDefToSetType<T>>,
    `Set<${setDefinitionParser.type}>`,
  ) as unknown as VSet<T>
}
