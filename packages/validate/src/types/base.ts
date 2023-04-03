/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResultError } from 'toolbelt'
import { ValidationErrors, ValidationFn, validate } from './base validations'
import { isOptional } from './shared'
import {
  VNullable,
  VNullableFn,
  VNullish,
  VNullishFn,
  VOptional,
  VOptionalFn,
  VUnion,
  VUnionFn,
} from './union'
import { VArrayFn, VArrayInfinite } from './array'
import { VIntersectionFn, VIntersectionT } from './intersection'
import defaultErrorFn, { DefaultErrorFn } from './errorFns'
import { VDefault, VDefaultFn } from './default'

export type ParseFn<Input, Output> = (input: Input) => Output
export type SafeParseFn<Input, Output> = (input: Input) => ResultError<ValidationErrors, Output>

export const internalDeepPartial = Symbol('internalDeepPartial')
export type InternalDeepPartial = typeof internalDeepPartial

export const parserObject = Symbol('parser')
export type ParserObjectSymbol = typeof parserObject

export const defaultErrorFnSym = Symbol('defaultErrorFnSym')
export type DefaultErrorFnSym = typeof defaultErrorFnSym

export type ParserObject<
  Output = any,
  Type extends string = string,
  BaseType extends SafeParsableObjectTypes = SafeParsableObjectTypes,
  Input = any,
  Definition extends object = never,
> = [Definition] extends [never]
  ? {
      parserFn: SafeParseFn<Input, Output>
      validators: ValidationFn<Output>[] | any
      readonly type: Type
      readonly baseType: BaseType
      readonly definition?: object
    }
  : {
      parserFn: SafeParseFn<Input, Output>
      validators: ValidationFn<Output>[] | any
      readonly type: Type
      readonly baseType: BaseType
      readonly definition: Definition
    }

export type SafeParsableObjectTypes =
  | 'infinite array'
  | 'finite array'
  | 'bigint'
  | 'boolean'
  | 'date'
  | 'enum'
  | 'instanceof'
  | 'intersection'
  | 'literal'
  | 'map'
  | 'set'
  | 'string'
  | 'symbol'
  | 'union'
  | 'discriminated union'
  | 'string union'
  | 'optional'
  | 'nullable'
  | 'nullish'
  | 'function'
  | 'object'
  | 'number'
  | 'promise'
  | 'record'
  | 'default'
export interface MinimumSafeParsableObject {
  [parserObject]: ParserObject
  definition?: object
  parse: ParseFn<any, any>
  safeParse: SafeParseFn<any, any>
  readonly type: string
  readonly baseType: SafeParsableObjectTypes
  // partial?(): MinimumSafeParsableObject
  // deepPartial?(...keysToDeepPartial: (keyof any)[]): MinimumSafeParsableObject
  // optional?(): MinimumSafeParsableObject
  // required?(...keysToRequire: (keyof any)[]): MinimumSafeParsableObject
  // nullable?(): MinimumSafeParsableObject
  // nullish?(): MinimumSafeParsableObject
  // or?(type: MinimumSafeParsableObject): MinimumSafeParsableObject
  // and?(type: MinimumSafeParsableObject): MinimumSafeParsableObject
  // deepRequired?(...keysToRequire: (keyof any)[]): MinimumSafeParsableObject
  [defaultErrorFnSym]: DefaultErrorFn
}

export type VInfer<T extends MinimumSafeParsableObject> = ReturnType<T['parse']>

// export interface BaseObject extends MinimumSafeParsableObject {
// optional(): MinimumSafeParsableObject
// nullable(): MinimumSafeParsableObject
// nullish(): MinimumSafeParsableObject
// // or<T extends MinimumSafeParsableObject>(type: T): VUnion<[this, T]>
// // and<T extends MinimumSafeParsableObject>(type: T): VIntersectionT<[this, T]>
// // array(): VArrayInfinite<this>
// }

// export interface SafeParsableObjectBase<
//   Output,
//   Type extends string,
//   BaseType extends SafeParsableObjectTypes,
//   Input = unknown,
// > extends BaseObject {
//   [parserObject]: ParserObject<Output, Type, BaseType, Input>
//   parse: ParseFn<Input, Output>
//   safeParse: SafeParseFn<Input, Output>
//   // optional(): MinimumSafeParsableObject
//   // nullable(): MinimumSafeParsableObject
//   // nullish(): MinimumSafeParsableObject
//   // or<T extends MinimumSafeParsableObject>(type: T): VUnion<[this, T]>
//   // and<T extends MinimumSafeParsableObject>(type: T): VIntersectionT<[this, T]>
//   // array(): VArrayInfinite<this>
//   readonly type: Type
//   readonly baseType: BaseType
// }

