/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */
import defaultErrorFn, { DefaultErrorFn } from '../shared/errorFns'
import { SafeParseOutput } from '../parsers/parsers'
import { customValidations } from '../validations/validations'
import { SafeParseFn } from '../shared/schema'
import {
  createMinimalSchemaWithCustom,
  createBasicSchema2WithCustom,
} from '../shared/schema creator'

export const vNever = createMinimalSchemaWithCustom({
  parser(opts: { parseNeverError?: DefaultErrorFn['parseNeverError'] } = {}) {
    const { parseNeverError } = opts
    return function neverFn(input: unknown): SafeParseOutput<never> {
      return [
        {
          input,
          errors: [(parseNeverError ?? defaultErrorFn.parseNeverError)(input)],
        },
      ]
    }
  },
  type: 'never',
  schemaType: 'never',
})

export type NaN = number & { readonly unassignable: unique symbol }

function nanParser(
  opts: { parseNaNError?: DefaultErrorFn['parseNaNError'] } = {},
): SafeParseFn<NaN, unknown> {
  const { parseNaNError } = opts
  return function nanParserFn(input: unknown): SafeParseOutput<NaN> {
    if (Number.isNaN(input)) return [undefined, input as NaN]
    return [{ input, errors: [(parseNaNError ?? defaultErrorFn.parseNaNError)(input)] }, undefined]
  }
}

export const vNaN = createBasicSchema2WithCustom({
  parser: nanParser,
  type: 'NaN',
  schemaType: 'NaN',
  validators: customValidations<NaN>(),
})
