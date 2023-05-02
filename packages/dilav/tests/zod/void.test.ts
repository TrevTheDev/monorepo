import { it, expect } from 'vitest'
import { v } from '../../src'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

it('void', () => {
  const z = v.void
  z.parse(undefined)

  expect(() => z.parse(null)).toThrow()
  expect(() => z.parse('')).toThrow()

  type z = v.Infer<typeof z>
  assertEqual<z, void>(true)
})
