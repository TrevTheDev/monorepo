/* eslint-disable @typescript-eslint/no-unused-vars */
import { it, expect } from 'vitest'
import { v } from '../src/index'
// import type { V } from '../src/index'

it('basic example', () => {
  // creating a schema for strings
  const schema = v.string

  // parsing
  const willParseToString = schema.parse('hello') // => "hello"
  expect(() => schema.parse(12)).toThrow()

  // safe parsing doesn't throw error if validation fails
  const willParseSafely = schema.safeParse('hello') // => [ undefined, "hello" ]
  const willParseSafely2 = schema.safeParse(12) // => [ {input: 12, errors: ['12 is not a string']}, undefined ]
})

it('basic example 2', () => {
  const userSchema = v.object({ username: v.string })
  type UserType = v.Infer<typeof userSchema> //  infers the schema type: { username: string }
  const user = userSchema.parse({ username: 'Fred' }) // => { username: 'Fred' }
})

it('primitives', () => {
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
  expect(() => v.never.parse('will throw!')).toThrow()
})

it('coerce', () => {
  const schema = v.string.coerce
  schema.parse('fred') // => "fred"
  schema.parse(13) // => "13"
  schema.parse(false) // => "false"
  expect(() => schema.email().min(5).parse('notEmail')).toThrow()
})

it('coerce2', () => {
  v.string.coerce.parse(true) // String(input)
  v.number.coerce.parse(true) // Number(input)
  v.boolean.coerce.parse('1') // Boolean(input)
  v.bigInt.coerce.parse('1') // BigInt(input)
  v.date.coerce.parse('1') // new Date(input)
})

it('literals', () => {
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
  expect(v.literal('hello').definition.literal).toEqual('hello')
})

it('nan', () => {
  v.NaN.parse(NaN)
  expect(() =>
    v.customize.NaN({ invalidValueFn: (value) => `${value} is not NaN` }).parse(1),
  ).toThrow()
})

it('null', () => {
  v.null.parse(null)
  expect(() =>
    v.customize.null({ invalidValueFn: (value) => `${value} is not null` }).parse(1),
  ).toThrow()
})

it('nullish', () => {
  v.nullish.parse(null)
  v.nullish.parse(undefined)
  expect(() =>
    v.customize.nullishL({ invalidValueFn: (value) => `${value} is not nullish` }).parse(1),
  ).toThrow()
})

it('any', () => {
  v.any.parse('hello')
})

it('unknown', () => {
  v.unknown.parse('hello')
})

it('never', () => {
  expect(() => v.never.parse(1)).toThrow()
  expect(() =>
    v.customize.never({ invalidValueFn: (value) => `${value} is not never` }).parse(1),
  ).toThrow()
})

it('void', () => {
  v.void.parse()
  v.void.parse(undefined)
  expect(() =>
    v.customize.void({ invalidValueFn: (value) => `${value} is not void` }).parse(1),
  ).toThrow()
})

it('undefined', () => {
  v.undefined.parse(undefined)
  expect(() =>
    v.customize.undefined({ invalidValueFn: (value) => `${value} is not undefined` }).parse(1),
  ).toThrow()
})

it('strings0', () => {
  v.string.email().parse('a@a.com') // => 'a@a.com'

  v.string.coerce.parse(1) // => '1'

  // a function can be provided that returns a custom error message:
  const foo = v.string.custom({ parseStringError: (value) => `didn't parse` }).safeParse(1)
  const fooError = v.firstErrorFromResultError(foo) // => `didn't parse`
})

it('strings', () => {
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
  v.string
    .customValidation((stringValue) =>
      stringValue === stringValue.toUpperCase() ? undefined : 'error',
    )
    .parse('ABC')
})

it('strings2', () => {
  v.string.max(5, (value) => `${value} is too long!`).parse('12345')
})

