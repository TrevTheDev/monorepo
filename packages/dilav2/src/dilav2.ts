/* eslint-disable import/prefer-default-export */
import { isError, isResult } from '@trevthedev/toolbelt'
import {
  errorFromResultError,
  firstError,
  firstErrorFromErrors,
  resultFromResultError,
} from './shared'

// import { vObjectKnownProperties } from './types/object known properties'
// import { vObject } from './types/object'
import {
  vAny,
  vFalse,
  vLiteral,
  vNever,
  vNull,
  vTrue,
  vUndefined,
  vUnknown,
} from './types/literals'
import { vBoolean, vNumber, vString } from './types/typeof'
import { vUnionLiterals } from './types/union'

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

export const v = {
  string: vString,
  number: vNumber,
  boolean: vBoolean,
  // objectProperties: vObjectKnownProperties,
  // object: vObject,
  never: vNever,
  any: vAny,
  unknown: vUnknown,
  undefined: vUndefined,
  null: vNull,
  true: vTrue,
  false: vFalse,
  literal: vLiteral,
  literalUnion: vUnionLiterals,
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
