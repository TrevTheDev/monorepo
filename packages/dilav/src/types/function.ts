/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResultError } from 'toolbelt'
import { createFinalBaseObject } from './base'
import {
  MinimumArraySchema,
  MinimumSchema,
  BaseSchema,
  SafeParseFn,
  VArrayFinite,
  VArrayInfinite,
  VInfer,
  VNever,
  ValidArrayItems,
  ValidArrayItemsT,
  ValidArrayItemsW,
  ValidationErrors,
  defaultErrorFnSym,
} from './types'

import { baseObject, vArray, vNeverInstance } from './init'
import { DefaultErrorFn } from './errorFns'

const errorFns = baseObject[defaultErrorFnSym]

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * types
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type Fn = (...args: any) => any

type FunctionOptions<Output extends Fn> = {
  parseFunctionError?: DefaultErrorFn['parseFunction']
  parser?: SafeParseFn<unknown, Output>
  returnedFunction?: 'inputValidated' | 'outputValidated' | 'validated' | 'original'
}

// type FunctionOptions<Output extends Fn> = {
//   parser?: SafeParseFn<unknown, Output>
//   notAFunction: typeof defaultErrorFn.notAFunction
// }

interface FunctionTypes {
  args: unknown[]
  return: unknown
  fn: Fn
}

type FunctionDefinition = {
  parameters?: MinimumArraySchema
  returns?: MinimumSchema
}

type FullFunctionDefinition = Required<FunctionDefinition>

type FunctionDefinitionType1<
  P extends ValidArrayItemsW = ValidArrayItemsW,
  R extends MinimumSchema = MinimumSchema,
> = {
  args: P
  returns?: R
}

type FunctionDefinitionType2<
  P extends MinimumArraySchema = MinimumArraySchema,
  R extends MinimumSchema = MinimumSchema,
> = {
  parameters: P
  returns?: R
}

type PartialFunctionDefinition = {
  args?: ValidArrayItems
  parameters?: MinimumArraySchema
  returns?: MinimumSchema
}

interface PartialToFuncDef<T extends PartialFunctionDefinition> extends FullFunctionDefinition {
  parameters: T extends {
    args: infer A extends ValidArrayItems
  }
    ? VArrayFinite<ValidArrayItemsT<A>>
    : T extends { parameters: infer B extends MinimumArraySchema }
    ? B
    : VArrayInfinite<VNever>
  returns: T extends { returns: infer C extends MinimumSchema } ? C : VNever
}

interface FunctionDefToFunction<
  T extends FullFunctionDefinition,
  P extends MinimumArraySchema | undefined = T['parameters'],
  R extends MinimumSchema | undefined = T['returns'],
  Args extends unknown[] = P extends MinimumArraySchema
    ? VInfer<P> extends unknown[]
      ? VInfer<P>
      : never
    : never,
  ReturnT = R extends MinimumSchema ? VInfer<R> : never,
  Func extends Fn = (...args: Args) => ReturnT,