it('ISO datetimes', () => {
  const datetime = v.string.datetime()

  datetime.parse('2020-01-01T00:00:00Z')
  datetime.parse('2020-01-01T00:00:00.123Z')
  datetime.parse('2020-01-01T00:00:00.123456Z')
  expect(() => datetime.parse('2020-01-01T00:00:00+02:00')).toThrow()
})

it('ISO datetimes 2', () => {
  const datetime = v.string.datetime({ offset: true })

  datetime.parse('2020-01-01T00:00:00+02:00')
  datetime.parse('2020-01-01T00:00:00.123+02:00')
  datetime.parse('2020-01-01T00:00:00.123+0200')
  datetime.parse('2020-01-01T00:00:00.123+02')
  datetime.parse('2020-01-01T00:00:00Z')
})

// it('v.customize.string',()=>{
// v.customize.string(
//   options?: {
//     parseStringError? : (value: unknown) => string,  // function that returns string on parsing error
//     parser?: (Input: unknown) => ResultError<ValidationErrors, string>  // custom string parser function
//   })
// })

it('ISO datetimes 3', () => {
  const datetime = v.string.datetime({ precision: 3 })

  datetime.parse('2020-01-01T00:00:00.123Z')
  expect(() => datetime.parse('2020-01-01T00:00:00.123456Z')).toThrow()
  expect(() => datetime.parse('2020-01-01T00:00:00Z')).toThrow()
})

it('numbers', () => {
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
})

// it('v.customize.number',()=>{
// v.customize.number(
//   options?: {
//     parseNumberError? : (value: unknown) => string,  // function that returns string on parsing error
//     parser?: (Input: unknown) => ResultError<ValidationErrors, number>  // custom parser function
//   }) // => v.Number
// })

it('bigint', () => {
  v.bigInt.gt(5n)
  v.bigInt.gte(5n) // alias `.min(5n)`
  v.bigInt.lt(5n)
  v.bigInt.lte(5n) // alias `.max(5n)`

  v.bigInt.positive() // > 0n
  v.bigInt.nonNegative() // >= 0n
  v.bigInt.negative() // < 0n
  v.bigInt.nonPositive() // <= 0n
})

// it('v.customize.bigInt',()=>{
// v.customize.bigInt(
//   options?: {
//     parseBigIntError? : (value: unknown) => string,  // function that returns string on parsing error
//     parser?: (Input: unknown) => ResultError<ValidationErrors, bigint>  // custom parser function
//   }) // => v.BigInt
// })

it('boolean', () => {
  v.boolean.parse(true)
  v.boolean.beTrue().parse(true)
  v.boolean.beFalse().parse(false)
})

// it('v.customize.boolean',()=>{
// v.customize.boolean(
//   options?: {
//     parseBooleanError? : (value: unknown) => string,  // function that returns string on parsing error
//     parser?: (Input: unknown) => ResultError<ValidationErrors, boolean>  // custom parser function
//   }) // => v.Boolean
// })

it('dates', () => {
  v.date.parse(new Date())
  expect(() => v.date.parse('2022-01-12T00:00:00.000Z')).toThrow()
})

it('date2', () => {
  v.date.min(new Date('1900-01-01'), (value) => `${value} too old`)
  v.date.max(new Date(), (value) => `${value} too young`)
})

it('coercion of date', () => {
  const dateSchema = v.date.coerce

  dateSchema.parse('2023-01-11T00:00:01.000Z')
  dateSchema.parse('2023-01-11')
  dateSchema.parse('1/11/23')
  dateSchema.parse(new Date('1/11/23'))

  /* invalid dates */
  expect(() => dateSchema.parse('2023-13-11')).toThrow() // false
  expect(() => dateSchema.parse('0000-00-00')).toThrow() // false
})

// it('v.customize.date',()=>{
// v.customize.date(
//   options?: {
//     parseDateError? : (value: unknown) => string,  // function that returns string on parsing error
//     parser?: (Input: unknown) => ResultError<ValidationErrors, Date>  // custom parser function
//   }) // => v.Date
// })

