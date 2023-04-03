/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError } from 'toolbelt'

import { SafeParseFn, SafeParsableObject, defaultErrorFnSym, createFinalBaseObject } from './base'

import { baseObject } from './init'
import {
  SingleValidationError,
  ValidationErrors,
  createValidationBuilder,
} from './base validations'
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
    if (value instanceof instanceOfItem) return [undefined, value]
    return [
      {
        input: value,
        errors: [(invalidInstanceOf || errorFns.parseInstanceOf)(value, instanceOfItem)],
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

type InstanceOfType = { new (...args: any): any; name: string }

export interface VInstanceOf<T extends InstanceOfType, Output = InstanceType<T>, Input = unknown>
  extends SafeParsableObject<Output, T['name'], 'instanceof', Input> {
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
) {
  return createFinalBaseObject(
    baseInstanceOfObject,
    (options as any).parser || parseInstanceOf(instanceOfItem, (options as any).parseInstanceOf),
    instanceOfItem.name,
    'instanceof',
    { instanceOfItem },
  )
}
