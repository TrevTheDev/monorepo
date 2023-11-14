/* eslint-disable no-loop-func, no-restricted-syntax */
import { isError } from '@trevthedev/toolbelt'
import type { VInfer } from './infer'
import type {
  BaseSafeParseFn,
  MinimumSchema,
  SafeParseFn,
  SchemaTypes,
  TypedMinimumSchema,
} from './schema'
import {
  BaseValidationFn,
  BaseValidator,
  BaseValidatorLibrary,
  ValidationFn,
  ValidatorLibrary,
  validate,
  validationsKey,
} from '../validations/validations'
import { appendSchemaPrototypeBuilder } from './append default schemaproto'

export interface MinimumBuilder extends MinimumSchema {
  [validationsKey]: BaseValidationFn[]
}

// work around for https://github.com/microsoft/TypeScript/issues/37888
export interface BuilderValidations<O> {
  [validationsKey]: ValidationFn<O>[]
}
type BuilderValidationMixin<
  S extends {
    input: unknown
    output: unknown
    args: unknown[]
    schemaType: SchemaTypes
    type: string
    validators: ValidatorLibrary<S['output']>
  },
> = {
  [P in keyof S['validators']]: (...args: Parameters<S['validators'][P]>) => Builder<S>
}

interface BuilderBuilder<
  S extends {
    input: unknown
    output: unknown
    args: unknown[]
    schemaType: SchemaTypes
    type: string
    validators: ValidatorLibrary<S['output']>
  },
> {
  validations(validations: BuilderValidations<S['output']> | ValidationFn<S['output']>[]): this
  readonly builder: this
}

// type DepthLimitCount = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

// DO NOT include builder in SchemaPrototype - causes circular ref error
export type Builder<
  S extends {
    input: unknown
    output: unknown
    args: unknown[]
    schemaType: SchemaTypes
    type: string
    validators: ValidatorLibrary<S['output']>
  },
> = TypedMinimumSchema<S> &
  BuilderValidations<S['output']> &
  BuilderValidationMixin<S> &
  BuilderBuilder<S>
//

export type BuilderCreateSafeParseFn = (options: { validations: MinimumBuilder }) => BaseSafeParseFn

export type CreateBuilderFn = <
  const S extends MinimumSchema,
  const Validators extends BaseValidatorLibrary,
>(
  schema: S,
  validators: Validators,
  validations?: BaseValidationFn[],
  breakOnFirstError?: boolean,
) => Builder<VInfer<S> & { validators: Validators }>

export function builder<
  const S extends MinimumSchema,
  const Validators extends BaseValidatorLibrary,
>(
  schema: S,
  validators: Validators,
  validations?: BaseValidationFn[],
  breakOnFirstError?: boolean,
): Builder<VInfer<S> & { validators: Validators }>
export function builder(
  schema: MinimumSchema,
  validators: BaseValidatorLibrary,
  validations: BaseValidationFn[] = [],
  breakOnFirstError = false,
): MinimumBuilder {
  const validationFn = validate({ validations, breakOnFirstError })
  function builderSchema(input, ...args) {
    const parsedOutput = schema(input, ...args)
    if (isError(parsedOutput)) return parsedOutput
    const errors = validationFn(parsedOutput[1])
    return errors !== undefined ? [{ input, errors }, undefined] : parsedOutput
  }
  const baseProto = appendSchemaPrototypeBuilder({
    prototype: undefined,
    schemaType: schema.schemaType,
    type: schema.type,
    // TODO: check if schema.builder.parse works
    parser: undefined as unknown as SafeParseFn<unknown, unknown, unknown[]>,
    // validators,
    breakOnFirstError,
    builder: builderSchema as MinimumBuilder,
  }).prototype

  const keys = Object.keys(validators)
  for (const key of keys) {
    Object.defineProperty(baseProto, key, {
      value(...args) {
        return builder(
          schema,
          validators,
          [...validations, (validators[key] as BaseValidator)(...args)],
          breakOnFirstError,
        )
      },
      enumerable: true,
    })
  }

  Object.defineProperties(baseProto, {
    [validationsKey]: {
      get() {
        return validations
      },
    },
    validations: {
      value(additionalValidations) {
        const newValidations =
          validationsKey in additionalValidations
            ? [...validations, ...additionalValidations[validationsKey]]
            : [...validations, ...additionalValidations]
        return builder(schema, validators, newValidations, breakOnFirstError)
      },
    },
    // builder: {
    //   value: builderSchema,
    // },
    // and: {
    //   value: undefined,
    // },
    // or: { value: undefined },
  })
  Object.setPrototypeOf(builderSchema, baseProto)
  return builderSchema as MinimumBuilder
}
