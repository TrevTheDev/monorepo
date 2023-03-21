# Toolbelt

A set of useful utilities and tools.

## Table Of Contents

## Chain Overview

A fast, simple, typed way to chain together asynchronous functions - with the output of each function acting as the input to the subsequent function.

If an error is returned by a function in the chain, that effectively ends any further processing of the chain.

An `await`ed chain returns an `AwaitedChainController` - which can be used to communicate with the currently executing function, including for example implementing a cancel ability.

### Example Basic Usage

```typescript
import { chain } from '...'
import type { Resolver } from '....'

// function to generate dummy asynchronous functions
const addChar =
  <T extends string, C extends string>(c: C) =>
  (x: T, resolver: Resolver<(result: `${C}:${T}`) => void>) =>
    resolver(`${c}:${x}` as `${C}:${T}`)

// adds three asynchronous functions to the chain
const fooChain = chain(
  addChar<'start', 'A'>('A'),
  addChar<'A:start', 'B'>('B'),
  addChar<'B:A:start', 'C'>('C'),
)
// adds a further three asynchronous functions to the chain
const fooBarChain = fooChain(
  addChar<'C:B:A:start', 'A'>('A'),
  addChar<'A:C:B:A:start', 'B'>('B'),
  addChar<'B:A:C:B:A:start', 'C'>('C'),
)
// awaits chain of asynchronous functions
fooBarChain.await('start' as const, (result) => {
  expect(result).toEqual('C:B:A:C:B:A:start')
  done(undefined)
})
```

### chain

```typescript
chain( ...asyncFns: [AsyncFn, ...AsyncFn[]] ) => ChainNode
```

#### AsyncFn

Functions passed to the chain must have the following form:

```typescript
;(
  input: any, // input provided to the async function
  resolver: Resolver, // a Resolver object is provided to the function - see below
) => any // ResultResolverController
```

#### Resolver

The `Resolver` is a function object passed to the `AsyncFn` and it's used to return either a `result` or an `error`:

```typescript
{
  (result: any):any
  result: (result: any)=>any
  error: (error: any)=>any
}
```

A simple way to type a `Resolver` is using the provided type `Resolver<ResultFn, ErrorFn>` - note `ErrorFn` is optional e.g.:

```typescript
import type { Resolver } from '....'
const asyncFn = (
  x: string,
  resolver: Resolver<(output: string) => void, (error: Error) => void>,
) => {
  resolver('...') // or
  resolver.result('...') // or
  resolver.error(new Error('...')) // or
}
```

#### ChainNode

Adding `AsyncFn`s to the chain, creates a new `ChainNode`. ChainNodes can have other AsyncFns added, and can be awaited, or trap upstream errors.

```typescript
{
  // function to add additional AsyncFns to the chain
  ( asyncFns: [AsyncFn, ...AsyncFn[]] ): ChainNode

  // Symbol('Chain Node')
  type: chainNodeType

  // captures all downstream errors and prevents error bubbling to
  // for example an errorCb in await.
  // all errors effectively halt the execution of the rest
  // of the chain.
  onError(callback: (finalError: any)=>any): ChainNode

  // awaits a chain
  await(
    input: any,
    resultCb: (finalResult: any)=>any,
    errorCb?: (finalError: any)=>any,
  ): AwaitedChainController

  // converts the chain into a AsyncFn, which can then
  // be spliced, or added into other chains.
  readonly asyncFn: (input:any, resolver: Resolver)=>any
}
```

#### AwaitedChainController

An object that contains the `ResultResolverController` of the current asynchronously executing `AsyncFn`. `ResultResolverControllers` are mostly not used and set to `void`. However they can be used to provide a mechanism to communicate with the currently executing `AsyncFn` - for example one could implement `cancel` or `currentStatus` functionality.

```typescript
{
  controller: any
}
```

## EnhancedChain Overview

`EnhancedChain`, is built on top of `Chain` and provides additional functionality including:

1. can be converted into a promise, via the `.input(startInput:any): Promise<any>` method
2. synchronous functions can be added to the chain via `.sync(...syncFunctions: (input:any)=>any[]): EnhancedChainNode`

