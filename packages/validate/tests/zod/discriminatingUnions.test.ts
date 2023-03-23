/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { vObject } from '../../src/types/object'
import { vLiteral, vUnion } from '../../src/types/init'
import { vStringInstance } from '../../src/types/string'

describe('adapted from zod anyunknown', () => {
  it('valid', () => {
    expect(
      vUnion(
        [
          vObject({ type: vLiteral('a'), a: vStringInstance }),
          vObject({ type: vLiteral('b'), b: vStringInstance }),
        ],
        { discriminatedUnionKey: 'type' },
      ).parse({ type: 'a', a: 'abc' }),
    ).toEqual({ type: 'a', a: 'abc' })
  })

  it('valid - discriminator value of various primitive types', () => {
    const schema = vUnion(
      [
        vObject({ type: vLiteral('1'), val: vLiteral(1) }),
        vObject({ type: vLiteral(1), val: vLiteral(2) }),
        vObject({ type: vLiteral(BigInt(1)), val: vLiteral(3) }),
        vObject({ type: vLiteral('true'), val: vLiteral(4) }),
        vObject({ type: vLiteral(true), val: vLiteral(5) }),
        vObject({ type: vLiteral('null'), val: vLiteral(6) }),
        vObject({ type: vLiteral(null), val: vLiteral(7) }),
        vObject({ type: vLiteral('undefined'), val: vLiteral(8) }),
        vObject({ type: vLiteral(undefined), val: vLiteral(9) }),
        vObject({ type: vLiteral('transform'), val: vLiteral(10) }),
        vObject({ type: vLiteral('refine'), val: vLiteral(11) }),
        vObject({ type: vLiteral('superRefine'), val: vLiteral(12) }),
      ],
      { discriminatedUnionKey: 'type' },
    )

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
      vUnion(
        [
          vObject({ type: vLiteral('a'), a: vStringInstance }),
          vObject({ type: vLiteral('b'), b: vStringInstance }),
        ],
        { discriminatedUnionKey: 'type' },
      ).parse(null)
      throw new Error()
    } catch (e: any) {
      expect(e.errors[0]).toEqual(`value null is not of type object`)
    }
  })

  it('invalid discriminator value', () => {
    try {
      vUnion(
        [
          vObject({ type: vLiteral('a'), a: vStringInstance }),
          vObject({ type: vLiteral('b'), b: vStringInstance }),
        ],
        { discriminatedUnionKey: 'type' },
      ).parse({ type: 'x', a: 'abc' })
      throw new Error()
    } catch (e: any) {
      expect(e.errors[0]).toEqual(
        `the discriminatedUnionKey 'type' found no matches for the value: {"type":"x","a":"abc"}`,
      )
    }
  })

  it('valid discriminator value, invalid data', () => {
    try {
      vUnion(
        [
          vObject({ type: vLiteral('a'), a: vStringInstance }),
          vObject({ type: vLiteral('b'), b: vStringInstance }),
        ],
        { discriminatedUnionKey: 'type' },
      ).parse({ type: 'a', b: 'abc' })
      throw new Error()
    } catch (e: any) {
      expect(e.errors[0]).toEqual(
        `The object {"type":"a","b":"abc"} is not of type {type:"a",a:string}|{type:"b",b:string}.
"a": property: "a" not found in {"type":"a","b":"abc"}, 
"b": "abc" doesn't match 'never'`,
      )
    }
  })

  it('wrong schema - missing discriminator', () => {
    try {
      vUnion(
        [
          vObject({ type: vLiteral('a'), a: vStringInstance }),
          vObject({ b: vStringInstance }) as any,
        ],
        { discriminatedUnionKey: 'type' },
      )
      throw new Error()
    } catch (e: any) {
      expect(e.message).toEqual(`property 'type' not found in object definition: {b:string}`)
    }
  })

  it.skip('wrong schema - duplicate discriminator values', () => {
    try {
      vUnion(
        [
          vObject({ type: vLiteral('a'), a: vStringInstance }),
          vObject({ type: vLiteral('a'), b: vStringInstance }),
        ],
        { discriminatedUnionKey: 'type' },
      )
      throw new Error()
    } catch (e: any) {
      expect(e.message.includes('has duplicate value')).toEqual(true)
    }
  })

  //   it('async - valid', async () => {
  //     expect(
  //       await z
  //         .discriminatedUnion('type', [
  //           vObject({
  //             type: vLiteral('a'),
  //             a: z
  //               .string()
  //               .refine(async () => true)
  //               .transform(async (val) => Number(val)),
  //           }),
  //           vObject({
  //             type: vLiteral('b'),
  //             b: vStringInstance,
  //           }),
  //         ])
  //         .parseAsync({ type: 'a', a: '1' }),
  //     ).toEqual({ type: 'a', a: 1 })
  //   })

  //   it('async - invalid', async () => {
  //     try {
  //       await z
  //         .discriminatedUnion('type', [
  //           vObject({
  //             type: vLiteral('a'),
  //             a: z
  //               .string()
  //               .refine(async () => true)
  //               .transform(async (val) => val),
  //           }),
  //           vObject({
  //             type: vLiteral('b'),
  //             b: vStringInstance,
  //           }),
  //         ])
  //         .parseAsync({ type: 'a', a: 1 })
  //       throw new Error()
  //     } catch (e: any) {
  //       expect(JSON.parse(e.message)).toEqual([
  //         {
  //           code: 'invalid_type',
  //           expected: 'string',
  //           received: 'number',
  //           path: ['a'],
  //           message: 'Expected string, received number',
  //         },
  //       ])
  //     }
  //   })

  // it('valid - literals with .default or .preprocess', () => {
  //   const schema = vUnion([
  //     vObject(
  //       {
  //         type: vLiteral('foo').default('foo'),
  //         a: vStringInstance,
  //       },
  //       { discriminatedUnionKey: 'type' },
  //     ),
  //     vObject({
  //       type: vLiteral('custom'),
  //       method: vStringInstance,
  //     }),
  //     vObject({
  //       type: z.preprocess((val) => String(val), vLiteral('bar')),
  //       c: vStringInstance,
  //     }),
  //   ])
  //   expect(schema.parse({ type: 'foo', a: 'foo' })).toEqual({
  //     type: 'foo',
  //     a: 'foo',
  //   })
  // })
})
