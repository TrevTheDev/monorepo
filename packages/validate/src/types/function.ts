/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeepWriteable, ResultError } from 'toolbelt'
import type {
  MinimumSafeParsableObject,
  SafeParsableObject,
  SafeParseFn,
  SingleValidationError,
  VInfer,
  ValidationErrors,
} from './base'
import { MinimumSafeParsableArray, VArrayFinite, ValidArrayItem } from './array'
import { createBaseValidationBuilder, vArray } from './init'
import defaultErrorFn from './defaultErrors'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * types
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type Fn = (...args: any) => any

type FunctionOptions<Output extends Fn> = {
  parser?: SafeParseFn<unknown, Output>
  notAFunction: typeof defaultErrorFn.notAFunction
}

interface FunctionTypes {
  args: unknown[]
  return: unknown
  fn: Fn
}

type FunctionDefinitionBase = {
  parametersType?: MinimumSafeParsableArray | undefined
  returnType?: MinimumSafeParsableObject | undefined
}

type FunctionDefinition =
  | {
      parametersType?: MinimumSafeParsableArray | undefined
      returnType?: MinimumSafeParsableObject | undefined
    }
  | {
      args?: ValidArrayItem[] | undefined
      returnType?: MinimumSafeParsableObject | undefined
    }

interface FnDefTpFnDefBase<
  T extends FunctionDefinition,
  PT extends MinimumSafeParsableArray | undefined = T extends {
    args: infer A extends ValidArrayItem[]
  }
    ? VArrayFinite<A>
    : T extends { parametersType: infer B extends MinimumSafeParsableArray }
    ? B
    : undefined,
> extends FunctionDefinitionBase {
  parametersType: PT
  returnType: T extends { returnType: infer C extends MinimumSafeParsableObject } ? C : undefined
}

interface FunctionDefToFunction<
  T extends FunctionDefinitionBase,
  P extends MinimumSafeParsableArray | undefined = T['parametersType'],
  R extends MinimumSafeParsableObject | undefined = T['returnType'],
  Args extends unknown[] = P extends MinimumSafeParsableArray
    ? VInfer<P> extends any[]
      ? VInfer<P>
      : unknown[]
    : unknown[],
  Return = R extends MinimumSafeParsableObject ? VInfer<R> : unknown,
  Func extends Fn = (...args: Args) => Return,
