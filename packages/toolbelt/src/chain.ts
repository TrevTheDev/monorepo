/* eslint-disable @typescript-eslint/no-explicit-any */
import { IsStrictAny, Lookup, RMerge } from './typescript utils'

export const chainNodeType = Symbol('Chain Node')

type ResultCb<
  Result = any,
  ResultCbController = unknown,
  RT = (result: Result) => ResultCbController,
> = RT

type ErrorCb<
  Error = any,
  ErrorCbController = unknown,
  RT = (error: Error) => ErrorCbController,
> = RT

export type AwaitedChainController<AccumulatedAsyncFnController> = {
  controller: AccumulatedAsyncFnController | undefined
}

type ChainNodeGenerics = {
  Output: unknown
  Error: unknown
  ResultResolverController: unknown
}

export type ChainGenerics = {
  Input: unknown
  ErrorResolverController: unknown
  AccumulatedErrors: unknown
  AccumulatedResultResolverControllers: unknown
  LastNode: ChainNodeGenerics
}

export type Resolver<ResultFn extends ResultCb, ErrorFn extends ErrorCb = never> = [
  ErrorFn,
] extends [never]
  ? {
      (result: Parameters<ResultFn>[0]): ReturnType<ResultFn>
      result: ResultFn
    }
  : {
      (result: Parameters<ResultFn>[0]): ReturnType<ResultFn>
      result: ResultFn
      error: ErrorFn
    }

type AsyncFn<PreviousChain extends ChainGenerics, Chain extends ChainGenerics> = [
  Chain['ErrorResolverController'],
] extends [never]
  ? (
      input: PreviousChain['LastNode']['Output'],
      resolver: Resolver<
        ResultCb<Chain['LastNode']['Output'], Chain['LastNode']['ResultResolverController']>
      >,
    ) => PreviousChain['LastNode']['ResultResolverController']
  : (
      input: PreviousChain['LastNode']['Output'],
      resolver: Resolver<
        ResultCb<Chain['LastNode']['Output'], Chain['LastNode']['ResultResolverController']>,
        ErrorCb<Chain['LastNode']['Error'], Chain['ErrorResolverController']>
      >,
    ) => PreviousChain['LastNode']['ResultResolverController']

type ChainNodeResultCb<
  Node extends {
    Output: unknown
    ResultResolverController: unknown
  },
> = ResultCb<Node['Output'], Node['ResultResolverController']>

type ChainNodeErrorCb<Chain extends ChainGenerics> = ErrorCb<
  Chain['LastNode']['Error'],
  Chain['ErrorResolverController']
>

type AccumulatedErrorCb<Chain extends ChainGenerics> = ErrorCb<
  Chain['AccumulatedErrors'],
  Chain['ErrorResolverController']
>

export type ResultCallTypes<
  Chain extends ChainGenerics,
  T extends [ValidAsyncFn, ...ValidAsyncFn[]],
  ValidT_ = AsyncFunctionChainArray<T, Chain>,
  ValidT extends {
    FirstChain: ChainGenerics
    LastChain: ChainGenerics
    AsyncFns: [ValidAsyncFn, ...ValidAsyncFn[]]
  } = ValidT_ extends {
    FirstChain: ChainGenerics
    LastChain: ChainGenerics
    AsyncFns: [ValidAsyncFn, ...ValidAsyncFn[]]
  }
    ? ValidT_
    : never,
  NewChain extends ChainGenerics = ValidT['LastChain'],
  Res extends {
    NewChain: ChainGenerics
    ValidatedAsyncFns: [ValidAsyncFn, ...ValidAsyncFn[]]
    FirstChain: ChainGenerics
  } = {
    NewChain: NewChain
    ValidatedAsyncFns: ValidT['AsyncFns']
    FirstChain: ValidT['FirstChain']
  },
> = Res

type ResultCall<Chain extends ChainGenerics> = {
  <
    T extends [ValidAsyncFn, ...ValidAsyncFn[]],
    RT extends {
      NewChain: ChainGenerics
      ValidatedAsyncFns: [ValidAsyncFn, ...ValidAsyncFn[]]
    } = ResultCallTypes<Chain, T> extends {
      NewChain: ChainGenerics
      ValidatedAsyncFns: [ValidAsyncFn, ...ValidAsyncFn[]]
    }
      ? ResultCallTypes<Chain, T>
      : never,
  >(
    ...asyncFunctions: T & RT['ValidatedAsyncFns']
  ): ChainNode<RT['NewChain']>
}

