/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, expect } from 'vitest'
import {
  capitaliseWords,
  capitalise,
  callbackTee,
  times,
  runFunctionsOnlyOnce,
  forN,
  mapN,
  rangeOfNumbers,
} from '../src/smallUtils'
import { curry, placeholder } from '../src'

type StrictEqual<A1, A2> = [A1] extends [A2] ? ([A2] extends [A1] ? true : false) : false

// const checkType = <T>(arg: T) => arg
const typesMatch = <A, B>(match: StrictEqual<A, B>) => match

it('basic usage - times', () => {
  console.log(times(50, (previousResult) => previousResult + 1, 10)) // 60
})
it('forN Example', () => {
  const arr = [1, 2, 3, 1, 2, 3]
  forN(arr, (items) => console.log(items), 3) // [1,2,3]\n[1,2,3]
})
it('forN', () => {
  const arr = [1, 2, 3, 1, 2, 3]
  forN(
    arr,
    (items, startIndex, chunkCount) => {
      typesMatch<typeof items, [number, number, number]>(true)
      expect(`${items}`).toEqual('1,2,3')
      expect([0, 3].includes(startIndex)).toBe(true)
      expect([0, 1].includes(chunkCount)).toBe(true)
    },
    3,
  )
  expect(() => {
    forN([1], (items) => items, 3)
  }).toThrow()
  forN([1], (items) => expect(`${items}`).toEqual('1'), 3, false)
})
it('mapN', () => {
  const arr = [1, 2, 3, 1, 2, 3]
  const result = mapN(
    arr,
    (items, startIndex, chunkCount) => {
      typesMatch<typeof items, [number, number, number]>(true)
      expect(`${items}`).toEqual('1,2,3')
      expect([0, 3].includes(startIndex)).toBe(true)
      expect([0, 1].includes(chunkCount)).toBe(true)
      return `${items}`
    },
    3,
  )
  expect(`${result}`).toEqual('1,2,3,1,2,3')
  expect(() => {
    mapN([1], (items) => items, 3)
  }).toThrow()
  mapN([1], (items) => expect(`${items}`).toEqual('1'), 3, false)
})
it('rangeOfNumbers', () => {
  expect(`${rangeOfNumbers(2, 5)}`).toEqual('2,3,4,5')
})
it('basic usage - runFunctionsOnlyOnce', () => {
  let x = 1
  const once = runFunctionsOnlyOnce()
  const fn1 = once(() => {
    x += 1
    console.log(x)
  }, 'fn1')
  const fn2 = once(() => {
    x -= 1
    console.log(x)
  }, 'fn2')
  fn1()
  expect(fn2).toThrowError() // throws cannot call 'fn2' after calling 'fn1'
  const fn3 = runFunctionsOnlyOnce(false)(() => 'A')
  console.log(fn3()) // 'A'
  console.log(fn3()) // false
})
// it('basic usage - requireValue', () => {
//   const fn = requireValue((x: any) => x)
//   console.log(fn('a'))
//   expect(fn).toThrowError() // throws this function requires a value
// })
it('basic usage - capitalise', () => {
  console.log(capitalise('cat')) // 'Cat'
  console.log(capitaliseWords('cat dog')) // 'Cat Dog'
})
it('callbackResolverQueue basic', () => {
  let aCounter = 0
  const cbQueue = callbackTee<[string]>()
  cbQueue.addCallback((result) => {
    aCounter += 1
    expect(aCounter).toEqual(1)
    expect(result).toEqual('A')
  })
  cbQueue.addCallback((result) => {
    aCounter += 1
    expect(aCounter).toEqual(2)
    expect(result).toEqual('A')
  })
  cbQueue.callCallbacks('A') // `1:A` and `2:A`
  let bCounter = 0
  const cbQueue2 = callbackTee<[string]>({
    callInReverseOrder: true,
  })
  cbQueue2.addCallback((result) => {
    bCounter += 1
    expect([2, 4].includes(bCounter)).toBeTruthy()
    expect(result).toEqual('B')
  })
  cbQueue2.addCallback((result) => {
    bCounter += 1
    expect([1, 3].includes(bCounter)).toBeTruthy()
    expect(result).toEqual('B')
  })
  cbQueue2.callCallbacks('B')
  expect(aCounter).toEqual(2)
  expect(bCounter).toEqual(2)
  cbQueue2.callCallbacks('B')
  expect(bCounter).toEqual(4)
})
it('callbackResolverQueue once only', () => {
  // debugger
  let aCounter = 0
  const cbQueue = callbackTee<[string]>({
    canCallOnlyOnce: true,
  })
  cbQueue.addCallback((result) => {
    aCounter += 1
    expect(aCounter).toEqual(1)
    expect(result).toEqual('A')
  })
  cbQueue.addCallback((result) => {
    aCounter += 1
    expect(aCounter).toEqual(2)
    expect(result).toEqual('A')
  })
  cbQueue.callCallbacks('A') // `1:A` and `2:A`
  expect(() => cbQueue.callCallbacks('B')).toThrowError(
    `cannot call 'callCallbacks' more than once`,
  )
})
it('callbackResolverQueue can add callbacks after resolved', () => {
  // debugger
  let aCounter = 0
  const cbQueue = callbackTee<[string]>({
    resolvePerpetually: true,
    canCallOnlyOnce: true,
  })
  cbQueue.addCallback((result) => {
    aCounter += 1
    expect(aCounter).toEqual(1)
    expect(result).toEqual('A')
  })
  cbQueue.callCallbacks('A')
  cbQueue.addCallback((result) => {
    // debugger
    aCounter += 1
    expect(aCounter).toEqual(2)
    expect(result).toEqual('A')
  })
})
// it('requireValue', () => {
//   const fn = requireValue((a: any) => a)

