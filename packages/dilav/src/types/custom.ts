import { FlattenObjectUnion } from '../toolbelt'

import { createFinalBaseObject } from './base'
import {
  SafeParseFn,
  BaseSchema,
  defaultErrorFnSym,
  SingleValidationError,
  SafeParseOutput,
} from './types'

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

export function parseCustom<Output, T extends (value: unknown) => boolean>(
  parser: T,
  parseCustomFn?: DefaultErrorFn['parseCustom'],
): SafeParseFn<Output> {
  return (value: unknown): SafeParseOutput<Output> =>
    parser(value) === true
      ? [undefined, value as Output]
      : [{ input: value, errors: [(parseCustomFn ?? errorFns.parseCustom)(value)] }, undefined]
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vMap
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export type VCustom<Output, Type extends string = string, Input = unknown> = BaseSchema<
  Output,
  Type,
  'custom',
  Input
>

const baseCustomObject = Object.create(baseObject)

type CustomOptions<Output, Type extends string = string> = (
  | { parser: SafeParseFn<Output> }
  | { invalidValueFn?: (invalidValue: unknown) => SingleValidationError }
) & { type?: Type }

export function vCustom<Output, Type extends string = string>(
  parser: (value: unknown) => boolean,
  options: CustomOptions<Output, Type> = {},
): VCustom<Output> {
  type Opts = FlattenObjectUnion<CustomOptions<Output, Type>>
  return createFinalBaseObject(
    baseCustomObject,
    (options as Opts).parser ?? parseCustom(parser, (options as Opts).invalidValueFn),
    options.type ?? 'custom',
    'custom',
  ) as VCustom<Output>
}
