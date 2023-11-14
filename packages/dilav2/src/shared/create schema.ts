import { isError } from '@trevthedev/toolbelt'
import type {
  BaseSchemaDefinition,
  BaseSafeParseFn,
  SchemaDefinitionToSchema,
  MinimumSchema,
  SafeParseOutput,
} from './schema'
import { validate, type BaseValidations } from '../validations/validations'

export type CreateSchema = typeof createSchema

/**
 * Given a schemaDefinition, this function returns a new schema
 * that handles any validations provided as input and assigns
 * the supplied prototype to the schema
 * @param schemaDefinition
 */
export function createSchema<const T extends BaseSchemaDefinition>(
  schemaDefinition: T,
): SchemaDefinitionToSchema<T>
export function createSchema(schemaDefinition: BaseSchemaDefinition): MinimumSchema {
  const { parser, validations, prototype } = schemaDefinition
  let safeParser: BaseSafeParseFn
  if (validations === undefined) {
    safeParser = function safeParserFn(...args) {
      return parser(...args)
    }
  } else {
    const validationFn = validate(
      schemaDefinition as {
        validations: BaseValidations
      },
    )

    safeParser = function safeParserFn(input, ...args): SafeParseOutput<unknown> {
      const parsedOutput = parser(input, ...args)
      if (isError(parsedOutput)) return parsedOutput
      const errors = validationFn(parsedOutput[1])
      return errors !== undefined ? [{ input, errors }, undefined] : parsedOutput
    }
  }

  Object.setPrototypeOf(safeParser, prototype)
  return safeParser as MinimumSchema
}
