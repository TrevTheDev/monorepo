/* eslint-disable @typescript-eslint/no-explicit-any */
import { isError } from 'toolbelt'
import type { ResultError } from 'toolbelt'
import {
  SafeParseFn,
  SafeParsableObject,
  createFinalBaseObject,
  ParserObject,
  parserObject,
  MinimumSafeParsableObject,
} from './base'

import { SingleValidationError, createValidationBuilder } from './base validations'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export function parseDefault<T>(
  defaultValue: T,
  parser: MinimumSafeParsableObject,
): SafeParseFn<unknown, T> {
  return (value: unknown): ResultError<never, T> => {
    const result = parser.safeParse(value)
    if (isError(result)) return [undefined, defaultValue]
    return result as ResultError<never, T>
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

const defaultValidations = [
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

export interface VDefault<Output, T extends MinimumSafeParsableObject>
  extends SafeParsableObject<Output, string, 'default', any> {
  [parserObject]: ParserObject<
    Output,
    string,
    'default',
    unknown,
    { readonly baseParser: T; readonly defaultValue: Output }
  >
  readonly definition: { readonly baseParser: T; readonly defaultValue: Output }
  customValidator(
    customValidator: (value: Output, ...otherArgs: unknown[]) => SingleValidationError | undefined,
    ...otherArgs: unknown[]
  ): this
}

export type VDefaultFn = <T, S extends MinimumSafeParsableObject>(
  defaultValue: T,
  safeParsableObject: S,
) => VDefault<T, S>

export function initDefault(baseObject: MinimumSafeParsableObject): VDefaultFn {
  const baseDefaultObject = createValidationBuilder(baseObject, defaultValidations as any)
  return function vDefault<T, S extends MinimumSafeParsableObject>(
    defaultValue: T,
    safeParsableObject: S,
  ): VDefault<T, S> {
    return createFinalBaseObject(
      baseDefaultObject,
      parseDefault(defaultValue, safeParsableObject),
      `${safeParsableObject.type}`,
      'default',
      { baseParser: safeParsableObject, defaultValue },
    ) as VDefault<T, S>
  }
}
