import { describe, it, expect } from 'vitest'
import { ResultError, compose, composeWithError, pipe } from '../src/index'

const chainNode =
  <I, O>(expectedInput: I, Output: O) =>
  (input: I) => {
    expect(input).toEqual(expectedInput)
    return Output
  }

describe('compose', () => {
  it('example usage', () => {
    const fn = compose(
      (a: string) => `${a}:A`,
      (a: string) => `${a}:B`,
    )
    console.log(fn('start'))
  })
  it('basic usage', () => {
    const y1 = compose(
      chainNode('start' as const, 'Ra' as const),
      chainNode('Ra' as const, 'Rb' as const),
      chainNode('Rb' as const, 'Rc' as const),
      chainNode('Rc' as const, 'Rd' as const),
      chainNode('Rd' as const, 'done' as const),
    )
    expect(y1('start' as const)).toEqual('done')

    const y2 = compose(chainNode('start' as const, 'done' as const))
    expect(y2('start' as const)).toEqual('done')

    const x = chainNode('b' as const, 'done2' as const)
    const y3 = compose(y1, chainNode<'done', 'a'>('done', 'a'), chainNode<'a', 'b'>('a', 'b'), x)
    expect(y3('start' as const)).toEqual('done2')
  })
  it('chains', () => {
    const y1 = compose(
      chainNode('start' as const, 'Ra' as const),
      chainNode('Ra' as const, 'Rb' as const),
      chainNode('Rb' as const, 'Rc' as const),
    )
    const y2 = compose(
      chainNode('Rc' as const, 'Rd' as const),
      chainNode('Rd' as const, 'done' as const),
    )
    const y3 = compose(y1, y2)
    expect(y3('start' as const)).toEqual('done')
  })

  it('composeWithError example usage', () => {
    const fn = composeWithError(
      (a: 'start'): ResultError<'eA', 'A'> => [undefined, `A:${a}` as 'A'],
      (a: 'A'): ResultError<'eB', 'B'> => [undefined, `B:${a}` as 'B'],
    )
    const [error, result] = fn('start' as const)
    expect(result).toEqual('B:A:start')
    expect(error).toEqual(undefined)
    debugger
  })

  it.only('composeWithError', () => {
    const y1 = composeWithError(
      (a: 'start'): ResultError<'eA', 'A'> => [undefined, `A:${a}` as 'A'],
      (a: 'A'): ResultError<'eB', 'B'> => [undefined, `B:${a}` as 'B'],
      // (a) => ['error1', undefined],
      (a: 'B'): ResultError<'eC', 'C'> => [undefined, `C:${a}` as 'C'],
      (a: 'C'): ResultError<'eD', 'D'> => [undefined, `D:${a}` as 'D'],
      // (a) => ['error2', undefined],
    )
    debugger
    const [error, result] = y1('start' as const)
    expect(result).toEqual('D:C:B:A:start')
    expect(error).toEqual(undefined)
    debugger
  })

  it('pipe', () => {
    const y1 = pipe(
      'start' as const,
      chainNode('start' as const, 'Ra' as const),
      chainNode('Ra' as const, 'Rb' as const),
      chainNode('Rb' as const, 'Rc' as const),
      chainNode('Rc' as const, 'Rd' as const),
      chainNode('Rd' as const, 'done' as const),
    )

    expect(y1).toEqual('done')
  })
})
