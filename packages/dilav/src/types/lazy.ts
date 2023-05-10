import { createFinalBaseObject } from './base'
import { BaseSchema, MinimumSchema, BaseTypes } from './types'
import { baseObject } from './init'

export type VLazy<Output, Type extends string = string, Input = unknown> = BaseSchema<
  Output,
  Type,
  BaseTypes,
  Input,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
