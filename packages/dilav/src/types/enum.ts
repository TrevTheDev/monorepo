import type { Identity } from '../toolbelt'

import { VUnionLiterals } from './types'

import { vUnion } from './init'
import { LiteralUnionType, VLiteralOptions } from './union'

type MatchTypes = 'key' | 'value' | 'either'

type LiteralEnumOptions<T> = Identity<
  Omit<VLiteralOptions<T>, 'baseType' | 'definitionObject' | 'type'>
>

type EnumOptions<T> = LiteralEnumOptions<T> & { matchType?: MatchTypes }

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vBoolean
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export interface VEnum<
  T extends object,
  MatchType extends MatchTypes,
  Output = { either: T[keyof T] | keyof T; key: keyof T; value: T[keyof T] }[MatchType],
  Input = unknown,
  // Validations extends ValidationArray<Output> = EnumValidations<Output>,
> extends VUnionLiterals<
    Output,
    string,
    Input,
    { readonly literals: Output; readonly enum: T },
    'enum'
  > {
  readonly enum: T
}

// const baseEnumObject = Object.create(baseObject)

export function vEnum<const T extends readonly [PropertyKey, ...PropertyKey[]]>(
  literalEnumArray: T,
  options?: LiteralEnumOptions<T[number]>,
): VEnum<
  {
    [I in keyof T as I extends Exclude<I, keyof unknown[]>
      ? T[I] extends PropertyKey
        ? T[I]
        : never
      : never]: T[I]
  },
  'key'
>
export function vEnum<
  const T extends Record<PropertyKey, unknown>,
  O extends EnumOptions<T[keyof T]>,
>(
  nativeEnum: T,
  options?: O,
): VEnum<T, O extends { matchType: infer M extends MatchTypes } ? M : 'value'>
export function vEnum<T extends object, O extends EnumOptions<T[keyof T]>>(
  nativeEnumOrLiteral: T | Readonly<LiteralUnionType> | readonly [PropertyKey, ...PropertyKey[]],
  options: O | LiteralEnumOptions<unknown> = {},
):
  | VEnum<T, O extends { matchType: infer M extends MatchTypes } ? M : 'value'>
  | VUnionLiterals<unknown> {
  let enumD: object
  let literals: LiteralUnionType
  if (Array.isArray(nativeEnumOrLiteral)) {
    enumD = nativeEnumOrLiteral.reduce(
      (obj, type) =>
        Object.defineProperty(obj, type, {
          value: type,
          enumerable: true,
          configurable: false,
          writable: false,
        }),
      {},
    )
    literals = nativeEnumOrLiteral as LiteralUnionType
  } else {
    enumD = nativeEnumOrLiteral
    literals = [] as unknown as LiteralUnionType
    const mT: MatchTypes = 'matchType' in options ? options.matchType : 'value'
    if (['value', 'either'].includes(mT)) literals.push(...Object.values(nativeEnumOrLiteral))
    if (['key', 'either'].includes(mT)) literals.push(...Object.keys(nativeEnumOrLiteral))
  }
  if (literals.length === 0) throw new Error('no items found to add to enum')

  return Object.defineProperty(
    vUnion.literals(literals, {
      ...options,
      baseType: 'enum',
      definitionObject: { enum: enumD, literals },
    }),
    'enum',
    { value: enumD, enumerable: false, writable: false, configurable: false },
  )
}
