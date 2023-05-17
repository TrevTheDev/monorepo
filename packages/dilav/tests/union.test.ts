/* eslint-disable no-empty */
/* eslint-disable no-restricted-syntax */
/* eslint-disable curly */
import { it, expect } from 'vitest'
// eslint-disable-next-line import/no-extraneous-dependencies
import { v } from '../src'

it('passing validations', () => {
  const un = v.union([v.string, v.boolean])
  expect(un.parse(true)).toEqual(true)
  expect(un.parse('abc')).toEqual('abc')
  expect(() => un.parse(1)).toThrow()
  const result = un.safeParse(1)
  debugger
  expect(result[0] && result[0].input).toEqual(1)
  expect(result[0] && result[0].errors.length).toEqual(2)
})
it('custom validations', () => {
  const un = v.union([v.string, v.boolean]).customValidation((value) => {
    if (value === 'A') return 'not A'
    return undefined
  })
  debugger
  expect(() => un.parse('A')).toThrow()
  const res = un.safeParse('A')
  if (res[0] !== undefined) expect(res[0].errors[0]).toEqual('not A')
  expect(un.parse('abc')).toEqual('abc')
})

it('discriminated union, multi key', () => {
  const A1 = v.object({
    k1: v.literal('A'),
    k2: v.literal('A'),
    data: v.literal('A'),
  })

  const A2 = v.object({
    k1: v.literal('A'),
    k2: v.literal('B'),
    data: v.literal('B'),
  })

  const A3 = v.object({
    k1: v.literal('A'),
    k2: v.literal('C'),
    data: v.literal('C'),
  })

  const B = v.object({
    k1: v.literal('B'),
    k2: v.literal('BA'),
    data: v.literal('BA'),
  })

  // const union = v.union.key([A1, A2, A3, B], { discriminatedUnionKey: ['k1', 'k2'] })
  // union.parse({
  //   k1: 'A',
  //   k2: 'A',
  //   data: 'A',
  // })
  // union.parse({
  //   k1: 'A',
  //   k2: 'B',
  //   data: 'B',
  // })
  // union.parse({
  //   k1: 'A',
  //   k2: 'C',
  //   data: 'C',
  // })
  // union.parse({
  //   k1: 'B',
  //   k2: 'BA',
  //   data: 'BA',
  // })
  // expect(() =>
  //   union.parse({
  //     k1: 'A',
  //     k2: 'D',
  //     data: 'C',
  //   }),
  // ).toThrow()
  // expect(() =>
  //   union.parse({
  //     k1: 'A',
  //     k2: 'C',
  //     data: 'D',
  //   }),
  // ).toThrow()
})

it.skip('typechecking', () => {
  type StrictEqual<A1, A2> = [A1] extends [A2] ? ([A2] extends [A1] ? true : false) : false
  const typesMatch = <A, B>(match: StrictEqual<A, B>) => match

  const z01 = v.union([v.string, v.boolean]).parse('A')
  typesMatch<string | boolean, typeof z01>(true)
  const literalA = v.literal('a')
  const literalB = v.literal('b')
  const literalC = v.literal('c')
  const z02 = v.union([literalA, literalB, literalC]).parse('A')
  typesMatch<'a' | 'b' | 'c', typeof z02>(true)
  // const z02 = v.union([v.string.beOneOf(['A', 'B']), v.boolean]).parse('A')
  // const z03 = v.union([v.string.beOneOf(['A', 'B']), v.boolean.beTrue()]).parse('A')
  // typesMatch<true | 'A' | 'B', typeof z03>(true)
})

// it.only('catches', () => {
//   const un = v.union([v.string, v.boolean]).catch((value) => {
//     debugger
//     return `abc${value.input}`
//   })
//   const re = un.parse(1)
//   expect(re).toEqual('abc1')
//   // expect(un.parse('abc')).toEqual('abc')
//   // expect(() => un.parse(1)).toThrow()
//   // const result = un.safeParse(1)
//   // debugger
//   // expect(result[0] && result[0].input).toEqual(1)
//   // expect(result[0] && result[0].errors.length).toEqual(2)
// })
