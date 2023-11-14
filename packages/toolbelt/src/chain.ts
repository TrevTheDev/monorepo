/* eslint-disable @typescript-eslint/no-explicit-any */
export const chainNodeType = Symbol('Chain Node')

type ResultCb<Result = any, ResultCbController = any> = (result: Result) => ResultCbController
type ErrorCb<error = any, ErrorCbController = any> = (error: error) => ErrorCbController

export type AwaitedChainController<AccumulatedAsyncFnController> = {
  controller: AccumulatedAsyncFnController | undefined
}

type ChainNodeGenerics = {
  output: unknown
  error: unknown
  resultResolverController: unknown
}

export type ChainGenerics = {
  input: unknown
  errorResolverController: unknown
  accumulatedErrors: unknown
  accumulatedResultResolverControllers: unknown
  lastNode: ChainNodeGenerics
}

type AsyncFn<PreviousChain extends ChainGenerics, Chain extends ChainGenerics> = (
  input: PreviousChain['lastNode']['output'],
  resolver: Resolver<
    ResultCb<Chain['lastNode']['output'], Chain['lastNode']['resultResolverController']>,
    [Chain['errorResolverController']] extends [never]
      ? never
      : ErrorCb<Chain['lastNode']['error'], Chain['errorResolverController']>
  >,
) => PreviousChain['lastNode']['resultResolverController']

type ChainNodeResultCb<
  Node extends {
    output: unknown
    resultResolverController: unknown
  },
> = ResultCb<Node['output'], Node['resultResolverController']>

type ChainNodeErrorCb<Chain extends ChainGenerics> = ErrorCb<
  Chain['lastNode']['error'],
  Chain['errorResolverController']
>

type AccumulatedErrorCb<Chain extends ChainGenerics> = ErrorCb<
  Chain['accumulatedErrors'],
  Chain['errorResolverController']
>

type ResultCall<Chain extends ChainGenerics> = <
  const T extends [ValidAsyncFn, ...ValidAsyncFn[]],
  RT extends AsyncFunctionChainArrayType = AsyncFunctionChainArray<T, Chain>,
>(
  ...asyncFunctions: T & RT['asyncFns']
) => ChainNode<RT['lastChain']>

/**
 * the use of `any` is a hack required due to:
 * https://stackoverflow.com/questions/74229462/how-to-enforce-type-compliance-on-callback-parameters
 */
type ValidResolver = {
  (result: any): any
  result(result: any): any
  error?(error: any): any
}

export type Resolver<
  ResultFn extends ResultCb,
  ErrorFn extends ErrorCb = never,
  RT extends ValidResolver = (
    [ErrorFn] extends [never]
      ? {
          (result: Parameters<ResultFn>[0]): ReturnType<ResultFn>
          result: ResultFn
        }
      : {
          (result: Parameters<ResultFn>[0]): ReturnType<ResultFn>
          result: ResultFn
          error: ErrorFn
        }
  ) extends infer O extends ValidResolver
    ? O
    : never,
> = RT

export type ValidAsyncFn = (input: any, resolver: any) => any
// | ((input: any, resolver: any) => unknown)

export type AsyncFunc<
  Input,
  ResultCallback extends ResultCb,
  ErrorCallback extends ErrorCb,
  Returned,
  RT extends ValidAsyncFn = ((
    input: Input,
    resolver: Resolver<ResultCallback, ErrorCallback>,
  ) => Returned) extends infer O extends ValidAsyncFn
    ? O
    : never,
> = RT

type InferAsyncFnBase = {
  input: unknown
  returnType: unknown
  resolver: unknown
  resultCb: ResultCb
  output: unknown
  resultResolverController: unknown
  errorCb: ErrorCb
  error: unknown
  errorResolverController: unknown
  asyncFn: ValidAsyncFn
  // constrainedAsyncFn: ValidAsyncFn
}

interface InferAsyncFn<
  T extends ValidAsyncFn,
  TResolver extends ValidResolver = Parameters<T>[1],
  ResultResolver extends ResultCb = TResolver['result'],
  ErrorResolver extends ErrorCb = TResolver extends { error: ErrorCb } ? TResolver['error'] : never,
  Input = T extends (input: infer I, ...args: any[]) => any ? I : never,
