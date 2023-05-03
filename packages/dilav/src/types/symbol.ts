/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError } from '@trevthedev/toolbelt'

import { createFinalBaseObject } from './base'
import { SafeParseFn, BaseSchema, defaultErrorFnSym, ValidationErrors } from './types'

import { baseObject } from './init'
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
 * vBoolean
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export type VSymbol<Output extends symbol = symbol, Input = unknown> = BaseSchema<
  Output,
  string,
  'symbol',
  Input
>

type SymbolOptions =
  | {
      parseSymbolError: DefaultErrorFn['parseSymbol']
    }
  | {
      parser: SafeParseFn<unknown, symbol>
    }
  | Record<string, never>

const baseSymbolObject = Object.create(baseObject)

export function vSymbol(options: SymbolOptions = {}): VSymbol {
  return createFinalBaseObject(
    baseSymbolObject,
    (options as any).parser ?? parseSymbol((options as any).parseSymbolError),
    `symbol`,
    'symbol',
  ) as VSymbol
}

export const vSymbolInstance = vSymbol()
