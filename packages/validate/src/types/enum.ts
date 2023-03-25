/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError } from 'toolbelt'
import { difference, intersection } from 'toolbelt'

import type {
  SafeParsableObject,
  SafeParseFn,
  SingleValidationError,
  ValidationArray,
  ValidationErrors,
  ValidationItem,
} from './base'
import defaultErrorFn from './defaultErrors'
import { createBaseValidationBuilder } from './init'
import { stringArrayToUnionTypeString, wrapStringArrayInSingleQuotes } from './union'

export function parseEnum<T extends any[]>(
  enums: T,
  invalidEnumFn: (
    invalidValue: string,
    enumsValue: T,
  ) => SingleValidationError = defaultErrorFn.parseEnum,
): (value: unknown) => ResultError<ValidationErrors, T[number]> {
  return (value: unknown): ResultError<ValidationErrors, T> =>
    !enums.includes(value)
      ? [{ input: value, errors: [invalidEnumFn(String(value), enums)] }, undefined]
      : [undefined, value as T[number]]
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * all validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type EnumValidations<T> = [
  [
    'customValidation',
    (
      customValidator: (value: T, ...otherArgs: unknown[]) => SingleValidationError | undefined,
      ...otherArgs: unknown[]
    ) => (value: T) => SingleValidationError | undefined,
  ],
]
const enumValidations_ = [
  [
    'customValidation',
    (
        customValidator: (value: any, ...otherArgs: unknown[]) => string | undefined,
        ...otherArgs: unknown[]
      ) =>
      (value: boolean) =>
        customValidator(value, ...otherArgs),
  ],
] as const
const enumValidations = enumValidations_ as EnumValidations<any>

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vBoolean
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export type VEnum<
  Output,
  Input = unknown,
  Validations extends ValidationArray<Output> = EnumValidations<Output>,
> = SafeParsableObject<Output, 'boolean', Input> & {
  extract<U extends string, T extends readonly [U, ...U[]]>(
    valuesToExtract: T,
  ): VEnum<T[number] & Output, Input, Validations>
  extract<U extends string, T extends [U, ...U[]]>(
    valuesToExtract: T,
  ): VEnum<T[number] & Output, Input, Validations>
  exclude<U extends string, T extends readonly [U, ...U[]]>(
    valuesToExclude: T,
  ): VEnum<Exclude<Output, T[number]>, Input, Validations>
  exclude<U extends string, T extends [U, ...U[]]>(
    valuesToExclude: T,
  ): VEnum<Exclude<Output, T[number]>, Input, Validations>
  readonly options: Output[]
} & {
  // default validations
  [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
    ? Validations[I] extends ValidationItem<any>
      ? Validations[I][0]
      : never
    : never]: (...args: Parameters<Validations[I][1]>) => VEnum<Output, Input, Validations>
}

type EnumOptions<T> = {
  parser: SafeParseFn<unknown, T>
  parseEnumError: (value: unknown, enums: unknown[]) => SingleValidationError
}

export function vEnum<U extends string, T extends readonly [U, ...U[]]>(
  enumValues: T,
  options?: Partial<EnumOptions<T[number]>>,
): VEnum<T[number]>
export function vEnum<U extends string, T extends [U, ...U[]]>(
  enumValues: T,
  options: Partial<EnumOptions<T[number]>> = {},
): VEnum<T[number]> {
  // const parser = parseEnum(enumValues as any, invalidEnumFn)

  const bO = createBaseValidationBuilder(
    options.parser
      ? options.parser
      : parseEnum(
          enumValues,
          options.parseEnumError ? options.parseEnumError : defaultErrorFn.parseEnum,
        ),
    enumValidations,
    stringArrayToUnionTypeString(wrapStringArrayInSingleQuotes(enumValues)),
  ) as unknown as VEnum<T[number]>
  Object.defineProperties(bO, {
    extract: {
      value(keys: [string, ...string[]]) {
        const newKeys = intersection(enumValues, keys) as unknown as readonly [string, ...string[]]
        return vEnum(newKeys, options)
      },
    },
    exclude: {
      value(keys: [string, ...string[]]) {
        const newKeys = difference(enumValues, keys) as unknown as readonly [string, ...string[]]
        return vEnum(newKeys, options)
      },
    },
    options: {
      get() {
        return enumValues
      },
    },
  })
  return bO
}
