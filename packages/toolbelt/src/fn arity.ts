/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prefer-rest-params */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { chunk } from './arrayUtils'
import { ArraysIntersection, IsFinite } from './typescriptUtils'

/**
 * converts a monadic array function of type (input: unknown[]) => unknown
 * to polyadic function of type (...inputs: unknown[]) => unknown
 * 
 * **example**
```typescript
const monadicArrayFn = (arr: [a: 'a', b: 'b']) => arr // type (arr: [a: 'a', b: 'b']) => [a: "a", b: "b"]
const polyadicFn = monadicArrayFnToPolyadicFn(monadicArrayFn) // type (a: "a", b: "b") => [a: "a", b: "b"]
console.log(polyadicFn('a', 'b')) // ['a','b']
```
 */
export function monadicArrayFnToPolyadicFn<const Input extends unknown[], RT>(
  fn: (input: Input) => RT,
): (...inputs: Input) => RT
export function monadicArrayFnToPolyadicFn(
  fn: (input: unknown[]) => unknown,
): (...inputs: unknown[]) => unknown {
  return function monadicArrayFnToPolyadicFunc(...inputs: unknown[]) {
    return fn(inputs)
  }
}

/**
 * converts a polyadic function of type: (...inputs: unknown[]) => unknown
 * to a monadic array function of type: (input: unknown[]) => unknown
 *  
 * **example**
```typescript
const polyadicFn = (a: 'a', b: 'b') => [a, b] // type (a: 'a', b: 'b') => ("a" | "b")[]
const monadicArrayFn = polyadicFnToMonadicArrayFn(polyadicFn) // type (inputArray: [a: "a", b: "b"]) => ("a" | "b")[]
console.log(monadicArrayFn(['a', 'b'])) // ['a','b']
```
 */
export function polyadicFnToMonadicArrayFn<const Input extends unknown[], RT>(
  fn: (...inputs: Input) => RT,
): (inputArray: Input) => RT
export function polyadicFnToMonadicArrayFn(
  fn: (...input: unknown[]) => unknown,
): (inputArray: unknown[]) => unknown {
  return function unFunnelInputsFn(inputs: unknown[]) {
    return fn(...inputs)
  }
}

/**
 * converts a monadic object function of type `(input: object) => unknown`
 * to a polyadic `(...inputs: unknown[]) => unknown`
 * the order of inputs is defined by the order of object properties in
 * the `keys` argument
 *  
 * **example**
```typescript
const monadicObjectFn = (inputObject: { a: 'a'; b: 'b' }) => inputObject // type (inputObject: { a: 'a'; b: 'b'; }) => { a: 'a'; b: 'b'; }
const polyadicFn = monadicObjectFnToPolyadicFn(monadicObjectFn, ['a', 'b']) // type (inputs_0: "a", inputs_1: "b") => { a: 'a'; b: 'b'; }
console.log(polyadicFn('a', 'b')) // { a: 'a'; b: 'b'; }
``` 
*/
export function monadicObjectFnToPolyadicFn<
  const Input extends object,
  const Keys extends (keyof Input)[],
  RT,
>(fn: (input: Input) => RT, keys: Keys): (...inputs: { [K in keyof Keys]: Input[Keys[K]] }) => RT
export function monadicObjectFnToPolyadicFn(
  fn: (input: object) => unknown,
  keys: PropertyKey[],
): (...inputs: unknown[]) => unknown {
  const keysLength = keys.length

  return function monadicObjectFnToPolyadicFunc(...inputs: unknown[]) {
    const obj = {} as { [P: PropertyKey]: unknown }
    for (let i = 0; i < keysLength; i += 1) {
      const key = keys[i] as PropertyKey
      obj[key] = inputs[i]
    }
    return fn(obj)
  }
}

type TupleToObject<
  Inputs extends readonly [unknown, ...unknown[]],
  Keys extends readonly [string, ...string[]],
  WInputs extends [unknown, ...unknown[]] = { -readonly [I in keyof Inputs]: Inputs[I] },
  WKeys extends [string, ...string[]] = { -readonly [I in keyof Keys]: Keys[I] },
  RT extends object = TupleToObject2<WInputs, WKeys> extends infer O extends object
    ? { [K in keyof O]: O[K] }
    : never,
