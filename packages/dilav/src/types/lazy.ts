/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFinalBaseObject } from './base'
import { BaseSchema, MinimumSchema, SafeParsableObjectTypes } from './types'
import { baseObject } from './init'

export type VLazy<Output, Type extends string = string, Input = unknown> = BaseSchema<
  Output,
  Type,
  SafeParsableObjectTypes,
  Input,
  any
>

const baseLazyObject = Object.create(baseObject)
export function vLazy<T>(propFn: () => MinimumSchema, options: { type?: string } = {}): VLazy<T> {
  return createFinalBaseObject(
    baseLazyObject,
    (value) => propFn().safeParse(value),
    options.type ?? 'lazy',
    'lazy',
  ) as unknown as VLazy<T>
}
