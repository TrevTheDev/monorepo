/* eslint-disable import/prefer-default-export */
import defaultErrorFn, { DefaultErrorFn } from '../shared/errorFns'
import { SingleValidationError, customValidations } from './validations'

// #TODO: make settable
const errorFns = defaultErrorFn

type BigIntValidationFn = (value: bigint) => SingleValidationError | undefined

// // https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034
// function floatSafeRemainder(val: bigint, step: bigint) {
//   const valDecCount = (val.toString().split('.')[1] ?? '').length
//   const stepDecCount = (step.toString().split('.')[1] ?? '').length
//   const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount
//   const valInt = parseInt(val.toFixed(decCount).replace('.', ''), 10)
//   const stepInt = parseInt(step.toFixed(decCount).replace('.', ''), 10)
//   return (valInt % stepInt) / 10 ** decCount
// }

export const bigIntValidations = {
  /**
   * value > number
   */
  greaterThan(
    number: bigint,
    bigIntGreaterThanError?: DefaultErrorFn['bigIntGreaterThanError'],
  ): BigIntValidationFn {
    return (value: bigint) =>
      value > number
        ? undefined
        : (bigIntGreaterThanError ?? errorFns.bigIntGreaterThanError)(value, number)
  },
  /**
   * value > number
   */
  greaterThanOrEqualTo(
    number: bigint,
    bigIntGreaterThanOrEqualToError?: DefaultErrorFn['bigIntGreaterThanOrEqualToError'],
  ): BigIntValidationFn {
    return (value: bigint) =>
      value >= number
        ? undefined
        : (bigIntGreaterThanOrEqualToError ?? errorFns.bigIntGreaterThanOrEqualToError)(
            value,
            number,
          )
  },
  /**
   * value < number
   */
  lesserThan(
    number: bigint,
    bigIntLesserThanError?: DefaultErrorFn['bigIntLesserThanError'],
  ): BigIntValidationFn {
    return (value: bigint) =>
      value < number
        ? undefined
        : (bigIntLesserThanError ?? errorFns.bigIntLesserThanError)(value, number)
  },
  /**
   * value <= number
   */
  lesserThanOrEqualTo(
    number: bigint,
    bigIntLesserThanOrEqualToError?: DefaultErrorFn['bigIntLesserThanOrEqualToError'],
  ): BigIntValidationFn {
    return (value: bigint) =>
      value <= number
        ? undefined
        : (bigIntLesserThanOrEqualToError ?? errorFns.bigIntLesserThanOrEqualToError)(value, number)
  },
  /**
   * Number.isInteger(value)
   */
  integer(bigIntIntegerError?: DefaultErrorFn['bigIntIntegerError']): BigIntValidationFn {
    return (value: bigint) =>
      !Number.isInteger(value)
        ? (bigIntIntegerError ?? errorFns.bigIntIntegerError)(value)
        : undefined
  },
  /**
   * value > 0
   */
  positive(bigIntPositiveError?: DefaultErrorFn['bigIntPositiveError']): BigIntValidationFn {
    return (value: bigint) =>
      value > 0 ? undefined : (bigIntPositiveError ?? errorFns.bigIntPositiveError)(value)
  },
  /**
   * value >= 0
   */
  nonNegative(
    bigIntNonNegativeError?: DefaultErrorFn['bigIntNonNegativeError'],
  ): BigIntValidationFn {
    return (value: bigint) =>
      value >= 0 ? undefined : (bigIntNonNegativeError ?? errorFns.bigIntNonNegativeError)(value)
  },
  /**
   * value < 0
   */
  negative(bigIntNegativeError?: DefaultErrorFn['bigIntNegativeError']): BigIntValidationFn {
    return (value: bigint) =>
      value < 0 ? undefined : (bigIntNegativeError ?? errorFns.bigIntNegativeError)(value)
  },
  /**
   * value <= 0
   */
  nonPositive(
    bigIntNonPositiveError?: DefaultErrorFn['bigIntNonPositiveError'],
  ): BigIntValidationFn {
    return (value: bigint) =>
      value <= 0 ? undefined : (bigIntNonPositiveError ?? errorFns.bigIntNonPositiveError)(value)
  },
  // /**
  //  * Number.isNaN(value)
  //  */
  // notNaN(bigIntNotNaNError?: DefaultErrorFn['bigIntNotNaNError']): BigIntValidationFn {
  //   return (value: bigint) =>
  //     Number.isNaN(value) ? (bigIntNotNaNError ?? errorFns.bigIntNotNaNError)() : undefined
  // },

  // multipleOf(
  //   number: bigint,
  //   bigIntMultipleOfError?: DefaultErrorFn['bigIntMultipleOfError'],
  // ): BigIntValidationFn {
  //   return (value: bigint) => {
  //     const remainder = floatSafeRemainder(value, number)
  //     return remainder !== 0
  //       ? (bigIntMultipleOfError ?? errorFns.bigIntMultipleOfError)(value, number)
  //       : undefined
  //   }
  // },
  // /**
  //  * value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER
  //  */
  // safe(bigIntSafeError?: DefaultErrorFn['bigIntSafeError']): BigIntValidationFn {
  //   return (value: bigint) =>
  //     value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER
  //       ? undefined
  //       : (bigIntSafeError ?? errorFns.bigIntSafeError)(value)
  // },
  // /**
  //  * Number.isFinite(value)
  //  */
  // finite(bigIntFiniteError?: DefaultErrorFn['bigIntFiniteError']): BigIntValidationFn {
  //   return (value: bigint) =>
  //     !Number.isFinite(value) ? (bigIntFiniteError ?? errorFns.bigIntFiniteError)(value) : undefined
  // },
  custom: customValidations<bigint>().custom,
}
