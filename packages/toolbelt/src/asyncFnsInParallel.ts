/* eslint-disable @typescript-eslint/no-explicit-any */

import { IsFinite, TupleToUnion, UnionToTuple } from './typescript utils'

type ResultCb<
  ResultCbArgs extends any[] = any[],
  RT = (...resultArgs: ResultCbArgs) => void,
> = RT extends (...args: any[]) => void ? RT : never
type ErrorCb<
  ErrorCbArgs extends any[] = any[],
  RT = (...errorArgs: ErrorCbArgs) => void,
> = RT extends (...args: any[]) => void ? RT : never

export type ValidResolver = {
  (...results: any[]): void
  result: ResultCb
  error?: ErrorCb
}

export type Resolver<
  ResultFn extends ResultCb,
  ErrorFn extends ErrorCb | never = never,
  RT = [ErrorFn] extends [never]
    ? {
        (...results: Parameters<ResultFn>): void
        result: ResultFn
      }
    : {
        (...results: Parameters<ResultFn>): void
        result: ResultFn
        error: ErrorFn
      },
> = RT extends ValidResolver ? RT : never

export type AsyncFnAny = (input: any, resolver: any) => any

export type AsyncFn<
  Input,
  ResultFn extends ResultCb,
  ErrorFn extends ErrorCb | never,
  AsyncControl,
  RT = (input: Input, resolver: Resolver<ResultFn, ErrorFn>) => AsyncControl,
> = RT extends AsyncFnAny ? RT : never

type GetErrorCbArgs<T extends AsyncFnAny> = Parameters<T>[1] extends {
  error: (...args: infer E) => void
}
  ? E
  : never
type GetResultCbArgs<T extends AsyncFnAny> = Parameters<T>[1] extends {
  result: (...args: infer R) => void
}
  ? R
  : never

type AsyncFnArrays<
  T extends AsyncFnAny[],
  ArrayTpe extends 'results' | 'errors' | 'controllers',
  C extends unknown[] = T extends [
    infer First extends AsyncFnAny,
    ...infer Tail extends AsyncFnAny[],
  ]
    ? [
        ArrayTpe extends 'errors'
          ? GetErrorCbArgs<First>
          : ArrayTpe extends 'results'
          ? GetResultCbArgs<First>
          : ReturnType<First>,
        ...AsyncFnArrays<Tail, ArrayTpe>,
      ]
    : [],
> = C extends unknown[] ? C : never

type ConstrainedAsyncFn<
  Input,
  T extends AsyncFnAny,
  Rest extends unknown[] = Parameters<T> extends [any, ...infer R] ? R : never,
> = T extends AsyncFn<Input, any, any, any> ? T : (input: Input, ...args: Rest) => ReturnType<T>

type ConstrainedArray<
  Input,
  T extends AsyncFnAny[],
  Done extends AsyncFnAny[] = [],
  First extends AsyncFnAny = T extends [infer F extends AsyncFnAny, ...any] ? F : never,
  Rest extends AsyncFnAny[] = T extends [any, ...infer R extends AsyncFnAny[]] ? R : never,
> = Rest extends []
  ? [...Done, ConstrainedAsyncFn<Input, First>]
  : ConstrainedArray<Input, Rest, [...Done, ConstrainedAsyncFn<Input, First>]>

type FirstInput<
  T extends [AsyncFnAny, ...AsyncFnAny[]],
  First extends AsyncFnAny = T extends [infer F extends AsyncFnAny, ...AsyncFnAny[]] ? F : never,
> = Parameters<First>[0]

type ConstrainedAsyncFns<T extends [AsyncFnAny, ...AsyncFnAny[]]> = IsFinite<
  T,
  ConstrainedArray<FirstInput<T>, T>,
  T
>

type FilterController<
  T,
  NoUndef = T extends unknown[]
    ? TupleToUnion<UnionToTuple<Exclude<TupleToUnion<T>, undefined>>>[]
    : T,