> extends InferAsyncFnBase {
  input: Input
  returnType: ReturnType<T>
  resolver: TResolver
  resultCb: ResultResolver
  output: Parameters<ResultResolver>[0]
  resultResolverController: ReturnType<ResultResolver>
  errorCb: ErrorResolver
  error: Parameters<ErrorResolver>[0]
  errorResolverController: ReturnType<ErrorResolver>
  asyncFn: T
}

export interface AsyncFunctionChainArrayType {
  asyncFns: [ValidAsyncFn, ...ValidAsyncFn[]]
  lastChain: ChainGenerics
  // firstChain: ChainGenerics
}
export interface AsyncFunctionChainArray<
  T extends [ValidAsyncFn, ...ValidAsyncFn[]],
  Chain extends ChainGenerics = InferAsyncFn<T[0]> extends infer O extends InferAsyncFnBase
    ? {
        input: O['input']
        errorResolverController: O['errorResolverController']
        accumulatedErrors: never
        accumulatedResultResolverControllers: O['returnType']
        lastNode: {
          output: O['input']
          error: never
          resultResolverController: never
        }
      }
    : never,
  RT = AsyncFunctionChainArray2<T, Chain>,
  AsyncFns extends [ValidAsyncFn, ...ValidAsyncFn[]] = RT extends {
    asyncFns: [ValidAsyncFn, ...ValidAsyncFn[]]
  }
    ? RT['asyncFns']
    : never,
  LastChain extends ChainGenerics = RT extends {
    lastChain: ChainGenerics
  }
    ? RT['lastChain']
    : never,
> extends AsyncFunctionChainArrayType {
  asyncFns: AsyncFns
  lastChain: LastChain
}

export type AsyncFunctionChainArray2<
  T extends [ValidAsyncFn, ...ValidAsyncFn[]],
  Chain extends ChainGenerics,
  NewT extends ValidAsyncFn[] = [],
  InferredT extends InferAsyncFnBase = InferAsyncFn<T[0]>,
  LastChain extends ChainGenerics = {
    input: Chain['input']
    errorResolverController: Chain['errorResolverController']
    accumulatedErrors: Chain['accumulatedErrors'] | InferredT['error']
    accumulatedResultResolverControllers:
      | Chain['accumulatedResultResolverControllers']
      | InferredT['resultResolverController']
    lastNode: {
      output: InferredT['output']
      error: InferredT['error']
      resultResolverController: InferredT['resultResolverController']
    }
  },
  ConstrainedT extends ValidAsyncFn = AsyncFunc<
    Chain['lastNode']['output'],
    ResultCb<InferredT['output'], InferredT['resultResolverController']>,
    [InferredT['error']] extends [never]
      ? never
      : ErrorCb<InferredT['error'], LastChain['errorResolverController']>,
    InferredT['returnType']
  >,
  Tail extends [ValidAsyncFn, ...ValidAsyncFn[]] = T extends [
    any,
    ...infer O extends [ValidAsyncFn, ...ValidAsyncFn[]],
  ]
    ? O
    : never,
  AsyncFns extends ValidAsyncFn[] = [...NewT, ConstrainedT],
> = [Tail] extends [never]
  ? {
      asyncFns: AsyncFns
      lastChain: LastChain
    }
  : AsyncFunctionChainArray2<Tail, LastChain, AsyncFns>

type Await<
  Chain extends ChainGenerics,
  Type extends 'external' | 'internal',
> = Type extends 'internal'
  ? (
      input: Chain['input'],
      resultCb: ChainNodeResultCb<Chain['lastNode']>,
      errorCb: ChainNodeErrorCb<Chain>,
      controller: AwaitedChainController<Chain['lastNode']['resultResolverController']>,
    ) => AwaitedChainController<Chain['lastNode']['resultResolverController']>
  : [Chain['errorResolverController']] extends [never]
  ? (
      input: Chain['input'],
      resultCb: ChainNodeResultCb<Chain['lastNode']>,
    ) => AwaitedChainController<Chain['accumulatedResultResolverControllers']>
  : (
      input: Chain['input'],
      resultCb: ChainNodeResultCb<Chain['lastNode']>,
      errorCb: AccumulatedErrorCb<Chain>,
    ) => AwaitedChainController<Chain['accumulatedResultResolverControllers']>

