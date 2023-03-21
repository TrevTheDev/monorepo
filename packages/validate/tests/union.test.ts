/* eslint-disable no-empty */
/* eslint-disable no-restricted-syntax */
/* eslint-disable curly */
import { describe, it, expect } from 'vitest'
// eslint-disable-next-line import/no-extraneous-dependencies
import { vUnion, vLiteral } from '../src/types/init'
import { vString } from '../src/types/string'
import { vBoolean } from '../src/types/boolean'

describe('union', () => {
  it('passing validations', () => {
    const un = vUnion([vString(), vBoolean()] as const)
    expect(un.parse(true)).toEqual(true)
    expect(un.parse('abc')).toEqual('abc')
    expect(() => un.parse(1)).toThrow()
    const result = un.safeParse(1)
    debugger
    expect(result[0] && result[0].input).toEqual(1)
    expect(result[0] && result[0].errors.length).toEqual(2)
  })
  it('custom validations', () => {
    const un = vUnion([vString(), vBoolean()] as const).customValidation((value) => {
      if (value === 'A') return 'not A'
      return undefined
    })
    debugger
    expect(() => un.parse('A')).toThrow()
    const res = un.safeParse('A')
    if (res[0] !== undefined) expect(res[0].errors[0]).toEqual('not A')
    expect(un.parse('abc')).toEqual('abc')
  })

  it.skip('typechecking', () => {
    type StrictEqual<A1, A2> = [A1] extends [A2] ? ([A2] extends [A1] ? true : false) : false
    const typesMatch = <A, B>(match: StrictEqual<A, B>) => match

    const z01 = vUnion([vString(), vBoolean()] as const).parse('A')
    typesMatch<string | boolean, typeof z01>(true)
    const literalA = vLiteral('a' as const)
    const literalB = vLiteral('b' as const)
    const literalC = vLiteral('c' as const)
    const z02 = vUnion([literalA, literalB, literalC] as const).parse('A')
    typesMatch<'a' | 'b' | 'c', typeof z02>(true)
    // const z02 = vUnion([vString().beOneOf(['A', 'B'] as const), vBoolean()]).parse('A')
    // const z03 = vUnion([vString().beOneOf(['A', 'B'] as const), vBoolean().beTrue()]).parse('A')
    // typesMatch<true | 'A' | 'B', typeof z03>(true)
  })
})

// it.only('catches', () => {
//   const un = vUnion([vString(), vBoolean()]).catch((value) => {
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