> extends FunctionTypes {
  args: Args
  return: Return
  fn: Func
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vFunction Wrapper
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

function vFunctionWrapperB<
  P extends MinimumSafeParsableArray | undefined,
  R extends MinimumSafeParsableObject | undefined,
>(
  parametersType: P,
  returnType: R,
  implementation: (
    ...args: P extends MinimumSafeParsableArray
      ? VInfer<P> extends any[]
        ? VInfer<P>
        : unknown[]
      : unknown[]
  ) => R extends MinimumSafeParsableObject ? VInfer<R> : unknown,
): (
  ...args: P extends MinimumSafeParsableArray
    ? VInfer<P> extends any[]
      ? VInfer<P>
      : unknown[]
    : unknown[]
) => R extends MinimumSafeParsableObject ? VInfer<R> : unknown {
  return function VFunctionWrapperB(
    ...args
  ): R extends MinimumSafeParsableObject ? VInfer<R> : unknown {
    const params = (
      parametersType ? parametersType.parse(args) : args
    ) as P extends MinimumSafeParsableArray
      ? VInfer<P> extends any[]
        ? VInfer<P>
        : unknown[]
      : unknown[]
    const result = implementation(...params)
    return (returnType ? returnType.parse(result) : result) as R extends MinimumSafeParsableObject
      ? VInfer<R>
      : unknown
  }
}

type FunctionDefinition1<
  P extends readonly ValidArrayItem[],
  R extends MinimumSafeParsableObject,
> = {
  args: P
  returnType?: R
  // implementation(
  //   ...args: VInfer<VArrayFinite<PW>> extends any[] ? VInfer<VArrayFinite<PW>> : unknown[]
  // ): [R] extends [never] ? any : VInfer<R>
}

type FunctionDefinition2<
  P extends MinimumSafeParsableArray,
  R extends MinimumSafeParsableObject,
> = {
  parametersType: P
  returnType?: R
  // implementation(
  //   ...args: VInfer<P> extends any[] ? VInfer<P> : unknown[]
  // ): [R] extends [never] ? any : VInfer<R>
}

export function vFunctionWrapper<
  const P extends readonly ValidArrayItem[],
  const R extends MinimumSafeParsableObject,
  PW extends ValidArrayItem[] = DeepWriteable<P>,
>(
  functionDefinition: FunctionDefinition1<P, R> & {
    implementation(
      ...args: VInfer<VArrayFinite<PW>> extends any[] ? VInfer<VArrayFinite<PW>> : unknown[]
    ): [R] extends [never] ? any : VInfer<R>
  },
): (
  ...args: VInfer<VArrayFinite<PW>> extends any[] ? VInfer<VArrayFinite<PW>> : unknown[]
) => [R] extends [never] ? any : VInfer<R>
export function vFunctionWrapper<
  P extends MinimumSafeParsableArray,
  R extends MinimumSafeParsableObject,
>(
  functionDefinition: FunctionDefinition2<P, R> & {
    implementation(
      ...args: VInfer<P> extends any[] ? VInfer<P> : unknown[]
    ): [R] extends [never] ? any : VInfer<R>
  },
): (
  ...args: VInfer<P> extends any[] ? VInfer<P> : unknown[]
) => [R] extends [never] ? any : VInfer<R>
export function vFunctionWrapper(
  functionDefinition: FunctionDefinitionBase & {
    args?: ValidArrayItem[]
    implementation(...args: unknown[]): unknown
  },
): (...args: unknown[]) => unknown {
  let paramParser: MinimumSafeParsableArray | undefined = functionDefinition.parametersType
  if (functionDefinition.args) paramParser = vArray(functionDefinition.args)
  return vFunctionWrapperB(
    paramParser,
    functionDefinition.returnType,
    functionDefinition.implementation,
  )
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export function parseFunction<
  T extends FunctionDefinitionBase,
  RT extends FunctionTypes = FunctionDefToFunction<T>,
>(
  functionDefinition: T,
  options: FunctionOptions<RT['fn']>,
): (value: unknown) => ResultError<ValidationErrors, RT['fn']> {
  const { parametersType, returnType } = functionDefinition
  const rFn =
    parametersType === undefined && returnType === undefined
      ? (value: RT['fn']) => value
      : (value: RT['fn']) => vFunctionWrapperB(parametersType, returnType, value)
  return (value: unknown): ResultError<ValidationErrors, RT['fn']> => {
    if (typeof value === 'function') return [undefined, rFn(value as RT['fn'])]
    return [{ input: value, errors: [options.notAFunction(value)] }, undefined]
  }
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * all validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
// type FunctionValidations<T extends Fn> = [
//   [
//     'customValidation',
//     (
//       customValidator: (value: T, ...otherArgs: unknown[]) => SingleValidationError | undefined,
//       ...otherArgs: unknown[]
//     ) => (value: T) => SingleValidationError | undefined,
//   ],
// ]

const functionValidations = [
  [
    'customValidation',
    (customValidator, ...otherArgs) =>
      (value) =>
        customValidator(value, ...otherArgs),
  ],
] as const

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vFunction
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export interface VFunction<
  T extends FunctionDefinition,
  Output extends Fn = FunctionDefToFunction<FnDefTpFnDefBase<T>>['fn'],
  Input = unknown,
> extends SafeParsableObject<Output, 'Function', Input> {
  functionDefinition: T
  args<S extends ValidArrayItem[]>(
    ...params: S
  ): VFunction<{ [K in keyof T | 'args']: K extends 'args' ? S : K extends keyof T ? T[K] : never }>
  returns<S extends MinimumSafeParsableObject>(
    returnType: S,
  ): VFunction<Omit<T, 'returnType'> & { returnType: S }>
  // default validations
  customValidations<S extends unknown[]>(
    customValidator: (value: Output, ...otherArgs: S) => SingleValidationError | undefined,
    ...otherArgs: S
  ): this
}

export function vFunction<
  T extends FunctionDefinition,
  T2 extends FunctionDefinitionBase = FnDefTpFnDefBase<T>,
>(
  functionDefinition?: T,
  options: Partial<FunctionOptions<FunctionDefToFunction<T2>['fn']>> = {},
): VFunction<T> {
  const fOptions: FunctionOptions<FunctionDefToFunction<T2>['fn']> = {
    notAFunction: defaultErrorFn.notAFunction,
    ...options,
  }
  let parametersType
  const fType: FunctionDefinition = functionDefinition || {}
  if ('args' in fType && fType.args) parametersType = vArray(fType.args)
  else if ('parametersType' in fType && fType.parametersType) parametersType = fType.parametersType

  const fDef = {
    parametersType,
    returnType: fType.returnType,
  } as T2
  // eslint-disable-next-line @typescript-eslint/ban-types
  const obj = createBaseValidationBuilder(
    fOptions.parser
      ? fOptions.parser
      : parseFunction<T2, FunctionDefToFunction<T2>>(fDef, fOptions),
    functionValidations as any,
    `Function<(...args: ${fDef.parametersType ? fDef.parametersType.type : 'unknown[]'})=>${
      fDef.returnType ? fDef.returnType.type : 'unknown'
    }>`,
  ) as VFunction<T>
  Object.defineProperties(obj, {
    functionDefinition: {
      value: functionDefinition,
    },
    args: {
      value(...params: ValidArrayItem[]) {
        return vFunction({ ...functionDefinition, args: params }, options)
      },
    },
    returns: {
      value(returnType: MinimumSafeParsableObject) {
        return vFunction({ ...functionDefinition, returnType }, options)
      },
    },
  })
  return obj
}
