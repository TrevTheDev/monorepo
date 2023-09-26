import type { DeepWriteable, FlattenObjectUnion } from '../toolbelt'
import { createFinalBaseObject } from './base'
import {
  SafeParseFn,
  BaseSchema,
  defaultErrorFnSym,
  SingleValidationError,
  ValidationArray,
  ValidationItem,
  SafeParseOutput,
} from './types'

import { baseObject } from './init'
import { createValidationBuilder } from './base validations'
import { DefaultErrorFn } from './errorFns'

const errorFns: DefaultErrorFn = baseObject[defaultErrorFnSym]

export function parseDate(invalidDateFn?: DefaultErrorFn['parseDate']): SafeParseFn<Date> {
  return (value: unknown): SafeParseOutput<Date> =>
    value instanceof Date && value.toString() !== 'Invalid Date'
      ? [undefined, value as Date]
      : [
          { input: value, errors: [(invalidDateFn ?? errorFns.parseDate)(String(value))] },
          undefined,
        ]
}

export function coerceDate(value: string | number | Date): SafeParseOutput<Date> {
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
type DateValidations = DeepWriteable<typeof dateValidations_> extends ValidationArray<Date>
  ? DeepWriteable<typeof dateValidations_>
  : never

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
    ? Validations[I] extends ValidationItem<Date>
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
      parser: SafeParseFn<Output, Input>
    }
  // eslint-disable-next-line @typescript-eslint/ban-types
  | {} //  Record<string, never>

const baseDateObject = createValidationBuilder(baseObject, dateValidations, coerceDate, vDate)

export function vDate<Input = unknown, Output extends Date = Date>(
  options: DateOptions<Input, Output> = {},
): VDate<Output, Input> {
  type Opts = FlattenObjectUnion<DateOptions<unknown, Output>>
  return createFinalBaseObject<VDate<Output, Input>>(
    baseDateObject as VDate<Output, Input>,
    (options as Opts).parser ?? parseDate((options as Opts).parseDateError),
    'Date',
    'date',
  )
}

export const vDateInstance = vDate()
