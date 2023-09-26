/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { enhancedMap } from '.'
import type { CanError, EnhancedMap } from '.'
import addStateMachine, { ObjectWrappedWithStateMachine } from './stateMachine'
import { Identity } from './typescriptUtils'

type AddAwaitPayloadName = 'addAwaitPayload'
type AddPayloadName = 'addPayload'
type Indexed = false

type CouplerOptions<
  O extends string = AddAwaitPayloadName,
  I extends string = AddPayloadName,
  B extends boolean = Indexed,
  S extends boolean = false,
> = {
  addAwaitPayloadName: O
  addPayloadName: I
  indexed?: B
  withState?: S
}

const defaultOptions = {
  addAwaitPayloadName: 'addAwaitPayload',
  addPayloadName: 'addPayload',
  indexed: false,
} as CouplerOptions

// type PartialOptions = Partial<CouplerOptions>

// type FinalOption<
//   Options extends PartialOptions,
//   T = RMerge<[DefaultOptions, Options]>,
//   RT extends CouplerOptions = T extends CouplerOptions ? T : never,
// > = RT

type AwaitPayloadFn<T extends unknown[]> = (...payload: T) => void

export type AsyncCoupler<
  PayloadT extends unknown[],
  O extends string = AddAwaitPayloadName,
  I extends string = AddPayloadName,
  B extends boolean = Indexed,
> = Identity<
  {
    [key in O]: B extends true
      ? (awaitPayloadFn: (...payload: PayloadT) => void, index?: number) => CanError<Error>
      : (awaitPayloadFn: (...payload: PayloadT) => void) => CanError<Error>
  } & {
    [key in I]: B extends true
      ? (payload: PayloadT, index: number) => CanError<Error>
      : (...payload: PayloadT) => CanError<Error>
  } & {
    readonly payloads: EnhancedMap<PayloadT>
    readonly awaitPayloadFns: EnhancedMap<AwaitPayloadFn<PayloadT>>
  }
>

/**
 * Enables the coupling of two async callbacks: `payload` and `awaitPayloadFn`.  These can be renamed
 * as require. The callbacks may be added in any sequence and are enqueued.  By default, only one
 * `payload` and one `awaitPayloadFn` can be enqueued.  If more callbacks are required to be enqueued
 * then an index must be supplied.
 * Once both callbacks have been added: `awaitPayloadFn(payload)` is called
 * optionally, instead of FIFO, a manual index may be specified causing callbacks to be made in index order
 *
 * Example:
 * ```
 *   // default asyncCoupler has `addPayload` and `addAwaitPayload` methods
 *   const coupler = asyncCoupler<[number]>()
 *   coupler.addPayload(1)
 *   coupler.addAwaitPayload((result: number) => expect(result).toBe(1*))

 *   // renaming methods:
 *   const customCoupler = asyncCoupler(
 *     {
 *       addPayloadName: 'addNumbers',
 *       addAwaitPayloadName: 'awaitNumbers',
 *     },
 *     undefined as unknown as number, // hack to simplify generic typing
 *   )
 *   customCoupler.addNumbers(1)
 *   customCoupler.awaitNumbers((result) => {
 *     expect(result).toBe(1)
 *     done(undefined)
 *   })
 * ```
 */

function asyncCouplerBase<T extends unknown[]>(): AsyncCoupler<T>
function asyncCouplerBase<
  T extends unknown[],
  O extends string = AddAwaitPayloadName,
  I extends string = AddPayloadName,
  B extends boolean = Indexed,
>(options: CouplerOptions<O, I, B, boolean>, ..._dummy: T): AsyncCoupler<T, O, I, B>
function asyncCouplerBase<
  T extends unknown[],
  O extends string = AddAwaitPayloadName,
  I extends string = AddPayloadName,
  B extends boolean = Indexed,
>(options: CouplerOptions<O, I, B, boolean>): AsyncCoupler<T, O, I, B>
function asyncCouplerBase(
  options?: CouplerOptions<string, string, boolean, boolean>,
): AsyncCoupler<any, any, any, any> | AsyncCoupler<any> {
  const opts = { ...defaultOptions, ...(options ?? {}) } as CouplerOptions<any, any, any>
  const { indexed, addAwaitPayloadName, addPayloadName } = opts

  const payloads = enhancedMap<unknown[]>()
  const awaitPayloadFns = enhancedMap<AwaitPayloadFn<unknown[]>>()
  let currentIdx = 0
  function makeNextCallback() {
    const awaitPayloadFn = awaitPayloadFns.get(currentIdx)
    const payloadFn = payloads.get(currentIdx)
    if (awaitPayloadFn && payloadFn) {
      payloads.delete(currentIdx)
      awaitPayloadFns.delete(currentIdx)
      currentIdx += 1
      awaitPayloadFn(...payloadFn)
      makeNextCallback()
    }
  }

  function addAwaitPayloadFn(
    awaitPayloadFn: AwaitPayloadFn<unknown[]>,
    index = currentIdx,
  ): CanError<Error> {
    const payload = payloads.get(currentIdx)
    if (index < currentIdx) return new Error(`index: ${index} already processed`)
    if (payload) {
      payloads.delete(currentIdx)
      if (indexed) {
        currentIdx += 1
        awaitPayloadFn(...payload)
        makeNextCallback()
      } else awaitPayloadFn(...payload)
    } else {
      try {
        awaitPayloadFns.add(awaitPayloadFn, index, true)
      } catch (e) {
        throw new Error(`${opts.addAwaitPayloadName} already added`)
      }
    }
    return undefined
  }

  function addPayloadFn(...payloadAndIndex: unknown[]) {
    const payload = (indexed ? payloadAndIndex[0] : payloadAndIndex) as unknown[]
    const index = (indexed ? payloadAndIndex[1] : 0) as number
    const awaitPayloadFn = awaitPayloadFns.get(currentIdx)
    if (index < currentIdx) throw new Error(`index: ${index} already processed`)
    if (awaitPayloadFn) {
      awaitPayloadFns.delete(currentIdx)
      if (indexed) {
        currentIdx += 1
        awaitPayloadFn(...payload)
        makeNextCallback()
      } else awaitPayloadFn(...payload)
    } else {
      try {
        payloads.add(payload, index, true)
      } catch (e) {
        throw new Error(`previous ${opts.addPayloadName} not yet called`)
      }
    }
    return undefined
  }
  return {
    [addAwaitPayloadName]: addAwaitPayloadFn,
    [addPayloadName]: addPayloadFn,
    payloads,
    awaitPayloadFns,
  } as AsyncCoupler<any, any, any, any>
}

