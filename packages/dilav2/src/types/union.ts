import { isResult } from '@trevthedev/toolbelt'
import defaultErrorFn, { DefaultErrorFn } from '../shared/errorFns'

import { SafeParseOutput } from '../parsers/parsers'
import { createBasicSchema2 } from '../shared/schema creator'
import {
  CustomValidations,
  SingleValidationError,
  customValidations,
} from '../validations/validations'
import {
  BasicSchema2,
  MinimumObjectSchema,
  MinimumSchema,
  SafeParseFn,
  UnionSchemas,
  VNull,
  VNullable,
  VOptional,
  VUndefined,
  VUnionOutput,
  groupedSchemaTypes,
} from '../shared/schema'
import { vNull, vUndefined } from './literals'
import { isObjectType } from '../shared/shared'

export type LiteralUnionType = [unknown, ...unknown[]]

/**
 * compares `input` to provided `literals` array using `literals.includes(input)`
 * @param options
 * @returns
 */
export function vUnionLiterals<const T extends Readonly<LiteralUnionType>, O = T[number]>(
  literals: T,
  options: {
    noMatchFoundInLiteralUnionError?: DefaultErrorFn['noMatchFoundInLiteralUnionError']
  } = {},
): BasicSchema2<{
  output: O
  input: unknown
  args: []
  schemaType: 'literal union'
  type: string
  validators: CustomValidations<O>
}> {
  const { noMatchFoundInLiteralUnionError } = options
  function parser(input: unknown): SafeParseOutput<O> {
    return literals.includes(input)
      ? [undefined, input as O]
      : [
          {
            input,
            errors: [
              (noMatchFoundInLiteralUnionError ?? defaultErrorFn.noMatchFoundInLiteralUnionError)(
                input,
                literals,
              ),
            ],
          },
        ]
  }
  return createBasicSchema2({
    parser,
    type: literals.map((value) => JSON.stringify(value)).join('|'),
    schemaType: 'literal union' as const,
    validators: customValidations<O>(),
  })
}

function schemasToTypeString(schemas: MinimumSchema[]) {
  let typeString = ''
  for (const schema of schemas) {
    typeString = `${typeString}${
      groupedSchemaTypes.includes(schema.schemaType) ? `(${schema.type})` : schema.type
    }|`
  }
  return typeString.slice(0, -1)
}

function createUnionParser<const T extends UnionSchemas, O = VUnionOutput<T>>(options: {
  schemas: T
  noMatchFoundInUnionError?: DefaultErrorFn['noMatchFoundInUnionError']
}) {
  const { schemas, noMatchFoundInUnionError } = options
  return function UnionParser(input: unknown): SafeParseOutput<O> {
    const errors: SingleValidationError[] = []
    for (const schema of schemas) {
      const result = schema(input)
      if (isResult(result)) return result
      errors.push(...result[0].errors)
    }

    return [
      {
        input,
        // eslint-disable-next-line no-nested-ternary
        errors: noMatchFoundInUnionError
          ? [noMatchFoundInUnionError(input, schemas)]
          : errors.length === 0
          ? [(noMatchFoundInUnionError ?? defaultErrorFn.noMatchFoundInUnionError)(input, schemas)]
          : errors,
      },
    ]
  }
}

export function vUnion<const T extends UnionSchemas, O = VUnionOutput<T>>(
  schemas: T,
  options: {
    noMatchFoundInUnionError?: DefaultErrorFn['noMatchFoundInUnionError']
  } = {},
): BasicSchema2<{
  output: O
  input: unknown
  args: []
  schemaType: 'union'
  type: string
  validators: CustomValidations<O>
}> {
  return createBasicSchema2({
    parser: createUnionParser({ schemas, ...options }),
    type: schemasToTypeString(schemas),
    schemaType: 'union',
    validators: customValidations<O>(),
  })
}

export type VOptionalFn = typeof vOptional
export function vOptional<const T extends MinimumSchema>(
  schema: T,
  options: {
    optionalParseError?: (input: unknown) => SingleValidationError
  } = {},
): VOptional<T> {
  const { optionalParseError } = options
  const schemas = [schema, vUndefined] as [T, VUndefined]
  const optionalSchema = createBasicSchema2({
    parser: createUnionParser({
      schemas,
      ...(optionalParseError ? { noMatchFoundInUnionError: optionalParseError } : {}),
    }),
    type: schemasToTypeString(schemas),
    schemaType: 'optional',
    validators: customValidations<unknown>(),
  })
  return Object.defineProperties(optionalSchema, {
    optional: {
      value() {
        return optionalSchema
      },
    },
    require: {
      value() {
        return schema
      },
    },
    wrappedSchema: {
      get() {
        return schema
      },
    },
  })
}

