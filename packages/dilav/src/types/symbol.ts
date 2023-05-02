/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError, DeepWriteable } from 'toolbelt'

import { createFinalBaseObject } from './base'
import {
  SafeParseFn,
  BaseSchema,
  defaultErrorFnSym,
  SingleValidationError,
  ValidationErrors,
} from './types'

import { baseObject } from './init'
import { createValidationBuilder } from './base validations'
import { DefaultErrorFn } from './errorFns'

const errorFns = baseObject[defaultErrorFnSym]

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export function parseSymbol(
  invalidSymbolFn?: DefaultErrorFn['parseSymbol'],
): (value: unknown) => ResultError<ValidationErrors, symbol> {
  return (value: unknown): ResultError<ValidationErrors, symbol> =>
    typeof value !== 'symbol'
      ? [{ input: value, errors: [(invalidSymbolFn ?? errorFns.parseSymbol)(value)] }, undefined]
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
  extends BaseSchema<Output, string, 'symbol', Input> {
  // default validations
  customValidations<S extends unknown[]>(
    customValidator: (value: Output, ...otherArgs: S) => SingleValidationError | undefined,
    ...otherArgs: S
  ): this
}

type SymbolOptions =
  | {
      parseSymbolError: DefaultErrorFn['parseSymbol']
    }
  | {
      parser: SafeParseFn<unknown, symbol>
    }
  | Record<string, never>

const baseSymbolObject = createValidationBuilder(baseObject, symbolValidations)

export function vSymbol(options: SymbolOptions = {}): VSymbol {
  return createFinalBaseObject(
    baseSymbolObject,
    (options as any).parser ?? parseSymbol((options as any).parseSymbolError),
    `symbol`,
    'symbol',
  ) as VSymbol
}

export const vSymbolInstance = vSymbol()
