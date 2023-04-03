/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ResultError, DeepWriteable } from 'toolbelt'
import { SafeParseFn, SafeParsableObject, defaultErrorFnSym, createFinalBaseObject } from './base'

import { baseObject } from './init'
import {
  SingleValidationError,
  ValidationArray,
  ValidationErrors,
  ValidationItem,
  createValidationBuilder,
} from './base validations'
import { DefaultErrorFn } from './errorFns'

const errorFns = baseObject[defaultErrorFnSym]

export function parseDate(
  invalidDateFn?: (invalidValue: string) => SingleValidationError,
): SafeParseFn<unknown, Date> {
  return (value: unknown): ResultError<ValidationErrors, Date> =>
    !(value instanceof Date)
      ? [
          { input: value, errors: [(invalidDateFn || errorFns.parseDate)(String(value))] },
          undefined,
        ]
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
  ) => SingleValidationError = errorFns.after,
) {
  return (value: Date) => (value < date ? errorReturnValueFn(value, date) : undefined)
}

export function before(
  date: Date,
  errorReturnValueFn: (
    invalidValue: Date,
    beforeDate: Date,
  ) => SingleValidationError = errorFns.before,
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
type DateValidations = DeepWriteable<typeof dateValidations_>
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
const dateValidations = dateValidations_ as DateValidations

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
> = SafeParsableObject<Output, 'Date', 'date', Input> & {
  // default validations
  [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
    ? Validations[I] extends ValidationItem<any>
      ? Validations[I][0]
      : never
    : never]: (...args: Parameters<Validations[I][1]>) => VDate<Output, Input, Validations>
}

type DateOptions =
  | {
      parseDateError: DefaultErrorFn['parseDate']
    }
  | {
      parser: SafeParseFn<unknown, Date>
    }
  | Record<string, never>

const baseDateObject = createValidationBuilder(baseObject, dateValidations) as unknown as VDate

export function vDate(options: DateOptions = {}): VDate {
  return createFinalBaseObject(
    baseDateObject,
    (options as any).parser || parseDate((options as any).parseDateError),
    'Date',
    'date',
  )
}
// =>
//   createBaseValidationBuilder(
//     options.parser
//       ? options.parser
//       : parseDate(options.parseDateError ? options.parseDateError : defaultErrorFn.parseDate),

//     dateValidations,
//     'Date',
//   ) as unknown as VDate

export const vDateInstance = vDate()
