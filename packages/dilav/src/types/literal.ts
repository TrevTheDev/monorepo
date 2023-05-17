/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFinalBaseObject } from './base'
import {
  SafeParseFn,
  defaultErrorFnSym,
  MinimumSchema,
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
  BaseTypes,
  SafeParseOutput,
} from './types'

import defaultErrorFn, { DefaultErrorFn } from './errorFns'

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
  invalidLiteralFn?: DefaultErrorFn['parseLiteral'],
): SafeParseFn<T> {
  return (value: unknown): SafeParseOutput<T> =>
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
 * VLiteral
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

type LiteralOptions<T, Type extends string> = (
  | { parser: SafeParseFn<T> }
  | { invalidValueFn?: (invalidValue: unknown, literalValue: T) => SingleValidationError }
) & { type?: Type; baseType?: BaseTypes }

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
  // <T extends object>(literal: T): VLiteral<T>
  <const T>(literal: T): VLiteral<T>
  <T, Type extends string>(literal: T, options: LiteralOptions<T, Type>): VLiteral<T, Type>
}

export function initLiteralTypes(baseObject: MinimumSchema) {
  errorFns = baseObject[defaultErrorFnSym]
  const baseLiteralObject = Object.create(baseObject)

  /** ****************************************************************************************************************************
   * vLiteral
   ***************************************************************************************************************************** */
  const vLiteral = function vLiteralFunc<const T, Type extends string>(
    literal: T,
    options: LiteralOptions<T, Type> = {},
  ): VLiteral<T, Type> {
    return createFinalBaseObject(
      baseLiteralObject,
      'parser' in options
        ? options.parser
        : parseLiteral(literal, options.invalidValueFn as DefaultErrorFn['parseLiteral']),
      options.type === undefined ? convertLiteralToString(literal) : options.type,
      options.baseType ?? 'literal',
      { literal },
    ) as unknown as VLiteral<T, Type>
  } as unknown as VLiteralFn

  type NaNOptions =
    | { parser: SafeParseFn<number> }
    | { invalidValueFn: (invalidValue: unknown) => SingleValidationError }

  /** ****************************************************************************************************************************
   * vNaN
   ***************************************************************************************************************************** */
  function vNaN(options: Partial<NaNOptions> = {}): VNaN {
    const vOptions = {
      parser: (value: unknown): SafeParseOutput<number> =>
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
    | { parser: SafeParseFn<undefined> }
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
    | { parser: SafeParseFn<void> }
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
    | { parser: SafeParseFn<null> }
    | { invalidValueFn: (invalidValue: unknown) => SingleValidationError }

  const vNull = (
    options: NullOptions = { invalidValueFn: (val) => errorFns.parseNull(val) },
  ): VNull => vLiteral<null, 'null'>(null, { ...options, type: 'null' }) as VNull

  /** ****************************************************************************************************************************
   * vNullishL
   ***************************************************************************************************************************** */
  type NullishOptions =
    | { parser: SafeParseFn<null | undefined> }
    | { invalidValueFn: (invalidValue: unknown) => SingleValidationError }
    | Record<string, never>

  function vNullishL(options: NullishOptions = {}): VNullishL {
    return vLiteral<null | undefined, 'null|undefined'>(
      'null|undefined' as unknown as null | undefined,
      {
        parser:
          (options as any).parser ??
          ((value: unknown): SafeParseOutput<null | undefined> =>
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
  function vAny(options: { parser?: SafeParseFn<any> } = {}): VAny {
    return vLiteral<any, 'any'>('any', {
      parser:
        options.parser ?? ((value: unknown): SafeParseOutput<any> => [undefined, value as any]),
      type: 'any' as const,
    }) as VAny
  }

  /** ****************************************************************************************************************************
   * vUnknown
   ***************************************************************************************************************************** */
  function vUnknown(options: { parser?: SafeParseFn<unknown> } = {}): VUnknown {
    return vLiteral<unknown, 'unknown'>('unknown', {
      parser:
        options.parser ?? ((value: unknown): SafeParseOutput<any> => [undefined, value as unknown]),
      type: 'unknown' as const,
    }) as VUnknown
  }

  /** ****************************************************************************************************************************
   * vNever
   ***************************************************************************************************************************** */
  type NeverOptions =
    | { parser: SafeParseFn<never> }
    | { invalidValueFn: (invalidValue: unknown) => SingleValidationError }
    | Record<string, never>

  function vNever(options: NeverOptions = {}): VNever {
    return vLiteral<never, 'never'>('never' as never, {
      parser: (value: unknown): SafeParseOutput<never> => [
        {
          input: value,
          errors: [((options as any).invalidValueFn ?? errorFns.parseNever)(value)],
        },
        undefined,
      ],
      type: 'never' as const,
      baseType: 'never',
    }) as VNever
  }

  return { vLiteral, vNaN, vUndefined, vNull, vAny, vUnknown, vNever, vNullishL, vVoid }
}
