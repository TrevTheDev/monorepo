/* eslint-disable @typescript-eslint/no-explicit-any */
import { polyadicFnToMonadicObjectFn } from '@trevthedev/toolbelt'
import type { MinimumBuilder, BuilderValidations } from './builder'
import { createSchema } from './create schema'
import {
  SchemaTypes,
  BaseSchemaDefinition,
  MinimumSchema,
  MinimumSchemaProtoType,
  TypedMinimumSchema,
  VOptional,
} from './schema'
import { parse } from './shared'

import {
  BaseValidations,
  BaseValidatorLibrary,
  ValidationFn,
  Validations,
  validationsKey,
} from '../validations/validations'
// import { vOptional } from '../types/union'
import type { VOptionalFn } from '../types/union'

// export function appendDefaultSchemaProto<
//   O,
//   I,
//   Args extends unknown[],
//   SchemaType extends SchemaTypes,
//   Type extends string,
//   BuilderObj extends MinimumBuilder,
//   Validators extends ValidatorLibrary<O>,
// >(
//   schemaDef: {
//     prototype: undefined
//     schemaType: SchemaType
//     type: Type
//     parser: SafeParseFn<O, I, Args>
//     breakOnFirstError: boolean
//     validators?: Validators
//     builder?: object
//   },
//   otherOptions?: {
//     createBuilder?: () => BuilderObj
//     includeValidations?: boolean
//   },
// ): {
//   output: O
//   input: I
//   args: Args
//   schemaType: SchemaType
//   type: Type
//   builder: BuilderObj
//   other: object
//   validators: Validators
// } extends infer T extends SchemaTType
//   ? SchemaPrototype<T>
//   : never

let vOptional: VOptionalFn

// export default function appendDefaultSchemaProto(
//   schemaDef: Omit<BaseSchemaDefinition, 'prototype'> & {
//     prototype: undefined
//     validators?: BaseValidatorLibrary
//     builder?: object
//   },
//   otherOptions: {
//     createBuilder?: () => MinimumBuilder
//     includeValidations?: boolean
//   } = {},
// ): BaseSchemaDefinition {
//   const { type, schemaType, validators, validations = [], builder: builderSchema } = schemaDef
//   const { createBuilder, includeValidations = false } = otherOptions
//   const schemaPrototype = {
//     get type(): string {
//       return type
//     },

//     get schemaType(): SchemaTypes {
//       return schemaType
//     },

//     parse(input) {
//       return parse(this as unknown as MinimumSchema)(input)
//     },

//     toString(): string {
//       return `schema:${schemaType}:${type}`
//     },
//   }
//   if (createBuilder)
//     Object.defineProperty(schemaPrototype, 'builder', {
//       get() {
//         return createBuilder()
//       },
//     })
//   else if (builderSchema) {
//     Object.defineProperty(schemaPrototype, 'builder', {
//       get() {
//         return builderSchema
//       },
//     })
//   }
//   if (validators)
//     Object.defineProperties(schemaPrototype, {
//       validators: {
//         get() {
//           return validators
//         },
//       },
//     })
//   if (includeValidations)
//     Object.defineProperties(schemaPrototype, {
//       validations: {
//         value(additionalValidations: BuilderValidations<unknown> | ValidationFn<unknown>[]) {
//           const oldValidations =
//             validationsKey in validations ? validations[validationsKey] : validations
//           const newValidations =
//             validationsKey in additionalValidations
//               ? [...oldValidations, ...additionalValidations[validationsKey]]
//               : [...oldValidations, ...additionalValidations]

//           return createSchema({
//             ...(schemaDef as unknown as BaseSchemaDefinition),
//             validations: newValidations,
//           })
//         },
//       },
//     })
//   ;(schemaDef as unknown as BaseSchemaDefinition).prototype = schemaPrototype
//   return schemaDef as unknown as BaseSchemaDefinition
// }