/**
 * the use of `any` is a hack required due to:
 * https://stackoverflow.com/questions/74229462/how-to-enforce-type-compliance-on-callback-parameters
 */
type ValidResolver =
  | {
      (result: any): any
      result: (result: any) => any
      error: (error: any) => any
    }
  | {
      (result: any): any
      result: (result: any) => any
    }
  | any

export type ValidAsyncFn = (input: any, resolver: ValidResolver) => unknown
// | ((input: any, resolver: any) => unknown)

export type AsyncFunc<
  Input,
  ResultCallback extends ResultCb,
  ErrorCallback extends ErrorCb,
  Returned,
  ResolverType extends ValidResolver = Resolver<ResultCallback, ErrorCallback>,
  RT extends ValidAsyncFn = (input: Input, resolver: ResolverType) => Returned,
> = RT

type InferAsyncFnBase = {
  Input: unknown
  ReturnType: unknown
  Resolver: unknown
  ResultCb: ResultCb
  Output: unknown
  ResultResolverController: unknown
  ErrorCb: ErrorCb
  Error: unknown
  ErrorResolverController: unknown
  AsyncFn: unknown
  ConstrainedAsyncFn: ValidAsyncFn
}

type InferAsyncFn<
  T extends ValidAsyncFn,
  TResolver = T extends (input: any, resolver: infer R) => any ? R : never,
  ResultResolver extends ResultCb<any, any> = TResolver extends {
    result: infer R extends ResultCb<any, any>
  }
    ? R
    : never,
  ErrorResolver extends ErrorCb<any, any> = TResolver extends {
    error: infer E extends ErrorCb<any, any>
  }
    ? E
    : never,
  Input = T extends (input: infer I, ...args: any[]) => any ? I : never,
  ConstrainedAsyncFn extends ValidAsyncFn = [IsStrictAny<TResolver>] extends [never]
    ? AsyncFunc<Input, ResultResolver, ErrorResolver, ReturnType<T>>
    : AsyncFunc<Input, ResultCb<any, any>, ErrorCb<any, any>, ReturnType<T>>,
  Output = Parameters<ResultResolver>[0],
  Error = Parameters<ErrorResolver>[0],
> = {
  Input: Input
  ReturnType: ReturnType<T>
  Resolver: TResolver
  ResultCb: ResultResolver
  Output: Output
  ResultResolverController: ReturnType<ResultResolver>
  ErrorCb: ErrorResolver
  Error: Error
  ErrorResolverController: ReturnType<ErrorResolver>
  ConstrainedAsyncFn: ConstrainedAsyncFn
  AsyncFn: T
}

type ConstrainAsyncFn<
  T extends InferAsyncFnBase,
  Input,
  ResultResolverController,
  ErrorResolverController,
  ConstrainedAsyncFn extends ValidAsyncFn = [IsStrictAny<T['Resolver']>] extends [never]
    ? AsyncFunc<
        Input,
        T['ResultCb'],
        [T['ErrorCb']] extends [never] ? never : ErrorCb<T['Error'], ErrorResolverController>,
        ResultResolverController
      >
    : AsyncFunc<Input, ResultCb<any, any>, ErrorCb<any, any>, ResultResolverController>,
> = IsStrictAny<T, RMerge<[T, { ConstrainedAsyncFn: ConstrainedAsyncFn }]>>

type ConstrainAsyncFnBaseOnFirstNode<T extends InferAsyncFnBase> = ConstrainAsyncFn<
  T,
  T['Input'],
  T['ReturnType'],
  T['ErrorResolverController']
>

type ConstrainAsyncFnBasedOnParent<
  T extends InferAsyncFnBase,
  ParentT extends InferAsyncFnBase,
  ErrorResolverController,
> = ConstrainAsyncFn<
  T,
  ParentT['Output'],
  ParentT['ResultResolverController'],
  ErrorResolverController
>

