/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
import { ResultError, isResult } from 'toolbelt'
import type { VArrayFn, VArrayInfinite } from './array'
import { VIntersectionFn, VIntersectionT } from './intersection'
import type {
  VNullable,
  VNullableFn,
  VNullish,
  VNullishFn,
  VOptional,
  VOptionalFn,
  VUnion,
  VUnionFn,
} from './union'

// export const internalPartial = Symbol('internalPartial')
// export type InternalPartial = typeof internalPartial
export const internalDeepPartial = Symbol('internalDeepPartial')
export type InternalDeepPartial = typeof internalDeepPartial

export const parser = Symbol('parser')
export type Parser = typeof parser
export const validators = Symbol('validators')
export type Validators = typeof validators

// export const internalPartial = Symbol('internalPartial')
// export type InternalPartial = typeof internalPartial

export type SingleValidationError = string
export type ValidationErrors = {
  input: unknown
  errors: SingleValidationError[]
}
export function firstError(validationErrors: ValidationErrors) {
  return validationErrors.errors[0]
}

export function firstErrorFromResultError(resultError: ResultError<ValidationErrors, any>) {
  if (isResult(resultError)) throw new Error('not an error!')
  return firstError(resultError[0])
}

export type ParseFn<Input, Output> = (input: Input) => Output
export type SafeParseFn<Input, Output> = (input: Input) => ResultError<ValidationErrors, Output>

export interface MinimumSafeParsableObject {
  parse: ParseFn<any, unknown>
  safeParse: SafeParseFn<any, unknown>
  readonly type: string
  optional(): MinimumSafeParsableObject
  partial?(): MinimumSafeParsableObject
  deepPartial?(): MinimumSafeParsableObject
  nullable(): MinimumSafeParsableObject
  required(): MinimumSafeParsableObject
  deepRequired?(): MinimumSafeParsableObject
  isOptional(): boolean
  // isNullable(): boolean
  // isNullish(): boolean
  nonOptionalType?: MinimumSafeParsableObject | undefined
  nonNullableType?: MinimumSafeParsableObject | undefined
  nonNullishType?: MinimumSafeParsableObject | undefined
}

export interface SafeParsableObjectBase<Output, Type extends string, Input = unknown>
  extends MinimumSafeParsableObject {
  parse: ParseFn<Input, Output>
  safeParse: SafeParseFn<Input, Output>
  readonly type: Type
  array(): VArrayInfinite<this>
  or<R extends MinimumSafeParsableObject>(type: R): VUnion<[this, R]>
  and<R extends MinimumSafeParsableObject>(type: R): VIntersectionT<[this, R]>
  default(value: Output): SafeParsableObjectBase<Output, Type, Input>
}

export interface SafeParsableObject<Output, Type extends string, Input = unknown>
  extends SafeParsableObjectBase<Output, Type, Input> {
  optional(): VOptional<this>
  nullable(): VNullable<this>
  nullish(): VNullish<this>
  required(): this
  isOptional(): false
  // isNullable(): false
  // isNullish(): false
}

export type VInfer<T extends MinimumSafeParsableObject> = ReturnType<
  T['safeParse']
> extends ResultError<ValidationErrors, infer R>
  ? R
  : never

export type ValidationFn<T> = (value: T) => SingleValidationError | undefined

export type ValidationItem<T> = [
  propName: string,
  validationFn: (...args: any[]) => ValidationFn<T>,
]
export type ValidationArray<T> = ValidationItem<T>[]

function validate<T>(validationFns: ValidationFn<T>[], breakOnFirstError = false) {
  return (value: T) => {
    const results = [] as SingleValidationError[]
    for (const validationFn of validationFns) {
      const result = validationFn(value)
      if (result) {
        results.push(result)
        if (breakOnFirstError) return results
      }
    }
    return results.length === 0 ? undefined : results
  }
}

function parseAndValidate<Output, Input = unknown>(
  parserFn: SafeParseFn<Input, Output>,
  validations: ValidationFn<Output>[],
) {
  const validationFn = validate(validations, false)
  return (input: Input): ResultError<ValidationErrors, Output> => {
    const parsedOutput = parserFn(input)
    if (parsedOutput[0] !== undefined || validations === undefined) return parsedOutput
    const validationErrors = validationFn(parsedOutput[1])
    return validationErrors
      ? [{ input, errors: validationErrors }, undefined]
      : [undefined, parsedOutput[1]]
  }
}

function createValidationBuilder<T>(baseObject: object, validations: ValidationArray<T>) {
  validations.forEach(([propName, validationFn]) => {
    Object.defineProperty(baseObject, propName, {
      value(...args) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const oldObject = this
        const newObj = {
          __proto__: oldObject,
          [validators]: [...oldObject[validators], validationFn(...args)],
        }
        return newObj
      },
    })
  })
  return baseObject
}

