/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
// TODO: implement typing for promise returns
import chain from './chain'

import type {
  AsyncFunctionChainArray,
  ValidAsyncFn,
  ChainGenerics,
  ChainNode,
  Resolver,
  AsyncFunctionChainArrayType,
} from './chain'

import type { RMerge } from './typescriptUtils'
import type { Fn, FunctionChainArray } from './compose'
import compositor from './compositor'

export const enhancedChainNodeType = Symbol('Enhanced Chain Node')

type LifecycleCallbacks = {
  beforeChainStart?: () => void
  beforeChainResult?: () => void
  afterChainResult?: () => void
  beforeChainError?: () => void
  afterChainError?: () => void

  beforeChainResolved?: () => void
  afterChainResolved?: () => void

  beforeNodeStart?: () => void
  beforeNodeResult?: () => void
  afterNodeResult?: () => void
  beforeNodeError?: () => void
  afterNodeError?: () => void
}

type EnhanceChainOptions = {
  thrownErrorToErrorCb: boolean
  enforceSingleResolution: boolean
  forceAsync: 'setImmediate' | 'nextTick' | 'queueMicrotask' | 'none'
  resolveReturnedPromises: boolean
  // infinite: boolean
  // isThenable: boolean
  // handleSyncFunctions: boolean
  callbacks?: LifecycleCallbacks
}

const defaultOptions = {
  thrownErrorToErrorCb: true,
  enforceSingleResolution: true,
  forceAsync: 'none',
  resolveReturnedPromises: true,
  // infinite: false,
  // isThenable: true,
  // handleSyncFunctions: true,
} as const

type DefaultOptions = typeof defaultOptions extends infer O
  ? { -readonly [K in keyof O]: O[K] }
  : never

type PartialOptions = Partial<EnhanceChainOptions>

type FinalOption<
  Options extends PartialOptions,
  RT = RMerge<[DefaultOptions, Options]>,
> = RT extends EnhanceChainOptions ? RT : never

type SyncFunctionChainArray<
  StartInput,
  T extends [Fn, ...Fn[]],
  First extends Fn = T extends [infer F extends Fn, ...any] ? F : never,
  ConstrainedT extends [Fn, ...Fn[]] = T extends [any, ...infer R extends Fn[]]
    ? [(Input: StartInput) => ReturnType<First>, ...R]
    : never,
  RT extends [Fn, ...Fn[]] = FunctionChainArray<ConstrainedT>,
> = RT

interface CalculatedNextChain<
  Chain extends ChainGenerics,
  T extends [Fn, ...Fn[]],
  Last extends Fn = T extends [...any, infer F extends Fn] ? F : never,
> extends ChainGenerics {
  input: Chain['input']
  errorResolverController: Chain['errorResolverController']
  accumulatedErrors: Chain['accumulatedErrors']
  accumulatedResultResolverControllers: Chain['accumulatedResultResolverControllers']
  lastNode: {
    output: ReturnType<Last>
    error: never
    resultResolverController: void
  }
}

type SyncResultCall<Chain extends ChainGenerics, Options extends EnhanceChainOptions> = <
  T extends [Fn, ...Fn[]],
>(
  ...syncFunctions: T & SyncFunctionChainArray<Chain['lastNode']['output'], T>
) => EnhancedChainNode<
  CalculatedNextChain<Chain, SyncFunctionChainArray<Chain['lastNode']['output'], T>>,
  Options
>

type EnhancedResultCall<Chain extends ChainGenerics, Options extends EnhanceChainOptions> = {
  <
    T extends [ValidAsyncFn, ...ValidAsyncFn[]],
    RT extends AsyncFunctionChainArrayType = AsyncFunctionChainArray<T, Chain>,
  >(
    ...asyncFunctions: T & RT['asyncFns']
  ): EnhancedChainNode<RT['lastChain'], Options>
}

type EnhancedChainNode<
  Chain extends ChainGenerics,
  Options extends EnhanceChainOptions,
  RT = RMerge<
    [
      ChainNode<Chain>,
      {
        type: typeof enhancedChainNodeType
        sync: SyncResultCall<Chain, Options>
        input(input: Chain['input']): Promise<Chain['lastNode']['output']>
      },
    ]
  > &
    EnhancedResultCall<Chain, Options>,
> = RT

type EnhancedChainFn<FinalOptions extends EnhanceChainOptions> = <
  const T extends [ValidAsyncFn, ...ValidAsyncFn[]],
  ValidT extends AsyncFunctionChainArrayType = AsyncFunctionChainArray<T>,
>(
  ...asyncFunctions: T & ValidT['asyncFns']
) => EnhancedChainNode<ValidT['lastChain'], FinalOptions>

