/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, expect } from 'vitest'
import { v } from '../../src'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const stringMap = v.map([v.string, v.string])
type stringMap = v.Infer<typeof stringMap>

it('type inference', () => {
  assertEqual<stringMap, Map<string, string>>(true)
})

it('valid parse', () => {
  const result = stringMap.safeParse(
    new Map([
      ['first', 'foo'],
      ['second', 'bar'],
    ]),
  )
  expect(v.isResult(result)).toEqual(true)
  if (v.isResult(result)) {
    const data = result[1]
    expect(data.has('first')).toEqual(true)
    expect(data.has('second')).toEqual(true)
    expect(data.get('first')).toEqual('foo')
    expect(data.get('second')).toEqual('bar')
  }
})

it('valid parse async', async () => {
  const result = await stringMap.safeParseAsync(
    new Map([
      ['first', 'foo'],
      ['second', 'bar'],
    ]),
  )
  expect(v.isResult(result)).toEqual(true)
  if (v.isResult(result)) {
    const data = result[1]
    expect(data.has('first')).toEqual(true)
    expect(data.has('second')).toEqual(true)
    expect(data.get('first')).toEqual('foo')
    expect(data.get('second')).toEqual('bar')
  }
})

it('throws when a Set is given', () => {
  const result = stringMap.safeParse(new Set([]))
  expect(v.isResult(result)).toEqual(false)
  if (v.isError(result)) {
    expect(result[0].errors.length).toEqual(1)
    expect(result[0].errors[0]).toEqual('{} is not an instance of a Map')
  }
})

it('throws when the given map has invalid key and invalid input', () => {
  const result = v
    .map([v.string, v.string], { breakOnFirstError: false })
    .safeParse(new Map([[42, Symbol('description')]]))
  expect(v.isResult(result)).toEqual(false)
  if (v.isError(result)) {
    expect(result[0].errors.length).toEqual(2)
    expect(result[0].errors[0]).toEqual('42 is not a string')
    expect(result[0].errors[1]).toEqual('Symbol(description) is not a string')
  }
})

it('throws when the given map has multiple invalid entries', () => {
  // const result = stringMap.safeParse(new Map([[42, Symbol()]]));

  const result = v.map([v.string, v.string], { breakOnFirstError: false }).safeParse(
    new Map([
      [1, 'foo'],
      ['bar', 2],
    ] as [any, any][]) as Map<any, any>,
  )

  // const result = stringMap.safeParse(new Map([[42, Symbol()]]));
  expect(v.isResult(result)).toEqual(false)
  if (v.isError(result)) {
    expect(result[0].errors.length).toEqual(2)
    expect(result[0].errors[0]).toEqual('1 is not a string')
    expect(result[0].errors[1]).toEqual('2 is not a string')
  }
})

it('dirty', async () => {
  const map = v.map(
    [
      v.string.customValidation((val) =>
        val === val.toUpperCase() ? undefined : 'Keys must be uppercase',
      ),
      v.string,
    ],
    { breakOnFirstError: false },
  )
  const result = await map.safeParseAsync(
    new Map([
      ['first', 'foo'],
      ['second', 'bar'],
    ]),
  )
  expect(v.isResult(result)).toEqual(false)
  if (v.isError(result)) {
    expect(result[0].errors.length).toEqual(2)
    expect(result[0].errors[0]).toEqual('Keys must be uppercase')
    expect(result[0].errors[1]).toEqual('Keys must be uppercase')
  }
})