And the following options can be specified:

1. `thrownErrorToErrorCb` - any errors thrown are routed to the `errorCb`. default is `true`
2. `enforceSingleResolution` - a resolver may be called once - any subsequent calls throw an error. default is `true`
3. `forceAsync` - all `ValidAsync` calls can be wrapped in `setImmediate` | `nextTick` | `queueMicrotask` - the default is `none`
4. `resolveReturnedPromises` any promises returned via a resolver are resolved, before being passed on. default is `true` - note typing for this not yet properly implement!
5. `callbacks` - chain execution can be tracked via a range of callbacks/

### Example Usage

```typescript
import { enhancedChain } from '...'
import type { Resolver } from '...'

const eChainy = enhancedChain(
  {
    callbacks: { afterChainResolved: () => console.log('chain resolved') },
  },
  (x: 'start', resolve: Resolver<(arg: 'A') => void>) => {
    console.log(x) // 'start'
    resolve('A')
  },
).sync(
  (x: 'A') => 'B' as const,
  (x: 'B') => new Promise((resolve) => resolve('C')),
)

const eChainyMore = eChainy((x: 'C', resolve: Resolver<(arg: 'done') => void>) => {
  console.log(x) // 'C'
  resolve('done' as const)
})

eChainy.input('start').then((result) => {
  console.log(result) // 'C'
})

eChainyMore.await('start', (result) => {
  console.log(result) // 'done'
  done(undefined)
})
```

### enhancedChain

```typescript
enhancedChain( options: EnhanceChainOptions, ...asyncFns: AsyncFn[] ) => EnhancedChainNode
```

#### EnhanceChainOptions

```typescript
{
    thrownErrorToErrorCb?: boolean;
    enforceSingleResolution?: boolean;
    forceAsync?: 'setImmediate' | 'nextTick' | 'queueMicrotask' | 'none';
    resolveReturnedPromises?: boolean;
    callbacks?: {
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
    };
}
```

#### EnhancedChainNode

expands `ChainNode` by addition of the following methods:

```typescript
{
  // function to add additional synchronous functions to the chain
  sync( ...syncFns: [syncFn, ...syncFn[]] ): EnhancedChainNode

  // returns a Promise of the EnhancedChain
  input(inputArg: any): Promise(any)

  // Symbol('Enhanced Chain Node')
  type: enhancedChainNodeType

  ...see ChainNode
}
```

## Compose Overview

Composes multiple functions, into a single function. Equivalent to `(arg)=>fn3(fn2(fn1(arg)))`

### Example Usage

```typescript
import { compose } from '...'
const fn = compose(
  (a: string) => `${a}:A`,
  (a: string) => `${a}:B`,
)
console.log(fn('start')) //`start:A:B`
```

### ComposeWithError

Composes multiple function of the form (input)=>[error]|[undefined,result] into a single function, which stops executing if any function returns an error.

### Example Usage

```typescript
const fn = composeWithError(
  (a: 'start'): ResultError<'eA', 'A'> => [undefined, `A:${a}` as 'A'],
  (a: 'A'): ResultError<'eB', 'B'> => [undefined, `B:${a}` as 'B'],
)
const [error, result] = fn('start' as const)
expect(result).toEqual('B:A:start')
expect(error).toEqual(undefined)
```

### Pipe

`pipe(input,fn1,fn2)` is equivalent to `compose(fn1,fn2)(input)`

## Compositor Overview

An object to streamline function composition

### Example Usage

```typescript
import { compositor } from '...'

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

// an empty compositor returns whatever it is called with
console.log(compositor().call('hello')) // hello

// effects are functions added to the composition, but
// which don't impact the composition calculation.
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
```

### compositor

```typescript
{
  // add functions to the compositor
  (...fns: [(input: any) => any, ...((input: any) => any)[]]): Compositor
  // creates and returns the composed function
  call(input:any): any
  /**
   * utility to add functions that take no input, and return no output
   * but to run them in sequence in the chain - useful for example to fire events,
   * or notifiers.
   */
  addEffects(...effects: [() => void, ...(() => void)[]]): Compositor
}
```

