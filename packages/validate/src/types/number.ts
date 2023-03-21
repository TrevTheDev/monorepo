/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError, DeepWriteable } from 'toolbelt'
import type {
  SafeParseFn,
  SafeParsableObject,
  SingleValidationError,
  ValidationArray,
  ValidationErrors,
  ValidationItem,
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

export function parseNumber(
  invalidNumberFn: (invalidValue: string) => SingleValidationError = defaultErrorFn.parseNumber,
): (value: unknown) => ResultError<ValidationErrors, number> {
  return (value: unknown): ResultError<ValidationErrors, number> => {
    if (typeof value !== 'number')
      return [{ input: value, errors: [invalidNumberFn(String(value))] }, undefined]
    if (Number.isNaN(value))
      return [{ input: value, errors: [invalidNumberFn(String(value))] }, undefined]
    return [undefined, value]
  }
}

export function coerceNumber(value: unknown): number {
  return Number(value)
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * validators
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export function greaterThan(
  number: number,
  errorReturnValueFn: (
    invalidValue: number,
    greaterThanValue: number,
  ) => SingleValidationError = defaultErrorFn.greaterThan,
) {
  return (value: number) => (value <= number ? errorReturnValueFn(value, number) : undefined)
}

export function greaterThanOrEqualTo(
  number: number,
  errorReturnValueFn: (
    invalidValue: number,
    greaterThanOrEqualToValue: number,
  ) => SingleValidationError = defaultErrorFn.greaterThanOrEqualTo,
) {
  return (value: number) => (value < number ? errorReturnValueFn(value, number) : undefined)
}

export function lesserThan(
  number: number,
  errorReturnValueFn: (
    invalidValue: number,
    lesserThanValue: number,
  ) => SingleValidationError = defaultErrorFn.lesserThan,
) {
  return (value: number) => (value >= number ? errorReturnValueFn(value, number) : undefined)
}

export function lesserThanOrEqualTo(
  number: number,
  errorReturnValueFn: (
    invalidValue: number,
    lesserThanOrEqualToValue: number,
  ) => SingleValidationError = defaultErrorFn.lesserThanOrEqualTo,
) {
  return (value: number) => (value > number ? errorReturnValueFn(value, number) : undefined)
}

export function integer(
  errorReturnValueFn: (invalidValue: number) => SingleValidationError = defaultErrorFn.integer,
) {
  return (value: number) => (!Number.isInteger(value) ? errorReturnValueFn(value) : undefined)
}

export function positive(
  errorReturnValueFn: (invalidValue: number) => SingleValidationError = defaultErrorFn.positive,
) {
  return (value: number) => (value <= 0 ? errorReturnValueFn(value) : undefined)
}

export function nonNegative(
  errorReturnValueFn: (invalidValue: number) => SingleValidationError = defaultErrorFn.nonNegative,
) {
  return (value: number) => (value < 0 ? errorReturnValueFn(value) : undefined)
}

export function negative(
  errorReturnValueFn: (invalidValue: number) => SingleValidationError = defaultErrorFn.negative,
) {
  return (value: number) => (value >= 0 ? errorReturnValueFn(value) : undefined)
}

export function nonPositive(
  errorReturnValueFn: (invalidValue: number) => SingleValidationError = defaultErrorFn.nonPositive,
) {
  return (value: number) => (value > 0 ? errorReturnValueFn(value) : undefined)
}

export function notNaN(errorReturnValueFn: () => SingleValidationError = defaultErrorFn.notNaN) {
  return (value: number) => (!Number.isNaN(value) ? errorReturnValueFn() : undefined)
}

// https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034
function floatSafeRemainder(val: number, step: number) {
  const valDecCount = (val.toString().split('.')[1] || '').length
  const stepDecCount = (step.toString().split('.')[1] || '').length
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount
  const valInt = parseInt(val.toFixed(decCount).replace('.', ''), 10)
  const stepInt = parseInt(step.toFixed(decCount).replace('.', ''), 10)
  return (valInt % stepInt) / 10 ** decCount
}

export function multipleOf(
  number: number,
  errorReturnValueFn: (
    invalidValue: number,
    multipleOfValue: number,
  ) => SingleValidationError = defaultErrorFn.multipleOf,
) {
  return (value: number) => {
    const remainder = floatSafeRemainder(value, number)
    return remainder !== 0 ? errorReturnValueFn(value, number) : undefined
  }
}

export function finite(
  errorReturnValueFn: (invalidValue: number) => SingleValidationError = defaultErrorFn.finite,
) {
  return (value: number) => (!Number.isFinite(value) ? errorReturnValueFn(value) : undefined)
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * all validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export type NumberValidations = DeepWriteable<typeof numberValidations_>

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
  [
    'customValidation',
    (
        customValidator: (
          value: number,
          ...otherArgs: unknown[]
        ) => SingleValidationError | undefined,
        ...otherArgs: unknown[]
      ) =>
      (value: number) =>
        customValidator(value, ...otherArgs),
  ],
] as const // [propName: string, validationFn: (...args) => (value: string) => string | undefined][]

export const numberValidations = numberValidations_ as NumberValidations

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vString
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export type VNumber<
  Output extends number = number,
  Input = unknown,
  Validations extends ValidationArray<number> = NumberValidations,
> = SafeParsableObject<Output, 'number', Input> & {
  // default validations
  [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
    ? Validations[I] extends ValidationItem<any>
      ? Validations[I][0]
      : never
    : never]: (...args: Parameters<Validations[I][1]>) => VNumber<Output, Input, Validations>
}

type NumberOptions = {
  parser: SafeParseFn<unknown, number>
  parseNumberError: (invalidValue: unknown) => SingleValidationError
}

export const vNumber = (options: Partial<NumberOptions> = {}) =>
  createBaseValidationBuilder(
    options.parser
      ? options.parser
      : parseNumber(
          options.parseNumberError ? options.parseNumberError : defaultErrorFn.parseNumber,
        ),
    numberValidations,
    'number',
  ) as unknown as VNumber

export const vNumberInstance = vNumber()
