import { DeepWriteable } from 'toolbelt'
import { createFinalBaseObject } from './base'
import { BaseSchema, SingleValidationError } from './types'
import { baseObject } from './init'
import { createValidationBuilder } from './base validations'

type LazyValidations = DeepWriteable<typeof lazyValidations_>

const lazyValidations_ = [
  [
    'customValidation',
    (
        customValidator: (
          value: object,
          ...otherArgs: unknown[]
        ) => SingleValidationError | undefined,
        ...otherArgs: unknown[]
      ) =>
      (value: object) =>
        customValidator(value, ...otherArgs),
  ],
] as const // [propName: string, validationFn: (...args) => (value: string) => string | undefined][]

const lazyValidations = lazyValidations_ as LazyValidations

export interface VLazy<Output, Type extends string = string, Input = unknown>
  extends BaseSchema<Output, Type, 'lazy', Input> {
  customValidator(
    customValidator: (value: Output, ...otherArgs: unknown[]) => SingleValidationError | undefined,
    ...otherArgs: unknown[]
  ): this
}

const baseLazyObject = createValidationBuilder(baseObject, lazyValidations)
export function vLazy<T>(propFn: () => any, options: { type?: string } = {}): VLazy<T> {
  return createFinalBaseObject(
    baseLazyObject,
    (value) => propFn().safeParse(value),
    options.type ?? 'lazy',
    'lazy',
  ) as unknown as VLazy<T>
}
