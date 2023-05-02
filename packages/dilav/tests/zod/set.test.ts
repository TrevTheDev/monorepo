/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, expect } from 'vitest'
import { v } from '../../src'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const stringSet = v.set(v.string, {
  breakOnFirstError: false,
})
type stringSet = v.Infer<typeof stringSet>

const minTwo = v.set(v.string).min(2)
const maxTwo = v.set(v.string).max(2)
const justTwo = v.set(v.string).size(2)
const nonEmpty = v.set(v.string).nonempty()
const nonEmptyMax = v.set(v.string).nonempty().max(2)

it('type inference', () => {
  assertEqual<stringSet, Set<string>>(true)
})

it('valid parse', () => {
  const result = stringSet.safeParse(new Set(['first', 'second']))
  expect(v.isResult(result)).toEqual(true)
  if (v.isResult(result)) {
    expect(result[1].has('first')).toEqual(true)
    expect(result[1].has('second')).toEqual(true)
    expect(result[1].has('third')).toEqual(false)
  }

  expect(() => {
    minTwo.parse(new Set(['a', 'b']))
    minTwo.parse(new Set(['a', 'b', 'c']))
    maxTwo.parse(new Set(['a', 'b']))
    maxTwo.parse(new Set(['a']))
    justTwo.parse(new Set(['a', 'b']))
    nonEmpty.parse(new Set(['a']))
    nonEmptyMax.parse(new Set(['a']))
  }).not.toThrow()
})

it('valid parse async', async () => {
  const result = await stringSet.safeParseAsync(new Set(['first', 'second']))
  expect(v.isResult(result)).toEqual(true)
  if (v.isResult(result)) {
    expect(result[1].has('first')).toEqual(true)
    expect(result[1].has('second')).toEqual(true)
    expect(result[1].has('third')).toEqual(false)
  }

  const asyncResult = await stringSet.safeParse(new Set(['first', 'second']))
  expect(v.isResult(asyncResult)).toEqual(true)
  if (v.isResult(asyncResult)) {
    expect(asyncResult[1].has('first')).toEqual(true)
    expect(asyncResult[1].has('second')).toEqual(true)
    expect(asyncResult[1].has('third')).toEqual(false)
  }
})

it('valid parse: size-related methods', () => {
  expect(() => {
    minTwo.parse(new Set(['a', 'b']))
    minTwo.parse(new Set(['a', 'b', 'c']))
    maxTwo.parse(new Set(['a', 'b']))
    maxTwo.parse(new Set(['a']))
    justTwo.parse(new Set(['a', 'b']))
    nonEmpty.parse(new Set(['a']))
    nonEmptyMax.parse(new Set(['a']))
  }).not.toThrow()

  const sizeZeroResult = stringSet.parse(new Set())
  expect(sizeZeroResult.size).toBe(0)

  const sizeTwoResult = minTwo.parse(new Set(['a', 'b']))
  expect(sizeTwoResult.size).toBe(2)
})

it('failing when parsing empty set in nonempty ', () => {
  const result = nonEmpty.safeParse(new Set())
  expect(v.isResult(result)).toEqual(false)

  if (v.isError(result)) {
    expect(result[0].errors.length).toEqual(1)
    expect(result[0].errors[0]).toEqual('{} must contain at least one element')
  }
})

it('failing when set is smaller than min() ', () => {
  const result = minTwo.safeParse(new Set(['just_one']))
  expect(v.isResult(result)).toEqual(false)

  if (v.isError(result)) {
    expect(result[0].errors.length).toEqual(1)
    expect(result[0].errors[0]).toEqual('1 is less elements than the minimum of 2')
  }
})

it('failing when set is bigger than max() ', () => {
  const result = maxTwo.safeParse(new Set(['one', 'two', 'three']))
  expect(v.isResult(result)).toEqual(false)

  if (v.isError(result)) {
    expect(result[0].errors.length).toEqual(1)
    expect(result[0].errors[0]).toEqual('3 is more elements than the maximum of 2')
  }
})

it('doesn’t throw when an empty set is given', () => {
  const result = stringSet.safeParse(new Set([]))
  expect(v.isResult(result)).toEqual(true)
})

it('throws when a Map is given', () => {
  const result = stringSet.safeParse(new Map([]))
  expect(v.isResult(result)).toEqual(false)
  if (v.isError(result)) {
    expect(result[0].errors.length).toEqual(1)
    expect(result[0].errors[0]).toEqual('{} is not an instance of a Set')
  }
})

it('throws when the given set has invalid input', () => {
  const result = stringSet.safeParse(new Set([Symbol('x')]))
  expect(v.isResult(result)).toEqual(false)
  if (v.isError(result)) {
    expect(result[0].errors.length).toEqual(1)
    expect(result[0].errors[0]).toEqual('Symbol(x) is not a string')
  }
})

it('throws when the given set has multiple invalid entries', () => {
  const result = stringSet.safeParse(new Set([1, 2] as any[]) as Set<any>)

  expect(v.isResult(result)).toEqual(false)
  if (v.isError(result)) {
    expect(result[0].errors.length).toEqual(2)
    expect(result[0].errors[0]).toEqual('1 is not a string')
    expect(result[0].errors[1]).toEqual('2 is not a string')
  }
})
