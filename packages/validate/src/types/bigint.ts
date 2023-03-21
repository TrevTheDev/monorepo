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

export function parseBigInt(
  invalidBigIntFn: (invalidValue: string) => SingleValidationError = defaultErrorFn.parseBigInt,
): (value: unknown) => ResultError<ValidationErrors, bigint> {
  return (value: unknown): ResultError<ValidationErrors, bigint> => {
    if (typeof value !== 'bigint')
      return [{ input: value, errors: [invalidBigIntFn(String(value))] }, undefined]
    return [undefined, value]
  }
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * validators
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export function greaterThan(
  bigint: bigint,
  errorReturnValueFn: (
    invalidValue: bigint,
    greaterThanValue: bigint,
  ) => SingleValidationError = defaultErrorFn.bigIntGreaterThan,
) {
  return (value: bigint) => (value <= bigint ? errorReturnValueFn(value, bigint) : undefined)
}

export function greaterThanOrEqualTo(
  bigint: bigint,
  errorReturnValueFn: (
    invalidValue: bigint,
    greaterThanOrEqualToValue: bigint,
  ) => SingleValidationError = defaultErrorFn.bigIntGreaterThanOrEqualTo,
) {
  return (value: bigint) => (value < bigint ? errorReturnValueFn(value, bigint) : undefined)
}

export function lesserThan(
  bigint: bigint,
  errorReturnValueFn: (
    invalidValue: bigint,
    lesserThanValue: bigint,
  ) => SingleValidationError = defaultErrorFn.bigIntLesserThan,
) {
  return (value: bigint) => (value >= bigint ? errorReturnValueFn(value, bigint) : undefined)
}

export function lesserThanOrEqualTo(
  bigint: bigint,
  errorReturnValueFn: (
    invalidValue: bigint,
    lesserThanOrEqualToValue: bigint,
  ) => SingleValidationError = defaultErrorFn.bigIntLesserThanOrEqualTo,
) {
  return (value: bigint) => (value > bigint ? errorReturnValueFn(value, bigint) : undefined)
}

export function integer(
  errorReturnValueFn: (
    invalidValue: bigint,
  ) => SingleValidationError = defaultErrorFn.bigIntInteger,
) {
  return (value: bigint) => (!Number.isInteger(value) ? errorReturnValueFn(value) : undefined)
}

export function positive(
  errorReturnValueFn: (
    invalidValue: bigint,
  ) => SingleValidationError = defaultErrorFn.bigIntPositive,
) {
  return (value: bigint) => (value <= 0 ? errorReturnValueFn(value) : undefined)
}

export function nonNegative(
  errorReturnValueFn: (
    invalidValue: bigint,
  ) => SingleValidationError = defaultErrorFn.bigIntNonNegative,
) {
  return (value: bigint) => (value < 0 ? errorReturnValueFn(value) : undefined)
}

export function negative(
  errorReturnValueFn: (
    invalidValue: bigint,
  ) => SingleValidationError = defaultErrorFn.bigIntNegative,
) {
  return (value: bigint) => (value >= 0 ? errorReturnValueFn(value) : undefined)
}

export function nonPositive(
  errorReturnValueFn: (
    invalidValue: bigint,
  ) => SingleValidationError = defaultErrorFn.bigIntNonPositive,
) {
  return (value: bigint) => (value > 0 ? errorReturnValueFn(value) : undefined)
}

// // https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034
// function floatSafeRemainder(val: bigint, step: bigint) {
//   const valDecCount = (val.toString().split('.')[1] || '').length
//   const stepDecCount = (step.toString().split('.')[1] || '').length
//   const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount
//   const valInt = parseInt(val.toFixed(decCount).replace('.', ''), 10)
//   const stepInt = parseInt(step.toFixed(decCount).replace('.', ''), 10)
//   return (valInt % stepInt) / 10 ** decCount
// }

// export function multipleOf(
//   bigint: bigint,
//   errorReturnValueFn: (
//     invalidValue: bigint,
//     multipleOfValue: bigint,
//   ) => SingleValidationError = defaultErrorFn.bigIntMultipleOf,
// ) {
//   return (value: bigint) => {
//     const remainder = floatSafeRemainder(value, bigint)
//     return remainder !== 0 ? errorReturnValueFn(value, bigint) : undefined
//   }
// }

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * all validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export type BigIntValidations = DeepWriteable<typeof bigIntValidations_>

const bigIntValidations_ = [
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
  // ['multipleOf', multipleOf],
  [
    'customValidation',
    (
        customValidator: (
          value: bigint,
          ...otherArgs: unknown[]
        ) => SingleValidationError | undefined,
        ...otherArgs: unknown[]
      ) =>
      (value: bigint) =>
        customValidator(value, ...otherArgs),
  ],
] as const // [propName: string, validationFn: (...args) => (value: string) => string | undefined][]

export const bigIntValidations = bigIntValidations_ as BigIntValidations

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vBigInt
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export type VBigInt<
  Output extends number = number,
  Input = unknown,
  Validations extends ValidationArray<bigint> = BigIntValidations,
> = SafeParsableObject<Output, 'bigint', Input> & {
  // default validations
  [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
    ? Validations[I] extends ValidationItem<any>
      ? Validations[I][0]
      : never
    : never]: (...args: Parameters<Validations[I][1]>) => VBigInt<Output, Input, Validations>
}

type BigIntOptions = {
  parser: SafeParseFn<unknown, bigint>
  parseBigIntError: (invalidValue: unknown) => SingleValidationError
}

export const vBigInt = (options: Partial<BigIntOptions> = {}) =>
  createBaseValidationBuilder(
    options.parser
      ? options.parser
      : parseBigInt(
          options.parseBigIntError ? options.parseBigIntError : defaultErrorFn.parseBigInt,
        ),
    bigIntValidations,
    'bigint',
  ) as unknown as VBigInt

export const vBigIntInstance = vBigInt()
