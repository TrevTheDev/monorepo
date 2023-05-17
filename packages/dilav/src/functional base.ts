import { isError, isResult } from './toolbelt'
import { setGlobalErrorMessages } from './types/init'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * Parsers and Validators
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

import {
  parseArray,
  minimumArrayLength,
  maximumArrayLength,
  requiredArrayLength,
  nonEmpty,
} from './types/array'

import { parseBoolean, coerceBoolean, beTrue, beFalse } from './types/boolean'

import {
  parseBigInt,
  coerceBigInt,
  greaterThan as bigintGreaterThan,
  greaterThanOrEqualTo as bigintGreaterThanOrEqualTo,
  lesserThan as bigintLesserThan,
  lesserThanOrEqualTo as bigintLesserThanOrEqualTo,
  integer as bigintInteger,
  positive as bigintPositive,
  nonNegative as bigintNonNegative,
  negative as bigintNegative,
  nonPositive as bigintNonPositive,
} from './types/bigint'

import { parseDate, after, before, coerceDate } from './types/date'

import { parseInstanceOf } from './types/instanceof'

import { parseIntersection } from './types/intersection'

import { parseLiteral } from './types/literal'

import {
  parseMap,
  minimumMapLength,
  maximumMapLength,
  requiredMapLength,
  nonEmpty as nonEmptyMap,
} from './types/map'

import {
  parseSet,
  minimumSetLength,
  maximumSetLength,
  requiredSetLength,
  nonEmpty as nonEmptySet,
} from './types/set'

import {
  parseNumber,
  coerceNumber,
  greaterThan,
  greaterThanOrEqualTo,
  lesserThan,
  lesserThanOrEqualTo,
  integer,
  positive,
  nonNegative,
  negative,
  nonPositive,
  notNaN,
  multipleOf,
  finite,
  safe,
} from './types/number'

import { parseObject } from './types/object'

import { parsePromise } from './types/promise'

import { parseRecord } from './types/record'

import {
  parseString,
  coerceString,
  minimumStringLength,
  maximumStringLength,
  exactStringLength,
  notEmptyString,
  beOneOf,
  validateAgainstRegex,
  validEmail,
  validCuid,
  validCuid2,
  validUuid,
  validURL,
  validUlid,
  validEmoji,
  validIpv4,
  validIpv6,
  validIp,
  validDateTime,
  includes,
  startsWith,
  endsWith,
} from './types/string'

import { parseUnion, parseUnionKey, parseUnionLiteral, parseUnionAdvanced } from './types/union'

// export { parseUnion, parseDiscriminatedUnion, parseStringUnion }

import { parseSymbol } from './types/symbol'
import { parseFunction, vFunctionWrapper } from './types/function'

import { parseCustom } from './types/custom'
import { parsePostProcessed, parsePreprocessed } from './types/transforms'
import {
  firstError,
  firstErrorFromResultError,
  resultFromResultError,
  errorFromResultError,
} from './types/shared'
// import { DefaultErrorFn } from './types/errorFns'

// export { parseSymbol, vSymbol, vSymbolInstance }

export default {
  array: {
    parsers: { parseArray },
    validations: { minimumArrayLength, maximumArrayLength, requiredArrayLength, nonEmpty },
  },
  boolean: {
    parsers: { parseBoolean, coerceBoolean },
    validations: { beTrue, beFalse },
  },
  bigInt: {
    parsers: { parseBigInt, coerceBigInt },
    validations: {
      parseBigInt,
      bigintGreaterThan,
      bigintGreaterThanOrEqualTo,
      bigintLesserThan,
      bigintLesserThanOrEqualTo,
      bigintInteger,
      bigintPositive,
      bigintNonNegative,
      bigintNegative,
      bigintNonPositive,
    },
  },
  number: {
    parsers: { parseNumber, coerceNumber },
    validations: {
      greaterThan,
      greaterThanOrEqualTo,
      lesserThan,
      lesserThanOrEqualTo,
      integer,
      positive,
      nonNegative,
      negative,
      nonPositive,
      notNaN,
      multipleOf,
      finite,
      safe,
    },
  },
  string: {
    parsers: { parseString, coerceString },
    validations: {
      minimumStringLength,
      maximumStringLength,
      exactStringLength,
      notEmptyString,
      beOneOf,
      validateAgainstRegex,
      validEmail,
      validCuid,
      validCuid2,
      validUuid,
      validURL,
      startsWith,
      endsWith,
      validUlid,
      validEmoji,
      validIpv4,
      validIpv6,
      validIp,
      validDateTime,
      includes,
    },
  },
  date: {
    parsers: { parseDate, coerceDate },
    validations: {
      after,
      before,
    },
  },
  object: {
    parsers: { parseObject },
    validations: {},
  },
  promise: {
    parsers: { parsePromise },
    validations: {},
  },
  record: {
    parsers: { parseRecord },
    validations: {},
  },
  instanceOf: {
    parsers: { parseInstanceOf },
    validations: {},
  },
  intersection: {
    parsers: { parseIntersection },
    validations: {},
  },
  literal: {
    parsers: { parseLiteral },
    validations: {},
  },
  union: {
    parsers: { parseUnion, parseUnionKey, parseUnionLiteral, parseUnionAdvanced },
    validations: {},
  },
  map: {
    parsers: { parseMap },
    validations: {
      minimumMapLength,
      maximumMapLength,
      requiredMapLength,
      nonEmptyMap,
    },
  },
  set: {
    parsers: { parseSet },
    validations: {
      minimumSetLength,
      maximumSetLength,
      requiredSetLength,
      nonEmptySet,
    },
  },
  symbol: {
    parsers: { parseSymbol },
    validations: {},
  },
  function: {
    parsers: { parseFunction, vFunctionWrapper },
  },
  custom: {
    parsers: { parseCustom },
  },
  default: {
    parsers: { parsePreprocessed, parsePostProcessed },
  },
  other: {
    firstError,
    firstErrorFromResultError,
    resultFromResultError,
    errorFromResultError,
    setGlobalErrorMessages,
    isError,
    isResult,
  },
}