//   // debugger
//   expect(fn('a')).toEqual('a')
//   expect(fn(true)).toEqual(true)
//   expect(fn(false)).toEqual(false)
//   expect(fn(0)).toEqual(0)
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-ignore
//   expect(() => fn()).toThrowError('this function requires a value')
//   expect(() => fn(null)).toThrowError('this function requires a value')
//   expect(() => fn(undefined)).toThrowError('this function requires a value')
//   expect(() => fn([])).toThrowError('this function requires a value')
//   const fn2 = requireValue((a: any) => a, 'error')
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-ignore
//   expect(() => fn2()).toThrowError('error')
// })
it('capitalise', () => {
  expect(capitaliseWords('string string')).toEqual(`String String`)
  expect(capitalise('string')).to.equal(`String`)
})

it('curry', () => {
  const curryFn = (a: 'a', b: 'b', c: 'c') => [a, b, c] as const // type (a: string, b: 'b', c: string) => readonly [string, "b", string]
  const curried = curry(curryFn) // type (input: string) => readonly [string, "b", string]
  const x1 = curried('a')
  const x2 = x1('b')
  const x3 = x2('c')
  expect(`${x3}`).toEqual('a,b,c')
  const y2 = x1(placeholder)
  const y3 = y2('c')
  const y4 = y3('b')
  expect(`${y4}`).toEqual('a,b,c')
})
it('curry - zero length', () => {
  const curryFn = () => 'a' as const
  expect(() => curry(curryFn)).toThrow()
})
it('curry - monadic', () => {
  const curryFn = (a: 'a') => a
  const curried = curry(curryFn)
  const x1 = curried('a')
  expect(x1).toEqual('a')
  const x2 = curried(placeholder)
  const x3 = x2('a')
  expect(x3).toEqual('a')
})

it('curry - polyadic', () => {
  const curryFn = (a: 'a' | 0, b: 'b' | 1, c: 'c' | 2, d: 'd' | 3, e: 'e' | 4, f: 'f' | 5) =>
    [a, b, c, d, e, f] as const // type (a: string, b: 'b', c: string) => readonly [string, "b", string]

  const curried = curry(curryFn)
  const x1 = curried('a', 'b', 'c', 'd', 'e', 'f')
  expect(`${x1}`).toEqual('a,b,c,d,e,f')
  const x2 = curried(placeholder, 'b', placeholder)
  const x3 = x2('d', 'e', placeholder)
  const x4 = x3('a', 'c', 'f')
  expect(`${x4}`).toEqual('a,b,c,d,e,f')
  const x5 = x3(0, 2, 5)
  expect(`${x5}`).toEqual('0,b,2,d,e,5')
  const a1 = curried('a', 'b', 'c', 'd', 'e', placeholder)
  expect(`${a1('f')}`).toEqual('a,b,c,d,e,f')
  expect(`${a1(5)}`).toEqual('a,b,c,d,e,5')
  const b1 = curried(placeholder, 'b', 'c', 'd', 'e', placeholder)
  expect(`${b1('a', 'f')}`).toEqual('a,b,c,d,e,f')
  expect(`${b1(0, 5)}`).toEqual('0,b,c,d,e,5')
})

it('curry - too many args', () => {
  const curried1 = curry(
    (a: 'a' | 0, b: 'b' | 1, c: 'c' | 2, d: 'd' | 3, e: 'e' | 4, f: 'f' | 5) =>
      [a, b, c, d, e, f] as const,
  )
  // @ts-expect-error invalid params
  const x1 = curried1('a', 'b', 'c', 'd', 'e', 'f', 'g')
  expect(`${x1}`).toEqual('a,b,c,d,e,f')

  const curried2 = curry((a: 'a', b: 'b') => [a, b] as const)
  // @ts-expect-error invalid params
  const x2 = curried2('a', 'b', 'c')
  expect(`${x2}`).toEqual('a,b')

  const curried3 = curry((a: 'a') => a)
  // @ts-expect-error invalid params
  const x3 = curried3('a', 'b')
  expect(x3).toEqual('a')
})
