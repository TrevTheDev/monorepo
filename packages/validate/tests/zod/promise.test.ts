import { it, expect } from 'vitest'

import { ValidatedPromise, vPromise } from '../../src/types/promise'
import { vStringInstance } from '../../src/types/string'
import { vNumberInstance } from '../../src/types/number'
import { VInfer } from '../../src/types/base'
import { vLiteral, vObject } from '../../src/types/init'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const promSchema = vPromise(
  vObject({
    name: vStringInstance,
    age: vNumberInstance,
  }),
)

it('promise inference', () => {
  type promSchemaType = VInfer<typeof promSchema>
  assertEqual<promSchemaType, ValidatedPromise<{ name: string; age: number }>>(true)
})

it('promise parsing success', async () => {
  const pr = promSchema.parse(Promise.resolve({ name: 'Bobby', age: 10 }))
  expect(pr.toString()).toBe(`[object ValidatedPromise<{name:string,age:number}>]`)
  const result = await pr
  expect(typeof result).toBe('object')
  expect(typeof result.age).toBe('number')
  expect(typeof result.name).toBe('string')
})

it('promise parsing success 2', () => {
  const fakePromise = {
    then() {
      return this
    },
    catch() {
      return this
    },
  }
  promSchema.parse(fakePromise)
})

it('promise parsing fail', async () => {
  const bad = promSchema.parse(Promise.resolve({ name: 'Bobby', age: '10' }))
  // return await expect(bad).resolves.toBe({ name: 'Bobby', age: '10' });
  await expect(bad).rejects.toMatchObject({
    errors: [
      `The object {"name":"Bobby","age":"10"} is not of type {name:string,age:number}.
"age": "10" is not a number`,
    ],
    input: {
      age: '10',
      name: 'Bobby',
    },
  })
  // done();
})

it('promise parsing fail 2', async () => {
  const failPromise = promSchema.parse(Promise.resolve({ name: 'Bobby', age: '10' }))
  await expect(failPromise).rejects.toMatchObject({
    errors: [
      `The object {"name":"Bobby","age":"10"} is not of type {name:string,age:number}.
"age": "10" is not a number`,
    ],
    input: {
      age: '10',
      name: 'Bobby',
    },
  })
})

it('promise parsing fail', () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const bad = () => promSchema.parse({ then: () => {}, catch: {} })
  expect(bad).toThrow()
})

// const asyncFunction = z.function(z.tuple([]), promSchema)

// it('async function pass', async () => {
//   const validatedFunction = asyncFunction.implement(async () => ({ name: 'jimmy', age: 14 }))
//   await expect(validatedFunction()).resolves.toEqual({
//     name: 'jimmy',
//     age: 14,
//   })
// })

// it('async function fail', async () => {
//   const validatedFunction = asyncFunction.implement(() => {
//     return Promise.resolve('asdf' as any)
//   })
//   await expect(validatedFunction()).rejects.toBeInstanceOf(z.ZodError)
// })

it('async promise parsing', () => {
  const res = vPromise(vNumberInstance).parse(Promise.resolve(12))
  expect(res.toString()).toBe(`[object ValidatedPromise<number>]`)
})

it('resolves', () => {
  const foo = vLiteral('foo')
  const res = vPromise(foo)
  expect(res.definition.resultParser).toEqual(foo)
})
