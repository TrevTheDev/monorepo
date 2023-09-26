/* eslint-disable @typescript-eslint/no-explicit-any */
import { isError } from '@trevthedev/toolbelt'
import { builder } from '../builder'
import defaultErrorFn, { DefaultErrorFn } from '../errorFns'
import { SafeParseOutput } from '../parsers/parsers'
import { BaseSafeParseFn, BaseSchemaDefinition, SafeParseFn } from '../schema'
import { baseSchemaPrototype, basicSchemaCreator, createSchema } from '../schema creator'
import {
  ValidationFn,
  Validations,
  ValidatorLibrary,
  customValidations,
  validate,
  validationsKey,
} from '../validations/validations'
import { BaseVInferSafeParse, VInferSafeParse } from '../infer'

type ValidDefaultErrorFns = {
  [P in keyof DefaultErrorFn as DefaultErrorFn[P] extends DefaultErrorFn['parseLiteralError']
    ? P
    : never]: DefaultErrorFn[P]
}

function vLiteralFn<
  const T,
  // eslint-disable-next-line @typescript-eslint/ban-types
  const Validators extends ValidatorLibrary<T> = {},
  Type extends string = T extends string | number | boolean ? `${T}` : never,
  const ParseLiteralErrorOptionString extends
    | (string & keyof ValidDefaultErrorFns)
    | 'parseLiteralError' = 'parseLiteralError',
>(options: {
  literal: T
  parseLiteralErrorOptionString?: ParseLiteralErrorOptionString
  validators?: Validators
  type?: Type
}) {
  const {
    type = String(options.literal) as Type,
    literal,
    parseLiteralErrorOptionString = 'parseLiteralError',
  } = options
  function parser(
    opts: {
      [K in ParseLiteralErrorOptionString]?: DefaultErrorFn['parseLiteralError']
    } = {},
  ): SafeParseFn<T, unknown, []> {
    return (input: unknown): SafeParseOutput<T> => {
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
  }
  return basicSchemaCreator({
    parser: parser as (opts: {
      [K in ParseLiteralErrorOptionString]?: DefaultErrorFn['parseLiteralError']
    }) => (input: unknown) => SafeParseOutput<T>,
    type,
    schemaType: 'literal' as const,
    validators: customValidations<T>(),
  })
}

export function vLiteral<const T>(options: {
  literal: T
  parseLiteralError?: DefaultErrorFn['parseLiteralError']
}) {
  const { literal, parseLiteralError } = options
  const p = vLiteralFn({
    literal,
    type: `${literal}`,
  })
  return parseLiteralError ? p({ parseLiteralError }) : p()
}

export const vUndefined = vLiteralFn({
  literal: undefined,
  validators: customValidations<undefined>(),
  parseLiteralErrorOptionString: 'parseUndefinedError',
})

export const vNull = vLiteralFn({
  literal: null,
  validators: customValidations<null>(),
  parseLiteralErrorOptionString: 'parseNullError',
})

export const vTrue = vLiteralFn({
  literal: true,
  validators: customValidations<true>(),
  parseLiteralErrorOptionString: 'parseTrueError',
})

export const vFalse = vLiteralFn({
  literal: false,
  validators: customValidations<false>(),
  parseLiteralErrorOptionString: 'parseFalseError',
})

function anyParser(input: unknown): SafeParseOutput<any> {
  return [undefined, input as any]
}

function safeParseAndValidate<
  T extends BaseSafeParseFn,
  X extends BaseVInferSafeParse = VInferSafeParse<T>,
  O = X['output'],
  I = X['input'],
  Args extends unknown[] = X['args'],
>(
  parser: BaseSafeParseFn,
  breakOnFirstError: boolean,
): (options: {
  validations:
    | ValidationFn<O>[]
    | {
        [validationsKey]: ValidationFn<O>[]
      }
}) => SafeParseFn<O, I, Args> {
  return function createSafeParserFn(options: {
    validations:
      | ValidationFn<O>[]
      | {
          [validationsKey]: ValidationFn<O>[]
        }
  }): SafeParseFn<O, I, Args> {
    const validationFn = validate({ ...options, breakOnFirstError })
    return function SafeParseAndValidateFn(value: I, ...args: Args): SafeParseOutput<O> {
      const parsedOutput = parser(value, ...args)
      if (isError(parsedOutput)) return parsedOutput
      const validationErrors = validationFn(parsedOutput[1])
      return validationErrors !== undefined
        ? [{ input: value, errors: validationErrors }, undefined]
        : parsedOutput
    }
  }
}

const anyValidators = customValidations<any>()
const anyProto = {
  validations(validations: Validations<any>) {
    const nextSchemaDef = {
      ...vAnySchemaDef,
      schemaPrototype: Object.setPrototypeOf(
        {
          validations(validationsN: Validations<any>) {
            return this.validations([
              ...(validationsKey in validations ? validations[validationsKey] : validations),
              ...(validationsKey in validationsN ? validationsN[validationsKey] : validationsN),
            ])
          },
        },
        baseSchemaPrototype,
      ),
      validations,
    }
    return createSchema(nextSchemaDef)
  },
  builder: builder({
    schemaPrototype: baseSchemaPrototype,
    parser: anyParser,
    schemaType: 'any' as const,
    type: 'any' as const,
    breakOnFirstError: false,
    validators: anyValidators,
  }),
  validators: anyValidators,
}

const vAnySchemaDef = {
  schemaPrototype: Object.setPrototypeOf(anyProto, baseSchemaPrototype),
  schemaType: 'any' as const,
  type: 'any' as const,
  // builder: anyBuilder,
  parser: anyParser,
  breakOnFirstError: false,
} satisfies BaseSchemaDefinition

export const vAny = createSchema(vAnySchemaDef)

export const vUnknown = basicSchemaCreator({
  parser(): SafeParseFn<unknown, unknown, []> {
    return (input: unknown): SafeParseOutput<unknown> => [undefined, input as unknown]
  },
  type: 'unknown',
  schemaType: 'unknown' as const,
  validators: customValidations<unknown>(),
})()

export const vNever = basicSchemaCreator({
  parser(
    options: { parseNeverError?: DefaultErrorFn['parseNeverError'] } = {},
  ): SafeParseFn<never, unknown, []> {
    const { parseNeverError } = options
    return (input: unknown): SafeParseOutput<never> => [
      {
        input,
        errors: [(parseNeverError ?? defaultErrorFn.parseNeverError)(input)],
      },
    ]
  },
  type: 'never',
  schemaType: 'never' as const,
  validators: {},
})
