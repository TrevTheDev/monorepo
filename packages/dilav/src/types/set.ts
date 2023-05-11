/* eslint-disable @typescript-eslint/no-explicit-any */
import { isError } from '../toolbelt'
import type { FlattenObjectUnion, ResultError } from '../toolbelt'

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
import { DefaultErrorFn } from './errorFns'
import { createValidationBuilder } from './base validations'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
const errorFns: DefaultErrorFn = baseObject[defaultErrorFnSym]

type SetDef = MinimumSchema
type SetDefToSetType<T extends SetDef, RT = Set<VInfer<T>>> = RT

export function parseSet<T extends SetDef>(
  valueSchema: T,
  options: SetOptions<T>,
): SafeParseFn<unknown, SetDefToSetType<T>> {
  type Opts = FlattenObjectUnion<SetOptions<T>>
  return (value: unknown): ResultError<ValidationErrors, SetDefToSetType<T>> => {
    const errors = [] as SingleValidationError[]
    if (value instanceof Set) {
      // eslint-disable-next-line no-restricted-syntax
      for (const setValue of value.values()) {
        const keyResult = valueSchema.safeParse(setValue)
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
      { input: value, errors: [((options as Opts).parseSet ?? errorFns.parseSet)(value)] },
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
]

const setValidations_ = [
  ['min', minimumSetLength],
  ['max', maximumSetLength],
  ['size', requiredSetLength],
  ['nonempty', nonEmpty],
] as const

const setValidations = setValidations_ as SetValidations<Set<unknown>>

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
> = BaseSchema<Output, string, 'set', Input> & {
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

const baseSetObject = createValidationBuilder(baseObject, setValidations)

export function vSet<T extends SetDef>(
  setDefinitionSchema: T,
  options: SetOptions<T> = {},
): VSet<T> {
  type Opts = FlattenObjectUnion<SetOptions<T>>
  const fOptions: SetOptions<T> = {
    breakOnFirstError: true,
    ...options,
  }

  return createFinalBaseObject(
    baseSetObject,
    (options as Opts).parser ?? parseSet(setDefinitionSchema, fOptions),
    `Set<${setDefinitionSchema.type}>`,
    'set',
    { setDefinitionSchema },
  ) as VSet<T>
}
