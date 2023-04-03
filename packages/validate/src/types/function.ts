/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeepWriteable, ResultError } from 'toolbelt'
import {
  MinimumSafeParsableObject,
  ParserObject,
  SafeParsableObject,
  SafeParseFn,
  VInfer,
  createFinalBaseObject,
  defaultErrorFnSym,
  parserObject,
} from './base'
import { MinimumSafeParsableArray, VArrayFinite, ValidArrayItem } from './array'
import { baseObject, vArray } from './init'
import {
  SingleValidationError,
  ValidationErrors,
  createValidationBuilder,
} from './base validations'
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

type FunctionOptions<Output extends Fn> =
  | {
      parseFunctionError: DefaultErrorFn['parseFunction']
    }
  | {
      parser: SafeParseFn<unknown, Output>
    }
  | Record<string, never>

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
  parameterTypes: MinimumSafeParsableArray | undefined
  returnType: MinimumSafeParsableObject | undefined
}

type FunctionDefinitionType1<
  P extends ValidArrayItem[] = ValidArrayItem[],
  R extends MinimumSafeParsableObject = MinimumSafeParsableObject,
> = {
  args: P
  returnType?: R | undefined
}

type FunctionDefinitionType2<
  P extends MinimumSafeParsableArray = MinimumSafeParsableArray,
  R extends MinimumSafeParsableObject = MinimumSafeParsableObject,
> = {
  parameterTypes: P
  returnType?: R | undefined
}

type PartialFunctionDefinition =
  | FunctionDefinitionType1
  | FunctionDefinitionType2
  | Record<string, never>

interface PartialToFuncDef<T extends PartialFunctionDefinition> extends FunctionDefinition {
  parameterTypes: T extends {
    args: infer A extends ValidArrayItem[]
  }
    ? VArrayFinite<A>
    : T extends { parameterTypes: infer B extends MinimumSafeParsableArray }
    ? B
    : undefined
  returnType: T extends { returnType: infer C extends MinimumSafeParsableObject } ? C : undefined
}

interface FunctionDefToFunction<
  T extends FunctionDefinition,
  P extends MinimumSafeParsableArray | undefined = T['parameterTypes'],
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
  parameterTypes: P,
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
      parameterTypes ? parameterTypes.parse(args) : args
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

export function vFunctionWrapper<
  const P extends ValidArrayItem[],
  const R extends MinimumSafeParsableObject,
  PW extends ValidArrayItem[] = DeepWriteable<P>,
>(
  functionDefinition: FunctionDefinitionType1<P, R> & {
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
  let paramParser: MinimumSafeParsableArray | undefined = (functionDefinition as any).parameterTypes
  if ('args' in functionDefinition) paramParser = vArray(functionDefinition.args)
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
  T extends FunctionDefinition,
  RT extends Fn = FunctionDefToFunction<T>['fn'],
>(functionDefinition: T, options: FunctionOptions<RT> = {}): SafeParseFn<unknown, RT> {
  const { parameterTypes, returnType } = functionDefinition
  const rFn =
    parameterTypes === undefined && returnType === undefined
      ? (value: RT) => value
      : (value: RT) => vFunctionWrapperB(parameterTypes, returnType, value)
  return (value: unknown): ResultError<ValidationErrors, RT> => {
    if (typeof value === 'function') return [undefined, rFn(value as any) as RT]
    return [
      {
        input: value,
        errors: [
          ('parseFunctionError' in options ? options.parseFunctionError : errorFns.parseFunction)(
            value,
          ),
        ],
      },
      undefined,
    ]
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
  Output extends Fn = FunctionDefToFunction<T>['fn'],
  Input = unknown,
> extends SafeParsableObject<Output, string, 'function', Input> {
  [parserObject]: ParserObject<
    Output,
    string,
    'function',
    Input,
    {
      readonly parameterTypes: MinimumSafeParsableArray
      readonly returnType: MinimumSafeParsableObject
    }
  >
  readonly definition: {
    readonly parameterTypes: MinimumSafeParsableArray
    readonly returnType: MinimumSafeParsableObject
  }
  // functionDefinition: T
  args<S extends ValidArrayItem[]>(
    ...params: S
  ): T['parameterTypes'] extends MinimumSafeParsableArray
    ? never
    : VFunction<PartialToFuncDef<{ args: S; returnType: T['returnType'] }>>
  parameterTypes<S extends MinimumSafeParsableArray>(
    types: S,
  ): VFunction<PartialToFuncDef<{ parameterTypes: S; returnType: T['returnType'] }>>
  returns<S extends MinimumSafeParsableObject>(
    returnType: S,
  ): VFunction<Omit<T, 'returnType'> & { returnType: S }>
  // default validations
  customValidations<S extends unknown[]>(
    customValidator: (value: Output, ...otherArgs: S) => SingleValidationError | undefined,
    ...otherArgs: S
  ): this
}

const baseFunctionObject = createValidationBuilder(baseObject, functionValidations as any)

function finaliseFunctionDefinition<T extends PartialFunctionDefinition>(
  functionDefinition?: T,
): PartialToFuncDef<T> {
  if (functionDefinition) {
    let parameterTypes: MinimumSafeParsableArray | undefined
    if ('args' in functionDefinition && functionDefinition.args)
      parameterTypes = vArray(functionDefinition.args)
    else if ('parameterTypes' in functionDefinition)
      parameterTypes = functionDefinition.parameterTypes
    return {
      parameterTypes,
      returnType: functionDefinition.returnType,
    } as unknown as PartialToFuncDef<T>
  }
  return {
    parameterTypes: undefined,
    returnType: undefined,
  } as unknown as PartialToFuncDef<T>
}

export function vFunction<
  T extends PartialFunctionDefinition,
  T2 extends FunctionDefinition = PartialToFuncDef<T>,
>(
  functionDefinition?: T,
  options: FunctionOptions<FunctionDefToFunction<T2>['fn']> = {},
): VFunction<T2> {
  const funcDef: FunctionDefinition = finaliseFunctionDefinition(functionDefinition)

  const obj = createFinalBaseObject(
    baseFunctionObject,
    (options as any).parser || parseFunction(funcDef, options),
    `Function<(...args: ${
      funcDef.parameterTypes !== undefined ? funcDef.parameterTypes.type : 'unknown[]'
    })=>${funcDef.returnType !== undefined ? funcDef.returnType.type : 'unknown'}>`,
    'function',
    funcDef,
  ) as VFunction<T2>
  Object.defineProperties(obj, {
    args: {
      value(...params: ValidArrayItem[]): MinimumSafeParsableObject {
        if (funcDef.parameterTypes !== undefined)
          throw new Error('args cannot be set, if a parameterTypes has been supplied')
        return (vFunction as any)(
          { returnType: funcDef.returnType, args: params },
          options,
        ) as MinimumSafeParsableObject
      },
    },
    parameterTypes: {
      value(params: MinimumSafeParsableArray): MinimumSafeParsableObject {
        return vFunction(
          { returnType: funcDef.returnType, parameterTypes: params },
          options,
        ) as MinimumSafeParsableObject
      },
    },
    returns: {
      value(returnType: MinimumSafeParsableObject): MinimumSafeParsableObject {
        return vFunction(
          { ...(functionDefinition as any), returnType },
          options,
        ) as MinimumSafeParsableObject
      },
    },
  })
  return obj
}
