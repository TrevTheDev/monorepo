import type { ResultError, DeepWriteable } from '@trevthedev/toolbelt'

import type {
  SafeParseFn,
  BaseSchema,
  SingleValidationError,
  ValidationArray,
  ValidationErrors,
  ValidationItem,
} from './types'
import { baseObject } from './init'
import { createValidationBuilder } from './base validations'
import { createFinalBaseObject } from './base'
import { defaultErrorFnSym } from './types'
import { DefaultErrorFn } from './errorFns'

const errorFns = baseObject[defaultErrorFnSym]

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export function parseBigInt(
  invalidBigIntFn?: (invalidValue: string) => SingleValidationError,
): (value: unknown) => ResultError<ValidationErrors, bigint> {
  return (value: unknown): ResultError<ValidationErrors, bigint> => {
    if (typeof value !== 'bigint') {
      return [
        { input: value, errors: [(invalidBigIntFn ?? errorFns.parseBigInt)(String(value))] },
        undefined,
      ]
    }
    return [undefined, value]
  }
}

export function coerceBigInt(
  value: string | number | bigint | boolean,
): ResultError<ValidationErrors, bigint> {
  return [undefined, BigInt(value)]
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * validators
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type BigIntValidationFn = (value: bigint) => string | undefined

export function greaterThan(
  bigint: bigint,
  errorReturnValueFn?: DefaultErrorFn['bigIntGreaterThan'],
): BigIntValidationFn {
  return (value: bigint) =>
    value <= bigint ? (errorReturnValueFn ?? errorFns.bigIntGreaterThan)(value, bigint) : undefined
}

export function greaterThanOrEqualTo(
  bigint: bigint,
  errorReturnValueFn?: DefaultErrorFn['bigIntGreaterThanOrEqualTo'],
): BigIntValidationFn {
  return (value: bigint) =>
    value < bigint
      ? (errorReturnValueFn ?? errorFns.bigIntGreaterThanOrEqualTo)(value, bigint)
      : undefined
}

export function lesserThan(
  bigint: bigint,
  errorReturnValueFn?: DefaultErrorFn['bigIntLesserThan'],
): BigIntValidationFn {
  return (value: bigint) =>
    value >= bigint ? (errorReturnValueFn ?? errorFns.bigIntLesserThan)(value, bigint) : undefined
}

export function lesserThanOrEqualTo(
  bigint: bigint,
  errorReturnValueFn?: DefaultErrorFn['bigIntLesserThanOrEqualTo'],
): BigIntValidationFn {
  return (value: bigint) =>
    value > bigint
      ? (errorReturnValueFn ?? errorFns.bigIntLesserThanOrEqualTo)(value, bigint)
      : undefined
}

export function integer(errorReturnValueFn?: DefaultErrorFn['bigIntInteger']): BigIntValidationFn {
  return (value: bigint) =>
    !Number.isInteger(value) ? (errorReturnValueFn ?? errorFns.bigIntInteger)(value) : undefined
}

export function positive(
  errorReturnValueFn?: DefaultErrorFn['bigIntPositive'],
): BigIntValidationFn {
  return (value: bigint) =>
    value <= 0 ? (errorReturnValueFn ?? errorFns.bigIntPositive)(value) : undefined
}

export function nonNegative(
  errorReturnValueFn?: DefaultErrorFn['bigIntNonNegative'],
): BigIntValidationFn {
  return (value: bigint) =>
    value < 0 ? (errorReturnValueFn ?? errorFns.bigIntNonNegative)(value) : undefined
}

export function negative(
  errorReturnValueFn?: DefaultErrorFn['bigIntNegative'],
): BigIntValidationFn {
  return (value: bigint) =>
    value >= 0 ? (errorReturnValueFn ?? errorFns.bigIntNegative)(value) : undefined
}

export function nonPositive(
  errorReturnValueFn?: DefaultErrorFn['bigIntNonPositive'],
): BigIntValidationFn {
  return (value: bigint) =>
    value > 0 ? (errorReturnValueFn ?? errorFns.bigIntNonPositive)(value) : undefined
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * all validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type BigIntValidations = DeepWriteable<typeof bigIntValidations_> extends ValidationArray<bigint>
  ? DeepWriteable<typeof bigIntValidations_>
  : never

const bigIntValidations_ = [
  ['gt', greaterThan],
  ['gte', greaterThanOrEqualTo],
  ['min', greaterThanOrEqualTo],
  ['lt', lesserThan],
  ['lte', lesserThanOrEqualTo],
  ['max', lesserThanOrEqualTo],
  ['int', integer],
  ['positive', positive],
  ['nonNegative', nonNegative],
  ['negative', negative],
  ['nonPositive', nonPositive],
  // ['multipleOf', multipleOf],
] as const // [propName: string, validationFn: (...args) => (value: string) => string | undefined][]

const bigIntValidations = bigIntValidations_ as BigIntValidations

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vBigInt
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type BigIntValidationFuncs<
  Output extends bigint,
  Input,
  Validations extends ValidationArray<bigint> = BigIntValidations,
> = {
  [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
    ? Validations[I] extends ValidationItem<bigint>
      ? Validations[I][0]
      : never
    : never]: (...args: Parameters<Validations[I][1]>) => VBigInt<Output, Input>
}

export interface VBigInt<Output extends bigint = bigint, Input = unknown>
  extends BaseSchema<Output, 'bigint', 'bigint', Input>,
    BigIntValidationFuncs<Output, Input> {
  readonly coerce: VBigInt<Output, string | number | bigint | boolean>
  custom(newOptions: BigIntOptions): this
}

type BigIntOptions = {
  parser?: SafeParseFn<unknown, bigint>
  parseBigIntError?: (invalidValue: unknown) => SingleValidationError
}

const baseBigIntObject = createValidationBuilder(
  baseObject,
  bigIntValidations,
  coerceBigInt,
  vBigInt,
)

export function vBigInt<Input = unknown, Output extends bigint = bigint>(
  options: BigIntOptions = {},
): VBigInt<Output, Input> {
  return createFinalBaseObject(
    baseBigIntObject,
    options.parser ?? parseBigInt(options.parseBigIntError),
    'bigint',
    'bigint',
  ) as VBigInt<Output, Input>
}

export const vBigIntInstance = vBigInt()