export type AsyncCouplerWithState<
  PayloadT extends unknown[],
  O extends string = AddAwaitPayloadName,
  I extends string = AddPayloadName,
  B extends boolean = Indexed,
> = ObjectWrappedWithStateMachine<
  Identity<
    {
      [key in O]: B extends true
        ? (awaitPayloadFn: (...payload: PayloadT) => void, index?: number) => CanError<Error>
        : (awaitPayloadFn: (...payload: PayloadT) => void) => CanError<Error>
    } & {
      [key in I]: B extends true
        ? (payload: PayloadT, index: number) => CanError<Error>
        : (...payload: PayloadT) => CanError<Error>
    } & {
      readonly payloads: EnhancedMap<PayloadT>
      readonly awaitPayloadFns: EnhancedMap<AwaitPayloadFn<PayloadT>>
      error(): void
      end(): void
    }
  >,
  'ended' | 'errored',
  'in progress' | 'ended' | 'errored'
  // [['error', 'errored'], ['end', 'ended']]
>

function asyncCouplerWithState<T extends unknown[]>(): AsyncCouplerWithState<T>
function asyncCouplerWithState<
  T extends unknown[],
  O extends string = AddAwaitPayloadName,
  I extends string = AddPayloadName,
  B extends boolean = Indexed,
>(options: CouplerOptions<O, I, B, true>, ..._dummy: T): AsyncCouplerWithState<T, O, I, B>
function asyncCouplerWithState<
  T extends unknown[],
  O extends string = AddAwaitPayloadName,
  I extends string = AddPayloadName,
  B extends boolean = Indexed,
>(options: CouplerOptions<O, I, B, true>): AsyncCouplerWithState<T, O, I, B>
function asyncCouplerWithState(
  options?: CouplerOptions<string, string, boolean, boolean>,
): AsyncCouplerWithState<unknown[], string, string, boolean> | AsyncCouplerWithState<unknown[]> {
  // let state = 'in progress' as 'in progress' | 'ended' | 'error'
  const opts = { ...defaultOptions, ...(options ?? {}) } as CouplerOptions<any, any, any>
  // const { addAwaitPayloadName, addPayloadName } = opts as {
  //   addAwaitPayloadName: 'addAwaitPayloadName'
  //   addPayloadName: 'addPayloadName'
  // }
  const coupler = addStateMachine({
    baseObject: {
      ...asyncCouplerBase<unknown[], 'addAwaitPayloadName', 'addPayloadName', boolean>(opts),
      end() {
        return coupler.toState('ended')
      },
      error() {
        return coupler.toState('errored')
      },
    },
    transitions: [['in progress', ['ended', 'errored']]],
    beforeCallGuards: [
      [opts.addAwaitPayloadName as 'addAwaitPayloadName', ['in progress']],
      [opts.addPayloadName as 'addPayloadName', ['in progress']],
      ['end', ['in progress']],
      ['error', ['in progress']],
    ],
  })
  return coupler as unknown as
    | AsyncCouplerWithState<unknown[], string, string, boolean>
    | AsyncCouplerWithState<unknown[]>
}

export function asyncCoupler<T extends unknown[]>(): AsyncCoupler<T>
export function asyncCoupler<
  T extends unknown[],
  O extends string = AddAwaitPayloadName,
  I extends string = AddPayloadName,
  B extends boolean = Indexed,
  S extends boolean = false,
>(
  options: Partial<CouplerOptions<O, I, B, S>>,
  ..._dummy: T
): S extends true ? AsyncCouplerWithState<T, O, I, B> : AsyncCoupler<T, O, I, B>
export function asyncCoupler<
  T extends unknown[],
  O extends string = AddAwaitPayloadName,
  I extends string = AddPayloadName,
  B extends boolean = Indexed,
  S extends boolean = false,
>(
  options: CouplerOptions<O, I, B, S>,
): S extends true ? AsyncCouplerWithState<T, O, I, B> : AsyncCoupler<T, O, I, B>
export function asyncCoupler(
  options?: Partial<CouplerOptions<string, string, boolean, boolean>>,
): any {
  const withState = options?.withState ?? false
  return withState === true
    ? asyncCouplerWithState(options as any)
    : asyncCouplerBase(options as any)
}

// /**
//  * see https://stackoverflow.com/questions/74662987/how-can-one-achieve-better-generic-inference?noredirect=1#comment131785747_74662987
//  */

// export const asyncCouplerWorkAround =
//   <O extends PartialOptions>(options?: O) =>
//   <T extends AnyCallback>() =>
//     asyncCoupler<T, O>(options || ({} as O))
