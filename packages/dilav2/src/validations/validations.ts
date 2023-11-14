/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
import defaultErrorFn, { DefaultErrorFn } from '../shared/errorFns'

export type SingleValidationError = string

export type BaseValidationFn = (value: any, ...otherArgs: any) => SingleValidationError | undefined
export interface ValidationFn<T, OtherArgs extends unknown[] = []> extends BaseValidationFn {
  (value: T, ...otherArgs: OtherArgs): SingleValidationError | undefined
}

export type BaseValidator = (...args: any) => BaseValidationFn
export interface Validator<CreateArgs extends unknown[], O, OtherArgs extends unknown[] = []>
  extends BaseValidator {
  (...args: CreateArgs): ValidationFn<O, OtherArgs>
}

export type BaseValidatorLibrary = {
  [P: string]: BaseValidator
}
export interface ValidatorLibrary<O> extends BaseValidatorLibrary {
  [P: string]: Validator<any[], O, any[]>
}

export interface CustomValidations<T> extends ValidatorLibrary<T> {
  custom(
    customValidationFn: (value: T) => SingleValidationError | undefined,
  ): (value: T) => string | undefined
}

export const customValidations = <T>(): CustomValidations<T> => ({
  /**
   * include a custom validation function of type: `(value: T) => SingleValidationError | undefined`
   * that returns either a SingleValidationError if validation fails,
   * or undefined if validation succeeds
   */
  custom(customValidationFn: (value: T) => SingleValidationError | undefined) {
    return (value: T) => customValidationFn(value)
  },
})

// export type ObjectValidations<I extends object> = CustomValidations<I>

// export const objectValidations = customValidations<object>()

// // eslint-disable-next-line @typescript-eslint/ban-types
// export const functionValidations = customValidations<Function>()

export const booleanValidations = {
  /**
   * value === true
   */
  beTrue(beTrueError?: DefaultErrorFn['beTrueError']) {
    return (value: boolean) =>
      !value ? (beTrueError ?? defaultErrorFn.beTrueError)(value) : undefined
  },
  /**
   * value === false
   */
  beFalse(beFalseError?: DefaultErrorFn['beFalseError']) {
    return (value: boolean) =>
      value ? (beFalseError ?? defaultErrorFn.beFalseError)(value) : undefined
  },
}

export const validationsKey = Symbol('validations')
export type ValidationsKey = typeof validationsKey

export type BaseValidations<T extends BaseValidationFn = BaseValidationFn> =
  | T[]
  | {
      [validationsKey]: T[]
    }
export type Validations<O> = BaseValidations<ValidationFn<O>>

export function validate<O>(
  options: {
    validations: Validations<O>
    breakOnFirstError?: boolean
  } & { [P in PropertyKey]: unknown },
): (value: O) => SingleValidationError[] | undefined
export function validate(options: {
  validations: BaseValidations
  breakOnFirstError?: boolean
}): (value: unknown) => SingleValidationError[] | undefined {
  const { validations: validationsOrBuilder, breakOnFirstError = false } = options
  const validations =
    validationsKey in validationsOrBuilder
      ? validationsOrBuilder[validationsKey]
      : validationsOrBuilder
  return (value: unknown) => {
    const results = [] as SingleValidationError[]
    for (const validation of validations) {
      const result = validation(value)
      if (result) {
        results.push(result)
        if (breakOnFirstError) return results
      }
    }
    return results.length === 0 ? undefined : results
  }
}
