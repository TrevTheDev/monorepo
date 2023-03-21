import { describe, it, expect } from 'vitest'
import { vObject } from '../../../src/validate/object'
import { vNumber } from '../../../src/validate/number'
import { vString } from '../../../src/validate/string'
import { vArray } from '../../../src/validate/array'
import { vUnion } from '../../../src/validate/union'
import { vBoolean } from '../../../src/validate/boolean'
import { VInfer } from '../../../src/validate/base'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const z = [vString(), vBoolean()] as const
const x = vUnion(z)

const test = vObject({
  f1: vNumber(),
  f2: vString().optional(),
  f3: vString().nullable(),
  f4: vArray(vObject({ t: x })),
})
type Test = VInfer<typeof test>

describe('adapted from zod object', () => {
  it('object type inference', () => {
    type TestType = {
      f1: number
      f2?: string | undefined
      f3: string | null
      f4: { t: string | boolean }[]
    }

    assertEqual<Test, TestType>(true)
  })

  it('unknown throw', () => {
    const asdf: unknown = 35
    expect(() => test.parse(asdf)).toThrow()
  })

  //   it('shape() should return schema of particular key', () => {
  //     const f1Schema = test.shape.f1
  //     const f2Schema = test.shape.f2
  //     const f3Schema = test.shape.f3
  //     const f4Schema = test.shape.f4

  //     expect(f1Schema).toBeInstanceOf(z.ZodNumber)
  //     expect(f2Schema).toBeInstanceOf(z.ZodOptional)
  //     expect(f3Schema).toBeInstanceOf(z.ZodNullable)
  //     expect(f4Schema).toBeInstanceOf(z.ZodArray)
  //   })

  it('correct parsing', () => {
    test.parse({
      f1: 12,
      f2: 'string',
      f3: 'string',
      f4: [
        {
          t: 'string',
        },
      ],
    })

    test.parse({
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
    expect(() => test.parse({} as any)).toThrow()
  })

  it.skip('nonstrict by default', () => {
    vObject({ points: vNumber() }, { strict: false }).parse({
      points: 2314,
      unknown: 'asdf',
    })
  })

  const data = {
    points: 2314,
    unknown: 'asdf',
  }

  it.skip('strip by default', () => {
    const val = vObject({ points: vNumber() }, { strict: false }).parse(data)
    debugger
    expect(`${val}`).toEqual(`${data}`)
  })

  it.only('unknownkeys override', () => {
    const val = vObject({ points: vNumber() })
      //   .strict()
      .passthrough()
      .strip()
      //   .nonstrict()
      .parse(data)
    debugger
    expect(val).toEqual(data)
  })

  it('passthrough unknown', () => {
    const val = z.object({ points: z.number() }).passthrough().parse(data)

    expect(val).toEqual(data)
  })

  it('strip unknown', () => {
    const val = z.object({ points: z.number() }).strip().parse(data)

    expect(val).toEqual({ points: 2314 })
  })

  it('strict', () => {
    const val = z.object({ points: z.number() }).strict().safeParse(data)

    expect(val.success).toEqual(false)
  })

  it('catchall inference', () => {
    const o1 = z
      .object({
        first: z.string(),
      })
      .catchall(z.number())

    const d1 = o1.parse({ first: 'asdf', num: 1243 })
    assertEqual<number, (typeof d1)['asdf']>(true)
    assertEqual<string, (typeof d1)['first']>(true)
  })

  it('catchall overrides strict', () => {
    const o1 = z.object({ first: z.string().optional() }).strict().catchall(z.number())

    // should run fine
    // setting a catchall overrides the unknownKeys behavior
    o1.parse({
      asdf: 1234,
    })

    // should only run catchall validation
    // against unknown keys
    o1.parse({
      first: 'asdf',
      asdf: 1234,
    })
  })

  it('catchall overrides strict', () => {
    const o1 = z
      .object({
        first: z.string(),
      })
      .strict()
      .catchall(z.number())

    // should run fine
    // setting a catchall overrides the unknownKeys behavior
    o1.parse({
      first: 'asdf',
      asdf: 1234,
    })
  })

  it('test that optional keys are unset', async () => {
    const SNamedEntity = z.object({
      id: z.string(),
      set: z.string().optional(),
      unset: z.string().optional(),
    })
    const result = await SNamedEntity.parse({
      id: 'asdf',
      set: undefined,
    })
    // eslint-disable-next-line ban/ban
    expect(Object.keys(result)).toEqual(['id', 'set'])
  })

  it('test catchall parsing', async () => {
    const result = z
      .object({ name: z.string() })
      .catchall(z.number())
      .parse({ name: 'Foo', validExtraKey: 61 })

    expect(result).toEqual({ name: 'Foo', validExtraKey: 61 })

    const result2 = z
      .object({ name: z.string() })
      .catchall(z.number())
      .safeParse({ name: 'Foo', validExtraKey: 61, invalid: 'asdf' })

    expect(result2.success).toEqual(false)
  })

  it('test nonexistent keys', async () => {
    const Schema = z.union([z.object({ a: z.string() }), z.object({ b: z.number() })])
    const obj = { a: 'A' }
    const result = await Schema.spa(obj) // Works with 1.11.10, breaks with 2.0.0-beta.21
    expect(result.success).toBe(true)
  })

  it('test async union', async () => {
    const Schema2 = z.union([
      z.object({
        ty: z.string(),
      }),
      z.object({
        ty: z.number(),
      }),
    ])

    const obj = { ty: 'A' }
    const result = await Schema2.spa(obj) // Works with 1.11.10, breaks with 2.0.0-beta.21
    expect(result.success).toEqual(true)
  })

  it('test inferred merged type', async () => {
    const asdf = z.object({ a: z.string() }).merge(z.object({ a: z.number() }))
    type asdf = z.infer<typeof asdf>
    assertEqual<asdf, { a: number }>(true)
  })

  it('inferred merged object type with optional properties', async () => {
    const Merged = z
      .object({ a: z.string(), b: z.string().optional() })
      .merge(z.object({ a: z.string().optional(), b: z.string() }))
    type Merged = z.infer<typeof Merged>
    assertEqual<Merged, { a?: string; b: string }>(true)
    // todo
    // assertEqual<Merged, { a?: string; b: string }>(true);
  })

  it('inferred unioned object type with optional properties', async () => {
    const Unioned = z.union([
      z.object({ a: z.string(), b: z.string().optional() }),
      z.object({ a: z.string().optional(), b: z.string() }),
    ])
    type Unioned = z.infer<typeof Unioned>
    assertEqual<Unioned, { a: string; b?: string } | { a?: string; b: string }>(true)
  })

  it('inferred enum type', async () => {
    const Enum = z.object({ a: z.string(), b: z.string().optional() }).keyof()

    expect(Enum.Values).toEqual({
      a: 'a',
      b: 'b',
    })
    expect(Enum.enum).toEqual({
      a: 'a',
      b: 'b',
    })
    expect(Enum._def.values).toEqual(['a', 'b'])
    type Enum = z.infer<typeof Enum>
    assertEqual<Enum, 'a' | 'b'>(true)
  })

  it('inferred partial object type with optional properties', async () => {
    const Partial = z.object({ a: z.string(), b: z.string().optional() }).partial()
    type Partial = z.infer<typeof Partial>
    assertEqual<Partial, { a?: string; b?: string }>(true)
  })

  it('inferred picked object type with optional properties', async () => {
    const Picked = vObject({ a: vString(), b: vString().optional() }).pick(['b'])
    type Picked = VInfer<typeof Picked>
    assertEqual<Picked, { b?: string }>(true)
  })

  it('inferred type for unknown/any keys', () => {
    const myType = z.object({
      anyOptional: z.any().optional(),
      anyRequired: z.any(),
      unknownOptional: z.unknown().optional(),
      unknownRequired: z.unknown(),
    })
    type myType = z.infer<typeof myType>
    assertEqual<
      myType,
      {
        anyOptional?: any
        anyRequired?: any
        unknownOptional?: unknown
        unknownRequired?: unknown
      }
    >(true)
  })

  it('setKey', () => {
    const base = z.object({ name: z.string() })
    const withNewKey = base.setKey('age', z.number())

    type withNewKey = z.infer<typeof withNewKey>
    assertEqual<withNewKey, { name: string; age: number }>(true)
    withNewKey.parse({ name: 'asdf', age: 1234 })
  })

  it('strictcreate', async () => {
    const strictObj = z.strictObject({
      name: z.string(),
    })

    const syncResult = strictObj.safeParse({ name: 'asdf', unexpected: 13 })
    expect(syncResult.success).toEqual(false)

    const asyncResult = await strictObj.spa({ name: 'asdf', unexpected: 13 })
    expect(asyncResult.success).toEqual(false)
  })

  it('object with refine', async () => {
    const schema = z
      .object({
        a: z.string().default('foo'),
        b: z.number(),
      })
      .refine(() => true)
    expect(schema.parse({ b: 5 })).toEqual({ b: 5, a: 'foo' })
    const result = await schema.parseAsync({ b: 5 })
    expect(result).toEqual({ b: 5, a: 'foo' })
  })

  it('intersection of object with date', async () => {
    const schema = z.object({
      a: z.date(),
    })
    expect(schema.and(schema).parse({ a: new Date(1637353595983) })).toEqual({
      a: new Date(1637353595983),
    })
    const result = await schema.parseAsync({ a: new Date(1637353595983) })
    expect(result).toEqual({ a: new Date(1637353595983) })
  })

  it('intersection of object with refine with date', async () => {
    const schema = z
      .object({
        a: z.date(),
      })
      .refine(() => true)
    expect(schema.and(schema).parse({ a: new Date(1637353595983) })).toEqual({
      a: new Date(1637353595983),
    })
    const result = await schema.parseAsync({ a: new Date(1637353595983) })
    expect(result).toEqual({ a: new Date(1637353595983) })
  })

  it('constructor key', () => {
    const person = z
      .object({
        name: z.string(),
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
    const Example = z.object({
      prop: z.string(),
      opt: z.number().optional(),
      arr: z.string().array(),
    })

    type Example = z.infer<typeof Example>
    assertEqual<keyof Example, 'prop' | 'opt' | 'arr'>(true)
  })

  it('unknownkeys merging', () => {
    // This one is "strict"
    const schemaA = z
      .object({
        a: z.string(),
      })
      .strict()

    // This one is "strip"
    const schemaB = z
      .object({
        b: z.string(),
      })
      .catchall(z.string())

    const mergedSchema = schemaA.merge(schemaB)
    type mergedSchema = typeof mergedSchema
    assertEqual<mergedSchema['_def']['unknownKeys'], 'strip'>(true)
    expect(mergedSchema._def.unknownKeys).toEqual('strip')

    assertEqual<mergedSchema['_def']['catchall'], z.ZodString>(true)
    expect(mergedSchema._def.catchall instanceof z.ZodString).toEqual(true)
  })

  const personToExtend = vObject({
    firstName: vString(),
    lastName: vString(),
  })

  it('extend() should return schema with new key', () => {
    const PersonWithNickname = personToExtend.extend({ nickName: z.string() })
    type PersonWithNickname = z.infer<typeof PersonWithNickname>

    const expected = { firstName: 'f', nickName: 'n', lastName: 'l' }
    const actual = PersonWithNickname.parse(expected)

    expect(actual).toEqual(expected)
    assertEqual<keyof PersonWithNickname, 'firstName' | 'lastName' | 'nickName'>(true)
    assertEqual<PersonWithNickname, { firstName: string; lastName: string; nickName: string }>(true)
  })

  it('extend() should have power to override existing key', () => {
    const PersonWithNumberAsLastName = personToExtend.extend({
      lastName: z.number(),
    })
    type PersonWithNumberAsLastName = z.infer<typeof PersonWithNumberAsLastName>

    const expected = { firstName: 'f', lastName: 42 }
    const actual = PersonWithNumberAsLastName.parse(expected)

    expect(actual).toEqual(expected)
    assertEqual<PersonWithNumberAsLastName, { firstName: string; lastName: number }>(true)
  })
})