export interface SafeParsableObject<
  Output,
  Type extends string,
  BaseType extends SafeParsableObjectTypes,
  Input = unknown,
> extends MinimumSafeParsableObject {
  [parserObject]: ParserObject<Output, Type, BaseType, Input>
  readonly type: Type
  readonly baseType: BaseType
  parse: ParseFn<Input, Output>
  safeParse: SafeParseFn<Input, Output>
  optional(): VOptional<this>
  nullable(): VNullable<this>
  nullish(): VNullish<this>
  or<S extends MinimumSafeParsableObject>(type: S): VUnion<[this, S]>
  and<S extends MinimumSafeParsableObject>(type: S): VIntersectionT<[this, S]>
  array(): VArrayInfinite<this>
  default(defaultValue: Output): VDefault<Output, this>
}

// SafeParsableArray
// VObject
// VOptional2
// VNullable2
// VNullish2

export function initBase() {
  let vOptional: VOptionalFn
  let vNullable: VNullableFn
  let vNullish: VNullishFn
  let vUnion: VUnionFn
  let vArray: VArrayFn
  let vIntersection: VIntersectionFn
  let vDefault: VDefaultFn

  const baseObject = {
    safeParse(this: MinimumSafeParsableObject, value) {
      const { validators, parserFn } = this[parserObject]
      const validationFn = validate(validators, false)
      const parsedOutput = parserFn(value)
      if (parsedOutput[0] !== undefined || validators === undefined) return parsedOutput
      const validationErrors = validationFn(parsedOutput[1])
      return validationErrors
        ? [{ value, errors: validationErrors }, undefined]
        : [undefined, parsedOutput[1]]
    },
    get type(): string {
      return this[parserObject].type
    },
    get baseType(): string {
      return this[parserObject].baseType
    },
    parse(this: MinimumSafeParsableObject, value) {
      const result = this.safeParse(value)
      if (result[0]) throw result[0]
      return result[1]
    },
    [defaultErrorFnSym]: { ...defaultErrorFn },
    optional(this: MinimumSafeParsableObject): MinimumSafeParsableObject {
      return isOptional(this) ? this : vOptional(this)
    },
    and(this: MinimumSafeParsableObject, safeParsableObject): MinimumSafeParsableObject {
      return vIntersection([this, safeParsableObject])
    },
    or(safeParsableObject): MinimumSafeParsableObject {
      return vUnion([this, safeParsableObject])
    },
    nullable(this: MinimumSafeParsableObject): MinimumSafeParsableObject {
      return this.baseType === 'nullable' ? this : vNullable(this as any)
    },
    nullish(this: MinimumSafeParsableObject): MinimumSafeParsableObject {
      return this.baseType === 'nullish' ? (this as any) : vNullish(this as any)
    },
    array(this: MinimumSafeParsableObject): MinimumSafeParsableObject {
      return vArray(this)
    },
    default(this: any, defaultValue: any): MinimumSafeParsableObject {
      return vDefault(defaultValue, this)
    },
    toString(this: MinimumSafeParsableObject) {
      return this.type
    },
  }

  return {
    setBaseChildren(
      optional: VOptionalFn,
      nullable: VNullableFn,
      union: VUnionFn,
      nullish: VNullishFn,
      array: VArrayFn,
      intersection: VIntersectionFn,
      defaultFn: VDefaultFn,
    ) {
      vOptional = optional
      vNullable = nullable
      vUnion = union
      vNullish = nullish
      vArray = array
      vIntersection = intersection
      vDefault = defaultFn
    },
    baseObject: baseObject as unknown as MinimumSafeParsableObject, //  Omit<BaseObject, ParserObjectSymbol>,
  }
}

export function createFinalBaseObject<T extends MinimumSafeParsableObject>(
  baseObject: T,
  parserFn: SafeParseFn<any, any>,
  type: string,
  baseType: string,
  definition?: any,
  freeze = false,
): T {
  const obj =
    definition === undefined
      ? {
          __proto__: baseObject,
          [parserObject]: {
            parserFn,
            validators: [],
            type,
            baseType,
          },
        }
      : ({
          __proto__: baseObject,
          [parserObject]: {
            parserFn,
            validators: [],
            type,
            baseType,
            definition,
          },
          get definition() {
            return this[parserObject].definition
          },
        } as unknown as T)
  return (freeze ? Object.freeze(obj) : obj) as T
}