it('enums', () => {
  const animalTypes1 = v.enum(['Dog', 'Cat', 'Fish'])
  // equivalent to :
  const animalTypes2 = v.union(['Dog', 'Cat', 'Fish'], { stringLiteralUnion: true })

  type AnimalTypes = v.Infer<typeof animalTypes1> // "Dog" | "Cat" | "Fish"
  animalTypes1.parse('Dog') // => 'Dog'
  expect(() => animalTypes1.parse('dog')).toThrow() // => throws
  console.log(animalTypes1.definition.unionTypes) // => ['Dog', 'Cat', 'Fish']
  console.log(animalTypes1.enum) // => {Dog: 'Dog', Cat: 'Cat', Fish: 'Fish'}
  console.log(animalTypes1.enum.Dog === 'Dog') // => true

  // due to typescript's requirements, as const is required to correctly type
  // enums:
  const animalTypes = ['Dog', 'Cat', 'Fish'] as const
  const animalEnum3 = v.enum(animalTypes)
})

it('typescript enums', () => {
  // eslint-disable-next-line no-shadow
  enum fooEnum {
    Cat = 1,
    Dog,
  }
  const fooEnumSchema = v.enum(fooEnum)
  type FooEnumSchema = v.Infer<typeof fooEnumSchema> // fooEnum
  const x1 = fooEnumSchema.parse('Cat') // => 'Cat'
  const x2 = fooEnumSchema.parse(1) // => 1
  expect(() => fooEnumSchema.parse('Rat')).toThrow()
  console.log(fooEnumSchema.enum)
})

it('const enums', () => {
  const fooEnum = {
    Cat: 1,
    Dog: 'Dog',
  } as const
  const fooEnumSchema = v.enum(fooEnum)
  type FooEnumSchema = v.Infer<typeof fooEnumSchema> // 1 | "Dog"
  fooEnumSchema.parse(1)
  fooEnumSchema.parse('Dog')
  expect(() => fooEnumSchema.parse('Cat')).toThrow()
  expect(() => fooEnumSchema.parse('Rat')).toThrow()
  console.log(fooEnumSchema.enum) // => the original fooEnum
})

it('optionals', () => {
  const schema = v.optional(v.string)

  schema.parse(undefined) // => returns undefined
  type Schema = v.Infer<typeof schema> // string | undefined
})

it('optionals 2', () => {
  const user = v.object({
    username: v.string.optional(),
  })
  type User = v.Infer<typeof user> // { username?: string | undefined };
})

it('optionals 3', () => {
  const stringSchema = v.string
  const optionalString = stringSchema.optional()
  expect(optionalString.definition.wrappedSchema).toBe(stringSchema)
})

it('nullable', () => {
  const nullableString = v.nullable(v.string)
  nullableString.parse('asdf')
  nullableString.parse(null)
})

it('nullable 2', () => {
  const schema = v.string.nullable()
  type Schema = v.Infer<typeof schema> // string | null
})

it('nullable 3', () => {
  const stringSchema = v.string
  const nullableString = stringSchema.nullable()
  expect(nullableString.definition.wrappedSchema).toBe(stringSchema)
})

it('nullishable', () => {
  const nullishString = v.nullishable(v.string)
  nullishString.parse('asdf') // => "asdf"
  nullishString.parse(null) // => null
  nullishString.parse(undefined) // => undefined
})

it('nullishable 2', () => {
  const schema = v.string.nullish()
  type Schema = v.Infer<typeof schema> // string | null | undefined
})

it('nullishable 3', () => {
  const stringSchema = v.string
  const nullishString = stringSchema.nullish()
  expect(nullishString.definition.wrappedSchema).toBe(stringSchema)
})

