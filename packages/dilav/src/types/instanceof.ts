/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError } from 'toolbelt'

import { createFinalBaseObject } from './base'
import {
  SafeParseFn,
  BaseSchema,
  defaultErrorFnSym,
  ValidationErrors,
  SingleValidationError,
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

// eslint-disable-next-line @typescript-eslint/ban-types
export function parseInstanceOf<T extends InstanceOfType>(
  instanceOfItem: T,
  invalidInstanceOf?: DefaultErrorFn['parseInstanceOf'],
): SafeParseFn<unknown, InstanceType<T>> {
  return (value: unknown): ResultError<ValidationErrors, InstanceType<T>> => {
    if (value instanceof instanceOfItem) return [undefined, value as InstanceType<T>]
    return [
      {
        input: value,
        errors: [(invalidInstanceOf ?? errorFns.parseInstanceOf)(value, instanceOfItem)],
      },
      undefined,
    ]
  }
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * validators
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * all validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
// type InstanceOfValidations<T> = [
//   [
//     'customValidation',
//     (
//       customValidator: (value: T, ...otherArgs: unknown[]) => SingleValidationError | undefined,
//       ...otherArgs: unknown[]
//     ) => (value: T) => SingleValidationError | undefined,
//   ],
// ]

const instanceOfValidations = [
  [
    'customValidation',
    (customValidator, ...otherArgs) =>
      (value) =>
        customValidator(value, ...otherArgs),
  ],
] as const

// export const instanceOfValidations = instanceOfValidations_ as InstanceOfValidations

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vBigInt
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
abstract class Class {
  // eslint-disable-next-line @typescript-eslint/no-empty-function, no-useless-constructor
  constructor(..._: any[]) {}
}

type InstanceOfType = typeof Class // { new (...args: any): any; name: string }

export interface VInstanceOf<T extends InstanceOfType, Output = InstanceType<T>, Input = unknown>
  extends BaseSchema<Output, T extends { name: string } ? T['name'] : string, 'instanceof', Input> {
  customValidations<S extends unknown[]>(
    customValidator: (value: Output, ...otherArgs: S) => SingleValidationError | undefined,
    ...otherArgs: S
  ): this
}

type InstanceOfOptions<T extends InstanceOfType> =
  | {
      parseInstanceOf: DefaultErrorFn['parseInstanceOf']
    }
  | {
      parser: SafeParseFn<unknown, T>
    }
  | Record<string, never>

// type InstanceOfOptions<T extends InstanceOfType> = {
//   parser: SafeParseFn<unknown, InstanceType<T>>
//   parseInstanceOf: (invalidValue: unknown, instanceOfItem: T) => SingleValidationError
// }

const baseInstanceOfObject = createValidationBuilder(baseObject, instanceOfValidations as any)

export function vInstanceOf<T extends InstanceOfType>(
  instanceOfItem: T,
  options: Partial<InstanceOfOptions<T>> = {},
): VInstanceOf<T> {
  return createFinalBaseObject(
    baseInstanceOfObject,
    (options as any).parser ?? parseInstanceOf(instanceOfItem, (options as any).parseInstanceOf),
    instanceOfItem.name,
    'instanceof',
    { instanceOfItem },
  ) as VInstanceOf<T>
}
