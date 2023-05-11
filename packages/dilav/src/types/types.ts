/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DeepWriteable,
  Identity,
  OmitTuple,
  PickTuple,
  RMerge,
  ResultError,
  TupleToIntersection,
} from '../toolbelt'

import { DefaultErrorFn } from './errorFns'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * Validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export type SingleValidationError = string
export type ValidationErrors = {
  input: unknown
  errors: SingleValidationError[]
}
export type ValidationFn<T, S extends unknown[] = []> = (
  value: T,
  ...otherArgs: S
) => SingleValidationError | undefined

export type AsyncValidationFn<T, S extends unknown[] = []> = (
  value: T,
  ...otherArgs: S
) => Promise<SingleValidationError | undefined>

export type ValidationItem<T> = [
  propName: string,
  validationFn: (...args: any[]) => ValidationFn<T>,
]
export type ValidationArray<T> = ValidationItem<T>[]

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * Constants
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export const stratifiedSchemaProp = Symbol('stratifiedSchemaProp')
// type StratifiedParserProp = typeof stratifiedParserProp
const internalDeepPartial = Symbol('internalDeepPartial')
// type InternalDeepPartial = typeof internalDeepPartial
export const parserObject = Symbol('parser')
// type ParserObjectSymbol = typeof parserObject

export const defaultErrorFnSym = Symbol('defaultErrorFnSym')
// export type DefaultErrorFnSym = typeof defaultErrorFnSym

export const baseTypes = [
  'infinite array',
  'finite array',
  'bigint',
  'boolean',
  'date',
  'enum',
  'instanceof',
  'intersection',
  'literal',
  'map',
  'set',
  'string',
  'symbol',
  'union',
  'discriminated union',
  'literal union',
  'optional',
  'nullable',
  'nullish',
  'function',
  'object',
  'number',
  'promise',
  'record',
  'lazy',
  'preprocess',
  'postprocess',
  'custom',
] as const

export const groupBaseTypes = [
  'enum',
  'intersection',
  'union',
  'discriminated union',
  'literal union',
  'optional',
  'nullable',
  'nullish',
  'object',
]

export type BaseTypes = (typeof baseTypes)[number]

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * Basics
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export type ParseFn<Input, Output> = (input: Input) => Output
export type SafeParseFn<Input, Output> = (input: Input) => ResultError<ValidationErrors, Output>
type AsyncParseFn<Input, Output> = (input: Input) => Promise<Output>
type AsyncSafeParseFn<Input, Output> = (
  input: Input,
) => Promise<ResultError<ValidationErrors, Output>>

type ParserObject<
  Output = any,
  Type extends string = string,
  BaseType extends BaseTypes = BaseTypes,
  Input = any,
  Definition extends object = never,
> = [Definition] extends [never]
  ? {
      parserFn: SafeParseFn<Input, Output>
      readonly validators:
        | ((value: any, ...otherArgs: any) => SingleValidationError | undefined)[]
        | any
      readonly asyncValidators:
        | ((value: any, ...otherArgs: any) => Promise<SingleValidationError | undefined>)[]
        | any
      readonly type: Type
      readonly baseType: BaseType
      readonly definition?: object
    }
  : {
      parserFn: SafeParseFn<Input, Output>
      readonly validators:
        | ((value: any, ...otherArgs: any) => SingleValidationError | undefined)[]
        | any
      readonly asyncValidators:
        | ((value: any, ...otherArgs: any) => Promise<SingleValidationError | undefined>)[]
        | any
      readonly type: Type
      readonly baseType: BaseType
      readonly definition: Definition
    }

export type VInfer<T extends MinimumSchema> = ReturnType<T['parse']>

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * Minimums
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export interface MinimumSchema {
  readonly [parserObject]: ParserObject
  // readonly definition?: object
  readonly type: string
  readonly baseType: BaseTypes
  parse: ParseFn<any, any>
  safeParse: SafeParseFn<any, any>
}

export interface MinimumInfiniteArraySchema extends MinimumSchema {
  readonly definition: {
    readonly [stratifiedSchemaProp]: StratifiedSchemas
    readonly itemSchema: MinimumSchema
    readonly transformed: boolean
  }
  readonly baseType: 'infinite array'
}

export interface MinimumArraySchema extends MinimumSchema {
  readonly definition: {
    readonly [stratifiedSchemaProp]: StratifiedSchemas
    readonly itemSchemas?: ValidArrayItemsW
    readonly itemSchema?: MinimumSchema
    readonly transformed: boolean
  }
  readonly baseType: 'infinite array' | 'finite array'
  readonly spread: MinimumArrayRestSchema
  partial(): MinimumArraySchema
  deepPartial(...keysToDeepPartial: any[]): MinimumArraySchema
  required(...keysToRequire: any[]): MinimumArraySchema
  // deepRequired(...keysToRequire: any[]): MinimumArraySchema
}

