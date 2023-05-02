/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, expect } from 'vitest'
import { v } from '../../src'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

it('check any inference', () => {
  const t1 = v.any
  t1.optional()
  t1.nullable()
  type t1 = v.Infer<typeof t1>
  assertEqual<t1, any>(true)
})

it('check unknown inference', () => {
  const t1 = v.unknown
  t1.optional()
  t1.nullable()
  type t1 = v.Infer<typeof t1>
  assertEqual<t1, unknown>(true)
})

it('check never inference', () => {
  const t1 = v.never
  expect(() => t1.parse(undefined)).toThrow()
  expect(() => t1.parse('asdf')).toThrow()
  expect(() => t1.parse(null)).toThrow()
})