type InferAccumulatedChainTypes<
  T extends [InferAsyncFnBase, ...InferAsyncFnBase[]],
  ErrorsOnly = {
    [P in Exclude<keyof T, keyof any[]>]: T[P] extends InferAsyncFnBase ? T[P]['Error'] : never
  },
  ResolverZero = T[0]['ReturnType'],
  ResultResolversOnly = {
    [P in Exclude<keyof T, keyof any[]>]: T[P] extends InferAsyncFnBase
      ? T[P]['ResultResolverController']
      : never
  },
> = {
  AccumulatedErrors: ErrorsOnly[keyof ErrorsOnly]
  AccumulatedResultResolverControllers:
    | ResolverZero
    | ResultResolversOnly[keyof ResultResolversOnly]
}

export type AsyncFunctionChainArray<
  T extends [ValidAsyncFn, ...ValidAsyncFn[]],
  Chain extends ChainGenerics,
  InferredT extends [InferAsyncFnBase, ...InferAsyncFnBase[]] = {
    [I in keyof T]: InferAsyncFn<T[I]>
  } extends [InferAsyncFnBase, ...InferAsyncFnBase[]]
    ? { [I in keyof T]: InferAsyncFn<T[I]> }
    : never,
  ConstrainedFirstNode extends InferAsyncFnBase = [Chain] extends [never]
    ? ConstrainAsyncFnBaseOnFirstNode<InferredT[0]>
    : ConstrainAsyncFn<
        InferredT[0],
        Chain['LastNode']['Output'],
        Chain['LastNode']['ResultResolverController'],
        Chain['ErrorResolverController']
      >,
  TailInferredT extends InferAsyncFnBase[] = InferredT extends [any, ...infer P] ? P : never,
  UpdatedInferredT extends [InferAsyncFnBase, ...InferAsyncFnBase[]] = [
    ConstrainedFirstNode,
    ...TailInferredT,
  ],
  AccumulatedTypes extends {
    AccumulatedErrors: unknown
    AccumulatedResultResolverControllers: unknown
  } = InferAccumulatedChainTypes<UpdatedInferredT>,
  ConstrainedTail extends InferAsyncFnBase[] = {
    [I in keyof TailInferredT]: ConstrainAsyncFnBasedOnParent<
      TailInferredT[I],
      Lookup<UpdatedInferredT, I>,
      ConstrainedFirstNode['ErrorResolverController']
    >
  },
  ConstrainedT extends [InferAsyncFnBase, ...InferAsyncFnBase[]] = [
    ConstrainedFirstNode,
    ...ConstrainedTail,
  ],
  Last extends InferAsyncFnBase = ConstrainedT extends [...any, infer L extends InferAsyncFnBase]
    ? L
    : never,
> = {
  AsyncFns: {
    [I in keyof ConstrainedT]: ConstrainedT[I]['ConstrainedAsyncFn'] extends ConstrainedT[I]['AsyncFn']
      ? ConstrainedT[I]['AsyncFn'] extends ConstrainedT[I]['ConstrainedAsyncFn']
        ? ConstrainedT[I]['AsyncFn']
        : ConstrainedT[I]['ConstrainedAsyncFn']
      : ConstrainedT[I]['ConstrainedAsyncFn']
  }
  LastChain: [Chain] extends [never]
    ? {
        Input: ConstrainedFirstNode['Input']
        ErrorResolverController: ConstrainedFirstNode['ErrorResolverController']
        AccumulatedErrors: AccumulatedTypes['AccumulatedErrors']
        AccumulatedResultResolverControllers: AccumulatedTypes['AccumulatedResultResolverControllers']
        LastNode: {
          Output: Last['Output']
          Error: Last['Error']
          ResultResolverController: Last['ResultResolverController']
        }
      }
    : {
        Input: Chain['Input']
        ErrorResolverController: Chain['ErrorResolverController']
        AccumulatedErrors: Chain['AccumulatedErrors'] | AccumulatedTypes['AccumulatedErrors']
        AccumulatedResultResolverControllers:
          | Chain['AccumulatedResultResolverControllers']
          | AccumulatedTypes['AccumulatedResultResolverControllers']
        LastNode: {
          Output: Last['Output']
          Error: Last['Error']
          ResultResolverController: Last['ResultResolverController']
        }
      }
  FirstChain: ConstrainedFirstNode extends { Chain: ChainGenerics }
    ? ConstrainedFirstNode['Chain']
    : never
}

