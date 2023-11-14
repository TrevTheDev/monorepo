export { default as reverseForEach, globalReverseForEach } from './reverseForEach'
export * from './smallUtils'
export * from './fn arity'

export type { EnhancedMap } from './enhancedMap'

export { default as asyncFnsInParallel, asyncFnsInParallelShort } from './asyncFnsInParallel'
export type { Resolver as AsyncFnResolver, ValidResolver } from './asyncFnsInParallel'

export { asyncCoupler, enhancedMap } from './asyncCoupler'
export type { AsyncCoupler } from './asyncCoupler'

export { default as compose, composeWithError, pipe } from './compose'

export { default as compositor } from './compositor'

export * from './arrayUtils'

export { default as chain, chainNodeType } from './chain'
export type { AwaitedChainController, Resolver, AsyncFunc } from './chain'

export { default as enhancedChain, enhancedChainNodeType, toAsyncFn } from './enhancedChain'

// export { default as outputPins, resultNone } from './outputPins'
// export type {
//   OutputPinSetter,
//   OutputPinGetter,
//   OutputPinCallbacks,
//   ResultNoneSetter,
//   ResultNone,
// } from './outputPins'

export {
  toResult,
  toError,
  resultErrorToResultNever,
  resultNeverToResultError,
  onlyExecuteOnResult,
  isResult,
  isError,
} from './resultError'
export type { ResultError } from './resultError'

export {
  didError,
  didNotError,
  throwOnError,
  voidNeverToUndefinedError,
  undefinedErrorToVoidNever,
} from './canError'
export type { CanError } from './canError'

export * from './typescriptUtils'

export { default as addStateMachine } from './stateMachine'
export type { ObjectWrappedWithStateMachine } from './stateMachine'

export { default as asyncFunctionLinkedList } from './asyncFunctionLinkedList'

export * from './objectUtils'

// export {
//   monadicArrayFnToPolyadicFn,
//   polyadicFnToMonadicArrayFn,
//   monadicObjectFnToPolyadicFn,
//   polyadicFnToMonadicObjectFn,
//   polyadicFnWithPreKnownInputsToMonadicFn,
// } from './fn arity'
