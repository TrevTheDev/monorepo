/* eslint-disable @typescript-eslint/ban-types */
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
 * vBigInt
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
abstract class Class {
  // eslint-disable-next-line @typescript-eslint/no-empty-function, no-useless-constructor
  constructor(..._: any[]) {}
}

type InstanceOfType = typeof Class // { new (...args: any): any; name: string }

export type VInstanceOf<
  T extends InstanceOfType,
  Output = InstanceType<T>,
  Input = unknown,
> = BaseSchema<Output, T extends { name: string } ? T['name'] : string, 'instanceof', Input>

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

const baseInstanceOfObject = Object.create(baseObject)

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