> = RT

type TupleToObject2<
  Inputs extends [unknown, ...unknown[]],
  Keys extends [string, ...string[]],
  InputsTail extends [unknown, ...unknown[]] = Inputs extends [
    unknown,
    ...infer T extends [unknown, ...unknown[]],
  ]
    ? T
    : never,
  KeysTail extends [string, ...string[]] = Keys extends [
    string,
    ...infer T extends [string, ...string[]],
  ]
    ? T
    : never,
> = [InputsTail] extends [never]
  ? [KeysTail] extends [never]
    ? { [I in Keys[0]]: Inputs[0] }
    : never
  : [KeysTail] extends [never]
  ? never
  : { [I in Keys[0]]: Inputs[0] } & TupleToObject2<InputsTail, KeysTail>

/**
 * converts a polyadic function of type `(...inputs: unknown[]) => unknown`
 * to a monadic object function `(inputObject: object) => unknown` where `inputs` have
 * been placed into a object
 * The index of `keys` corresponds to the index of `inputs` and keys defines the
 * the property name
 *   
 * **example**
```typescript
const polyadicFn = (a: 'a', b: 'b') => [a, b] // type (a: 'a', b: 'b') => ("a" | "b")[]
const monadicObjectFn = polyadicFnToMonadicObjectFn(polyadicFn, ['a', 'b']) // type (inputObject: { a: "a", b: "b" }) => ("a" | "b")[]
console.log(monadicObjectFn({ a: 'a', b: 'b' })) // ['a','b']
``` 
 */
export function polyadicFnToMonadicObjectFn<
  const Inputs extends readonly [unknown, ...unknown[]],
  const Keys extends readonly [string, ...string[]],
  RT,
>(fn: (...inputs: Inputs) => RT, keys: Keys): (inputObject: TupleToObject<Inputs, Keys>) => RT
export function polyadicFnToMonadicObjectFn(
  fn: (...input: [unknown, ...unknown[]]) => unknown,
  keys: [string, ...string[]],
): (inputObject: object) => unknown {
  const keysLength = keys.length

  return function polyadicFnToMonadicObjectFunc(inputObject: object) {
    const arr = [] as unknown as [unknown, ...unknown[]]
    for (let i = 0; i < keysLength; i += 1) {
      const key = keys[i] as string
      arr[i] = (inputObject as { [P: string]: unknown })[key]
    }
    return fn(...arr)
  }
}

// /**
//  * takes an n-ary function of type (input: unknown, ...otherArgs: unknown[]) => unknown, together with `otherArgs`
//  * and returns a unary function of type: (input: unknown) => unknown
//  *
//  * **example**
// ```typescript
// const polyadicFn = (a: string, b: 'b', c: string) => [a, b, c] as const // type (a: string, b: 'b', c: string) => readonly [string, "b", string]
// const monadicFn = polyadicFnWithPreKnownInputsToMonadicFn(polyadicFn, 'b','c') // type (input: string) => readonly [string, "b", string]
// console.log(monadicFn('a')) // ['a','b','c']
// ```
//  */
// export function polyadicFnWithPreKnownInputsToMonadicFn<Input, Args extends unknown[], RT>(
//   fn: (input: Input, ...otherArgs: Args) => RT,
//   ...args: Args
// ): (input: Input) => RT
// export function polyadicFnWithPreKnownInputsToMonadicFn(
//   fn: (input: unknown, ...otherArgs: unknown[]) => unknown,
//   ...args: unknown[]
// ): (input: unknown) => unknown {
//   return function nArityFnToUnaryFunc(input: unknown) {
//     return fn(input, ...args)
//   }
// }

/**
 * takes in multiple functions, and returns a function which when called
 * will call each of the input functions with the arguments provided and
 * return an array of the outputs received from each function
 * 
 * **example**
```typescript
const fnA = (a: string, b: string) => [a, b] as const
const fnB = (a: string, b: 'world') => ({ a, b })
const forked = fork(fnA, fnB) // type (inputs_0: string, inputs_1: "world") => [readonly [string, string], { a: string; b: "world"; }]
console.log(forked('hello', 'world')) // [['hello', 'world'], { a: 'hello'; b: 'world'; }]
``` 
 */
