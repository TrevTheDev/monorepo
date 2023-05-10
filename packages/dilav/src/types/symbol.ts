import type { FlattenObjectUnion, ResultError } from '@trevthedev/toolbelt'

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
  'symbol',
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
  // eslint-disable-next-line @typescript-eslint/ban-types
  | {}

const baseSymbolObject = Object.create(baseObject)

export function vSymbol(options: SymbolOptions = {}): VSymbol {
  type Opts = FlattenObjectUnion<SymbolOptions>
  return createFinalBaseObject(
    baseSymbolObject,
    (options as Opts).parser ?? parseSymbol((options as Opts).parseSymbolError),
    `symbol`,
    'symbol',
  ) as VSymbol
}

export const vSymbolInstance = vSymbol()
