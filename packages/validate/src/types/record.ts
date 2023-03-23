/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResultError, isError } from 'toolbelt'

import type {
  SafeParseFn,
  SafeParsableObject,
  SingleValidationError,
  ValidationErrors,
  // ValidationItem,
  MinimumSafeParsableObject,
  VInfer,
  ParseFn,
} from './base'
import defaultErrorFn from './defaultErrors'
import { createBaseValidationBuilder } from './init'
import { vStringInstance } from './string'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

interface MinimumSafeParsableKey extends MinimumSafeParsableObject {
  parse: ParseFn<unknown, string>
  safeParse: SafeParseFn<unknown, string>
}

type KInfer<T extends MinimumSafeParsableKey> = ReturnType<T['safeParse']> extends ResultError<
  ValidationErrors,
  infer R extends string
>
  ? R
  : never

type RecordDef = [key: MinimumSafeParsableKey, value: MinimumSafeParsableObject]
type RecordDefToRecordType<
  T extends RecordDef,
  Key extends string = KInfer<T[0]>,
> = string extends Key ? Record<Key, VInfer<T[1]>> : Partial<Record<Key, VInfer<T[1]>>>

type RecordOptions<T extends RecordDef> = {
  parser?: SafeParseFn<unknown, RecordDefToRecordType<T>>
  breakOnFirstError: boolean
  notARecord: typeof defaultErrorFn.notARecord
}

export function parseRecord<T extends RecordDef>(
  recordDef: T,
  options: RecordOptions<any>,
): (value: unknown) => ResultError<ValidationErrors, RecordDefToRecordType<T>> {
  const [keyParser, valueParser] = recordDef
  return (value: unknown): ResultError<ValidationErrors, RecordDefToRecordType<T>> => {
    const errors = [] as SingleValidationError[]
    if (typeof value === 'object' && value !== null) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, propValue] of Object.entries(value)) {
        const keyResult = keyParser.safeParse(key)
        if (isError(keyResult)) {
          if (options.breakOnFirstError) return keyResult
          errors.push(...keyResult[0].errors)
        }
        const valueResult = valueParser.safeParse(propValue)
        if (isError(valueResult)) {
          if (options.breakOnFirstError) return valueResult
          errors.push(...valueResult[0].errors)
        }
      }
      if (errors.length === 0) return [undefined, value as RecordDefToRecordType<T>]
      return [
        {
          input: value,
          errors,
        },
      ]
    }
    return [{ input: value, errors: [options.notARecord(value)] }, undefined]
  }
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * validators
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
// export function minimumMapLength<T extends Map<unknown, unknown>>(
//   length: number,
//   errorReturnValueFn: (
//     invalidValue: T,
//     minLength: number,
//   ) => SingleValidationError = defaultErrorFn.minimumMapLength,
// ) {
//   return (value: T) => (value.size < length ? errorReturnValueFn(value, length) : undefined)
// }

// export function maximumMapLength<T extends Map<unknown, unknown>>(
//   length: number,
//   errorReturnValueFn: (
//     invalidValue: T,
//     maxLength: number,
//   ) => SingleValidationError = defaultErrorFn.maximumMapLength,
// ) {
//   return (value: T) => (value.size > length ? errorReturnValueFn(value, length) : undefined)
// }

// export function requiredMapLength<T extends Map<unknown, unknown>>(
//   length: number,
//   errorReturnValueFn: (
//     invalidValue: T,
//     requiredLength: number,
//   ) => SingleValidationError = defaultErrorFn.requiredMapLength,
// ) {
//   return (value: T) => (value.size !== length ? errorReturnValueFn(value, length) : undefined)
// }

// export function nonEmpty<T extends Map<unknown, unknown>>(
//   errorReturnValueFn: (invalidValue: T) => SingleValidationError = defaultErrorFn.mapNonEmpty,
// ) {
//   return (value: T) => (value.size === 0 ? errorReturnValueFn(value) : undefined)
// }

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * all validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
// type RecordValidations<T extends Map<unknown, unknown>> = [
//   // ['min', typeof minimumMapLength<T>],
//   // ['max', typeof maximumMapLength<T>],
//   // ['length', typeof requiredMapLength<T>],
//   // ['nonempty', typeof nonEmpty<T>],
//   [
//     'customValidation',
//     (
//       customValidator: (value: T, ...otherArgs: unknown[]) => SingleValidationError | undefined,
//       ...otherArgs: unknown[]
//     ) => (value: T) => SingleValidationError | undefined,
//   ],
// ]

const recordValidations = [
  // ['min', minimumMapLength],
  // ['max', maximumMapLength],
  // ['length', requiredMapLength],
  // ['nonempty', nonEmpty],
  [
    'customValidation',
    (customValidator, ...otherArgs) =>
      (value) =>
        customValidator(value, ...otherArgs),
  ],
] as const

// export const mapValidations = instanceOfValidations_ as InstanceOfValidations

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vMap
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export interface VRecord<
  T extends RecordDef,
  Output extends RecordDefToRecordType<T> = RecordDefToRecordType<T>,
  Input = unknown,
  // Validations extends MapValidations<Output> = MapValidations<Output>,
> extends SafeParsableObject<Output, `Record<${T[0]['type']},${T[1]['type']}>`, Input> {
  customValidator(
    customValidator: (value: T, ...otherArgs: unknown[]) => SingleValidationError | undefined,
    ...otherArgs: unknown[]
  ): this
  readonly keyParser: T[0]
  readonly valueParser: T[1]
}
export function vRecord<P extends MinimumSafeParsableObject>(
  recordParser: P,
): VRecord<[MinimumSafeParsableKey, P]>
export function vRecord<
  K extends MinimumSafeParsableKey,
  P extends MinimumSafeParsableObject,
  T extends RecordDef = [K, P],
>(keyParser: K, recordParser: P, options?: Partial<RecordOptions<T>>): VRecord<T>
export function vRecord(
  recordOrKeyParser: MinimumSafeParsableKey | MinimumSafeParsableObject,
  recordParser?: MinimumSafeParsableObject,
  options: Partial<RecordOptions<any>> = {},
): any {
  const kParser: MinimumSafeParsableKey =
    recordParser === undefined
      ? (vStringInstance as MinimumSafeParsableKey)
      : (recordOrKeyParser as MinimumSafeParsableKey)
  const rParser: MinimumSafeParsableObject =
    recordParser === undefined ? recordOrKeyParser : recordParser
  const fOptions: RecordOptions<any> = {
    breakOnFirstError: true,
    notARecord: defaultErrorFn.notARecord,
    ...options,
  }
  const vRec = createBaseValidationBuilder(
    fOptions.parser ? fOptions.parser : parseRecord([kParser, rParser], fOptions),
    recordValidations as any,
    `Record<${kParser.type},${rParser.type}>`,
  )
  return Object.defineProperties(vRec, {
    keyParser: { value: kParser },
    valueParser: { value: rParser },
  })
}
