/* eslint-disable @typescript-eslint/no-explicit-any */
import enhancedMap from './enhancedMap'

export const createUid = (length = 20): string =>
  Array.from({ length }, () => Math.random().toString(36)[2]).join('')

/**
 * Executes a callback `nTimes` - if a startValue is provided, the callbackfn is `(previousResult: U, index: number) => U`
 * else it is `(index: number) => void`
 * @param nTimes - number of times to execute the callback
 * @param callbackfn - callback to execute
 * @param startValue - optional startValue
 * @returns U[] | void
 */
//  function times<U>(
//   nTimes: number,
//   callbackfn: (previousResult: U, index: number) => U
// )
export function times(nTimes: number, callbackfn: (index: number) => void): void
export function times<U>(
  nTimes: number,
  callbackfn: (previousResult: U, index: number) => U,
  startValue: U,
): U
export function times<U>(
  nTimes: number,
  callbackfn: (previousResult: U, index: number) => U,
  startValue?: U,
): U | void {
  if (arguments.length === 3) {
    let rV: U = startValue as U
    for (let step = 0; step < nTimes; step += 1) rV = callbackfn(rV, step)
    return rV
  }
  for (let step = 0; step < nTimes; step += 1)
    (callbackfn as unknown as (index: number) => void)(step)
  return undefined
}

type DuplicateCallErrorFn = (calledFn: string, firstCalledFn: string, args: unknown[]) => never

function defaultErrorFn(calledFn_: string | undefined, firstCalledFn_: string | undefined): never {
  if (calledFn_ === '') throw new Error(`cannot call function more than once`)
  if (calledFn_ === firstCalledFn_) throw new Error(`cannot call '${calledFn_}' more than once`)
  throw new Error(`cannot call '${calledFn_}' after calling '${firstCalledFn_}'`)
}

/**
 *
 * @param errorMsgCb - if a function is provided, this will be called as follows: (calledFn: string, firstCalledFn: string, args: unknown[])
 *                     if `undefined` a default error must be throw (this is the default behavior)
 *                     any thing else, becomes the value returned if the function is run more than once
 * @returns <T extends (...args)=>unknown>(functionName: string)=>T - returned T can only be called once
 *          either throws or returns errorMsgCb value if called more than once
 */
export function runFunctionsOnlyOnce<E extends DuplicateCallErrorFn | any = never>(errorMsgCb?: E) {
  let called = false
  let calledFn = ''
  // eslint-disable-next-line @typescript-eslint/ban-types
  let errorFn: Function
  // | (E & Function)
  // | ((calledFn2: string | undefined, firstCalledFn: string | undefined) => never)
  // | (() => E)
  if (errorMsgCb === undefined) errorFn = defaultErrorFn
  else if (typeof errorMsgCb === 'function') errorFn = errorMsgCb
  else errorFn = () => errorMsgCb

  return <Args extends unknown[], Y>(fn: (...args: Args) => Y, fnName = '') =>
    ((...args: Args) => {
      if (called) return errorFn(fnName, calledFn, args)
      called = true
      calledFn = fnName
      return fn(...args)
    }) as unknown as [E] extends [never]
      ? (...args: Args) => Y
      : // eslint-disable-next-line @typescript-eslint/ban-types
      E extends Function
      ? (...args: Args) => Y
      : (...args: Args) => Y | E
}
// const x = runFunctionsOnlyOnce()((a: string) => a)

/**
 * Function wrapper that executes `testFn` with functions args and if it returns true, throws an error via errorCb
 * @param errorCb: (meta?: M, args?: P) => never - function that throws a custom error
 * @param isValidArgs: (args: P, meta?: M) => boolean - function that performs some test and if it returns `false` then `errorCb` is called
 * @returns (fn: T, meta?: M)=> T - a function that accepts a function `fn` and optional meta data `meta` that may be passed to `errorCb`
 */
export function validateFn<
  T extends (...args: any[]) => any,
  M,
  P extends any[] = T extends (...args: infer A) => any ? A : never,
>(errorCb: (meta?: M, args?: P) => never, isValidArgs: (args: P, meta?: M) => boolean) {
  return (fn: T, meta?: M) =>
    (...args: P) => {
      if (!isValidArgs(args, meta)) return errorCb(meta, args)
      return fn(...args)
    }
}

