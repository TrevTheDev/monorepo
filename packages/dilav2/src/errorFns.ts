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
  parseError: (value: unknown) => `unable to parse ${stringify(value)}`,
  parseStringError: (value: unknown) => `${stringify(value)} is not a string`,
  parseNumberError: (value: unknown) => `${stringify(value)} is not a number`,
  parseBigIntError: (value: unknown) => `${stringify(value)} is not a bigint`,
  parseBooleanError: (value: unknown) => `${stringify(value)} is not a boolean`,
  parseNaNError: (value: unknown) => `${stringify(value)} is not a NaN`,
  parseSymbolError: (value: unknown) => `${stringify(value)} is not a symbol`,
  parseDateError: (value: unknown) => `${stringify(value)} is not a Date`,
  notNaNError: () => 'NaN is not permitted',
  parseLiteralError: (value: unknown, literal: unknown) =>
    `${stringify(value)} is not deeply equal to ${stringify(literal)}`,
  parseUndefinedError: (value: unknown) => `${stringify(value)} is not undefined`,
  parseNullError: (value: unknown) => `${stringify(value)} is not null`,
  parseNullishError: (value: unknown) => `${stringify(value)} is not nullish (null or undefined)`,
  parseNeverError: (value: unknown) => `${stringify(value)} doesn't match 'never'`,
  // eslint-disable-next-line @typescript-eslint/ban-types
  parseInstanceOfError: (value: unknown, instanceOfItem: Function) =>
    `${stringify(value)} is not an instance of '${instanceOfItem.name}'`,
  minimumArrayLengthError: (value: unknown[], minLength: number) =>
    `array contains ${value.length} element(s) but must contain ${minLength}`,
  maximumArrayLengthError: (value: unknown[], maxLength: number) =>
    `array contains ${value.length} element(s) but may only contain ${maxLength}`,
  requiredArrayLengthError: (value: unknown[], requiredLength: number) =>
    `array contains ${value.length} element(s), but ${requiredLength} are required`,
  arrayNonEmptyError: (value: unknown[]) => `'${value}' must contain at least one element`,
  maximumStringLengthError: (value: string, maxLength: number) =>
    `'${value}' is longer than ${maxLength} character(s)`,
  minimumStringLengthError: (value: string, minLength: number) =>
    `'${value}' is shorter than ${minLength} character(s)`,
  stringLengthError: (value: string, length: number) =>
    `'${value}' must contain exactly exactly ${length} character(s)`,
  notEmptyStringError: () => `string cannot be empty`,
  beOneOfError: (value: string, allItems: string[]) => `'${value}' not in '${allItems}'`,
  validEmailError: (value: string) => `'${value}' is not a valid email`,
  validCuidError: (value: string) => `'${value}' is not a valid cuid`,
  validCuid2Error: (value: string) => `'${value}' is not a valid cuid2`,
  validUuidError: (value: string) => `'${value}' is not a valid uuid`,
  validURLError: (value: string) => `'${value}' is not a valid URL`,
  validUlidError: (value: string) => `'${value}' is not a valid Ulid`,
  validEmojiError: (value: string) => `'${value}' is not a valid Emoji`,
  validIpv4Error: (value: string) => `'${value}' is not a valid IPv4 address`,
  validIpv6Error: (value: string) => `'${value}' is not a valid IPv6 address`,
  validIpError: (value: string) => `'${value}' is not a valid IP address`,
  validDateTimeError: (value: string) => `'${value}' is not a valid DateTime string`,
  includesError: (value: string, includedString: string) =>
    `'${value}' doesn't include '${includedString}'`,
  startsWithError: (value: string, startString: string) =>
    `'${value}' doesn't start with '${startString}'`,
  endsWithError: (value: string, endString: string) => `'${value}' doesn't end with '${endString}'`,
  validateAgainstRegexError: (value: string) => `'${value}' doesn't pass the regex test`,
  beTrueError: (_value: boolean) => `value must be true`,
  beFalseError: (_value: boolean) => `value must be false`,
  greaterThanError: (value: number, greaterThanValue: number) =>
    `${value} is not greater than ${greaterThanValue}`,
  greaterThanOrEqualToError: (value: number, greaterThanOrEqualToValue: number) =>
    `${value} is not greater than or equal to ${greaterThanOrEqualToValue}`,
  lesserThanError: (value: number, lesserThanValue: number) =>
    `${value} is not lesser than ${lesserThanValue}`,
  lesserThanOrEqualToError: (value: number, lesserThanOrEqualToValue: number) =>
    `${value} is not lesser than or equal to ${lesserThanOrEqualToValue}`,
  integerError: (value: number) => `${value} is not an integer`,
  positiveError: (value: number) => `${value} is not positive`,
  nonNegativeError: (value: number) => `${value} is not positive`,
  negativeError: (value: number) => `${value} is not negative`,
  nonPositiveError: (value: number) => `${value} is not negative`,
  multipleOfError: (value: number, multipleOf: number) =>
    `${value} is not a multiple of ${multipleOf}`,
  finiteError: (value: number) => `${value} is not finite`,
  safeError: (value: number) => `${value} is not safe`,
  bigIntGreaterThanError: (value: bigint, greaterThanValue: bigint) =>
    `${value} is not greater than ${greaterThanValue}`,
  bigIntGreaterThanOrEqualToError: (value: bigint, greaterThanOrEqualToValue: bigint) =>
    `${value} is not greater than or equal to ${greaterThanOrEqualToValue}`,
  bigIntLesserThanError: (value: bigint, lesserThanValue: bigint) =>
    `${value} is not lesser than ${lesserThanValue}`,
  bigIntLesserThanOrEqualToError: (value: bigint, lesserThanOrEqualToValue: bigint) =>
    `${value} is not lesser than or equal to ${lesserThanOrEqualToValue}`,
  bigIntIntegerError: (value: bigint) => `${value} is not an integer`,
  bigIntPositiveError: (value: bigint) => `${value} is not positive`,
  bigIntNonNegativeError: (value: bigint) => `${value} is not positive`,
  bigIntNegativeError: (value: bigint) => `${value} is not negative`,
  bigIntNonPositiveError: (value: bigint) => `${value} is not negative`,
  bigIntMultipleOfError: (value: bigint, multipleOf: bigint) =>
    `${value} is not a multiple of ${multipleOf}`,
  afterError: (value: Date, afterDate: Date) => `'${value}' is not after '${afterDate}'`,
  beforeError: (value: Date, beforeDate: Date) => `'${value}' is not after '${beforeDate}'`,
  invalidArrayElementsFnError(
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
  extraArrayItemsFnError: (value: unknown[], extraElementFoundStartingAtIndex: number) =>
    `${stringify(value)} contains extra elements starting at ${extraElementFoundStartingAtIndex}`,
  arrayDefinitionElementMustBeOptionalError: (value: unknown[], index: number) =>
    `the required element at index: ${index} cannot follow an optional element`,
  elementRequiredAtError: (value: unknown[], index: number) =>
    `no element found at index: ${index} and one is required`,
  restCantFollowRestError: (value: unknown[], index: number) =>
    `the rest element found at index: ${index} cannot follow another rest element`,
  optionalElementCantFollowRestError: (value: unknown[], index: number) =>
    `the optional element found at index: ${index} cannot follow a rest element`,
  parseArrayError: (value: unknown, arrayType: string) =>
    `${stringify(value)} is not of type :${arrayType}`,
  parseObjectError: (value: unknown) => `${stringify(value)} is not an object`,
  parseKnownObjectError: (value: unknown, objectType: string) =>
    `${stringify(value)} is not of type :${objectType}`,
  // invalidObjectPropertiesFnError(
  //   invalidValue: object,
  //   objectTypeString: string,
  //   errors: SingleObjectValidationError[],
  // ) {
  //   const elementString = errors
  //     .map(([item, itemErrors]) =>
  //       itemErrors.map((error) => `\n${stringify(item)}: ${error}`).join(''),
  //     )
  //     .join(', ')
  //   return `The object ${stringify(
  //     invalidValue,
  //   )} is not of type ${objectTypeString}.${elementString}`
  // },
  missingPropertyError: (value: object, property: PropertyKey) =>
    `property: ${stringify(property)} not found in ${stringify(value)}`,
  // missingPropertyInDefError: (value: object, property: PropertyKey) =>
  //   `property: ${stringify(property)} not found in object definition: ${stringify(value)}`,
  extraKeysFoundError: (
    value: object,
    extraKeys: (string | symbol)[],
    _objectDef: MinimumObjectDefinition,
  ) => `${stringify(value)} contains the following extra properties:${stringify(extraKeys)}`,
  missingItemInItemSchemasError: (value: unknown[], key: PropertyKey) =>
    `item: ${stringify(key)} not found in ${stringify(value)}`,
  unableToSelectItemFromArrayError: (_value: MinimumSchema, _keys: PropertyKey[]) =>
    `unable to select items from an infinite array`,
  keyNotFoundInDiscriminatedUnionDefError: (key: PropertyKey, unionDefType: string) =>
    `property '${String(key)}' not found in object definition: ${unionDefType}`,
  // keyNotFoundInDiscriminatedUnion: (property: string, value: object) =>
  //   `property '${property}' not found in object: ${stringify(value)}`,
  noKeyMatchFoundInDiscriminatedUnionError: (
    value: object,
    keys: string[],
    _schemas: MinimumObjectSchema[],
  ) => `no key matches for the discriminatedUnionKey(s): ${keys} found in: ${stringify(value)}`,
  noMatchFoundInUnionError: (value: unknown, _schemas: MinimumSchema[]) =>
    `no schemas matched: ${stringify(value)}`,

  // schemaIsNotObjectSchema: (schema: MinimumSchema) =>
  //   `${stringify(schema)} is not an object schema`,
  // discriminatedUnionValueIsNotAnObjectError: (value: unknown) =>
  //   `value ${stringify(value)} is not of type object`,

  noMatchFoundInLiteralUnionError: (value: unknown, literalUnionDef: readonly unknown[]) =>
    `value ${stringify(value)} not found in: ${stringify(literalUnionDef)}`,
  parseMapError: (value: unknown) => `${stringify(value)} is not an instance of a Map`,
  minimumMapLengthError: (value: Map<unknown, unknown>, minLength: number) =>
    `${value.size} is less elements than the minimum of ${minLength}`,
  maximumMapLengthError: (value: Map<unknown, unknown>, maxLength: number) =>
    `${value.size} is more elements than the maximum of ${maxLength}`,
  requiredMapLengthError: (value: Map<unknown, unknown>, requiredLength: number) =>
    `${value.size} is not the required ${requiredLength} elements`,
  mapNonEmptyError: (value: Map<unknown, unknown>) =>
    `${stringify(value)} must contain at least one element`,
  parseSetError: (value: unknown) => `${stringify(value)} is not an instance of a Set`,
  minimumSetLengthError: (value: Set<unknown>, minLength: number) =>
    `${value.size} is less elements than the minimum of ${minLength}`,
  maximumSetLengthError: (value: Set<unknown>, maxLength: number) =>
    `${value.size} is more elements than the maximum of ${maxLength}`,
  requiredSetLengthError: (value: Set<unknown>, requiredLength: number) =>
    `${value.size} is not the required ${requiredLength} elements`,
  setNonEmptyError: (value: Set<unknown>) =>
    `${stringify(value)} must contain at least one element`,
  parsePromiseError: (value: unknown) =>
    `${stringify(value)} doesn't have a 'then' and 'catch' method`,
  parseRecordError: (value: unknown) => `${stringify(value)} is not a valid object`,
  parseFunctionError: (value: unknown) => `${stringify(value)} is not a valid function`,
  parseCustomError: (value: unknown) => `${stringify(value)} could not be parsed`,
  parseTrueError: (value: unknown) => `${stringify(value)} is not true`,
  parseFalseError: (value: unknown) => `${stringify(value)} is not false`,
}

export default defaultErrorFn

export type DefaultErrorFn = typeof defaultErrorFn
