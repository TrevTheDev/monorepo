import { describe, it, expect } from 'vitest'
import { vArray } from '../../src/validate/array'
import { vString } from '../../src/validate/string'
import { vNumber } from '../../src/validate/number'
import { VInfer } from '../../src/validate/base'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

describe('vArray', () => {
  it('vArray Infinite', () => {
    const t1 = vArray(vString())
    t1.safeParse(['A', 'B'])
    expect(JSON.stringify(t1.parse(['A', 'B']))).toEqual(JSON.stringify(['A', 'B']))
    expect(() => t1.parse(['A', 1, 2])).toThrow()
    expect(t1.type).toEqual('string[]')
    assertEqual<VInfer<typeof t1>, string[]>(true)
  })

  it('vArray Finite', () => {
    const t = [vString(), vNumber(), vArray(vString()).spread] as const
    const t1 = vArray(t)
    expect(JSON.stringify(t1.parse(['A', 1, 'B', `C`, `D`]))).toEqual(
      JSON.stringify(['A', 1, 'B', `C`, `D`]),
    )
    expect(() => t1.parse(['A', 1, 'B', `C`, 2])).toThrow()
    expect(() => t1.parse(['A', 1, 2, `C`, `D`])).toThrow()
    expect(() => t1.parse(['A', '1', 'B', `C`, `D`])).toThrow()
    expect(() => t1.parse([1, 1, 'B', `C`, `D`])).toThrow()
    expect(t1.type).toEqual('[string,number,...string[]]')
    assertEqual<VInfer<typeof t1>, [string, number, ...string[]]>(true)
  })

  it('throws on [...T[], T?]', () => {
    const t = [vArray(vString()).spread, vString().optional()] as const
    expect(() => vArray(t)).toThrow()
    if ((true as boolean) === false) {
      const x = vArray(t)
      assertEqual<VInfer<typeof x>, never>(true)
    }
  })
  it('throws on [T, ...T[], ...T[]]', () => {
    const t = [vString(), vArray(vString()).spread, vArray(vString()).spread] as const
    expect(() => vArray(t)).toThrow()
    if ((true as boolean) === false) {
      const x = vArray(t)
      assertEqual<VInfer<typeof x>, never>(true)
    }
  })
  it('throws on [T?, T]', () => {
    const t = [vString().optional(), vString()] as const
    expect(() => vArray(t)).toThrow()
    if ((true as boolean) === false) {
      const x = vArray(t)
      assertEqual<VInfer<typeof x>, never>(true)
    }
  })
  it('parses [T, T]', () => {
    const t = [vString(), vString(), vNumber()] as const
    expect(JSON.stringify(vArray(t).parse(['A', 'B', 1]))).toEqual(JSON.stringify(['A', 'B', 1]))
    if ((true as boolean) === false) {
      const x = vArray(t)
      assertEqual<VInfer<typeof x>, [string, string, number]>(true)
    }
  })
  it('parses [T, ...T[], T]', () => {
    const t = [vString(), vArray(vString()).spread, vNumber()] as const
    expect(JSON.stringify(vArray(t).parse(['A', 'B', 'C', 1]))).toEqual(
      JSON.stringify(['A', 'B', 'C', 1]),
    )
    expect(JSON.stringify(vArray(t).parse(['A', 1]))).toEqual(JSON.stringify(['A', 1]))
    const t1 = [vNumber(), vArray(vString()).spread, vNumber()] as const
    expect(JSON.stringify(vArray(t1).parse([1, 'A', 1]))).toEqual(JSON.stringify([1, 'A', 1]))
    expect(JSON.stringify(vArray(t1).parse([1, 1]))).toEqual(JSON.stringify([1, 1]))
    if ((true as boolean) === false) {
      const x = vArray(t)
      assertEqual<VInfer<typeof x>, [string, ...string[], number]>(true)
    }
  })
  it('parses [T?, T?]', () => {
    const t = [vString().optional(), vString().optional()] as const
    expect(JSON.stringify(vArray(t).parse(['A', 'A']))).toEqual(JSON.stringify(['A', 'A']))
    expect(JSON.stringify(vArray(t).parse([undefined, 'A']))).toEqual(
      JSON.stringify([undefined, 'A']),
    )
    expect(JSON.stringify(vArray(t).parse([undefined, undefined]))).toEqual(
      JSON.stringify([undefined, undefined]),
    )
    expect(JSON.stringify(vArray(t).parse([undefined]))).toEqual(JSON.stringify([undefined]))
    expect(JSON.stringify(vArray(t).parse(['A']))).toEqual(JSON.stringify(['A']))
    expect(JSON.stringify(vArray(t).parse([]))).toEqual(JSON.stringify([]))
    expect(() => JSON.stringify(vArray(t).parse(['A', 'A', 'A']))).toThrow()
    if ((true as boolean) === false) {
      const x = vArray(t)
      assertEqual<VInfer<typeof x>, [string?, string?]>(true)
    }
  })
  it('parses [T?, ...T[]]', () => {
    const t = [vString().optional(), vArray(vNumber()).spread] as const
    expect(JSON.stringify(vArray(t).parse([undefined, 1, 2]))).toEqual(
      JSON.stringify([undefined, 1, 2]),
    )
    expect(JSON.stringify(vArray(t).parse(['A', 1]))).toEqual(JSON.stringify(['A', 1]))
    expect(JSON.stringify(vArray(t).parse([undefined, 1]))).toEqual(JSON.stringify([undefined, 1]))
    expect(JSON.stringify(vArray(t).parse([undefined]))).toEqual(JSON.stringify([undefined]))
    expect(JSON.stringify(vArray(t).parse(['A']))).toEqual(JSON.stringify(['A']))
    expect(JSON.stringify(vArray(t).parse([]))).toEqual(JSON.stringify([]))
    if ((true as boolean) === false) {
      const x = vArray(t)
      assertEqual<VInfer<typeof x>, [string?, ...number[]]>(true)
    }
  })
})
