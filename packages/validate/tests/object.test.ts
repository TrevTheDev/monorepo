import { describe, it, expect } from 'vitest'
import { vObject } from '../src/types/object'
import { vNumberInstance } from '../src/types/number'
import { vString, vStringInstance } from '../src/types/string'
import { vAnyInstance, vArray, vUnion } from '../src/types/init'
import { vBoolean, vBooleanInstance } from '../src/types/boolean'
import { VInfer } from '../src/types/base'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const u = vUnion([vString(), vBoolean()] as const)

const test = vObject({
  f1: vNumberInstance,
  f2: vStringInstance.optional(),
  f3: vStringInstance.nullable(),
  f4: vArray(vObject({ t: u })),
})
const successData1 = { f1: 1, f2: 'a', f3: 'b', f4: [{ t: 't' }] }
const successData2 = { f1: 1, f3: null, f4: [{ t: 't' }] }
const failData1 = { f1: 'a', f2: 'a', f3: 'b', f4: [{ t: 't' }] }
const failData2 = { f1: 1, f2: 'a', f3: 'b', f4: [{ t: 1 }] }
type Test = VInfer<typeof test>

describe('object', () => {
  it('object type inference', () => {
    type TestType = {
      f1: number
      f2?: string | undefined
      f3: string | null
      f4: { t: string | boolean }[]
    }

    assertEqual<Test, TestType>(true)
  })
  it('parses', () => {
    const result = test.parse(successData1)
    expect(result).toEqual(successData1)
    const result2 = test.parse(successData2)
    expect(result2).toEqual(successData2)
  })
  it('parse fails', () => {
    expect(() => test.parse(failData1)).toThrow()
    expect(() => test.parse(failData2)).toThrow()
  })
  it('pick', () => {
    const test2 = test.pick('f1')
    const data = { f1: 1 }
    const result = test2.parse(data)
    assertEqual<typeof result, { f1: number }>(true)
    expect(result).toEqual(data)
    expect(() => test2.parse(successData1)).toThrow()
  })
  it('omit', () => {
    const test2 = test.omit('f2', 'f3', 'f4')
    const data = { f1: 1 }
    const result = test2.parse(data)
    assertEqual<typeof result, { f1: number }>(true)
    expect(result).toEqual(data)
    expect(() => test2.parse(successData1)).toThrow()
  })
  it('catchAll', () => {
    const test2 = test.pick('f1').catchAll(vAnyInstance)
    const result = test2.parse(failData2)
    assertEqual<typeof result, { f1: number } & { [P: keyof any]: unknown }>(true)
    expect(result).toEqual(failData2)
  })
  it('passThrough and strict', () => {
    const test2 = test.pick('f1').passThrough()
    const result = test2.parse(failData2)
    assertEqual<typeof result, { f1: number } & { [P: keyof any]: unknown }>(true)
    expect(result).toEqual(failData2)
    const test3 = test2.strict()
    const result2 = test3.parse({ f1: 1 })
    assertEqual<typeof result2, { f1: number }>(true)
    expect(() => test3.parse(failData2)).toThrow()
  })
  it('extends', () => {
    const test2 = test.pick('f1').extends({ f5: vBooleanInstance })
    const data = { f1: 1, f5: true }
    const result = test2.parse(data)
    assertEqual<typeof result, { f1: number; f5: boolean }>(true)
    expect(result).toEqual(data)
    expect(() => test2.parse(successData1)).toThrow()
    const test3 = test.pick('f1').extends({ f2: vBooleanInstance })
    const data3 = { f1: 1, f2: true }
    const result2 = test3.parse(data3)
    assertEqual<typeof result2, { f1: number; f2: boolean }>(true)
    expect(result2).toEqual(data3)
  })
  it('partial', () => {
    const test2 = test.partial()
    const data = {}
    const result = test2.parse(data)
    assertEqual<
      typeof result,
      {
        f1?: number
        f2?: string | undefined
        f3?: string | null
        f4?: { t: string | boolean }[]
      }
    >(true)
    expect(result).toEqual(data)
    expect(test2.parse(data)).toEqual(data)
    expect(test2.parse(successData1)).toEqual(successData1)
  })
  it('required', () => {
    const test2 = test.partial().required()
    const result = test2.parse(successData1)
    assertEqual<
      typeof result,
      {
        f1: number
        f2: string
        f3: string | null
        f4: { t: string | boolean }[]
      }
    >(true)
    expect(result).toEqual(successData1)
    expect(() => test2.parse({})).toThrow()
  })
})
