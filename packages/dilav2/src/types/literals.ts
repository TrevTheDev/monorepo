/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResultError } from '@trevthedev/toolbelt'
import defaultErrorFn, { DefaultErrorFn } from '../shared/errorFns'
import { SafeParseOutput, ValidationErrors } from '../parsers/parsers'
import {
  BasicSchema2WithCustom,
  SafeParseFn,
  SchemaTypes,
  VAny,
  VFalse,
  VNull,
  VTrue,
  VUndefined,
  VUnknown,
} from '../shared/schema'
import { createBasicSchema2, createBasicSchema2WithCustom } from '../shared/schema creator'
import { ValidatorLibrary, customValidations } from '../validations/validations'

type ValidDefaultErrorFns = {
  [P in keyof DefaultErrorFn as DefaultErrorFn[P] extends DefaultErrorFn['parseLiteralError']
    ? P
    : never]: DefaultErrorFn[P]
}

function vLiteralFn<
  const T,
  const Type extends string,
  const ParseLiteralErrorOptionString extends string & keyof ValidDefaultErrorFns,
  const Validators extends ValidatorLibrary<T>,
>(options: {
  literal: T
  type: Type
  parseLiteralErrorOptionString: ParseLiteralErrorOptionString
  validators: Validators
}): {
  output: T
  input: unknown
  args: []
  schemaType: 'literal'
  type: Type
  validators: Validators
  createParserOptions: {
    [K in ParseLiteralErrorOptionString]?: DefaultErrorFn['parseLiteralError']
  }
} extends infer O extends {
  output: T
  input: unknown
  args: unknown[]
  schemaType: SchemaTypes
  type: string
  validators: ValidatorLibrary<T>
  createParserOptions: object
}
  ? BasicSchema2WithCustom<O>
  : 'never' {
  const {
    type = String(options.literal) as Type,
    literal,
    parseLiteralErrorOptionString,
    validators,
  } = options
  function parser(
    opts: {
      [K in ParseLiteralErrorOptionString]?: DefaultErrorFn['parseLiteralError']
    } = {},
  ): SafeParseFn<T, unknown, []> {
    function parserFn(input: unknown): SafeParseOutput<T> {
      // const { parseLiteralError = defaultParseLiteralError } = opts
      const parseLiteralError: DefaultErrorFn['parseLiteralError'] =
        parseLiteralErrorOptionString in opts
          ? (opts[parseLiteralErrorOptionString] as DefaultErrorFn['parseLiteralError'])
          : defaultErrorFn[parseLiteralErrorOptionString]

      return input === literal
        ? [undefined, input as T]
        : [
            {
              input,
              errors: [parseLiteralError(input, literal)],
            },
          ]
    }
    return parserFn
  }
  return createBasicSchema2WithCustom({
    parser,
    type,
    schemaType: 'literal' as const,
    validators,
  })
}

export function vLiteral<const T>(options: {
  literal: T
  parseLiteralError?: DefaultErrorFn['parseLiteralError']
}) {
  const { literal, parseLiteralError = defaultErrorFn.parseLiteralError } = options
  const def = {
    literal,
    type: `${literal}`,
    parseLiteralErrorOptionString: 'parseLiteralError' as const,
    validators: customValidations<T>(),
  }
  const p = vLiteralFn(def)
  return p.custom({ parseLiteralError })
}

export const vUndefined: VUndefined = vLiteralFn({
  literal: undefined,
  type: 'undefined',
  validators: customValidations<undefined>(),
  parseLiteralErrorOptionString: 'parseUndefinedError',
})

export const vNull: VNull = vLiteralFn({
  literal: null,
  type: 'null',
  validators: customValidations<null>(),
  parseLiteralErrorOptionString: 'parseNullError',
})

export const vTrue: VTrue = vLiteralFn({
  literal: true,
  type: 'true',
  validators: customValidations<true>(),
  parseLiteralErrorOptionString: 'parseTrueError',
})

export const vFalse: VFalse = vLiteralFn({
  literal: false,
  type: 'false',
  validators: customValidations<false>(),
  parseLiteralErrorOptionString: 'parseFalseError',
})

function anyParser(input: unknown): ResultError<ValidationErrors, any> {
  return [undefined, input as any]
}
export const vAny: VAny = createBasicSchema2({
  schemaType: 'any',
  type: 'any',
  parser: anyParser,
  validators: customValidations<any>(),
})

function unknownParser(input: unknown): SafeParseOutput<unknown> {
  return [undefined, input as unknown]
}

export const vUnknown: VUnknown = createBasicSchema2({
  schemaType: 'unknown',
  type: 'unknown',
  parser: unknownParser,
  validators: customValidations<unknown>(),
})