// export interface SharedProperties<Chain extends ChainGenerics> {

// }

export interface ChainNode<Chain extends ChainGenerics> extends ResultCall<Chain> {
  type: typeof chainNodeType
  onError(callback: AccumulatedErrorCb<Chain>): this
  await: Await<Chain, 'external'>
  readonly asyncFn: (
    input: Chain['input'],
    resolver: Resolver<
      (output: Chain['lastNode']['output']) => Chain['lastNode']['resultResolverController'],
      [Chain['errorResolverController']] extends [never]
        ? never
        : (error: Chain['accumulatedErrors']) => Chain['errorResolverController']
    >,
  ) => Chain['accumulatedResultResolverControllers']
}

/* ***************************************************************************************************************************************************************
 *****************************************************************************************************************************************************************
 *****************************************************************************************************************************************************************
 *****************************************************************************************************************************************************************
 *****************************************************************************************************************************************************************
 *****************************************************************************************************************************************************************
 *****************************************************************************************************************************************************************
 *****************************************************************************************************************************************************************
 *****************************************************************************************************************************************************************
 */

let newNode: <PreviousChain extends ChainGenerics, Chain extends ChainGenerics>(
  asyncFn: AsyncFn<PreviousChain, Chain>,
  parentAwaitFn: Await<PreviousChain, 'internal'>,
) => ChainNode<Chain>

function getResultCall<Chain extends ChainGenerics>(
  awaitFn: Await<Chain, 'internal'>,
): ResultCall<Chain>
function getResultCall(awaitFn) {
  function resultCallFn(...asyncFunctions: ValidAsyncFn[]) {
    if (asyncFunctions.length === 0) throw new Error('async functions required')
    const asyncFn = asyncFunctions.shift() as ValidAsyncFn
    const nextNode = newNode(asyncFn, (arg, resultCb, errorCb, controller) =>
      awaitFn(arg, resultCb, errorCb, controller),
    )
    const rv = asyncFunctions.length === 0 ? nextNode : (nextNode as any)(...asyncFunctions)
    return rv
  }
  return resultCallFn
}

function addSharedProperties<Chain extends ChainGenerics>(
  fn: ResultCall<Chain>,
  awaitFn: Await<Chain, 'internal'>,
  errorNodeFn: typeof errorNode<Chain>,
): ChainNode<Chain> {
  const chainNode = Object.defineProperties(fn as ChainNode<Chain>, {
    type: { value: chainNodeType, writable: false },
    await: {
      value: (arg, resultCb, errorCb?) =>
        awaitFn(
          arg,
          resultCb,
          errorCb ||
            (() => {
              throw new Error('error callback made without an error handler being provided')
            }),
          { controller: undefined },
        ),
      writable: false,
    },
    onError: {
      value: (errorCb) => errorNodeFn(awaitFn, errorCb),
      writable: false,
    },

    asyncFn: {
      get() {
        return (
          input: Chain['input'],
          resolver: {
            result: (
              resultOut: Chain['lastNode']['output'],
            ) => Chain['lastNode']['resultResolverController']
            error?: (errors: Chain['accumulatedErrors']) => Chain['errorResolverController']
          },
        ) =>
          chainNode.await(
            input,
            (result) => resolver.result(result),
            (error) =>
              (
                resolver.error as (
                  errors: Chain['accumulatedErrors'],
                ) => Chain['errorResolverController']
              )(error),
          )
      },
    },
  })
  return chainNode as unknown as ChainNode<Chain>
}

const errorNode = <Chain extends ChainGenerics>(
  parentAwaitFn: Await<Chain, 'internal'>,
  upstreamErrorCb: ChainNodeErrorCb<Chain>,
): ChainNode<Chain> => {
  const awaitFn: Await<Chain, 'internal'> = (
    arg,
    resultCb,
    _errorCb, // TODO: consider adding error bubbling
    controller,
  ) => parentAwaitFn(arg, resultCb, upstreamErrorCb, controller)
  return addSharedProperties<Chain>(getResultCall<Chain>(awaitFn), awaitFn, errorNode)
}