export function fork<
  const Fns extends ((...inputs: any) => any)[],
  Inputs extends unknown[] = ArraysIntersection<{ [I in keyof Fns]: Parameters<Fns[I]> }>,
  // ValidFns extends ((...inputs: any) => any)[] = { [I in keyof Fns]:
  // (...inputs: Inputs)=>ReturnType<Fns[I]> },
  RT extends unknown[] = { [I in keyof Fns]: ReturnType<Fns[I]> },
>(...fns: Fns): (...inputs: Inputs) => RT {
  return function forkFunc(...inputs: Inputs): RT {
    return fns.map((fn) => fn(...inputs)) as RT
  }
}

type RepeatingFixedSizeTuple2<
  ParamsToRepeat extends [unknown, ...unknown[]],
  ReturnTypeToRepeat,
  SizeOfReturnedTuple extends number,
  CalcedType extends { params: unknown[]; returnType: unknown[] } = { params: []; returnType: [] },
  TPart extends [unknown, ...unknown[]] = ParamsToRepeat,
  TailTPart extends [unknown, ...unknown[]] = TPart extends [
    any,
    ...infer O extends [unknown, ...unknown[]],
  ]
    ? O
    : ParamsToRepeat,
  CalcedReturnType extends unknown[] = TPart extends ParamsToRepeat
    ? [...CalcedType['returnType'], ReturnTypeToRepeat]
    : CalcedType['returnType'],
> = number extends SizeOfReturnedTuple
  ? never
  : CalcedType['params'] extends { length: SizeOfReturnedTuple }
  ? CalcedType
  : RepeatingFixedSizeTuple2<
      ParamsToRepeat,
      ReturnTypeToRepeat,
      SizeOfReturnedTuple,
      {
        params: [...CalcedType['params'], TPart[0]]
        returnType: CalcedReturnType
      },
      TailTPart
    > extends infer O extends { params: unknown[]; returnType: unknown[] }
  ? O
  : never

/**
 * takes in a single polyadic function, and returns a polyadic function which when called
 * will call that single polyadic function multiple times based on the
 * arity and return an array of the outputs received
 * 
 * similar to adjacent_transform in c++?
 * 
 * **example**
```typescript
const bothFn = both((arg1: string, arg2: number) => [arg1, arg2] as const)
const result = bothFn('a', 1, 'b', 2, 'c', 3)
expect(`${result}`).toEqual('a,1,b,2,c,3')
``` 
 */
export function both<Args extends [unknown, ...unknown[]], RT>(
  fn: (...inputs: Args) => RT,
  arity: number,
): <S extends [...Args, ...Args, ...unknown[]]>(
  ...inputs: S & RepeatingFixedSizeTuple2<Args, RT, S['length']>['params']
) => RepeatingFixedSizeTuple2<Args, RT, S['length']>['returnType']
export function both(
  fn: (...inputs: [unknown, ...unknown[]]) => unknown,
  arity: number = fn.length,
): (...inputs: [unknown, ...unknown[]][]) => unknown[] {
  return function bothFunc(...inputs: [unknown, ...unknown[]][]): unknown[] {
    if (inputs.length < arity * 2) throw new Error('input arguments should at least be doubled')
    // return mapN<Args, RT>(inputs as Args[], (input) => fn(...input), arity)
    const paramChunks = chunk<[unknown, ...unknown[]]>(inputs, arity)
    return paramChunks.map((input) => fn(...input))
  }
}

export const placeholder = Symbol('placeholder')

export type Placeholder = typeof placeholder

function isPlaceholder(arg: unknown): arg is Placeholder {
  return arg === placeholder
}

function curryMonadic(fn: (arg: unknown) => unknown): {
  (arg0: unknown): unknown
  readonly fixed: (arg0: unknown) => unknown
} {
  function curryMonadicFn(this: unknown, arg: unknown): unknown {
    if (arguments.length === 0 || isPlaceholder(arg)) return curryMonadicFn
    return fn.apply(this, arguments as unknown as [arg: any])
  }
  Object.defineProperty(curryMonadicFn, 'fixed', {
    get() {
      return fn
    },
  })
  return curryMonadicFn as {
    (arg0: unknown): unknown
    readonly fixed: (arg0: unknown) => unknown
  }
}

