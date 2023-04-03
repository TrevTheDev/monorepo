/* eslint-disable @typescript-eslint/no-explicit-any */
import { isError } from 'toolbelt'
import type { ResultError } from 'toolbelt'

import {
  SafeParseFn,
  SafeParsableObject,
  MinimumSafeParsableObject,
  VInfer,
  defaultErrorFnSym,
  createFinalBaseObject,
} from './base'

import { baseObject } from './init'
import { DefaultErrorFn } from './errorFns'
import {
  SingleValidationError,
  ValidationErrors,
  ValidationItem,
  createValidationBuilder,
} from './base validations'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
const errorFns = baseObject[defaultErrorFnSym]

type SetDef = MinimumSafeParsableObject
type SetDefToSetType<T extends SetDef> = Set<VInfer<T>>

export function parseSet<T extends SetDef>(
  valueParser: T,
  options: SetOptions<any>,
): SafeParseFn<unknown, SetDefToSetType<T>> {
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
    return [
      { input: value, errors: [((options as any).parseSet || errorFns.parseSet)(value)] },
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
export function minimumSetLength<T extends Set<unknown>>(
  length: number,
  errorReturnValueFn: (
    invalidValue: T,
    minLength: number,
  ) => SingleValidationError = errorFns.minimumSetLength,
) {
  return (value: T) => (value.size < length ? errorReturnValueFn(value, length) : undefined)
}

export function maximumSetLength<T extends Set<unknown>>(
  length: number,
  errorReturnValueFn: (
    invalidValue: T,
    maxLength: number,
  ) => SingleValidationError = errorFns.maximumSetLength,
) {
  return (value: T) => (value.size > length ? errorReturnValueFn(value, length) : undefined)
}

export function requiredSetLength<T extends Set<unknown>>(
  length: number,
  errorReturnValueFn: (
    invalidValue: T,
    requiredLength: number,
  ) => SingleValidationError = errorFns.requiredSetLength,
) {
  return (value: T) => (value.size !== length ? errorReturnValueFn(value, length) : undefined)
}

export function nonEmpty<T extends Set<unknown>>(
  errorReturnValueFn: (invalidValue: T) => SingleValidationError = errorFns.setNonEmpty,
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
> = SafeParsableObject<Output, string, 'set', Input> & {
  // default validations
  [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
    ? Validations[I] extends ValidationItem<any>
      ? Validations[I][0]
      : never
    : never]: (...args: Parameters<Validations[I][1]>) => VSet<T, Output, Input, Validations>
}

type SetOptions<T extends SetDef> = (
  | {
      parser: SafeParseFn<unknown, SetDefToSetType<T>>
    }
  | {
      parseSet: DefaultErrorFn['parseSet']
    }
  // eslint-disable-next-line @typescript-eslint/ban-types
  | {}
) & {
  breakOnFirstError?: boolean
}

const baseSetObject = createValidationBuilder(baseObject, setValidations as any)

export function vSet<T extends SetDef>(
  setDefinitionParser: T,
  options: SetOptions<T> = {},
): VSet<T> {
  const fOptions: SetOptions<T> = {
    breakOnFirstError: true,
    ...options,
  }

  return createFinalBaseObject(
    baseSetObject,
    (options as any).parser || parseSet(setDefinitionParser, fOptions),
    `Set<${setDefinitionParser.type}>`,
    'set',
    { setDefinitionParser },
  ) as VSet<T>
}
