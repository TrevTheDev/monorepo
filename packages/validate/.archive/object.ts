/* eslint-disable @typescript-eslint/no-explicit-any */
import { difference } from 'toolbelt'
import type { DeepWriteable, Identity, IsStrictAny, Union, ResultError } from 'toolbelt'
import defaultErrorFn from './shared'
import { createBaseValidationBuilder, vNeverInstance, vUnknownInstance } from './init'
import type { VArrayInfinite } from './array'
import {
  MinimumSafeParsableObject,
  SingleValidationError,
  // ValidationArray,
  ValidationErrors,
  VInfer,
  // ValidationItem,
  SafeParseFn,
  // SafeParsableObjectBase,
  ParseFn,
  internalDeepPartial,
  InternalDeepPartial,
} from './base'

import type { VIntersectionT } from './intersection'
import type { VOptional, VUnion, VNullable, VNullish } from './union'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * types
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export type SingleObjectValidationError = [key: keyof any, errors: SingleValidationError[]]

export const defaultObjectErrors = {
  invalidObjectFn: defaultErrorFn.parseObject,
  invalidObjectPropertiesFn: defaultErrorFn.invalidObjectPropertiesFn,
  missingProperty: defaultErrorFn.missingProperty,
  missingPropertyInDef: defaultErrorFn.missingPropertyInDef,
}

export type ObjectErrorOptions = typeof defaultObjectErrors

export type ObjectDefinition = { [key: keyof any]: MinimumSafeParsableObject }

type ObjectParserFn<T extends object> = (value: unknown) => ResultError<ValidationErrors, T>

type ObjectOptions<T extends object = object> = ObjectErrorOptions & {
  parser?: ObjectParserFn<T>
  type: string
}

export interface MinimumObjectDefinition {
  propertyParsers: ObjectDefinition
  unmatchedPropertyParser: MinimumSafeParsableObject
  options: { type: string }
}

interface FullObjectDefinition extends MinimumObjectDefinition {
  options: ObjectOptions
}

type IsOptional<T extends MinimumSafeParsableObject, Then, Else> = T extends {
  isOptional(): infer V
}
  ? V extends true
    ? Then
    : Else
  : Else

type ObjectDefToObjectType<
  T extends MinimumObjectDefinition,
  T1 extends ObjectDefinition = T['propertyParsers'],
  RT = Identity<
    {
      [K in keyof T1 as IsOptional<T1[K], K, never>]?: VInfer<T1[K]>
    } & {
      [K in keyof T1 as IsOptional<T1[K], never, K>]: VInfer<T1[K]>
    }
  >,
  TypeForUnmatchedProperties = VInfer<T['unmatchedPropertyParser']>,
  T3 = [TypeForUnmatchedProperties] extends [never]
    ? RT
    : IsStrictAny<
        TypeForUnmatchedProperties,
        RT & { [P: keyof any]: unknown },
        RT & { [P: keyof any]: TypeForUnmatchedProperties }
      >,
> = T3

export type ParseObjectErrorMessageFns = Pick<
  ObjectErrorOptions,
  'invalidObjectFn' | 'missingProperty' | 'invalidObjectPropertiesFn'
>

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * types
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export interface MinimumObject extends MinimumSafeParsableObject {
  readonly shape: MinimumObjectDefinition
  safeParse(
    input: unknown,
    parser?: SafeParseFn<unknown, object>,
  ): ResultError<ValidationErrors, object>
}

interface MinimumObjectDefinitionToRequired<
  T extends MinimumObjectDefinition,
  S extends keyof T['propertyParsers'],
  Props extends ObjectDefinition = T['propertyParsers'],
  RequiredKeys extends keyof Props = [S] extends [never] ? keyof Props : S,
> extends MinimumObjectDefinition {
  propertyParsers: {
    [K in keyof Props]: K extends RequiredKeys ? ReturnType<Props[K]['required']> : Props[K]
  }
  unmatchedPropertyParser: T['unmatchedPropertyParser']
  options: T['options'] | { type: string }
}