/**
 * ******************************************************************************************************************************************************************
 * ******************************************************************************************************************************************************************
 * ******************************************************************************************************************************************************************
 * ******************************************************************************************************************************************************************
 * ******************************************************************************************************************************************************************
 * ******************************************************************************************************************************************************************
 * */

const enforceSingleResolution = <T extends ValidAsyncFn>(asyncFunction: T) => {
  type EnhancedResolver = Parameters<T>[1]
  type Input = Parameters<T>[0]

  return ((input: Input, resolver: EnhancedResolver) => {
    let resolvedFlag = false
    const enhanceResolverFn = <S>(resolverFn) =>
      ((...args) => {
        if (resolvedFlag) throw new Error('asyncFunction can only be resolved once')
        resolvedFlag = true
        return resolverFn(...args)
      }) as unknown as S
    const enhancedResolver = function resolverFn(resultArg) {
      return enhancedResolver.result(resultArg)
    } as EnhancedResolver
    Object.defineProperties(enhancedResolver, {
      result: {
        value: enhanceResolverFn(resolver.result),
        writable: false,
      },
      error: {
        value: enhanceResolverFn(resolver.error),
        writable: false,
      },
    })
    return asyncFunction(input, enhancedResolver)
  }) as unknown as T
}

const thrownErrorToErrorCb = <T extends ValidAsyncFn>(asyncFunction: T) => {
  type EnhancedResolver = Parameters<T>[1]
  type Input = Parameters<T>[0]
  type ResultArg = Parameters<EnhancedResolver['result']>[0]
  type ErrorArg = Parameters<EnhancedResolver['error']>[0]
  return ((input: Input, resolver: EnhancedResolver) => {
    const enhancedResolver = function resolverFn(resultArg) {
      return enhancedResolver.result(resultArg)
    } as EnhancedResolver
    Object.defineProperties(enhancedResolver, {
      result: {
        value: (resultArg: ResultArg) => {
          try {
            return resolver.result(resultArg)
          } catch (e) {
            return enhancedResolver.error(e)
          }
        },
        writable: false,
      },
      error: {
        value: (errorArg: ErrorArg) => {
          try {
            return resolver.error(errorArg)
          } catch (e) {
            throw new Error(
              'Errors thrown in an error resolver callback cannot be sent to the same error resolver',
            )
          }
        },
        writable: false,
      },
    })

    try {
      return asyncFunction(input, enhancedResolver)
    } catch (e) {
      return enhancedResolver.error(e)
    }
  }) as T
}

const maybeThenable = (
  value: any | { then?: Function | unknown },
): value is { then?: Function | unknown } =>
  value && (typeof value === 'object' || typeof value === 'function')

const resolveReturnedPromises = <T extends ValidAsyncFn>(asyncFunction: T) => {
  type EnhancedResolver = Parameters<T>[1]
  type Input = Parameters<T>[0]
  type ResultArg = Parameters<EnhancedResolver['result']>[0]
  const resolverCb = (resultCb, errorCb) => (result) => {
    if (maybeThenable(result)) {
      const { then } = result
      if (typeof then === 'function') return then.call(result, resultCb, errorCb)
    }
    return resultCb(result)
  }
  return ((input: Input, resolver: EnhancedResolver) => {
    const enhancedResolver = function resolverFn(resultArg: ResultArg) {
      return enhancedResolver.result(resultArg)
    } as EnhancedResolver
    Object.defineProperties(enhancedResolver, {
      result: {
        value: resolverCb(resolver.result, resolver.error),
        writable: false,
      },
      error: {
        value: resolverCb(resolver.error, resolver.error),
        writable: false,
      },
    })
    return asyncFunction(input, enhancedResolver)
  }) as T
}

const forceAsync =
  (asyncType: 'setImmediate' | 'nextTick' | 'queueMicrotask') =>
  <T extends ValidAsyncFn>(asyncFunction: T) => {
    type EnhancedResolver = Parameters<T>[1]
    type Input = Parameters<T>[0]
    // type ResultArg = Parameters<EnhancedResolver['result']>[0]
    // type ErrorArg = Parameters<EnhancedResolver['error']>[0]
    const makeFnAsync = <S extends (...args) => void>(fn: S) =>
      ((...args) => {
        switch (asyncType) {
          case 'setImmediate':
            return setImmediate(() => fn(...args))
          case 'nextTick':
            return process.nextTick(() => fn(...args))
          case 'queueMicrotask':
            return queueMicrotask(() => fn(...args))
          default:
            throw new Error('invalid asyncType type')
        }
      }) as S

    return makeFnAsync((input: Input, resolver: EnhancedResolver) => {
      function resolverFn(resultArg) {
        return (resolverFn as EnhancedResolver).result(resultArg)
      }
      Object.defineProperties(resolverFn, {
        result: {
          value: makeFnAsync(resolver.result),
          writable: false,
        },
        error: {
          value: makeFnAsync(resolver.error),
          writable: false,
        },
      })
      return asyncFunction(input, resolverFn)
    })
  }

