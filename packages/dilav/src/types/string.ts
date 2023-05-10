/* eslint-disable max-len */
import type { ResultError, DeepWriteable, FlattenObjectUnion } from '@trevthedev/toolbelt'

import { createValidationBuilder } from './base validations'
import { createFinalBaseObject } from './base'
import {
  SafeParseFn,
  BaseSchema,
  defaultErrorFnSym,
  SingleValidationError,
  ValidationArray,
  ValidationErrors,
  ValidationItem,
} from './types'
import { baseObject } from './init'
import { DefaultErrorFn } from './errorFns'

const errorFns = baseObject[defaultErrorFnSym]

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export function parseString(
  invalidStringFn?: DefaultErrorFn['parseString'],
): SafeParseFn<unknown, string> {
  return (value: unknown): ResultError<ValidationErrors, string> =>
    typeof value !== 'string'
      ? [
          {
            input: value,
            errors: [(invalidStringFn ?? errorFns.parseString)(value)],
          },
          undefined,
        ]
      : [undefined, value]
}

export function coerceString(value: unknown): ResultError<never, string> {
  return [undefined, String(value)]
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * validators
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type StringValidationFn = (value: string) => SingleValidationError | undefined

export function minimumStringLength(
  length: number,
  errorReturnValueFn?: DefaultErrorFn['minimumStringLength'],
): StringValidationFn {
  return (value: string) =>
    value.length < length
      ? (errorReturnValueFn ?? errorFns.minimumStringLength)(value, length)
      : undefined
}

export function maximumStringLength(
  length: number,
  errorReturnValueFn?: DefaultErrorFn['maximumStringLength'],
): StringValidationFn {
  return (value: string) =>
    value.length > length
      ? (errorReturnValueFn ?? errorFns.maximumStringLength)(value, length)
      : undefined
}

export function exactStringLength(
  length: number,
  errorReturnValueFn?: DefaultErrorFn['stringLength'],
): StringValidationFn {
  return (value: string) =>
    value.length !== length
      ? (errorReturnValueFn ?? errorFns.stringLength)(value, length)
      : undefined
}

export function notEmptyString(
  errorReturnValueFn?: DefaultErrorFn['notEmptyString'],
): StringValidationFn {
  return (value: string) =>
    value.length === 0 ? (errorReturnValueFn ?? errorFns.notEmptyString)() : undefined
}

export function beOneOf(
  items: string[],
  errorReturnValueFn?: DefaultErrorFn['beOneOf'],
): StringValidationFn {
  return (value: string) =>
    items.includes(value) ? undefined : (errorReturnValueFn ?? errorFns.beOneOf)(value, items)
}

const cuidRegex = /^c[^\s-]{8,}$/i
const cuid2Regex = /^[a-z][a-z0-9]*$/
const ulidRegex = /[0-9A-HJKMNP-TV-Z]{26}/
const uuidRegex =
  /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i
const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\])|(\[IPv6:(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))\])|([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])*(\.[A-Za-z]{2,})+))$/
const emojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Component})+$/u

const ipv4Regex =
  /^(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))$/

const ipv6Regex =
  /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/

export function validateAgainstRegex(
  regex: RegExp,
  invalidFn: DefaultErrorFn['validateAgainstRegex'] = errorFns.validateAgainstRegex,
) {
  return (
      errorReturnValueFn: (invalidValue: string) => SingleValidationError = invalidFn,
    ): StringValidationFn =>
    (value: string) =>
      value.match(regex) ? undefined : errorReturnValueFn(value)
}

export const validEmail = validateAgainstRegex(emailRegex, errorFns.validEmail)
export const validCuid = validateAgainstRegex(cuidRegex, errorFns.validCuid)
export const validCuid2 = validateAgainstRegex(cuid2Regex, errorFns.validCuid2)
export const validUuid = validateAgainstRegex(uuidRegex, errorFns.validUuid)
export const validUlid = validateAgainstRegex(ulidRegex, errorFns.validUlid)
export const validEmoji = validateAgainstRegex(emojiRegex, errorFns.validEmoji)
export const validIpv4 = validateAgainstRegex(ipv4Regex, errorFns.validIpv4)
export const validIpv6 = validateAgainstRegex(ipv6Regex, errorFns.validIpv6)

export function validIp(invalidIpFn?: DefaultErrorFn['validIp']): StringValidationFn {
  return (value: string) => {
    if (validIpv4(invalidIpFn)(value) === undefined) return undefined
    if (validIpv6(invalidIpFn)(value) === undefined) return undefined
    return (invalidIpFn ?? errorFns.validIp)(value)
  }
}

export function validURL(errorReturnValueFn?: DefaultErrorFn['validURL']): StringValidationFn {
  return (value: string) => {
    try {
      // eslint-disable-next-line no-new
      new URL(value)
      return undefined
    } catch {
      return (errorReturnValueFn ?? errorFns.validURL)(value)
    }
  }
}

