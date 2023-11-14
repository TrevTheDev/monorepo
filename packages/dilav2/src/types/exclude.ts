import { isError } from '@trevthedev/toolbelt'
import defaultErrorFn, { DefaultErrorFn } from '../shared/errorFns'
import { VInferType, VInfer } from '../shared/infer'
import { SafeParseOutput } from '../parsers/parsers'
import { BasicSchema2, MinimumSchema, SafeParseFn } from '../shared/schema'
import { CustomValidations, customValidations } from '../validations/validations'
import { vUndefined, vNull, vTrue, vFalse } from './literals'
import { vNaN } from './sundry types'
import { vBigInt, vBoolean, vFunction, vNumber, vObject, vString } from './typeof'
import { createBasicSchema3Broken } from '../shared/schema creator'

function parseTypeExcludes<T extends MinimumSchema, TO extends VInferType = VInfer<T>>(options: {
  parseExcludeError?: DefaultErrorFn['parseExcludeError']
  schemaToExclude: T
}): {
  parser: SafeParseFn<TO['output'], TO['input']>
  type: string
  validators: CustomValidations<TO['output']>
} {
  const { parseExcludeError, schemaToExclude } = options
  function parseTypeExcludesFn(input: TO['input']): SafeParseOutput<TO['output']> {
    const result = schemaToExclude(input)
    if (isError(result)) return [undefined, input as TO['output']]
    return [
      {
        input,
        errors: [(parseExcludeError ?? defaultErrorFn.parseExcludeError)(input, schemaToExclude)],
      },
      undefined,
    ]
  }
  return {
    parser: parseTypeExcludesFn,
    type: `not a ${schemaToExclude.type}`,
    validators: customValidations(),
  }
}

/**
 * TODO: typing is not complete
 */
export type ExcludeSchema = <
  T extends MinimumSchema,
  I extends VInferType = VInfer<T>,
>(createParserOption: {
  parseExcludeError?: DefaultErrorFn['parseExcludeError']
  schemaToExclude: T
}) => Omit<
  BasicSchema2<{
    output: unknown
    input: unknown
    args: []
    schemaType: 'exclude'
    type: string
    validators: CustomValidations<unknown>
  }>,
  'parse'
> & {
  <Input>(input: Input): SafeParseOutput<Exclude<Input, I['output']>>
  parse<Input>(input: Input): Exclude<Input, I['output']>
}

// {
//   <Input>(input: Input): SafeParseOutput<Exclude<Input, I['output']>>
//   readonly type: string
//   readonly schemaType: 'exclude'
//   parse<Input>(input: Input): Exclude<Input, I['output']>
//   toString(): string
//   readonly validators: CustomValidations<O>
// readonly builder: Builder<{
//   input: I['input']
//   output: O
//   args: []
//   type: string
//   schemaType: 'exclude'
//   validators: CustomValidations<O>
// }>
// }

export const vExcludeSchema = createBasicSchema3Broken({
  schemaType: 'exclude',
  createParser: parseTypeExcludes<MinimumSchema>,
}) as unknown as ExcludeSchema

export const vNotAString = vExcludeSchema({ schemaToExclude: vString })
export const vNotANumber = vExcludeSchema({ schemaToExclude: vNumber })
export const vNotABigInt = vExcludeSchema({ schemaToExclude: vBigInt })
export const vNotABoolean = vExcludeSchema({ schemaToExclude: vBoolean })
export const vNotAFunction = vExcludeSchema({ schemaToExclude: vFunction })
// TODO: update
export const vNotAnArray = vExcludeSchema({ schemaToExclude: vObject })
export const vNotAnObject = vExcludeSchema({ schemaToExclude: vObject })
export const vNotANaN = vExcludeSchema({ schemaToExclude: vNaN })
export const vNotUndefined = vExcludeSchema({ schemaToExclude: vUndefined })
export const vNotNull = vExcludeSchema({ schemaToExclude: vNull })
export const vNotTrue = vExcludeSchema({ schemaToExclude: vTrue })
export const vNotFalse = vExcludeSchema({ schemaToExclude: vFalse })