type ToAsyncFn<
  T extends Fn,
  Res extends ValidAsyncFn = (
    input: Parameters<T>[0],
    resolver: Resolver<(result: ReturnType<T>) => void>,
  ) => void,
> = Res

export const toAsyncFn =
  <T extends Fn>(syncFn: T): ToAsyncFn<T> =>
  (input, resolver) =>
    resolver(syncFn(input))

const enhanceChainNodeWithSync = (chainNode) =>
  Object.defineProperty(chainNode, 'sync', {
    value: <T extends [Fn, ...Fn[]]>(...syncFunctions: T) => {
      if (syncFunctions.length === 0) throw new Error('a function must be provided')
      const asyncFns = syncFunctions.map((syncFn) => toAsyncFn(syncFn)) as [
        ValidAsyncFn,
        ...ValidAsyncFn[],
      ]
      return chainNode(...asyncFns)
    },
    writable: false,
  })

const makeChainNodeThenable = <Chain extends ChainGenerics>(chainNode: ChainNode<Chain>) =>
  Object.defineProperty(chainNode, 'input', {
    value: (input: Chain['input']) =>
      new Promise<Chain['lastNode']['output']>((resolve, reject) => {
        chainNode.await(input, resolve, reject)
      }),
    writable: false,
  })

type ResolverUnknown = {
  (result: any): unknown
  result: (result: any) => unknown
  error: (result: any) => unknown
}

const asyncFnTrackerWrapper =
  (traps: LifecycleCallbacks) =>
  <T extends ValidAsyncFn>(asyncFn: T) => {
    const composedResultCb = compositor()
    if (traps.beforeNodeResult) composedResultCb.addEffects(traps.beforeNodeResult)
    const setResultCb = composedResultCb.insertPlaceholder()
    if (traps.afterNodeResult) composedResultCb.addEffects(traps.afterNodeResult)

    const composedErrorCb = compositor()
    if (traps.beforeNodeError) composedErrorCb.addEffects(traps.beforeNodeError)
    const setErrorCb = composedErrorCb.insertPlaceholder()
    if (traps.afterNodeError) composedErrorCb.addEffects(traps.afterNodeError)

    function resolverTrackerWrapper<R extends ResolverUnknown>(resolver: R) {
      function resolverFn(this: R, resultArg: Parameters<R>[0]) {
        return this.result(resultArg)
      }

      Object.defineProperties(resolverFn, {
        result: {
          value: setResultCb(resolver.result),
          writable: false,
        },
        error: {
          value: setErrorCb(resolver.error),
          writable: false,
        },
      })
      return resolverFn as R
    }

    return (
      traps.beforeNodeStart
        ? (input, resolver) => {
            ;(traps.beforeNodeStart as () => void)()
            return asyncFn(input, resolverTrackerWrapper(resolver))
          }
        : (input, resolver) => asyncFn(input, resolverTrackerWrapper(resolver))
    ) as T
  }

/**
 * ******************************************************************************************************************************************************************
 * ******************************************************************************************************************************************************************
 * ******************************************************************************************************************************************************************
 * ******************************************************************************************************************************************************************
 * ******************************************************************************************************************************************************************
 * ******************************************************************************************************************************************************************
 * */

// function addAsyncFns<FinalOpts extends EnhanceChainOptions>(
//   chainNodeWrapper: <Chain extends ChainGenerics>(chainNode: ChainNode<Chain>) => ChainNode<Chain>,
//   asyncFnWrapperFn: <T extends ValidAsyncFn>(asyncFn: T) => T,
//   chainFn: typeof chain,
// ): EnhancedChainFn<FinalOpts>

// function addAsyncFns(
//   chainNodeWrapper: (chainNode: any) => any,
//   asyncFnWrapperFn: <T extends ValidAsyncFn>(asyncFn: T) => T,
//   chainArg: any,
// ): any
function addAsyncFns<I, O = I>(
  chainNodeWrapper: (chainNode: I) => (...asyncFns: [ValidAsyncFn, ...ValidAsyncFn[]]) => I,
  asyncFnWrapperFn: <T extends ValidAsyncFn>(asyncFn: T) => T,
  chainArg: (asyncFn: ValidAsyncFn) => I,
) {
  return (...asyncFns: [ValidAsyncFn, ...ValidAsyncFn[]]) => {
    const asyncFn = asyncFns.shift()
    if (!asyncFn) throw new Error('at least one asyncFn must be provided')
    const nextEnhancedChainNode = chainNodeWrapper(chainArg(asyncFnWrapperFn(asyncFn)))
    return (asyncFns.length > 0
      ? nextEnhancedChainNode(...asyncFns)
      : nextEnhancedChainNode) as unknown as O
  }
}

