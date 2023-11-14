/* eslint-disable @typescript-eslint/no-explicit-any */

import { enhancedMap } from './asyncCoupler'

/**
 * A basic function generating UIDs
 * @param length the length of the returned UID - defaults to 20
 * @returns random string
 */
export function createUid(length = 20): string {
  return Array.from({ length }, () => Math.random().toString(36)[2]).join('')
}

type DuplicateCallErrorFn = (calledFn: string, firstCalledFn: string, args: unknown[]) => any

function defaultErrorFn(calledFn_: string | undefined, firstCalledFn_: string | undefined): never {
  if (calledFn_ === '') throw new Error(`cannot call function more than once`)
  if (calledFn_ === firstCalledFn_) throw new Error(`cannot call '${calledFn_}' more than once`)
  throw new Error(`cannot call '${calledFn_}' after calling '${firstCalledFn_}'`)
}

/**
 * Wraps function(s) altering their behavior if any are called more once.  By default
 * it throws if any functions are called more than once.  Alternatively an error handling
 * function can be supplied or any other error return value
 * As it can handle multiple functions, a second parameter can be an identifier for the
 * function - which may be useful in the error handling function.
 *
 * @param errorMsgCb - if a function is provided, this will be called as follows: (calledFn: string, firstCalledFn: string, args: unknown[])
 *                     if not supplied an error is thrown (this is the default behavior)
 *                     any thing else, becomes the value returned if the function is run more than once
 */
export function runFunctionsOnlyOnce(): <T extends (...args: any) => any>(
  fn: T,
  fnName?: string,
) => T
export function runFunctionsOnlyOnce<E>(
  errorMsgCbOrReturnValue: E,
): E extends (...args: any) => infer RT
  ? <Args extends unknown[], Y>(
      fn: (...args: Args) => Y,
      fnName?: string,
    ) => (...args: Args) => Y | RT
  : <Args extends unknown[], Y>(
      fn: (...args: Args) => Y,
      fnName?: string,
    ) => (...args: Args) => Y | E
export function runFunctionsOnlyOnce(
  errorMsgCb?: DuplicateCallErrorFn,
): (fn: (...args: any) => unknown, fnName: string) => (...args: unknown[]) => unknown {
  let called = false
  let calledFn = ''
  const errorFn: DuplicateCallErrorFn | (() => unknown) =
    // eslint-disable-next-line no-nested-ternary
    errorMsgCb === undefined
      ? defaultErrorFn
      : typeof errorMsgCb === 'function'
      ? errorMsgCb
      : () => errorMsgCb

  return function addFns(
    fn: (...args: any) => unknown,
    fnName = '',
  ): (...args: unknown[]) => unknown {
    if (called) throw new Error("can't add a function to an already called `runFunctionsOnlyOnce`")
    return function runFn(...args: unknown[]): unknown {
      if (called) return errorFn(fnName, calledFn, args)
      called = true
      calledFn = fnName
      return fn(...args)
    }
  }
}

// /**
//  * Function wrapper that executes `fn` with functions args and if it returns true, throws an error via errorCb
//  * @param errorCb: (meta?: M, args?: P) => never - function that throws a custom error
//  * @param isValidArgs: (args: P, meta?: M) => boolean - function that performs some test and if it returns `false` then `errorCb` is called
//  * @returns (fn: T, meta?: M)=> T - a function that accepts a function `fn` and optional meta data `meta` that may be passed to `errorCb`
//  */
// export function validateFnArgs<
//   P extends unknown[],
//   M,
// >(
//   errorCb: (meta?: M, args?: P) => never,
//   isValidArgs: (args: P, meta?: M) => boolean,
// ): <RT>(fn: (...args: P) => RT, meta?: M) => (...args: P) => RT
// export function validateFnArgs<T extends (...args: any[]) => any, M>(
//   errorCb: (meta?: M, args?: Parameters<T>) => never,
//   isValidArgs: (args: Parameters<T>, meta?: M) => boolean,
// ): (fn: T, meta?: M) => T
// export function validateFnArgs(
//   errorCb: (meta?: unknown, args?: unknown[]) => never,
//   isValidArgs: (args: unknown[], meta?: unknown) => boolean,
// ): (fn: (...args: unknown[]) => unknown, meta?: unknown) => (...args: unknown[]) => unknown {
//   return function X1(
//     fn: (...args: unknown[]) => unknown,
//     meta?: unknown,
//   ): (...args: unknown[]) => unknown {
//     return function X2(...args: unknown[]): unknown {
//       if (!isValidArgs(args, meta)) return errorCb(meta, args)
//       return fn(...args)
//     }
//   }
// }

// /**
//  * Function wrapper that throws an error `errorMsg` if arg is undefined, '', null or []
//  * @param fn: (arg: any) => unknown - any function that requires `arg` be returned
//  * @param errorMsg
//  * @returns return value of `fn`
//  */
// export function requireValue<T extends (arg: any) => any>(
//   fn: T,
//   errorMsg = `this function requires a value`,
// ) {
//   type P = T extends (arg: infer A) => any ? A : never
//   return validateFn(
//     () => {
//       throw new Error(errorMsg)
//     },
//     (arg: [P]) =>
//       !(
//         arg[0] === undefined ||
//         arg[0] === null ||
//         arg[0] === '' ||
//         (Array.isArray(arg[0]) && arg[0].length === 0)
//       ),
//   )(fn)
// }

/**
 * Can add many callbacks that are all triggered when `triggerCallbacks` is executed.
 * const x = enqueueableCallbacksWithDelete<[result: string]>();
 *
 * @returns
 */
