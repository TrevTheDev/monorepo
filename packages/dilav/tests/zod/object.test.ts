/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, expect } from 'vitest'
import { v } from '../../src'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const Test = v.object({
  f1: v.number,
  f2: v.string.optional(),
  f3: v.string.nullable(),
  f4: v.array(v.object({ t: v.union([v.string, v.boolean]) })),
})
type Test = v.Infer<typeof Test>

it('object type Inference', () => {
  type TestType = {
    f1: number
    f2?: string | undefined
    f3: string | null
    f4: { t: string | boolean }[]
  }

  assertEqual<v.Infer<typeof Test>, TestType>(true)
})

it('unknown throw', () => {
  const asdf: unknown = 35
  expect(() => Test.parse(asdf)).toThrow()
})

it('definition.propertySchemas() should return schema of particular key', () => {
  const f1Schema = Test.definition.propertySchemas.f1
  const f2Schema = Test.definition.propertySchemas.f2
  const f3Schema = Test.definition.propertySchemas.f3
  const f4Schema = Test.definition.propertySchemas.f4

  expect(f1Schema.baseType).toBe('number')
  expect(f2Schema.baseType).toBe('optional')
  expect(f3Schema.baseType).toBe('nullable')
  expect(f4Schema.baseType).toBe('infinite array')
})

it('correct parsing', () => {
  Test.parse({
    f1: 12,
    f2: 'string',
    f3: 'string',
    f4: [
      {
        t: 'string',
      },
    ],
  })

  Test.parse({
    f1: 12,
    f3: null,
    f4: [
      {
        t: false,
      },
    ],
  })
})

it('incorrect #1', () => {
  expect(() => Test.parse({} as any)).toThrow()
})

// Dilav is strict by default
it.skip('nonstrict by default', () => {
  v.object({ points: v.number }).parse({
    points: 2314,
    unknown: 'asdf',
  })
})

const data = {
  points: 2314,
  unknown: 'asdf',
}

it.skip('strip by default', () => {
  const val = v.object({ points: v.number }).parse(data)
  expect(val).toEqual({ points: 2314 })
})

it.skip('unknownkeys override', () => {
  // const val = v.object({ points: v.number }).strict().passThrough().strip().nonstrict().parse(data)
  // expect(val).toEqual(data)
})

it('passthrough unknown', () => {
  const val = v.object({ points: v.number }).passThrough().parse(data)

  expect(val).toEqual(data)
})

it.skip('strip unknown', () => {
  // const val = v.object({ points: v.number }).strip().parse(data)
  // expect(val).toEqual({ points: 2314 })
})

it('strict', () => {
  const val = v.object({ points: v.number }).safeParse(data)

  expect(v.isResult(val)).toEqual(false)
})

it('catchAll Inference', () => {
  const o1 = v
    .object({
      first: v.string,
    })
    .catchAll(v.number)

  const d1 = o1.parse({ first: 'asdf', num: 1243 })
  assertEqual<number, (typeof d1)['asdf']>(true)
  assertEqual<string, (typeof d1)['first']>(true)
})

it('catchAll overrides strict', () => {
  const o1 = v.object({ first: v.string.optional() }).strict().catchAll(v.number)

  // should run fine
  // setting a catchAll overrides the unknownKeys behavior
  o1.parse({
    asdf: 1234,
  })

  // should only run catchAll validation
  // against unknown keys
  o1.parse({
    first: 'asdf',
    asdf: 1234,
  })
})

it('catchAll overrides strict', () => {
  const o1 = v
    .object({
      first: v.string,
    })
    .strict()
    .catchAll(v.number)

  // should run fine
  // setting a catchAll overrides the unknownKeys behavior
  o1.parse({
    first: 'asdf',
    asdf: 1234,
  })
})

it('test that optional keys are unset', async () => {
  const SNamedEntity = v.object({
    id: v.string,
    set: v.string.optional(),
    unset: v.string.optional(),
  })
  const result = await SNamedEntity.parse({
    id: 'asdf',
    set: undefined,
  })
  expect(Object.keys(result)).toEqual(['id', 'set'])
})

