// /* eslint-disable no-restricted-syntax */
// /* eslint-disable no-shadow */
// import { isError, isResult } from '../toolbelt'

// import { createFinalBaseObject } from './base'
// import {
//   SafeParseFn,
//   BaseSchema,
//   defaultErrorFnSym,
//   ValidationErrors,
//   VInfer,
//   PropertySchemasDef,
//   SafeParseOutput,
//   VUnionOutput,
//   UnionSchemas,
//   MinimumSchema,
//   ObjectUnionSchemas,
//   MinimumObjectSchema,
//   SingleValidationError,
//   groupBaseTypes,
//   BaseTypes,
// } from './types'

// import { baseObject } from './init'
// import { DefaultErrorFn } from './errorFns'
// import { isObjectType } from './shared'
// import { parsePropertySchemas } from './object'
// import { union } from '../index base'

// const errorFns: DefaultErrorFn = baseObject[defaultErrorFnSym]

// // interface DiscriminatedUnionParserOptions
// //   extends Partial<
// //     Pick<
// //       DefaultErrorFn,
// //       | 'parseObject'
// //       | 'keyNotFoundInDiscriminatedUnionDef'
// //       | 'noKeyMatchFoundInDiscriminatedUnion'
// //       | 'noMatchFoundInDiscriminatedUnion'
// //       | 'discriminatedUnionValueIsNotAnObject'
// //     >
// //   > {
// //   type?: string
// //   oneMatchOnly?: boolean
// // }

// // interface DiscriminatedUnionOptions<Output> extends DiscriminatedUnionParserOptions {
// //   parser?: SafeParseFn<Output>
// // }

// // function parseDiscriminatedUnion<
// //   T extends UnionSchemas,
// //   Output extends object = {
// //     [K in keyof T]: VInfer<T[K]>
// //   }[number],
// // >(
// //   matches: PropertySchemasDef,
// //   schemasIfMatch: T,
// //   options: DiscriminatedUnionParserOptions = {},
// // ): SafeParseFn<Output> {
// //   const matchSchemaParser = parsePropertySchemas(matches, { breakOnFirstError: true })
// //   return function ParseDiscriminatedUnion(value: unknown): SafeParseOutput<Output> {
// //     if (!isObjectType(value)) {
// //       return [
// //         {
// //           input: value,
// //           errors: [(options.parseObject ?? errorFns.parseObject)(value, 'object')],
// //         },
// //         undefined,
// //       ]
// //     }
// //     const parseKeyResult = matchSchemaParser(value)
// //     if (isError(parseKeyResult)) return parseKeyResult as [ValidationErrors]
// //     const errors: string[] = []
// //     for (const schema of schemasIfMatch) {
// //       const result = schema.safeParse(value)
// //       if (isResult(result)) return result
// //       errors.push(...result[0].errors)
// //     }
// //     return errors.length === 0
// //       ? [
// //           {
// //             input: value,
// //             errors: [
// //               (
// //                 options.noMatchFoundInDiscriminatedUnion ??
// //                 errorFns.noMatchFoundInDiscriminatedUnion
// //               )(value, schemasIfMatch as any),
// //             ],
// //           },
// //           undefined,
// //         ]
// //       : [
// //           {
// //             input: value,
// //             errors,
// //           },
// //           undefined,
// //         ]
// //   }
// // }

// // export interface VDUnion<
// //   T extends UnionSchemas,
// //   Output = VUnionOutput<T>,
// //   Type extends string = string,
// //   Input = unknown,
// // > extends BaseSchema<
// //     Output,
// //     Type,
// //     'union',
// //     Input,
// //     { readonly unionTypes: T; readonly transformed: boolean }
// //   > {
// //   readonly definition: { readonly unionTypes: T; readonly transformed: boolean }
// // }

// /**
//  * basicParseUnion
//  * schemas: T,
//   noMatchFoundInDiscriminatedUnion?: DefaultErrorFn['noMatchFoundInDiscriminatedUnion'],
//  *
//  * advancedParseDiscriminatingUnion
//   matches: PropertySchemasDef,
//   schemasIfMatch: T,
//   noMatchFoundInDiscriminatedUnion?: DefaultErrorFn['noMatchFoundInDiscriminatedUnion'],

// basicParseDiscriminatingUnion
//   key: PropertyKey,
//   schemas: T,
//   options: {
//     noMatchFoundInDiscriminatedUnion?: DefaultErrorFn['noMatchFoundInDiscriminatedUnion']
//     keyNotFoundInDiscriminatedUnionDef?: DefaultErrorFn['keyNotFoundInDiscriminatedUnionDef']
//     oneMatchOnly?: boolean
//   } = {},

// parseLiteralUnion
//   literalUnionDef: T,
//   parseLiteralUnionFn?: DefaultErrorFn['parseLiteralUnion'],
//  */

// union()
// union.literals()
// union.key()
// union.advanced()
