<p align="center">
<img src="https://user-images.githubusercontent.com/5828281/236115570-07315f34-edbe-471c-8d18-f735324b32fe.png" height="150">
</p>

# Introduction

Dilav is a blazing fast way to transforms `unknown` types, into valid known typescript types. Similar to how Typescript provides type assurance at compile time, Dilav provides type assurance at run-time. Dilav is a heteropalindrome of valid.

- [Introduction](#introduction)
  - [Why I created this project](#why-i-created-this-project)
  - [Relationship to Zod](#relationship-to-zod)
  - [Status](#status)
  - [Advantages of Dilav](#advantages-of-dilav)
- [Installation](#installation)
  - [Requirements](#requirements)
  - [npm install](#npm-install)
  - [Basic usage](#basic-usage)
- [Documentation](#documentation)
  - [Primitives](#primitives)
  - [Coercion for primitives](#coercion-for-primitives)
  - [Literals](#literals)
  - [Special Literal Types](#special-literal-types)
    - [NaN](#nan)
    - [Null](#null)
    - [Nullish](#nullish)
    - [Any](#any)
    - [Unknown](#unknown)
    - [Never](#never)
    - [Void](#void)
    - [Undefined](#undefined)
  - [Strings](#strings)
    - [ISO datetimes](#iso-datetimes)
    - [`v.customize.string`](#vcustomizestring)
  - [Numbers](#numbers)
    - [`v.customize.number`](#vcustomizenumber)
  - [BigInts](#bigints)
    - [`v.customize.bigInt`](#vcustomizebigint)
  - [Booleans](#booleans)
    - [`v.customize.boolean`](#vcustomizeboolean)
  - [Dates](#dates)
    - [`v.customize.date`](#vcustomizedate)
  - [Enums](#enums)
    - [`string` enums](#string-enums)
    - [Typescript enums](#typescript-enums)
    - [`const` enums](#const-enums)
  - [Optionals](#optionals)
  - [Nullables](#nullables)
  - [Nullishables](#nullishables)
  - [Objects](#objects)
    - [`.definition`](#definition)
    - [`.extends`](#extends)
    - [`.merge`](#merge)
    - [`.pick/.omit`](#pickomit)
    - [`.partial`](#partial)
    - [`.deepPartial`](#deeppartial)
    - [`.required`](#required)
    - [`.passThrough`](#passthrough)
    - [`.strict`](#strict)
    - [`.catchAll`](#catchall)
    - [`v.object`](#vobject)
  - [Arrays](#arrays)
    - [.definition](#definition-1)
    - [validations](#validations)
    - [`.spread`](#spread)
    - [`v.array`](#varray)
  - [Unions](#unions)
    - [Discriminated Unions](#discriminated-unions)
    - [String Literal Unions](#string-literal-unions)
  - [Intersections](#intersections)
  - [Promises](#promises)
  - [InstanceOfs](#instanceofs)
  - [Records](#records)
  - [Maps](#maps)
  - [Sets](#sets)
  - [Recursive types](#recursive-types)
  - [Functions](#functions)
  - [Custom Schemas](#custom-schemas)
  - [Schema Methods](#schema-methods)
    - [`.parse`](#parse)
    - [`.parseAsync`](#parseasync)
    - [`.safeParse`](#safeparse)
    - [`.safeParseAsync`](#safeparseasync)
    - [`.optional`](#optional)
    - [`.nullable`](#nullable)
    - [`.nullish`](#nullish-1)
    - [`.array`](#array)
    - [`.promise`](#promise)
    - [`.or`](#or)
    - [`.and`](#and)
    - [`.pipe`](#pipe)
    - [`.type`](#type)
    - [`.baseType`](#basetype)
    - [`.customValidation`](#customvalidation)
    - [`.customValidationAsync`](#customvalidationasync)
    - [transformation methods](#transformation-methods)
      - [`.preprocess`](#preprocess)
      - [`.postprocess`](#postprocess)
      - [`.transform`](#transform)
      - [`.catch`](#catch)
      - [`.default`](#default)
  - [Other Topics](#other-topics)
    - [Type inference](#type-inference)
    - [Writing generic functions](#writing-generic-functions)
    - [Error handling](#error-handling)
      - [`DefaultErrorFn`](#defaulterrorfn)

## Why I created this project

I'm currently looking for emplyment and to showcase my skills I developed this project. If you like it and know of someone needing similar projects created, please contact me.

## Relationship to Zod

In developing Dilav, Zod's excellent public API was leveraged, meaning Dilav provides near functional parity to Zod and it passes most of Zod's tests with minor changes. Dilav was written from scratch and shares no code with Zod, other than a few string validation `regex's`

Whilst the APIs are similar, Dilav includes significant changes and is therefore not a drop in replacement.

The benchmarks in the test folder shows Dilav is ~280% faster on my computer for Benchmark 1 which parses objects and arrays and 980% faster for Benchmark 2 which parses only a string and 300% faster for Benchmark 3 which only parses a string. These numbers appear high to me and I haven't yet fully explored why they are so high, so they should be taken with a pinch of salt.

Zod has ~3,950 lines of JavaScript code and Dilav has ~2,900.

**Select API changes from Zod:**

- `v.object` by default returns the original object and not a new object
- `v.object` by default doesn't allow unspecified properties
- `z.tuple` functionality has been merged into `v.array`
- `z.discriminatedUnion` functionality was merged into `v.union`
- `z.nativeEnum` functionality was merged into `v.enum`
- `safeParse` instead of returning an object, returns an array of type `ResultError`
- most primitives do not need to be called - `v.string` vs `z.string()`
- customisation of errors is done via functions that return strings, rather than strings, providing more flexibility
- minor capitalisation and spelling changes to methods
- `z.ZodType` is split across multiple types
- `.refine` and `z.superRefine` are replaced by `.customValidation`, `.preprocess` and `.postprocess` enabling customisation of input values, validations, errors and return values
- `.describe` not implemented
- `.brand` not implemented

## Status

Dilav is in it's first alpha release, to seek feedback from people who may be interested in the project. There are a number of things that may be improved in the public API in subsequent releases. I'm also considering releasing an even more performance focused API. Dilav follows Zod's example with regards to async validations, but the API could be better so I may rework that API entirely.

## Advantages of Dilav

- It's performant
- It's small
- It has no dependencies
- It should be tree shakeable allowing one to use only the parts one needs
- It's architecture is simple, meaning once stabilised it should be highly reliable

# Installation

## Requirements

- TypeScript 5.0+!

- Enable `strict` mode in `tsconfig.json`:

  ```typescript
  {
    // ...
    "compilerOptions": {
      // ...
      "strict": true
    }
  }
  ```

## npm install

```sh
npm install dilav       # npm
```

## Basic usage

Creating a simple string schema

```typescript
import { v } from 'dilav'

// creating a schema for strings
const schema = v.string

// parsing
const willParseToString = schema.parse('hello') // => "hello"
const willThrow = schema.parse(12) // => throws an error

// safe parsing doesn't throw error if validation fails
const willParseSafely = schema.safeParse('hello') // => [ undefined, "hello" ]
const willParseSafely2 = schema.safeParse(12) // => [ {input: 12, errors: ['12 is not a string']}  ]
```

Creating an object schema

```typescript
import { v } from 'dilav'

const userSchema = v.object({ username: v.string })
type UserType = v.Infer<typeof userSchema> //  infers the schema type: { username: string }
const user = userSchema.parse({ username: 'Fred' }) // => { username: 'Fred' }
```

# Documentation

## Primitives

```typescript
// primitive values
v.string.parse('a')
v.number.parse(1)
v.bigInt.parse(2n)
v.boolean.parse(true)
v.date.parse(new Date())
v.symbol.parse(Symbol('x'))
v.undefined.parse(undefined)
v.null.parse(null)
// catch-all types allows any value
v.any.parse('whatever')
v.unknown.parse('anything')
// never type allows no values
v.never.parse('will throw!') // throws
```

## Coercion for primitives

Dilav provides convenient ways to coerce primitive values:

```typescript
const schema = v.string.coerce
schema.parse('fred') // => "fred"
schema.parse(13) // => "13"
schema.parse(false) // => "false"
schema.email().min(5).parse('notEmail') // throws
```

These primitive schemas support coercion:

```typescript
v.string.coerce.parse(true) // String(input)
v.number.coerce.parse(true) // Number(input)
v.boolean.coerce.parse('1') // Boolean(input)
v.bigInt.coerce.parse('1') // BigInt(input)
v.date.coerce.parse('1') // new Date(input)
```

## Literals

Literal schemas represent a [literal type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types) and only parse that exact type.

```typescript
v.literal('hello').parse('hello')
v.literal(7).parse(7)
v.literal(3n).parse(3n)
const aObject = { a: 1 }
v.literal(aObject).parse(aObject)
const aSymbol = Symbol('a')
v.literal(aSymbol).parse(aSymbol)
const aDate = new Date()
v.literal(aDate).parse(aDate)
// retrieve literal value
v.literal('hello').definition.literal // => 'hello'
```

## Special Literal Types

### NaN

```typescript
v.NaN.parse(NaN)
v.customize.NaN({ invalidValueFn: (value) => `${value} is not NaN` }).parse(1) // throws
```

### Null

```typescript
v.null.parse(null)
v.customize.null({ invalidValueFn: (value) => `${value} is not null` }).parse(1) // throws
```

### Nullish

```typescript
v.nullish.parse(null)
v.nullish.parse(undefined)
// NOTE the .nullishL not .nullish
v.customize.nullishL({ invalidValueFn: (value) => `${value} is not nullish` }).parse(1) // throws
```

### Any

```typescript
v.any.parse('hello')
```

### Unknown

```typescript
v.unknown.parse('hello')
```

### Never

```typescript
v.never.parse(1) // throws
v.customize.never({ invalidValueFn: (value) => `${value} is not never` }).parse(1) // throws
```

### Void

```typescript
v.void.parse()
v.void.parse(undefined)
v.customize.void({ invalidValueFn: (value) => `${value} is not void` }).parse(1) // throws
```

### Undefined

```typescript
v.undefined.parse(undefined)
v.customize.undefined({ invalidValueFn: (value) => `${value} is not undefined` }).parse(1) // throws
```

## Strings

```typescript
v.string.parse('abc')
v.string.email().parse('a@a.com') // => 'a@a.com'
v.string.coerce.parse(1) // => '1'

// a function can be provided that returns a custom error message:
const foo = v.string.custom({ parseStringError: (value) => `didn't parse` }).safeParse(1)
const fooError = v.firstErrorFromResultError(foo) // => `didn't parse`
```

Dilav includes the following string-specific validations:

```typescript
// validations
v.string.max(5).parse('12345')
v.string.min(5).parse('12345')
v.string.length(5).parse('12345')
v.string.email().parse('email@email.com')
v.string.url().parse('http://url.com')
v.string.emoji().parse('😀')
v.string.uuid().parse('123e4567-e89b-12d3-a456-426614174000')
v.string.cuid().parse('ch72gsb320000udocl363eofy')
v.string.cuid2().parse('tz4a98xxat96iws9zmbrgj3a')
v.string.ulid().parse('01ARZ3NDEKTSV4RRFFQ69G5FAV')
v.string.regex(/.*/).parse('ABC')
v.string.includes('A').parse('ABC')
v.string.startsWith('A').parse('ABC')
v.string.endsWith('C').parse('ABC')
v.string.datetime().parse('2020-01-01T00:00:00Z')
v.string.ip().parse('192.168.1.1')
v.string.ipv4().parse('192.168.1.1')
v.string.ipv6().parse('2001:0db8:0000:0000:0000:ff00:0042:8329')
v.string.notEmpty().parse('ABC')

// custom validations can be added:
v.string
  .customValidation((stringValue) =>
    stringValue === stringValue.toUpperCase() ? undefined : 'error',
  )
  .parse('ABC')
```

One can often provide customised validation error messages when adding a validation:

```typescript
v.string.max(5, (value) => `${value} is too long!`).parse('12345')
```

String validations have the following call signatures:

```typescript
type ValidationError = string
type StringValidationFn = (value: string) => ValidationError | undefined
```

- `max(length: number, errorFn?: DefaultErrorFn['maximumStringLength']): StringValidationFn`
- `min(length: number, errorFn?: DefaultErrorFn['minimumStringLength']): StringValidationFn`
- `length(length: number, errorFn?: DefaultErrorFn['stringLength']): StringValidationFn`
- `notEmpty(errorFn?: DefaultErrorFn['notEmptyString']): StringValidationFn`
- `beOneOf(items: string[], errorFn?: DefaultErrorFn['beOneOf']): StringValidationFn`
- `regex(regex: RegExp, invalidFn?: DefaultErrorFn['maximumStringLength']): StringValidationFn`
- `email(errorFn?: DefaultErrorFn['validEmail']): StringValidationFn`
- `cuid(errorFn?: DefaultErrorFn['validCuid']): StringValidationFn`
- `cuid2(errorFn?: DefaultErrorFn['validCuid2']): StringValidationFn`
- `uuid(errorFn?: DefaultErrorFn['validUuid']): StringValidationFn`
- `url(errorFn?: DefaultErrorFn['validURL']): StringValidationFn`
- `ulid(errorFn?: DefaultErrorFn['validUlid']): StringValidationFn`
- `emoji(errorFn?: DefaultErrorFn['validEmoji']): StringValidationFn`
- `ipv4(errorFn?: DefaultErrorFn['validIpv4']): StringValidationFn`
- `ipv6(errorFn?: DefaultErrorFn['validIpv6']): StringValidationFn`
- `ip(invalidIpFn?: DefaultErrorFn['validIp']): StringValidationFn`
- `datetime(options?: {  precision?: number;  offset?: boolean;    validDateTimeFn?: DefaultErrorFn['validDateTime']}): StringValidationFn`
- `includes(includedString: string, position?: number, errorFn?: DefaultErrorFn['includes']): StringValidationFn`
- `startsWith(startString: string, errorFn?: DefaultErrorFn['startsWith']): StringValidationFn`
- `endsWith(endString: string, errorFn?: DefaultErrorFn['endsWith']): StringValidationFn`

[DefaultErrorFn](#defaulterrorfn) contains all validation error messages with are used, and which can be customised.

### ISO datetimes

The `v.string.datetime()` method defaults to UTC validation: no timezone offsets with arbitrary sub-second decimal precision.

```typescript
const datetime = v.string.datetime()

datetime.parse('2020-01-01T00:00:00Z')
datetime.parse('2020-01-01T00:00:00.123Z')
datetime.parse('2020-01-01T00:00:00.123456Z')
expect(() => datetime.parse('2020-01-01T00:00:00+02:00')).toThrow()
```

Timezone offsets can be allowed by setting the `offset` option to `true`.

```typescript
const datetime = v.string.datetime({ offset: true })

datetime.parse('2020-01-01T00:00:00+02:00')
datetime.parse('2020-01-01T00:00:00.123+02:00')
datetime.parse('2020-01-01T00:00:00.123+0200')
datetime.parse('2020-01-01T00:00:00.123+02')
datetime.parse('2020-01-01T00:00:00Z')
```

You can additionally constrain the allowable `precision`. By default, arbitrary sub-second precision is supported.

```typescript
const datetime = v.string.datetime({ precision: 3 })

datetime.parse('2020-01-01T00:00:00.123Z')
expect(() => datetime.parse('2020-01-01T00:00:00.123456Z')).toThrow()
expect(() => datetime.parse('2020-01-01T00:00:00Z')).toThrow()
```

### `v.customize.string`

```typescript
v.customize.string(
  options?: {
    parseStringError? : (value: unknown) => string,  // function that returns a string on parsing error
  })
```

## Numbers

Includes a handful of number-specific validations:

```typescript
v.number.gt(5).parse(6)
v.number.gte(5).parse(5) // alias .min(5)
v.number.lt(5).parse(4)
v.number.lte(5).parse(5) // alias .max(5)

v.number.int().parse(5) // value must be an integer

v.number.positive().parse(1) //  > 0
v.number.nonnegative().parse(0) //  >= 0
v.number.negative().parse(-1) //  < 0
v.number.nonpositive().parse(0) //  <= 0

v.number.multipleOf(5).parse(25) // Evenly divisible by 5. Alias .step(5)

v.number.finite().parse(1) // value must be finite, not Infinity or -Infinity
v.number.safe() // value must be between Number.MIN_SAFE_INTEGER and Number.MAX_SAFE_INTEGER
```

Number validations have the following call signatures:

```typescript
type ValidationError = string
type NumberValidationFn = (value: number) => ValidationError | undefined
```

- `greaterThan(number: number, errorFn?: DefaultErrorFn['greaterThan']): NumberValidationFn;`
- `greaterThanOrEqualTo(number: number, errorFn?: DefaultErrorFn['greaterThanOrEqualTo']): NumberValidationFn;`
- `lesserThan(number: number, errorFn?: DefaultErrorFn['lesserThan']): NumberValidationFn;`
- `lesserThanOrEqualTo(number: number, errorFn?: DefaultErrorFn['lesserThanOrEqualTo']): NumberValidationFn;`
- `integer(errorFn?: DefaultErrorFn['integer']): NumberValidationFn;`
- `positive(errorFn?: DefaultErrorFn['positive']): NumberValidationFn;`
- `nonNegative(errorFn?: DefaultErrorFn['nonNegative']): NumberValidationFn;`
- `negative(errorFn?: DefaultErrorFn['negative']): NumberValidationFn;`
- `nonPositive(errorFn?: DefaultErrorFn['nonPositive']): NumberValidationFn;`
- `notNaN(errorFn?: DefaultErrorFn['notNaN']): NumberValidationFn;`
- `multipleOf(number: number, errorFn?: DefaultErrorFn['multipleOf']): NumberValidationFn;`
- `finite(errorFn?: DefaultErrorFn['finite']): NumberValidationFn;`
- `safe(errorFn?: DefaultErrorFn['safe']): NumberValidationFn;`

[DefaultErrorFn](#defaulterrorfn) contains all validation error messages with are used, and which can be customised.

### `v.customize.number`

```typescript
v.customize.number(
  options?: {
    parseNumberError? : (value: unknown) => string,  // function that returns string on parsing error
  }) // => v.Number
```

## BigInts

Dilav includes a handful of bigint-specific validations.

```typescript
v.bigInt.gt(5n)
v.bigInt.gte(5n) // alias `.min(5n)`
v.bigInt.lt(5n)
v.bigInt.lte(5n) // alias `.max(5n)`

v.bigInt.positive() // > 0n
v.bigInt.nonNegative() // >= 0n
v.bigInt.negative() // < 0n
v.bigInt.nonPositive() // <= 0n
```

```typescript
type ValidationError = string
type BigIntValidationFn = (value: bigint) => ValidationError | undefined
```

- `greaterThan(bigint: bigint, errorFn?: DefaultErrorFn['bigIntGreaterThan']): BigIntValidationFn`
- `greaterThanOrEqualTo(bigint: bigint,errorFn?: DefaultErrorFn['bigIntGreaterThanOrEqualTo']): BigIntValidationFn`
- `lesserThan(bigint: bigint, errorFn?: DefaultErrorFn['bigIntLesserThan']): BigIntValidationFn`
- `lesserThanOrEqualTo(bigint: bigint,errorFn?: DefaultErrorFn['bigIntLesserThanOrEqualTo']): BigIntValidationFn`
- `integer(errorFn?: DefaultErrorFn['bigIntInteger']): BigIntValidationFn`
- `positive(errorFn?: DefaultErrorFn['bigIntPositive']): BigIntValidationFn`
- `nonNegative(errorFn?: DefaultErrorFn['bigIntNonNegative']): BigIntValidationFn`
- `negative(errorFn?: DefaultErrorFn['bigIntNegative']): BigIntValidationFn`
- `nonPositive(errorFn?: DefaultErrorFn['bigIntNonPositive']): BigIntValidationFn`

[DefaultErrorFn](#defaulterrorfn) contains all validation error messages with are used, and which can be customised.

### `v.customize.bigInt`

```typescript
v.customize.bigInt(
  options?: {
    parseBigIntError? : (value: unknown) => string,  // function that returns string on parsing error
  }) // => v.BigInt
```

## Booleans

```typescript
v.boolean.parse(true)
v.boolean.beTrue().parse(true)
v.boolean.beFalse().parse(false)
```

### `v.customize.boolean`

```typescript
v.customize.bigInt(
  options: {
    parseBigIntError? : (value: unknown) => string,  // function that returns string on parsing error
  }) // => v.BigInt
```

## Dates

`v.date` validates `Date` instances.

```typescript
v.date.parse(new Date())
v.date.parse('2022-01-12T00:00:00.000Z') // throws
```

The following date-specific validations are provided:

```typescript
v.date.min(new Date('1900-01-01'), (value) => `${value} too old`)
v.date.max(new Date(), (value) => `${value} too young`)
```

**Coercion to Date**

`v.coerce.date` passes the input through `new Date(input)`.

```typescript
const dateSchema = v.date.coerce

dateSchema.parse('2023-01-11T00:00:01.000Z')
dateSchema.parse('2023-01-11')
dateSchema.parse('1/11/23')
dateSchema.parse(new Date('1/11/23'))

/* invalid dates */
dateSchema.parse('2023-13-11') // throws
dateSchema.parse('0000-00-00') // throws
```

### `v.customize.date`

```typescript
v.customize.date(
  options?: {
    parseDateError? : (value: unknown) => string,  // function that returns string on parsing error
  }) // => v.Date
```

## Enums

Dilav supports three types of enums: `string` enums, Typescript enums and `const` enums.

### `string` enums

```typescript
const animalTypes1 = v.enum(['Dog', 'Cat', 'Fish'])
// equivalent to :
const animalTypes2 = v.union(['Dog', 'Cat', 'Fish'], { stringLiteralUnion: true })

type AnimalTypes = v.Infer<typeof animalTypes1> // "Dog" | "Cat" | "Fish"
animalTypes1.parse('Dog') // => 'Dog'
expect(() => animalTypes1.parse('dog')).toThrow() // => throws
console.log(animalTypes1.definition.unionTypes) // => ['Dog', 'Cat', 'Fish']
console.log(animalTypes1.enum) // => {Dog: 'Dog', Cat: 'Cat', Fish: 'Fish'}
console.log(animalTypes1.enum.Dog === 'Dog') // => true
```

Due to limitations of Typescript, Dilav enums can't correctly infer string arrays of type `string[]`, and so the `as const` modifier is required:

```typescript
const animalTypes = ['Dog', 'Cat', 'Fish'] as const // as const is required
const animalEnum = v.enum(animalTypes)
```

A second options parameter may be passed to `v.enum` of the type:

`{ parseStringUnion?: DefaultErrorFn['parseStringUnion'] }`

### Typescript enums

Typescript enums takes a typescript enum or any valid object as input, and on parsing if it finds a matching value (default) or key, it returns the matched value or key.

```typescript
enum fooEnum {
  Cat = 1,
  Dog,
}
const fooEnumSchema = v.enum(fooEnum)
type FooEnumSchema = v.Infer<typeof fooEnumSchema> // fooEnum
const x1 = fooEnumSchema.parse('Cat') // => 'Cat'
const x2 = fooEnumSchema.parse(1) // => 1
fooEnumSchema.parse('Rat') // throws
console.log(fooEnumSchema.enum) // => the original fooEnum
```

A second options parameter may be passed to `v.enum` of the type: `{ parseEnumError?: DefaultErrorFn['parseEnum']; matchType?: 'keyOnly' | 'valueOnly' | 'either'  }`

The `matchType` option specifies whether the value should be matched on property key, or property value, or both. The default is`'valueOnly'`

### `const` enums

It also works with `const` objects:

```typescript
const fooEnum = {
  Cat: 1,
  Dog: 'Dog',
} as const
const fooEnumSchema = v.enum(fooEnum)
type FooEnumSchema = v.Infer<typeof fooEnumSchema> // 1 | "Dog"
fooEnumSchema.parse(1)
fooEnumSchema.parse('Dog')
fooEnumSchema.parse('Cat') // throws
fooEnumSchema.parse('Rat') // throws
console.log(fooEnumSchema.enum) // => the original fooEnum
```

A second options parameter may be passed to `v.enum` of the type: `{ parseEnumError?: DefaultErrorFn['parseEnum']; matchType?: 'keyOnly' | 'valueOnly' | 'either'  }`

The `matchType` option specifies whether the value should be matched on property key, or property value, or both. The default is`'valueOnly'`

## Optionals

Schemas can be made optional with `v.optional()`.

```typescript
const schema = v.optional(v.string)
schema.parse(undefined) // => returns undefined
type Schema = v.Infer<typeof schema> // string | undefined
```

Equivalently one can also call the `.optional()` method on an existing schema.

```typescript
const user = v.object({
  username: v.string.optional(),
})
type User = v.Infer<typeof user> // { username?: string | undefined };
```

The wrapped schema can be extracted via `.definition.wrappedSchema`

```typescript
const stringSchema = v.string
const optionalString = stringSchema.optional()
optionalString.definition.wrappedSchema // => stringSchema

// alternatively one can extract it via:
const unwrappedSchema = optionalString.required()
```

## Nullables

`nullable` types can be created with `v.nullable`:

```typescript
const nullableString = v.nullable(v.string)
nullableString.parse('asdf') // => "asdf"
nullableString.parse(null) // => null
```

Or use the `.nullable()` method.

```typescript
const schema = v.string.nullable()
type Schema = v.Infer<typeof schema> // string | null
```

The wrapped schema can be extracted via `.definition.wrappedSchema`

```typescript
const stringSchema = v.string
const nullableString = stringSchema.nullable()
nullableString.definition.wrappedSchema // => stringSchema
```

## Nullishables

`nullish` type `(value|undefined|null)` can be created with `v.nullishable`:

```typescript
const nullishString = v.nullishable(v.string)
nullishString.parse('asdf') // => "asdf"
nullishString.parse(null) // => null
nullishString.parse(undefined) // => undefined
```

Or use the `.nullish()` method.

```typescript
const schema = v.string.nullish()
type Schema = v.Infer<typeof schema> // string | null | undefined
```

The wrapped schema can be extracted via `.definition.wrappedSchema`

```typescript
const nullishString = v.string.nullish()
nullishString.definition.wrappedSchema // => v.string
```

## Objects

Dilav parses the object provided and by default returns the original object. However if a [transformation method](#transformation-methods) is applied to any one of the properties, then a new object is returned with the transformed value(s), and copies of all other properties.

```typescript
const foo = v.object({
  name: v.string,
  age: v.number,
})
type Foo = v.Infer<typeof foo> // {  name: string; age: number; }

// The `unmatchedPropertySchema` is used to parse all unmatched properties of an object.
// if omitted the default is v.never - meaning no additional properties are permitted.
const bar = v.object({ name: v.string }, v.any)
type Bar = v.Infer<typeof bar> // { name: string } & { [P: keyof any]: any; }
```

### `.definition`

Use `.definition.propertySchemas` to access the schema for a particular key.

```typescript
foo.definition.propertySchemas.name.parse('string') // => string schema
foo.definition.propertySchemas.age.parse(1) // => number schema
foo.definition.unmatchedPropertySchema.parse(1) // => never, so throws
```

### `.extends`

Additional fields can be added to an object schema with the `.extend` method.

```typescript
const fooWithType = foo.extends({
  type: v.string,
}) // { name: string; age: number; type: string; }
```

`.extend` will overwrite any existing fields.

### `.merge`

Merges schemas and if they share keys, the properties of merged schema overrides the initial schema. The last schemas' `unmatchedPropertySchema` will be used.

```typescript
const foo = v.object({ items: v.array(v.string) })
const idObject = v.object({ id: v.number })

const fooWithId1 = foo.merge(idObject).parse({ items: ['A'], id: 1 })

// similar to:
const fooWithId2 = foo
  .extends(idObject.definition.propertySchemas, idObject.definition.unmatchedPropertySchema)
  .parse({ items: ['A'], id: 1 })
```

whilst similar, `.and` intersects each object and its properties, whereas merge overrides prior objects.

### `.pick/.omit`

Allows one to pick or omit certain keys from an object. Note this changes the schema, and will not impact any objects parsed by the changed schema. This means parsed objects will have to match the changed schema.

```typescript
const foo = v.object({
  id: v.string,
  name: v.string,
  owners: v.array(v.string),
})
const nameAndIdOnly = foo.pick('name', 'id') // { name: string;id: string; }

const omitIdAndName = foo.omit('name', 'id') // { owners: string[]; }
```

### `.partial`

Makes all properties optional.

```typescript
const foo = v.object({ email: v.string, name: v.string })
const partialFoo = foo.partial() //  { email?: string ; name?: string ; }
const partialName = foo.partial('name') //  { email: string ; name?: string ; }
```

### `.deepPartial`

`.partial` marks items one level down `optional`. and `.deepPartial` does it for all included objects and arrays.

```typescript
const foo = v.object({
  name: v.string,
  profile: v.object({ id: v.number }),
  items: v.array(v.object({ value: v.string })),
})

const deepPartialFoo = foo.deepPartial().parse({})
/* {
    name?: string | undefined;
    profile?: { id?: number | undefined; } | undefined;
    items?: {  value?: string | undefined; }[] | undefined;
} */
```

### `.required`

The `.required` method unwraps all `optional` properties. Only shallow.

```typescript
const foo = v.object({
  email: v.string.optional(),
  name: v.string.optional(),
})
// { email?: string | undefined; name?: string | undefined }
const requiredFoo = foo.required()
// { email: string; name: string; }
```

### `.passThrough`

By default object schemas set the `unmatchedPropertySchema` to `v.never`. `.passThrough` sets it to `v.unknown`. Equivalent to `.catchAll(v.unknown)`

```typescript
const foo = v.object({ name: v.string })

expect(() =>
  foo.parse({
    name: 'fred',
    extraProp: 12,
  }),
).toThrow()

foo.passThrough().parse({
  name: 'fred',
  extraProp: 12,
}) // => { name: string; } & {[P: keyof Any]: unknown; }
```

### `.strict`

Sets the `unmatchedPropertySchema` to `v.never`. Equivalent to `.catchAll(v.never)`

```typescript
const foo = v.object({ name: v.string }, v.unknown)

foo.parse({
  name: 'fred',
  extraProp: 12,
})

expect(() =>
  foo.strict().parse({
    name: 'fred',
    extraProp: 12,
  }),
).toThrow()
```

### `.catchAll`

Sets the `unmatchedPropertySchema` to any valid schema.

```typescript
const foo = v.object({ name: v.string }).catchAll(v.number)

foo.parse({
  name: 'fred',
  extraProp: 12,
}) // { name: string; } & { [P: keyof any]: number; }
```

### `v.object`

```typescript
v.object(
  propertySchemas: { [key: keyof any]: v.MinimumSchema },
  unmatchedPropertySchema?: v.MinimumSchema = v.Never,
  options?: {
    invalidObjectFn?: DefaultErrorFn['parseObject']
    invalidObjectPropertiesFn?: DefaultErrorFn['invalidObjectPropertiesFn']
    missingProperty?: DefaultErrorFn['missingProperty']
    missingPropertyInDef?: DefaultErrorFn['missingPropertyInDef']
  }) // => v.Object
```

## Arrays

Dilav parses the array provided and by default returns the original unaltered array. However if a [transformation method](#transformation-methods) is applied to any one of array item schemas, then a new array is returned with the transformed element(s).

```typescript
const array1 = v.array(v.string).parse([]) // string[]
// equivalent
const array2 = v.string.array().parse([]) // string[]

const array3 = v
  .array([v.string, v.number, v.array(v.string).spread, v.object({ items: v.number })])
  .parse(['a', 1, 'b', { items: 1 }]) // [string, number, ...string[], { items: number }]
```

### .definition

`.definition` accesses the schema for elements of the array.

```typescript
const itemSchema = v.array(v.string).definition.itemSchema.parse('string')
const secondElementInArray = v.array([v.string, v.number]).definition.itemSchemas[1].parse(1)
```

### validations

The following validations are supported:

```typescript
v.array(v.number).max(3).parse([1, 2, 3])
v.array(v.number).min(3).parse([1, 2, 3])
v.array(v.number).length(3).parse([1, 2, 3])
v.array(v.number).nonEmpty().parse([1])
v.array(v.number)
  .customValidation((arrayValue) => (arrayValue.includes(1) ? undefined : 'error'))
  .parse([1])
```

```typescript
// type call signatures:
type ValidationError = string
type ArrayValidationFn = (value: unknown[]) => ValidationError | undefined
```

- `minimumArrayLength(length: number, errorFn?: DefaultErrorFn['minimumArrayLength']): ArrayValidationFn`
- `maximumArrayLength(length: number, errorFn?: DefaultErrorFn['maximumArrayLength']): ArrayValidationFn`
- `requiredArrayLength(length: number,errorFn?: DefaultErrorFn['requiredArrayLength']): ArrayValidationFn`
- `nonEmpty(errorFn?: DefaultErrorFn['arrayNonEmpty']): ArrayValidationFn`

[DefaultErrorFn](#defaulterrorfn) contains all validation error messages with are used, and which can be customised.

### `.spread`

`.spread` within an array behaves similarly to the spread `...` in Typescript. A key limitation is that whilst multiple spreads are supported, only one can have an unknown length.

```typescript
const foo = v
  .array([v.string, v.number, v.array(v.string).spread, v.array([v.number, v.boolean]).spread])
  .parse(['a', 1, 'b', 1, true]) // [string, number, ...string[], number, boolean]
```

### `v.array`

```typescript
type ArrayOptions = {
  parseArray?: DefaultErrorFn['parseArray']
  invalidArrayElementsFn?: DefaultErrorFn['invalidArrayElementsFn']
  arrayDefinitionElementMustBeOptional?: DefaultErrorFn['arrayDefinitionElementMustBeOptional']
  elementRequiredAt?: DefaultErrorFn['elementRequiredAt']
  extraArrayItemsFn?: DefaultErrorFn['extraArrayItemsFn']
  restCantFollowRest?: DefaultErrorFn['restCantFollowRest']
  optionalElementCantFollowRest?: DefaultErrorFn['optionalElementCantFollowRest']
  missingItemInItemSchemas?: DefaultErrorFn['missingItemInItemSchemas']
  unableToSelectItemFromArray?: DefaultErrorFn['unableToSelectItemFromArray']
}
v.array(itemSchema: MinimumSchema, options?: ArrayOptions) // => v.ArrayInfinite
v.array(
  itemSchemas: (MinimumSchema|MinimumArrayRestSchema)[],
  options?: ArrayOptions
) // => v.ArrayFinite
```

## Unions

Unions work similar to the `|` in typescript. Each schema in the union tries to parse the value, and if one succeeds, the union parses, otherwise it will error.

```typescript
const stringOrBool1 = v.union([v.string, v.boolean]).parse('foo') // => string | boolean
// identical to:
const stringOrBool2 = v.string.or(v.boolean).parse(true) // => string | boolean
```

### Discriminated Unions

Unions for objects can be computationally expensive as each property of the object must be parsed for conformance. In situations where each object has a unique discriminating key, the parser can first test for a match on only that key, and only if a match occurs will the rest of the properties be parsed for conformance.

```typescript
const foo = v
  .union(
    [
      v.object({ type: v.literal('A'), data: v.string }),
      v.object({ type: v.literal('B'), result: v.string }),
    ],
    { discriminatedUnionKey: 'type' },
  )
  .parse({ type: 'A', data: 'A TYPE' })
// => { type: "A"; data: string } | { type: "B"; result: string }
```

### String Literal Unions

One could create a union of string literals and then parse against those, however Dilav includes a performance optimised way of parsing string only unions.

```typescript
const fooBar = v.union(['foo', 'bar'], { stringLiteralUnion: true }).parse('foo') // => 'foo' | 'bar'
// equivalent:
const fooBar = v.enum(['foo', 'bar']).parse('foo') // => 'foo' | 'bar'
```

## Intersections

Intersections are similar to `&` in Typescript. In general each item in the intersection must parse without error, for the intersection to successfully parse. By default, intersection errors on the first parsing error it encounters. If one requires a complete list of errors, one can set `{ breakOnFirstError: false }` as a second option to intersection.

```typescript
const foo1 = v.intersection([
  v.union(['A', 'B'], { stringLiteralUnion: true }),
  v.union(['B', 'C'], { stringLiteralUnion: true }),
]) // => ('A'|'B') & ('B'|'C') = 'B'

// equivalent to:
const foo2 = v
  .union(['A', 'B'], { stringLiteralUnion: true })
  .and(v.union(['B', 'C'], { stringLiteralUnion: true }))

const b = foo2.parse('B') // 'B'
expect(() => foo2.parse('A')).toThrow()
```

When intersecting only object schemas a new `object` schema is returned, with each property also intersected and with the `unmatchedPropertySchema` set to an intersection of all the objects `unmatchedPropertySchema`s

```typescript
const foo1 = v
  .intersection([v.object({ a: v.string }), v.object({ b: v.string })])
  .parse({ a: 'A', b: 'B' }) // => { a: 'A', b: 'B' }

// equivalent to:
const foo2 = v
  .object({ a: v.string })
  .and(v.object({ b: v.string }))
  .parse({ a: 'A', b: 'B' }) // => { a: 'A', b: 'B' }
```

When intersecting only infinite arrays the `itemParser`'s are intersected and a new array schema is returned

```typescript
const foo1 = v
  .intersection([v.array(v.object({ a: v.string })), v.array(v.object({ b: v.string }))])
  .parse([{ a: 'A', b: 'B' }]) // => [{ a: 'A', b: 'B' }]

// equivalent to:
const foo2 = v
  .array(v.object({ a: v.string }))
  .and(v.array(v.object({ b: v.string })))
  .parse([{ a: 'A', b: 'B' }]) // => [{ a: 'A', b: 'B' }]
```

## Promises

Promises parses as follows: the promise being parsed is validated for conformance to being PromiseLike - i.e. having a `.then` and `.catch` method. If not parsing will fail. The parser returns a new Promise that wraps the parsed Promise and which acts as a proxy Promise. When `.then` or `.catch` is called those methods are called on the parsed Promise. When `.then` returns a value, it is parsed and if successful it is returned, alternatively the proxy Promise will reject with the failed validation.

```typescript
const fooPromiseSchema = v.promise(v.string)
const fooPromise1 = fooPromiseSchema.parse(Promise.resolve('foo')) // => ValidatedPromise<string>
const result = await fooPromise1 // foo
const fooPromise2 = fooPromiseSchema.parse(Promise.resolve(1))
try {
  await fooPromise2
} catch (e) {
  expect(e.errors[0]).toEqual('1 is not a string')
}
```

A second options parameter may be passed to `v.promise` of the type:

`{ parsePromise: DefaultErrorFn['parsePromise'] }`

## InstanceOfs

Validates than an object is an `instanceOf` a particular class.

```typescript
class Foo {
  prop: string
}

const foo = v.instanceOf(Foo).parse(new Foo())
```

A second options parameter may be passed to `v.instanceOf` of the type:

`{ parseInstanceOf: DefaultErrorFn['parseInstanceOf'] }`

## Records

Record schemas are used to validate types such as `{ [k: string]: number }`.

```typescript
// if only one schema is supplied, it's assumed that only the values of the object will be validated:
const foo1 = v.record(v.number).parse({ a: 1 }) // Record<string, number>
expect(() => v.record(v.number).parse({ a: '1' })).toThrow()

// if two schemas are supplied, the first will validate the property name, and the second its value:
const foo2 = v.record(v.string.min(5), v.number).parse({ abcde: 1 }) // Record<string, number>
expect(() => v.record(v.string.min(5), v.number).parse({ a: 1 })).toThrow()
```

As JavaScript casts all object keys to strings at this time only object keys of type string are supported. One could create a custom validator to parse numerical string property names.

A third options parameter may be passed to `v.record` of the type:

`{ parseRecord?: DefaultErrorFn['parseRecord']; breakOnFirstError?: boolean  }`

## Maps

```typescript
const foo = v.map([v.string, v.number]).parse(new Map([['apple', 1]])) // => Map<string, number>
expect(() => v.map([v.string, v.number]).parse(new Map([['apple', '1']]))).toThrow()
```

Map schemas can be further constrained with the following validation methods.

```typescript
v.map([v.string, v.number])
  .nonempty()
  .parse(new Map([['apple', 1]])) // must contain at least one item
v.map([v.string, v.number])
  .min(1)
  .parse(new Map([['apple', 1]])) // must contain 1 or more items
v.map([v.string, v.number])
  .max(1)
  .parse(new Map([['apple', 1]])) // must contain 1 or fewer items
v.map([v.string, v.number])
  .size(1)
  .parse(new Map([['apple', 1]])) // must contain 1 items exactly
v.map([v.string, v.number])
  .customValidation((valueMap) => (valueMap.size === 1 ? undefined : 'error'))
  .parse(new Map([['apple', 1]]))
```

A second options parameter may be passed to `v.map` of the type:

`{ parseMap?: DefaultErrorFn['parseMap']; breakOnFirstError?: boolean  }`

## Sets

```typescript
const foo = v.set(v.number).parse(new Set([1])) // => Set<number>
expect(() => v.set(v.number).parse(new Set(['1']))).toThrow()
```

Set schemas can be further constrained with the following validation methods.

```typescript
v.set(v.number)
  .nonempty()
  .parse(new Set([1])) // must contain at least one item
v.set(v.number)
  .min(1)
  .parse(new Set([1])) // must contain 1 or more items
v.set(v.number)
  .max(1)
  .parse(new Set([1])) // must contain 1 or fewer items
v.set(v.number)
  .size(1)
  .parse(new Set([1])) // must contain 1 items exactly
v.set(v.number)
  .customValidation((valueSet) => (valueSet.size === 1 ? undefined : 'error'))
  .parse(new Set([1]))
```

A second options parameter may be passed to `v.set` of the type:

`{ parseSet?: DefaultErrorFn['parseSet']; breakOnFirstError?: boolean  }`

## Recursive types

Recursive schemas can be defined but their type can't be statically inferred and will have to be provided manually:

```typescript
const foo = v.object({ name: v.string })

interface RecursiveSchema extends v.Infer<typeof foo> {
  items: this[]
}

const recursiveSchema: v.Lazy<RecursiveSchema> = foo.extends({
  items: v.lazy(() => recursiveSchema.array()),
})

const x1 = recursiveSchema.parse({
  name: 'A',
  items: [
    {
      name: 'B',
      items: [
        {
          name: 'C',
          items: [],
        },
      ],
    },
  ],
})
```

Despite supporting recursive schemas, passing cyclical data will cause an infinite loop.

## Functions

Once can define function schemas that validate inputs and outputs of any function. Functions are defined as follows:

```typescript
const foo1 = v.function()
type Foo1 = v.Infer<typeof foo1> // => (...args: never[]) => never

const bar1 = v.function({ args: [v.string], returns: v.void }) // => (args_0: string) => void
// equivalent
const bar2 = v.function({ parameters: v.array([v.string]), returns: v.void }) // => (args_0: string) => void
// equivalent
const bar3 = v.function().args(v.string).returns(v.void)
// equivalent
const bar4 = v
  .function()
  .parameters(v.array([v.string]))
  .returns(v.void)

const validationFn = bar4.parse((arg) => (arg === 'undefined' ? undefined : arg))
validationFn('undefined')
expect(() => validationFn('a')).toThrow() // returns 'a' which fails validations
expect(() => validationFn(1 as unknown as string)).toThrow() // 1 is not a valid string
```

Parsing a function returns a function that by default wraps the original function within a validation function. One can control what is returned from parsing by specifying the `returnedFunction` option. Options include:

- `'validated'` - input parameter types and the output type is validated in the returned function (default).
- `'inputValidated'` - only input parameter types are validated in the returned function
- `'outputValidated'` - only the output type is validated in the returned function
- `'original'` - the original function is returned without any validations wrapped around it.

```typescript
const foo1 = v.function({ args: [v.string], returns: v.void }, { returnedFunction: 'original' })
const fn = foo1.parse((a) => a)
fn(1 as any) // returns 1 and won't throw as fn is not wrapped in a validation function.
```

The options parameter may also include:

`{ parseFunctionError?: DefaultErrorFn['parseFunction'] }`

One can access the input and output schemas from a function schema via:

```typescript
const foo = v.function({ args: [v.string], returns: v.boolean })
foo.definition.returns.parse(true) // return type
foo.definition.parameters.parse(['hello']) // parameter array type
```

## Custom Schemas

Custom schemas can be created by providing a function of type `(value:unknown)=>boolean` which returns `true` if the value is of the supplied type, or `false` if it is not.

```typescript
const pxSchema = v.custom<`${number}px`>((value) => /^\d+px$/.test(value as string))

type PxSchema = v.Infer<typeof pxSchema> // `${number}px`

pxSchema.parse('50px') // => "50px"
expect(() => pxSchema.parse('50vw')).toThrow() // throws;
```

A second options parameter may be passed to `v.custom` of the type: `DefaultErrorFn['parseCustom']` to control the error message returned.

## Schema Methods

Schemas contain the following shared methods:

### `.parse`

```typescript
.parse(data: unknown): T
```

The `.parse` parses the `data` and returns it if it is valid. Otherwise, an error is thrown.

```typescript
const stringSchema = v.string

stringSchema.parse('result') // => returns "result"
stringSchema.parse(123) // throws error
```

### `.parseAsync`

```typescript
.parseAsync(data:Promise<unknown>): Promise<T>
const stringSchema = v.string

const result = await stringSchema.parseAsync(Promise.resolve('result')) // => returns "result"
```

### `.safeParse`

```typescript
.safeParse(data:unknown): ResultError<T>
```

`.safeParse` parses the data and returns either a result or an error in the form of a `ResultError<T>` - see below.

```typescript
type ValidationErrors = {
  input: unknown
  errors: string[]
}
type ResultError<T> = [error: ValidationErrors, result?: undefined] | [error: undefined, result: T]

const foo = v.string.safeParse('hello') // => [undefined, 'hello']
const fooResult = v.resultFromResultError(foo) // => 'hello'
const bar = v.string.safeParse(12) // => [{ input: 12, errors: ["'12 is not a string'"] }, undefined]
const barError = v.errorFromResultError(bar) // => { input: 12, errors: ["'12 is not a string'"] }
const barErrorString = v.firstErrorFromResultError(bar) // => '12 is not a string'
```

The result is a _discriminated union_, of type `[error: ValidationErrors, result?: undefined] | [error: undefined, result: T]` so errors can be handled conveniently:

```typescript
const result = v.string.safeParse('world')
if (v.isError(result)) {
  // handle error case
  const errorResult = result[0] // =>  { input: unknown; errors: string[] }
  // equivalent:
  const errorResult2 = v.errorFromResultError(result) // =>  { input: unknown; errors: string[] }
  const firstErrorString = v.firstErrorFromResultError(result) // => string
  // equivalent:
  const firstErrorString2 = v.firstError(errorResult) // => string
} else {
  // handle success case
  const stringResult = result[1] // => string
  // equivalent:
  const stringResult2 = v.resultFromResultError(result) // => string
}
```

### `.safeParseAsync`

An asynchronous version of `safeParse`.

```typescript
await v.string.safeParseAsync(Promise.resolve('result')) // => returns [undefined, "result"]
```

### `.optional`

Returns an optional version of a schema.

```typescript
const optionalString = v.string.optional() // string | undefined
// equivalent to
v.optional(v.string)
```

### `.nullable`

Returns a nullable version of a schema.

```typescript
const nullableString = v.string.nullable() // string | null
// equivalent to
v.nullable(v.string)
```

### `.nullish`

Returns a "nullish" version of a schema.

```typescript
const nullishString = v.string.nullish() // string | null | undefined
// equivalent to
v.nullish(v.string)
```

### `.array`

Returns an array schema for the given type:

```typescript
const stringArray = v.string.array() // string[]
// equivalent to
v.array(v.string)
```

### `.promise`

Wraps schema in a promise schema:

```typescript
const stringPromise1 = v.string.promise() // Promise<string>
// equivalent to
v.promise(v.string)
```

### `.or`

Creates a union of schemas:

```typescript
const stringOrNumber = v.string.or(v.number) // string | number

// equivalent to
v.union([v.string, v.number])
```

### `.and`

Creates intersection types.

```typescript
const nameAndAge = z.object({ name: v.string }).and(v.object({ age: v.number })) // { name: string } & { age: number }

// equivalent to
v.intersection(v.object({ name: v.string }), v.object({ age: v.number }))
```

### `.pipe`

`.pipe()` - pipes the output from one schema into the input of another schema, making it possible to chain schemas together:

```typescript
const foo = v.string.pipe(
  v.union(['A', 'B'], { stringLiteralUnion: true }),
  v.union(['A'], { stringLiteralUnion: true }),
) // -> string -> 'A' | 'B' -> 'A'
foo.parse('A')
expect(() => foo.parse('B')).toThrow()

const schema = v.string.transform((str) => str.length).pipe(v.number.min(5))
const z = schema.parse('12345')
expect(() => schema.parse('1235')).toThrow()
```

`.pipe()` can work around some common issues with `coerce`:

```typescript
const toDate = v.date.coerce
v.isResult(toDate.safeParse(null)) // => true
const toDateSchema = v.union([v.number, v.string, v.date]).pipe(toDate)
v.isResult(toDateSchema.safeParse(null)) // => false

const toBigInt = v.bigInt.coerce
expect(() => toBigInt.safeParse(null)).toThrow() // => throws
const toBigIntSchema = v.union([v.string, v.number, v.bigInt, v.boolean]).pipe(toBigInt)
v.isResult(toBigIntSchema.safeParse(null)) // => false
```

### `.type`

A string of the schema type (warning: not properly tested yet!)

### `.baseType`

The Dilav schema type: `'infinite array' | 'finite array' | 'bigint' | 'boolean' | 'date' | 'enum' | 'instanceof' | 'intersection' | 'literal' | 'map' | 'set' | 'string' | 'symbol' | 'union' | 'discriminated union' | 'string union' | 'optional' | 'nullable' | 'nullish' | 'function' | 'object' | 'number' | 'promise' | 'record' | 'lazy' | 'preprocess' | 'postprocess' | 'custom'`

### `.customValidation`

All schemas have a `.customValidation` method, enabling one to supply any validation code that must be run as part of validation. A `customValidatorFn` must return a `string` which is the error message if validation fails, or `undefined` if validation passes.

```typescript
// customValidation<S extends unknown[]>( customValidatorFn: (value: Output, ...otherArgs: S)
//   =>ValidationError | undefined, ...otherArgs: S): Schema
// example:
v.string.customValidation((value) => (value === 'A' ? 'cannot be A' : undefined))
```

### `.customValidationAsync`

All schemas have a `.customValidationAsync` method, enabling one to supply any validation code that must be run asynchronously as part of validation. A `customValidatorFn` must return a promise which evaluates to either a `string` which is the error message if validation fails, or `undefined` if validation passes.

```typescript
// customValidationAsync<S extends unknown[]>( customValidatorFn: (value: Output, ...otherArgs: S)
//   => Promise<ValidationError | undefined>, ...otherArgs: S): Schema
// example:
v.string.customValidation(async (value) => ((await IsA(value)) ? 'cannot be A' : undefined))
```

### transformation methods

By default Dilav returns the original unaltered parsed value. However sometimes one wants to transform that input into another value. Dilav provides the transformation methods below for that.

Note: Dilav doesn't allow transformed types as inputs into `.and`, `.or`, `.union`, `.intersection`, `.partial`, `.deepPartial` as this may produce unexpected and surprising results as explained below.

**Note:** transformation methods in a way break the separation of concerns: Dilav validates that a value matches a type, whereas transformation methods transform a type. I included them because Zod includes them, however I may change my mind.

```typescript
// consider the illustrative example below.  The intersection could transform `undefined` into `A`
// even though `A` may be invalid, it could transform it into `B`, a third alternative would be to return
// the original input value of `undefined` as valid.
const example = v
  .intersection([v.enum(['A', 'B']).default('A'), v.enum(['B', 'C']).default('B')])
  .parse(undefined)

// the above is resolved by the following explicit solutions:
const alt1 = v
  .enum(['A', 'B'])
  .default('A')
  .pipe(v.intersection([v.enum(['A', 'B']), v.enum(['B', 'C'])]))
  .parse(undefined) // => throws
const alt2 = v
  .enum(['B', 'C'])
  .default('B')
  .pipe(v.intersection([v.enum(['A', 'B']), v.enum(['B', 'C'])]))
  .parse(undefined) // => B
const alt3 = v
  .union([v.intersection([v.enum(['A', 'B']), v.enum(['B', 'C'])]), v.undefined])
  .parse(undefined) // => undefined
```

#### `.preprocess`

Processes data before parsing

```typescript
// preprocess runs a function before parsing, the output of which is then parsed
v.number.preprocess((value) => (value as string).length).parse('hello') // => 5
```

#### `.postprocess`

Processes data after parsing and any validations. The input to the function is of type `ResultError` and it must return a value of type `ResultError`

```typescript
// postprocess runs a function after parsing, the output of which is then returned
v.string.postprocess(([error, value]) => [undefined, value?.toLowerCase()]).parse('HELLO') // => 'hello'
```

#### `.transform`

Processes data after parsing and any validations. It is similar to `.postprocess` except the error case is handled automatically.

```typescript
// transform runs a function after parsing, the output of which is then returned
v.string.transform((value) => value.toLowerCase()).parse('HELLO') // => 'hello'
```

#### `.catch`

Replaces an error value, with the value specified.

```typescript
// if parsing returns an error, catch replaces the error with the `catchValue`
v.string.catch('default on error').parse(1) // => 'default on error'

// catch with objects may produce surprising results:
const foo = v.object({ inner: v.string.catch('does change object') }).catch({
  inner: 'hello',
})
foo.parse(undefined)) // => { inner: 'hello' }
foo.parse({}) // => { inner: 'does change object' }
foo.parse({ inner: undefined }) // => { inner: 'does change object' }
```

#### `.default`

If the input value is undefined, a default value is substituted.

```typescript
// if value being parsed is undefined, then it is replaced with the `defaultValue` before parsing
v.string.default('default on undefined').parse(undefined) // => 'default on undefined'
```

## Other Topics

### Type inference

You can extract the Typescript type of any schema with `v.Infer<typeof mySchema>` .

```typescript
const stringSchema = v.string
type StringSchema = v.Infer<typeof stringSchema> // string

const foo1: StringSchema = 13 // error
const foo2: StringSchema = 'hello' // no error
```

### Writing generic functions

Dilav provides a number of types which one can use to write generics:

- `v.MinimumSchema` is the root type from which all other schemas inherit - so one can use it as a kind of `any` for schemas.
- `v.MinimumArraySchema` - the root type from which all array schemas inherit
- `v.MinimumObjectSchema` - the root type from which the object schema inherits
- `v.MinimumArrayRestSchema` - the root type for `v.array(...).spread`

All Dilav schemas have one of these types associated with them:

- `v.Boolean`
- `v.BigInt`
- `v.Date`
- `v.Enum`
- `v.InstanceOf`
- `v.Map`
- `v.Set`
- `v.Number`
- `v.Lazy`
- `v.Record`
- `v,String`
- `v.Symbol`
- `v.Function`
- `v.Custom`
- `v.Object`
- `v.Preprocess`
- `v.PostProcess`
- `v.Default`
- `v.Catch`
- `v.Union`
- `v.Optional`
- `v.Nullable`
- `v.Nullish`
- `v.Promise`
- `v.Intersection`
- `v.Literal`

- `v.VNaN` - the literal NaN
- `v.Undefined` - the literal undefined
- `v.Null`- the literal null
- `v.NullishL` - the literal null|undefined
- `v.Any` - the literal any
- `v.Unknown` - the literal unknown
- `v.Never` - the literal never
- `v.Void` - the literal void

```typescript
function validate<T extends v.MinimumSchema>(schema: T) {
  return (x) => schema.safeParse(x)
}
function foo<T extends v.String>(stringSchema: T) {
  return stringSchema.optional()
}
foo(v.string.max(1)).parse('a') // => string | undefined
```

### Error handling

Dilav provides a range of methods to customise it's error handling:

```typescript
// a custom error function(s) can be provided to schemas that have a .custom method:
const foo = v.string.custom({ parseStringError: () => `not a string!` }).safeParse(1)
if (v.isError(foo)) console.log(foo[0].errors[0]) // => `not a string!`

// a custom error function can also be provided for most validations:
const result2 = v.string.max(1, () => 'too long').safeParse('12')
if (v.isError(result2)) console.log(result2[0].errors[0]) // => `too long`
```

One can also set global error message functions:

```typescript
// alternatively error messages can be set globally that will be the default
// for all schemas not supplied with a custom error function.
v.setGlobalErrorMessages({ parseString: () => `that's not a string!` })
const foo = v.string.safeParse(1)
if (v.isError(foo)) console.log(foo[0].errors[0]) // => `that's not a string!`
```

Dilav provides some helper utilities for working with results and errors:

- `v.isError` - returns true if `ResultError` is an error, false otherwise
- `v.isResult` - returns true if `ResultError` is a result, false otherwise
- `v.firstError` - returns the first error from a `ValidationErrors` object.
- `v.firstErrorFromResultError` - returns the first error from a `ResultError` array. Throws if it's a result.
- `v.resultFromResultError` - returns the results from a `ResultError` array. Throws if it's an error.
- `v.errorFromResultError` - returns the `ValidationErrors` object from a `ResultError` array. Throws if it's a result.

```typescript
const foo = v.string.custom({ parseStringError: () => `not a string!` }).safeParse(1)
if (v.isError(foo)) {
  console.log(v.firstErrorFromResultError(foo)) // => `not a string!`
  console.log(v.firstError(foo[0])) // => `not a string!`
}
```

Dilav provides some useful types for working with results:

- `v.ResultError` - `ResultError<E, R> = [error: E, result?: undefined] | [error: undefined, result: R]`
- `v.ValidationErrors` - `{  input: unknown;   errors: string[] }`
- `v.ValidationError` - the error type of thrown validation errors - inherits from `Error`, and includes the following additional properties: `{  input: unknown;   errors: string[], errorObject: v.ValidationErrors, readonly firstError: string  }`
- `v.SingleArrayValidationError` - return type of a single array error: `[index: number, errors: string[]]`
- `v.SingleObjectValidationError` - return type of a single object validation error: `[key: string | number | symbol, errors: string[]]`

#### `DefaultErrorFn`

All of the global default messages than can be set are listed in the [`errorFns.ts`](https://github.com/TrevTheDev/monorepo/blob/main/packages/dilav/src/types/errorFns.ts) file.
