/* eslint-disable import/prefer-default-export */
/* eslint-disable max-len */
import defaultErrorFn, { DefaultErrorFn } from '../shared/errorFns'
import { SingleValidationError, customValidations } from './validations'

// #TODO: make settable
const errorFns = defaultErrorFn

type StringValidationFn = (value: string) => SingleValidationError | undefined

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
/**
 *
 * @param regex regex to match against
 * @param validateAgainstRegexError errorFn if regex doesn't match
 */
function validateAgainstRegex(
  regex: RegExp,
  validateAgainstRegexError: DefaultErrorFn['validateAgainstRegexError'] = errorFns.validateAgainstRegexError,
) {
  return (
      errorReturnValueFn: (
        invalidValue: string,
      ) => SingleValidationError = validateAgainstRegexError,
    ): StringValidationFn =>
    (value: string) =>
      value.match(regex) ? undefined : errorReturnValueFn(value)
}

const cuidRegex = /^c[^\s-]{8,}$/i
const cuid2Regex = /^[a-z][a-z0-9]*$/
const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/
const uuidRegex =
  /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i
const emailRegex =
  // eslint-disable-next-line no-useless-escape
  /^(?!\.)(?!.*\.\.)([A-Z0-9_+-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i
const emojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Component})+$/u
const ipv4Regex =
  /^(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))$/

const ipv6Regex =
  /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/

export const stringValidations = {
  /**
   * value.length >= length
   */
  minimum(
    length: number,
    minimumStringLengthError?: DefaultErrorFn['minimumStringLengthError'],
  ): StringValidationFn {
    return (value: string) =>
      value.length >= length
        ? undefined
        : (minimumStringLengthError ?? errorFns.minimumStringLengthError)(value, length)
  },
  /**
   * value.length <= length
   */
  maximum(
    length: number,
    maximumStringLengthError?: DefaultErrorFn['maximumStringLengthError'],
  ): StringValidationFn {
    return (value: string) =>
      value.length <= length
        ? undefined
        : (maximumStringLengthError ?? errorFns.maximumStringLengthError)(value, length)
  },
  /**
   * value.length === length
   */
  size(
    length: number,
    stringLengthError?: DefaultErrorFn['stringLengthError'],
  ): StringValidationFn {
    return (value: string) =>
      value.length === length
        ? undefined
        : (stringLengthError ?? errorFns.stringLengthError)(value, length)
  },

  /**
   * value.length !== 0
   */
  notEmpty(notEmptyStringError?: DefaultErrorFn['notEmptyStringError']): StringValidationFn {
    return (value: string) =>
      value.length !== 0 ? undefined : (notEmptyStringError ?? errorFns.notEmptyStringError)()
  },

  /**
   * items.includes(value)
   */
  beOneOf(items: string[], beOneOfError?: DefaultErrorFn['beOneOfError']): StringValidationFn {
    return (value: string) =>
      items.includes(value) ? undefined : (beOneOfError ?? errorFns.beOneOfError)(value, items)
  },
  // validateAgainstRegex,
  /**
   * valid email address
   */
  validEmail: validateAgainstRegex(emailRegex, errorFns.validEmailError),
  validCuid: validateAgainstRegex(cuidRegex, errorFns.validCuidError),
  validCuid2: validateAgainstRegex(cuid2Regex, errorFns.validCuid2Error),
  validUuid: validateAgainstRegex(uuidRegex, errorFns.validUuidError),
  validUlid: validateAgainstRegex(ulidRegex, errorFns.validUlidError),
  validEmoji: validateAgainstRegex(emojiRegex, errorFns.validEmojiError),
  validIpv4: validateAgainstRegex(ipv4Regex, errorFns.validIpv4Error),
  validIpv6: validateAgainstRegex(ipv6Regex, errorFns.validIpv6Error),

  validIp(validIpError?: DefaultErrorFn['validIpError']): StringValidationFn {
    return (value: string) => {
      if (stringValidations.validIpv4(validIpError)(value) === undefined) return undefined
      if (stringValidations.validIpv6(validIpError)(value) === undefined) return undefined
      return (validIpError ?? errorFns.validIpError)(value)
    }
  },

  validURL(validURLError?: DefaultErrorFn['validURLError']): StringValidationFn {
    return (value: string) => {
      try {
        // eslint-disable-next-line no-new
        new URL(value)
        return undefined
      } catch {
        return (validURLError ?? errorFns.validURLError)(value)
      }
    }
  },
  /*
   * @param options: {
      precision?: number
      offset?: boolean
      validDateTimeError?: DefaultErrorFn['validDateTimeError']
    }
   */
  validDateTime(
    options: {
      precision?: number
      offset?: boolean
      validDateTimeError?: DefaultErrorFn['validDateTimeError']
    } = {},
  ): StringValidationFn {
    const regEx = datetimeRegex({
      precision: options.precision ?? null,
      offset: options.offset ?? false,
    })
    return validateAgainstRegex(regEx, options.validDateTimeError ?? errorFns.validDateTimeError)()
  },
  /**
   * value.startsWith(startString)
   */
  startsWith(
    startString: string,
    startsWithError?: DefaultErrorFn['startsWithError'],
  ): StringValidationFn {
    return (value: string) =>
      value.startsWith(startString)
        ? undefined
        : (startsWithError ?? errorFns.startsWithError)(value, startString)
  },
  /**
   * value.endsWith(endString)
   */
  endsWith(endString: string, endsWithError?: DefaultErrorFn['endsWithError']): StringValidationFn {
    return (value: string) =>
      value.endsWith(endString)
        ? undefined
        : (endsWithError ?? errorFns.endsWithError)(value, endString)
  },
  /**
   * value.includes(includedString, position)
   */
  includes(
    includedString: string,
    position?: number,
    includesError?: DefaultErrorFn['includesError'],
  ): StringValidationFn {
    return (value: string) =>
      value.includes(includedString, position)
        ? undefined
        : (includesError ?? errorFns.includesError)(value, includedString)
  },
  custom: customValidations<string>().custom,
}