function curryDyadic(fn: (arg1: unknown, arg2: unknown) => unknown): {
  (arg0: unknown, arg1: unknown): unknown
  readonly fixed: (arg0: unknown, arg1: unknown) => unknown
} {
  function curryDyadicFn(arg1: unknown, arg2: unknown): unknown {
    switch (arguments.length) {
      case 0:
        return curryDyadicFn
      case 1:
        return isPlaceholder(arg1)
          ? curryDyadic((b, a) => fn(a, b))
          : curryMonadic((_b) => fn(arg1, _b))
      default:
        return isPlaceholder(arg1) && isPlaceholder(arg2)
          ? curryDyadicFn
          : isPlaceholder(arg1)
          ? curryMonadic((_a) => fn(_a, arg2))
          : isPlaceholder(arg2)
          ? curryMonadic((_b) => fn(arg1, _b))
          : fn(arg1, arg2)
    }
  }
  Object.defineProperty(curryDyadicFn, 'fixed', {
    get() {
      return fn
    },
  })
  return curryDyadicFn as {
    (arg0: unknown, arg1: unknown): unknown
    readonly fixed: (arg0: unknown, arg1: unknown) => unknown
  }
}

// function curryTriadic(fn: (arg1: unknown, arg2: unknown, arg3: unknown) => unknown) {
//   return function f3(a: unknown, b: unknown, c: unknown) {
//     switch (arguments.length) {
//       case 0:
//         return f3
//       case 1:
//         return isPlaceholder(a) ? f3 : curryDyadic((_b, _c) => fn(a, _b, _c))
//       case 2:
//         return isPlaceholder(a) && isPlaceholder(b)
//           ? f3
//           : isPlaceholder(a)
//           ? curryDyadic((_a, _c) => fn(_a, b, _c))
//           : isPlaceholder(b)
//           ? curryDyadic((_b, _c) => fn(a, _b, _c))
//           : curryMonadic((_c) => fn(a, b, _c))
//       default:
//         return isPlaceholder(a) && isPlaceholder(b) && isPlaceholder(c)
//           ? f3
//           : isPlaceholder(a) && isPlaceholder(b)
//           ? curryDyadic((_a, _b) => fn(_a, _b, c))
//           : isPlaceholder(a) && isPlaceholder(c)
//           ? curryDyadic((_a, _c) => fn(_a, b, _c))
//           : isPlaceholder(b) && isPlaceholder(c)
//           ? curryDyadic((_b, _c) => fn(a, _b, _c))
//           : isPlaceholder(a)
//           ? curryMonadic((_a) => fn(_a, b, c))
//           : isPlaceholder(b)
//           ? curryMonadic((_b) => fn(a, _b, c))
//           : isPlaceholder(c)
//           ? curryMonadic((_c) => fn(a, b, _c))
//           : fn(a, b, c)
//     }
//   }
// }

function createFnWithArity<T extends (...args: any) => any>(arity: number, fn: T): T {
  switch (arity) {
    case 1:
      return function arityFn(this: unknown, _a0) {
        return fn.apply(this, arguments)
      } as T
    case 2:
      return function arityFn(this: unknown, _a0, _a1) {
        return fn.apply(this, arguments)
      } as T
    case 3:
      return function arityFn(this: unknown, _a0, _a1, _a2) {
        return fn.apply(this, arguments)
      } as T
    case 4:
      return function arityFn(this: unknown, _a0, _a1, _a2, _a3) {
        return fn.apply(this, arguments)
      } as T
    case 5:
      return function arityFn(this: unknown, _a0, _a1, _a2, _a3, _a4) {
        return fn.apply(this, arguments)
      } as T
    case 6:
      return function arityFn(this: unknown, _a0, _a1, _a2, _a3, _a4, _a5) {
        return fn.apply(this, arguments)
      } as T
    case 7:
      return function arityFn(this: unknown, _a0, _a1, _a2, _a3, _a4, _a5, _a6) {
        return fn.apply(this, arguments)
      } as T
    case 8:
      return function arityFn(this: unknown, _a0, _a1, _a2, _a3, _a4, _a5, _a6, _a7) {
        return fn.apply(this, arguments)
      } as T
    case 9:
      return function arityFn(this: unknown, _a0, _a1, _a2, _a3, _a4, _a5, _a6, _a7, _a8) {
        return fn.apply(this, arguments)
      } as T
    case 10:
      return function arityFn(this: unknown, _a0, _a1, _a2, _a3, _a4, _a5, _a6, _a7, _a8, _a9) {
        return fn.apply(this, arguments)
      } as T
    default:
      throw new Error('arity must be a between 1 and 10')
  }
}

