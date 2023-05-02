import { it, expect } from 'vitest'
import { v } from '../../src'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

it('type guard', () => {
  const stringToNumber = v.string.transform((arg) => arg.length)

  const x = {
    stringToNumber,
  }
  const s1 = v.object(x)
  type t1 = v.Infer<typeof s1>

  const data = { stringToNumber: 'asdf' }
  const parsed = s1.safeParse(data)
  if (v.isResult(parsed)) assertEqual<typeof data, t1>(false)
})

it('test this binding', () => {
  const callback = (predicate: (val: string) => boolean) => predicate('hello')

  expect(callback((value) => v.isResult(v.string.safeParse(value)))).toBe(true) // true
  expect(callback((value) => v.isResult(v.string.safeParse(value)))).toBe(true) // true
})