type Await<
  Chain extends ChainGenerics,
  Type extends 'external' | 'internal',
  RT = {
    internal: (
      input: Chain['Input'],
      resultCb: ChainNodeResultCb<Chain['LastNode']>,
      errorCb: ChainNodeErrorCb<Chain>,
      controller: AwaitedChainController<Chain['LastNode']['ResultResolverController']>,
    ) => AwaitedChainController<Chain['LastNode']['ResultResolverController']>
    external: [Chain['ErrorResolverController']] extends [never]
      ? (
          input: Chain['Input'],
          resultCb: ChainNodeResultCb<Chain['LastNode']>,
        ) => AwaitedChainController<Chain['AccumulatedResultResolverControllers']>
      : (
          input: Chain['Input'],
          resultCb: ChainNodeResultCb<Chain['LastNode']>,
          errorCb: AccumulatedErrorCb<Chain>,
        ) => AwaitedChainController<Chain['AccumulatedResultResolverControllers']>
  }[Type],
> = RT

export type SharedProperties<
  Chain extends ChainGenerics,
  RT = {
    type: typeof chainNodeType
    onError(callback: AccumulatedErrorCb<Chain>): ChainNode<Chain>
    await: Await<Chain, 'external'>
    readonly asyncFn: (
      input: Chain['Input'],
      resolver: Resolver<
        (output: Chain['LastNode']['Output']) => Chain['LastNode']['ResultResolverController'],
        [Chain['ErrorResolverController']] extends [never]
          ? never
          : (error: Chain['AccumulatedErrors']) => Chain['ErrorResolverController']
      >,
    ) => Chain['AccumulatedResultResolverControllers']
    // sync: ResultCall<Chain, Node, false>
    // input(input: Chain['Input']): PromiseLike<Chain['Output']>
  },
> = RT

export type ChainNode<Chain extends ChainGenerics> = ResultCall<Chain> & SharedProperties<Chain>

// type ChainFn = {
//   // /* ******************************************************************************** */
//   <
//     Defaults extends Partial<ChainNodeGenericsWithInputOutput> = {},
//     FirstNodeTypes extends {
//       Input?: unknown
//       ResultResolverController?: unknown
//       ErrorResolverController?: unknown
//     } = {},
//     NodeTypes extends ChainNodePossibleGenerics = {},
//     FinalDefaults extends ChainNodeGenerics = RenameProperty<
//       LMerge<NeverChainNodeGenericsWithInputOutput, Defaults>,
//       'InputOutput',
//       'Output'
//     >,
//     ZeroNode extends ChainNodeGenerics = LMerge<
//       FinalDefaults,
//       RenameProperty<FirstNodeTypes, 'Input', 'Output'>
//     > extends ChainNodeGenerics
//       ? LMerge<FinalDefaults, RenameProperty<FirstNodeTypes, 'Input', 'Output'>>
//       : never,
//     Node extends ChainNodeGenerics = LMerge<FinalDefaults, NodeTypes> extends ChainNodeGenerics
//       ? LMerge<FinalDefaults, NodeTypes>
//       : never,
//     ErrorResolverController = FirstNodeTypes extends { ErrorResolverController: unknown }
//       ? FirstNodeTypes['ErrorResolverController']
//       : never,
//     Chain extends ChainGenerics = {
//       Input: ZeroNode['Output']
//       Output: Node['Output']
//       ErrorResolverController: ErrorResolverController
//       AccumulatedErrors: Node['Error']
//       AccumulatedOutputs: Node['Output']
//       AccumulatedResultResolverControllers:
//         | ZeroNode['ResultResolverController']
//         | Node['ResultResolverController']
//       Defaults: FinalDefaults
//       LastNode: Node
//     },
//   >(
//     asyncFunction: AsyncFn<
//       {
//         Input: never
//         Output: ZeroNode['Output']
//         ErrorResolverController: never
//         AccumulatedErrors: never
//         AccumulatedOutputs: never
//         AccumulatedResultResolverControllers: never
//         Defaults: FinalDefaults
//         LastNode: ZeroNode
//       },
//       Chain
//     >,
//   ): ChainNode<Chain>

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

