/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, expect } from 'vitest'
import { vObject } from '../../src/types/object'
import { vNumber, vNumberInstance } from '../../src/types/number'
import { vString, vStringInstance } from '../../src/types/string'
import { vDateInstance } from '../../src/types/date'
import { vArray, vUnion, vUnknownInstance } from '../../src/types/init'
import { vBoolean } from '../../src/types/boolean'
import { VInfer } from '../../src/types/base'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const u = vUnion([vString(), vBoolean()] as const)

const obj = {
  f1: vNumber(),
  f2: vString().optional(),
  f3: vString().nullable(),
  f4: vArray(vObject({ t: u })),
}

const testObject = vObject(obj)
type Test = VInfer<typeof testObject>

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
  expect(() => testObject.parse(asdf)).toThrow()
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
  testObject.parse({
    f1: 12,
    f2: 'string',
    f3: 'string',
    f4: [
      {
        t: 'string',
      },
    ],
  })

  testObject.parse({
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
  expect(() => testObject.parse({} as any)).toThrow()
})

it('nonstrict by default', () => {
  vObject({ points: vNumberInstance }, vUnknownInstance).parse({
    points: 2314,
    unknown: 'asdf',
  })
})

const data = {
  points: 2314,
  unknown: 'asdf',
}

// it.skip('strip by default', () => {
//   const val = vObject({ points: vNumber() }, { strict: false }).parse(data)
//   debugger
//   expect(`${val}`).toEqual(`${data}`)
// })

it('unknownkeys override', () => {
  const val = vObject({ points: vNumber() })
    .passThrough()
    // .strip()
    //   .nonstrict()
    .parse(data)
  expect(val).toEqual(data)
})

it('passthrough unknown', () => {
  const val = vObject({ points: vNumber() }).passThrough().parse(data)
  expect(val).toEqual(data)
})

// it.skip('strip unknown', () => {
//   const val1 = z.object({ points: z.number() }).strip().parse(data)
//   const val2 = z.object({ points: z.number() }).passthrough().parse(data)
//   const t = val2.x12

//   expect(val).toEqual({ points: 2314 })
// })

// const val2: z.objectOutputType<
//   {
//     points: z.ZodNumber
//   },
//   z.ZodTypeAny,
//   'passthrough'
// >

it('strict', () => {
  const val = vObject({ points: vNumberInstance }).strict().safeParse(data)

  expect(val[0] === undefined).toEqual(false)
})

it('catchall inference', () => {
  const o1 = vObject({
    first: vStringInstance,
  }).catchAll(vNumberInstance)

  const d1 = o1.parse({ first: 'asdf', num: 1243 })
  assertEqual<number, (typeof d1)['asdf']>(true)
  assertEqual<string, (typeof d1)['first']>(true)
})

it('catchall overrides strict', () => {
  const o1 = vObject({ first: vString().optional() }).strict().catchAll(vNumberInstance)

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
  const o1 = vObject({
    first: vStringInstance,
  })
    .strict()
    .catchAll(vNumberInstance)

  // should run fine
  // setting a catchall overrides the unknownKeys behavior
  o1.parse({
    first: 'asdf',
    asdf: 1234,
  })
})

it('test that optional keys are unset', () => {
  const SNamedEntity = vObject({
    id: vStringInstance,
    set: vStringInstance.optional(),
    unset: vStringInstance.optional(),
  })
  const result = SNamedEntity.parse({
    id: 'asdf',
    set: undefined,
  })
  expect(Object.keys(result)).toEqual(['id', 'set'])
})

it('test catchall parsing', () => {
  const result = vObject({ name: vStringInstance })
    .catchAll(vNumberInstance)
    .parse({ name: 'Foo', validExtraKey: 61 })

  expect(result).toEqual({ name: 'Foo', validExtraKey: 61 })

  const result2 = vObject({ name: vStringInstance })
    .catchAll(vNumberInstance)
    .safeParse({ name: 'Foo', validExtraKey: 61, invalid: 'asdf' })

  expect(result2[0] !== undefined).toEqual(true)
})