## AsyncCoupler Overview

Enables the coupling of two async callbacks: `incomingCallback` and `outgoingCallback` - which methods can be renamed as require. The callbacks may be added in any sequence and are enqueued.

Once both callbacks have been added: `outgoingCallback(incomingCallback)` is called. Optionally, instead of FIFO, a manual index may be specified causing callbacks to be made in index order.

`asyncCouplerWorkAround` provides a DRY'er way to specify the typings.

### Example Usage

```typescript
// default asyncCoupler has `addOutgoingCallback` and `addIncomingCallback` methods
const coupler = asyncCoupler<(result: number) => void>()
coupler.addOutgoingCallback((incomingCb) => incomingCb(1))
coupler.addIncomingCallback(
  (result) => console.log(result), // 1
)

// renaming methods
const cCoupler = asyncCoupler<
  (input: number) => void,
  {
    outgoingCallbackName: 'addA'
    incomingCallbackName: 'addB'
  }
>({
  outgoingCallbackName: 'addA',
  incomingCallbackName: 'addB',
})
cCoupler.addA((incomingCb) => incomingCb(1))
cCoupler.addB((result) => {
  console.log(result) // 1
  done(undefined)
})

// a workaround to reduce typing
const cCouplerA = asyncCouplerWorkAround({
  outgoingCallbackName: 'addA',
  incomingCallbackName: 'addB',
} as const)<(input: number) => void>()
cCouplerA.addA((incomingCb) => incomingCb(1))
cCouplerA.addB((result) => {
  console.log(result) // 1
  done(undefined)
})
```

## AsyncFnsInParallel

AsyncFnsInParallel executes asynchronous functions in parallel. Similar to, but simpler than `Promise.all`and more performant.

Asynchronous functions take the form:

```typescript
;(input: any, resolver: AsyncFnResolver) => controller
```

### Example Usage

```typescript
import { asyncFnsInParallel } from '...'
import type { AsyncFnResolver } from '...'

const parallelFns = asyncFnsInParallel(
  (a: 1, resolver: AsyncFnResolver<(value: 1) => void>) =>
    setTimeout(() => resolver((a * 1) as 1), 100),
  (a: 1, resolver: AsyncFnResolver<(value: 2) => void>) =>
    setTimeout(() => resolver((a * 2) as 2), 100),
)
parallelFns.await(1, (results) => {
  console.log(results) // [1,2]
})
```

#### asyncFnsInParallel

```typescript
asyncFnsInParallel( ...asyncFns: [AsyncFnAny, ...AsyncFnAny[]]) =>{
    await: (
      input: Input,
      resultCb: (resultArray: ResultsArray) => void,
      errorCb?: (errorArray: ErrorsArray, resultArray: ResultsArray) => void,
    )=>AsyncFnsInParallelController
    promise: (input: any)=>Promise<any>
}
```

#### AsyncFnsInParallelController

```typescript
{
    state:  'awaited' | 'halted' | 'done' | 'error'
    // all controllers that are not undefined.
    controllers: Controllers[]
    resultQueue: [...results:any[]][]
    errorQueue: [...errorArgs:any[]][]
    controllerQueue: Controllers[]
    // halts the AsyncFnsInParallel and no resultCb or errorCb will be made
    // useful if one wants to cancel the `AsyncFnsInParallel`.
    halt():void
}
```

#### AsyncFnResolver

A simple way to type a `Resolver` is using the provided type `AsyncFnResolver<ResultFn, ErrorFn>` - note `ErrorFn` is optional e.g.:

```typescript
import type { Resolver } from '....'
const AsyncFn = (
  x: string,
  resolver: AsyncFnResolver<(output: string) => void, (error: Error) => void>,
) => {
  resolver('...') // or
  resolver.result('...') // or
  resolver.error(new Error('...')) // or
}
```

## Difference

Finds the set of all elements in the first array not contained in the second array (i.e. non duplicated items).

Note: typing is not battle tested and so unexpected edge cases may exist

### Example Usage

