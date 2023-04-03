/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError, DeepWriteable, TupleToIntersection } from 'toolbelt'
import {
  SafeParsableObject,
  MinimumSafeParsableObject,
  VInfer,
  createFinalBaseObject,
} from './base'
import {
  SingleValidationError,
  ValidationErrors,
  createValidationBuilder,
} from './base validations'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * types
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export interface VIntersection<Output, Type extends string, Input>
  extends SafeParsableObject<Output, Type, 'intersection', Input> {
  customValidation<S extends unknown[]>(
    customValidator: (value: Output, ...otherArgs: S) => SingleValidationError | undefined,
    ...otherArgs: S
  ): this
}

type IntersectionT = [MinimumSafeParsableObject, ...MinimumSafeParsableObject[]]

type MSPOArrayToIntersection<T extends IntersectionT> = TupleToIntersection<{
  [K in keyof T]: VInfer<T[K]>
}>

export type VIntersectionT<
  T extends [MinimumSafeParsableObject, ...MinimumSafeParsableObject[]],
  Output = MSPOArrayToIntersection<T>,
  Type extends string = string,
  Input = unknown,
> = VIntersection<Output, Type, Input>

type IntersectionOptions<T extends IntersectionT> = {
  parser?: ReturnType<typeof parseIntersection<T>>
  breakOnFirstError?: boolean
}

export type VIntersectionFn = <T extends IntersectionT>(
  types: T,
  options?: IntersectionOptions<T>,
) => VIntersectionT<T>

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parser
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export function parseIntersection<
  const T extends IntersectionT,
  RV = MSPOArrayToIntersection<DeepWriteable<T>>,
>(types: T, breakOnFirstError: boolean): (value: unknown) => ResultError<ValidationErrors, RV> {
  return (value: unknown): ResultError<ValidationErrors, RV> => {
    const errors: string[] = []
    // eslint-disable-next-line no-restricted-syntax
    for (const vType of types) {
      const result = vType.safeParse(value)
      if (result[0] !== undefined) {
        errors.push(...result[0].errors)
        if (breakOnFirstError) return [{ input: value, errors }, undefined]
      }
    }
    return errors.length !== 0 ? [{ input: value, errors }, undefined] : [undefined, value as RV]
  }
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * all validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type IntersectionValidations<T> = [
  [
    'customValidation',
    (
      customValidator: (value: T, ...otherArgs: unknown[]) => SingleValidationError | undefined,
      ...otherArgs: unknown[]
    ) => (value: T) => string | undefined,
  ],
]
const intersectionValidations_ = [
  [
    'customValidation',
    <T>(
        customValidator: (value: T, ...otherArgs: unknown[]) => SingleValidationError | undefined,
        ...otherArgs: unknown[]
      ) =>
      (value: T) =>
        customValidator(value, ...otherArgs),
  ],
] as const
const intersectionValidations = intersectionValidations_ as IntersectionValidations<any>

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * VIntersection
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export function initIntersectionType(baseObject: MinimumSafeParsableObject): VIntersectionFn {
  const baseIntersectionObject = createValidationBuilder(baseObject, intersectionValidations)
  return function vIntersection<T extends IntersectionT>(
    types: T,
    options: IntersectionOptions<T> = {},
  ): VIntersectionT<T> {
    const typeString = types.map((type) => type.type).join('&')
    return createFinalBaseObject(
      baseIntersectionObject,
      options.parser || parseIntersection(types, options.breakOnFirstError || true),
      typeString,
      'intersection',
    ) as VIntersectionT<T>
  } as VIntersectionFn
}
