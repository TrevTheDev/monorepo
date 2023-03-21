/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { enhancedMap } from '.'
import type { EnhancedMap } from '.'
import { LMerge, RecursiveUnion } from './typescript utils'

type CouplerOptions = {
  outgoingCallbackName: string
  incomingCallbackName: string
  indexed: boolean
}

const defaultOptions = {
  outgoingCallbackName: 'addOutgoingCallback',
  incomingCallbackName: 'addIncomingCallback',
  indexed: false,
} as const

type DefaultOptions = typeof defaultOptions extends infer O
  ? { -readonly [K in keyof O]: O[K] }
  : never

type PartialOptions = Partial<CouplerOptions>

type FinalOption<
  Options extends PartialOptions,
  T = LMerge<DefaultOptions, Options>,
  RT extends CouplerOptions = T extends CouplerOptions ? T : never,
> = RT

type AnyCallback = (...args: any[]) => any
type IncomingCallback<T extends AnyCallback> = T
type OutgoingCallback<T extends AnyCallback> = (incomingCallback: IncomingCallback<T>) => void

export type AsyncCoupler<
  Options extends CouplerOptions,
  IncomingCallbackT extends AnyCallback,
> = RecursiveUnion<
  [
    {
      [key in Options['outgoingCallbackName']]: Options['indexed'] extends true
        ? (
            outgoingCallback: (incomingCallback: IncomingCallback<IncomingCallbackT>) => void,
            index?: number,
          ) => void
        : (
            outgoingCallback: (incomingCallback: IncomingCallback<IncomingCallbackT>) => void,
          ) => void
    },
    {
      [key in Options['incomingCallbackName']]: Options['indexed'] extends true
        ? (incomingCallback: IncomingCallback<IncomingCallbackT>, index?: number) => void
        : (incomingCallback: IncomingCallback<IncomingCallbackT>) => void
    },
    {
      readonly incomingCallbacks: EnhancedMap<IncomingCallback<IncomingCallbackT>>
      readonly outgoingCallbacks: EnhancedMap<OutgoingCallback<IncomingCallbackT>>
    },
  ]
>

const modifyAnyThrownErrors = (fn: () => void, modifiedErrorMsg: string) => {
  try {
    fn()
  } catch (e) {
    throw new Error(modifiedErrorMsg)
  }
}

/**
 * Enables the coupling of two async callbacks: `incomingCallback` and `outgoingCallback`.  These can be renamed
 * as require. The callbacks may be added in any sequence and are enqueued.
 * Once both callbacks have been added: `outgoingCallback(incomingCallback)` is called
 * optionally, instead of FIFO, a manual index may be specified causing callbacks to be made in index order
 *
 * Example:
 * ```
 * const coupler = customAsyncCoupler<'addA', 'addB', (result: number) => void>('addA', 'addB')
 * coupler.addA((incomingCb) => incomingCb(1))
 * coupler.addB((result) => {
 *   console.log(`result: ${result}`) // result: 1
 * })
 * ```
 *
 * If callbacks always arrive in the same order then there are better solutions than this one.
 * @param {string} outgoingCallbackName
 * @param {string} incomingCallbackName
 * @param {boolean} indexed
 * @returns
 */

function asyncCoupler<T extends AnyCallback>(): AsyncCoupler<DefaultOptions, T>
function asyncCoupler<T extends AnyCallback, O extends PartialOptions>(
  options: O,
): AsyncCoupler<FinalOption<O>, T>
function asyncCoupler<T extends AnyCallback, O extends PartialOptions>(
  options?: O,
): AsyncCoupler<FinalOption<O>, T> | AsyncCoupler<DefaultOptions, T> {
  type FinalOpts = FinalOption<O>
  const opts = { ...defaultOptions, ...(options ?? {}) } as FinalOpts

  const incomingCallbacks = enhancedMap<IncomingCallback<T>>()
  const outgoingCallbacks = enhancedMap<OutgoingCallback<T>>()
  let currentIdx = 1
  const makeNextCallback = () => {
    const outgoingCallback = outgoingCallbacks.get(currentIdx)
    const incomingCallback = incomingCallbacks.get(currentIdx)
    if (outgoingCallback && incomingCallback) {
      incomingCallbacks.delete(currentIdx)
      outgoingCallbacks.delete(currentIdx)
      currentIdx += 1
      outgoingCallback(incomingCallback)
      makeNextCallback()
    }
  }
  const addOutgoingCallback = (outgoingCallback: OutgoingCallback<T>, index = 1) => {
    const incomingCallback = incomingCallbacks.get(currentIdx)
    if (incomingCallback) {
      incomingCallbacks.delete(currentIdx)
      if (opts.indexed) {
        if (index <= currentIdx) throw new Error(`index: ${index} already processed`)
        currentIdx += 1
        outgoingCallback(incomingCallback)
        makeNextCallback()
      } else outgoingCallback(incomingCallback)
    } else {
      modifyAnyThrownErrors(
        () => outgoingCallbacks.add(outgoingCallback, index),
        'outgoingCallback already added',
      )
    }
  }

  const addIncomingCallback = (incomingCallback: IncomingCallback<T>, index = 1) => {
    const outgoingCallback = outgoingCallbacks.get(currentIdx)
    if (outgoingCallback) {
      outgoingCallbacks.delete(currentIdx)
      if (opts.indexed) {
        if (index <= currentIdx) throw new Error(`index: ${index} already processed`)
        currentIdx += 1
        outgoingCallback(incomingCallback)
        makeNextCallback()
      } else outgoingCallback(incomingCallback)
    } else {
      modifyAnyThrownErrors(
        () => incomingCallbacks.add(incomingCallback, index),
        'incomingCallback already added',
      )
    }
  }
  return {
    [opts.outgoingCallbackName]: addOutgoingCallback,
    [opts.incomingCallbackName]: addIncomingCallback,
    incomingCallbacks,
    outgoingCallbacks,
  } as unknown as AsyncCoupler<FinalOpts, T>
}

/**
 * see https://stackoverflow.com/questions/74662987/how-can-one-achieve-better-generic-inference?noredirect=1#comment131785747_74662987
 */

export const asyncCouplerWorkAround =
  <O extends PartialOptions>(options?: O) =>
  <T extends AnyCallback>() =>
    asyncCoupler<T, O>(options || ({} as O))

export default asyncCoupler
