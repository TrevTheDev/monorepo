/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResultError, onlyExecuteOnResult } from './resultError'
import type { Lookup } from './typescriptUtils'

export type Fn<InputType = any, ReturnedType = any, Res = (input: InputType) => ReturnedType> = Res

// type LinkedFn<F1 extends Fn, F2 extends Fn> = (input: Parameters<F1>[0]) => Parameters<F2>[0]
type LinkedFn<
  F1 extends Fn,
  F2 extends Fn,
  RT extends Fn = ReturnType<F1> extends Parameters<F2>[0]
    ? F2
    : (input: ReturnType<F1>) => ReturnType<F2>,
> = RT

export type FunctionChainArray<
  T extends [Fn, ...Fn[]],
  Input = any,
  First extends Fn = T[0],
  ModdedT extends Fn[] = [(Input: Input) => Parameters<First>[0], ...T],
> = { [K in keyof T]: LinkedFn<Lookup<ModdedT, K>, T[K]> } extends infer RT extends [Fn, ...Fn[]]
  ? RT
  : never

export type CalculatedCompositeFn<
  T extends [Fn, ...Fn[]],
  First extends Fn = T extends [infer F extends Fn, ...any] ? F : never,
  Last extends Fn = T extends [...any, infer F extends Fn] ? F : never,
  Res extends Fn = Fn<Parameters<First>[0], ReturnType<Last>>,
> = Res

// type X21 = {
//   (input: any, ...args: unknown[]): 'SafeParseOutput<any>'
//   readonly type: string
//   readonly schemaType:
//     | 'string'
//     | 'number'
//     | 'bigint'
//     | 'boolean'
//     | 'object'
//     | 'function'
//     | 'NaN'
//     | 'coerced string'
//     | 'coerced number'
//     | 'coerced bigint'
//     | 'coerced boolean'
//     | 'object all properties'
//     | 'object known properties'
//     | 'literal'
//     | 'any'
//     | 'unknown'
//     | 'never'
//     | 'null'
//     | 'exclude'
//     | 'union'
//     | 'literal union'
//     | 'optional'
//   parse(input: any): any
//   toString(): string
// }

// type X = {
//   (input: any, ...args: unknown[]): 'SafeParseOutput<any>'
//   readonly type: string
//   readonly schemaType:
//     | 'string'
//     | 'number'
//     | 'bigint'
//     | 'boolean'
//     | 'object'
//     | 'function'
//     | 'NaN'
//     | 'coerced string'
//     | 'coerced number'
//     | 'coerced bigint'
//     | 'coerced boolean'
//     | 'object all properties'
//     | 'object known properties'
//     | 'literal'
//     | 'any'
//     | 'unknown'
//     | 'never'
//     | 'null'
//     | 'exclude'
//     | 'union'
//     | 'literal union'
//     | 'optional'
//   parse(input: any): any
//   toString(): string
// } // | 'placeholder'

// type Z = X21 extends X ? 'T' : 'F'

// type ZZ = FunctionChainArray<[X21, X]>

// type ZZ = FunctionChainArray<[(a: 'a') => 'a'|1, (a: 'a') => 'b']>

/**
 * composes multiple functions, into a single function.  Equivalent to (arg)=>fn3(fn2(fn1(arg)))
 * each function must take the form `(input:T)=>output`
 * @param functionsToCompose - array of functions, with linked inputs and outputs
 * @returns a function that accepts the first function in the array's input, and returns the last function
 *  in the array's output
 */
function compose<I, T extends [Fn, ...Fn[]]>(
  ...functionsToCompose: T & FunctionChainArray<T, I>
): CalculatedCompositeFn<FunctionChainArray<T, I>>
function compose<T extends [Fn, ...Fn[]]>(
  ...functionsToCompose: T & FunctionChainArray<T>
): CalculatedCompositeFn<FunctionChainArray<T>>
function compose<S>(...functionsToCompose: [Fn<S, S>, ...Fn<S, S>[]]): <T extends S>(input: T) => T
function compose(...functionsToCompose) {
  const composedFn = functionsToCompose.reduce(
    (previousFn, currentFn) => (input) => currentFn(previousFn(input)),
  )
  return composedFn
}

