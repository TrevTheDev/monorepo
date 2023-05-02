/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FlattenObjectUnion, Identity, ResultError } from 'toolbelt'

import { createFinalBaseObject } from './base'
import {
  BaseSchema,
  SafeParseFn,
  SingleValidationError,
  VUnionStringLiterals,
  ValidationErrors,
  defaultErrorFnSym,
} from './types'

import { baseObject, vUnion } from './init'
import { createValidationBuilder } from './base validations'
import { DefaultErrorFn } from './errorFns'
import { StringLiteralUnionOptions } from './union'

const errorFns = baseObject[defaultErrorFnSym]

type MatchTypes = 'keyOnly' | 'valueOnly' | 'either'

type EnumOptions<T> = (
  | {
      parseEnumError: DefaultErrorFn['parseEnum']
    }
  | {
      parser: SafeParseFn<unknown, T>
    }
) & { matchType?: MatchTypes }

export function parseEnum<T extends object>(
  enumV: T,
  options: FlattenObjectUnion<EnumOptions<T>> = {},
): SafeParseFn<unknown, T> {
  const values = Object.values(enumV)
  const keys = Object.keys(enumV)
  const matchOnKey = (value) => keys.includes(value)
  const matchOnValue = (value) => values.includes(value)
  const matchBoth = (value) => matchOnValue(value) || matchOnValue(value)
  const matchType: MatchTypes = options.matchType ?? 'valueOnly'
  const matchFn =
    // eslint-disable-next-line no-nested-ternary
    matchType === 'keyOnly' ? matchOnKey : matchType === 'valueOnly' ? matchOnValue : matchBoth
  return (value: unknown): ResultError<ValidationErrors, T> =>
    !matchFn(value)
      ? [
          {
            input: value,
            errors: [(options.parseEnumError ?? errorFns.parseEnum)(String(value), enumV)],
          },
          undefined,
        ]
      : [undefined, value as T]
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

export interface VEnum<
  T extends object,
  Output = T[keyof T],
  Input = unknown,
  // Validations extends ValidationArray<Output> = EnumValidations<Output>,
> extends BaseSchema<
    Output,
    string,
    'enum',
    Input,
    { readonly enum: T; readonly transformed?: boolean }
  > {
  readonly definition: { readonly enum: T; readonly transformed?: boolean }
  readonly enum: T
  customValidator(
    customValidator: (value: Output, ...otherArgs: unknown[]) => SingleValidationError | undefined,
    ...otherArgs: unknown[]
  ): this
}

// & {
//   // default validations
//   [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
//     ? Validations[I] extends ValidationItem<any>
//       ? Validations[I][0]
//       : never
//     : never]: (...args: Parameters<Validations[I][1]>) => VEnum<Output, Input, Validations>
// }

type StringEnumOptions<T extends string> = Identity<
  Omit<StringLiteralUnionOptions<T>, 'stringLiteralUnion'>
>

const baseEnumObject = createValidationBuilder(baseObject, enumValidations)

export function vEnum<const T extends readonly [string, ...string[]]>(
  stringEnums: T,
  options?: StringEnumOptions<T[number]>,
): VUnionStringLiterals<T[number]>
export function vEnum<T extends object>(nativeEnum: T, options?: EnumOptions<T[keyof T]>): VEnum<T>
export function vEnum(
  enumDef: object | [string, ...string[]],
  options: EnumOptions<any> | StringEnumOptions<any> = {},
): VEnum<any> | VUnionStringLiterals<string> {
  if (Array.isArray(enumDef))
    return vUnion(enumDef as [string, ...string[]], { ...options, stringLiteralUnion: true })
  const typeString = Object.values(enumDef).join('|')

  return Object.defineProperty(
    createFinalBaseObject(
      baseEnumObject,
      (options as any).parser ?? parseEnum(enumDef, (options as any).parseEnumError),
      typeString,
      'enum',
      { enum: enumDef },
    ) as VEnum<any>,
    'enum',
    { value: enumDef, enumerable: false, writable: false, configurable: false },
  ) as VEnum<any>
}
