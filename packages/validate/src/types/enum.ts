/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError } from 'toolbelt'
import { difference, intersection } from 'toolbelt'

import {
  ParserObject,
  SafeParsableObject,
  SafeParseFn,
  createFinalBaseObject,
  defaultErrorFnSym,
  parserObject,
} from './base'

import { baseObject } from './init'
import { stringArrayToUnionTypeString, wrapStringArrayInSingleQuotes } from './union'
import {
  SingleValidationError,
  ValidationArray,
  ValidationErrors,
  ValidationItem,
  createValidationBuilder,
} from './base validations'
import { DefaultErrorFn } from './errorFns'

const errorFns = baseObject[defaultErrorFnSym]

export function parseEnum<T extends any[]>(
  enums: T,
  invalidEnumFn?: DefaultErrorFn['parseEnum'],
): SafeParseFn<unknown, T[number]> {
  return (value: unknown): ResultError<ValidationErrors, T> =>
    !enums.includes(value)
      ? [
          { input: value, errors: [(invalidEnumFn || errorFns.parseEnum)(String(value), enums)] },
          undefined,
        ]
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
> = SafeParsableObject<Output, string, 'enum', Input> & {
  [parserObject]: ParserObject<Output, string, 'enum', Input, { readonly enumValues: Output[] }>
  readonly definition: { readonly enumValues: Output[] }

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
} & {
  // default validations
  [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
    ? Validations[I] extends ValidationItem<any>
      ? Validations[I][0]
      : never
    : never]: (...args: Parameters<Validations[I][1]>) => VEnum<Output, Input, Validations>
}

type EnumOptions<T> =
  | {
      parseEnumError: DefaultErrorFn['parseEnum']
    }
  | {
      parser: SafeParseFn<unknown, T>
    }
  | Record<string, never>

// type EnumOptions<T> = {
//   parser: SafeParseFn<unknown, T>
//   parseEnumError: (value: unknown, enums: unknown[]) => SingleValidationError
// }

const baseEnumObject = createValidationBuilder(baseObject, enumValidations)

export function vEnum<U extends string, T extends readonly [U, ...U[]]>(
  enumValues: T,
  options?: EnumOptions<T[number]>,
): VEnum<T[number]>
export function vEnum<U extends string, T extends [U, ...U[]]>(
  enumValues: T,
  options: EnumOptions<T[number]> = {},
): VEnum<T[number]> {
  // const parser = parseEnum(enumValues as any, invalidEnumFn)

  const bO = createFinalBaseObject(
    baseEnumObject,
    (options as any).parser || parseEnum(enumValues, (options as any).parseEnumError),
    stringArrayToUnionTypeString(wrapStringArrayInSingleQuotes(enumValues)),
    'enum',
    { enumValues },
  ) as VEnum<T[number]>

  // const bO = createBaseValidationBuilder(
  //   options.parser
  //     ? options.parser
  //     : parseEnum(
  //         enumValues,
  //         options.parseEnumError ? options.parseEnumError : defaultErrorFn.parseEnum,
  //       ),
  //   enumValidations,
  //   stringArrayToUnionTypeString(wrapStringArrayInSingleQuotes(enumValues)),
  // ) as unknown as VEnum<T[number]>
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
    // options: {
    //   get() {
    //     return enumValues
    //   },
    // },
  })
  return bO
}
