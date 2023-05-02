import { it, expect } from 'vitest'
import { v } from '../../src'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const testTuple = v.array([
  v.string,
  v.object({ name: v.literal('Rudy') }),
  v.array(v.literal('blue')),
])
const testData = ['asdf', { name: 'Rudy' }, ['blue']]
const badData = [123, { name: 'Rudy2' }, ['blue', 'red']]

it('tuple inference', () => {
  const args1 = v.array([v.string])
  const returns1 = v.number
  const func1 = v.function({ parameters: args1, returns: returns1 })
  type func1 = v.Infer<typeof func1>
  assertEqual<func1, (k: string) => number>(true)
})

it('successful validation', () => {
  const val = testTuple.parse(testData)
  expect(val).toEqual(['asdf', { name: 'Rudy' }, ['blue']])
})

it('successful async validation', async () => {
  const val = await testTuple.parseAsync(testData)
  return expect(val).toEqual(testData)
})

it('failed validation', () => {
  const checker = () => {
    testTuple.parse([123, { name: 'Rudy2' }, ['blue', 'red']] as any)
  }
  try {
    checker()
  } catch (err) {
    if (err instanceof v.ValidationError) expect(err.errors.length).toEqual(1)
  }
})

it('failed async validation', async () => {
  const res = await testTuple.safeParse(badData)
  expect(v.isResult(res)).toEqual(false)
  if (v.isError(res)) expect(res[0].errors.length).toEqual(1)

  // try {
  //   checker();
  // } catch (err) {
  //   if (err instanceof ZodError) {
  //     expect(err.issues.length).toEqual(3);
  //   }
  // }
})

it('tuple with transformers', () => {
  const stringToNumber = v.string.transform((val) => val.length)
  const val = v.array([stringToNumber])

  type t2 = v.Infer<typeof val>
  assertEqual<t2, [number]>(true)
  expect(val.parse(['1234'])).toEqual([4])
})

it('tuple with rest schema', () => {
  const myTuple = v.array([v.string, v.number, v.array(v.boolean).spread])
  expect(myTuple.parse(['asdf', 1234, true, false, true])).toEqual([
    'asdf',
    1234,
    true,
    false,
    true,
  ])

  expect(myTuple.parse(['asdf', 1234])).toEqual(['asdf', 1234])

  expect(() => myTuple.parse(['asdf', 1234, 'asdf'])).toThrow()
  type t1 = v.Infer<typeof myTuple>

  assertEqual<t1, [string, number, ...boolean[]]>(true)
})

it('parse should fail given sparse array as tuple', () => {
  expect(() => testTuple.parse(new Array(3))).toThrow()
})

// it('tuple with optional elements', () => {
//   const result = z
//     .array([v.string, v.number.optional()])
//     .safeParse(['asdf']);
//   expect(result).toEqual(['asdf']);
// });