function callbackTee_<Arguments extends unknown[], ReturnVal>(
  options: {
    callInReverseOrder?: boolean
    canCallOnlyOnce?: boolean
    calledMoreThanOnceErrorCb?: DuplicateCallErrorFn
  } = {},
) {
  const opts = {
    callInReverseOrder: false,
    canCallOnlyOnce: false,
    calledMoreThanOnceErrorCb: undefined,
    ...options,
  }

  const callbackQueue = enhancedMap<(...args: Arguments) => ReturnVal>()
  let callFn: (...args: Arguments) => ReturnVal | ReturnVal[] | undefined = () => undefined
  let callFnExecutor = (...args: Arguments) => callFn(...args)

  if (opts.canCallOnlyOnce) {
    callFnExecutor = runFunctionsOnlyOnce(opts.calledMoreThanOnceErrorCb)(
      callFnExecutor,
      'callCallbacks',
    )
  }

  let callbackAdder = (callback1: (...args: Arguments) => ReturnVal) => {
    let singleCallback: ((...args: Arguments) => ReturnVal) | undefined = callback1
    let removeSingleCallback = () => {
      singleCallback = undefined
      removeSingleCallback = () => false
      return true
    }
    callFn = singleCallback
    callbackAdder = (callback2: (...args: Arguments) => ReturnVal) => {
      if (singleCallback) {
        removeSingleCallback = callbackQueue.add(singleCallback)
        singleCallback = undefined
      }
      callFn = (...args: Arguments) =>
        callbackQueue.map((cb) => cb(...args), opts.callInReverseOrder)

      callbackAdder = (callback3: (...args: Arguments) => ReturnVal) => callbackQueue.add(callback3)
      return callbackAdder(callback2)
    }
    return () => removeSingleCallback()
  }

  return {
    /**
     * enqueues a callback
     * @param callback
     * @returns a function to remove enqueued callback
     */
    addCallback(callback: (...args: Arguments) => ReturnVal) {
      return callbackAdder(callback)
    },
    /**
     * calls all call with args in the predefined order
     * @param args
     * @returns
     */
    callCallbacks(...args: Arguments) {
      return callFnExecutor(...args)
    },
  }
}

/**
 * Can add many callbacks via `addCallback` that are called when `callCallbacks` is called.
 * const x = callbackResolverQueue<[result: string]>();
 * @param options {
    @param callInReverseOrder?: boolean - callbacks are called with last being called first. default `false`
    @param canCallOnlyOnce?: boolean - `callCallbacks` can only be executed once. default `false`
    @param calledMoreThanOnceErrorCb?: (
      @param firstCalledFn: string,
      @param thisCalledFn: string,
      @param args: T extends (...argX: infer A) => any ? A : never,
    ) => never
    @param resolvePerpetually?: boolean - callbacks can be added, even after resolution - they are resolved immediately
 * }
 * @returns {
 *  callCallbacks: 
 * }
 */
export function callbackTee<Arguments extends unknown[], ReturnVal = void>(
  options: {
    callInReverseOrder?: boolean
    canCallOnlyOnce?: boolean
    calledMoreThanOnceErrorCb?: DuplicateCallErrorFn
    resolvePerpetually?: boolean
  } = { resolvePerpetually: false },
) {
  const rQueue = callbackTee_<Arguments, ReturnVal>(options)
  if (!options.resolvePerpetually) return rQueue
  if (options.callInReverseOrder)
    throw new Error(`'callInReverseOrder' and 'resolvePerpetually' are mutually exclusive`)
  if (options.canCallOnlyOnce !== true)
    throw new Error(`'canCallOnlyOnce' must be true to use 'resolvePerpetually'`)

  let set = false
  let argCache: Arguments
  return {
    callCallbacks(...args: Arguments) {
      set = true
      argCache = args
      rQueue.callCallbacks(...args)
    },
    addCallback(callback: (...args: Arguments) => ReturnVal) {
      if (set) callback(...argCache)
      else rQueue.addCallback(callback)
    },
  }
}
export function capitalise<T extends string>(stringToCapitalise: T): `${Capitalize<T>}`
export function capitalise(stringToCapitalise: string) {
  return stringToCapitalise.charAt(0).toUpperCase() + stringToCapitalise.slice(1)
}

export function capitaliseWords(stringToCapitalise: string, separators = [' ', '-']) {
  return separators.reduce(
    (str, sep) => str.split(sep).map(capitalise).join(sep),
    stringToCapitalise.toString(),
  )
}

// export function functionClass<
//   ClassType extends Record<string, unknown>,
//   InstantiationArgs extends unknown[],
//   PrivateVariables extends unknown[],
// >(
//   this: ClassType,
//   ctor: (
//     instantiatorArg: (...privateVariables: PrivateVariables) => ClassType,
//     ...args0: InstantiationArgs
//   ) => ClassType,
//   callAction: string,
//   instantiator: (...privateVariables: PrivateVariables) => ClassType,
// ) {
//   const fn = function Ctor(...args: InstantiationArgs) {
//     console.log(1)
//     const self = function CallSelf(...callArgs: any) {
//       return (self[callAction] as any)(...callArgs)
//     } as unknown as ClassType

//     const instantiatorFn = (...args1: PrivateVariables) => {
//       const obj = instantiator.apply(self, args1)
//       Object.assign(self, obj)
//       return self
//     }

//     const that = ctor.call(self, instantiatorFn, ...args)
//     return that
//   }

//   return fn
// }
