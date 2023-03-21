import { describe, it, expect } from 'vitest'
// import { compositorI } from '../src/compositor'
import { compositor } from '../src/index'

const chainNode =
  <I, O>(expectedInput: I, Output: O) =>
  (input: I) => {
    expect(input).toEqual(expectedInput)
    return Output
  }

describe('compositor', () => {
  it.only('example', () => {
    // chains functions together
    const fn = compositor(
      (input: 'a') => `${input}:b` as 'a:b',
      (input: 'a:b') => `${input}:c` as 'a:b:c',
    )
    const fnFn = fn.call // makes a snapshot of chained functions
    console.log(fnFn('a')) // 'a:b:c'

    // chains are expandable
    const fn2 = fn(
      (input: 'a:b:c') => `${input}:d` as 'a:b:c:d',
      (input: 'a:b:c:d') => `${input}:e` as 'a:b:c:d:e',
    )
    console.log(fn2.call('a')) // 'a:b:c:d:e'
    console.log(fnFn('a')) // 'a:b:c'

    // an empty compositor returns whatever it is called with:
    console.log(compositor().call('hello')) // hello

    // effects are functions that can be added to the composition, but
    // whose return values are ignored
    fn2.addEffects(
      () => console.log('hello'),
      () => console.log('world'),
    )
    // logs 'hello' 'world' and returns 'a:b:c:d:e'
    console.log(fn2.call('a'))

    // insertPlaceholder creates a placeholder for a function
    // which can later be provided
    // useful if the function changes between calls.
    const setFn = fn2.insertPlaceholder(undefined as unknown as (arg: 'a:b:c:d:e') => 'a:b:c:d:e:f')
    // logs 'hello' 'world' and returns 'a:b:c:d:e:f'
    console.log(setFn((input: 'a:b:c:d:e') => `${input}:f` as 'a:b:c:d:e:f')('a'))
  })
  it('basic usage', () => {
    const y1 = compositor(
      chainNode('start' as const, 'Ra' as const),
      chainNode('Ra' as const, 'Rb' as const),
      chainNode('Rb' as const, 'Rc' as const),
    )
    const fn1 = y1.call
    const fn1Res = y1.call('start' as const)
    expect(fn1Res).toEqual('Rc')
    expect(fn1('start' as const)).toEqual('Rc')
    const y2 = y1(
      chainNode('Rc' as const, 'Rd' as const),
      chainNode('Rd' as const, 'done' as const),
    )
    const y2Res = y2.call('start' as const)
    expect(y2Res).toEqual('done')
    const fn2 = y2.call
    const fn2Res = fn2('start' as const)
    expect(fn2Res).toEqual('done')
    expect(fn1('start' as const)).toEqual('Rc')
    const noFnsCompositor = compositor()
    const z = noFnsCompositor.call('hello' as const)
    expect(z).toEqual('hello')
  })
  it('insertPlaceholder', () => {
    const y1 = compositor(chainNode('start' as const, 'Ra' as const))
    const setPlaceholder = y1.insertPlaceholder(undefined as unknown as (x: 'Ra') => string)
    const fn = y1.call
    const y3 = setPlaceholder((_x) => 'b')
    expect(y3('start')).toEqual('b')
    expect(fn('start')).toEqual('b')
    setPlaceholder((_x) => 'c')
    expect(fn('start')).toEqual('c')
  })
  // it('callInverse', () => {
  //   const y1 = compositorI(
  //     chainNode('Rb' as const, 'Rc' as const),
  //     chainNode('Ra' as const, 'Rb' as const),
  //     chainNode('start' as const, 'Ra' as const),
  //   )
  //   const fn1 = y1.callInverse
  //   const fn1Res = y1.call('start' as const)
  //   expect(fn1Res).toEqual('Rc')
  //   expect(fn1('start' as const)).toEqual('Rc')
  //   const y2 = y1(
  //     chainNode('Rc' as const, 'Rd' as const),
  //     chainNode('Rd' as const, 'done' as const),
  //   )
  //   const y2Res = y2.call('start' as const)
  //   expect(y2Res).toEqual('done')
  //   const fn2 = y2.call
  //   const fn2Res = fn2('start' as const)
  //   expect(fn2Res).toEqual('done')
  //   expect(fn1('start' as const)).toEqual('Rc')
  //   const noFnsCompositor = compositor()
  //   const z = noFnsCompositor.call('hello' as const)
  //   expect(z).toEqual('hello')
  // })
})
