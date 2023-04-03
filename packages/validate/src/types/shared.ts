/* eslint-disable @typescript-eslint/no-explicit-any */
import { Identity, ResultError, isResult } from 'toolbelt'
import { ValidationErrors } from './base validations'
import { MinimumSafeParsableObject } from './base'
import {
  MinimumSafeParsableArray,
  MinimumSafeParsableRestArray,
  VArrayFinite,
  VArrayInfinite,
  ValidArrayItem,
  ValidArrayItems,
} from './array'
import { VOptional } from './union'
import { MinimumObjectDefinition, ObjectDefinition, VObject } from './object'

export function firstError(validationErrors: ValidationErrors) {
  return validationErrors.errors[0]
}

export function firstErrorFromResultError(resultError: ResultError<ValidationErrors, any>) {
  if (isResult(resultError)) throw new Error('not an error!')
  return firstError(resultError[0])
}

export type ApplyPartialMethodToMSPO<
  T extends MinimumSafeParsableObject,
  Type extends 'optional' | 'nullable' | 'required',
> = Type extends keyof T
  ? T[Type] extends ((...args) => infer S extends MinimumSafeParsableObject)
    ? S
    : T
  : T
export type RequiredMSPO<T extends MinimumSafeParsableObject> = Identity<
  ApplyPartialMethodToMSPO<T, 'required'>
>
export type OptionalMSPO<T extends MinimumSafeParsableObject> = Identity<
  ApplyPartialMethodToMSPO<T, 'optional'>
>
export type ApplyPartialMethodToVAI<
  T extends ValidArrayItem,
  Type extends 'optional' | 'nullable' | 'required',
> = Type extends keyof T
  ? T[Type] extends ((...any) => infer S extends ValidArrayItem)
    ? S
    : T
  : T
export type RequiredVAI<T extends ValidArrayItem> = ApplyPartialMethodToVAI<T, 'required'>
export type OptionalVAI<T extends ValidArrayItem> = ApplyPartialMethodToVAI<T, 'optional'>

// export type DeepRequiredMSPO<T extends MinimumSafeParsableObject> = T extends {
//   deepRequired(...args): infer S extends MinimumSafeParsableObject
// }
//   ? S
//   : RequiredMSPO<T>

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * DeepPartial
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export type DeepPartial<
  T extends MinimumSafeParsableObject,
  Keys extends keyof any = never,
> = OptionalMSPO<
  Identity<
    T extends VObject<infer U, any, any>
      ? VObject<DeepPartialObject<U, Keys>>
      : T extends VArrayInfinite<infer V, any, any, any>
      ? VArrayInfinite<UnwrappedDeepPartial<V, Keys>>
      : T extends VArrayFinite<infer W, any, any, any>
      ? VArrayFinite<DeepPartialFiniteArray<W, Keys>>
      : T
  >
>

export type UnwrappedDeepPartial<
  T extends MinimumSafeParsableObject,
  Keys extends keyof any = never,
> = Identity<
  T extends VObject<infer U, any, any>
    ? VObject<DeepPartialObject<U, Keys>>
    : T extends VArrayInfinite<infer V, any, any, any>
    ? VArrayInfinite<UnwrappedDeepPartial<V, Keys>>
    : T extends VArrayFinite<infer W, any, any, any>
    ? VArrayFinite<DeepPartialFiniteArray<W, Keys>>
    : OptionalMSPO<T>
>

type DeepPartialVAI<
  T extends ValidArrayItem,
  Keys extends keyof any,
> = T extends MinimumSafeParsableObject
  ? UnwrappedDeepPartial<T, Keys>
  : T extends MinimumSafeParsableRestArray
  ? UnwrappedDeepPartial<T['vArray'], Keys> extends MinimumSafeParsableArray
    ? UnwrappedDeepPartial<T['vArray'], Keys>['spread']
    : never
  : never

export type DeepPartialFiniteArray<T extends ValidArrayItems, Keys extends keyof any> = T extends [
  infer H extends ValidArrayItem,
  ...infer R extends ValidArrayItems,
]
  ? [DeepPartialVAI<H, Keys>, ...DeepPartialFiniteArray<R, Keys>]
  : []

export interface DeepPartialObject<
  T extends MinimumObjectDefinition,
  S extends keyof T['propertyParsers'],
  Props extends ObjectDefinition = T['propertyParsers'],
  DeepPartialKeys extends keyof Props = [S] extends [never] ? keyof Props : S,
