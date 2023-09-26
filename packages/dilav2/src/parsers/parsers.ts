import { ResultError } from '@trevthedev/toolbelt'
import defaultErrorFn, { DefaultErrorFn } from '../errorFns'
import { SingleValidationError } from '../validations/validations'
import { isObjectType } from '../shared'
import { parseObjectProperties } from './parse object properties'
import { SafeParseFn } from '../schema'
import parseUnmatchedKeys from './parse unmatched properties'

// #TODO: make settable
const errorFns = defaultErrorFn

// export type SafeParseFn<Output, Input = unknown> = (input: Input) => SafeParseOutput<Output>

export type ValidationErrors = {
  input: unknown
  errors: SingleValidationError[]
}

export type SafeParseOutput<T> = ResultError<ValidationErrors, T>

export type Parsers = typeof parsers

export const parsers = {
  // typeof<T>(options: { typeof: string; errorFn: () => (value: unknown) => string }) {
  //   return (value: unknown): SafeParseOutput<T> =>
  //     typeof value !== options.typeof
  //       ? [
  //           {
  //             input: value,
  //             errors: [options.errorFn()(value)],
  //           },
  //           undefined,
  //         ]
  //       : [undefined, value as T]
  // },
  // /**
  //  * typeof value === 'string'
  //  * @param parseStringError
  //  */
  // string(options?: { parseStringError?: DefaultErrorFn['parseStringError'] }): SafeParseFn<string> {
  //   return parsers.typeof({
  //     typeof: 'string',
  //     errorFn: () => (options ?? {}).parseStringError ?? errorFns.parseStringError,
  //   })
  // },
  // /**
  //  * String(value)
  //  */
  coerceString(value: unknown): ResultError<never, string> {
    return [undefined, String(value)]
  },
  /**
   * typeof value === 'number'
   * @param parseNumberError
   */
  // number(options?: { parseNumberError?: DefaultErrorFn['parseNumberError'] }): SafeParseFn<number> {
  //   return parsers.typeof<number>({
  //     typeof: 'number',
  //     errorFn: () => (options ?? {}).parseNumberError ?? errorFns.parseNumberError,
  //   })
  // },
  /**
   * typeof Number(value) === 'number'
   */
  coerceNumber(options?: {
    parseNumberError?: DefaultErrorFn['parseNumberError']
  }): SafeParseFn<number> {
    const numberParser = parsers.number(options)
    return (value: unknown): SafeParseOutput<number> => numberParser(Number(value))
  },

  /**
   * typeof value === 'object'
   * @param options
   * @param options.parseObjectError parseObjectError
   * @param options.type type string to pass to parseObjectError, if unspecified type is 'object'
   */
  object(options?: {
    parseObjectError?: DefaultErrorFn['parseObjectError']
    type?: string
  }): SafeParseFn<object> {
    const { parseObjectError, type = 'object' } = options ?? {}
    return (value: unknown): SafeParseOutput<object> =>
      isObjectType(value)
        ? [undefined, value]
        : [
            {
              input: value,
              errors: [(parseObjectError ?? errorFns.parseObjectError)(value, type)],
            },
            undefined,
          ]
  },
  objectProperties: parseObjectProperties,
  unmatchedKeys: parseUnmatchedKeys,
  /**
   * value === options.literal
   * @param options
   * @param options.literal literal value
   * @param options.parseLiteralError parseLiteralError
   * @returns SafeParseFn<options.literal>
   */
  literal<T>(options: {
    literal: T
    parseLiteralError?: DefaultErrorFn['parseLiteralError']
  }): SafeParseFn<T> {
    const { literal, parseLiteralError } = options
    return (value: unknown): SafeParseOutput<T> =>
      literal !== value
        ? [
            {
              input: value,
              errors: [(parseLiteralError ?? errorFns.parseLiteralError)(value, literal)],
            },
            undefined,
          ]
        : [undefined, value as T]
  },
  /**
   * value === any
   * @returns SafeParseFn<any>
   */
  any(): SafeParseFn<any> {
    return (value: unknown): SafeParseOutput<any> => [undefined, value as any]
  },
  /**
   * value === unknown
   * @returns SafeParseFn<unknown>
   */
  unknown(): SafeParseFn<unknown> {
    return (value: unknown): SafeParseOutput<unknown> => [undefined, value as unknown]
  },
  /**
   * @returns SafeParseFn<never>
   */
  never(options: { parseNeverError?: DefaultErrorFn['parseNeverError'] }): SafeParseFn<never> {
    return (value: unknown): SafeParseOutput<never> => [
      {
        input: value,
        errors: [(options.parseNeverError ?? errorFns.parseNeverError)(value)],
      },
      undefined,
    ]
  },
}
