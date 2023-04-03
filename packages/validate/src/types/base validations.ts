/* eslint-disable @typescript-eslint/no-explicit-any */
import { MinimumSafeParsableObject, parserObject } from './base'

export type SingleValidationError = string
export type ValidationErrors = {
  input: unknown
  errors: SingleValidationError[]
}
export type ValidationFn<T> = (value: T) => SingleValidationError | undefined

export type ValidationItem<T> = [
  propName: string,
  validationFn: (...args: any[]) => ValidationFn<T>,
]
export type ValidationArray<T> = ValidationItem<T>[]

export function validate<T>(validationFns: ValidationFn<T>[], breakOnFirstError = false) {
  return (value: T) => {
    const results = [] as SingleValidationError[]
    // eslint-disable-next-line no-restricted-syntax
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

export function createValidationBuilder<T extends MinimumSafeParsableObject, S>(
  baseObject: T,
  validations: ValidationArray<S>,
): T {
  const newObject = Object.create(baseObject)
  validations.forEach(([propName, validationFn]) => {
    Object.defineProperty(newObject, propName, {
      value(...args) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const oldObject = this
        return {
          __proto__: oldObject,
          [parserObject]: {
            ...oldObject[parserObject],
            validators: [...oldObject[parserObject].validators, validationFn(...args)],
          },
        }
      },
    })
  })
  return newObject as unknown as T
}