it('test nonexistent keys', () => {
  const Schema = vUnion([vObject({ a: vStringInstance }), vObject({ b: vNumberInstance })])
  const obj1 = { a: 'A' }
  const result = Schema.safeParse(obj1) // Works with 1.11.10, breaks with 2.0.0-beta.21
  expect(result[0] === undefined).toEqual(true)
})

it('test async union', () => {
  const Schema2 = vUnion([
    vObject({
      ty: vStringInstance,
    }),
    vObject({
      ty: vNumberInstance,
    }),
  ])

  const obj1 = { ty: 'A' }
  const result = Schema2.safeParse(obj1) // Works with 1.11.10, breaks with 2.0.0-beta.21
  expect(result[0] === undefined).toEqual(true)
})

it('test inferred merged type', () => {
  const asdf = vObject({ a: vStringInstance }).merge(vObject({ a: vNumberInstance }))
  type asdf = VInfer<typeof asdf>
  assertEqual<asdf, { a: number }>(true)
})

it('inferred merged object type with optional properties', async () => {
  const Merged = vObject({ a: vStringInstance, b: vStringInstance.optional() }).merge(
    vObject({ a: vStringInstance.optional(), b: vStringInstance }),
  )
  type Merged = VInfer<typeof Merged>
  assertEqual<Merged, { a?: string; b: string }>(true)
})

it('inferred unioned object type with optional properties', () => {
  const data1 = [
    vObject({ a: vStringInstance, b: vStringInstance.optional() }),
    vObject({ a: vStringInstance.optional(), b: vStringInstance }),
  ] as const
  const unioned = vUnion(data1)
  type Unioned = VInfer<typeof unioned>
  assertEqual<Unioned, { a: string; b?: string } | { a?: string; b: string }>(true)
})

// it.skip('inferred enum type', () => {
//   const Enum = vObject({ a: vStringInstance, b: vStringInstance.optional() }).keyof()

//   expect(Enum.Values).toEqual({
//     a: 'a',
//     b: 'b',
//   })
//   expect(Enum.enum).toEqual({
//     a: 'a',
//     b: 'b',
//   })
//   expect(Enum._def.values).toEqual(['a', 'b'])
//   type Enum = z.infer<typeof Enum>
//   assertEqual<Enum, 'a' | 'b'>(true)
// })

it('inferred partial object type with optional properties', () => {
  const Partial = vObject({ a: vStringInstance, b: vStringInstance.optional() }).partial()
  type Partial = VInfer<typeof Partial>
  assertEqual<Partial, { a?: string; b?: string }>(true)
})

it('inferred picked object type with optional properties', () => {
  const Picked = vObject({ a: vString(), b: vString().optional() }).pick('b')
  type Picked = VInfer<typeof Picked>
  assertEqual<Picked, { b?: string }>(true)
})

// it('inferred type for unknown/any keys', () => {
//   const myType = vObject({
//     anyOptional: vAnyInstance.optional(),
//     anyRequired: vAnyInstance,
//     unknownOptional: vUnknownInstance.optional(),
//     unknownRequired: vUnknownInstance,
//   })
//   type myType = VInfer<typeof myType>
//   assertEqual<
//     myType,
//     {
//       anyOptional?: any
//       anyRequired?: any
//       unknownOptional?: unknown
//       unknownRequired?: unknown
//     }
//   >(true)
// })

// it.skip('setKey', () => {
//   const base = z.object({ name: z.string() })
//   const withNewKey = base.setKey('age', z.number())

//   type withNewKey = z.infer<typeof withNewKey>
//   assertEqual<withNewKey, { name: string; age: number }>(true)
//   withNewKey.parse({ name: 'asdf', age: 1234 })
// })

// it('strictcreate', () => {
//   const strictObj = z.strictObject({
//     name: z.string(),
//   })