function datetimeRegex(args: { precision: number | null; offset: boolean }) {
  if (args.precision) {
    if (args.offset) {
      return new RegExp(
        `^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}(([+-]\\d{2}(:?\\d{2})?)|Z)$`,
      )
    }
    return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}Z$`)
  }
  if (args.precision === 0) {
    if (args.offset) return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(([+-]\d{2}(:?\d{2})?)|Z)$/

    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
  }
  if (args.offset) return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(([+-]\d{2}(:?\d{2})?)|Z)$/

  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/
}

export function validDateTime(
  options: {
    precision?: number
    offset?: boolean
    validDateTimeFn?: DefaultErrorFn['validDateTime']
  } = {},
): StringValidationFn {
  const regEx = datetimeRegex({
    precision: options.precision ?? null,
    offset: options.offset ?? false,
  })
  return validateAgainstRegex(regEx, options.validDateTimeFn ?? errorFns.validDateTime)()
}

export function startsWith(
  startString: string,
  errorReturnValueFn?: DefaultErrorFn['startsWith'],
): StringValidationFn {
  return (value: string) =>
    value.startsWith(startString)
      ? undefined
      : (errorReturnValueFn ?? errorFns.startsWith)(value, startString)
}

export function endsWith(
  endString: string,
  errorReturnValueFn?: DefaultErrorFn['endsWith'],
): StringValidationFn {
  return (value: string) =>
    value.endsWith(endString)
      ? undefined
      : (errorReturnValueFn ?? errorFns.endsWith)(value, endString)
}

export function includes(
  includedString: string,
  position?: number,
  errorReturnValueFn?: DefaultErrorFn['includes'],
): StringValidationFn {
  return (value: string) =>
    value.includes(includedString, position)
      ? undefined
      : (errorReturnValueFn ?? errorFns.includes)(value, includedString)
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * all validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type StringValidations = DeepWriteable<typeof stringValidations_>

const stringValidations_ = [
  ['max', maximumStringLength],
  ['min', minimumStringLength],
  ['length', exactStringLength],
  ['email', validEmail],
  ['cuid', validCuid],
  ['cuid2', validCuid2],
  ['uuid', validUuid],
  ['url', validURL],
  ['ulid', validUlid],
  ['emoji', validEmoji],
  ['ipv4', validIpv4],
  ['ipv6', validIpv6],
  ['ip', validIp],
  ['datetime', validDateTime],
  ['beOneOf', beOneOf],
  ['startsWith', startsWith],
  ['endsWith', endsWith],
  ['notEmpty', notEmptyString],
  ['includes', includes],
  [
    'regex',
    (regex: RegExp, errorReturnValueFn?: (value: string) => string) =>
      validateAgainstRegex(regex, errorReturnValueFn)(),
  ],
] as const // [propName: string, validationFn: (...args) => (value: string) => string | undefined][]

const stringValidations = stringValidations_ as StringValidations

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vString
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type StringValidationFuncs<
  Output extends string,
  Input,
  Validations extends ValidationArray<string> = StringValidations,
> = {
  [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
    ? Validations[I] extends ValidationItem<string>
      ? Validations[I][0]
      : never
    : never]: (...args: Parameters<Validations[I][1]>) => VString<Output, Input>
}
export interface VString<Output extends string = string, Input = unknown>
  extends BaseSchema<Output, 'string', 'string', Input>,
    StringValidationFuncs<Output, Input> {
  readonly coerce: this
  custom(newOptions: StringOptions): this
  // max(length: number, errorFn?: DefaultErrorFn['maximumStringLength']): this
  // min(length: number, errorFn?: DefaultErrorFn['minimumStringLength']): this
  // length(length: number, errorFn?: DefaultErrorFn['stringLength']): this
  // notEmpty(errorFn?: DefaultErrorFn['notEmptyString']): this
  // beOneOf(items: string[], errorFn?: DefaultErrorFn['beOneOf']): this
  // regex(regex: RegExp, errorFn?: DefaultErrorFn['maximumStringLength']): this
  // email(errorFn?: DefaultErrorFn['validEmail']): this
  // cuid(errorFn?: DefaultErrorFn['validCuid']): this
  // cuid2(errorFn?: DefaultErrorFn['validCuid2']): this
  // uuid(errorFn?: DefaultErrorFn['validUuid']): this
  // url(errorFn?: DefaultErrorFn['validURL']): this
  // ulid(errorFn?: DefaultErrorFn['validUlid']): this
  // emoji(errorFn?: DefaultErrorFn['validEmoji']): this
  // ipv4(errorFn?: DefaultErrorFn['validIpv4']): this
  // ipv6(errorFn?: DefaultErrorFn['validIpv6']): this
  // ip(errorFn?: DefaultErrorFn['validIp']): this
  // datetime(options?: {
  //   precision?: number
  //   offset?: boolean
  //   errorFn?: DefaultErrorFn['validDateTime']
  // }): this
  // includes(includedString: string, errorFn?: DefaultErrorFn['includes']): this
  // startsWith(startString: string, errorFn?: DefaultErrorFn['startsWith']): this
  // endsWith(endString: string, errorFn?: DefaultErrorFn['endsWith']): this
}

// & {
//   // default validations
//   [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
//     ? Validations[I] extends ValidationItem<any>
//       ? Validations[I][0]
//       : never
//     : never]: (...args: Parameters<Validations[I][1]>) => VString<Output, Input, Validations>
// }

type StringOptions =
  | {
      parseStringError: DefaultErrorFn['parseString']
    }
  | {
      parser: SafeParseFn<unknown, string>
    }
  // eslint-disable-next-line @typescript-eslint/ban-types
  | {}

const baseStringObject = createValidationBuilder(
  baseObject,
  stringValidations,
  coerceString,
  vString,
)

export function vString(options: StringOptions = {}): VString {
  type Opts = FlattenObjectUnion<StringOptions>
  return createFinalBaseObject(
    baseStringObject,
    (options as Opts).parser ?? parseString((options as Opts).parseStringError),
    'string',
    'string',
  ) as VString
}

export const vStringInstance = vString()
// export const vStringCoerce = vString({ parser: coerceString })
