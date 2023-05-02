/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { it, expect } from 'vitest'

import { v } from '../../src'

const fish = v.object({
  name: v.string,
  age: v.number,
  nested: v.object({}),
})

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

it('pick type inference', () => {
  const nameOnlyFish = fish.pick('name')
  type nameOnlyFish = v.Infer<typeof nameOnlyFish>
  assertEqual<nameOnlyFish, { name: string }>(true)
})

it('pick parse - success', () => {
  const nameOnlyFish = fish.pick('name')
  nameOnlyFish.parse({ name: 'bob' })

  const anotherNameOnlyFish = fish.pick('name')
  anotherNameOnlyFish.parse({ name: 'bob' })
})

it('pick parse - fail', () => {
  fish.pick('name').parse({ name: '12' } as any)
  fish.pick('name', 'age').parse({ name: 'bob', age: 12 } as any)
  fish.pick('age').parse({ age: 12 } as any)

  const nameOnlyFish = fish.pick('name')
  const bad1 = () => nameOnlyFish.parse({ name: 12 } as any)
  const bad2 = () => nameOnlyFish.parse({ name: 'bob', age: 12 } as any)
  const bad3 = () => nameOnlyFish.parse({ age: 12 } as any)

  const anotherNameOnlyFish = fish.pick('name').strict()
  const bad4 = () => anotherNameOnlyFish.parse({ name: 'bob', age: 12 } as any)

  expect(bad1).toThrow()
  expect(bad2).toThrow()
  expect(bad3).toThrow()
  expect(bad4).toThrow()
})

it('omit type inference', () => {
  const nonameFish = fish.omit('name')
  type nonameFish = v.Infer<typeof nonameFish>
  assertEqual<nonameFish, { age: number; nested: {} }>(true)
})

it.skip('omit parse - success', () => {
  const nonameFish = fish.omit('name')
  nonameFish.parse({ age: 12, nested: {} })

  const anotherNonameFish = fish.omit('name', 'age')
  anotherNonameFish.parse({ age: 12, nested: {} })
})

it('omit parse - fail', () => {
  const nonameFish = fish.omit('name')
  const bad1 = () => nonameFish.parse({ name: 12 } as any)
  const bad2 = () => nonameFish.parse({ age: 12 } as any)
  const bad3 = () => nonameFish.parse({} as any)

  const anotherNonameFish = fish.omit('name')
  const bad4 = () => anotherNonameFish.parse({ nested: {} })

  expect(bad1).toThrow()
  expect(bad2).toThrow()
  expect(bad3).toThrow()
  expect(bad4).toThrow()
})

it('nonstrict inference', () => {
  const laxFish = fish.pick('name').catchAll(v.any)
  type laxFish = v.Infer<typeof laxFish>
  assertEqual<laxFish, { name: string } & { [k: PropertyKey]: any }>(true)
})

it('nonstrict parsing - pass', () => {
  const laxFish = fish.passThrough().pick('name')
  laxFish.parse({ name: 'asdf', whatever: 'asdf' })
  laxFish.parse({ name: 'asdf', age: 12, nested: {} })
})

it('nonstrict parsing - fail', () => {
  const laxFish = fish.passThrough().pick('name')
  const bad = () => laxFish.parse({ whatever: 'asdf' } as any)
  expect(bad).toThrow()
})