function curryPolyadic(
  arity: number,
  fn: (arg0: any, ...args: any) => any,
): {
  (arg0: any, ...args: any): any
  readonly fixed: (arg0: any, ...args: any) => any
} {
  function curryPolyadicFn(this: unknown, ...args: any[]) {
    const finalArgs = [] as unknown as [arg0: any, ...args: any]
    let argsIdx = 0
    const placeholders = [] as number[]

    for (const arg of args) {
      if (isPlaceholder(arg)) {
        placeholders.push(argsIdx)
      } else {
        finalArgs[argsIdx] = arg
      }
      argsIdx += 1
    }
    if (placeholders.length === 0 && argsIdx >= arity) return fn.apply(this, finalArgs)

    function placeholderFunc(this: unknown, ...args2: any[]): any {
      const newFinalArgs = [...finalArgs] as [arg0: any, ...args: any]
      let newArgsIdx = argsIdx
      for (const arg of args2) {
        if (newArgsIdx >= arity)
          newFinalArgs[placeholders[newArgsIdx - arity] as unknown as number] = arg
        else newFinalArgs[newArgsIdx] = arg
        newArgsIdx += 1
      }
      return fn.apply(this, newFinalArgs)
    }

    return curry(placeholderFunc, arity - argsIdx + placeholders.length)
  }
  Object.defineProperty(curryPolyadicFn, 'fixed', {
    get() {
      return fn
    },
  })
  return curryPolyadicFn as {
    (arg0: any, ...args: any): any
    readonly fixed: (arg0: any, ...args: any) => any
  }
}

type InferFirst<
  T extends any[],
  TRest extends any[] = T extends [any, ...infer S] ? S : never,
> = T extends [...infer H, ...TRest] ? (H extends [unknown] ? H : never) : never

type UpdateRemainingParamsList<
  T extends {
    incomingParams: [unknown, ...unknown[]]
    remainingParams: [unknown, ...unknown[]]
    validatedParams: unknown[]
  },
  IncomingParam extends [unknown] = InferFirst<T['incomingParams']>,
  ExpectedParam extends [unknown] = InferFirst<T['remainingParams']>,
  TailRemainingParams extends [unknown, ...unknown[]] = T['remainingParams'] extends [
    unknown,
    ...infer S extends [unknown, ...unknown[]],
  ]
    ? IncomingParam[0] extends Placeholder
      ? [...S, ...ExpectedParam]
      : S
    : IncomingParam[0] extends Placeholder
    ? ExpectedParam
    : never,
  ValidatedParams extends unknown[] = IncomingParam[0] extends Placeholder
    ? [...T['validatedParams'], ...IncomingParam]
    : IncomingParam[0] extends ExpectedParam[0]
    ? [...T['validatedParams'], ...IncomingParam]
    : [...T['validatedParams'], ...ExpectedParam],
  TailIncomingParams extends [unknown, ...unknown[]] = T['incomingParams'] extends [
    unknown,
    ...infer S extends [unknown, ...unknown[]],
  ]
    ? S
    : never,
  NeverValidatedParams extends unknown[] = [...ValidatedParams, never],
> = (
  [TailIncomingParams] extends [never]
    ? {
        remainingParams: TailRemainingParams
        validatedParams: ValidatedParams
      }
    : [TailRemainingParams] extends [never]
    ? {
        remainingParams: TailRemainingParams
        validatedParams: NeverValidatedParams
      }
    : UpdateRemainingParamsList<{
        incomingParams: TailIncomingParams
        remainingParams: TailRemainingParams
        validatedParams: ValidatedParams
      }>
) extends infer O extends {
  remainingParams: [unknown, ...unknown[]]
  validatedParams: unknown[]
}
  ? O
  : never

