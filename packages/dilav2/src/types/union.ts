import { BaseBuilder, builder } from '../builder'
import defaultErrorFn, { DefaultErrorFn } from '../errorFns'
import { SafeParseOutput } from '../parsers/parsers'
import {
  addDefaultCreateSchemaPrototype,
  BaseSchemaCreatorDefinition,
  BaseSchemaDefinition,
  SafeParseFn,
  Schema,
  SchemaPrototype,
} from '../schema'
import { createCreateSchemaFunction } from '../schema creator'
import { BaseValidationFn, customValidations } from '../validations/validations'

type LiteralUnionType = [unknown, ...unknown[]]
// eslint-disable-next-line import/prefer-default-export
export function vUnionLiterals<const T extends Readonly<LiteralUnionType>, O = T[number]>(options: {
  literals: T
  noMatchFoundInLiteralUnionError?: DefaultErrorFn['noMatchFoundInLiteralUnionError']
}): Schema<O, unknown, [], SchemaPrototype<O, unknown, 'literal union', string>> {
  const { literals, noMatchFoundInLiteralUnionError } = options
  const parser: SafeParseFn<O, unknown, []> = function parserFn(
    value: unknown,
  ): SafeParseOutput<O> {
    if (literals.includes(value)) return [undefined, value as O]
    return [
      {
        input: value,
        errors: [
          (noMatchFoundInLiteralUnionError ?? defaultErrorFn.noMatchFoundInLiteralUnionError)(
            value,
            literals,
          ),
        ],
      },
    ]
  }
  const validators = customValidations<O>()
  const x2 = {
    schemaType: 'literal union' as const,
    type: literals.map((value) => JSON.stringify(value)).join('|'),
    getSchemaDefinitionFn(opts: object, partialBaseSchemaDef: BaseSchemaDefinition) {
      partialBaseSchemaDef.parser = parser
      return partialBaseSchemaDef as {
        schemaCreatorDef: BaseSchemaCreatorDefinition
        schemaPrototype: Schema<
          O,
          unknown,
          [],
          SchemaPrototype<O, unknown, 'literal union', string>
        >
        parser: SafeParseFn<O, unknown, []>
        type: string
        validations?: BaseValidationFn[] | BaseBuilder
        breakOnFirstError: boolean
        // wrappedType?: MinimumSchema
      }
    },
    builder: builder(validators),
    createSchemaPrototype: {},
    validators,
  } satisfies BaseSchemaCreatorDefinition
  const x1 = addDefaultCreateSchemaPrototype(x2)

  const x = createCreateSchemaFunction(x1)
  const y = x()
  return y
}