/**
 * Function wrapper that throws an error `errorMsg` if arg is undefined, '', null or []
 * @param fn: (arg: any) => unknown - any function that requires `arg` be returned
 * @param errorMsg
 * @returns return value of `fn`
 */
export function requireValue<T extends (arg: any) => any>(
  fn: T,
  errorMsg = `this function requires a value`,
) {
  type P = T extends (arg: infer A) => any ? A : never
  return validateFn(
    () => {
      throw new Error(errorMsg)
    },
    (arg: [P]) =>
      !(
        arg[0] === undefined ||
        arg[0] === null ||
        arg[0] === '' ||
        (Array.isArray(arg[0]) && arg[0].length === 0)
      ),
  )(fn)
}

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

export function functionClass<
  ClassType extends Record<string, unknown>,
  InstantiationArgs extends unknown[],
  PrivateVariables extends unknown[],
>(
  this: ClassType,
  ctor: (
    instantiatorArg: (...privateVariables: PrivateVariables) => ClassType,
    ...args0: InstantiationArgs
  ) => ClassType,
  callAction: string,
  instantiator: (...privateVariables: PrivateVariables) => ClassType,
) {
  const fn = function Ctor(...args: InstantiationArgs) {
    console.log(1)
    const self = function CallSelf(...callArgs: any) {
      return (self[callAction] as any)(...callArgs)
    } as unknown as ClassType

    const instantiatorFn = (...args1: PrivateVariables) => {
      const obj = instantiator.apply(self, args1)
      Object.assign(self, obj)
      return self
    }

    const that = ctor.call(self, instantiatorFn, ...args)
    return that
  }

  return fn
}

type ObjectWithExecutableProperty<P extends string> = { [K in P]: (...args: any[]) => any }

export function isObjectAndHasExecutableProperty<P extends string>(
  object: unknown,
  property: P,
): object is ObjectWithExecutableProperty<P> {
  if (object === null || !['object', 'function'].includes(typeof object)) return false
  const descriptor = Object.getOwnPropertyDescriptor(object, property)
  if (descriptor === undefined) return false
  return typeof descriptor.get === 'function' || typeof descriptor.value === 'function'
}

/**
 * whether a property of `obj` is a getter.  prop is assumed to exist.
 *
 * @param obj
 * @param prop
 * @returns boolean
 */
export function isGetter<P extends PropertyKey, O extends { [Property in P]: any }>(
  obj: O,
  prop: P,
): boolean {
  return !!(Object.getOwnPropertyDescriptor(obj, prop) as PropertyDescriptor).get
}
/**
 * whether a property of `obj` is a setter.  prop is assumed to exist.
 *
 * @param obj
 * @param prop
 * @returns boolean
 */
export function isSetter<P extends PropertyKey, O extends { [Property in P]: any }>(
  obj: O,
  prop: P,
): boolean {
  return !!(Object.getOwnPropertyDescriptor(obj, prop) as PropertyDescriptor).set
}
/**
 * whether a property of `obj` is a value - i.e. a non-callable property.  prop is assumed to exist.
 *
 * @param obj
 * @param prop
 * @returns boolean
 */
export function isValue<P extends PropertyKey, O extends { [Property in P]: any }>(
  obj: O,
  prop: P,
): boolean {
  const x = (Object.getOwnPropertyDescriptor(obj, prop) as PropertyDescriptor).value
  return x !== undefined && typeof x !== 'function'
}
/**
 * whether a property of `obj` is a callable function.  prop is assumed to exist.
 *
 * @param obj
 * @param prop
 * @returns boolean
 *
 * @example
 * type Foo = { foo: unknown }
 * const foo1:Foo = { foo: () => 1 }
 * foo1.foo() // errors
 * if(isFunction(foo1, 'foo')) foo1.foo() // doesn't error
 */
export function isFunction<P extends PropertyKey>(
  obj: { [Property in P]: unknown } | { [Property in P]: (...args: any[]) => any },
  prop: P,
): obj is { [Property in P]: (...args) => any } {
  const x = (Object.getOwnPropertyDescriptor(obj, prop) as PropertyDescriptor).value
  return x !== undefined && typeof x === 'function'
}
