/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, expect } from 'vitest'
import {
  both,
  createUid,
  monadicArrayFnToPolyadicFn,
  monadicObjectFnToPolyadicFn,
  polyadicFnToMonadicArrayFn,
  polyadicFnToMonadicObjectFn,
  rangeOfNumbers,
  runFunctionsOnlyOnce,
  times,
} from '../src'

type StrictEqual<A1, A2> = [A1] extends [A2] ? ([A2] extends [A1] ? true : false) : false

// const checkType = <T>(arg: T) => arg
const typesMatch = <A, B>(match: StrictEqual<A, B>) => match

it('monadicArrayFnToPolyadicFn & polyadicFnToMonadicArrayFn', () => {
  const monadicArrayFn = (arr: [a: 'a', b: 'b']) => arr // type (arr: [a: 'a', b: 'b']) => [a: "a", b: "b"]
  typesMatch<typeof monadicArrayFn, (arr: [a: 'a', b: 'b']) => [a: 'a', b: 'b']>(true)
  const polyadicFn = monadicArrayFnToPolyadicFn(monadicArrayFn) // type (a: "a", b: "b") => [a: "a", b: "b"]
  typesMatch<typeof polyadicFn, (a: 'a', b: 'b') => [a: 'a', b: 'b']>(true)
  expect(`${polyadicFn('a', 'b')}`).toEqual('a,b')
  const monadicArrayFnFromPolyadicFn = polyadicFnToMonadicArrayFn(polyadicFn)
  expect(`${monadicArrayFnFromPolyadicFn(['a', 'b'])}`).toEqual('a,b')
  typesMatch<typeof monadicArrayFnFromPolyadicFn, (arr: [a: 'a', b: 'b']) => [a: 'a', b: 'b']>(true)
})

it('monadicObjectFnToPolyadicFn & polyadicFnToMonadicObjectFn', () => {
  const monadicObjectFn = (inputObject: { a: 'a'; b: 'b' }) => inputObject // type (arr: [a: 'a', b: 'b']) => [a: "a", b: "b"]
  typesMatch<typeof monadicObjectFn, (inputObject: { a: 'a'; b: 'b' }) => { a: 'a'; b: 'b' }>(true)
  const polyadicFn = monadicObjectFnToPolyadicFn(monadicObjectFn, ['a', 'b']) // type (a: "a", b: "b") => [a: "a", b: "b"]
  typesMatch<typeof polyadicFn, (a: 'a', b: 'b') => { a: 'a'; b: 'b' }>(true)
  expect(polyadicFn('a', 'b')).toMatchObject({ a: 'a', b: 'b' })
  const monadicObjectFnFromPolyadicFn = polyadicFnToMonadicObjectFn(polyadicFn, ['a', 'b'])
  expect(monadicObjectFnFromPolyadicFn({ a: 'a', b: 'b' })).toMatchObject({ a: 'a', b: 'b' })
  typesMatch<
    typeof monadicObjectFnFromPolyadicFn,
    (inputObject: { a: 'a'; b: 'b' }) => { a: 'a'; b: 'b' }
  >(true)
})

it('both example', () => {
  const bothFn = both((arg1: string, arg2: number) => [arg1, arg2] as const)
  const result = bothFn('a', 1, 'b', 2, 'c', 3)
  expect(`${result}`).toEqual('a,1,b,2,c,3')
})

it('both', () => {
  const b = both((arg1: string, arg2: number) => [arg1, arg2] as [string, number])
  const result = b('a', 1, 'b', 2, 'c', 3)
  expect(`${result}`).toEqual('a,1,b,2,c,3')
  // @ts-expect-error invalid params
  expect(() => b('a', 1)).toThrow()
  expect(() => b('a', 1, 'b', 2, 'c')).toThrow()
  // const x = b('a', 1, 'b', 2, 'c')
  // const rev = (arr: unknown[]) => arr.reverse()
  // const x1 = both(rev)
  // const res = x1([1, 2, 3], [4, 5, 6])
  // debugger
})

it('createUid', () => {
  expect(createUid().length).toEqual(20)
})

it('times', () => {
  let result: number = 0
  times(10, (i) => {
    result = i
  })
  expect(result).toEqual(9)
  result = 0
  expect(
    times(
      10,
      (previousResult, i) => {
        result = i
        return previousResult + 1
      },
      0,
    ),
  ).toEqual(10)
  expect(result).toEqual(9)
})

it('rangeOfNumbers', () => {
  expect(`${rangeOfNumbers(3, 5)}`).toEqual('3,4,5')
})

it('runFunctionsOnlyOnce', () => {
  let called = 0
  const once = runFunctionsOnlyOnce()
  const fnA = once((x1) => {
    called += 1
    expect(x1).toEqual(1)
    expect(called).toEqual(1)
    return called
  })
  const fnB = once(() => expect(true).toEqual(false))
  expect(fnA(1)).toEqual(1)
  expect(() => fnA(1)).toThrow()
  expect(() => fnB()).toThrow()
  expect(called).toEqual(1)
})

it('runFunctionsOnlyOnce - custom error return value', () => {
  let called = 0
  const once = runFunctionsOnlyOnce('ERROR')
  const fnA = once((x1) => {
    called += 1
    expect(x1).toEqual(1)
    expect(called).toEqual(1)
    return called
  })
  const fnB = once(() => expect(true).toEqual(false))
  expect(fnA(1)).toEqual(1)
  expect(fnA(1)).toEqual('ERROR')
  expect(fnB()).toEqual('ERROR')
  expect(called).toEqual(1)
})

it('runFunctionsOnlyOnce - custom error handler', () => {
  let called = 0
  const once = runFunctionsOnlyOnce(
    (calledFn: string, firstCalledFn: string, args: unknown[]) =>
      `${calledFn}${firstCalledFn}${args}`,
  )
  const fnA = once((x1) => {
    called += 1
    expect(x1).toEqual(1)
    expect(called).toEqual(1)
    return called
  }, 'fnA')
  const fnB = once((_arg) => expect(true).toEqual(false), 'fnB')
  expect(fnA(1)).toEqual(1)
  expect(fnA(1)).toEqual('fnAfnA1')
  expect(fnB(2)).toEqual('fnBfnA2')
  expect(called).toEqual(1)
})
