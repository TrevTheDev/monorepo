/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, expect } from 'vitest'
import { isResult } from 'toolbelt'
import { vStringInstance } from '../../src/types/string'
import { vSet } from '../../src/types/set'
import { VInfer } from '../../src/types/base'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const stringSet = vSet(vStringInstance)
type stringSet = VInfer<typeof stringSet>

const minTwo = vSet(vStringInstance).min(2)
const maxTwo = vSet(vStringInstance).max(2)
const justTwo = vSet(vStringInstance).size(2)
const nonEmpty = vSet(vStringInstance).nonempty()
const nonEmptyMax = vSet(vStringInstance).nonempty().max(2)

it('type inference', () => {
  assertEqual<stringSet, Set<string>>(true)
})

it('valid parse', () => {
  const result = stringSet.safeParse(new Set(['first', 'second']))
  expect(isResult(result)).toEqual(true)
  if (isResult(result)) {
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

// it('valid parse async', async () => {
//   const result = await stringSet.spa(new Set(['first', 'second']))
//   expect(isResult(result)).toEqual(true)
//   if (isResult(result)) {
//     expect(result[1].has('first')).toEqual(true)
//     expect(result[1].has('second')).toEqual(true)
//     expect(result[1].has('third')).toEqual(false)
//   }

//   const asyncResult = await stringSet.safeParse(new Set(['first', 'second']))
//   expect(asyncisResult(result)).toEqual(true)
//   if (asyncisResult(result)) {
//     expect(asyncresult[1].has('first')).toEqual(true)
//     expect(asyncresult[1].has('second')).toEqual(true)
//     expect(asyncresult[1].has('third')).toEqual(false)
//   }
// })

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
  expect(isResult(result)).toEqual(false)

  if (!isResult(result)) expect(result[0].errors.length).toEqual(1)
})

it('failing when set is smaller than min() ', () => {
  const result = minTwo.safeParse(new Set(['just_one']))
  expect(isResult(result)).toEqual(false)

  if (!isResult(result)) expect(result[0].errors.length).toEqual(1)
})

it('failing when set is bigger than max() ', () => {
  const result = maxTwo.safeParse(new Set(['one', 'two', 'three']))
  expect(isResult(result)).toEqual(false)

  if (!isResult(result)) expect(result[0].errors.length).toEqual(1)
})

it('doesn’t throw when an empty set is given', () => {
  const result = stringSet.safeParse(new Set([]))
  expect(isResult(result)).toEqual(true)
})

it('throws when a Map is given', () => {
  const result = stringSet.safeParse(new Map([]))
  expect(isResult(result)).toEqual(false)
  if (!isResult(result)) expect(result[0].errors.length).toEqual(1)
})

it('throws when the given set has invalid input', () => {
  // eslint-disable-next-line symbol-description
  const result = stringSet.safeParse(new Set([Symbol()]))
  expect(isResult(result)).toEqual(false)
  if (!isResult(result)) expect(result[0].errors.length).toEqual(1)
})

it('throws when the given set has multiple invalid entries', () => {
  const result = stringSet.safeParse(new Set([1, 2] as any[]) as Set<any>)

  expect(isResult(result)).toEqual(false)
  if (!isResult(result)) expect(result[0].errors.length).toEqual(1)
})