> = NoUndef

type State = 'awaited' | 'halted' | 'done' | 'error'

type AsyncFnsInParallelController<
  Controller,
  Results,
  Errors,
  RT = {
    readonly state: State
    readonly controllers: FilterController<Controller>
    readonly resultQueue: Results
    readonly errorQueue: Errors
    readonly controllerQueue: Controller
    halt(): void
  },
> = RT

type AsyncFnsInParallel<
  T extends AsyncFnAny,
  RT = Parameters<T>[1] extends {
    error: (...args: any) => void
  }
    ? {
        await: (
          input: Parameters<T>[0],
          resultCb: (resultArray: GetResultCbArgs<T>[]) => void,
          errorCb: (errorArray: GetErrorCbArgs<T>[], resultArray: GetResultCbArgs<T>[]) => void,
        ) => void
        promise: (input: Parameters<T>[0]) => Promise<GetResultCbArgs<T>>
      }
    : {
        await: (
          input: Parameters<T>[0],
          resultCb: (resultArray: GetResultCbArgs<T>[]) => void,
        ) => AsyncFnsInParallelController<ReturnType<T>, GetResultCbArgs<T>, GetErrorCbArgs<T>>
        promise: (input: Parameters<T>[0]) => Promise<GetResultCbArgs<T>>
      },
> = RT

type AsyncFnsInParallel2<
  AsyncFns extends [AsyncFnAny, ...AsyncFnAny[]],
  ResultsArray extends unknown[] = AsyncFnArrays<AsyncFns, 'results'>,
  ErrorsArray extends unknown[] = AsyncFnArrays<AsyncFns, 'errors'>,
  ControllerArray extends unknown[] = AsyncFnArrays<AsyncFns, 'controllers'>,
  Input = Parameters<AsyncFns[0]>[0],
  RT = ErrorsArray extends never[]
    ? {
        await: (
          input: Input,
          resultCb: (resultArray: ResultsArray) => void,
        ) => AsyncFnsInParallelController<ControllerArray, ResultsArray, ErrorsArray>
        promise: (input: Input) => Promise<ResultsArray>
      }
    : {
        await: (
          input: Input,
          resultCb: (resultArray: ResultsArray) => void,
          errorCb: (errorArray: ErrorsArray, resultArray: ResultsArray) => void,
        ) => AsyncFnsInParallelController<ControllerArray, ResultsArray, ErrorsArray>
        promise: (input: Input) => Promise<ResultsArray>
      },
> = RT

function asyncFnsInParallel<T extends AsyncFnAny>(...asyncFns: T[]): AsyncFnsInParallel<T>
function asyncFnsInParallel<AsyncFns extends [AsyncFnAny, ...AsyncFnAny[]]>(
  ...asyncFns: AsyncFns & ConstrainedAsyncFns<AsyncFns>
): AsyncFnsInParallel2<AsyncFns>
function asyncFnsInParallel<
  AsyncFns extends [AsyncFnAny, ...AsyncFnAny[]],
  ResultsArray = AsyncFnArrays<AsyncFns, 'results'>,
  ErrorsArray = AsyncFnArrays<AsyncFns, 'errors'>,
