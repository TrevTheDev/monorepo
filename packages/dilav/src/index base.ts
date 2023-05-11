/* eslint-disable import/order */
/* eslint-disable import/first */

import {
  vNaN,
  vUndefined,
  vNull,
  vNullish,
  vAny,
  vUnknown,
  vNever,
  vVoid,
  vNullishL,
} from './types/init'

export {
  vIntersection as intersection,
  vUnion as union,
  vOptional as optional,
  vNullable as nullable,
  vNullish as nullishable,
  vLiteral as literal,
  vArray as array,
  vObject as object,
  vPromise as promise,
  setGlobalErrorMessages,
  vNaNInstance as NaN,
  vUndefinedInstance as undefined,
  vNullInstance as null,
  vAnyInstance as any,
  vUnknownInstance as unknown,
  vNeverInstance as never,
  vVoidInstance as void,
  vNullishInstance as nullish,
} from './types/init'

export { vLazy as lazy } from './types/lazy'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * Types
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export type { VBoolean as Boolean } from './types/boolean'

export type { VBigInt as BigInt } from './types/bigint'

export type { VDate as Date } from './types/date'

export type { VEnum as Enum } from './types/enum'

// export type { VNativeEnum as NativeEnum } from './types/enum'

export type { VInstanceOf as InstanceOf } from './types/instanceof'

export type { VMap as Map } from './types/map'

export type { VSet as Set } from './types/set'

export type { VNumber as Number } from './types/number'

export type {
  ObjectDefinition,
  MinimumObjectDefinition,
  MinimumObjectSchema,
  VObject as Object,
  // VObjectBase as ObjectBase,
  VPreprocess as Preprocess,
  VPostProcess as PostProcess,
  VDefault as Default,
  VCatch as Catch,
  VUnion as Union,
  VOptional as Optional,
  VNullable as Nullable,
  VNullish as Nullish,
  ValidatedPromise,
  VPromise as Promise,
  VLiteral as Literal,
  VNaN,
  VUndefined as Undefined,
  VNull as Null,
  VNullishL as NullishL,
  VAny as Any,
  VUnknown as Unknown,
  VNever as Never,
  VVoid as Void,
  VIntersection as Intersection,
  MinimumArraySchema,
  ValidArrayItem,
  ValidArrayItems,
  MinimumArrayRestSchema,
  BaseArrayRestSchema,
  VArrayInfinite as ArrayInfinite,
  VArrayFinite as ArrayFinite,
  StratifiedSchemas,
  VInfer as Infer,
  MinimumSchema,
  SingleValidationError,
  ValidationErrors,
} from './types/types'

export type { VRecord as Record } from './types/record'

export type { VString as String } from './types/string'

export type { VSymbol as Symbol } from './types/symbol'

export type { VFunction as Function } from './types/function'

export type { VCustom as Custom } from './types/custom'

export type { SingleArrayValidationError } from './types/array'

export type { SingleObjectValidationError } from './types/object'

export type { VLazy as Lazy } from './types/lazy'

export type { ResultError } from '@trevthedev/toolbelt'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * Parsers and Validators
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export { vBooleanInstance as boolean } from './types/boolean'
import { vBoolean } from './types/boolean'

export { vBigIntInstance as bigInt } from './types/bigint'
import { vBigInt } from './types/bigint'

export { vDateInstance as date } from './types/date'
import { vDate } from './types/date'

export { vEnum as enum } from './types/enum'

// export { vNativeEnum as nativeEnum } from './types/enum'

export { vInstanceOf as instanceOf } from './types/instanceof'

export { vMap as map } from './types/map'

export { vSet as set } from './types/set'

export { vNumberInstance as number } from './types/number'
import { vNumber } from './types/number'

export { vRecord as record } from './types/record'

export { vStringInstance as string } from './types/string'
import { vString } from './types/string'

export { vSymbolInstance as symbol } from './types/symbol'
import { vSymbol } from './types/symbol'

export { default as ValidationError } from './types/Validation error'

export { vFunction as function } from './types/function'

export { vCustom as custom } from './types/custom'

export {
  firstError,
  firstErrorFromResultError,
  resultFromResultError,
  errorFromResultError,
} from './types/shared'

export { isError, isResult } from '@trevthedev/toolbelt'
// import { DefaultErrorFn } from './types/errorFns'

// export { parseSymbol, vSymbol, vSymbolInstance }

const customize = {
  undefined: vUndefined,
  null: vNull,
  nullish: vNullish,
  nullishL: vNullishL,
  any: vAny,
  unknown: vUnknown,
  never: vNever,
  void: vVoid,
  NaN: vNaN,
  symbol: vSymbol,
  boolean: vBoolean,
  bigInt: vBigInt,
  date: vDate,
  number: vNumber,
  string: vString,
}

export { customize }