it('objects', () => {
  const foo = v.object({
    name: v.string,
    age: v.number,
  })
  type Foo = v.Infer<typeof foo> // {  name: string; age: number; }

  // The `unmatchedPropertySchema` is used to parse all unmatched properties of an object.
  // if omitted the default is v.never - meaning no additional properties are permitted.
  const bar = v.object({ name: v.string }, v.any)
  type Bar = v.Infer<typeof bar> // { name: string } & { [P: keyof any]: any; }

  foo.definition.propertySchemas.name.parse('string') // => string schema
  foo.definition.propertySchemas.age.parse(1) // => number schema
  expect(() => foo.definition.unmatchedPropertySchema.parse(1)).toThrow() // => throws

  // const keySchema = foo.keyof() // => ["name", "age"]
  // console.log(keySchema)

  const fooWithType = foo.extends({
    type: v.string,
  })
  type FooWithType = v.Infer<typeof fooWithType> // { name: string; age: number; type: string; }
})

it('objects 2', () => {
  const foo = v.object({ items: v.array(v.string) })
  const idObject = v.object({ id: v.number })

  const fooWithId1 = foo.merge(idObject).parse({ items: ['A'], id: 1 })

  // similar to:
  const fooWithId2 = foo
    .extends(idObject.definition.propertySchemas, idObject.definition.unmatchedPropertySchema)
    .parse({ items: ['A'], id: 1 })
})

it('objects 3', () => {
  const foo = v.object({
    id: v.string,
    name: v.string,
    owners: v.array(v.string),
  })
  const nameAndIdOnly = foo.pick('name', 'id') // { name: string;id: string; }

  const omitIdAndName = foo.omit('name', 'id') // { owners: string[]; }
})

it('objects 4', () => {
  const foo = v.object({ email: v.string, name: v.string })
  const partialFoo = foo.partial() //  { email?: string ; name?: string ; }
  const partialName = foo.partial('name') //  { email: string ; name?: string ; }
})

it('objects 5', () => {
  const foo = v.object({
    name: v.string,
    profile: v.object({ id: v.number }),
    items: v.array(v.object({ value: v.string })),
  })

  const deepPartialFoo = foo.deepPartial()
  /* {
    name?: string | undefined;
    profile?: { id?: number | undefined; } | undefined;
    items?: {  value?: string | undefined; }[] | undefined;
} */
})

it('objects 6', () => {
  const foo = v.object({
    email: v.string.optional(),
    name: v.string.optional(),
  })
  // { email?: string | undefined; name?: string | undefined }
  const requiredFoo = foo.required()
  // { email: string; name: string; }
})

it('passthrough 7', () => {
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
  })
  // => { name: string; } & {[P: keyof Any]: unknown; }
})

it('strict', () => {
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
})

it('catchall', () => {
  const foo = v.object({ name: v.string }).catchAll(v.number)

  foo.parse({
    name: 'fred',
    extraProp: 12,
  })
})

// it('v.object',()=>{
// v.object(
//   propertySchemas: { [key: keyof any]: v.MinimumSchema },
//   unmatchedPropertySchema?: v.MinimumSchema = v.Never,
//   options?: {
//     invalidObjectFn?: typeof errorFns.parseObject
//     invalidObjectPropertiesFn?: typeof errorFns.invalidObjectPropertiesFn
//     missingProperty?: typeof errorFns.missingProperty
//     missingPropertyInDef?: typeof errorFns.missingPropertyInDef
//     type?: string // custom object.type value
//     parser?: (input: unknown) => ResultError<ValidationErrors, object>  // custom parser function
//   }) // => v.Object
// })

it('array', () => {
  const array1 = v.array(v.string).parse([]) // string[]
  // equivalent
  const array2 = v.string.array().parse([]) // string[]

  const array3 = v
    .array([v.string, v.number, v.array(v.string).spread, v.object({ items: v.number })])
    .parse(['a', 1, 'b', { items: 1 }]) // [string, number, ...string[], { items: number }]
})

it('array1', () => {
  const itemSchema = v.array(v.string).definition.itemSchema.parse('string')
  const secondElementInArray = v.array([v.string, v.number]).definition.itemSchemas[1].parse(1)
})