//   const syncResult = strictObj.safeParse({ name: 'asdf', unexpected: 13 })
//   expect(syncResult.success).toEqual(false)

//   const asyncResult = await strictObj.spa({ name: 'asdf', unexpected: 13 })
//   expect(asyncResult.success).toEqual(false)
// })

// it('object with refine', async () => {
//   const schema = z
//     .object({
//       a: z.string().default('foo'),
//       b: z.number(),
//     })
//     .refine(() => true)
//   expect(schema.parse({ b: 5 })).toEqual({ b: 5, a: 'foo' })
//   const result = await schema.parseAsync({ b: 5 })
//   expect(result).toEqual({ b: 5, a: 'foo' })
// })

it('intersection of object with date', () => {
  const schema = vObject({
    a: vDateInstance,
  })
  expect(schema.and(schema).parse({ a: new Date(1637353595983) })).toEqual({
    a: new Date(1637353595983),
  })
  const result = schema.parse({ a: new Date(1637353595983) })
  expect(result).toEqual({ a: new Date(1637353595983) })
})

// it.only('intersection of object with refine with date', () => {
//   const schema = vObject({
//       a: vDateInstance,
//     })
//     .refine(() => true)
//   expect(schema.and(schema).parse({ a: new Date(1637353595983) })).toEqual({
//     a: new Date(1637353595983),
//   })
//   const result = await schema.parseAsync({ a: new Date(1637353595983) })
//   expect(result).toEqual({ a: new Date(1637353595983) })
// })

it('constructor key', () => {
  const person = vObject({
    name: vStringInstance,
  })

  expect(() =>
    person.parse({
      name: 'bob dylan',
      constructor: 61,
    }),
  ).toThrow()
})

it('constructor key', () => {
  const Example = vObject({
    prop: vStringInstance,
    opt: vNumberInstance.optional(),
    arr: vStringInstance.array(),
  })

  type Example = VInfer<typeof Example>
  assertEqual<keyof Example, 'prop' | 'opt' | 'arr'>(true)
})

// it('unknownkeys merging', () => {
//   // This one is "strict"
//   const schemaA = vObject({
//     a: vStringInstance,
//   })

//   // This one is "strip"
//   const schemaB = vObject({
//     b: vStringInstance,
//   }).catchAll(vStringInstance)

//   const mergedSchema = schemaA.merge(schemaB)
//   type mergedSchema = VInfer<typeof mergedSchema>
//   assertEqual<mergedSchema['_def']['unknownKeys'], 'strip'>(true)
//   expect(mergedSchema._def.unknownKeys).toEqual('strip')

//   assertEqual<mergedSchema['_def']['catchall'], z.ZodString>(true)
//   expect(mergedSchema._def.catchall instanceof z.ZodString).toEqual(true)
// })

const personToExtend = vObject({
  firstName: vStringInstance,
  lastName: vStringInstance,
})

it('extend() should return schema with new key', () => {
  const PersonWithNickname = personToExtend.extends({ nickName: vStringInstance })
  type PersonWithNickname = VInfer<typeof PersonWithNickname>

  const expected = { firstName: 'f', nickName: 'n', lastName: 'l' }
  const actual = PersonWithNickname.parse(expected)

  expect(actual).toEqual(expected)
  assertEqual<keyof PersonWithNickname, 'firstName' | 'lastName' | 'nickName'>(true)
  assertEqual<PersonWithNickname, { firstName: string; lastName: string; nickName: string }>(true)
})

it('extend() should have power to override existing key', () => {
  const PersonWithNumberAsLastName = personToExtend.extends({
    lastName: vNumberInstance,
  })
  type PersonWithNumberAsLastName = VInfer<typeof PersonWithNumberAsLastName>

  const expected = { firstName: 'f', lastName: 42 }
  const actual = PersonWithNumberAsLastName.parse(expected)

  expect(actual).toEqual(expected)
  assertEqual<PersonWithNumberAsLastName, { firstName: string; lastName: number }>(true)
})
