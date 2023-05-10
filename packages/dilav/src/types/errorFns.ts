import { SingleArrayValidationError } from './array'
import { MinimumObjectSchema, MinimumObjectDefinition, MinimumSchema } from './types'
import { SingleObjectValidationError } from './object'

const JSONstringify = (unknownObject) => {
  try {
    return JSON.stringify(
      unknownObject,
      (_key, value) => (typeof value === 'bigint' ? value.toString() : value), // return everything else unchanged
    )
  } catch (e) {
    return String(unknownObject)
  }
}

function stringify(value: unknown) {
  switch (typeof value) {
    case 'string':
    case 'object':
      return JSONstringify(value)
    default:
      return String(value)
  }
}

const defaultErrorFn = {
  parseString: (value: unknown) => `${stringify(value)} is not a string`,
  parseNumber: (value: unknown) => `${stringify(value)} is not a number`,
  parseBigInt: (value: unknown) => `${stringify(value)} is not a bigint`,
  parseBoolean: (value: unknown) => `${stringify(value)} is not a boolean`,
  parseNaN: (value: unknown) => `${stringify(value)} is not a NaN`,
  parseSymbol: (value: unknown) => `${stringify(value)} is not a symbol`,
  parseDate: (value: unknown) => `${stringify(value)} is not a Date`,
  // parseEnum: (value: unknown, enums: unknown[]) =>
  //   `${stringify(value)} is not in the Enum :${stringify(enums)}`,
  // parseEnum: (value: unknown, enumV: object) =>
  //   `${stringify(value)} is not in the Enum :${stringify(enumV)}`,
  notNaN: () => 'NaN is not permitted',
  parseLiteral: (value: unknown, literal: unknown) =>
    `${stringify(value)} is not identical to ${stringify(literal)}`,
  parseUndefined: (value: unknown) => `${stringify(value)} is not undefined`,
  parseNull: (value: unknown) => `${stringify(value)} is not null`,
  parseNullish: (value: unknown) => `${stringify(value)} is not nullish (null or undefined)`,
  parseNever: (value: unknown) => `${stringify(value)} doesn't match 'never'`,
  // eslint-disable-next-line @typescript-eslint/ban-types
  parseInstanceOf: (value: unknown, instanceOfItem: Function) =>
    `${stringify(value)} is not an instance of '${instanceOfItem.name}'`,
  minimumArrayLength: (value: unknown[], minLength: number) =>
    `array contains ${value.length} element(s) but must contain ${minLength}`,
  maximumArrayLength: (value: unknown[], maxLength: number) =>
    `array contains ${value.length} element(s) but may only contain ${maxLength}`,
  requiredArrayLength: (value: unknown[], requiredLength: number) =>
    `array contains ${value.length} element(s), but ${requiredLength} are required`,
  arrayNonEmpty: (value: unknown[]) => `'${value}' must contain at least one element`,
  maximumStringLength: (value: string, maxLength: number) =>
    `'${value}' is longer than ${maxLength} character(s)`,
  minimumStringLength: (value: string, minLength: number) =>
    `'${value}' is shorter than ${minLength} character(s)`,
  stringLength: (value: string, length: number) =>
    `'${value}' must contain exactly exactly ${length} character(s)`,
  notEmptyString: () => `string cannot be empty`,
  beOneOf: (value: string, allItems: string[]) => `'${value}' not in '${allItems}'`,
  validEmail: (value: string) => `'${value}' is not a valid email`,
  validCuid: (value: string) => `'${value}' is not a valid cuid`,
  validCuid2: (value: string) => `'${value}' is not a valid cuid2`,
  validUuid: (value: string) => `'${value}' is not a valid uuid`,
  validURL: (value: string) => `'${value}' is not a valid URL`,
  validUlid: (value: string) => `'${value}' is not a valid Ulid`,
  validEmoji: (value: string) => `'${value}' is not a valid Emoji`,
  validIpv4: (value: string) => `'${value}' is not a valid IPv4 address`,
  validIpv6: (value: string) => `'${value}' is not a valid IPv6 address`,
  validIp: (value: string) => `'${value}' is not a valid IP address`,
  validDateTime: (value: string) => `'${value}' is not a valid DateTime string`,
  includes: (value: string, includedString: string) =>
    `'${value}' doesn't include '${includedString}'`,
  startsWith: (value: string, startString: string) =>
    `'${value}' doesn't start with '${startString}'`,
  endsWith: (value: string, endString: string) => `'${value}' doesn't end with '${endString}'`,
  validateAgainstRegex: (value: string) => `'${value}' doesn't pass the regex test`,
  beTrue: () => `value must be true`,
  beFalse: () => `value must be false`,
  greaterThan: (value: number, greaterThanValue: number) =>
    `${value} is not greater than ${greaterThanValue}`,
  greaterThanOrEqualTo: (value: number, greaterThanOrEqualToValue: number) =>
    `${value} is not greater than or equal to ${greaterThanOrEqualToValue}`,
  lesserThan: (value: number, lesserThanValue: number) =>
    `${value} is not lesser than ${lesserThanValue}`,
  lesserThanOrEqualTo: (value: number, lesserThanOrEqualToValue: number) =>
    `${value} is not lesser than or equal to ${lesserThanOrEqualToValue}`,
  integer: (value: number) => `${value} is not an integer`,
  positive: (value: number) => `${value} is not positive`,
  nonNegative: (value: number) => `${value} is not positive`,
  negative: (value: number) => `${value} is not negative`,
  nonPositive: (value: number) => `${value} is not negative`,
  multipleOf: (value: number, multipleOf: number) => `${value} is not a multiple of ${multipleOf}`,
  finite: (value: number) => `${value} is not finite`,
  safe: (value: number) => `${value} is not safe`,
  bigIntGreaterThan: (value: bigint, greaterThanValue: bigint) =>
    `${value} is not greater than ${greaterThanValue}`,
  bigIntGreaterThanOrEqualTo: (value: bigint, greaterThanOrEqualToValue: bigint) =>
    `${value} is not greater than or equal to ${greaterThanOrEqualToValue}`,
  bigIntLesserThan: (value: bigint, lesserThanValue: bigint) =>
    `${value} is not lesser than ${lesserThanValue}`,
  bigIntLesserThanOrEqualTo: (value: bigint, lesserThanOrEqualToValue: bigint) =>
    `${value} is not lesser than or equal to ${lesserThanOrEqualToValue}`,
  bigIntInteger: (value: bigint) => `${value} is not an integer`,
  bigIntPositive: (value: bigint) => `${value} is not positive`,
  bigIntNonNegative: (value: bigint) => `${value} is not positive`,
  bigIntNegative: (value: bigint) => `${value} is not negative`,
  bigIntNonPositive: (value: bigint) => `${value} is not negative`,
  bigIntMultipleOf: (value: bigint, multipleOf: bigint) =>
    `${value} is not a multiple of ${multipleOf}`,
  after: (value: Date, afterDate: Date) => `'${value}' is not after '${afterDate}'`,
  before: (value: Date, beforeDate: Date) => `'${value}' is not after '${beforeDate}'`,
  invalidArrayElementsFn(
    invalidValue: unknown[],
    arrayTypeString: string,
    errors: SingleArrayValidationError[],
  ) {
    const elementString = errors
      .map(([item, itemErrors]) =>
        itemErrors.map((error) => `\nat index ${item}: ${error}`).join(''),
      )
      .join(', ')
    return `The array ${stringify(invalidValue)} is not of type ${arrayTypeString}.${elementString}`
  },
  extraArrayItemsFn: (value: unknown[], extraElementFoundStartingAtIndex: number) =>
    `${stringify(value)} contains extra elements starting at ${extraElementFoundStartingAtIndex}`,
  arrayDefinitionElementMustBeOptional: (value: unknown[], index: number) =>
    `the required element at index: ${index} cannot follow an optional element`,
  elementRequiredAt: (value: unknown[], index: number) =>
    `no element found at index: ${index} and one is required`,
  restCantFollowRest: (value: unknown[], index: number) =>
    `the rest element found at index: ${index} cannot follow another rest element`,
  optionalElementCantFollowRest: (value: unknown[], index: number) =>
    `the optional element found at index: ${index} cannot follow a rest element`,
  parseArray: (value: unknown, arrayType: string) =>
    `${stringify(value)} is not of type :${arrayType}`,
  parseObject: (value: unknown, objectType: string) =>
    `${stringify(value)} is not of type :${objectType}`,
  invalidObjectPropertiesFn(
    invalidValue: object,
    objectTypeString: string,
    errors: SingleObjectValidationError[],
  ) {
    const elementString = errors
      .map(([item, itemErrors]) =>
        itemErrors.map((error) => `\n${stringify(item)}: ${error}`).join(''),
      )
      .join(', ')
    return `The object ${stringify(
      invalidValue,
    )} is not of type ${objectTypeString}.${elementString}`
  },
  missingProperty: (value: object, property: PropertyKey) =>
    `property: ${stringify(property)} not found in ${stringify(value)}`,
  missingPropertyInDef: (value: object, property: PropertyKey) =>
    `property: ${stringify(property)} not found in object definition: ${stringify(value)}`,
  extraKeysFound: (
    value: object,
    extraKeys: (string | symbol)[],
    _objectDef: MinimumObjectDefinition,
  ) => `${stringify(value)} contains the following extra properties:${stringify(extraKeys)}`,
  missingItemInItemSchemas: (value: unknown[], key: PropertyKey) =>
    `item: ${stringify(key)} not found in ${stringify(value)}`,
  unableToSelectItemFromArray: (_value: MinimumSchema, _keys: PropertyKey[]) =>
    `unable to select items from an infinite array`,
  keyNotFoundInDiscriminatedUnionDef: (property: string, unionDefType: string) =>
    `property '${property}' not found in object definition: ${unionDefType}`,
  keyNotFoundInDiscriminatedUnion: (property: string, value: object) =>
    `property '${property}' not found in object: ${stringify(value)}`,
  noKeyMatchFoundInDiscriminatedUnion: (
    value: object,
    property: string,
    _schemas: MinimumObjectSchema[],
  ) =>
    `the discriminatedUnionKey '${property}' found no matches for the value: ${stringify(value)}`,
  schemaIsNotOfTypeObject: (schema: MinimumSchema) =>
    `the schema ${stringify(schema)} is not of type object`,
  discriminatedUnionValueIsNotAnObject: (value: unknown) =>
    `value ${stringify(value)} is not of type object`,

  parseLiteralUnion: (value: unknown, literalUnionDef: readonly unknown[]) =>
    `value ${stringify(value)} not found in: ${stringify(literalUnionDef)}`,
  parseMap: (value: unknown) => `${stringify(value)} is not an instance of a Map`,
  minimumMapLength: (value: Map<unknown, unknown>, minLength: number) =>
    `${value.size} is less elements than the minimum of ${minLength}`,
  maximumMapLength: (value: Map<unknown, unknown>, maxLength: number) =>
    `${value.size} is more elements than the maximum of ${maxLength}`,
  requiredMapLength: (value: Map<unknown, unknown>, requiredLength: number) =>
    `${value.size} is not the required ${requiredLength} elements`,
  mapNonEmpty: (value: Map<unknown, unknown>) =>
    `${stringify(value)} must contain at least one element`,
  parseSet: (value: unknown) => `${stringify(value)} is not an instance of a Set`,
  minimumSetLength: (value: Set<unknown>, minLength: number) =>
    `${value.size} is less elements than the minimum of ${minLength}`,
  maximumSetLength: (value: Set<unknown>, maxLength: number) =>
    `${value.size} is more elements than the maximum of ${maxLength}`,
  requiredSetLength: (value: Set<unknown>, requiredLength: number) =>
    `${value.size} is not the required ${requiredLength} elements`,
  setNonEmpty: (value: Set<unknown>) => `${stringify(value)} must contain at least one element`,
  parsePromise: (value: unknown) => `${stringify(value)} doesn't have a 'then' and 'catch' method`,
  parseRecord: (value: unknown) => `${stringify(value)} is not a valid object`,
  parseFunction: (value: unknown) => `${stringify(value)} is not a valid function`,
  parseCustom: (value: unknown) => `${stringify(value)} could not be parsed`,
}

export default defaultErrorFn

export type DefaultErrorFn = typeof defaultErrorFn