export default compose

type Efn<R = any, E = any> = Fn<R, ResultError<E, R>>

type LinkedEfn<
  F1 extends Efn,
  F2 extends Efn,
  RT = (input: ReturnType<F1> extends ResultError<any, infer R> ? R : never) => ReturnType<F2>,
> = RT extends Efn ? RT : never

type FunctionChainArrayWithError<
  T extends [Efn, ...Efn[]],
  Input = any,
  First extends Efn = T extends [infer F extends Efn, ...any] ? F : never,
  ModdedT extends Efn[] = [(Input: Input) => ResultError<unknown, Parameters<First>[0]>, ...T],
  Res = { [K in keyof T]: LinkedEfn<Lookup<ModdedT, K>, T[K]> },
  RT extends [Efn, ...Efn[]] = Res extends [...infer A extends [Efn, ...Efn[]]] ? A : never, // hack
> = RT

// type Z = FunctionChainArrayWithError<
//   [
//     (input: 'Z') => ResultError<'eA', 'A'>,
//     (input: 'A') => ResultError<'eB', 'B'>,
//     (input: 'C') => ResultError<'eC', 'C'>,
//   ]
// >

type CalculatedCompositeFnWithError<
  T extends [Efn, ...Efn[]],
  First extends Efn = T extends [infer F extends Efn, ...any] ? F : never,
  LastReturnType = T extends [...any, infer F extends Efn]
    ? ReturnType<F> extends ResultError<any, infer R>
      ? R
      : never
    : never,
  ErrorReturnTypes = {
    [I in keyof T]: ReturnType<T[I]> extends ResultError<infer E, any> ? E : never
  },
  UnionErrorReturnTypes = ErrorReturnTypes[Exclude<keyof ErrorReturnTypes, keyof any[]>],
  RT extends Efn = Fn<Parameters<First>[0], ResultError<UnionErrorReturnTypes, LastReturnType>>,
> = RT

/**
 * composes multiple functions, into a single function.  Equivalent to (arg)=>fn3(fn2(fn1(arg)))
 * each function must take the form `(input)=>[error,undefined]|[undefined,result]`.
 * If any function returns an error, execution is halted and the error is returned.
 * @param functionsToCompose - array of functions, with linked inputs and outputs
 * @returns a function that accepts the first function in the array's input, and returns the last function
 *  in the array's output
 */
export function composeWithError<T extends [Efn, ...Efn[]]>(
  ...functionsToCompose: T & FunctionChainArrayWithError<T>
): CalculatedCompositeFnWithError<T>
export function composeWithError<S, E>(
  ...functionsToCompose: [Efn<S, ResultError<E, S>>, ...Efn<S, ResultError<E, S>>[]]
): <T extends S>(input: T) => ResultError<E, T>
export function composeWithError<T extends [Efn, ...Efn[]]>(
  ...functionsToCompose: T
): CalculatedCompositeFnWithError<T> {
  const composedFn = functionsToCompose.reduce(
    (previousFn, currentFn) => (input) => onlyExecuteOnResult(currentFn)(previousFn(input)),
  )
  // const composedFn = functionsToCompose.reduce((previousFn, currentFn) => (startArg) => {
  //   const x = previousFn(startArg)
  //   const [error, result] = x
  //   if (error) return x
  //   return currentFn(result)
  // }) as CalculatedCompositeFnWithError<T>
  return composedFn as CalculatedCompositeFnWithError<T>
}

/**
 * Pipes input into a pipeline of functions.  Similar to compose,
 * except the first argument of the function is used as input
 * into the first function in the chain.
 *
 * @param input
 * @param functionsToCompose
 * @returns
 */
export function pipe<A>(a: A): A
export function pipe<A, B>(a: A, ab: (a: A) => B): B
export function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C
export function pipe<A, B, C, D>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D): D
export function pipe<A, B, C, D, E>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
): E
export function pipe<A, B, C, D, E, F>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
): F
export function pipe(input, ...functionsToCompose) {
  return functionsToCompose.length > 0
    ? compose(...(functionsToCompose as unknown as [Fn, ...Fn[]]))(input)
    : input
}