export interface MinimumObjectSchema extends MinimumSchema {
  readonly definition: MinimumObjectDefinition
  readonly baseType: 'object'
  // partial(): MinimumObjectSchema
  // deepPartial(...keysToDeepPartial: any[]): MinimumObjectSchema
  // required(...keysToRequire: any[]): MinimumObjectSchema
  // deepRequired(...keysToRequire: any[]): MinimumObjectSchema
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * SPO
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export interface BaseSchema<
  Output,
  Type extends string,
  BaseType extends BaseTypes,
  Input = unknown,
  Def extends object = never,
> extends MinimumSchema {
  readonly [parserObject]: ParserObject<Output, Type, BaseType, Input, Def>
  readonly definition?: Def
  readonly type: Type
  readonly baseType: BaseType
  parse: ParseFn<Input, Output>
  safeParse: SafeParseFn<Input, Output>
  parseAsync: AsyncParseFn<Input, Output>
  safeParseAsync: AsyncSafeParseFn<Input, Output>

  optional(): VOptional<this>
  nullable(): VNullable<this>
  nullish(): VNullish<this>
  or<const S extends readonly [MinimumSchema, ...MinimumSchema[]]>(
    ...schemas: S
  ): [this, ...S] extends [MinimumSchema, MinimumSchema, ...MinimumSchema[]]
    ? VUnion<[this, ...S]>
    : never
  and<const S extends readonly [MinimumSchema, ...MinimumSchema[]]>(
    ...schemas: S
  ): [this, ...S] extends [MinimumSchema, MinimumSchema, ...MinimumSchema[]]
    ? VIntersectionT<[this, ...S]>
    : never
  array(): VArrayInfinite<this>
  default<S extends Output>(defaultValue: S): VDefault<this>
  catch<S extends Output>(catchValue: S): VCatch<this>
  preprocess<S extends (value: unknown) => unknown | Output>(preprocessFn: S): VPreprocess<this>
  postprocess<
    S extends (value: ReturnType<this['safeParse']>) => ResultError<ValidationErrors, any>,
  >(
    postprocessFn: S,
  ): VPostProcess<this, S>
  transform<S extends (value: Output) => unknown>(
    transformFn: S,
  ): VPostProcess<
    this,
    (value: ReturnType<this['safeParse']>) => ResultError<undefined, ReturnType<S>>
  >
  pipe<const S extends readonly [MinimumSchema, ...MinimumSchema[]]>(
    ...schemas: S
  ): S extends readonly [...any, infer L extends MinimumSchema]
    ? VPostProcess<this, L['safeParse']>
    : never
  promise(): VPromise<this>
  customValidation<S extends unknown[]>(
    customValidator: ValidationFn<Output, S>,
    ...otherArgs: S
  ): this
  customAsyncValidation<S extends unknown[]>(
    customAsyncValidationFn: AsyncValidationFn<Output, S>,
    ...otherArgs: S
  ): this
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * VUnion
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export type UnionType = [MinimumSchema, ...MinimumSchema[]]

export type VUnionOutput<
  T extends UnionType,
  O extends any[] = {
    [I in keyof T]: VInfer<T[I]>
  },
> = O[number]

export interface VUnionLiterals<
  Output,
  Type extends string = string,
  Input = unknown,
  Definition extends object = { readonly literals: Output[] },
  BaseType extends BaseTypes = 'literal union',
> extends BaseSchema<Output, Type, BaseType, Input, Definition> {
  readonly definition: Definition
  extract<const T extends readonly [Output, ...Output[]]>(
    ...valuesToExtract: T
  ): VUnionLiterals<Extract<Output, T[number]>>
  exclude<const T extends readonly [Output, ...Output[]]>(
    ...valuesToExclude: T
  ): VUnionLiterals<Exclude<Output, T[number]>>
}

export interface VUnion<
  T extends UnionType,
  Output = VUnionOutput<T>,
  Type extends string = string,
  Input = unknown,
> extends BaseSchema<
    Output,
    Type,
    'union',
    Input,
    { readonly unionTypes: T; readonly transformed: boolean }
  > {
  readonly definition: { readonly unionTypes: T; readonly transformed: boolean }
}

type baseOptional<Output, Type extends string, Input, T extends MinimumSchema> = Omit<
  BaseSchema<
    Output,
    Type,
    'optional',
    Input,
    { readonly wrappedSchema: T; readonly transformed: boolean }
  >,
  'optional'
>

export interface VOptional<
  T extends MinimumSchema,
  Type extends string = string,
  Input = unknown,
  Output = VInfer<T> | undefined,
> extends baseOptional<Output, Type, Input, T> {
  readonly definition: { readonly wrappedSchema: T; readonly transformed: boolean }
  optional(): this
  optional(...keysToOptional: PropertyKey[]): this
  required(): T
  required(...keysToRequire: PropertyKey[]): T
}

type baseNullable<Output, Type extends string, Input, T extends MinimumSchema> = Omit<
  BaseSchema<
    Output,
    Type,
    'nullable',
    Input,
    { readonly wrappedSchema: T; readonly transformed: boolean }
  >,
  'nullable'
>

export interface VNullable<
  T extends MinimumSchema,
  Output = VInfer<T> | null,
  Type extends string = string,
  Input = unknown,
> extends baseNullable<Output, Type, Input, T> {
  readonly definition: { readonly wrappedSchema: T; readonly transformed: boolean }
  nullable(): this
}

type baseNullish<Output, Type extends string, Input, T extends MinimumSchema> = Omit<
  BaseSchema<
    Output,
    Type,
    'nullish',
    Input,
    { readonly wrappedSchema: T; readonly transformed: boolean }
  >,
  'nullish'
>

export interface VNullish<
  T extends MinimumSchema,
  Output = VInfer<T> | null | undefined,
  Type extends string = string,
  Input = unknown,
> extends baseNullish<Output, Type, Input, T> {
  readonly definition: { readonly wrappedSchema: T; readonly transformed: boolean }
  nullish(): this
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * VArray
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type ApplyPartialMethodToBaseSchema<
  T extends MinimumSchema,
  Type extends 'optional' | 'nullable' | 'required',
> = Type extends keyof T
  ? T[Type] extends ((...args) => infer S extends MinimumSchema)
    ? S
    : T
  : T
type RequiredSchema<T extends MinimumSchema> = ApplyPartialMethodToBaseSchema<T, 'required'>

type OptionalSchema<T extends MinimumSchema> = ApplyPartialMethodToBaseSchema<T, 'optional'>

type ApplyPartialMethodToVAI<
  T extends ValidArrayItem,
  Type extends 'optional' | 'nullable' | 'required',
> = Type extends keyof T
  ? T[Type] extends ((...any) => infer S extends ValidArrayItem)
    ? S
    : T
  : T
type RequiredVAI<T extends ValidArrayItem> = ApplyPartialMethodToVAI<T, 'required'>
type OptionalVAI<T extends ValidArrayItem> = ApplyPartialMethodToVAI<T, 'optional'>

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
type DeepPartial<T extends MinimumSchema, Keys extends PropertyKey = never> = OptionalSchema<
  T extends VObject<infer U extends ObjectDefinition, infer UM extends MinimumSchema, any, any, any>
    ? VObject<DeepPartialObject<U, Keys>, UM>
    : T extends VArrayInfinite<infer V, any, any, any>
    ? VArrayInfinite<UnwrappedDeepPartial<V, Keys>>
    : T extends VArrayFinite<infer W, any, any, any>
    ? VArrayFinite<DeepPartialFiniteArray<W, Keys>>
    : T
>

type UnwrappedDeepPartial<
  T extends MinimumSchema,
  Keys extends PropertyKey = never,
> = T extends VObject<
  infer U extends ObjectDefinition,
  infer UM extends MinimumSchema,
  any,
  any,
  any
>
  ? VObject<DeepPartialObject<U, Keys>, UM>
  : T extends VArrayInfinite<infer V, any, any, any>
  ? VArrayInfinite<UnwrappedDeepPartial<V, Keys>>
  : T extends VArrayFinite<infer W, any, any, any>
  ? VArrayFinite<DeepPartialFiniteArray<W, Keys>>
  : OptionalSchema<T>

type DeepPartialVAI<T extends ValidArrayItem, Keys extends PropertyKey> = T extends MinimumSchema
  ? UnwrappedDeepPartial<T, Keys>
  : T extends MinimumArrayRestSchema
  ? UnwrappedDeepPartial<T['vArray'], Keys> extends MinimumArraySchema
    ? UnwrappedDeepPartial<T['vArray'], Keys>['spread']
    : never
  : never

type DeepPartialFiniteArray<T extends ValidArrayItemsW, Keys extends PropertyKey> = T extends [
  infer H extends ValidArrayItem,
  ...infer R extends ValidArrayItemsW,
]
  ? [DeepPartialVAI<H, Keys>, ...DeepPartialFiniteArray<R, Keys>]
  : []

type DeepPartialObject<
  T extends ObjectDefinition,
  S extends PropertyKey,
  DeepPartialKeys extends keyof T = [S] extends [never] ? keyof T : S,
  RT = {
    [K in keyof T]: K extends DeepPartialKeys ? DeepPartial<T[K], S> : T[K]
  },
> = RT

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * DeepRequired
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type DeepRequired<T extends MinimumSchema, Keys extends PropertyKey = never> = T extends VObject<
  infer U extends ObjectDefinition,
  infer UM extends MinimumSchema,
  any,
  any,
  any
>
  ? VObject<DeepRequiredObject<U, Keys>, UM>
  : T extends VArrayInfinite<infer V, any, any, any>
  ? VArrayInfinite<DeepRequired<V, Keys>>
  : T extends VArrayFinite<infer W, any, any, any>
  ? VArrayFinite<DeepRequiredFiniteArray<W, Keys>>
  : RequiredSchema<T>

type DeepRequiredVAI<T extends ValidArrayItem, Keys extends PropertyKey> = T extends MinimumSchema
  ? DeepRequired<T, Keys>
  : T extends MinimumArrayRestSchema
  ? DeepRequired<T['vArray'], Keys> extends MinimumArraySchema
    ? DeepRequired<T['vArray'], Keys>['spread']
    : never
  : never

type DeepRequiredFiniteArray<T extends ValidArrayItemsW, Keys extends PropertyKey> = T extends [
  infer H extends ValidArrayItem,
  ...infer R extends ValidArrayItemsW,
]
  ? [DeepRequiredVAI<H, Keys>, ...DeepRequiredFiniteArray<R, Keys>]
  : []

type DeepRequiredObject<
  T extends ObjectDefinition,
  S extends PropertyKey,
  // Props extends ObjectDefinition = T['propertySchemas'],
  DeepRequiredKeys extends keyof T = [S] extends [never] ? keyof T : S,
  RT extends ObjectDefinition = {
    [K in keyof T]: K extends DeepRequiredKeys ? DeepRequired<T[K], S> : T[K]
  },
> = RT

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * DeepRequired
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

type IsOptional<T extends MinimumSchema, Then = true, Else = false> = T extends {
  baseType: 'optional'
}
  ? Then
  : Else

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * VArray
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export type StratifiedSchemas = [MinimumSchema[], MinimumSchema | undefined, MinimumSchema[]]

interface ArraySchema extends MinimumArraySchema {
  parseAsync: AsyncParseFn<any, any>
  safeParseAsync: AsyncSafeParseFn<any, any>

  optional(): MinimumSchema
  nullable(): MinimumSchema
  nullish(): MinimumSchema
  or(...schemas: [MinimumSchema, ...MinimumSchema[]]): MinimumSchema
  and(...schemas: [MinimumSchema, ...MinimumSchema[]]): MinimumSchema
  array(): MinimumInfiniteArraySchema
  default(defaultValue: any): MinimumSchema
  catch(catchValue: any): MinimumSchema
  preprocess(preprocessFn: (value: any) => any): MinimumSchema
  postprocess(
    postprocessFn: (
      value: ResultError<ValidationErrors, any>,
    ) => ResultError<ValidationErrors, any>,
  ): MinimumSchema
  transform(transformFn: (value: any) => any): MinimumSchema
  pipe(...schemas: [MinimumSchema, ...MinimumSchema[]]): MinimumSchema
  promise(): MinimumSchema
}

interface BaseArraySchema2<
  Output extends unknown[],
  Type extends string,
  BaseType extends 'infinite array' | 'finite array',
  Input,
  Def extends {
    readonly [stratifiedSchemaProp]: StratifiedSchemas
    readonly itemSchemas?: ValidArrayItemsW
    readonly itemSchema?: MinimumSchema
    readonly transformed: boolean
  },
> extends BaseSchema<Output, Type, BaseType, Input, Def> {
  partial(): MinimumArraySchema
  deepPartial(...keysToDeepPartial: any[]): MinimumArraySchema
  required(...keysToRequire: any[]): MinimumArraySchema
  // deepRequired(...keysToRequire: any[]): MinimumArraySchema

  readonly definition: Def
  readonly spread: BaseArrayRestSchema<this>

  min(length: number, errorReturnValueFn?: DefaultErrorFn['minimumArrayLength'] | undefined): this
  max(length: number, errorReturnValueFn?: DefaultErrorFn['maximumArrayLength'] | undefined): this
  length(
    length: number,
    errorReturnValueFn?: DefaultErrorFn['requiredArrayLength'] | undefined,
  ): this
  nonEmpty(errorReturnValueFn?: DefaultErrorFn['arrayNonEmpty'] | undefined): this
}

type BaseArraySchema<
  Output extends unknown[],
  Type extends string,
  BaseType extends 'infinite array' | 'finite array',
  Input,
  Def extends {
    readonly [stratifiedSchemaProp]: StratifiedSchemas
    readonly itemSchemas?: ValidArrayItemsW
    readonly itemSchema?: MinimumSchema
    readonly transformed: boolean
  },
  Base extends ArraySchema = BaseArraySchema2<Output, Type, BaseType, Input, Def>,
> = Base

export type ValidArrayItem = MinimumSchema | MinimumArrayRestSchema
export type ValidArrayItems = readonly ValidArrayItem[]
export type ValidArrayItemsW = ValidArrayItem[]
export type ValidArrayItemsT<
  T extends ValidArrayItems,
  RT extends ValidArrayItemsW = DeepWriteable<T>,
> = RT

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * spread types
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export interface MinimumArrayRestSchema {
  readonly vArray: MinimumArraySchema
  readonly isSpread: true
  optional(): MinimumArrayRestSchema
  required(): MinimumArrayRestSchema
  deepPartial(...keysToDeepPartial: PropertyKey[]): MinimumArrayRestSchema
  // deepRequired(...keysToDeepRequire: PropertyKey[]): MinimumArrayRestSchema
  readonly stratifiedSchemas: StratifiedSchemas
  readonly type: string
}

export interface BaseArrayRestSchema<T extends MinimumArraySchema> extends MinimumArrayRestSchema {
  vArray: T
  optional(): ReturnType<T['partial']>['spread']
  deepPartial<S extends PropertyKey[]>(
    ...keysToDeepPartial: S
  ): T extends VArrayFinite<infer R, any, any, any>
    ? VArrayFinite<DeepPartialFiniteArray<R, S[number]>>['spread']
    : VArrayInfinite<DeepPartial<T, S[number]>>['spread']
  required(): ReturnType<T['required']>['spread']
  // deepRequired<S extends PropertyKey[]>(
  //   ...keysToDeepRequired: S
  // ): T extends VArrayFinite<infer R, any, any, any>
  //   ? VArrayFinite<DeepRequiredFiniteArray<R, S[number]>>['spread']
  //   : VArrayInfinite<DeepRequired<T, S[number]>>['spread']
  // deepRequired(): ReturnType<T['deepRequired']>['spread']
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * VArrayInfinite
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export interface VArrayInfinite<
  T extends MinimumSchema,
  Output extends any[] = VInfer<T>[],
  Type extends string = string,
  Input = unknown,
> extends BaseArraySchema<
    Output,
    Type,
    'infinite array',
    Input,
    {
      readonly [stratifiedSchemaProp]: StratifiedSchemas
      readonly itemSchema: T
      readonly transformed: boolean
    }
  > {
  partial(): VArrayInfinite<OptionalSchema<T>>
  required(): VArrayInfinite<RequiredSchema<T>>
  // deepPartial(): VArrayInfinite<UnwrappedDeepPartial<T, never>>
  deepPartial<S extends PropertyKey[]>(
    ...keysToDeepPartial: S
  ): VArrayInfinite<UnwrappedDeepPartial<T, S[number]>>
  // deepRequired(): VArrayInfinite<DeepRequired<T, never>>
  // deepRequired<S extends PropertyKey[]>(
  //   ...keysToRequired: S
  // ): VArrayInfinite<DeepRequired<T, S[number]>>
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * VArrayFinite
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

type PartialFiniteArray<T extends ValidArrayItemsW> = T extends [
  infer H extends ValidArrayItem,
  ...infer R extends ValidArrayItemsW,
]
  ? [OptionalVAI<H>, ...PartialFiniteArray<R>]
  : []

type RequiredFiniteArray<T extends ValidArrayItemsW> = T extends [
  infer H extends ValidArrayItem,
  ...infer R extends ValidArrayItemsW,
]
  ? [RequiredVAI<H>, ...RequiredFiniteArray<R>]
  : []

export interface VArrayFinite<
  T extends ValidArrayItemsW,
  Output extends any[] = FiniteArrayBuilder<T>,
  Type extends string = string,
  Input = unknown,
  // Validations extends ValidationArray<any[]> = ArrayValidations,
> extends BaseArraySchema<
    Output,
    Type,
    'finite array',
    Input,
    {
      readonly [stratifiedSchemaProp]: StratifiedSchemas
      readonly itemSchemas: T
      readonly transformed: boolean
    }
  > {
  partial(): VArrayFinite<PartialFiniteArray<T>>
  required(): VArrayFinite<RequiredFiniteArray<T>>
  deepPartial(): VArrayFinite<DeepPartialFiniteArray<T, never>>
  deepPartial<K extends PropertyKey[]>(
    ...keysToPartial: K
  ): VArrayFinite<DeepPartialFiniteArray<T, K[number]>>
  // deepRequired(): VArrayFinite<DeepRequiredFiniteArray<T, never>>
  // deepRequired<K extends PropertyKey[]>(
  //   ...keysToRequired: K
  // ): VArrayFinite<DeepRequiredFiniteArray<T, K[number]>>
  pick<S extends (keyof T & number)[]>(
    ...keys: S
  ): PickTuple<T, S[number]> extends ValidArrayItemsW
    ? VArrayFinite<PickTuple<T, S[number]>>
    : never
  omit<S extends (keyof T & number)[]>(
    ...keys: S
  ): OmitTuple<T, S[number]> extends ValidArrayItemsW
    ? VArrayFinite<OmitTuple<T, S[number]>>
    : never
  extends<R extends ValidArrayItemsW>(...extendedItemSchemas: R): VArrayFinite<[...T, ...R]>
  merge<R extends VArrayFinite<any>>(
    vArray: R,
  ): R extends VArrayFinite<infer S extends ValidArrayItemsW> ? VArrayFinite<[...T, ...S]> : never
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * VArrayFn
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

type vInferSpreadArrayItem<T extends ValidArrayItem> = T extends MinimumArrayRestSchema
  ? VInfer<T['vArray']> extends any[]
    ? VInfer<T['vArray']>
    : never
  : never

type vInferArrayItem<T extends ValidArrayItem> = T extends MinimumArrayRestSchema
  ? VInfer<T['vArray']> extends any[]
    ? VInfer<T['vArray']>
    : never
  : T extends MinimumSchema
  ? VInfer<T>
  : never

type IfA<State extends 'A' | 'B', Then, Else> = State extends 'A' ? Then : Else
type IfOptional<T extends ValidArrayItem, Then, Else> = T extends MinimumSchema
  ? IsOptional<T> extends true
    ? Then
    : Else
  : Else
type IfRest<T extends ValidArrayItem, Then, Else> = T extends MinimumArrayRestSchema
  ? Then
  : T extends MinimumSchema
  ? Else
  : never
type IfOptionalRequired<MustBeOptional extends boolean, Then, Else> = MustBeOptional extends true
  ? Then
  : Else

type FlattenArrays<T extends ValidArrayItemsW> = T extends [
  infer S extends ValidArrayItem,
  ...infer Rest extends ValidArrayItemsW,
]
  ? S extends MinimumArrayRestSchema
    ? S['vArray']['definition']['itemSchemas'] extends ValidArrayItemsW
      ? [...FlattenArrays<S['vArray']['definition']['itemSchemas']>, ...FlattenArrays<Rest>]
      : [S, ...FlattenArrays<Rest>]
    : [S, ...FlattenArrays<Rest>]
  : []

// type T3 = [VString, ReturnType<VArrayFinite<[VString, VNumber]>['spread']>, VBoolean]

// type X = FlattenArrays<T3>

type FiniteArrayBuilder2<
  T extends ValidArrayItemsW,
  A extends any[] = [],
  B extends any[] = [],
  C extends any[] = [],
  State extends 'A' | 'B' = 'A',
  MustBeOptional extends boolean = false,
> = T extends [infer H extends ValidArrayItem, ...infer R extends ValidArrayItemsW]
  ? {
      addToA: FiniteArrayBuilder2<R, [...A, vInferArrayItem<H>]>
      addToAOptional: FiniteArrayBuilder2<
        R,
        [...A, Exclude<vInferArrayItem<H>, undefined>?],
        [],
        [],
        'A',
        true
      >
      addToB: FiniteArrayBuilder2<R, A, vInferSpreadArrayItem<H>, [], 'B'>
      addToC: FiniteArrayBuilder2<R, A, B, [...C, vInferArrayItem<H>], 'B', false>
      invalid: never
    }[IfA<
      State,
      IfRest<
        H,
        'addToB',
        IfOptional<H, 'addToAOptional', IfOptionalRequired<MustBeOptional, 'invalid', 'addToA'>>
      >,
      IfRest<H, 'invalid', IfOptional<H, 'invalid', 'addToC'>>
    >]
  : [...A, ...B, ...C]

type FiniteArrayBuilder<T extends ValidArrayItemsW> = FiniteArrayBuilder2<FlattenArrays<T>>

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * VIntersection
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export interface VIntersection<Output, Type extends string, Input>
  extends BaseSchema<Output, Type, 'intersection', Input, { readonly transformed?: boolean }> {
  readonly definition: { readonly transformed?: boolean }
}

export type IntersectionT = [MinimumSchema, MinimumSchema, ...MinimumSchema[]]
export type IntersectionT2 = readonly [MinimumSchema, MinimumSchema, ...MinimumSchema[]]

export type MSPOArrayToIntersection<T extends IntersectionT> = TupleToIntersection<{
  [K in keyof T]: VInfer<T[K]>
}>

type MinimumVArrayInfinite = MinimumInfiniteArraySchema // VArrayInfinite<any, any, any, any>
type ArrayOfVArrayInfinite = [
  MinimumVArrayInfinite,
  MinimumVArrayInfinite,
  ...MinimumVArrayInfinite[],
]

type IntersectArrayOfObjects<
  T extends ObjectDefinition[],
  // eslint-disable-next-line @typescript-eslint/ban-types
  Current extends { [K: PropertyKey]: [MinimumSchema, ...MinimumSchema[]] } = {},
  R extends ObjectDefinition[] = T extends [any, ...infer S extends ObjectDefinition[]] ? S : never,
  TO = T extends [infer S extends ObjectDefinition, ...any[]]
    ? {
        [K in keyof Current | keyof S]: K extends keyof Current
          ? K extends keyof S
            ? [...Current[K], S[K]]
            : Current[K]
          : K extends keyof S
          ? [S[K]]
          : never
      }
    : never,
  TO2 extends { [K: PropertyKey]: [MinimumSchema, ...MinimumSchema[]] } = TO extends {
    [K: PropertyKey]: [MinimumSchema, ...MinimumSchema[]]
  }
    ? TO
    : never,
> = [TO] extends [never]
  ? {
      [K in keyof Current]: Current[K] extends IntersectionT
        ? VIntersectionT<Current[K]>
        : Current[K][0]
    }
  : IntersectArrayOfObjects<R, TO2>

export type VIntersectionT<
  T extends IntersectionT,
  RT extends MinimumSchema = T extends [
    MinimumObjectSchema,
    MinimumObjectSchema,
    ...MinimumObjectSchema[],
  ]
    ? {
        [I in keyof T]: T[I]['definition']['propertySchemas']
      } extends infer OD extends ObjectDefinition[]
      ? {
          [I in keyof T]: T[I]['definition']['unmatchedPropertySchema']
        } extends infer UP extends IntersectionT
        ? VObject<IntersectArrayOfObjects<OD>, VIntersectionT<UP>>
        : never
      : never
    : T extends ArrayOfVArrayInfinite
    ? {
        [I in keyof T]: T[I]['definition']['itemSchema']
      } extends infer O extends IntersectionT
      ? VArrayInfinite<VIntersectionT<O>>
      : never
    : VIntersection<MSPOArrayToIntersection<T>, string, unknown>,
> = RT

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * VObject
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export type ObjectDefinition = { [key: PropertyKey]: MinimumSchema }

export type MinimumObjectDefinition = {
  propertySchemas: ObjectDefinition
  unmatchedPropertySchema: MinimumSchema
  options: { type: string }
  transformed: boolean
}

export type ObjectDefToObjectType<
  PropSchemas extends ObjectDefinition,
  UnmatchedPropertySchema extends MinimumSchema,
  BaseObj extends object = {
    [K in keyof PropSchemas]: VInfer<PropSchemas[K]>
  },
  RequiredKeysT extends PropertyKey = keyof {
    [K in keyof PropSchemas as PropSchemas[K] extends {
      baseType: 'optional'
    }
      ? never
      : K]: K
  },
  RequiredKeys extends keyof BaseObj = RequiredKeysT extends keyof BaseObj ? RequiredKeysT : never,
  FinalObj extends object = Identity<Partial<BaseObj> & Required<Pick<BaseObj, RequiredKeys>>>,
  TypeForUnmatchedProperties = VInfer<UnmatchedPropertySchema>,
  RT extends object = [TypeForUnmatchedProperties] extends [never]
    ? FinalObj
    : unknown extends TypeForUnmatchedProperties
    ? FinalObj
    : FinalObj & { [P: PropertyKey]: TypeForUnmatchedProperties },
> = RT

// type X3 = Identity<Omit<MinimumSchema, 'baseType'> & { baseType: 'string' }>

// type X2 = ObjectDefToObjectType<X3, VNever>

// type X1 = ObjectDefToObjectType<{
//   propertySchemas: {
//     stringToNumber: VNumber
//   }
//   unmatchedPropertySchema: VNever
//   options: { type: string }
// }>

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * types
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

type MergePropertySchemas<
  T extends [MinimumObjectSchema, MinimumObjectSchema, ...MinimumObjectSchema[]],
> = { [I in keyof T]: T[I]['definition']['propertySchemas'] } extends infer PS extends [
  ObjectDefinition,
  ObjectDefinition,
  ...ObjectDefinition[],
]
  ? RMerge<PS> extends infer RT extends ObjectDefinition
    ? RT
    : never
  : never

type PartialObject<
  T extends ObjectDefinition,
  S extends PropertyKey,
  PartialKeys = [S] extends [never] ? keyof T : S,
  RT extends ObjectDefinition = {
    [K in keyof T]: K extends PartialKeys ? OptionalSchema<T[K]> : T[K]
  },
> = RT

type RequiredObject<
  T extends ObjectDefinition,
  S extends PropertyKey,
  RequiredKeys extends keyof T = [S] extends [never] ? keyof T : S,
  RT extends ObjectDefinition = {
    [K in keyof T]: K extends RequiredKeys ? RequiredSchema<T[K]> : T[K]
  },
> = RT

export interface VObject<
  PropertySchemas extends ObjectDefinition,
  UnmatchedPropertySchema extends MinimumSchema = VNever,
  Options extends { type: string } = { type: string },
  T extends MinimumObjectDefinition = {
    propertySchemas: PropertySchemas
    unmatchedPropertySchema: UnmatchedPropertySchema
    options: Options
    transformed: boolean
  },
  Input = unknown,
  Output extends object = ObjectDefToObjectType<PropertySchemas, UnmatchedPropertySchema>,
> extends BaseSchema<Output, Options['type'], 'object', Input, T> {
  readonly definition: T
  merge<const S extends readonly [MinimumObjectSchema, ...MinimumObjectSchema[]]>(
    ...propertySchemas: S
  ): [this, ...DeepWriteable<S>] extends infer S2 extends [
    MinimumObjectSchema,
    MinimumObjectSchema,
    ...MinimumObjectSchema[],
  ]
    ? S2 extends [...any, infer L extends MinimumObjectSchema]
      ? VObject<MergePropertySchemas<S2>, L['definition']['unmatchedPropertySchema']>
      : never
    : never
  partial<S extends (keyof PropertySchemas)[]>(
    ...keysToPartial: S
  ): VObject<PartialObject<PropertySchemas, S[number]>, UnmatchedPropertySchema>
  required<S extends (keyof PropertySchemas)[]>(
    ...keysToRequire: S
  ): VObject<RequiredObject<PropertySchemas, S[number]>, UnmatchedPropertySchema>
  deepPartial<S extends PropertyKey[]>(
    ...keysToDeepPartial: S
  ): VObject<DeepPartialObject<PropertySchemas, S[number]>, UnmatchedPropertySchema>
  [internalDeepPartial]<S extends (keyof PropertySchemas)[]>(
    ...keysToDeepPartial: S
  ): DeepPartial<this, S[number]>

  // deepRequired<S extends (keyof PropertySchemas)[]>(
  //   ...keysToDeepRequired: S
  // ): DeepRequired<this, S[number]>

  pick<S extends (keyof PropertySchemas)[]>(
    ...keys: S
  ): VObject<Pick<PropertySchemas, S[number]>, UnmatchedPropertySchema>
  omit<S extends (keyof PropertySchemas)[]>(
    ...keys: S
  ): VObject<Omit<PropertySchemas, S[number]>, UnmatchedPropertySchema>
  catchAll<S extends MinimumSchema>(propertySchema: S): VObject<PropertySchemas, S>
  passThrough(): VObject<PropertySchemas, VUnknown>
  strict(): VObject<PropertySchemas, VNever>
  setKey<K extends PropertyKey, S extends MinimumSchema>(
    name: K,
    schema: S,
  ): VObject<RMerge<[PropertySchemas, { [P in K]: S }]>, UnmatchedPropertySchema>
  extends<R extends ObjectDefinition>(
    extendPropertySchemas: R,
  ): VObject<RMerge<[PropertySchemas, R]>, UnmatchedPropertySchema>
  extends<
    R extends ObjectDefinition,
    S extends MinimumSchema = UnmatchedPropertySchema,
    O extends { type: string } = T['options'] | { type: string },
  >(
    extendPropertySchemas: R,
    unmatchedPropertySchema?: S,
    newOptions?: O,
  ): VObject<RMerge<[PropertySchemas, R]>, S>

  // keyof(): keyof T['propertyParsers'][]
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * VPromise
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export interface ValidatedPromise<T> {
  then(
    onfulfilled?: ((value: T) => T | PromiseLike<T>) | undefined | null,
    onrejected?:
      | ((reason: any) => ValidationErrors | PromiseLike<ValidationErrors>)
      | undefined
      | null,
  ): Promise<T | ValidationErrors>
  catch(
    onrejected?:
      | ((reason: any) => ValidationErrors | PromiseLike<ValidationErrors>)
      | undefined
      | null,
  ): Promise<T | ValidationErrors>
  finally(onfinally?: (() => void) | undefined | null): Promise<T>
  readonly [Symbol.toStringTag]: string
}

export interface VPromise<
  T extends MinimumSchema,
  Output = ValidatedPromise<VInfer<T>>,
  Input = unknown,
> extends BaseSchema<
    Output,
    string,
    'promise',
    Input,
    { readonly resultSchema: T; readonly transformed?: boolean }
  > {
  readonly definition: { readonly resultSchema: T; readonly transformed?: boolean }
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * Default
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export interface VPreprocess<T extends MinimumSchema>
  extends BaseSchema<
    VInfer<T>,
    string,
    'preprocess',
    unknown,
    {
      readonly baseSchema: T
      readonly preprocessFn: (value: unknown) => VInfer<T> | unknown
      readonly transformed: true
    }
  > {
  readonly definition: {
    readonly baseSchema: T
    readonly preprocessFn: (value: unknown) => VInfer<T> | unknown
    readonly transformed: true
  }
}

export interface VPostProcess<T extends MinimumSchema, Output>
  extends BaseSchema<
    Output,
    string,
    'postprocess',
    unknown,
    {
      readonly baseSchema: T
      readonly postprocessFn: (
        value: ResultError<ValidationErrors, VInfer<T>>,
      ) => ResultError<ValidationErrors, Output>
      readonly transformed: true
    }
  > {
  readonly definition: {
    readonly baseSchema: T
    readonly postprocessFn: (
      value: ResultError<ValidationErrors, VInfer<T>>,
    ) => ResultError<ValidationErrors, Output>
    readonly transformed: true
  }
}

export type VDefault<T extends MinimumSchema> = VPreprocess<T>

export type VCatch<T extends MinimumSchema> = VPostProcess<T, VInfer<T>>
/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * Literals
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export interface VLiteral<Output, Type extends string = string, Input = unknown>
  extends BaseSchema<
    Output,
    Type,
    'literal',
    Input,
    { readonly literal: Output; readonly transformed?: boolean }
  > {
  readonly definition: { readonly literal: Output; readonly transformed?: boolean }
}

export type VNaN = VLiteral<number, 'NaN'>
export type VNull = VLiteral<null, 'null'>
export type VNullishL = VLiteral<null | undefined, 'null|undefined'>
export type VAny = VLiteral<any, 'any'>
export type VUnknown = VLiteral<unknown, 'unknown'>
export type VNever = VLiteral<never, 'never'>
export type VUndefined = VLiteral<undefined, 'undefined'>
export interface VVoid extends VLiteral<void, 'void'> {
  parse(arg?: unknown): void
  safeParse(input?: unknown): ResultError<ValidationErrors, void>
}
