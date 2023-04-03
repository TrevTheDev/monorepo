/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, expect } from 'vitest'
// import { VInfer } from '../../src/types/base'
import { vAnyInstance, vArray, vUnion, vObject } from '../../src/types/init'
import { vStringInstance } from '../../src/types/string'
import { vNumberInstance } from '../../src/types/number'
import { vFunction } from '../../src/types/function'
import { VInfer } from '../../src/types/base'
import { vBooleanInstance } from '../../src/types/boolean'
import { vPromise } from '../../src/types/promise'
import { firstError } from '../../src/types/shared'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const args1 = vArray([vStringInstance] as const)
const returns1 = vNumberInstance
// const func1 = vFunctionWrapper(args1, returns1)
const func1 = vFunction({
  parameterTypes: args1,
  returnType: returns1,
})
it('function parsing', () => {
  const parsed = func1.parse((arg: any) => arg.length)
  parsed('asdf')
})

it('parsed function fail 1', () => {
  const parsed = func1.parse((x: string) => x)
  expect(() => parsed('asdf')).toThrow()
})

it('parsed function fail 2', () => {
  const parsed = func1.parse((x: string) => x)
  expect(() => parsed(13 as any)).toThrow()
})

it('function inference 1', () => {
  type Func1 = VInfer<typeof func1>
  assertEqual<Func1, (k: string) => number>(true)
})

it('args method', () => {
  const t1 = vFunction()
  type t1 = VInfer<typeof t1>
  assertEqual<t1, (...args_1: unknown[]) => unknown>(true)

  const t2 = t1.args(vStringInstance)
  type t2 = VInfer<typeof t2>
  assertEqual<t2, (arg: string) => unknown>(true)

  const t3 = t2.returns(vBooleanInstance)
  type t3 = VInfer<typeof t3>
  assertEqual<t3, (arg: string) => boolean>(true)
})

const args2 = vArray([
  vObject({
    f1: vNumberInstance,
    f2: vStringInstance.nullable(),
    f3: vArray(vBooleanInstance.optional()).optional(),
  }),
] as const)
const returns2 = vUnion([vStringInstance, vNumberInstance] as const)

const func2 = vFunction({ parameterTypes: args2, returnType: returns2 })

it('function inference 2', () => {
  type Func2 = VInfer<typeof func2>
  assertEqual<
    Func2,
    (arg: {
      f1: number
      f2: string | null
      f3?: (boolean | undefined)[] | undefined
    }) => string | number
  >(true)
})

it('valid function run', () => {
  const validFunc2Instance = func2.parse((_x) => 'adf' as any)
  //   const validFunc2Instance = func2.validate((_x) => {
  //     return 'adf' as any
  //   })

  const checker = () => {
    validFunc2Instance({
      f1: 21,
      f2: 'asdf',
      f3: [true, false],
    })
  }

  checker()
})

it('input validation error', () => {
  const invalidFuncInstance = func2.parse((_x) => 'adf' as any)

  const checker = () => {
    invalidFuncInstance('Invalid_input' as any)
  }

  expect(checker).toThrow()
})

it('output validation error', () => {
  const invalidFuncInstance = func2.parse((_x) => ['this', 'is', 'not', 'valid', 'output'] as any)

  const checker = () => {
    invalidFuncInstance({
      f1: 21,
      f2: 'asdf',
      f3: [true, false],
    })
  }

  expect(checker).toThrow()
})

// vFunctionWrapper(vArray([vStringInstance])).args()._def.args

it('special function error codes', () => {
  const checker = vFunction({
    parameterTypes: vArray([vStringInstance] as const),
    returnType: vBooleanInstance,
  }).parse((arg) => arg.length as any)
  try {
    checker('12' as any)
  } catch (err) {
    expect(firstError(err)).toBe('2 is not a boolean')
  }

  try {
    checker(12 as any)
  } catch (err) {
    expect(firstError(err)).toBe(`The array [12] is not of type [string].
at index 0: 12 is not a string`)
  }
})

it('function with async refinements', async () => {
  const func = vFunction({
    args: [vStringInstance.min(10)],
    returnType: vPromise(vNumberInstance.gt(10)),
  }).parse(async (arg: any) => arg.length as any)

  const results = [] as string[]
  try {
    await func('asdfasdf')
    results.push('success')
  } catch (err) {
    results.push('fail')
  }
  try {
    await func('asdflkjasdflkjsf')
    results.push('success')
  } catch (err) {
    results.push('fail')
  }

  expect(results).toEqual(['fail', 'success'])
})

it('non async function with async refinements should fail', async () => {
  const func = vFunction({
    args: [vStringInstance.min(10)],
    returnType: vPromise(vNumberInstance.gt(10)),
  }).parse((arg: any) => arg.length as any)

  const results = [] as string[]
  try {
    await func('asdasdfasdffasdf')
    results.push('success')
  } catch (err) {
    results.push('fail')
  }

  expect(results).toEqual(['fail'])
})

it('allow extra parameters', () => {
  const maxLength5 = vFunction({
    parameterTypes: vArray([vStringInstance, vArray(vAnyInstance).spread]),
    returnType: vBooleanInstance,
  }).parse(((str, _arg, _qewr) => str.length <= 5) as any)

  const filteredList = ['apple', 'orange', 'pear', 'banana', 'strawberry'].filter(maxLength5)
  expect(filteredList.length).toEqual(2)
})

it('params and returnType getters', () => {
  const func = vFunction().args(vStringInstance).returns(vStringInstance)

  func.definition.parameterTypes.definition.itemParsers[0].parse('asdf')
  func.definition.returnType.parse('asdf')
})

// it('inference with transforms', () => {
//   const funcSchema = z
//     .function()
//     .args(vStringInstance.transform((val) => val.length))
//     .returns(vObject({ val: vNumberInstance }))
//   const myFunc = funcSchema.implement((val) => {
//     return { val, extra: 'stuff' }
//   })
//   myFunc('asdf')

//   assertEqual<typeof myFunc, (arg: string, ...args_1: unknown[]) => { val: number; extra: string }>(
//     true,
//   )
// })

// it('fallback to OuterTypeOfFunction', () => {
//   const funcSchema = vFunctionWrapper({
//     parameterTypes: vArray([vStringInstance, vArray(vAnyInstance).spread]),
//     returnType: vBooleanInstance,
//     implementation: ((str, _arg, _qewr) => str.length <= 5) as any,
//   })

//   const funcSchema = vFunctionWrapper()
//     .args(vStringInstance.transform((val) => val.length))
//     .returns(vObject({ arg: vNumberInstance }).transform((val) => val.arg))

//   const myFunc = funcSchema.implement((val) => {
//     return { arg: val, arg2: false }
//   })

//   assertEqual<typeof myFunc, (arg: string, ...args_1: unknown[]) => number>(true)
// })
