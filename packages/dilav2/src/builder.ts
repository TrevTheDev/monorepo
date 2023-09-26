/* eslint-disable no-loop-func, no-restricted-syntax */
import { isError } from '@trevthedev/toolbelt'
import { VInferSafeParse } from './infer'
import { BaseSafeParseFn, BaseSchema, BaseSchemaDefinition, MinimumSchema } from './schema'
import { SchemaDefinitionToSchema, createSchema } from './schema creator'
import {
  BaseValidationFn,
  BaseValidator,
  BaseValidatorLibrary,
  ValidationFn,
  validate,
  validationsKey,
} from './validations/validations'

export type BaseBuilder = MinimumSchema & {
  [validationsKey]: BaseValidationFn[]
}
// export type MinimumBuilder<
//   Schema extends MinimumSchema,
//   X extends BaseVInferSafeParse = VInferSafeParse<Schema>,
// > = Schema & {
//   [validationsKey]: ValidationFn<X['output']>[]
// }

export type BuilderValidations<O> = {
  [validationsKey]: ValidationFn<O>[]
}

export type Builder<
  SchemaDefinition extends BaseSchemaDefinition & {
    validators: BaseValidatorLibrary
  },
  Schema extends MinimumSchema = SchemaDefinitionToSchema<SchemaDefinition>,
  Validators extends BaseValidatorLibrary = SchemaDefinition['validators'],
> = {
  [P in keyof Validators]: (
    ...args: Parameters<Validators[P]>
  ) => Builder<SchemaDefinition, Schema, Validators>
} & {
  [validationsKey]: ValidationFn<VInferSafeParse<SchemaDefinition['parser']>['output']>[] // ValidationFn<VInferSafeParse<SchemaDefinition['parser']>['output']>[]
} & Schema

export type BuilderCreateSafeParseFn = (options: { validations: BaseBuilder }) => BaseSafeParseFn

export function builder(
  schema: BaseSchema,
  validators: BaseValidatorLibrary,
  validations: BaseValidationFn[] = [],
  breakOnFirstError = false,
): BaseBuilder {
  const validationFn = validate({ validations, breakOnFirstError })
  const builderSchema = function BuilderSchema(input, ...args) {
    const parsedOutput = schema(input, ...args)
    if (isError(parsedOutput)) return parsedOutput
    const validationErrors = validationFn(parsedOutput[1])
    return validationErrors !== undefined
      ? [{ input, errors: validationErrors }, undefined]
      : parsedOutput
  }
  // Object.setPrototypeOf(builderSchema, schema)
  const keys = Object.keys(validators)
  for (const key of keys) {
    Object.defineProperty(builderSchema, key, {
      value(...args) {
        return builder(
          schema,
          validators,
          [...validations, (validators[key] as BaseValidator)(...args)],
          breakOnFirstError,
        )
      },
    })
  }
  Object.defineProperties(builderSchema, {
    [validationsKey]: {
      get() {
        return validations
      },
    },
    validations: {
      value(moreValidations) {
        return builder(schema, validators, [...validations, ...moreValidations], breakOnFirstError)
      },
    },
    builder: {
      value: builderSchema,
    },
    and: {
      value: undefined,
    },
    or: { value: undefined },
  })
  return builderSchema as BaseBuilder
}

// export function builder<
//   T extends Omit<BaseSchemaDefinition, 'validations'> & {
//     validators: BaseValidatorLibrary
//   },
// >(schemaDefinition: T, validations?: ValidationFn<VInferSafeParse<T['parser']>>[]): Builder<T>
// export function builder(
//   schemaDefinition: Omit<BaseSchemaDefinition, 'validations'> & {
//     validators: BaseValidatorLibrary
//   },
//   validations: BaseValidationFn[],
// ): BaseBuilder
// export function builder(
//   schemaDefinition: Omit<BaseSchemaDefinition, 'validations'> & {
//     validators: BaseValidatorLibrary
//   },
//   validations: BaseValidationFn[] = [],
// ): BaseBuilder {
//   const builderSchema = createSchema({ ...schemaDefinition, validations }) as unknown as BaseBuilder
//   const { validators } = schemaDefinition
//   const keys = Object.keys(validators)
//   for (const key of keys) {
//     Object.defineProperty(builderSchema, key, {
//       value(...args) {
//         return builder(schemaDefinition, [
//           ...validations,
//           (validators[key] as BaseValidator)(...args),
//         ])
//       },
//     })
//   }
//   Object.defineProperty(builderSchema, validationsKey, {
//     get() {
//       return validations
//     },
//   })
//   return builderSchema
// }

// export function builder<
//   Validators extends BaseValidatorLibrary,
//   CreateSafeParseFn extends BuilderCreateSafeParseFn,
//   O = Validators extends ValidatorLibrary<infer X> ? X : never,
//   // BBuilder extends BaseBuilder = Builder<Validators, SParse>,
// >(
//   validators: Validators,
//   createSchemaFn: CreateSafeParseFn,
//   validations?: ValidationFn<O>[],
// ): Builder<Validators, ReturnType<CreateSafeParseFn>>
// export function builder(
//   validators: BaseValidatorLibrary,
//   createSchemaFn: BuilderCreateSafeParseFn,
//   validations: BaseValidationFn[] = [],
// ): BaseBuilder {
//   const newBuilder = function newBuilderFn(input: unknown, ...args: unknown[]) {
//     return createSchemaFn({ validations: newBuilder })(input, ...args)
//   } as unknown as BaseBuilder

//   Object.assign(newBuilder, {
//     get [validationsKey]() {
//       return validations
//     },
//     parse(input: unknown) {
//       return parse(newBuilder)(input)
//     },
//   })
//   const keys = Object.keys(validators)
//   for (const key of keys) {
//     Object.defineProperty(newBuilder, key, {
//       value(...args) {
//         return builder(validators, createSchemaFn, [
//           ...validations,
//           (validators[key] as BaseValidator)(...args),
//         ])
//       },
//     })
//   }
//   return newBuilder
// }