function createSchemaBase<
  T extends {
    output: any
    input: any
    args: unknown[]
    schemaType: SchemaTypes
    type: string
  },
>(schemaType: T['schemaType'], type: T['type']): TypedMinimumSchema<T>
function createSchemaBase(
  schemaType: SchemaTypes,
  type: string,
): MinimumSchemaProtoType & ThisType<MinimumSchema> {
  return {
    get type(): string {
      return type
    },

    get schemaType(): SchemaTypes {
      return schemaType
    },

    parse(this, input) {
      return parse(this)(input)
    },

    toString(): string {
      return `schema:${schemaType}:${type}`
    },
  }
}

function appendBuilderViaCreateBuilderFn<
  T extends MinimumSchemaProtoType,
  Builder extends MinimumBuilder,
>(prototype: T, createBuilder: () => Builder): T & { readonly builder: Builder }
function appendBuilderViaCreateBuilderFn(
  prototype: MinimumSchemaProtoType,
  createBuilder: () => MinimumBuilder,
): MinimumSchemaProtoType {
  return Object.defineProperty(prototype, 'builder', {
    get() {
      return createBuilder()
    },
  })
}

function appendBuilder2<T extends MinimumSchemaProtoType, Builder extends MinimumBuilder>(
  prototype: T,
  builderSchema: Builder,
): T & { readonly builder: Builder }
function appendBuilder2(
  prototype: MinimumSchemaProtoType,
  builderSchema: object,
): MinimumSchemaProtoType {
  return Object.defineProperty(prototype, 'builder', {
    get() {
      return builderSchema
    },
  })
}

function appendValidators<
  T extends MinimumSchemaProtoType,
  Validators extends BaseValidatorLibrary,
>(prototype: T, validators: Validators): T & { readonly validators: Validators }
function appendValidators(
  prototype: MinimumSchemaProtoType,
  validators: BaseValidatorLibrary,
): MinimumSchemaProtoType {
  return Object.defineProperty(prototype, 'validators', {
    get() {
      return validators
    },
  })
}

// function appendValidations<
//   T extends MinimumSchema,
//   S extends VInferSafeParseType = VInferSafeParse<T>,
// >(
//   prototype: T,
//   validations: BaseValidations,
//   createSchemaFn: (newValidations: BaseValidations) => T,
// ): T & {
//   validations(validations: BuilderValidations<S['output']> | ValidationFn<S['output']>[]): T
// }

function appendValidations<
  T extends MinimumSchemaProtoType,
  V extends BaseValidations,
  O = V extends Validations<infer S> ? S : never,
>(
  prototype: T,
  validations: V,
  createSchemaFn: (newValidations: BaseValidations) => MinimumSchema,
): T & {
  validations(validations: BuilderValidations<O> | ValidationFn<O>[]): MinimumSchema
}
function appendValidations(
  prototype: MinimumSchemaProtoType,
  validations: BaseValidations,
  createSchemaFn: (newValidations: BaseValidations) => MinimumSchema,
): MinimumSchemaProtoType {
  return Object.defineProperty(prototype, 'validations', {
    value(additionalValidations: BuilderValidations<unknown> | ValidationFn<unknown>[]) {
      const oldValidations =
        validationsKey in validations ? validations[validationsKey] : validations
      const newValidations =
        validationsKey in additionalValidations
          ? [...oldValidations, ...additionalValidations[validationsKey]]
          : [...oldValidations, ...additionalValidations]

      return createSchemaFn(newValidations)
    },
  })
}
function appendOptional<T extends MinimumSchema>(
  prototype: T,
): T & {
  optional(): VOptional<T>
}
function appendOptional<T extends MinimumSchemaProtoType>(
  prototype: T,
): T & {
  optional(): MinimumSchema
}
function appendOptional(prototype: MinimumSchemaProtoType): MinimumSchemaProtoType {
  return Object.defineProperty(prototype, 'optional', {
    value(this: MinimumSchema) {
      return vOptional(this)
    },
  })
}