```typescript
const u1 = difference([1, 2, 3, 4] as const, [7, 6, 5, 4, 3] as const) //=> [1,2]
const u2 = difference([7, 6, 5, 4, 3] as const, [1, 2, 3, 4] as const) //=> [7,6,5]
const u3 = difference([7, 6, 5, 4, 3], [1, 2, 3, 4]) //=> [7,6,5] type: number[]
```

## Intersection

Given two arrays, intersection returns a set composed of the elements common to both arrays.

Note: typing is not battle tested and so unexpected edge cases may exist

### Example Usage

```typescript
const u1 = intersection([1, 2, 3, 4] as const, [7, 6, 5, 4, 3] as const) //=> [3,4]
const u2 = intersection([7, 6, 5, 4, 3] as const, [1, 2, 3, 4] as const) //=> [3,4]
const u3 = intersection([7, 6, 5, 4, 3] as const, [1, 2, 3, 4, 'a'] as const) //=> [3,4]
const u4 = intersection([7, 6, 5, 4, 3] as const, [1, 2, 3, 4]) //=> [3,4] type: number[]
const u5 = intersection([7, 6, 5, 4, 3] as const, [1, 2, 3, 4, 'a']) //=> [3,4] type: (string | number)[]
const u6 = intersection([7, 6, 5, 4, 3], [1, 2, 3, 4, 'a']) //=> [3,4] type: (string | number)[]
```

## EnhancedMap

Enhances javascript's `map` function

```typescript
<V>(...iterable: readonly V[]) => {
    /**
     * adds an item and an optional `key` can be supplied,
     * otherwise insertion order is used.
     * @returns a function that removes the added item from the map.
     */
    add(item: V, key?: number): () => boolean;
    /**
     * adds an array of item to the map.
     * @returns a function that removes all of the added item from the map.
     */
    addItems(...items: V[]): () => void;
    /**
     *
     * @param basedOnInsertionOrder whether to shift
     *             based on insertion order, or key order
     * @returns V|undefined
     */
    shift(basedOnInsertionOrder?: boolean): V | undefined;
    /**
     * sets the item at `key`
     */
    set(key: number, value: V): any;
    /**
     * count of the total number of items added to the queue
     */
    readonly countOfItemsAdded: number;
    reduce<U>(callbackfn: (previousValue: U, currentValue: V, currentKey: number, index: number) => U, initialValue: U, reverseOrder?: boolean): U;
    map<U>(callbackfn: (value: V, key: number) => U, reverseOrder?: boolean): U[];
    clear(): void;
    delete(key: number): boolean;
    forEach(callbackfn: (value: V, key: number) => void, thisArg?: any): void;
    get(key: number): V | undefined;
    has(key: number): boolean;
    [Symbol.iterator](): IterableIterator<[number, V]>;
    readonly [Symbol.toStringTag]: string;
    readonly entries: IterableIterator<[number, V]>;
    readonly keys: IterableIterator<number>;
    readonly values: IterableIterator<V>;
    readonly size: number;
}
```

## OutputPins

A function that creates an object which provides convenient ways to route an outcome.

```typescript
const exampleResultErrorGenerator = outputPins<
  { result: [result: 'RESULT']; error: [error: Error]; cancel: [cancelReason: 'CANCEL'] },
  'result'
>('result', 'error', 'cancel')
type OutputError = OutputPinGetter<
  { result: [result: 'RESULT']; error: [error: Error]; cancel: [cancelReason: unknown] },
  'error'
>
type OutputCancel = OutputPinGetter<
  { result: [result: 'RESULT']; error: [error: Error]; cancel: [cancelReason: unknown] },
  'cancel'
>

type OutputResult = OutputPinGetter<
  { result: [result: 'RESULT']; error: [error: Error]; cancel: [cancelReason: unknown] },
  'result'
>
const fn = (error: boolean) => {
  const returnResult = exampleResultErrorGenerator()
  // eslint-disable-next-line no-constant-condition
  if (false) return returnResult.cancel('CANCEL')
  return error ? returnResult.error(new Error('error')) : returnResult('RESULT')
}
const results = fn(true)
if (results.isError()) throw (results as OutputError).error
if (results.isCancel()) throw (results as OutputCancel).cancel
console.log(results()) // 'RESULT'
console.log(results.isResult())
console.log((results as OutputResult).result)
```

