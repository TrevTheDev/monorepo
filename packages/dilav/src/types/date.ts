/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ResultError, DeepWriteable } from 'toolbelt'
import { createFinalBaseObject } from './base'
import {
  SafeParseFn,
  BaseSchema,
  defaultErrorFnSym,
  SingleValidationError,
  ValidationArray,
  ValidationErrors,
  ValidationItem,
} from './types'

import { baseObject } from './init'
import { createValidationBuilder } from './base validations'
import { DefaultErrorFn } from './errorFns'

const errorFns = baseObject[defaultErrorFnSym]

export function parseDate(
  invalidDateFn?: (invalidValue: string) => SingleValidationError,
): SafeParseFn<unknown, Date> {
  return (value: unknown): ResultError<ValidationErrors, Date> =>
    value instanceof Date && value.toString() !== 'Invalid Date'
      ? [undefined, value as Date]
      : [
          { input: value, errors: [(invalidDateFn ?? errorFns.parseDate)(String(value))] },
          undefined,
        ]
}

export function coerceDate(value: string | number | Date): ResultError<ValidationErrors, Date> {
  return parseDate()(new Date(value))
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
] as const
const dateValidations = dateValidations_ as DateValidations

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vDate
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type DateValidationFuncs<
  Output extends Date,
  Input,
  Validations extends ValidationArray<Date> = DateValidations,
> = {
  [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
    ? Validations[I] extends ValidationItem<any>
      ? Validations[I][0]
      : never
    : never]: (...args: Parameters<Validations[I][1]>) => VDate<Output, Input>
}

export interface VDate<Output extends Date = Date, Input = unknown>
  extends BaseSchema<Output, 'Date', 'date', Input>,
    DateValidationFuncs<Output, Input> {
  readonly coerce: VDate<Output, string | number | Date>
  custom(newOptions: DateOptions): this
}

type DateOptions<Input = unknown, Output extends Date = Date> =
  | {
      parseDateError: DefaultErrorFn['parseDate']
    }
  | {
      parser: SafeParseFn<Input, Output>
    }
  | Record<string, never>

const baseDateObject = createValidationBuilder(
  baseObject,
  dateValidations,
  coerceDate,
  vDate,
) as unknown as any

export function vDate<Input = unknown, Output extends Date = Date>(
  options: DateOptions<Input, Output> = {},
): VDate<Output, Input> {
  return createFinalBaseObject(
    baseDateObject,
    (options as any).parser ?? parseDate((options as any).parseDateError),
    'Date',
    'date',
  ) as unknown as VDate<Output, Input>
}

export const vDateInstance = vDate()
// export const vDateCoerce = vDate({ parser: coerceDate })
