/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { vAny, vNever, vUnknown } from '../../src/types/init'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

describe('adapted from zod anyunknown', () => {
  it('check any inference', () => {
    const t1 = vAny()
    // t1.optional()
    // t1.nullable()
    type t1 = ReturnType<(typeof t1)['parse']>
    assertEqual<t1, any>(true)
  })

  it('check unknown inference', () => {
    const t1 = vUnknown()
    // t1.optional()
    // t1.nullable()
    type t1 = ReturnType<(typeof t1)['parse']>
    assertEqual<t1, unknown>(true)
  })

  it('check never inference', () => {
    const t1 = vNever()
    expect(() => t1.parse(undefined)).toThrow()
    expect(() => t1.parse('asdf')).toThrow()
    expect(() => t1.parse(null)).toThrow()
  })
})
