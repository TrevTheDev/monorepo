/* eslint-disable @typescript-eslint/no-explicit-any */
import { isError } from 'toolbelt'
import type { ResultError } from 'toolbelt'
import {
  SafeParseFn,
  SafeParsableObject,
  MinimumSafeParsableObject,
  VInfer,
  ParseFn,
  defaultErrorFnSym,
  createFinalBaseObject,
  parserObject,
  ParserObject,
} from './base'

import { baseObject } from './init'
import { vStringInstance } from './string'
import {
  SingleValidationError,
  ValidationErrors,
  createValidationBuilder,
} from './base validations'
import { DefaultErrorFn } from './errorFns'

const errorFns = baseObject[defaultErrorFnSym]

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

type RecordOptions<T extends RecordDef> = (
  | {
      parser: SafeParseFn<unknown, RecordDefToRecordType<T>>
    }
  | {
      parseRecord: DefaultErrorFn['parseRecord']
    }
  // eslint-disable-next-line @typescript-eslint/ban-types
  | {}
) & {
  breakOnFirstError?: boolean
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
    return [
      { input: value, errors: [((options as any).parseRecord || errorFns.parseRecord)(value)] },
      undefined,
    ]
  }
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * validators
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * all validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

const recordValidations = [
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
> extends SafeParsableObject<Output, string, 'record', Input> {
  [parserObject]: ParserObject<
    Output,
    string,
    'record',
    Input,
    { readonly keyParser: T[0]; readonly valueParser: T[1] }
  >
  readonly definition: { readonly keyParser: T[0]; readonly valueParser: T[1] }
  customValidator(
    customValidator: (value: T, ...otherArgs: unknown[]) => SingleValidationError | undefined,
    ...otherArgs: unknown[]
  ): this
  // readonly keyParser: T[0]
  // readonly valueParser: T[1]
}

const baseRecordObject = createValidationBuilder(baseObject, recordValidations as any)

export function vRecord<P extends MinimumSafeParsableObject>(
  recordParser: P,
): VRecord<[MinimumSafeParsableKey, P]>
export function vRecord<
  K extends MinimumSafeParsableKey,
  P extends MinimumSafeParsableObject,
  T extends RecordDef = [K, P],
>(keyParser: K, recordParser: P, options?: RecordOptions<T>): VRecord<T>
export function vRecord(
  recordOrKeyParser: MinimumSafeParsableKey | MinimumSafeParsableObject,
  recordParser?: MinimumSafeParsableObject,
  options: RecordOptions<any> = {},
): any {
  const kParser: MinimumSafeParsableKey =
    recordParser === undefined
      ? (vStringInstance as MinimumSafeParsableKey)
      : (recordOrKeyParser as MinimumSafeParsableKey)
  const rParser: MinimumSafeParsableObject =
    recordParser === undefined ? recordOrKeyParser : recordParser
  const fOptions: RecordOptions<any> = {
    breakOnFirstError: true,
    ...options,
  }
  return createFinalBaseObject(
    baseRecordObject,
    (options as any).parser || parseRecord([kParser, rParser], fOptions),
    `Record<${kParser.type},${rParser.type}>`,
    'record',
    { keyParser: kParser, valueParser: rParser },
  )
}
