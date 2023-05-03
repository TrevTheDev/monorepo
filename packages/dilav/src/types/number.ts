/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError, DeepWriteable } from '@trevthedev/toolbelt'
import { createFinalBaseObject } from './base'
import {
  SafeParseFn,
  BaseSchema,
  defaultErrorFnSym,
  ValidationArray,
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

export function parseNumber(
  invalidNumberFn?: DefaultErrorFn['parseNumber'],
): SafeParseFn<unknown, number> {
  return (value: unknown): ResultError<ValidationErrors, number> => {
    if (typeof value !== 'number') {
      return [
        { input: value, errors: [(invalidNumberFn ?? errorFns.parseNumber)(value)] },
        undefined,
      ]
    }
    if (Number.isNaN(value)) {
      return [
        { input: value, errors: [(invalidNumberFn ?? errorFns.parseNumber)(value)] },
        undefined,
      ]
    }
    return [undefined, value]
  }
}

export function coerceNumber(value: unknown): ResultError<ValidationErrors, number> {
  return parseNumber()(Number(value))
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * validators
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

type NumberValidationFn = (value: number) => string | undefined

export function greaterThan(
  number: number,
  errorReturnValueFn?: DefaultErrorFn['greaterThan'],
): NumberValidationFn {
  return (value: number) =>
    value <= number ? (errorReturnValueFn ?? errorFns.greaterThan)(value, number) : undefined
}

export function greaterThanOrEqualTo(
  number: number,
  errorReturnValueFn?: DefaultErrorFn['greaterThanOrEqualTo'],
): NumberValidationFn {
  return (value: number) =>
    value < number
      ? (errorReturnValueFn ?? errorFns.greaterThanOrEqualTo)(value, number)
      : undefined
}

export function lesserThan(
  number: number,
  errorReturnValueFn?: DefaultErrorFn['lesserThan'],
): NumberValidationFn {
  return (value: number) =>
    value >= number ? (errorReturnValueFn ?? errorFns.lesserThan)(value, number) : undefined
}

export function lesserThanOrEqualTo(
  number: number,
  errorReturnValueFn?: DefaultErrorFn['lesserThanOrEqualTo'],
): NumberValidationFn {
  return (value: number) =>
    value > number ? (errorReturnValueFn ?? errorFns.lesserThanOrEqualTo)(value, number) : undefined
}

export function integer(errorReturnValueFn?: DefaultErrorFn['integer']): NumberValidationFn {
  return (value: number) =>
    !Number.isInteger(value) ? (errorReturnValueFn ?? errorFns.integer)(value) : undefined
}

export function positive(errorReturnValueFn?: DefaultErrorFn['positive']): NumberValidationFn {
  return (value: number) =>
    value <= 0 ? (errorReturnValueFn ?? errorFns.positive)(value) : undefined
}

export function nonNegative(
  errorReturnValueFn?: DefaultErrorFn['nonNegative'],
): NumberValidationFn {
  return (value: number) =>
    value < 0 ? (errorReturnValueFn ?? errorFns.nonNegative)(value) : undefined
}

export function negative(errorReturnValueFn?: DefaultErrorFn['negative']): NumberValidationFn {
  return (value: number) =>
    value >= 0 ? (errorReturnValueFn ?? errorFns.negative)(value) : undefined
}

export function nonPositive(
  errorReturnValueFn?: DefaultErrorFn['nonPositive'],
): NumberValidationFn {
  return (value: number) =>
    value > 0 ? (errorReturnValueFn ?? errorFns.nonPositive)(value) : undefined
}

export function notNaN(errorReturnValueFn?: DefaultErrorFn['notNaN']): NumberValidationFn {
  return (value: number) =>
    !Number.isNaN(value) ? (errorReturnValueFn ?? errorFns.notNaN)() : undefined
}

// https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034
function floatSafeRemainder(val: number, step: number) {
  const valDecCount = (val.toString().split('.')[1] ?? '').length
  const stepDecCount = (step.toString().split('.')[1] ?? '').length
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount
  const valInt = parseInt(val.toFixed(decCount).replace('.', ''), 10)
  const stepInt = parseInt(step.toFixed(decCount).replace('.', ''), 10)
  return (valInt % stepInt) / 10 ** decCount
}

export function multipleOf(
  number: number,
  errorReturnValueFn?: DefaultErrorFn['multipleOf'],
): NumberValidationFn {
  return (value: number) => {
    const remainder = floatSafeRemainder(value, number)
    return remainder !== 0 ? (errorReturnValueFn ?? errorFns.multipleOf)(value, number) : undefined
  }
}

export function safe(errorReturnValueFn?: DefaultErrorFn['safe']): NumberValidationFn {
  return (value: number) =>
    value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER
      ? undefined
      : (errorReturnValueFn ?? errorFns.safe)(value)
}

export function finite(errorReturnValueFn?: DefaultErrorFn['finite']): NumberValidationFn {
  return (value: number) =>
    !Number.isFinite(value) ? (errorReturnValueFn ?? errorFns.finite)(value) : undefined
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * all validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type NumberValidations = DeepWriteable<typeof numberValidations_>

const numberValidations_ = [
  ['gt', greaterThan],
  ['gte', greaterThanOrEqualTo],
  ['min', greaterThanOrEqualTo],
  ['lt', lesserThan],
  ['lte', lesserThanOrEqualTo],
  ['max', lesserThanOrEqualTo],
  ['int', integer],
  ['positive', positive],
  ['nonnegative', nonNegative],
  ['negative', negative],
  ['nonpositive', nonPositive],
  ['multipleOf', multipleOf],
  ['step', multipleOf],
  ['finite', finite],
  ['safe', safe],
] as const // [propName: string, validationFn: (...args) => (value: string) => string | undefined][]

const numberValidations = numberValidations_ as NumberValidations

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vNumber
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

type NumberValidationFuncs<
  Output extends number,
  Input,
  Validations extends ValidationArray<number> = NumberValidations,
> = {
  [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
    ? Validations[I] extends ValidationItem<any>
      ? Validations[I][0]
      : never
    : never]: (...args: Parameters<Validations[I][1]>) => VNumber<Output, Input>
}

export interface VNumber<Output extends number = number, Input = unknown>
  extends BaseSchema<Output, 'number', 'number', Input>,
    NumberValidationFuncs<Output, Input> {
  readonly coerce: this
  custom(newOptions: NumberOptions): this
}

type NumberOptions =
  | {
      parseNumberError: DefaultErrorFn['parseNumber']
    }
  | {
      parser: SafeParseFn<unknown, number>
    }
  | Record<string, never>

const baseNumberObject = createValidationBuilder(
  baseObject,
  numberValidations,
  coerceNumber,
  vNumber,
)

export function vNumber(options: NumberOptions = {}): VNumber {
  return createFinalBaseObject(
    baseNumberObject,
    (options as any).parser ?? parseNumber((options as any).parseNumberError),
    'number',
    'number',
  ) as VNumber
}

export const vNumberInstance = vNumber()