interface MinimumObjectDefinitionToPartial<
  T extends MinimumObjectDefinition,
  S extends keyof T['propertyParsers'],
  Props extends T['propertyParsers'] = T['propertyParsers'],
  PartialKeys extends keyof Props = [S] extends [never] ? keyof Props : S,
> extends MinimumObjectDefinition {
  propertyParsers: {
    [K in keyof Props]: K extends PartialKeys ? ReturnType<Props[K]['optional']> : Props[K]
  }
  unmatchedPropertyParser: T['unmatchedPropertyParser']
  options: T['options'] | { type: string }
}

type DeepOptional<T extends MinimumSafeParsableObject> = T extends {
  [internalDeepPartial](): MinimumSafeParsableObject
}
  ? ReturnType<T[InternalDeepPartial]>
  : ReturnType<T['optional']>

interface MinimumObjectDefinitionToDeepPartial<
  T extends MinimumObjectDefinition,
  S extends keyof T['propertyParsers'],
  Props extends ObjectDefinition = T['propertyParsers'],
  DeepPartialKeys extends keyof Props = [S] extends [never] ? keyof Props : S,
> extends MinimumObjectDefinition {
  propertyParsers: {
    [K in keyof Props]: K extends DeepPartialKeys ? DeepOptional<Props[K]> : Props[K]
  }
  unmatchedPropertyParser: T['unmatchedPropertyParser']
  options: T['options'] | { type: string }
}

type DeepRequired<T extends MinimumSafeParsableObject> = T extends {
  deepRequired(): MinimumSafeParsableObject
}
  ? ReturnType<T['deepRequired']>
  : ReturnType<T['required']>

interface MinimumObjectDefinitionToDeepRequired<T extends MinimumObjectDefinition>
  extends MinimumObjectDefinition {
  propertyParsers: {
    [K in keyof T['propertyParsers']]: DeepRequired<T['propertyParsers'][K]>
  }
  unmatchedPropertyParser: T['unmatchedPropertyParser']
  options: T['options'] | { type: string }
}

export interface VObject<
  T extends MinimumObjectDefinition,
  Output extends object = ObjectDefToObjectType<T>,
  Input = unknown,
  // Validations extends ValidationArray<object> = ObjectValidations,