it('test catchAll parsing', async () => {
  const result = v
    .object({ name: v.string })
    .catchAll(v.number)
    .parse({ name: 'Foo', validExtraKey: 61 })

  expect(result).toEqual({ name: 'Foo', validExtraKey: 61 })

  const result2 = v
    .object({ name: v.string })
    .catchAll(v.number)
    .safeParse({ name: 'Foo', validExtraKey: 61, invalid: 'asdf' })

  expect(v.isResult(result2)).toEqual(false)
})

it('test nonexistent keys', async () => {
  const Schema = v.union([v.object({ a: v.string }), v.object({ b: v.number })])
  const obj = { a: 'A' }
  const result = await Schema.safeParseAsync(obj) // Works with 1.11.10, breaks with 2.0.0-beta.21
  expect(v.isResult(result)).toBe(true)
})

it('test async union', async () => {
  const Schema2 = v.union([
    v.object({
      ty: v.string,
    }),
    v.object({
      ty: v.number,
    }),
  ])

  const obj = { ty: 'A' }
  const result = await Schema2.safeParseAsync(obj) // Works with 1.11.10, breaks with 2.0.0-beta.21
  expect(v.isResult(result)).toEqual(true)
})

it('test and vs merge', async () => {
  const asdf = v.object({ a: v.string }).and(v.object({ a: v.number }))
  expect(() => asdf.parse({ a: 1 })).toThrow()
  type asdf = v.Infer<typeof asdf>
  assertEqual<asdf, { a: never }>(true)
  const asdf2 = v.object({ a: v.string }).merge(v.object({ a: v.number }))
  asdf2.parse({ a: 1 })
  type asdf2 = v.Infer<typeof asdf2>
  assertEqual<asdf2, { a: number }>(true)
})

it('Inferred merged object type with optional properties', async () => {
  const Merged = v
    .object({ a: v.string, b: v.string.optional() })
    .merge(v.object({ a: v.string.optional(), b: v.string }))
  type Merged = v.Infer<typeof Merged>
  assertEqual<Merged, { a?: string; b: string }>(true)
  // todo
  // assertEqual<Merged, { a?: string; b: string }>(true);
})

it('Inferred unioned object type with optional properties', async () => {
  const Unioned = v.union([
    v.object({ a: v.string, b: v.string.optional() }),
    v.object({ a: v.string.optional(), b: v.string }),
  ])
  type Unioned = v.Infer<typeof Unioned>
  assertEqual<Unioned, { a: string; b?: string } | { a?: string; b: string }>(true)
})

it.skip('Inferred enum type', async () => {
  // const Enum = v.object({ a: v.string, b: v.string.optional() }).keyof()
  // expect(Enum.Values).toEqual({
  //   a: 'a',
  //   b: 'b',
  // })
  // expect(Enum.enum).toEqual({
  //   a: 'a',
  //   b: 'b',
  // })
  // expect(Enum._def.values).toEqual(['a', 'b'])
  // type Enum = v.Infer<typeof Enum>
  // assertEqual<Enum, 'a' | 'b'>(true)
})

it('Inferred partial object type with optional properties', async () => {
  const Partial = v.object({ a: v.string, b: v.string.optional() }).partial()
  type Partial = v.Infer<typeof Partial>
  assertEqual<Partial, { a?: string; b?: string }>(true)
})

it('Inferred picked object type with optional properties', async () => {
  const Picked = v.object({ a: v.string, b: v.string.optional() }).pick('b')
  type Picked = v.Infer<typeof Picked>
  assertEqual<Picked, { b?: string }>(true)
})

// I followed the way Typescript does.

it.skip('Inferred type for unknown/any keys', () => {
  // const myType = v.object({
  //   anyOptional: v.any.optional(),
  //   anyRequired: v.any,
  //   unknownOptional: v.unknown.optional(),
  //   unknownRequired: v.unknown,
  // })
  // type myType = v.Infer<typeof myType>
  // assertEqual<
  //   myType,
  //   {
  //     anyOptional?: any
  //     anyRequired?: any
  //     unknownOptional?: unknown
  //     unknownRequired?: unknown
  //   }
  // >(true)
})

it('setKey', () => {
  const base = v.object({ name: v.string })
  const withNewKey = base.setKey('age', v.number)

  type withNewKey = v.Infer<typeof withNewKey>
  assertEqual<withNewKey, { name: string; age: number }>(true)
  withNewKey.parse({ name: 'asdf', age: 1234 })
})

