import { describe, it, expect } from 'vitest'
import { vEnum } from '../../../src/validate/enum'
import { isError, isResult } from '../../../src/result error'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

describe('adapted from zod enum', () => {
  it('create enum', () => {
    const MyEnum = vEnum(['Red', 'Green', 'Blue'])
    MyEnum.parse('Red')
    expect(() => MyEnum.parse('Grey')).toThrow()
    debugger
    expect(MyEnum.type).toEqual(`'Red'|'Green'|'Blue'`)
    // expect(MyEnum.Values.Red).toEqual('Red')
    // expect(MyEnum.Enum.Red).toEqual('Red')
    // expect(MyEnum.enum.Red).toEqual('Red')
  })

  it('infer enum', () => {
    const MyEnum = vEnum(['Red', 'Green', 'Blue'])
    type MyEnum = ReturnType<(typeof MyEnum)['parse']>
    assertEqual<MyEnum, 'Red' | 'Green' | 'Blue'>(true)
  })

  it('get options', () => {
    expect(vEnum(['tuna', 'trout']).options).toEqual(['tuna', 'trout'])
  })

  it('readonly enum', () => {
    const HTTP_SUCCESS = ['200', '201'] as const
    const arg = vEnum(HTTP_SUCCESS)
    type arg = ReturnType<(typeof arg)['parse']>
    assertEqual<arg, '200' | '201'>(true)

    arg.parse('201')
    expect(() => arg.parse('202')).toThrow()
  })

  it('error params', () => {
    const result = vEnum(['test'], () => 'REQUIRED').safeParse(undefined)
    expect(isResult(result)).toEqual(false)
    if (isError(result)) expect(result[0].errors[0]).toEqual('REQUIRED')
  })

  it('extract/exclude', () => {
    const foods = ['Pasta', 'Pizza', 'Tacos', 'Burgers', 'Salad'] as const
    const FoodEnum = vEnum(foods)
    const ItalianEnum = FoodEnum.extract(['Pasta', 'Pizza'])
    ItalianEnum.parse('Pasta')
    expect(() => ItalianEnum.parse('Tacos')).toThrow()
    const UnhealthyEnum = FoodEnum.exclude(['Salad'])
    UnhealthyEnum.parse('Pasta')
    expect(() => UnhealthyEnum.parse('Salad')).toThrow()
    const EmptyFoodEnum = FoodEnum.exclude(foods)
    expect(() => EmptyFoodEnum.parse('Salad')).toThrow()

    assertEqual<ReturnType<(typeof ItalianEnum)['parse']>, 'Pasta' | 'Pizza'>(true)
    assertEqual<
      ReturnType<(typeof UnhealthyEnum)['parse']>,
      'Pasta' | 'Pizza' | 'Tacos' | 'Burgers'
    >(true)
    assertEqual<ReturnType<(typeof EmptyFoodEnum)['parse']>, never>(true)
    assertEqual<ReturnType<(typeof EmptyFoodEnum)['parse']>, never>(true)
  })
})