> extends MinimumObject {
  // SafeParsableObjectBase
  parse: ParseFn<Input, Output>
  safeParse: SafeParseFn<Input, Output>
  array(): VArrayInfinite<this>
  or<R extends MinimumSafeParsableObject>(type: R): VUnion<[this, R]>
  and<R extends MinimumSafeParsableObject>(type: R): VIntersectionT<[this, R]>
  // default(value: Output): SafeParsableObjectBase<Output, T['options']['type'], Input>
  partial<S extends (keyof T['propertyParsers'])[]>(
    ...keysToPartial: S
  ): VObject<MinimumObjectDefinitionToPartial<T, S[number]>>
  // [internalPartial]<S extends (keyof T['propertyParsers'])[]>(
  //   ...keysToPartial: S
  // ): VOptional<VObject<MinimumObjectDefinitionToPartial<T, S[number]>>>
  deepPartial<S extends (keyof T['propertyParsers'])[]>(
    ...keysToDeepPartial: S
  ): VObject<MinimumObjectDefinitionToDeepPartial<T, S[number]>>
  [internalDeepPartial]<S extends (keyof T['propertyParsers'])[]>(
    ...keysToDeepPartial: S
  ): VOptional<VObject<MinimumObjectDefinitionToDeepPartial<T, S[number]>>>
  required<S extends (keyof T['propertyParsers'])[]>(
    ...keysToRequire: S
  ): VObject<MinimumObjectDefinitionToRequired<T, S[number]>>
  deepRequired(): VObject<MinimumObjectDefinitionToDeepRequired<T>>
  // SafeParsableObject
  optional(): VOptional<this>
  nullable(): VNullable<this>
  nullish(): VNullish<this>
  isOptional(): false

  readonly type: T['options']['type']
  readonly shape: T
  pick<S extends (keyof T['propertyParsers'])[]>(
    ...keys: S
  ): VObject<{
    propertyParsers: Pick<T['propertyParsers'], S[number]>
    unmatchedPropertyParser: T['unmatchedPropertyParser']
    options: T['options'] | { type: string }
  }>
  omit<S extends (keyof T['propertyParsers'])[]>(
    ...keys: S
  ): VObject<{
    propertyParsers: Omit<T['propertyParsers'], S[number]>
    unmatchedPropertyParser: T['unmatchedPropertyParser']
    options: T['options'] | { type: string }
  }>
  catchAll<S extends MinimumSafeParsableObject>(
    propertyParser: S,
  ): VObject<{
    propertyParsers: T['propertyParsers']
    unmatchedPropertyParser: S
    options: T['options'] | { type: string }
  }>
  passThrough(): VObject<{
    propertyParsers: T['propertyParsers']
    unmatchedPropertyParser: typeof vUnknownInstance
    options: T['options'] | { type: string }
  }>
  strict(): VObject<{
    propertyParsers: T['propertyParsers']
    unmatchedPropertyParser: typeof vNeverInstance
    options: T['options'] | { type: string }
  }>
  extends<R extends ObjectDefinition>(
    extendedPropertyParsers: R,
  ): VObject<{
    propertyParsers: Union<T['propertyParsers'], R>
    unmatchedPropertyParser: T['unmatchedPropertyParser']
    options: T['options'] | { type: string }
  }>
  extends<
    R extends ObjectDefinition,
    S extends MinimumSafeParsableObject = T['unmatchedPropertyParser'],
    O extends { type: string } = T['options'] | { type: string },
  >(
    extendedPropertyParsers: R,
    unmatchedPropertyParser?: S,
    newOptions?: O,
  ): VObject<{
    propertyParsers: Union<T['propertyParsers'], R>
    unmatchedPropertyParser: S
    options: { type: string }
  }>
  merge<R extends VObject<any>>(
    vObject: R,
  ): R extends VObject<infer S extends MinimumObjectDefinition>
    ? VObject<{
        propertyParsers: Union<T['propertyParsers'], S['propertyParsers']>
        unmatchedPropertyParser: S['unmatchedPropertyParser']
        options: T['options'] | { type: string }
      }>
    : never

  customValidation<S extends unknown[]>(
    customValidator: (value: Output, ...otherArgs: S) => SingleValidationError | undefined,
    ...otherArgs: S
  ): this
}
/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export function parseObject<T extends MinimumObjectDefinition>(
  objectDefinition: T,
  errorMessageFns: ParseObjectErrorMessageFns = defaultObjectErrors,
): (value: unknown) => ResultError<ValidationErrors, ObjectDefToObjectType<T>> {
  const definedKeys = [
    ...Object.keys(objectDefinition.propertyParsers),
    ...Object.getOwnPropertySymbols(objectDefinition.propertyParsers),
  ]
  const unmatchedParser = objectDefinition.unmatchedPropertyParser
  return function ParseObject(
    value: unknown,
  ): ResultError<ValidationErrors, ObjectDefToObjectType<T>> {
    if (typeof value === 'object' && value !== null) {
      const errors = [] as SingleValidationError[]
      const propertyErrors = [] as SingleObjectValidationError[]

      const { propertyParsers } = objectDefinition

      const allKeysToValidate = [
        ...Object.keys(propertyParsers),
        ...Object.getOwnPropertySymbols(objectDefinition.propertyParsers),
      ]

      allKeysToValidate.forEach((key) => {
        const parser = propertyParsers[key] as MinimumSafeParsableObject
        if (key in value) {
          const result = parser.safeParse(value[key])
          if (result[0] !== undefined) propertyErrors.push([key, result[0].errors])
        } else if (!parser.isOptional())
          propertyErrors.push([key, [errorMessageFns.missingProperty(value, key)]])
      })

      const valueKeys = [...Object.keys(value), ...Object.getOwnPropertySymbols(value)]
      const diff = difference(valueKeys, definedKeys)
      diff.forEach((key) => {
        const result = unmatchedParser.safeParse(value[key])
        if (result[0] !== undefined) propertyErrors.push([key, result[0].errors])
      })

      if (propertyErrors.length !== 0) {
        errors.push(
          errorMessageFns.invalidObjectPropertiesFn(
            value,
            objectDefinition.options.type,
            propertyErrors,
          ),
        )
      }

      return errors.length === 0
        ? [undefined, value as ObjectDefToObjectType<T>]
        : [{ input: value, errors }, undefined]
    }
    return [
      {
        input: value,
        errors: [errorMessageFns.invalidObjectFn(value, objectDefinition.options.type)],
      },
      undefined,
    ]
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
type ObjectValidations = DeepWriteable<typeof objectValidations_>

const objectValidations_ = [
  [
    'customValidation',
    (
        customValidator: (
          value: object,
          ...otherArgs: unknown[]
        ) => SingleValidationError | undefined,
        ...otherArgs: unknown[]
      ) =>
      (value: object) =>
        customValidator(value, ...otherArgs),
  ],
] as const // [propName: string, validationFn: (...args) => (value: string) => string | undefined][]

const objectValidations = objectValidations_ as ObjectValidations

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vObject
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export function vObject<T extends ObjectDefinition>(
  propertyParsers: T,
): VObject<{
  propertyParsers: T
  unmatchedPropertyParser: typeof vNeverInstance
  options: { type: string }
}>
export function vObject<T extends ObjectDefinition, S extends MinimumSafeParsableObject>(
  propertyParsers: T,
  unmatchedPropertyParser: S,
  options?: Partial<ObjectOptions<T>>,
): VObject<{
  propertyParsers: T
  unmatchedPropertyParser: S
  options: { type: string }
}>
export function vObject<
  T extends ObjectDefinition,
  RT = VObject<{
    propertyParsers: T
    unmatchedPropertyParser: typeof vNeverInstance
    options: { type: string }
  }>,
>(
  propertyParsers: T,
  unmatchedPropertyParser: MinimumSafeParsableObject = vNeverInstance,
  options: Partial<ObjectOptions<T>> = {},
): RT {
  const t1 = `{${Object.entries(propertyParsers).map(([key, value]) =>
    value.isOptional() ? `${key}?:${(value.nonOptionalType as any).type}` : `${key}:${value.type}`,
  )}}`
  const t2 =
    unmatchedPropertyParser.type === 'never'
      ? t1
      : `(${t1}&{[K in keyof Any]: ${unmatchedPropertyParser.type}}))`
  const finalOptions: ObjectOptions<T> = {
    ...defaultObjectErrors,
    ...options,
    type: options.type || t2,
  }

  const def: FullObjectDefinition = {
    propertyParsers,
    unmatchedPropertyParser,
    options: finalOptions,
  }

  const parser = finalOptions.parser ? finalOptions.parser : parseObject(def, finalOptions)
  type ReturnT = VObject<{
    propertyParsers: T
    unmatchedPropertyParser: typeof vNeverInstance
    options: { type: string }
  }>
  const builder = createBaseValidationBuilder(
    parser,
    objectValidations,
    finalOptions.type,
  ) as unknown as ReturnT
  Object.defineProperties(builder, {
    shape: {
      value: def,
    },
    pick: {
      value(...keys: (keyof any)[]) {
        const keyStrings = [] as string[]

        const newPropertyParsers = keys.reduce((newPropertyParsersI, key) => {
          if (key in propertyParsers) {
            keyStrings.push(
              `${String(key)}:${(propertyParsers[key] as MinimumSafeParsableObject).type}`,
            )
            return Object.assign(newPropertyParsersI, { [key]: propertyParsers[key] })
          }
          throw new Error(finalOptions.missingPropertyInDef(propertyParsers, key))
        }, {})

        return vObject(newPropertyParsers, unmatchedPropertyParser, options)
      },
    },
    omit: {
      value(...keys: (keyof any)[]) {
        const newPropertyParsers = Object.keys(propertyParsers)
          .filter((key) => !keys.includes(key))
          .reduce(
            (newPropertyParsersI, key) =>
              Object.assign(newPropertyParsersI, { [key]: propertyParsers[key] }),
            {},
          )
        return vObject(newPropertyParsers, unmatchedPropertyParser, options)
      },
    },
    extends: {
      value(
        extendedPropertyParsers: ObjectDefinition,
        newUnmatchedPropertyParser: MinimumSafeParsableObject = unmatchedPropertyParser,
        newOptions: Partial<ObjectOptions<any>> = options,
      ) {
        return vObject(
          { ...propertyParsers, ...extendedPropertyParsers },
          newUnmatchedPropertyParser,
          newOptions,
        )
      },
    },
    merge: {
      value(vObj: VObject<any>) {
        const {
          propertyParsers: extendedPropertyParsers,
          unmatchedPropertyParser: newUnmatchedPropertyParser,
          options: newOptions,
        } = vObj.shape
        return builder.extends(extendedPropertyParsers, newUnmatchedPropertyParser, newOptions)
      },
    },
    partial: {
      value(...keysToPartial) {
        const keys = keysToPartial.length === 0 ? Object.keys(propertyParsers) : keysToPartial
        const newPropertyParsers = Object.entries(propertyParsers).reduce(
          (newPropertyParsersI, entry) => {
            const [key, propertyParser] = entry
            return Object.assign(newPropertyParsersI, {
              [key]: keys.includes(key) ? propertyParser.optional() : propertyParser,
            })
          },
          {},
        )
        return vObject(newPropertyParsers, unmatchedPropertyParser, options)
      },
    },
    deepPartial: {
      value(...keysToDeepPartial) {
        const keys =
          keysToDeepPartial.length === 0 ? Object.keys(propertyParsers) : keysToDeepPartial
        const newPropertyParsers = Object.entries(propertyParsers).reduce(
          (newPropertyParsersI, entry) => {
            const [key, propertyParser] = entry
            return Object.assign(newPropertyParsersI, {
              // eslint-disable-next-line no-nested-ternary
              [key]: keys.includes(key)
                ? internalDeepPartial in propertyParser
                  ? (propertyParser as any)[internalDeepPartial](...keysToDeepPartial)
                  : propertyParser.optional()
                : propertyParser,
            })
          },
          {},
        )
        return vObject(newPropertyParsers, unmatchedPropertyParser, options)
      },
    },
    [internalDeepPartial]: {
      value(...keysToDeepPartial) {
        return builder.deepPartial(...keysToDeepPartial).optional()
      },
    },
    required: {
      value(...keysToRequire) {
        const keys = keysToRequire.length === 0 ? Object.keys(propertyParsers) : keysToRequire
        const newPropertyParsers = Object.entries(propertyParsers).reduce(
          (newPropertyParsersI, entry) => {
            const [key, propertyParser] = entry
            return Object.assign(newPropertyParsersI, {
              [key]: keys.includes(key)
                ? (propertyParser as any).required(...keysToRequire)
                : propertyParser,
            })
          },
          {},
        )
        return vObject(newPropertyParsers, unmatchedPropertyParser, options)
      },
    },
    catchAll: {
      value(propertyParserForUnmatchedProperties: MinimumSafeParsableObject) {
        return vObject(propertyParsers, propertyParserForUnmatchedProperties, options)
      },
    },
    passThrough: {
      value() {
        return builder.catchAll(vUnknownInstance)
      },
    },
    strict: {
      value() {
        return builder.catchAll(vNeverInstance)
      },
    },
  })
  return builder as unknown as RT
}

// export function vLateObject<T extends ObjectDefinition>(propFn: () => T) {
//   return {
//     safeParse(value) {
//       const x = propFn()
//       return vObject(x).safeParse(value)
//     },
//     parse(value) {
//       const x = propFn()
//       return vObject(x).parse(value)
//     },
//   }
// }

export function vLazy<T extends MinimumSafeParsableObject>(propFn: () => T) {
  const parser = (value) => propFn().safeParse(value)
  return createBaseValidationBuilder(parser, [], 'lazy')
}
