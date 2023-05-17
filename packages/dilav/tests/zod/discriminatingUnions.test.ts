/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, expect } from 'vitest'
import { v } from '../../src'

it('valid', () => {
  expect(
    v.union
      .key('type', [
        v.object({ type: v.literal('a'), a: v.string }),
        v.object({ type: v.literal('b'), b: v.string }),
      ])
      .parse({ type: 'a', a: 'abc' }),
  ).toEqual({ type: 'a', a: 'abc' })
})

it('valid - discriminator value of various primitive types', () => {
  const schema = v.union.key('type', [
    v.object({ type: v.literal('1'), val: v.literal(1) }),
    v.object({ type: v.literal(1), val: v.literal(2) }),
    v.object({ type: v.literal(BigInt(1)), val: v.literal(3) }),
    v.object({ type: v.literal('true'), val: v.literal(4) }),
    v.object({ type: v.literal(true), val: v.literal(5) }),
    v.object({ type: v.literal('null'), val: v.literal(6) }),
    v.object({ type: v.literal(null), val: v.literal(7) }),
    v.object({ type: v.literal('undefined'), val: v.literal(8) }),
    v.object({ type: v.literal(undefined), val: v.literal(9) }),
    v.object({ type: v.literal('transform'), val: v.literal(10) }),
    v.object({ type: v.literal('refine'), val: v.literal(11) }),
    v.object({ type: v.literal('superRefine'), val: v.literal(12) }),
  ])

  expect(schema.parse({ type: '1', val: 1 })).toEqual({ type: '1', val: 1 })
  expect(schema.parse({ type: 1, val: 2 })).toEqual({ type: 1, val: 2 })
  expect(schema.parse({ type: BigInt(1), val: 3 })).toEqual({
    type: BigInt(1),
    val: 3,
  })
  expect(schema.parse({ type: 'true', val: 4 })).toEqual({
    type: 'true',
    val: 4,
  })
  expect(schema.parse({ type: true, val: 5 })).toEqual({
    type: true,
    val: 5,
  })
  expect(schema.parse({ type: 'null', val: 6 })).toEqual({
    type: 'null',
    val: 6,
  })
  expect(schema.parse({ type: null, val: 7 })).toEqual({
    type: null,
    val: 7,
  })
  expect(schema.parse({ type: 'undefined', val: 8 })).toEqual({
    type: 'undefined',
    val: 8,
  })
  expect(schema.parse({ type: undefined, val: 9 })).toEqual({
    type: undefined,
    val: 9,
  })
})

it('invalid - null', () => {
  try {
    v.union
      .key('type', [
        v.object({ type: v.literal('a'), a: v.string }),
        v.object({ type: v.literal('b'), b: v.string }),
      ])
      .parse(null)
    throw new Error()
  } catch (e: any) {
    expect(e.errors[0]).toEqual('no schemas matched: null')
  }
})

it('invalid discriminator value', () => {
  try {
    v.union
      .key('type', [
        v.object({ type: v.literal('a'), a: v.string }),
        v.object({ type: v.literal('b'), b: v.string }),
      ])
      .parse({ type: 'x', a: 'abc' })
    throw new Error()
  } catch (e: any) {
    expect(e.errors[0]).toEqual(`no schemas matched: {"type":"x","a":"abc"}`)
  }
})

it('valid discriminator value, invalid data', () => {
  try {
    v.union
      .key('type', [
        v.object({ type: v.literal('a'), a: v.string }),
        v.object({ type: v.literal('b'), b: v.string }),
      ])
      .parse({ type: 'a', b: 'abc' })
    throw new Error()
  } catch (e: any) {
    expect(e.errors[0]).toEqual(`a: property: "a" not found in {"type":"a","b":"abc"}`)
  }
})

it('wrong schema - missing discriminator', () => {
  try {
    v.union.key(
      'type',
      [v.object({ type: v.literal('a'), a: v.string }), v.object({ b: v.string }) as any],
      {},
    )
    throw new Error()
  } catch (e: any) {
    expect(e.message).toBe(`property 'type' not found in object definition: {b:string}`)
  }
})

it.skip('wrong schema - duplicate discriminator values', () => {
  try {
    v.union.key('type', [
      v.object({ type: v.literal('a'), a: v.string }),
      v.object({ type: v.literal('a'), b: v.string }),
    ])
    throw new Error()
  } catch (e: any) {
    expect(e.message.includes('has duplicate value')).toEqual(true)
  }
})

it.skip('async - valid', async () => {
  // expect(
  //   await v
  //     .union(
  //       [
  //         v.object({
  //           type: v.literal('a'),
  //           a: v.string.refine(async () => true).transform(async (val) => Number(val)),
  //         }),
  //         v.object({
  //           type: v.literal('b'),
  //           b: v.string,
  //         }),
  //       ],
  //       { discriminatedUnionKey: 'type' },
  //     )
  //     .parseAsync({ type: 'a', a: '1' }),
  // ).toEqual({ type: 'a', a: 1 })
})

it.skip('async - invalid', async () => {
  // try {
  //   await v
  //     .union(
  //       [
  //         v.object({
  //           type: v.literal('a'),
  //           a: v.string.refine(async () => true).transform(async (val) => val),
  //         }),
  //         v.object({
  //           type: v.literal('b'),
  //           b: v.string,
  //         }),
  //       ],
  //       { discriminatedUnionKey: 'type' },
  //     )
  //     .parseAsync({ type: 'a', a: 1 })
  //   throw new Error()
  // } catch (e: any) {
  //   expect(JSON.parse(e.message)).toEqual([
  //     {
  //       code: 'invalid_type',
  //       expected: 'string',
  //       received: 'number',
  //       path: ['a'],
  //       message: 'Expected string, received number',
  //     },
  //   ])
  // }
})

it.skip('valid - literals with .default or .preprocess', () => {
  const schema = v.union.key('type', [
    v.object({
      type: v.literal('foo').default('foo'),
      a: v.string,
    }),
    v.object({
      type: v.literal('custom'),
      method: v.string,
    }),
    v.object({
      type: v.literal('bar').preprocess((val) => String(val)),
      c: v.string,
    }),
  ])
  expect(schema.parse({ type: 'foo', a: 'foo' })).toEqual({
    type: 'foo',
    a: 'foo',
  })
})
