/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-shadow */
import { it, expect } from 'vitest'
import { v } from '../../src'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

it('enum test with consts', () => {
  const Fruits: { Apple: 'apple'; Banana: 'banana' } = {
    Apple: 'apple',
    Banana: 'banana',
  }
  const fruitEnum = v.enum(Fruits)
  type fruitEnum = v.Infer<typeof fruitEnum>
  fruitEnum.parse('apple')
  fruitEnum.parse('banana')
  fruitEnum.parse(Fruits.Apple)
  fruitEnum.parse(Fruits.Banana)
  assertEqual<fruitEnum, 'apple' | 'banana'>(true)
})

it('enum test with real enum', () => {
  enum Fruits {
    Apple = 'apple',
    Banana = 'banana',
  }
  const fruitEnum = v.enum(Fruits)
  type fruitEnum = v.Infer<typeof fruitEnum>
  fruitEnum.parse('apple')
  fruitEnum.parse('banana')
  fruitEnum.parse(Fruits.Apple)
  fruitEnum.parse(Fruits.Banana)
  // assertIs<fruitEnum extends Fruits ? true : false>(true)
})

it('enum test with const with numeric keys', () => {
  const FruitValues = {
    Apple: 10,
    Banana: 20,
  } as const
  const fruitEnum = v.enum(FruitValues)
  type fruitEnum = v.Infer<typeof fruitEnum>
  fruitEnum.parse(10)
  fruitEnum.parse(20)
  fruitEnum.parse(FruitValues.Apple)
  fruitEnum.parse(FruitValues.Banana)
  assertEqual<fruitEnum, 10 | 20>(true)
})

it('from enum', () => {
  enum Fruits {
    Cantaloupe,
    Apple = 'apple',
    Banana = 'banana',
  }

  const FruitEnum = v.enum(Fruits as any)
  type FruitEnum = v.Infer<typeof FruitEnum>
  FruitEnum.parse(Fruits.Cantaloupe)
  FruitEnum.parse(Fruits.Apple)
  FruitEnum.parse('apple')
  FruitEnum.parse(0)
  expect(() => FruitEnum.parse(1)).toThrow()
  expect(() => FruitEnum.parse('Apple')).toThrow()
  // expect(() => FruitEnum.parse('Cantaloupe')).toThrow()
})

it('from const', () => {
  const Greek = {
    Alpha: 'a',
    Beta: 'b',
    Gamma: 3,
  } as const

  const GreekEnum = v.enum(Greek)
  type GreekEnum = v.Infer<typeof GreekEnum>
  GreekEnum.parse('a')
  GreekEnum.parse('b')
  GreekEnum.parse(3)
  expect(() => GreekEnum.parse('v')).toThrow()
  expect(() => GreekEnum.parse('Alpha')).toThrow()
  expect(() => GreekEnum.parse(2)).toThrow()

  expect(GreekEnum.enum.Alpha).toEqual('a')
})
