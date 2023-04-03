/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError, DeepWriteable } from 'toolbelt'

import {
  SingleValidationError,
  ValidationArray,
  ValidationErrors,
  ValidationItem,
  createValidationBuilder,
} from './base validations'
import { SafeParseFn, SafeParsableObject, createFinalBaseObject, defaultErrorFnSym } from './base'
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
            errors: [invalidStringFn ? invalidStringFn(value) : errorFns.parseString(value)],
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

export function minimumStringLength(
  length: number,
  errorReturnValueFn: DefaultErrorFn['minimumStringLength'] = errorFns.minimumStringLength,
) {
  return (value: string) => (value.length < length ? errorReturnValueFn(value, length) : undefined)
}

export function maximumStringLength(
  length: number,
  errorReturnValueFn: DefaultErrorFn['maximumStringLength'] = errorFns.maximumStringLength,
) {
  return (value: string) => (value.length > length ? errorReturnValueFn(value, length) : undefined)
}

export function exactStringLength(
  length: number,
  errorReturnValueFn: DefaultErrorFn['stringLength'] = errorFns.stringLength,
) {
  return (value: string) =>
    value.length !== length ? errorReturnValueFn(value, length) : undefined
}

export function notEmptyString(
  errorReturnValueFn: DefaultErrorFn['notEmptyString'] = errorFns.notEmptyString,
) {
  return (value: string) => (value.length === 0 ? errorReturnValueFn() : undefined)
}

export function beOneOf(
  items: string[],
  errorReturnValueFn: DefaultErrorFn['beOneOf'] = errorFns.beOneOf,
) {
  return (value: string) => (items.includes(value) ? undefined : errorReturnValueFn(value, items))
}

const cuidRegex = /^c[^\s-]{8,}$/i
const cuid2Regex = /^[a-z][a-z0-9]*$/
const uuidRegex =
  /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i
const emailRegex =
  /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@((?!-)([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{1,})[^-<>()[\].,;:\s@"]$/i

export function validateAgainstRegex(
  regex: RegExp,
  invalidFn: DefaultErrorFn['validateAgainstRegex'] = errorFns.validateAgainstRegex,
) {
  return (errorReturnValueFn: (invalidValue: string) => SingleValidationError = invalidFn) =>
    (value: string) =>
      value.match(regex) ? undefined : errorReturnValueFn(value)
}

export const validEmail = validateAgainstRegex(emailRegex, errorFns.validEmail)
export const validCuid = validateAgainstRegex(cuidRegex, errorFns.validCuid)
export const validCuid2 = validateAgainstRegex(cuid2Regex, errorFns.validCuid2)
export const validUuid = validateAgainstRegex(uuidRegex, errorFns.validUuid)

export function validURL(errorReturnValueFn: DefaultErrorFn['validURL'] = errorFns.validURL) {
  return (value: string) => {
    try {
      // eslint-disable-next-line no-new
      new URL(value)
      return undefined
    } catch {
      return errorReturnValueFn(value)
    }
  }
}

export function startsWith(
  startString: string,
  errorReturnValueFn: DefaultErrorFn['startsWith'] = errorFns.startsWith,
) {
  return (value: string) =>
    value.startsWith(startString) ? undefined : errorReturnValueFn(value, startString)
}

export function endsWith(
  endString: string,
  errorReturnValueFn: DefaultErrorFn['endsWith'] = errorFns.endsWith,
) {
  return (value: string) =>
    value.endsWith(endString) ? undefined : errorReturnValueFn(value, endString)
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
  ['beOneOf', beOneOf],
  ['startsWith', startsWith],
  ['endsWith', endsWith],
  ['notEmpty', notEmptyString],
  [
    'regex',
    (regex: RegExp, errorReturnValueFn?: (value: string) => string) =>
      validateAgainstRegex(regex, errorReturnValueFn)(),
  ],
  [
    'customValidation',
    (
        customValidator: (
          value: string,
          ...otherArgs: unknown[]
        ) => SingleValidationError | undefined,
        ...otherArgs: unknown[]
      ) =>
      (value: string) =>
        customValidator(value, ...otherArgs),
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
export type VString<
  Output extends string = string,
  Input = unknown,
  Validations extends ValidationArray<string> = StringValidations,
> = SafeParsableObject<Output, 'string', 'string', Input> & {
  // default validations
  [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
    ? Validations[I] extends ValidationItem<any>
      ? Validations[I][0]
      : never
    : never]: (...args: Parameters<Validations[I][1]>) => VString<Output, Input, Validations>
}

type StringOptions =
  | {
      parseStringError: DefaultErrorFn['parseString']
    }
  | {
      parser: SafeParseFn<unknown, string>
    }
  | Record<string, never>

const baseStringObject = createValidationBuilder(baseObject, stringValidations)

export function vString(options: StringOptions = {}): VString {
  return createFinalBaseObject(
    baseStringObject,
    (options as any).parser || parseString((options as any).parseStringError),
    'string',
    'string',
  ) as VString
}

export const vStringInstance = vString()