it('validations', () => {
  v.array(v.number).max(3).parse([1, 2, 3])
  v.array(v.number).min(3).parse([1, 2, 3])
  v.array(v.number).length(3).parse([1, 2, 3])
  v.array(v.number).nonEmpty().parse([1])
  v.array(v.number)
    .customValidation((arrayValue) => (arrayValue.includes(1) ? undefined : 'error'))
    .parse([1])
})

it('spread', () => {
  const foo = v
    .array([v.string, v.number, v.array(v.string).spread, v.array([v.number, v.boolean]).spread])
    .parse(['a', 1, 'b', 1, true]) // [string, number, ...string[], number, boolean]
})

// it('v.array', () => {
// type ArrayOptions = {
//   parseArray?: typeof errorFns.parseArray
//   invalidArrayElementsFn?: typeof errorFns.invalidArrayElementsFn
//   arrayDefinitionElementMustBeOptional?: typeof errorFns.arrayDefinitionElementMustBeOptional
//   elementRequiredAt?: typeof errorFns.elementRequiredAt
//   extraArrayItemsFn?: typeof errorFns.extraArrayItemsFn
//   restCantFollowRest?: typeof errorFns.restCantFollowRest
//   optionalElementCantFollowRest?: typeof errorFns.optionalElementCantFollowRest
//   missingItemInItemSchemas?: typeof errorFns.missingItemInItemSchemas
//   unableToSelectItemFromArray?: typeof errorFns.unableToSelectItemFromArray
//   parser?: (input: unknown) => ResultError<ValidationErrors, any[]>  // custom parser function
// }
// v.array(itemSchema: MinimumSchema, options?: ArrayOptions) // => v.ArrayInfinite
// v.array(
//   itemSchemas: (MinimumSchema|MinimumArrayRestSchema)[],
//   options?: ArrayOptions
// ) // => v.ArrayFinite
// })
it('union', () => {
  const stringOrBool1 = v.union([v.string, v.boolean]).parse('foo') // => string | boolean
  // identical to:
  const stringOrBool2 = v.string.or(v.boolean).parse(true) // => string | boolean
})

it('discriminated union', () => {
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
})

it('string only union', () => {
  const fooBar = v.union(['foo', 'bar'], { stringLiteralUnion: true }).parse('foo') // => 'foo' | 'bar'
})

it('records', () => {
  // if only one schema is supplied, it's assumed that only the values of the object will be validated:
  const foo1 = v.record(v.number).parse({ a: 1 }) // Record<string, number>
  expect(() => v.record(v.number).parse({ a: '1' })).toThrow()

  // if two schemas are supplied, the first will validate the property name, and the second its value:
  const foo2 = v.record(v.string.min(5), v.number).parse({ abcde: 1 }) // Record<string, number>
  expect(() => v.record(v.string.min(5), v.number).parse({ a: 1 })).toThrow()
})

it('Maps', () => {
  const foo = v.map([v.string, v.number]).parse(new Map([['apple', 1]])) // => Map<string, number>
  expect(() => v.map([v.string, v.number]).parse(new Map([['apple', '1']]))).toThrow()
})

it('Maps2', () => {
  v.map([v.string, v.number])
    .nonempty()
    .parse(new Map([['apple', 1]])) // must contain at least one item
  v.map([v.string, v.number])
    .min(1)
    .parse(new Map([['apple', 1]])) // must contain 5 or more items
  v.map([v.string, v.number])
    .max(1)
    .parse(new Map([['apple', 1]])) // must contain 5 or fewer items
  v.map([v.string, v.number])
    .size(1)
    .parse(new Map([['apple', 1]])) // must contain 5 items exactly
  v.map([v.string, v.number])
    .customValidation((valueMap) => (valueMap.size === 1 ? undefined : 'error'))
    .parse(new Map([['apple', 1]]))
})

it('Sets', () => {
  const foo = v.set(v.number).parse(new Set([1])) // => Set<number>
  expect(() => v.set(v.number).parse(new Set(['1']))).toThrow()
})

