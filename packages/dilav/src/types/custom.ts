/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResultError } from '@trevthedev/toolbelt'

import { createFinalBaseObject } from './base'
import {
  SafeParseFn,
  BaseSchema,
  defaultErrorFnSym,
  SingleValidationError,
  ValidationErrors,
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
): SafeParseFn<unknown, Output> {
  return (value: unknown): ResultError<ValidationErrors, Output> =>
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
  | { parser: SafeParseFn<unknown, Output> }
  | { invalidValueFn?: (invalidValue: unknown) => SingleValidationError }
) & { type?: Type }

export function vCustom<Output, Type extends string = string>(
  parser: (value: unknown) => boolean,
  options: CustomOptions<Output, Type> = {},
): VCustom<Output> {
  return createFinalBaseObject(
    baseCustomObject,
    (options as any).parser ?? parseCustom(parser, (options as any).invalidValueFn),
    options.type ?? 'custom type',
    'custom',
  ) as VCustom<Output>
}
