import type { FlattenObjectUnion } from '../toolbelt'

import { createFinalBaseObject } from './base'
import { SafeParseFn, BaseSchema, defaultErrorFnSym, SafeParseOutput } from './types'

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
): (value: unknown) => SafeParseOutput<symbol> {
  return (value: unknown): SafeParseOutput<symbol> =>
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
      parser: SafeParseFn<symbol>
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
