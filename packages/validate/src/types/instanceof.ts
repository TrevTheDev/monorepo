/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError } from 'toolbelt'

import type {
  SafeParseFn,
  SafeParsableObject,
  SingleValidationError,
  ValidationErrors,
  ValidationItem,
} from './base'
import defaultErrorFn from './defaultErrors'
import { createBaseValidationBuilder } from './init'

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
  invalidInstanceOf: (
    invalidValue: unknown,
    instanceOfItemA: T,
  ) => SingleValidationError = defaultErrorFn.parseInstanceOf,
): (value: unknown) => ResultError<ValidationErrors, InstanceType<T>> {
  return (value: unknown): ResultError<ValidationErrors, InstanceType<T>> => {
    if (value instanceof instanceOfItem) return [undefined, value]
    return [{ input: value, errors: [invalidInstanceOf(value, instanceOfItem)] }, undefined]
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
type InstanceOfValidations<T> = [
  [
    'customValidation',
    (
      customValidator: (value: T, ...otherArgs: unknown[]) => SingleValidationError | undefined,
      ...otherArgs: unknown[]
    ) => (value: T) => SingleValidationError | undefined,
  ],
]

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

export type VInstanceOf<
  T extends InstanceOfType,
  Output = InstanceType<T>,
  Input = unknown,
  Validations extends InstanceOfValidations<Output> = InstanceOfValidations<Output>,
> = SafeParsableObject<Output, T['name'], Input> & {
  // default validations
  [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
    ? Validations[I] extends ValidationItem<any>
      ? Validations[I][0]
      : never
    : never]: (...args: Parameters<Validations[I][1]>) => VInstanceOf<T, Output, Input, Validations>
}

type InstanceOfOptions<T extends InstanceOfType> = {
  parser: SafeParseFn<unknown, InstanceType<T>>
  parseInstanceOf: (invalidValue: unknown, instanceOfItem: T) => SingleValidationError
}

export const vInstanceOf = <T extends InstanceOfType>(
  instanceOfItem: T,
  options: Partial<InstanceOfOptions<T>> = {},
) =>
  createBaseValidationBuilder(
    options.parser
      ? options.parser
      : parseInstanceOf(
          instanceOfItem,
          options.parseInstanceOf ? options.parseInstanceOf : defaultErrorFn.parseInstanceOf,
        ),
    instanceOfValidations as InstanceOfValidations<InstanceType<T>>,
    instanceOfItem.name,
  ) as unknown as VInstanceOf<T>
