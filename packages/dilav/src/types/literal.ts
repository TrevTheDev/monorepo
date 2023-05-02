/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError } from 'toolbelt'
import { createFinalBaseObject } from './base'
import {
  SafeParseFn,
  defaultErrorFnSym,
  MinimumSchema,
  ValidationErrors,
  SingleValidationError,
  VLiteral,
  VNaN,
  VNullishL,
  VUndefined,
  VVoid,
  VNull,
  VAny,
  VUnknown,
  VNever,
} from './types'

import { createValidationBuilder } from './base validations'
import defaultErrorFn from './errorFns'

let errorFns = defaultErrorFn

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export function parseLiteral<T>(
  literal: T,
  invalidLiteralFn?: (typeof errorFns)['parseLiteral'],
): SafeParseFn<unknown, T> {
  return (value: unknown): ResultError<ValidationErrors, T> =>
    literal !== value
      ? [
          {
            input: value,
            errors: [(invalidLiteralFn ?? errorFns.parseLiteral)(value, literal)],
          },
          undefined,
        ]
      : [undefined, value as T]
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * all validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type LiteralValidations<T> = [
  [
    'customValidation',
    (
      customValidator: (value: T, ...otherArgs: unknown[]) => SingleValidationError | undefined,
      ...otherArgs: unknown[]
    ) => (value: T) => SingleValidationError | undefined,
  ],
]
const literalValidations_ = [
  [
    'customValidation',
    (
        customValidator: (value: any, ...otherArgs: unknown[]) => string | undefined,
        ...otherArgs: unknown[]
      ) =>
      (value: boolean) =>
        customValidator(value, ...otherArgs),
  ],
] as const
const literalValidations = literalValidations_ as LiteralValidations<any>

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * VLiteral
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

type LiteralOptions<T, Type extends string> = (
  | { parser: SafeParseFn<unknown, T> }
  | { invalidValueFn?: (invalidValue: unknown, literalValue: T) => SingleValidationError }
) & { type?: Type }

function convertLiteralToString(literal: any) {
  switch (typeof literal) {
    case 'symbol':
      return String(literal)
    case 'number':
      if (Number.isNaN(literal)) return String(literal)
      if (!Number.isFinite(literal)) return String(literal)
      return JSON.stringify(literal)
    case 'bigint':
      return String(literal)
    default:
      return JSON.stringify(literal)
  }
}

type VLiteralFn = {
  <const T>(literal: T): VLiteral<T>
  <T, Type extends string>(literal: T, options: LiteralOptions<T, Type>): VLiteral<T, Type>
}

export function initLiteralTypes(baseObject: MinimumSchema) {
  errorFns = baseObject[defaultErrorFnSym]
  const baseLiteralObject = createValidationBuilder(baseObject, literalValidations)

  /** ****************************************************************************************************************************
   * vLiteral
   ***************************************************************************************************************************** */
  const vLiteral = function vLiteralFunc<const T, Type extends string>(
    literal: T,
    options: LiteralOptions<T, Type> = {},
  ): VLiteral<T, Type> {
    return createFinalBaseObject(
      baseLiteralObject,
      'parser' in options ? options.parser : parseLiteral(literal, options.invalidValueFn),
      options.type === undefined ? convertLiteralToString(literal) : options.type,
      'literal',
      { literal },
    ) as unknown as VLiteral<T, Type>
  } as unknown as VLiteralFn

  type NaNOptions =
    | { parser: SafeParseFn<unknown, number> }
    | { invalidValueFn: (invalidValue: unknown) => SingleValidationError }

  /** ****************************************************************************************************************************
   * vNaN
   ***************************************************************************************************************************** */
  function vNaN(options: Partial<NaNOptions> = {}): VNaN {
    const vOptions = {
      parser: (value: unknown): ResultError<ValidationErrors, number> =>
        !Number.isNaN(value)
          ? [
              {
                input: value,
                errors: [((options as any).invalidValueFn ?? errorFns.parseNaN)(String(value))],
              },
              undefined,
            ]
          : [undefined, value as number],

      ...options,
    }
    return vLiteral<number, 'NaN'>(NaN, vOptions) as unknown as VNaN
  }

  /** ****************************************************************************************************************************
   * vUndefined
   ***************************************************************************************************************************** */
  type UndefinedOptions =
    | { parser: SafeParseFn<unknown, undefined> }
    | { invalidValueFn: (invalidValue: unknown) => SingleValidationError }

  const vUndefined = (
    options: UndefinedOptions = { invalidValueFn: (val) => errorFns.parseUndefined(val) },
  ): VUndefined =>
    vLiteral<undefined, 'undefined'>(undefined, {
      ...options,
      type: 'undefined',
    }) as unknown as VUndefined

  /** ****************************************************************************************************************************
   * vVoid
   ***************************************************************************************************************************** */
  type VoidOptions =
    | { parser: SafeParseFn<unknown, void> }
    | { invalidValueFn: (invalidValue: unknown) => SingleValidationError }

  const vVoid = (
    options: VoidOptions = { invalidValueFn: (val) => errorFns.parseUndefined(val) },
  ): VVoid =>
    vLiteral<undefined, 'void'>(undefined, {
      ...options,
      type: 'void',
    }) as unknown as VVoid

  /** ****************************************************************************************************************************
   * vNull
   ***************************************************************************************************************************** */
  type NullOptions =
    | { parser: SafeParseFn<unknown, null> }
    | { invalidValueFn: (invalidValue: unknown) => SingleValidationError }

  const vNull = (
    options: NullOptions = { invalidValueFn: (val) => errorFns.parseNull(val) },
  ): VNull => vLiteral<null, 'null'>(null, { ...options, type: 'null' }) as VNull

  /** ****************************************************************************************************************************
   * vNullishL
   ***************************************************************************************************************************** */
  type NullishOptions =
    | { parser: SafeParseFn<unknown, null | undefined> }
    | { invalidValueFn: (invalidValue: unknown) => SingleValidationError }
    | Record<string, never>

  function vNullishL(options: NullishOptions = {}): VNullishL {
    return vLiteral<null | undefined, 'null|undefined'>(
      'null|undefined' as unknown as null | undefined,
      {
        parser:
          (options as any).parser ??
          ((value: unknown): ResultError<ValidationErrors, null | undefined> =>
            value !== null && value !== undefined
              ? [
                  {
                    input: value,
                    errors: [((options as any).invalidValueFn ?? errorFns.parseNullish)(value)],
                  },
                  undefined,
                ]
              : [undefined, value]),
        type: 'null|undefined',
      },
    ) as VNullishL
  }

  /** ****************************************************************************************************************************
   * vAny
   ***************************************************************************************************************************** */
  function vAny(options: { parser?: SafeParseFn<unknown, any> } = {}): VAny {
    return vLiteral<any, 'any'>('any', {
      parser:
        options.parser ??
        ((value: unknown): ResultError<ValidationErrors, any> => [undefined, value as any]),
      type: 'any' as const,
    }) as VAny
  }

  /** ****************************************************************************************************************************
   * vUnknown
   ***************************************************************************************************************************** */
  function vUnknown(options: { parser?: SafeParseFn<unknown, unknown> } = {}): VUnknown {
    return vLiteral<unknown, 'unknown'>('unknown', {
      parser:
        options.parser ??
        ((value: unknown): ResultError<ValidationErrors, any> => [undefined, value as unknown]),
      type: 'unknown' as const,
    }) as VUnknown
  }

  /** ****************************************************************************************************************************
   * vNever
   ***************************************************************************************************************************** */
  type NeverOptions =
    | { parser: SafeParseFn<unknown, never> }
    | { invalidValueFn: (invalidValue: unknown) => SingleValidationError }
    | Record<string, never>

  function vNever(options: NeverOptions = {}): VNever {
    return vLiteral<never, 'never'>('never' as never, {
      parser: (value: unknown): ResultError<ValidationErrors, never> => [
        {
          input: value,
          errors: [((options as any).invalidValueFn ?? errorFns.parseNever)(value)],
        },
        undefined,
      ],
      type: 'never' as const,
    }) as VNever
  }

  return { vLiteral, vNaN, vUndefined, vNull, vAny, vUnknown, vNever, vNullishL, vVoid }
}