it('strictcreate', async () => {
  const strictObj = v.object({
    name: v.string,
  })

  const syncResult = strictObj.safeParse({ name: 'asdf', unexpected: 13 })
  expect(v.isResult(syncResult)).toEqual(false)

  const asyncResult = await strictObj.safeParseAsync({ name: 'asdf', unexpected: 13 })
  expect(v.isResult(asyncResult)).toEqual(false)
})

it('object with refine', async () => {
  const schema = v
    .object({
      a: v.string.default('foo'),
      b: v.number,
    })
    .customValidation(() => undefined)
  expect(schema.parse({ b: 5 })).toEqual({ b: 5, a: 'foo' })
  const result = await schema.parseAsync({ b: 5 })
  expect(result).toEqual({ b: 5, a: 'foo' })
})

it('intersection of object with date', async () => {
  const schema = v.object({
    a: v.date,
  })
  expect(schema.and(schema).parse({ a: new Date(1637353595983) })).toEqual({
    a: new Date(1637353595983),
  })
  const result = await schema.parseAsync({ a: new Date(1637353595983) })
  expect(result).toEqual({ a: new Date(1637353595983) })
})

it('intersection of object with refine with date', async () => {
  const schema = v
    .object({
      a: v.date,
    })
    .customValidation(() => undefined)
  expect(schema.and(schema).parse({ a: new Date(1637353595983) })).toEqual({
    a: new Date(1637353595983),
  })
  const result = await schema.parseAsync({ a: new Date(1637353595983) })
  expect(result).toEqual({ a: new Date(1637353595983) })
})

it('constructor key', () => {
  const person = v
    .object({
      name: v.string,
    })
    .strict()

  expect(() =>
    person.parse({
      name: 'bob dylan',
      constructor: 61,
    }),
  ).toThrow()
})

it('constructor key', () => {
  const Example = v.object({
    prop: v.string,
    opt: v.number.optional(),
    arr: v.string.array(),
  })

  type Example = v.Infer<typeof Example>
  assertEqual<keyof Example, 'prop' | 'opt' | 'arr'>(true)
})

it('unknownkeys merging', () => {
  // This one is "strict"
  const schemaA = v
    .object({
      a: v.string,
    })
    .strict()

  // This one is "strip"
  const schemaB = v
    .object({
      b: v.string,
    })
    .catchAll(v.string)

  const mergedSchema = schemaA.merge(schemaB)
  type mergedSchema = typeof mergedSchema
  assertEqual<mergedSchema['definition']['unmatchedPropertySchema']['baseType'], 'string'>(true)
  expect(mergedSchema.definition.unmatchedPropertySchema.baseType).toEqual('string')

  // assertEqual<mergedSchema['_def']['catchAll'], v.ZodString>(true)
  // expect(mergedSchema._def.catchAll instanceof v.ZodString).toEqual(true)
})

const personToExtend = v.object({
  firstName: v.string,
  lastName: v.string,
})

it('extend() should return schema with new key', () => {
  const PersonWithNickname = personToExtend.extends({ nickName: v.string })
  type PersonWithNickname = v.Infer<typeof PersonWithNickname>

  const expected = { firstName: 'f', nickName: 'n', lastName: 'l' }
  const actual = PersonWithNickname.parse(expected)

  expect(actual).toEqual(expected)
  assertEqual<keyof PersonWithNickname, 'firstName' | 'lastName' | 'nickName'>(true)
  assertEqual<PersonWithNickname, { firstName: string; lastName: string; nickName: string }>(true)
})

it('extend() should have power to override existing key', () => {
  const PersonWithNumberAsLastName = personToExtend.extends({
    lastName: v.number,
  })
  type PersonWithNumberAsLastName = v.Infer<typeof PersonWithNumberAsLastName>

  const expected = { firstName: 'f', lastName: 42 }
  const actual = PersonWithNumberAsLastName.parse(expected)

  expect(actual).toEqual(expected)
  assertEqual<PersonWithNumberAsLastName, { firstName: string; lastName: number }>(true)
})

it('passthrough index signature', () => {
  const a = v.object({ a: v.string })
  type a = v.Infer<typeof a>
  assertEqual<{ a: string }, a>(true)
  const b = a.passThrough()
  type b = v.Infer<typeof b>
  assertEqual<{ a: string } & { [k: PropertyKey]: unknown }, b>(true)
})