export type VNullableFn = typeof vNullable
export function vNullable<const T extends MinimumSchema>(
  schema: T,
  options: {
    nullableParseError?: (input: unknown) => SingleValidationError
  } = {},
): VNullable<T> {
  const { nullableParseError } = options
  const schemas = [schema, vNull] as [T, VNull]
  const nullableSchema = createBasicSchema2({
    parser: createUnionParser({
      schemas,
      ...(nullableParseError ? { noMatchFoundInUnionError: nullableParseError } : {}),
    }),
    type: schemasToTypeString(schemas),
    schemaType: 'nullable',
    validators: customValidations<unknown>(),
  })
  return Object.defineProperties(nullableSchema, {
    wrappedSchema: {
      get() {
        return schema
      },
    },
  })
}

export type VNullishFn = typeof vNullish
export function vNullish<const T extends MinimumSchema>(
  schema: T,
  options: {
    nullishParseError?: (input: unknown) => SingleValidationError
  } = {},
): VNullable<T> {
  const { nullishParseError } = options
  const schemas = [schema, vUndefined, vNull] as [T, VUndefined, VNull]
  const nullishSchema = createBasicSchema2({
    parser: createUnionParser({
      schemas,
      ...(nullishParseError ? { noMatchFoundInUnionError: nullishParseError } : {}),
    }),
    type: schemasToTypeString(schemas),
    schemaType: 'nullish',
    validators: customValidations<unknown>(),
  })
  return Object.defineProperties(nullishSchema, {
    wrappedSchema: {
      get() {
        return schema
      },
    },
  })
}

export type ObjectUnionSchemas = [MinimumObjectSchema, ...MinimumObjectSchema[]]

function matchFnOnKey<T extends ObjectUnionSchemas>(
  key: PropertyKey,
  schemas: T,
  options: {
    keyNotFoundInDiscriminatedUnionDefError?: DefaultErrorFn['keyNotFoundInDiscriminatedUnionDefError']
    oneMatchOnly?: boolean
  } = {},
): (value: unknown) => MinimumObjectSchema[] {
  for (const schema of schemas) {
    const { propertySchemas } = schema
    const keySchema = propertySchemas[key]
    if (keySchema === undefined) {
      throw new Error(
        (
          options.keyNotFoundInDiscriminatedUnionDefError ??
          defaultErrorFn.keyNotFoundInDiscriminatedUnionDefError
        )(key, schema.type),
      )
    }
  }
  return function MatchFnOnKeyFn(value: unknown): MinimumObjectSchema[] {
    const matchedSchemas = [] as MinimumObjectSchema[]
    if (!isObjectType(value)) return matchedSchemas
    for (const schema of schemas) {
      const result = (schema.propertySchemas[key] as MinimumSchema)(value[key])
      if (isResult(result)) {
        matchedSchemas.push(schema)
        if (options.oneMatchOnly ?? false) return matchedSchemas
      }
    }
    return matchedSchemas
  }
}

function parseUnion_<
  T extends MinimumSchema[],
  Output extends T extends UnionSchemas ? VUnionOutput<T> : never,
>(
  getSchemasFn: (value: unknown) => T,
  parseSchemasFn: (schemas: T, value: unknown) => SafeParseOutput<Output>,
): SafeParseFn<Output> {
  return function ParseDiscriminatedUnion2(value: unknown): SafeParseOutput<Output> {
    return parseSchemasFn(getSchemasFn(value), value)
  }
}

export function parseUnionKey<T extends ObjectUnionSchemas, Output extends VUnionOutput<T>>(
  key: PropertyKey,
  schemas: T,
  options: {
    noMatchFoundInUnionError?: DefaultErrorFn['noMatchFoundInUnionError']
    keyNotFoundInDiscriminatedUnionDefError?: DefaultErrorFn['keyNotFoundInDiscriminatedUnionDefError']
    oneMatchOnly?: boolean
  } = {},
): SafeParseFn<Output> {
  const parseSchemasFn = createUnionParser(options.noMatchFoundInUnionError)
  return parseUnion_(matchFnOnKey(key, schemas, options), parseSchemasFn)
}

function matchFnOnPropSchemaDef<T extends MinimumSchema[]>(
  matches: PropertySchemasDef,
  schemas: T,
): (value: unknown) => MinimumSchema[] {
  const parser = parsePropertySchemas(matches)
  return function MatchFnOnKey(value: unknown): MinimumSchema[] {
    if (!isObjectType(value)) return [] as MinimumSchema[]
    return isResult(parser(value)) ? schemas : ([] as MinimumSchema[])
  }
}

function parseUnionAdvanced<T extends UnionSchemas, Output extends VUnionOutput<T>>(
  matches: PropertySchemasDef,
  schemasIfMatch: T,
  noMatchFoundInUnionError?: DefaultErrorFn['noMatchFoundInUnionError'],
): SafeParseFn<Output> {
  const parseSchemasFn = createUnionParser(noMatchFoundInUnionError)
  return parseUnion_(matchFnOnPropSchemaDef(matches, schemasIfMatch), parseSchemasFn)
}
