/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResultError, isResult } from 'toolbelt'

import {
  MinimumArrayRestSchema,
  MinimumSchema,
  VOptional,
  ValidArrayItem,
  ValidationErrors,
  parserObject,
} from './types'

function typeOfItem(val: any): string {
  // eslint-disable-next-line no-nested-ternary
  return val === null
    ? 'Null'
    : val === undefined
    ? 'Undefined'
    : Object.prototype.toString.call(val).slice(8, -1)
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isObjectType(val: any): val is {} {
  return typeOfItem(val) === 'Object'
}

export function errorFromResultError(
  resultError: ResultError<ValidationErrors, any>,
): ValidationErrors {
  if (isResult(resultError)) throw new Error('was an result, so no error found!')
  return resultError[0]
}

export function resultFromResultError<T>(resultError: ResultError<ValidationErrors, T>): T {
  if (!isResult(resultError)) throw new Error('was an error, so no result found!')
  return resultError[1]
}

export function firstError(validationErrors: ValidationErrors) {
  return validationErrors.errors[0]
}

export function firstErrorFromResultError(resultError: ResultError<ValidationErrors, any>) {
  return firstError(errorFromResultError(resultError))
}

export function isOptional(mspo: MinimumSchema): mspo is VOptional<MinimumSchema> {
  return mspo.baseType === 'optional'
}

export function isTransformed(schema: MinimumSchema): boolean {
  const def = schema[parserObject].definition
  return def !== undefined && 'transformed' in def && def.transformed === true
}

// function isObjectSchema(mspo: MinimumSchema): mspo is VObject<ObjectDefinition, MinimumSchema> {
//   return mspo.baseType === 'object'
// }

export function isSpread(schema: ValidArrayItem): schema is MinimumArrayRestSchema {
  return 'isSpread' in schema && schema.isSpread === true
}

export function optional(mspObj: MinimumSchema): MinimumSchema
export function optional(mspObj: ValidArrayItem): ValidArrayItem
export function optional(mspObj: ValidArrayItem): ValidArrayItem {
  return 'optional' in mspObj ? (mspObj as any).optional() : mspObj
}

// export function required(mspObj: MinimumSafeParsableRestArray): MinimumSafeParsableRestArray
export function required(mspObj: MinimumSchema, keysToRequire?: PropertyKey[]): MinimumSchema
export function required(mspObj: ValidArrayItem, keysToRequire?: PropertyKey[]): ValidArrayItem
export function required(
  mspObj: ValidArrayItem,
  keysToRequire: PropertyKey[] = [],
): ValidArrayItem {
  return 'required' in mspObj ? (mspObj as any).required(...keysToRequire) : mspObj
}

export function deepPartial(mspObj: MinimumSchema, keysToDeepPartial?: PropertyKey[]): MinimumSchema
export function deepPartial(
  mspObj: ValidArrayItem,
  keysToDeepPartial: PropertyKey[] = [],
): ValidArrayItem {
  return optional(
    'deepPartial' in mspObj ? (mspObj as any).deepPartial(...keysToDeepPartial) : mspObj,
  )
}

export function unWrappedDeepPartial(
  mspObj: MinimumSchema,
  keysToDeepPartial?: PropertyKey[],
): MinimumSchema
export function unWrappedDeepPartial(
  mspObj: ValidArrayItem,
  keysToDeepPartial: PropertyKey[] = [],
): ValidArrayItem {
  return 'deepPartial' in mspObj
    ? (mspObj as any).deepPartial(...keysToDeepPartial)
    : optional(mspObj)
}
