/* eslint-disable @typescript-eslint/no-explicit-any */
import compose, { CalculatedCompositeFn, Fn, FunctionChainArray } from './compose'
import { ReverseTuple } from './typescript utils'

type Compositor<
  T extends Fn[],
  Last extends Fn = T extends [...any, infer L extends Fn] ? L : never,
> = T extends [Fn, ...Fn[]]
  ? {
      <R extends [Fn<ReturnType<Last>, any>, ...Fn[]]>(
        ...fns: R & FunctionChainArray<R>
      ): Compositor<[...T, ...R]>
      /**
       * creates and returns the composed function
       */
      call: CalculatedCompositeFn<T>
      /**
       * creates and returns the composed function, in inverse order of being added
       */
      callInverse: CalculatedCompositeFn<ReverseTuple<T>>
      /**
       * utility to add functions that take no input, and return no output
       * but to run them in sequence in the chain - useful for example to fire events,
       * or notifiers.
       */
      addEffects(...effects: [() => void, ...(() => void)[]]): Compositor<T, Last>
      /**
       * named functions are sequenced in the chain, but the actual function can be
       * supplied later using `setNamedFunction`
       * @param { string } name  - name of the function
       * @param { (arg:any): any } _fn  - this param is ignored, and is only included to support typing inference
       * @returns { Compositor }
       */
      insertPlaceholder<S extends [Last] extends [never] ? Fn : Fn<ReturnType<Last>>>(
        _fn: S,
      ): (fn: S) => CalculatedCompositeFn<T>
    }
  : {
      <R extends [Fn, ...Fn[]]>(...fns: R & FunctionChainArray<R>): Compositor<[...R]>
      /**
       * calls
       * @param input
       */
      call<I, O = I>(input: I): O
      callInverse<R>(input: R): R
      addEffects(...effects: [() => void, ...(() => void)[]]): Compositor<T, Last>
      insertPlaceholder(): (fn: Fn) => <I, O = I>(input: I) => O
    }

/**
 * provides an interface to compose functions.
 * 
 * ```
 *  // chains functions together
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
 * ```
 *
 *
 * @param { ((input: any) => any)[] } functions  - array of functions to be chained together
 * @returns { Compositor }
 */
// function compositor<T extends [Fn, ...Fn[]], ReverseT extends [Fn, ...Fn[]] = ReverseTuple<T>>(
//   ...functions: T & ReverseTuple<FunctionChainArray<ReverseT>>
// ): Compositor<T>
// function compositor(): Compositor<[]>
function compositor<T extends Fn[]>(
  ...functions: T & T extends [Fn, ...Fn[]] ? FunctionChainArray<T> : T
): Compositor<T> {
  const fnArray: Fn[] = functions || []
  let composedFn
  function compositorFn(...funcs) {
    fnArray.push(...funcs)
    composedFn = undefined
    return compositorFn
  }
  Object.defineProperties(compositorFn, {
    call: {
      get() {
        if (fnArray.length === 0) return (input) => input
        if (!composedFn) composedFn = compose(...(fnArray as [Fn, ...Fn[]]))

        return composedFn
      },
    },
    insertPlaceholder: {
      value: (_fn: Fn) => {
        let fn: Fn
        compositorFn((arg) => {
          if (fn) return fn(arg)
          throw new Error(`placeholder function not supplied`)
        })
        return (func: Fn) => {
          fn = func
          return compositorFn.call
        }
      },
    },
    callInverse: {
      get() {
        if (fnArray.length === 0) return (input) => input
        if (!composedFn) composedFn = compose(...([...fnArray].reverse() as [Fn, ...Fn[]]))

        return composedFn
      },
    },
    addEffects: {
      value(...effects) {
        effects.forEach((effect) =>
          compositorFn((arg) => {
            effect()
            return arg
          }),
        )
        return compositorFn
      },
    },
  })
  return compositorFn as unknown as Compositor<T>
}

export default compositor