> extends FunctionTypes {
  args: Args
  return: ReturnT
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
  P extends MinimumArraySchema | undefined,
  R extends MinimumSchema | undefined,
>(
  parameters: P,
  returns: R,
  implementation: (
    ...args: P extends MinimumArraySchema
      ? VInfer<P> extends any[]
        ? VInfer<P>
        : unknown[]
      : unknown[]
  ) => R extends MinimumSchema ? VInfer<R> : unknown,
): (
  ...args: P extends MinimumArraySchema
    ? VInfer<P> extends any[]
      ? VInfer<P>
      : unknown[]
    : unknown[]
) => R extends MinimumSchema ? VInfer<R> : unknown {
  return function VFunctionWrapperB(...args): R extends MinimumSchema ? VInfer<R> : unknown {
    const params = (parameters ? parameters.parse(args) : args) as P extends MinimumArraySchema
      ? VInfer<P> extends any[]
        ? VInfer<P>
        : unknown[]
      : unknown[]
    const result = implementation(...params)
    return (returns ? returns.parse(result) : result) as R extends MinimumSchema
      ? VInfer<R>
      : unknown
  }
}

export function vFunctionWrapper<
  const P extends ValidArrayItems,
  const R extends MinimumSchema,
  PW extends ValidArrayItemsW = ValidArrayItemsT<P>,
>(
  functionDefinition: FunctionDefinitionType1<PW, R> & {
    implementation(
      ...args: VInfer<VArrayFinite<PW>> extends any[] ? VInfer<VArrayFinite<PW>> : unknown[]
    ): [R] extends [never] ? any : VInfer<R>
  },
): (
  ...args: VInfer<VArrayFinite<PW>> extends any[] ? VInfer<VArrayFinite<PW>> : unknown[]
) => [R] extends [never] ? any : VInfer<R>
export function vFunctionWrapper<P extends MinimumArraySchema, R extends MinimumSchema>(
  functionDefinition: FunctionDefinitionType2<P, R> & {
    implementation(
      ...args: VInfer<P> extends any[] ? VInfer<P> : unknown[]
    ): [R] extends [never] ? any : VInfer<R>
  },
): (
  ...args: VInfer<P> extends any[] ? VInfer<P> : unknown[]
) => [R] extends [never] ? any : VInfer<R>
export function vFunctionWrapper(
  functionDefinition: (FunctionDefinitionType1 | FunctionDefinitionType2) & {
    implementation(...args: any[]): any
  },
): (...args: unknown[]) => unknown {
  let paramSchema: MinimumArraySchema | undefined = (functionDefinition as any).parameters
  if ('args' in functionDefinition) paramSchema = vArray(functionDefinition.args)
  return vFunctionWrapperB(
    paramSchema,
    functionDefinition.returns,
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
  T extends FunctionDefinition,
  RT extends Fn = FunctionDefToFunction<PartialToFuncDef<T>>['fn'],
>(
  functionDefinition: T,
  parseFunctionError?: DefaultErrorFn['parseFunction'],
): SafeParseFn<unknown, RT> {
  const { parameters, returns } = functionDefinition
  const rFn =
    parameters === undefined && returns === undefined
      ? (value: RT) => value
      : (value: RT) => vFunctionWrapperB(parameters, returns, value)
  return (value: unknown): ResultError<ValidationErrors, RT> => {
    if (typeof value === 'function') return [undefined, rFn(value as any) as RT]
    return [
      {
        input: value,
        errors: [(parseFunctionError ?? errorFns.parseFunction)(value)],
      },
      undefined,
    ]
  }
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vFunction
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export interface VFunction<
  T extends FullFunctionDefinition,
  Output extends Fn = FunctionDefToFunction<T>['fn'],
  Input = unknown,
> extends BaseSchema<
    Output,
    string,
    'function',
    Input,
    {
      readonly parameters: MinimumArraySchema
      readonly returns: MinimumSchema
    }
  > {
  readonly definition: {
    readonly parameters: MinimumArraySchema
    readonly returns: MinimumSchema
  }
  // functionDefinition: T
  args<const S extends ValidArrayItems>(
    ...params: S
  ): VFunction<PartialToFuncDef<{ args: ValidArrayItemsT<S>; returns: T['returns'] }>>
  parameters<S extends MinimumArraySchema>(
    types: S,
  ): VFunction<PartialToFuncDef<{ parameters: S; returns: T['returns'] }>>
  returns<S extends MinimumSchema>(returns: S): VFunction<Omit<T, 'returns'> & { returns: S }>
}

const baseFunctionObject = Object.create(baseObject)

function finaliseFunctionDefinition<T extends PartialFunctionDefinition>(
  functionDefinition: T,
): PartialToFuncDef<T> {
  // if (functionDefinition) {
  //   let parameters: MinimumSafeParsableArray | undefined
  //   if ('args' in functionDefinition && functionDefinition.args)
  //     parameters = vArray(functionDefinition.args)
  //   else if ('parameters' in functionDefinition)
  //     parameters = functionDefinition.parameters
  //   return {
  //     parameters,
  //     returns: functionDefinition.returns,
  //   } as unknown as PartialToFuncDef<T>
  // }
  return {
    parameters:
      // eslint-disable-next-line no-nested-ternary
      'args' in functionDefinition
        ? vArray(functionDefinition.args)
        : 'parameters' in functionDefinition
        ? functionDefinition.parameters
        : vArray(vNeverInstance),
    returns: functionDefinition.returns ?? vNeverInstance,
  } as unknown as PartialToFuncDef<T>
}

export function vFunction<
  const T extends PartialFunctionDefinition,
  T2 extends FullFunctionDefinition = PartialToFuncDef<T>,
>(
  functionDefinition?: T,
  options: FunctionOptions<FunctionDefToFunction<T2>['fn']> = {},
): VFunction<T2> {
  const funcDef: FullFunctionDefinition = finaliseFunctionDefinition(functionDefinition ?? {})
  const finalOptions = { returnedFunction: 'validated', ...options }
  const effectiveFuncDef = {
    ...(['inputValidated', 'validated'].includes(finalOptions.returnedFunction ?? '')
      ? { parameters: funcDef.parameters }
      : {}),
    ...(['outputValidated', 'validated'].includes(finalOptions.returnedFunction ?? '')
      ? { returns: funcDef.returns }
      : {}),
  }

  const obj = createFinalBaseObject(
    baseFunctionObject,
    (options as any).parser ?? parseFunction(effectiveFuncDef, options.parseFunctionError),
    `Function<(...args: ${
      funcDef.parameters !== undefined ? funcDef.parameters.type : 'unknown[]'
    })=>${funcDef.returns !== undefined ? funcDef.returns.type : 'unknown'}>`,
    'function',
    funcDef,
  ) as VFunction<T2>
  Object.defineProperties(obj, {
    args: {
      value(...params: ValidArrayItems): MinimumSchema {
        return (vFunction as any)(
          { returns: funcDef.returns, args: params },
          options,
        ) as MinimumSchema
      },
      enumerable: true,
      configurable: false,
      writable: false,
    },
    parameters: {
      value(params: MinimumArraySchema): MinimumSchema {
        return vFunction({ returns: funcDef.returns, parameters: params }, options) as MinimumSchema
      },
      enumerable: true,
      configurable: false,
      writable: false,
    },
    returns: {
      value(returns: MinimumSchema): MinimumSchema {
        return vFunction({ ...(functionDefinition as any), returns }, options) as MinimumSchema
      },
      enumerable: true,
      configurable: false,
      writable: false,
    },
  })
  return obj
}