newNode = function NewNode<PreviousChain extends ChainGenerics, Chain extends ChainGenerics>(
  asyncFn: AsyncFn<PreviousChain, Chain>,
  parentAwaitFn: Await<PreviousChain, 'internal'>,
) {
  const awaitFn: Await<Chain, 'internal'> = (input, resultCb, errorCb, controller) => {
    const execute = (inputArg: Chain['input'] | PreviousChain['lastNode']['output']) => {
      function resolverFn(resultArg: Chain['lastNode']['output']) {
        return (resolverFn as ValidResolver).result(resultArg)
      }
      Object.defineProperties(resolverFn, {
        result: {
          value: (resultArg: Chain['lastNode']['output']) => {
            controller.controller = undefined
            const res = resultCb(resultArg)
            controller.controller = res
            return res
          },
          writable: false,
        },
        error: {
          value: (errorArg: Chain['lastNode']['error']) => {
            if (errorCb) return errorCb(errorArg)
            throw new Error('error called, but no ErrorCb was provided')
          },
          writable: false,
        },
      })

      return asyncFn(inputArg, resolverFn as any)
    }
    return parentAwaitFn(
      input,
      execute,
      errorCb as unknown as ChainNodeErrorCb<PreviousChain>,
      controller,
    )
  }
  const x = getResultCall<Chain>(awaitFn)
  const xy = addSharedProperties<Chain>(x, awaitFn, errorNode)
  return xy
}

/**
 * A fast, simple, typed way to chain together asynchronous functions - with the output of each function acting as the input to the subsequent function.
 * If an error is returned by a function in the chain, that effectively ends any further processing of the chain.
 * An `await`ed chain returns an `AwaitedChainController` - which can be used to communicate with the 
 * currently executing function, including for example implementing a cancel ability.
 * 
 * ### Example Basic Usage

```typescript
// function to generate dummy asynchronous functions
function addChar<
  T extends string, C extends string
>(c: C) {
  return (x: T, resolver: Resolver<(result: `${C}:${T}`) => void>) =>
    resolver(`${c}:${x}` as `${C}:${T}`)
}

// adds three asynchronous functions to the chain
const fooChain = chain(
  addChar<'start', 'A'>('A'),
  addChar<'A:start', 'B'>('B'),
  addChar<'B:A:start', 'C'>('C'),
)
// adds a further three asynchronous functions to the chain
const fooBarChain = fooChain(
  addChar<'C:B:A:start','A'>('A'),
  addChar<'A:C:B:A:start','B'>('B'),
  addChar<'B:A:C:B:A:start','C'>('C'),
)
// awaits chain of asynchronous functions
fooBarChain.await('start', (result) => {
  expect(result).toEqual('C:B:A:C:B:A:start')
})
```

 * @param asyncFunctions 
 * @returns a potentially asynchronous function
 */
function chain<
  const T extends [ValidAsyncFn, ...ValidAsyncFn[]],
  ValidT extends AsyncFunctionChainArrayType = AsyncFunctionChainArray<T>,
>(...asyncFunctions: T & ValidT['asyncFns']): ChainNode<ValidT['lastChain']> {
  const rCall = getResultCall((input, resolver) => resolver(input) as any) as any
  const rv = rCall(...(asyncFunctions as unknown as [ValidAsyncFn, ...ValidAsyncFn[]]))
  return rv as unknown as ChainNode<ValidT['lastChain']>
}

export default chain

// const coupler = () => {
//   let resultCb: (...args) => any
//   let result: any
//   let counter = 0
//   let resolver
//   const len = 2
//   const obj = {
//     resultCb(
//       resCb: (input: any, resolver: { result: (result: any) => any }) => any,
//       resolver_: any,
//     ) {
//       resultCb = resCb
//       resolver = resolver_
//       counter += 1
//       obj.resultCb === undefined
//       if (counter === len) resultCb(result, resolver)
//       return resolver
//     },
//     result(res: any) {
//       result = res
//       counter += 1
//       if (counter === len) return resultCb(result, resolver)
//     },
//   }
//   return obj
// }