> extends MinimumObjectDefinition {
  propertyParsers: {
    [K in keyof Props]: K extends DeepPartialKeys ? DeepPartial<Props[K], S> : Props[K]
  }
  unmatchedPropertyParser: T['unmatchedPropertyParser']
  options: T['options'] | { type: string }
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * DeepRequired
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export type DeepRequired<
  T extends MinimumSafeParsableObject,
  Keys extends keyof any = never,
> = Identity<
  T extends VObject<infer U, any, any>
    ? VObject<DeepRequiredObject<U, Keys>>
    : T extends VArrayInfinite<infer V, any, any, any>
    ? VArrayInfinite<DeepRequired<V, Keys>>
    : T extends VArrayFinite<infer W, any, any, any>
    ? VArrayFinite<DeepRequiredFiniteArray<W, Keys>>
    : RequiredMSPO<T>
>

type DeepRequiredVAI<
  T extends ValidArrayItem,
  Keys extends keyof any,
> = T extends MinimumSafeParsableObject
  ? DeepRequired<T, Keys>
  : T extends MinimumSafeParsableRestArray
  ? DeepRequired<T['vArray'], Keys> extends MinimumSafeParsableArray
    ? DeepRequired<T['vArray'], Keys>['spread']
    : never
  : never

export type DeepRequiredFiniteArray<T extends ValidArrayItems, Keys extends keyof any> = T extends [
  infer H extends ValidArrayItem,
  ...infer R extends ValidArrayItems,
]
  ? [DeepRequiredVAI<H, Keys>, ...DeepRequiredFiniteArray<R, Keys>]
  : []

export interface DeepRequiredObject<
  T extends MinimumObjectDefinition,
  S extends keyof T['propertyParsers'],
  Props extends ObjectDefinition = T['propertyParsers'],
  DeepRequiredKeys extends keyof Props = [S] extends [never] ? keyof Props : S,
> extends MinimumObjectDefinition {
  propertyParsers: {
    [K in keyof Props]: K extends DeepRequiredKeys ? DeepRequired<Props[K], S> : Props[K]
  }
  unmatchedPropertyParser: T['unmatchedPropertyParser']
  options: T['options'] | { type: string }
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * DeepRequired
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export type IsOptional<T extends MinimumSafeParsableObject, Then = true, Else = false> = T extends {
  baseType: 'optional'
}
  ? Then
  : Else

export function isOptional(
  mspo: MinimumSafeParsableObject,
): mspo is VOptional<MinimumSafeParsableObject> {
  return mspo.baseType === 'optional'
}

export function optional(mspObj: MinimumSafeParsableObject): MinimumSafeParsableObject
export function optional(mspObj: ValidArrayItem): ValidArrayItem
export function optional(mspObj: ValidArrayItem): ValidArrayItem {
  return 'optional' in mspObj ? (mspObj as any).optional() : mspObj
}

// export function required(mspObj: MinimumSafeParsableRestArray): MinimumSafeParsableRestArray
export function required(
  mspObj: MinimumSafeParsableObject,
  keysToRequire?: (keyof any)[],
): MinimumSafeParsableObject
export function required(mspObj: ValidArrayItem, keysToRequire?: (keyof any)[]): ValidArrayItem
export function required(
  mspObj: ValidArrayItem,
  keysToRequire: (keyof any)[] = [],
): ValidArrayItem {
  return 'required' in mspObj ? (mspObj as any).required(...keysToRequire) : mspObj
}

export function deepPartial(
  mspObj: MinimumSafeParsableObject,
  keysToDeepPartial?: (keyof any)[],
): MinimumSafeParsableObject
export function deepPartial(
  mspObj: ValidArrayItem,
  keysToDeepPartial: (keyof any)[] = [],
): ValidArrayItem {
  return optional(
    'deepPartial' in mspObj ? (mspObj as any).deepPartial(...keysToDeepPartial) : mspObj,
  )
}

export function unWrappedDeepPartial(
  mspObj: MinimumSafeParsableObject,
  keysToDeepPartial?: (keyof any)[],
): MinimumSafeParsableObject
export function unWrappedDeepPartial(
  mspObj: ValidArrayItem,
  keysToDeepPartial: (keyof any)[] = [],
): ValidArrayItem {
  return 'deepPartial' in mspObj
    ? (mspObj as any).deepPartial(...keysToDeepPartial)
    : optional(mspObj)
}