it('Sets2', () => {
  v.set(v.number)
    .nonempty()
    .parse(new Set([1])) // must contain at least one item
  v.set(v.number)
    .min(1)
    .parse(new Set([1])) // must contain 5 or more items
  v.set(v.number)
    .max(1)
    .parse(new Set([1])) // must contain 5 or fewer items
  v.set(v.number)
    .size(1)
    .parse(new Set([1])) // must contain 5 items exactly
  v.set(v.number)
    .customValidation((valueSet) => (valueSet.size === 1 ? undefined : 'error'))
    .parse(new Set([1]))
})

it('Intersections', () => {
  const foo1 = v.intersection([
    v.union(['A', 'B'], { stringLiteralUnion: true }),
    v.union(['B', 'C'], { stringLiteralUnion: true }),
  ])
  // equivalent to:
  const foo2 = v
    .union(['A', 'B'], { stringLiteralUnion: true })
    .and(v.union(['B', 'C'], { stringLiteralUnion: true }))

  const b = foo2.parse('B') // =>'B'
  expect(() => foo2.parse('A')).toThrow()
})

it('Intersections2', () => {
  const foo1 = v
    .intersection([v.object({ a: v.string }), v.object({ b: v.string })])
    .parse({ a: 'A', b: 'B' }) // => { a: 'A', b: 'B' }

  // equivalent to:
  const foo2 = v
    .object({ a: v.string })
    .and(v.object({ b: v.string }))
    .parse({ a: 'A', b: 'B' }) // => { a: 'A', b: 'B' }
  debugger
})

it('Intersections3', () => {
  const foo1 = v
    .intersection([v.array(v.object({ a: v.string })), v.array(v.object({ b: v.string }))])
    .parse([{ a: 'A', b: 'B' }]) // => [{ a: 'A', b: 'B' }]

  // equivalent to:
  const foo2 = v
    .array(v.object({ a: v.string }))
    .and(v.array(v.object({ b: v.string })))
    .parse([{ a: 'A', b: 'B' }]) // => [{ a: 'A', b: 'B' }]
  debugger
})

it('Recursive types', () => {
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
})

it('Promises', async () => {
  const fooPromiseSchema = v.promise(v.string)
  const fooPromise1 = fooPromiseSchema.parse(Promise.resolve('foo')) // => ValidatedPromise<string>
  const result = await fooPromise1 // foo
  const fooPromise2 = fooPromiseSchema.parse(Promise.resolve(1))
  try {
    await fooPromise2
  } catch (e) {
    expect(e.errors[0]).toEqual('1 is not a string')
  }
})

it('Instanceof', () => {
  class Foo {
    prop: string
  }

  const foo = v.instanceOf(Foo).parse(new Foo())
})

it('Function', () => {
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
})

it('Function2', () => {
  const foo1 = v.function({ args: [v.string], returns: v.void }, { returnedFunction: 'original' })
  const fn = foo1.parse((a) => a)
  fn(1 as unknown as string) // returns 1 and won't throw as fn is not wrapped.
})

it('Function3', () => {
  const foo = v.function({ args: [v.string], returns: v.boolean })
  foo.definition.returns.parse(true) // return type
  foo.definition.parameters.parse(['hello']) // parameter array type
})

it('Preprocess', () => {
  // preprocess runs a function before parsing, the output of which is then parsed
  const foo1 = v.string.preprocess((value) => (value === 'hello' ? 'world' : value))
  foo1.parse('hello') // => 'world'

  // postprocess runs a function after parsing, the output of which is then returned
  const foo2 = v.string.postprocess(([error, value]) => [undefined, value?.toLowerCase()])
  foo2.parse('HELLO') // => 'hello'

  // postprocess runs a function after parsing, the output of which is then returned
  const foo3 = v.string.transform((stringValue) => stringValue.toLowerCase())
  const x = foo3.parse('HELLO') // => 'hello'

  // if parsing returns an error, catch replaces the error with the `catchValue`
  const foo4 = v.string.catch('default on error')
  foo4.parse(1) // => 'default on error'

  // if value being parsed is undefined, then it is replaced with the `defaultValue` before parsing
  const foo5 = v.string.default('default on undefined')
  foo5.parse(undefined) // => 'default on undefined'
})

