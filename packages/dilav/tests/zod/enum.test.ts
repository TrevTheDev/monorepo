import { it, expect } from 'vitest'
import { v } from '../../src'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

it('create enum', () => {
  const MyEnum = v.enum(['Red', 'Green', 'Blue'])
  // expect(MyEnum.Values.Red).toEqual('Red')
  // expect(MyEnum.Enum.Red).toEqual('Red')
  expect(MyEnum.enum.Red).toEqual('Red')
})

it('Infer enum', () => {
  const MyEnum = v.enum(['Red', 'Green', 'Blue'])
  type MyEnum = v.Infer<typeof MyEnum>
  assertEqual<MyEnum, 'Red' | 'Green' | 'Blue'>(true)
})

it('get options', () => {
  expect(v.enum(['tuna', 'trout']).enum).toEqual({
    trout: 'trout',
    tuna: 'tuna',
  })
})

it('readonly enum', () => {
  const HTTP_SUCCESS = ['200', '201'] as const
  const arg = v.enum(HTTP_SUCCESS)
  type arg = v.Infer<typeof arg>
  assertEqual<arg, '200' | '201'>(true)

  arg.parse('201')
  expect(() => arg.parse('202')).toThrow()
})

it('error params', () => {
  const result = v
    .enum(['test'], { noMatchFoundInLiteralUnion: () => 'REQUIRED' })
    .safeParse(undefined)
  expect(v.isResult(result)).toEqual(false)
  if (v.isError(result)) expect(result[0].errors[0]).toEqual('REQUIRED')
})

it('extract/exclude', () => {
  const foods = ['Pasta', 'Pizza', 'Tacos', 'Burgers', 'Salad'] as const
  const FoodEnum = v.enum(foods)
  const ItalianEnum = FoodEnum.extract('Pasta', 'Pizza')
  const UnhealthyEnum = FoodEnum.exclude('Salad')
  // const EmptyFoodEnum = FoodEnum.exclude(foods)

  assertEqual<v.Infer<typeof ItalianEnum>, 'Pasta' | 'Pizza'>(true)
  assertEqual<v.Infer<typeof UnhealthyEnum>, 'Pasta' | 'Pizza' | 'Tacos' | 'Burgers'>(true)

  // assertEqual<typeof EmptyFoodEnum, v.ZodEnum<[]>>(true)
  // assertEqual<v.Infer<typeof EmptyFoodEnum>, never>(true)
  ItalianEnum.parse('Pasta')
  expect(() => ItalianEnum.parse('Tacos')).toThrow()
  UnhealthyEnum.parse('Pasta')
  expect(() => UnhealthyEnum.parse('Salad')).toThrow()
})