export type Curry<
  T extends (arg0: any, ...args: any) => any,
  FirstArg extends [unknown] = InferFirst<Parameters<T>> extends infer O
    ? { [K in keyof O]: O[K] | Placeholder } extends infer B extends [unknown]
      ? B
      : never
    : never,
  KnownArgs extends [unknown, ...unknown[]] = [...FirstArg, ...any[]],
> = {
  <
    Args extends KnownArgs,
    Calc extends {
      remainingParams: [unknown, ...unknown[]]
      validatedParams: unknown[]
    } = IsFinite<
      Args,
      UpdateRemainingParamsList<{
        incomingParams: Args
        remainingParams: Parameters<T>
        validatedParams: []
      }>,
      {
        remainingParams: KnownArgs
        validatedParams: KnownArgs
      }
    >,
  >(
    ...args: Args & Calc['validatedParams']
  ): IsFinite<Args, Curry<(...args: Calc['remainingParams']) => ReturnType<T>>, ReturnType<T>>
  readonly fixed: T
}

export function curry<F extends (arg0: any, ...args: any) => any>(f: F): Curry<F>
export function curry(
  fn: (arg0: any, ...args: any) => any,
  arity: number,
): {
  (arg0: any, ...args: any): any
  readonly fixed: (arg0: any, ...args: any) => any
}
export function curry(
  fn: (arg0: any, ...args: any) => any,
  arity = fn.length,
): {
  (arg0: any, ...args: any): any
  readonly fixed: (arg0: any, ...args: any) => any
} {
  switch (arity) {
    case 1:
      return curryMonadic(fn)
    case 2:
      return curryDyadic(fn)
    // case 3:
    //   return curryTriadic(fn)
    default:
      return createFnWithArity(arity, curryPolyadic(arity, fn))
  }
}

type UpdateRemainingParamsListFixed<
  T extends {
    incomingParams: [unknown, ...unknown[]]
    remainingParams: [unknown, ...unknown[]]
    validatedParams: unknown[]
  },
  IncomingParam extends [unknown] = InferFirst<T['incomingParams']>,
  ExpectedParam extends [unknown] = InferFirst<T['remainingParams']>,
  TailRemainingParams extends [unknown, ...unknown[]] = T['remainingParams'] extends [
    unknown,
    ...infer S extends [unknown, ...unknown[]],
  ]
    ? S
    : never,
  ValidatedParams extends unknown[] = IncomingParam[0] extends ExpectedParam[0]
    ? [...T['validatedParams'], ...IncomingParam]
    : [...T['validatedParams'], ...ExpectedParam],
  TailIncomingParams extends [unknown, ...unknown[]] = T['incomingParams'] extends [
    unknown,
    ...infer S extends [unknown, ...unknown[]],
  ]
    ? S
    : never,
  NeverValidatedParams extends unknown[] = [...ValidatedParams, never],
> = (
  [TailIncomingParams] extends [never]
    ? {
        remainingParams: TailRemainingParams
        validatedParams: ValidatedParams
      }
    : [TailRemainingParams] extends [never]
    ? {
        remainingParams: TailRemainingParams
        validatedParams: NeverValidatedParams
      }
    : UpdateRemainingParamsListFixed<{
        incomingParams: TailIncomingParams
        remainingParams: TailRemainingParams
        validatedParams: ValidatedParams
      }>
) extends infer O extends {
  remainingParams: [unknown, ...unknown[]]
  validatedParams: unknown[]
}
  ? O
  : never

export type CurryFixed<
  T extends (arg0: any, ...args: any) => any,
  FirstArg extends [unknown] = InferFirst<Parameters<T>>,
  KnownArgs extends [unknown, ...unknown[]] = [...FirstArg, ...any[]],
> = <
  Args extends KnownArgs,
  Calc extends {
    remainingParams: [unknown, ...unknown[]]
    validatedParams: unknown[]
  } = IsFinite<
    Args,
    UpdateRemainingParamsListFixed<{
      incomingParams: Args
      remainingParams: Parameters<T>
      validatedParams: []
    }>,
    {
      remainingParams: KnownArgs
      validatedParams: KnownArgs
    }
  >,
>(
  ...args: Args & Calc['validatedParams']
) => IsFinite<Args, Curry<(...args: Calc['remainingParams']) => ReturnType<T>>, ReturnType<T>>