export type CreateBaseValidationBuilderGn = <Output, Input>(
  defaultParser: SafeParseFn<Input, Output>,
  validations: ValidationArray<Output>,
  type: string,
) => MinimumSafeParsableObject

type BaseInitialiser = {
  setBaseChildren(
    optional: VOptionalFn,
    nullable: VNullableFn,
    array: VArrayFn,
    union: VUnionFn,
    intersection: VIntersectionFn,
    nullish: VNullishFn,
  ): void
  createBaseValidationBuilder<Output, Input>(
    defaultParser: SafeParseFn<Input, Output>,
    validations: ValidationArray<Output>,
    type: string,
  ): MinimumSafeParsableObject
}

export function baseInitialiser(): BaseInitialiser {
  let vOptional: VOptionalFn
  let vNullable: VNullableFn
  let vNullish: VNullishFn
  let vArray: VArrayFn
  let vUnion: VUnionFn
  let vIntersection: VIntersectionFn

  const baseBuilder = {
    setBaseChildren(
      optional: VOptionalFn,
      nullable: VNullableFn,
      array: VArrayFn,
      union: VUnionFn,
      intersection: VIntersectionFn,
      nullish: VNullishFn,
    ) {
      vOptional = optional
      vNullable = nullable
      vArray = array
      vUnion = union
      vIntersection = intersection
      vNullish = nullish
    },
    createBaseValidationBuilder<Output, Input>(
      defaultParser: SafeParseFn<Input, Output>,
      validations: ValidationArray<Output>,
      type: string,
    ): MinimumSafeParsableObject {
      interface BaseObject extends MinimumSafeParsableObject {
        and(safeParsableObject: MinimumSafeParsableObject): MinimumSafeParsableObject
        or(safeParsableObject: MinimumSafeParsableObject): MinimumSafeParsableObject
        nullable(): MinimumSafeParsableObject
        nullish(): MinimumSafeParsableObject
        [validators]: []
        [parser](input: unknown, ...args: any[]): any
        parse(input: unknown): any
        array(): MinimumSafeParsableObject
        default(defaultValue: Output): MinimumSafeParsableObject
        isNullable(): boolean
        isNullish(): boolean
        type: string
      }
      const obj = {
        nonOptionalType: undefined,
        nonNullableType: undefined,
        nonNullishType: undefined,
        type,
        safeParse(value) {
          return parseAndValidate(this[parser], this[validators])(value)
        },
        parse(value) {
          const result = this.safeParse(value)
          if (result[0]) throw result[0]
          return result[1]
        },
        optional(): any {
          return (
            this.isOptional()
              ? (this as MinimumSafeParsableObject)
              : vOptional(this as MinimumSafeParsableObject)
          ) as MinimumSafeParsableObject
        },
        and(safeParsableObject: MinimumSafeParsableObject): MinimumSafeParsableObject {
          return vIntersection([this as MinimumSafeParsableObject, safeParsableObject])
        },
        or(safeParsableObject: MinimumSafeParsableObject): MinimumSafeParsableObject {
          return vUnion([this as MinimumSafeParsableObject, safeParsableObject])
        },
        nullable(): MinimumSafeParsableObject {
          return this.isNullable()
            ? (this as MinimumSafeParsableObject)
            : vNullable(this as MinimumSafeParsableObject)
        },
        nullish(): MinimumSafeParsableObject {
          return this.isNullish()
            ? (this as MinimumSafeParsableObject)
            : vNullish(this as MinimumSafeParsableObject)
        },
        required(): MinimumSafeParsableObject {
          if (this.isOptional()) return (this.nonOptionalType as any).required()
          // if (this.isNullable()) return (this.nonNullableType as any).required()
          return this as MinimumSafeParsableObject
        },
        isOptional(): boolean {
          return this.nonOptionalType !== undefined
        },
        isNullable(): boolean {
          return this.nonNullableType !== undefined
        },
        isNullish(): boolean {
          return this.nonNullishType !== undefined
        },
        array(): MinimumSafeParsableObject {
          return vArray(this as MinimumSafeParsableObject)
        },
        toString() {
          return this.type
        },
        default(defaultValue) {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const originalObject = this
          const base = baseBuilder.createBaseValidationBuilder(
            (value) => {
              const result = originalObject.safeParse(value)
              if (result[0] !== undefined) return [undefined, defaultValue]
              return result
            },
            [],
            originalObject.type,
          )
          return base
        },
      } as BaseObject
      const baseObject = createValidationBuilder(obj, validations)
      return {
        __proto__: baseObject,
        [parser]: defaultParser,
        [validators]: [],
      } as unknown as MinimumSafeParsableObject
    },
  } as BaseInitialiser
  return baseBuilder
}
