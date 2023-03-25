/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError, Identity, DeepWriteable } from 'toolbelt'
import type {
  SafeParseFn,
  SingleValidationError,
  ValidationArray,
  ValidationErrors,
  SafeParsableObject,
  ValidationItem,
  CreateBaseValidationBuilderGn,
  MinimumSafeParsableObject,
  VInfer,
} from './base'

export function parseIntersection(types: SafeParseFn<any, any>[], breakOnFirstError) {
  return (value: unknown): ResultError<ValidationErrors, any> => {
    const errors: string[] = []
    // eslint-disable-next-line no-restricted-syntax
    for (const vType of types) {
      const result = vType(value)
      if (result[0] !== undefined) {
        errors.push(...result[0].errors)
        if (breakOnFirstError) return [{ input: value, errors }, undefined]
      }
    }
    return errors.length !== 0 ? [{ input: value, errors }, undefined] : [undefined, value]
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

export type VIntersection<
  Output,
  Type extends string,
  Input,
  Validations extends ValidationArray<Output>,
> = Identity<
  SafeParsableObject<Output, Type, Input> & {
    // default validations
    [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
      ? Validations[I] extends ValidationItem<any>
        ? Validations[I][0]
        : never
      : never]: (
      ...args: Parameters<Validations[I][1]>
    ) => VIntersection<Output, Type, Input, Validations>
  }
>

type IntersectionT = [MinimumSafeParsableObject, ...MinimumSafeParsableObject[]]

type MinimumSafeParsableObjectArrayToIntersection<
  T extends IntersectionT,
  Result = never,
  First extends boolean = true,
> = T extends [infer H extends MinimumSafeParsableObject, ...infer R extends IntersectionT]
  ? First extends true
    ? MinimumSafeParsableObjectArrayToIntersection<R, VInfer<H>, false>
    : MinimumSafeParsableObjectArrayToIntersection<R, Result & VInfer<H>, false>
  : T extends [infer S extends MinimumSafeParsableObject]
  ? Result & VInfer<S>
  : never

export type VIntersectionT<
  T extends [MinimumSafeParsableObject, ...MinimumSafeParsableObject[]],
  Output = MinimumSafeParsableObjectArrayToIntersection<T>,
  Type extends string = string,
  Input = unknown,
  Validations extends ValidationArray<Output> = IntersectionValidations<Output>,
> = VIntersection<Output, Type, Input, Validations>

// export type VIntersection<
//   Output,
//   Type extends string = string,
//   Input = unknown,
//   Validations extends ValidationArray<Output> = IntersectionValidations<Output>,
// > = SafeParsableObject<Output, Type, Input> & {
//   // default validations
//   [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
//     ? Validations[I] extends ValidationItem<any>
//       ? Validations[I][0]
//       : never
//     : never]: (
//     ...args: Parameters<Validations[I][1]>
//   ) => VIntersection<Output, Type, Input, Validations>
// }

type IntersectionOptions<Output> = {
  parser?: (
    types: MinimumSafeParsableObject[],
    value: unknown,
  ) => ResultError<ValidationErrors, Output>
  breakOnFirstError?: boolean
}

export type VIntersectionFn = <
  T extends readonly [MinimumSafeParsableObject, ...MinimumSafeParsableObject[]],
  DWT extends [MinimumSafeParsableObject, ...MinimumSafeParsableObject[]] = DeepWriteable<T>,
>(
  types: T,
  options?: IntersectionOptions<MinimumSafeParsableObjectArrayToIntersection<DWT>>,
) => VIntersectionT<DWT>

export function initIntersectionType(
  createBaseValidationBuilder: CreateBaseValidationBuilderGn,
): VIntersectionFn {
  return function vIntersection(
    types: MinimumSafeParsableObject[],
    options: IntersectionOptions<any> = {},
  ) {
    const typeString = types.map((type) => type.type).join('&')
    const typeParsers = types.map((type) => (value) => type.safeParse(value))
    const finalParser = options.parser
      ? (value) => (options as any).parser(types, value)
      : parseIntersection(
          typeParsers,
          options.breakOnFirstError === undefined ? true : options.breakOnFirstError,
        )
    return createBaseValidationBuilder(finalParser, intersectionValidations, typeString)
  } as VIntersectionFn
}
