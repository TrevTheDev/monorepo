/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultError, DeepWriteable } from 'toolbelt'
import type {
  SafeParseFn,
  SafeParsableObject,
  SingleValidationError,
  ValidationArray,
  ValidationErrors,
  ValidationItem,
} from './base'

import defaultErrorFn from './defaultErrors'
import { createBaseValidationBuilder } from './init'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export function parseString(
  invalidStringFn: (invalidValue: unknown) => SingleValidationError = defaultErrorFn.parseString,
): (value: unknown) => ResultError<ValidationErrors, string> {
  return (value: unknown): ResultError<ValidationErrors, string> =>
    typeof value !== 'string'
      ? [{ input: value, errors: [invalidStringFn(value)] }, undefined]
      : [undefined, value]
}

// transformer
export function coerceString(value: unknown): string {
  return String(value)
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
  errorReturnValueFn: (
    invalidValue: string,
    minLength: number,
  ) => SingleValidationError = defaultErrorFn.minimumStringLength,
) {
  return (value: string) => (value.length < length ? errorReturnValueFn(value, length) : undefined)
}

export function maximumStringLength(
  length: number,
  errorReturnValueFn: (
    invalidValue: string,
    maxLength: number,
  ) => SingleValidationError = defaultErrorFn.maximumStringLength,
) {
  return (value: string) => (value.length > length ? errorReturnValueFn(value, length) : undefined)
}

export function exactStringLength(
  length: number,
  errorReturnValueFn: (
    invalidValue: string,
    requiredLength: number,
  ) => SingleValidationError = defaultErrorFn.stringLength,
) {
  return (value: string) =>
    value.length !== length ? errorReturnValueFn(value, length) : undefined
}

export function notEmptyString(
  errorReturnValueFn: () => SingleValidationError = defaultErrorFn.notEmptyString,
) {
  return (value: string) => (value.length === 0 ? errorReturnValueFn() : undefined)
}

export function beOneOf(
  items: string[],
  errorReturnValueFn: (
    invalidValue: string,
    allItems: string[],
  ) => SingleValidationError = defaultErrorFn.beOneOf,
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
  invalidFn: (value: string) => SingleValidationError = defaultErrorFn.validateAgainstRegex,
) {
  return (errorReturnValueFn: (invalidValue: string) => SingleValidationError = invalidFn) =>
    (value: string) =>
      value.match(regex) ? undefined : errorReturnValueFn(value)
}

export const validEmail = validateAgainstRegex(emailRegex, defaultErrorFn.validEmail)
export const validCuid = validateAgainstRegex(cuidRegex, defaultErrorFn.validCuid)
export const validCuid2 = validateAgainstRegex(cuid2Regex, defaultErrorFn.validCuid2)
export const validUuid = validateAgainstRegex(uuidRegex, defaultErrorFn.validUuid)

export function validURL(
  errorReturnValueFn: (invalidValue: string) => SingleValidationError = defaultErrorFn.validURL,
) {
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
  errorReturnValueFn: (
    invalidValue: string,
    start: string,
  ) => SingleValidationError = defaultErrorFn.startsWith,
) {
  return (value: string) =>
    value.startsWith(startString) ? undefined : errorReturnValueFn(value, startString)
}

export function endsWith(
  endString: string,
  errorReturnValueFn: (
    invalidValue: string,
    start: string,
  ) => SingleValidationError = defaultErrorFn.endsWith,
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
> = SafeParsableObject<Output, 'string', Input> & {
  // default validations
  [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
    ? Validations[I] extends ValidationItem<any>
      ? Validations[I][0]
      : never
    : never]: (...args: Parameters<Validations[I][1]>) => VString<Output, Input, Validations>
}

type StringOptions = {
  parser: SafeParseFn<unknown, string>
  parseStringError: (invalidValue: unknown) => SingleValidationError
}

export const vString = (options: Partial<StringOptions> = {}) =>
  createBaseValidationBuilder(
    options.parser
      ? options.parser
      : parseString(
          options.parseStringError ? options.parseStringError : defaultErrorFn.parseString,
        ),
    stringValidations,
    'string',
  ) as unknown as VString

export const vStringInstance = vString()
