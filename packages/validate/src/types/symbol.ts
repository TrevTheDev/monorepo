/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError, DeepWriteable } from 'toolbelt'

import type {
  SafeParseFn,
  SafeParsableObject,
  SingleValidationError,
  ValidationErrors,
} from './base'
import defaultErrorFn from './defaultErrors'
import { createBaseValidationBuilder } from './init'

export function parseSymbol(
  invalidSymbolFn: (invalidValue: unknown) => SingleValidationError = defaultErrorFn.parseSymbol,
): (value: unknown) => ResultError<ValidationErrors, symbol> {
  return (value: unknown): ResultError<ValidationErrors, symbol> =>
    typeof value !== 'symbol'
      ? [{ input: value, errors: [invalidSymbolFn(value)] }, undefined]
      : [undefined, value]
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * all validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type SymbolValidations = DeepWriteable<typeof symbolValidations_>
const symbolValidations_ = [
  [
    'customValidation',
    (
        customValidator: (value: symbol, ...otherArgs: unknown[]) => string | undefined,
        ...otherArgs: unknown[]
      ) =>
      (value: symbol) =>
        customValidator(value, ...otherArgs),
  ],
] as const
const symbolValidations = symbolValidations_ as SymbolValidations

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vBoolean
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export interface VSymbol<Output extends symbol = symbol, Input = unknown>
  extends SafeParsableObject<Output, 'boolean', Input> {
  // default validations
  customValidations<S extends unknown[]>(
    customValidator: (value: Output, ...otherArgs: S) => SingleValidationError | undefined,
    ...otherArgs: S
  ): this
}

type BooleanOptions = {
  parser: SafeParseFn<unknown, symbol>
  parseSymbolError: (invalidValue: unknown) => SingleValidationError
}

export const vSymbol = (options: Partial<BooleanOptions> = {}) =>
  createBaseValidationBuilder(
    options.parser
      ? options.parser
      : parseSymbol(
          options.parseSymbolError ? options.parseSymbolError : defaultErrorFn.parseSymbol,
        ),
    symbolValidations,
    'symbol',
  ) as unknown as VSymbol

export const vSymbolInstance = vSymbol()
