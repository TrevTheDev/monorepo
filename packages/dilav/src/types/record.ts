import { isError } from '../toolbelt'
import type { FlattenObjectUnion, ResultError } from '../toolbelt'
import { createFinalBaseObject } from './base'
import {
  SafeParseFn,
  BaseSchema,
  MinimumSchema,
  VInfer,
  ParseFn,
  defaultErrorFnSym,
  SingleValidationError,
  ValidationErrors,
} from './types'

import { baseObject } from './init'
import { vStringInstance } from './string'
import { DefaultErrorFn } from './errorFns'
import { isObjectType } from './shared'

const errorFns: DefaultErrorFn = baseObject[defaultErrorFnSym]

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

interface MinimumSafeParsableKey extends MinimumSchema {
  parse: ParseFn<unknown, string>
  safeParse: SafeParseFn<unknown, string>
}

type KInfer<T extends MinimumSafeParsableKey> = ReturnType<T['safeParse']> extends ResultError<
  ValidationErrors,
  infer R extends string
>
  ? R
  : never

type RecordDef = [key: MinimumSafeParsableKey, value: MinimumSchema]
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
  options: RecordOptions<T>,
): (value: unknown) => ResultError<ValidationErrors, RecordDefToRecordType<T>> {
  type Opts = FlattenObjectUnion<RecordOptions<T>>
  const [keySchema, valueSchema] = recordDef
  return (value: unknown): ResultError<ValidationErrors, RecordDefToRecordType<T>> => {
    const errors = [] as SingleValidationError[]
    if (isObjectType(value)) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, propValue] of Object.entries(value)) {
        const keyResult = keySchema.safeParse(key)
        if (isError(keyResult)) {
          if (options.breakOnFirstError) return keyResult
          errors.push(...keyResult[0].errors)
        }
        const valueResult = valueSchema.safeParse(propValue)
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
      { input: value, errors: [((options as Opts).parseRecord ?? errorFns.parseRecord)(value)] },
      undefined,
    ]
  }
}

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
> extends BaseSchema<
    Output,
    string,
    'record',
    Input,
    { readonly keySchema: T[0]; readonly valueSchema: T[1] }
  > {
  readonly definition: { readonly keySchema: T[0]; readonly valueSchema: T[1] }
}

const baseRecordObject = Object.create(baseObject)

export function vRecord<P extends MinimumSchema>(
  valueSchema: P,
): VRecord<[MinimumSafeParsableKey, P]>
export function vRecord<
  K extends MinimumSafeParsableKey,
  P extends MinimumSchema,
  T extends RecordDef = [K, P],
>(keySchema: K, valueSchema: P, options?: RecordOptions<T>): VRecord<T>
export function vRecord(
  valueOrKeySchema: MinimumSafeParsableKey | MinimumSchema,
  valueSchema?: MinimumSchema,
  options: RecordOptions<RecordDef> = {},
): VRecord<RecordDef> {
  type Opts = FlattenObjectUnion<RecordOptions<RecordDef>>
  const kSchema: MinimumSafeParsableKey =
    valueSchema === undefined
      ? (vStringInstance as MinimumSafeParsableKey)
      : (valueOrKeySchema as MinimumSafeParsableKey)
  const rSchema: MinimumSchema = valueSchema === undefined ? valueOrKeySchema : valueSchema
  const fOptions: RecordOptions<RecordDef> = {
    breakOnFirstError: true,
    ...options,
  }
  return createFinalBaseObject(
    baseRecordObject,
    (options as Opts).parser ?? parseRecord([kSchema, rSchema], fOptions),
    `Record<${kSchema.type},${rSchema.type}>`,
    'record',
    { keySchema: kSchema, valueSchema: rSchema },
  )
}
