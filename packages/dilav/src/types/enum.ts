/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FlattenObjectUnion, Identity, ResultError } from 'toolbelt'

import { createFinalBaseObject } from './base'
import {
  BaseSchema,
  SafeParseFn,
  VUnionStringLiterals,
  ValidationErrors,
  defaultErrorFnSym,
} from './types'

import { baseObject, vUnion } from './init'
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
}

type StringEnumOptions<T extends string> = Identity<
  Omit<StringLiteralUnionOptions<T>, 'stringLiteralUnion'>
>

const baseEnumObject = Object.create(baseObject)

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