const prototypeBase = polyadicFnToMonadicObjectFn(createSchemaBase, ['schemaType', 'type'])

export function appendMinimumSchemaPrototype(
  schemaDef: Omit<BaseSchemaDefinition, 'prototype'> & {
    prototype: undefined
  },
): BaseSchemaDefinition {
  ;(schemaDef as unknown as BaseSchemaDefinition).prototype = prototypeBase(schemaDef)
  return schemaDef as unknown as BaseSchemaDefinition
}

function appendSchemaPrototype1(
  schemaDef: Omit<BaseSchemaDefinition, 'prototype'> & {
    prototype: undefined
  },
): BaseSchemaDefinition {
  const updatedSchemaDef = appendMinimumSchemaPrototype(schemaDef)
  appendOptional(updatedSchemaDef.prototype)
  return updatedSchemaDef
}

function appendSchemaPrototype2(
  schemaDef: Omit<BaseSchemaDefinition, 'prototype'> & {
    prototype: undefined
    validators: BaseValidatorLibrary
  },
): BaseSchemaDefinition {
  const updatedSchemaDef = appendSchemaPrototype1(schemaDef)
  appendValidators(updatedSchemaDef.prototype, schemaDef.validators)
  return updatedSchemaDef
}

export function appendSchemaPrototypeBuilder(
  schemaDef: Omit<BaseSchemaDefinition, 'prototype'> & {
    prototype: undefined
    // validators: BaseValidatorLibrary
    builder: MinimumBuilder
  },
): BaseSchemaDefinition {
  const updatedSchemaDef = appendSchemaPrototype1(schemaDef)
  appendBuilder2(updatedSchemaDef.prototype, schemaDef.builder)
  return updatedSchemaDef
}

// function appendSchemaPrototypeBuilderValidations(
//   schemaDef: Omit<BaseSchemaDefinition, 'prototype'> & {
//     prototype: undefined
//     validators: BaseValidatorLibrary
//     builder: MinimumBuilder
//   },
// ): BaseSchemaDefinition {
//   const { validations = [] } = schemaDef
//   const updatedSchemaDef = appendSchemaPrototypeBuilder(schemaDef)
//   function addValidationsFn(updatedValidations) {
//     return createSchema({
//       ...schemaDef,
//       validations: updatedValidations,
//     } as unknown as BaseSchemaDefinition)
//   }
//   appendValidations(updatedSchemaDef.prototype, validations, addValidationsFn)
//   return updatedSchemaDef
// }

function appendDefaultSchemaProtoCreateBuilder(
  schemaDef: Omit<BaseSchemaDefinition, 'prototype'> & {
    prototype: undefined
    validators: BaseValidatorLibrary
  },
  otherOptions: {
    createBuilder: () => MinimumBuilder
  },
): BaseSchemaDefinition {
  const updatedSchemaDef = appendSchemaPrototype2(schemaDef)
  appendBuilderViaCreateBuilderFn(updatedSchemaDef.prototype, otherOptions.createBuilder)
  return updatedSchemaDef
}

export function appendDefaultSchemaProtoCreateBuilderValidations(
  schemaDef: Omit<BaseSchemaDefinition, 'prototype'> & {
    prototype: undefined
    validators: BaseValidatorLibrary
  },
  otherOptions: {
    createBuilder: () => MinimumBuilder
  },
): BaseSchemaDefinition {
  const { validations = [] } = schemaDef
  const updatedSchemaDef = appendDefaultSchemaProtoCreateBuilder(schemaDef, otherOptions)
  function addValidationsFn(updatedValidations) {
    return createSchema({
      ...schemaDef,
      validations: updatedValidations,
    } as unknown as BaseSchemaDefinition)
  }
  appendValidations(updatedSchemaDef.prototype, validations, addValidationsFn)
  return updatedSchemaDef
}

export function injectSchemaProtoTypeDependencies(optional: VOptionalFn) {
  vOptional = optional
}
