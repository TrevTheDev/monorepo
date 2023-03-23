import { it, expect } from 'vitest'
import { vObject } from '../../src/types/object'
import { vStringInstance } from '../../src/types/string'
import { vNumberInstance } from '../../src/types/number'
import { VInfer } from '../../src/types/base'
import { vAnyInstance } from '../../src/types/init'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const fish = vObject({
  name: vStringInstance,
  age: vNumberInstance,
  nested: vObject({}),
})

it('pick type inference', () => {
  const nameonlyFish = fish.pick('name')
  type nameonlyFish = VInfer<typeof nameonlyFish>
  assertEqual<nameonlyFish, { name: string }>(true)
})

it('pick parse - success', () => {
  const nameonlyFish = fish.pick('name')
  nameonlyFish.parse({ name: 'bob' })

  const anotherNameonlyFish = fish.pick('name')
  anotherNameonlyFish.parse({ name: 'bob' })
})

it('pick parse - fail', () => {
  fish.pick('name').parse({ name: '12' } as any)
  fish.pick('name', 'age').parse({ name: 'bob', age: 12 } as any)
  fish.pick('age').parse({ age: 12 } as any)

  const nameonlyFish = fish.pick('name')
  const bad1 = () => nameonlyFish.parse({ name: 12 } as any)
  const bad2 = () => nameonlyFish.parse({ name: 'bob', age: 12 } as any)
  const bad3 = () => nameonlyFish.parse({ age: 12 } as any)

  const anotherNameonlyFish = fish.pick('name')
  const bad4 = () => anotherNameonlyFish.parse({ name: 'bob', age: 12 } as any)

  expect(bad1).toThrow()
  expect(bad2).toThrow()
  expect(bad3).toThrow()
  expect(bad4).toThrow()
})

it('omit type inference', () => {
  const nonameFish = fish.omit('name')
  type nonameFish = VInfer<typeof nonameFish>
  assertEqual<nonameFish, { age: number; nested: {} }>(true)
})

it('omit parse - success', () => {
  const nonameFish = fish.omit('name')
  nonameFish.parse({ age: 12, nested: {} })

  const anotherNonameFish = fish.omit('name')
  anotherNonameFish.parse({ age: 12, nested: {} })
})

it('omit parse - fail', () => {
  const nonameFish = fish.omit('name')
  const bad1 = () => nonameFish.parse({ name: 12 } as any)
  const bad2 = () => nonameFish.parse({ age: 12 } as any)
  const bad3 = () => nonameFish.parse({} as any)

  const anotherNonameFish = fish.omit('name')
  const bad4 = () => anotherNonameFish.parse({ nested: {} } as any)

  expect(bad1).toThrow()
  expect(bad2).toThrow()
  expect(bad3).toThrow()
  expect(bad4).toThrow()
})

it('nonstrict inference', () => {
  const laxfish = fish.pick('name').catchAll(vAnyInstance)
  type laxfish = VInfer<typeof laxfish>
  assertEqual<laxfish, { name: string } & { [k: string]: any }>(true)
})

it('nonstrict parsing - pass', () => {
  const laxfish = fish.passThrough().pick('name')
  laxfish.parse({ name: 'asdf', whatever: 'asdf' })
  laxfish.parse({ name: 'asdf', age: 12, nested: {} })
})

it('nonstrict parsing - fail', () => {
  const laxfish = fish.passThrough().pick('name')
  const bad = () => laxfish.parse({ whatever: 'asdf' } as any)
  expect(bad).toThrow()
})
