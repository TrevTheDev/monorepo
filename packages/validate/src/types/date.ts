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

export function parseDate(
  invalidDateFn: (invalidValue: string) => SingleValidationError = defaultErrorFn.parseDate,
): (value: unknown) => ResultError<ValidationErrors, Date> {
  return (value: unknown): ResultError<ValidationErrors, Date> =>
    !(value instanceof Date)
      ? [{ input: value, errors: [invalidDateFn(String(value))] }, undefined]
      : [undefined, value as Date]
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export function after(
  date: Date,
  errorReturnValueFn: (
    invalidValue: Date,
    afterDate: Date,
  ) => SingleValidationError = defaultErrorFn.after,
) {
  return (value: Date) => (value < date ? errorReturnValueFn(value, date) : undefined)
}

export function before(
  date: Date,
  errorReturnValueFn: (
    invalidValue: Date,
    beforeDate: Date,
  ) => SingleValidationError = defaultErrorFn.before,
) {
  return (value: Date) => (value > date ? errorReturnValueFn(value, date) : undefined)
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * all validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export type DateValidations = DeepWriteable<typeof dateValidations_>
const dateValidations_ = [
  ['min', after],
  ['max', before],
  [
    'customValidation',
    (
        customValidator: (value: Date, ...otherArgs: unknown[]) => string | undefined,
        ...otherArgs: unknown[]
      ) =>
      (value: Date) =>
        customValidator(value, ...otherArgs),
  ],
] as const
export const dateValidations = dateValidations_ as DateValidations

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vDate
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export type VDate<
  Output extends Date = Date,
  Input = unknown,
  Validations extends ValidationArray<Date> = DateValidations,
> = SafeParsableObject<Output, 'Date', Input> & {
  // default validations
  [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
    ? Validations[I] extends ValidationItem<any>
      ? Validations[I][0]
      : never
    : never]: (...args: Parameters<Validations[I][1]>) => VDate<Output, Input, Validations>
}

type DateOptions = {
  parser: SafeParseFn<unknown, Date>
  parseDateError: (invalidValue: unknown) => SingleValidationError
}

export const vDate = (options: Partial<DateOptions> = {}) =>
  createBaseValidationBuilder(
    options.parser
      ? options.parser
      : parseDate(options.parseDateError ? options.parseDateError : defaultErrorFn.parseDate),

    dateValidations,
    'Date',
  ) as unknown as VDate

export const vDateInstance = vDate()
