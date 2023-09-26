import { difference, isError } from '@trevthedev/toolbelt'
import { MinimumSchema, VInfer } from '../schema'
import {
  SafeParseObjectFn,
  SingleObjectValidationError,
  allKeys,
  objectValidationErrorsToValidationErrors,
} from './parse object properties'
import { SafeParseOutput } from './parsers'

export type ParseUnmatchedKeysOptions<T extends MinimumSchema> = {
  unmatchedPropertiesSchema: T
  matchedKeys?: PropertyKey[]
  breakOnFirstError?: boolean
}

export default function parseUnmatchedKeys<
  I extends object,
  T extends MinimumSchema,
  O extends object = I & { [P: PropertyKey]: VInfer<T>['output'] },
>(options: ParseUnmatchedKeysOptions<T>): SafeParseObjectFn<O, I> {
  return function ParseExtraKeysFn(value: I, newObject?: object): SafeParseOutput<O> {
    const { matchedKeys = [], unmatchedPropertiesSchema, breakOnFirstError = false } = options

    const errors = [] as SingleObjectValidationError[]

    const unmatchedKeys = difference(allKeys(value), matchedKeys)

    for (const unmatchedKey of unmatchedKeys) {
      const result = unmatchedPropertiesSchema(value[unmatchedKey])
      if (isError(result)) {
        errors.push([unmatchedKey, result[0].errors])
        if (breakOnFirstError) break
      } else if (newObject !== undefined) {
        Object.defineProperty(newObject, unmatchedKey, {
          value: result[1],
          enumerable: true,
          configurable: false,
          writable: false,
        })
      }
    }

    return errors.length === 0
      ? [undefined, (newObject ?? value) as O]
      : [{ input: value as unknown, errors: objectValidationErrorsToValidationErrors(errors) }]
  }
}