it('Custom', () => {
  const pxSchema = v.custom<`${number}px`>((value) => /^\d+px$/.test(value as string))

  type PxSchema = v.Infer<typeof pxSchema> // `${number}px`

  pxSchema.parse('50px') // => "50px"
  expect(() => pxSchema.parse('50vw')).toThrow() // throws;
})

it('Async', async () => {
  const stringSchema = v.string

  const result = await stringSchema.parseAsync(Promise.resolve('result')) // => returns "result"
})

it('SafeParse', async () => {
  type ValidationErrors = {
    input: unknown
    errors: string[]
  }
  type ResultError<T> =
    | [error: ValidationErrors, result?: undefined]
    | [error: undefined, result: T]
  const foo = v.string.safeParse('hello') // => [undefined, 'hello']
  const fooResult = v.resultFromResultError(foo) // => 'hello'
  const bar = v.string.safeParse(12) // => [{ input: 12, errors: ["'12 is not a string'"] }, undefined]
  const barError = v.errorFromResultError(bar) // => { input: 12, errors: ["'12 is not a string'"] }
  const barErrorString = v.firstErrorFromResultError(bar) // => '12 is not a string'
  debugger
})

it('SafeParse', async () => {
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
})

it('safeParseAsync', async () => {
  const result = await v.string.safeParseAsync(Promise.resolve('result')) // => returns [undefined, "result"]
})

it('transformation', () => {
  // consider the illustrative example below.  The intersection could transform `undefined` into `A`
  // even though `A` may be invalid, it could transform it into `B`, a third alternative would be to return
  // the original input value of `undefined` as valid.
  // const example = v
  //   .intersection([v.enum(['A', 'B']).default('A'), v.enum(['B', 'C']).default('B')])
  //   .parse(undefined)

  // the above is resolved by the following explicit solutions:
  expect(() => {
    const alt1 = v
      .enum(['A', 'B'])
      .default('A')
      .pipe(v.intersection([v.enum(['A', 'B']), v.enum(['B', 'C'])]))
      .parse(undefined) // => throws
  }).toThrow()

  const alt2 = v
    .enum(['B', 'C'])
    .default('B')
    .pipe(v.intersection([v.enum(['A', 'B']), v.enum(['B', 'C'])]))
    .parse(undefined) // => B

  const alt3 = v
    .union([v.intersection([v.enum(['A', 'B']), v.enum(['B', 'C'])]), v.undefined])
    .parse(undefined) // => undefined
})

it('Preprocess2', () => {
  // preprocess runs a function before parsing, the output of which is then parsed
  v.number.preprocess((value) => (value as string).length).parse('hello') // => 5
})

it('postprocess', () => {
  // postprocess runs a function after parsing, the output of which is then returned
  v.string.postprocess(([error, value]) => [undefined, value?.toLowerCase()]).parse('HELLO') // => 'hello'
})

it('transform', () => {
  // transform runs a function after parsing, the output of which is then returned
  v.string.transform((value) => value.toLowerCase()).parse('HELLO') // => 'hello'
})

it('catch', () => {
  // if parsing returns an error, catch replaces the error with the `catchValue`
  v.string.catch('default on error').parse(1) // => 'default on error'
})

it('catch2', () => {
  const foo = v.object({ inner: v.string.catch('does change object') }).catch({
    inner: 'hello',
  })
  expect(foo.parse(undefined)).toEqual({ inner: 'hello' })
  expect(foo.parse({})).toEqual({ inner: 'does change object' })
  expect(foo.parse({ inner: undefined })).toEqual({ inner: 'does change object' })
})

it('default', () => {
  // if value being parsed is undefined, then it is replaced with the `defaultValue` before parsing
  v.string.default('default on undefined').parse(undefined) // => 'default on undefined'
  debugger
})