### resultNone

Inspired by the `maybe` monad, this function returns a function object, that can have either a `result` or a `none` set.

```typescript
const fn = (error: boolean) => {
  const returnResult = resultNone<'RESULT', null>()
  return error ? returnResult.none(null) : returnResult('RESULT')
}
const results = fn(false)
if (results.isNone()) throw new Error('null')
console.log(results()) // 'RESULT'
console.log((results as ResultNone<'RESULT', null, 'result'>).result) // 'RESULT'
```

## RresultError

Inspired by the `either` monad, means functions take the form `(...args)=>[error,undefined]|[undefined,result]`

```typescript
type ResultError<E, R> = [error: E, result?: undefined] | [error: undefined, result: R]
```

### toError

converts error into [error, undefined]

```typescript
function toError<T>(error: T): [T, undefined]
```

### toResult

converts result into [undefined, result]

```typescript
function toResult<T>(result: T): [undefined, T]
```

### isResult

tests if a `ResultError` is a `result`

```typescript
function isResult<E, R>(output: ResultError<E, R>): output is [error: undefined, result: R]
```

### isError

tests if a `ResultError` is a `error`

```typescript
function isError<E, R>(output: ResultError<E, R>): output is [error: E, result: undefined]
```

### resultErrorToResultNever

Unwraps a `ResultError` throwing any `Error`, or returning the `Result`

```typescript
function resultErrorToResultNever(fn: (...args) => ResultError): (...args) => Result
```

### resultNeverToResultError

Converts a function that may throw, to a `ResultError`, by `try` `catching` any errors.

```typescript
function resultNeverToResultError<A extends unknown[], R>(
  fn: (...args: A) => R,
): (...args: A) => ResultError<unknown, R>
```

### onlyExecuteOnResult

Takes as input a function `fn` which has one input returning a `ResultError` and returns a new function which takes one input of type `ResultError` and if that is an error then it returns the `ResultError`, and if it is a result it executes and returns `fn` with the result

Useful for chaining together functions which return `ResultError`

```typescript
function onlyExecuteOnResult<E1, R1, E2, R2>(
  fn: (input: R1) => ResultError<E2, R2>,
): ([error, result]: ResultError<E1, R1>) => ResultError<E1 | E2, R2>
```

## Other utilities

- didError

  ```typescript
  const fn = (error: boolean) => {
    const output = didError<Error>()
    return error ? output.error(new Error('ERROR')) : output()
  }
  const results = fn(true)
  if (results.isError()) console.log((results as DidError<Error, true>).errorValue()) // Error('ERROR')
  expect((results as DidError<Error, true>).errorValue()).toBeInstanceOf(Error)
  ```

- wrapTryCatchInDidError

  ```typescript
  const fn = wrapTryCatchInDidError((error: boolean) => {
    if (error) throw new Error('ERROR')
  })
  const results = fn(true)
  if (results.isError()) console.log((results as DidError<Error, true>).errorValue()) // Error('ERROR')
  expect((results as DidError<Error, true>).errorValue()).toBeInstanceOf(Error)
  ```

- times

  ```typescript
  console.log(times(50, (previousResult) => previousResult + 1, 10)) // 60
  ```

- runFunctionsOnlyOnce

  ```typescript
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
  fn2() // throws cannot call 'fn2' after calling 'fn1'
  ```

- validateFn

  ```typescript

  ```

- requireValue

  ```typescript
  const fn = requireValue((x: any) => x)
  console.log(fn('a'))
  fn() // throws this function requires a value
  ```

- callbackTee

- reverseForEach

- createUid

- methodOnlyOnce

- validObjects

- capitaliseWords, capitalise

  ```typescript
  const x = capitalise('cat') // 'Cat'
  const y = capitaliseWords('cat dog') // 'Cat Dog'
  ```

- isObjectAndHasExecutableProperty

- isGetter

- isSetter

- isValue

- isFunction