>(...asyncFns: AsyncFns & ConstrainedAsyncFns<AsyncFns>): any {
  // type ResultsArray = AsyncFnArrays<AsyncFns, 'results'>
  // type ErrorsArray = AsyncFnArrays<AsyncFns, 'errors'>
  type ControllerArray = AsyncFnArrays<AsyncFns, 'controllers'>

  type Input = FirstInput<AsyncFns>

  // let state: State = 'init'

  const asyncFnsInParallelObj = {
    await: (
      input: Input,
      resultCb: (resultArray: ResultsArray) => void,
      errorCb?: (errorArray: ErrorsArray, resultArray: ResultsArray) => void,
    ) => {
      let state: State = 'awaited'
      let hasErrors = false
      const arrayLength = asyncFns.length
      const resultArray = new Array(arrayLength) as unknown as Partial<ResultsArray>
      const errorArray = new Array(arrayLength) as unknown as Partial<ErrorsArray>
      const controllerArray = new Array(arrayLength) as ControllerArray

      let resultCount = 0

      const finalDoneCb = () => {
        state = 'done'
        resultCb(resultArray as ResultsArray)
      }

      const finalErrorCb = () => {
        state = 'error'
        if (!errorCb) throw new Error('no `errorCb` provided, and one is required')
        errorCb(errorArray as ErrorsArray, resultArray as ResultsArray)
      }

      const asyncFnsInParallelController: AsyncFnsInParallelController<
        Partial<ControllerArray>,
        Partial<ResultsArray>,
        Partial<ErrorsArray>
      > = {
        get state() {
          return state
        },
        get controllers() {
          return controllerArray.filter(
            (controller) => controller !== undefined,
          ) as FilterController<ControllerArray>
        },
        get resultQueue() {
          return resultArray
        },
        get errorQueue() {
          return errorArray
        },
        get controllerQueue() {
          return controllerArray
        },
        halt() {
          state = 'halted'
        },
      }

      const runAsyncFn = (asyncFunc: AsyncFnAny, idx: number) => {
        type AsyncFnState = 'executing' | 'cancelled' | 'resolved'

        let asyncFnState: AsyncFnState = 'executing'

        function cleanUpAndCheckDone(
          finalQueue: Partial<ResultsArray> | Partial<ErrorsArray>,
          result: any[],
        ) {
          if (asyncFnState === 'executing' && state === 'awaited') {
            // debugger
            asyncFnState = 'resolved'
            controllerArray[idx] = undefined
            finalQueue[idx] = result
            resultCount += 1
            if (resultCount === arrayLength) {
              if (hasErrors) finalErrorCb()
              else finalDoneCb()
            }
          }
        }
        const resolver = function ResolverFn(...args) {
          // debugger
          return resolver.result(...args)
        } as ValidResolver
        Object.defineProperties(resolver, {
          result: {
            value: (...results) => cleanUpAndCheckDone(resultArray, results),
            writable: false,
          },
          error: {
            value: (...errorResults) => {
              hasErrors = true
              return cleanUpAndCheckDone(errorArray, errorResults)
            },
            writable: false,
          },
        })

        const res = asyncFunc(input, resolver)
        if (asyncFnState === 'executing' && state === 'awaited') controllerArray[idx] = res
      }

      asyncFns.forEach((asyncFn, i) => runAsyncFn(asyncFn, i))
      return asyncFnsInParallelController
    },
    promise(input: Input) {
      return new Promise((resolve, reject) => {
        asyncFnsInParallelObj.await(input, resolve, reject)
      })
    },
  }

  return asyncFnsInParallelObj
}

export function asyncFnsInParallelShort<
  AsyncFns extends [AsyncFnAny, ...AsyncFnAny[]],
  Input = FirstInput<AsyncFns>,
  ResultsArray = AsyncFnArrays<AsyncFns, 'results'>,
  ErrorsArray = AsyncFnArrays<AsyncFns, 'errors'>,
  ControllerArray = AsyncFnArrays<AsyncFns, 'controllers'>,
>(
  asyncFns: AsyncFns & ConstrainedAsyncFns<AsyncFns>,
  input: Input,
  resultCb: (resultsArray: ResultsArray) => void,
  errorCb?: (errorsArray: ErrorsArray, resultsArray: ResultsArray) => void,
): AsyncFnsInParallelController<ControllerArray, ResultsArray, ErrorsArray> {
  return asyncFnsInParallel<AsyncFns>(...asyncFns).await(
    input,
    resultCb as any,
    errorCb as any,
  ) as unknown as AsyncFnsInParallelController<ControllerArray, ResultsArray, ErrorsArray>
}
export default asyncFnsInParallel