it('promise', () => {
  const stringPromise1 = v.string.promise() // Promise<string>
  // equivalent to
  const stringPromise2 = v.promise(v.string)
})

it('or', () => {
  const stringOrNumber = v.string.or(v.number) // string | number
  // equivalent to
  v.union([v.string, v.number])
})

it('and', () => {
  // const x1 = v.union(['A', 'B'], { stringLiteralUnion: true })
  // const x2 = v.union(['B', 'C'], { stringLiteralUnion: true })
  // const nameAndAge = v.object({ name: x1 }).and(v.object({ name: x2 })) // { name: string } & { age: number }
  // const x = nameAndAge.parse({})
  // type NameAndAge = v.Infer<typeof nameAndAge> // => { name: string } & { age: number }
  // // equivalent to
  // // const x = v.intersection([v.object({ name: v.string }), v.object({ age: v.number })])
  // const x = v.intersection([v.object({ name: x1 })])
  // type Y = v.Infer<typeof x>
  // const z = x.parse({})
})

it('pipe', () => {
  const foo = v.string.pipe(
    v.union(['A', 'B'], { stringLiteralUnion: true }),
    v.union(['A'], { stringLiteralUnion: true }),
  ) // -> string -> 'A' | 'B' -> 'A'
  foo.parse('A')
  expect(() => foo.parse('B')).toThrow()

  const schema = v.string.transform((str) => str.length).pipe(v.number.min(5))
  const z = schema.parse('12345')
  expect(() => schema.parse('1235')).toThrow()
})

it('pipe2', () => {
  const toDate = v.date.coerce
  v.isResult(toDate.safeParse(null as unknown as string)) // => true
  const toDateSchema = v.union([v.number, v.string, v.date]).pipe(toDate)
  v.isResult(toDateSchema.safeParse(null)) // => false

  const toBigInt = v.bigInt.coerce
  expect(() => toBigInt.safeParse(null as unknown as string)).toThrow() // => throws
  const toBigIntSchema = v.union([v.string, v.number, v.bigInt, v.boolean]).pipe(toBigInt)
  v.isResult(toBigIntSchema.safeParse(null)) // => false
})

it('Type inference', () => {
  // import { v.Infer } from 'dilav'
  const stringSchema = v.string
  type StringSchema = v.Infer<typeof stringSchema> // string

  // const foo1: StringSchema = 13 // error
  // const foo2: StringSchema = 'hello' // no error
})

it('generic functions', () => {
  function validate<T extends v.MinimumSchema>(schema: T) {
    return (x) => schema.safeParse(x)
  }
  function foo<T extends v.String>(stringSchema: T) {
    return stringSchema.optional()
  }
  foo(v.string.max(1)).parse('a') // => string | undefined
  debugger
})

it('error handling1', () => {
  // a custom error function(s) can be provided to schemas that have a .custom method:
  const foo = v.string.custom({ parseStringError: () => `not a string!` }).safeParse(1)
  if (v.isError(foo)) console.log(foo[0].errors[0]) // => `not a string!`

  // a custom error function can also be provided for most validations:
  const result2 = v.string.max(1, () => 'too long').safeParse('12')
  if (v.isError(result2)) console.log(result2[0].errors[0]) // => `too long`
  debugger
})

it('error handling2', () => {
  // alternatively error messages can be set globally that will be the default
  // for all schemas not supplied with a custom error function.
  v.setGlobalErrorMessages({ parseString: () => `that's not a string!` })
  const foo = v.string.safeParse(1)
  if (v.isError(foo)) console.log(foo[0].errors[0]) // => `that's not a string!`
})

it('error handling3', () => {
  const foo = v.string.custom({ parseStringError: () => `not a string!` }).safeParse(1)
  if (v.isError(foo)) {
    console.log(v.firstErrorFromResultError(foo)) // => `not a string!`
    console.log(v.firstError(foo[0])) // => `not a string!`
  }
})
