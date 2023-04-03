/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError } from 'toolbelt'
import type {
  CreateBaseValidationBuilderGn,
  SafeParseFn,
  SafeParsableObject,
  SingleValidationError,
  ValidationArray,
  ValidationErrors,
  ValidationItem,
} from './base'

import defaultErrorFn from './shared'

export function parseLiteral<T>(
  literal: T,
  invalidLiteralFn: (
    invalidValue: unknown,
    literalValue: T,
  ) => SingleValidationError = defaultErrorFn.parseLiteral,
): (value: unknown) => ResultError<ValidationErrors, T> {
  return (value: unknown): ResultError<ValidationErrors, T> =>
    literal !== value
      ? [{ input: value, errors: [invalidLiteralFn(value, literal)] }, undefined]
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
 * vBoolean
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

interface VLiteral2<Output, Type extends string, Input>
  extends SafeParsableObject<Output, Type, Input> {
  literal: Output
}

export type VLiteral<
  Output,
  Type extends string = string,
  Input = unknown,
  Validations extends ValidationArray<Output> = LiteralValidations<Output>,
> = VLiteral2<Output, Type, Input> & {
  // default validations
  [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
    ? Validations[I] extends ValidationItem<any>
      ? Validations[I][0]
      : never
    : never]: (...args: Parameters<Validations[I][1]>) => VLiteral<Output, Type, Input, Validations>
}

export type VNaN = VLiteral<number, 'number'>
export type VUndefined = VLiteral<undefined, 'undefined'>
export type VNull = VLiteral<null, 'null'>
export type VNullishL = VLiteral<null | undefined, 'null|undefined'>
export type VAny = VLiteral<any, 'any'>
export type VUnknown = VLiteral<unknown, 'unknown'>
export type VNever = VLiteral<never, 'never'>

// TODO: Add const for every generic below

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
  <T>(literal: T & Readonly<T>): VLiteral<T>
  <T, Type extends string>(literal: T, options: LiteralOptions<T, Type>): VLiteral<T, Type>
}

export function initLiteralTypes(createBaseValidationBuilder: CreateBaseValidationBuilderGn) {
  const vLiteral = function vLiteralFunc<T, Type extends string>(
    literal: T,
    options: LiteralOptions<T, Type> = {},
  ): VLiteral<T, Type> {
    return createBaseValidationBuilder(
      'parser' in options
        ? options.parser
        : parseLiteral(
            literal,
            'invalidValueFn' in options ? options.invalidValueFn : defaultErrorFn.parseLiteral,
          ),
      literalValidations,
      options.type === undefined ? convertLiteralToString(literal) : options.type,
    ) as unknown as VLiteral<T, Type>
  } as unknown as VLiteralFn

  type NaNOptions =
    | { parser: SafeParseFn<unknown, number> }
    | { invalidValueFn: (invalidValue: unknown) => SingleValidationError }

  function vNaN(options: Partial<NaNOptions> = {}): VNaN {
    const invalidValueFn: (invalidValue: string) => SingleValidationError =
      'invalidValueFn' in options ? options.invalidValueFn : defaultErrorFn.parseNaN

    const vOptions = {
      parser: (value: unknown): ResultError<ValidationErrors, number> =>
        !Number.isNaN(value)
          ? [{ input: value, errors: [invalidValueFn(String(value))] }, undefined]
          : [undefined, value as number],

      ...options,
    }
    return vLiteral<number, 'number'>(NaN, { parser: vOptions.parser }) as unknown as VNaN
  }

  type UndefinedOptions =
    | { parser: SafeParseFn<unknown, undefined> }
    | { invalidValueFn: (invalidValue: unknown) => SingleValidationError }

  const vUndefined = (
    options: Partial<UndefinedOptions> = { invalidValueFn: defaultErrorFn.parseUndefined },
  ): VUndefined =>
    vLiteral<undefined, 'undefined'>(undefined, {
      ...options,
      type: 'undefined',
    }) as unknown as VUndefined

  type NullOptions =
    | { parser: SafeParseFn<unknown, null> }
    | { invalidValueFn: (invalidValue: unknown) => SingleValidationError }

  const vNull = (
    options: Partial<NullOptions> = { invalidValueFn: defaultErrorFn.parseNull },
  ): VNull => vLiteral<null, 'null'>(null, { ...options, type: 'null' }) as unknown as VNull

  type NullishOptions =
    | { parser: SafeParseFn<unknown, null | undefined> }
    | { invalidValueFn: (invalidValue: unknown) => SingleValidationError }

  function vNullishL(
    options: Partial<NullishOptions> = {},
    // parser?: ParseFn<unknown, null | undefined>,
    // invalidNullFn: (invalidValue: unknown) => SingleValidationError = defaultErrorFn.parseNullish,
  ): VNullishL {
    const invalidValueFn: (invalidValue: unknown) => SingleValidationError =
      'invalidValueFn' in options ? options.invalidValueFn : defaultErrorFn.parseNullish

    const vOptions = {
      parser: (value: unknown): ResultError<ValidationErrors, null | undefined> =>
        value !== null && value !== undefined
          ? [{ input: value, errors: [invalidValueFn(value)] }, undefined]
          : [undefined, value],

      ...options,
    }
    return vLiteral<null | undefined, 'null|undefined'>(
      'null|undefined' as unknown as null | undefined,
      {
        parser: vOptions.parser,
        type: 'null|undefined',
      },
    ) as unknown as VNullishL
  }

  type AnyOptions = { parser: SafeParseFn<unknown, any> }

  function vAny(options?: AnyOptions): VAny {
    const aOptions = {
      parser: (value: unknown): ResultError<ValidationErrors, any> => [undefined, value as any],
      ...(options || {}),
      type: 'any' as const,
    }
    return vLiteral<any, 'any'>('any', aOptions) as unknown as VAny
  }

  type UnknownOptions = { parser: SafeParseFn<unknown, unknown> }

  function vUnknown(options?: UnknownOptions): VUnknown {
    const aOptions = {
      parser: (value: unknown): ResultError<ValidationErrors, any> => [undefined, value as unknown],
      ...(options || {}),
      type: 'unknown' as const,
    }
    return vLiteral<unknown, 'unknown'>('unknown', aOptions) as unknown as VUnknown
  }

  type NeverOptions =
    | { parser: SafeParseFn<unknown, never> }
    | { invalidValueFn: (invalidValue: unknown) => SingleValidationError }

  function vNever(options?: NeverOptions): VNever {
    const nOptions = {
      parser: (value: unknown): ResultError<ValidationErrors, number> => [
        { input: value, errors: [nOptions.invalidValueFn(value)] },
        undefined,
      ],
      invalidValueFn: defaultErrorFn.parseNever,
      ...options,
      type: 'never' as const,
    }
    return vLiteral<never, 'never'>('never' as never, nOptions) as unknown as VNever
  }

  return { vLiteral, vNaN, vUndefined, vNull, vAny, vUnknown, vNever, vNullishL }
}