function getResultCall<Chain extends ChainGenerics>(awaitFn: Await<Chain, 'internal'>) {
  const resultCall = function resultCallFn<
    T extends [ValidAsyncFn, ...ValidAsyncFn[]],
    RT extends {
      // FirstChain: ChainGenerics
      NewChain: ChainGenerics
      ValidatedAsyncFns: [ValidAsyncFn, ...ValidAsyncFn[]]
    } = ResultCallTypes<Chain, T> extends {
      // FirstChain: ChainGenerics
      NewChain: ChainGenerics
      ValidatedAsyncFns: [ValidAsyncFn, ...ValidAsyncFn[]]
    }
      ? ResultCallTypes<Chain, T>
      : never,
  >(...asyncFunctions) {
    if (asyncFunctions.length === 0) throw new Error('async functions required')
    const asyncFn = asyncFunctions.shift() as T[0]
    const nextNode = newNode(asyncFn, (arg, resultCb, errorCb, controller) =>
      awaitFn(arg, resultCb, errorCb, controller),
    ) as any
    const rv = asyncFunctions.length === 0 ? nextNode : nextNode(...(asyncFunctions as any))
    return rv as unknown as ChainNode<RT['NewChain']>
  }
  return resultCall as unknown as ResultCall<Chain>
}

const addSharedProperties = <Chain extends ChainGenerics>(
  fn: ResultCall<Chain>,
  awaitFn: Await<Chain, 'internal'>,
  errorNodeFn: typeof errorNode<Chain>,
): ChainNode<Chain> => {
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
          input: Chain['Input'],
          resolver: {
            result: (
              resultOut: Chain['LastNode']['Output'],
            ) => Chain['LastNode']['ResultResolverController']
            error?: (errors: Chain['AccumulatedErrors']) => Chain['ErrorResolverController']
          },
        ) =>
          chainNode.await(
            input,
            (result) => resolver.result(result),
            (error) =>
              (
                resolver.error as (
                  errors: Chain['AccumulatedErrors'],
                ) => Chain['ErrorResolverController']
              )(error),
          )
      },
    },
  })
  return chainNode
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
    const execute = (inputArg: Chain['Input'] | PreviousChain['LastNode']['Output']) => {
      function resolverFn(resultArg: Chain['LastNode']['Output']) {
        return (resolverFn as ValidResolver).result(resultArg)
      }
      Object.defineProperties(resolverFn, {
        result: {
          value: (resultArg: Chain['LastNode']['Output']) => {
            controller.controller = undefined
            const res = resultCb(resultArg)
            controller.controller = res
            return res
          },
          writable: false,
        },
        error: {
          value: (errorArg: Chain['LastNode']['Error']) => {
            if (errorCb) return errorCb(errorArg)
            throw new Error('error called, but no ErrorCb was provided')
          },
          writable: false,
        },
      })

      return asyncFn(inputArg, resolverFn as ValidResolver)
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
  addChar<'C:B:A:start','A'>('A'),
  addChar<'A:C:B:A:start','B'>('B'),
  addChar<'B:A:C:B:A:start','C'>('C'),
)
// awaits chain of asynchronous functions
fooBarChain.await('start' as const, (result) => {
  expect(result).toEqual('C:B:A:C:B:A:start')
  done(undefined)
})
```

 * @param asyncFunctions 
 * @returns a potentially asynchronous function
 */
function chain<
  T extends [ValidAsyncFn, ...ValidAsyncFn[]],
  ValidT_ = AsyncFunctionChainArray<T, never>,
  ValidT extends {
    LastChain: ChainGenerics
    AsyncFns: [ValidAsyncFn, ...ValidAsyncFn[]]
  } = ValidT_ extends {
    LastChain: ChainGenerics
    AsyncFns: [ValidAsyncFn, ...ValidAsyncFn[]]
  }
    ? ValidT_
    : never,
>(...asyncFunctions: T & ValidT['AsyncFns']) {
  const rCall = getResultCall((input, resolver) => resolver(input) as any) as any
  const rv = rCall(...(asyncFunctions as unknown as [ValidAsyncFn, ...ValidAsyncFn[]]))
  return rv as unknown as ChainNode<ValidT['LastChain']>
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
