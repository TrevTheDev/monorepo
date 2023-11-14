/* eslint-disable import/prefer-default-export */
import defaultErrorFn, { DefaultErrorFn } from '../shared/errorFns'
import { SingleValidationError, customValidations } from './validations'

// #TODO: make settable
const errorFns = defaultErrorFn

type NumberValidationFn = (value: number) => SingleValidationError | undefined

// https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034
function floatSafeRemainder(val: number, step: number) {
  const valDecCount = (val.toString().split('.')[1] ?? '').length
  const stepDecCount = (step.toString().split('.')[1] ?? '').length
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount
  const valInt = parseInt(val.toFixed(decCount).replace('.', ''), 10)
  const stepInt = parseInt(step.toFixed(decCount).replace('.', ''), 10)
  return (valInt % stepInt) / 10 ** decCount
}

export const numberValidations = {
  /**
   * value > number
   */
  greaterThan(
    number: number,
    greaterThanError?: DefaultErrorFn['greaterThanError'],
  ): NumberValidationFn {
    return (value: number) =>
      value > number ? undefined : (greaterThanError ?? errorFns.greaterThanError)(value, number)
  },
  /**
   * value > number
   */
  greaterThanOrEqualTo(
    number: number,
    greaterThanOrEqualToError?: DefaultErrorFn['greaterThanOrEqualToError'],
  ): NumberValidationFn {
    return (value: number) =>
      value >= number
        ? undefined
        : (greaterThanOrEqualToError ?? errorFns.greaterThanOrEqualToError)(value, number)
  },
  /**
   * value < number
   */
  lesserThan(
    number: number,
    lesserThanError?: DefaultErrorFn['lesserThanError'],
  ): NumberValidationFn {
    return (value: number) =>
      value < number ? undefined : (lesserThanError ?? errorFns.lesserThanError)(value, number)
  },
  /**
   * value <= number
   */
  lesserThanOrEqualTo(
    number: number,
    lesserThanOrEqualToError?: DefaultErrorFn['lesserThanOrEqualToError'],
  ): NumberValidationFn {
    return (value: number) =>
      value <= number
        ? undefined
        : (lesserThanOrEqualToError ?? errorFns.lesserThanOrEqualToError)(value, number)
  },
  /**
   * Number.isInteger(value)
   */
  integer(integerError?: DefaultErrorFn['integerError']): NumberValidationFn {
    return (value: number) =>
      !Number.isInteger(value) ? (integerError ?? errorFns.integerError)(value) : undefined
  },
  /**
   * value > 0
   */
  positive(positiveError?: DefaultErrorFn['positiveError']): NumberValidationFn {
    return (value: number) =>
      value > 0 ? undefined : (positiveError ?? errorFns.positiveError)(value)
  },
  /**
   * value >= 0
   */
  nonNegative(nonNegativeError?: DefaultErrorFn['nonNegativeError']): NumberValidationFn {
    return (value: number) =>
      value >= 0 ? undefined : (nonNegativeError ?? errorFns.nonNegativeError)(value)
  },
  /**
   * value < 0
   */
  negative(negativeError?: DefaultErrorFn['negativeError']): NumberValidationFn {
    return (value: number) =>
      value < 0 ? undefined : (negativeError ?? errorFns.negativeError)(value)
  },
  /**
   * value <= 0
   */
  nonPositive(nonPositiveError?: DefaultErrorFn['nonPositiveError']): NumberValidationFn {
    return (value: number) =>
      value <= 0 ? undefined : (nonPositiveError ?? errorFns.nonPositiveError)(value)
  },
  /**
   * Number.isNaN(value)
   */
  notNaN(notNaNError?: DefaultErrorFn['notNaNError']): NumberValidationFn {
    return (value: number) =>
      Number.isNaN(value) ? (notNaNError ?? errorFns.notNaNError)() : undefined
  },

  multipleOf(
    number: number,
    multipleOfError?: DefaultErrorFn['multipleOfError'],
  ): NumberValidationFn {
    return (value: number) => {
      const remainder = floatSafeRemainder(value, number)
      return remainder !== 0
        ? (multipleOfError ?? errorFns.multipleOfError)(value, number)
        : undefined
    }
  },
  /**
   * value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER
   */
  safe(safeError?: DefaultErrorFn['safeError']): NumberValidationFn {
    return (value: number) =>
      value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER
        ? undefined
        : (safeError ?? errorFns.safeError)(value)
  },
  /**
   * Number.isFinite(value)
   */
  finite(finiteError?: DefaultErrorFn['finiteError']): NumberValidationFn {
    return (value: number) =>
      !Number.isFinite(value) ? (finiteError ?? errorFns.finiteError)(value) : undefined
  },
  custom: customValidations<number>().custom,
}