function enhancedChain<Options extends PartialOptions = {}>(
  options?: Options,
): EnhancedChainFn<FinalOption<Options>>
function enhancedChain<
  const T extends [ValidAsyncFn, ...ValidAsyncFn[]],
  Options extends PartialOptions = {},
  ValidT extends AsyncFunctionChainArrayType = AsyncFunctionChainArray<T>,
>(
  options: Options,
  ...asyncFns: T & ValidT['asyncFns']
): EnhancedChainNode<ValidT['lastChain'], FinalOption<Options>>
function enhancedChain<T extends ValidAsyncFn[], Options extends PartialOptions = {}>(
  options?: Options,
  ...asyncFns: T
): any /* : [TA] extends [never]
  ? EnhancedChainFn<FinalOption<Options>>
  : EnhancedChainNode<AsyncFunctionChainArray<TA, never>['LastChain'], FinalOption<Options>> */ {
  type FinalOpts = FinalOption<Options>
  const opts = { ...defaultOptions, ...(options ?? {}) } as FinalOpts

  const traps: LifecycleCallbacks = opts.callbacks ?? {}

  const composedFn = compositor()
  if (opts.resolveReturnedPromises) composedFn(resolveReturnedPromises)
  if (opts.thrownErrorToErrorCb) composedFn(thrownErrorToErrorCb)
  if (opts.enforceSingleResolution) composedFn(enforceSingleResolution)
  if (opts.callbacks) composedFn(asyncFnTrackerWrapper(opts.callbacks))
  if (opts.forceAsync !== 'none') composedFn(forceAsync(opts.forceAsync))
  const asyncFnEnhancer: <S extends ValidAsyncFn>(asyncFn: S) => S = composedFn.call

  const chainNodeWrapper = <Chain extends ChainGenerics>(
    chainNode: ChainNode<Chain>,
  ): EnhancedChainNode<Chain, FinalOpts> => {
    let setErrorCb = (x) => x
    let setResultCb = (x) => x
    // debugger
    if (opts.callbacks !== undefined) {
      const enhancedErrorCb = compositor()
      if (traps.beforeChainResolved) enhancedErrorCb.addEffects(traps.beforeChainResolved)
      if (traps.beforeChainError) enhancedErrorCb.addEffects(traps.beforeChainError)
      setErrorCb = enhancedErrorCb.insertPlaceholder()
      if (traps.afterChainError) enhancedErrorCb.addEffects(traps.afterChainError)
      if (traps.afterChainResolved) enhancedErrorCb.addEffects(traps.afterChainResolved)

      const enhancedResultCb = compositor()
      if (traps.beforeChainResolved) enhancedResultCb.addEffects(traps.beforeChainResolved)
      if (traps.beforeChainResult) enhancedResultCb.addEffects(traps.beforeChainResult)
      setResultCb = enhancedResultCb.insertPlaceholder()
      if (traps.afterChainResult) enhancedResultCb.addEffects(traps.afterChainResult)
      if (traps.afterChainResolved) enhancedResultCb.addEffects(traps.afterChainResolved)
    }

    const awaitFnB = (input, resultCb, errorCb?) =>
      chainNode.await(
        input,
        setResultCb(resultCb),
        setErrorCb(
          errorCb ||
            (() => {
              debugger
              throw new Error('error callback made without an error handler being provided')
            }),
        ),
      )
    const awaitFn = traps.beforeChainStart
      ? (input, resultCb, errorCb?) => {
          ;(traps.beforeChainStart as () => void)()
          return awaitFnB(input, resultCb, errorCb)
        }
      : awaitFnB

    const composedFnChain = compositor((nextChainNode) => {
      Object.defineProperties(nextChainNode, {
        type: {
          get() {
            return enhancedChainNodeType
          },
        },
        onError: {
          value: setErrorCb,
          writable: false,
        },
        await: {
          value: awaitFn,
          writable: false,
        },
        asyncFn: {
          get() {
            return chainNode.asyncFn
          },
        },
      })

      return nextChainNode
    })
    composedFnChain(makeChainNodeThenable as unknown as any)
    composedFnChain(enhanceChainNodeWithSync as unknown as any)

    const nextChainNodeFn = (addAsyncFns as any)(chainNodeWrapper, asyncFnEnhancer, chainNode)
    return composedFnChain.call(nextChainNodeFn) as unknown as EnhancedChainNode<Chain, FinalOpts>
  }

  const chainFn = (addAsyncFns as any)(chainNodeWrapper, asyncFnEnhancer, chain)
  return asyncFns.length > 0
    ? chainFn(...(asyncFns as unknown as [ValidAsyncFn, ...ValidAsyncFn[]]))
    : chainFn
}

export default enhancedChain
