import { isResult } from '@trevthedev/toolbelt'
import { SafeParseOutput, ValidationErrors } from './parsers/parsers'
import { MinimumSchema } from './schema'

export function errorFromResultError(resultError: SafeParseOutput<unknown>): ValidationErrors {
  if (isResult(resultError)) throw new Error('was an result, so no error found!')
  return resultError[0]
}

export function resultFromResultError<T>(resultError: SafeParseOutput<T>): T {
  if (!isResult(resultError)) throw new Error('was an error, so no result found!')
  return resultError[1]
}

export function firstErrorFromErrors(validationErrors: ValidationErrors): string {
  if (validationErrors.errors.length === 0) throw new Error('no first error found')
  return validationErrors.errors[0] as string
}

export function firstError(resultError: SafeParseOutput<unknown>): string {
  return firstErrorFromErrors(errorFromResultError(resultError))
}

/**
 *
 * @param item
 * @returns a string of the type of a variable
 */
function typeOfItem(item: unknown): string {
  // eslint-disable-next-line no-nested-ternary
  return item === null
    ? 'Null'
    : item === undefined
    ? 'Undefined'
    : Object.prototype.toString.call(item).slice(8, -1)
}

export function isObjectType(val: unknown): val is object {
  return typeOfItem(val) === 'Object'
}

export function isOptionalSchema(
  schema: MinimumSchema,
): schema is MinimumSchema & { schemaType: 'optional'; wrappedSchema: MinimumSchema } {
  return schema.schemaType === 'optional'
}

export function isNeverSchema(
  schema: MinimumSchema,
): schema is MinimumSchema & { schemaType: 'never' } {
  return schema.schemaType === 'never'
}

export function unwrappedSchema(schema: MinimumSchema): MinimumSchema {
  return isOptionalSchema(schema) ? unwrappedSchema(schema.wrappedSchema) : schema
}

export function isTransformed(
  schema: MinimumSchema,
): schema is MinimumSchema & { transformed: true } {
  return 'transformed' in schema && schema.transformed === true
}
