// const x = 'a'
// function foo(a) {
//   if (a) {
//     return new Bar()
//   } else {
//     process.exit(1)
//   }
// }

import { isError, isResult } from '@trevthedev/toolbelt'
import {
  errorFromResultError,
  firstError,
  firstErrorFromErrors,
  resultFromResultError,
} from './shared/shared'

// import { vObjectKnownProperties } from './types/object known properties'
// import { vObject } from './types/object'
import { vAny, vFalse, vLiteral, vNull, vTrue, vUndefined, vUnknown } from './types/literals'
import { vBigInt, vBoolean, vNumber, vString } from './types/typeof'
import { vOptional, vUnion, vUnionLiterals } from './types/union'
import { vNever } from './types/sundry types'
import {
  vNotAString as notAString,
  vNotANumber as notANumber,
  vNotABigInt as notABigInt,
  vNotABoolean as notABoolean,
  vNotAFunction as notAFunction,
  vNotAnArray as notAnArray,
  vNotAnObject as notAnObject,
  vNotANaN as notANaN,
  vNotUndefined as notUndefined,
  vNotNull as notNull,
  vNotTrue as notTrue,
  vNotFalse as notFalse,
} from './types/exclude'
import { vObject } from './types/object'
import { vObjectKnownProperties } from './types/object known properties'

// type VCoerceString = CreateSchema<
//   string,
//   unknown,
//   [],
//   GetOptions<typeof parsers.coerceString>,
//   object,
//   SchemaPrototype<string, unknown, 'coerced string', 'string'>
// >

// export type GetOptions<T extends (options?: { [x: string]: any }) => any> = Exclude<
//   Parameters<T>[0],
//   undefined
// > extends infer X extends object
//   ? X
//   : object

// type Z = GetOptions<typeof parsers.coerceString>

// type VString = CreateSchema<
//   string,
//   unknown,
//   [],
//   GetOptions<typeof parsers.string>,
//   SharedCreateSchemaProperties<typeof stringValidations> & {
//     coerce: VCoerceString
//   },
//   SchemaPrototype<string, unknown, 'string', 'string'>
// >

// const vCoerceString = schemaCreator({
//   createParserFn: () => parsers.coerceString,
//   schemaProtoType: sharedSchemaProperties<string, unknown, 'coerced string', 'string'>({
//     type: 'string',
//     schemaType: 'coerced string',
//   }),
// })

// type VCoerceNumber = CreateSchema<
//   number,
//   unknown,
//   [],
//   GetOptions<typeof parsers.coerceNumber>,
//   object,
//   SchemaPrototype<number, unknown, 'coerced number', 'number'>
// >

// type VNumber = CreateSchema<
//   number,
//   unknown,
//   [],
//   GetOptions<typeof parsers.number>,
//   SharedCreateSchemaProperties<typeof numberValidations> & {
//     coerce: VCoerceNumber
//   },
//   SchemaPrototype<number, unknown, 'number', 'number'>
// >

// const vCoerceNumber = schemaCreator({
//   createParserFn: parsers.coerceNumber,
//   createSchemaPrototype: sharedCreateSchemaProperties({
//     validators: numberValidations,
//   }),
//   schemaProtoType: sharedSchemaProperties<number, unknown, 'coerced number', 'number'>({
//     type: 'number',
//     schemaType: 'coerced number',
//   }),
// })

// eslint-disable-next-line import/prefer-default-export
export const v = {
  string: vString,
  number: vNumber,
  boolean: vBoolean,
  bigint: vBigInt,
  objectProperties: vObjectKnownProperties,
  object: vObject,
  never: vNever,
  any: vAny,
  unknown: vUnknown,
  undefined: vUndefined,
  null: vNull,
  true: vTrue,
  false: vFalse,
  literal: vLiteral,
  literalUnion: vUnionLiterals,
  union: vUnion,
  optional: vOptional,
  notAString,
  notANumber,
  notABigInt,
  notABoolean,
  notAFunction,
  notAnArray,
  notAnObject,
  notANaN,
  notUndefined,
  notNull,
  notTrue,
  notFalse,
  // objectProperties: schemaCreator({
  //   createParserFn: parsers.parseProperties,
  //   validators: objectValidations,
  //   createSchemaPrototype: Object.defineProperty(
  //     sharedCreateSchemaProperties({
  //       validators: objectValidations,
  //     }),
  //     'object',
  //     {
  //       get() {
  //         return 'vCoerceNumber'
  //       },
  //     },
  //   ),
  //   schemaProtoType: sharedSchemaProperties<'object', 'object', object, unknown>({
  //     type: 'object',
  //     schemaType: 'object',
  //   }),
  // }) as VObject,
  isError,
  isResult,
  firstError,
  firstErrorFromErrors,
  resultFromResultError,
  errorFromResultError,
}
