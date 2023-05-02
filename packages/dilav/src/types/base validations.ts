/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AsyncValidationFn,
  MinimumSchema,
  SingleValidationError,
  ValidationArray,
  ValidationFn,
  parserObject,
} from './types'

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

export function asyncValidate<T>(
  validationFns: AsyncValidationFn<T>[],
  // breakOnFirstError = false,
) {
  return async (
    value: T,
  ): Promise<undefined | [SingleValidationError, ...SingleValidationError[]]> => {
    const asyncFns = [] as Promise<SingleValidationError | undefined>[]
    // eslint-disable-next-line no-restricted-syntax
    for (const validationFn of validationFns) asyncFns.push(validationFn(value))

    const results = await Promise.all(asyncFns)
    const errors = results.filter((i) => i !== undefined)
    return errors.length === 0
      ? undefined
      : (errors as [SingleValidationError, ...SingleValidationError[]])
  }
}

export function createValidationBuilder<T extends MinimumSchema, S>(
  baseObject: T,
  validations: ValidationArray<S>,
  coerceFn?: (...args: any) => any,
  customFn?: (...args: any) => any,
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
      enumerable: true,
      configurable: false,
      writable: false,
    })
  })
  if (coerceFn !== undefined && customFn !== undefined) {
    Object.defineProperties(newObject, {
      coerce: {
        get() {
          return this.custom({ parser: coerceFn })
        },
        enumerable: true,
        configurable: false,
      },
      custom: {
        value(newOptions = {}) {
          const newVObject = customFn(newOptions)
          newVObject[parserObject].validators.push(...this[parserObject].validators)
          return newVObject
        },
        enumerable: true,
        configurable: false,
        writable: false,
      },
    })
  }

  return newObject as unknown as T
}
