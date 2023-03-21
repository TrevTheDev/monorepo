import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { vString } from '../../../src/validate/string'
import { vArray } from '../../../src/validate/array'
import { vLiteral } from '../../../src/validate/literal'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const t = [vString(), z.object({ name: vLiteral('Rudy') }), vArray(vLiteral('blue'))] as const

const testTuple = z.tuple(t)

const testData = ['asdf', { name: 'Rudy' }, ['blue']]
const badData = [123, { name: 'Rudy2' }, ['blue', 'red']]
describe('adapted from zod tuple', () => {
  it('tuple inference', () => {
    const args1 = z.tuple([z.string()])
    const returns1 = z.number()
    const func1 = z.function(args1, returns1)
    type func1 = z.TypeOf<typeof func1>
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
      if (err instanceof ZodError) expect(err.issues.length).toEqual(3)
    }
  })

  it('failed async validation', async () => {
    const res = await testTuple.safeParse(badData)
    expect(res.success).toEqual(false)
    if (!res.success) expect(res.error.issues.length).toEqual(3)

    // try {
    //   checker();
    // } catch (err) {
    //   if (err instanceof ZodError) {
    //     expect(err.issues.length).toEqual(3);
    //   }
    // }
  })

  it('tuple with transformers', () => {
    const stringToNumber = z.string().transform((val) => val.length)
    const val = z.tuple([stringToNumber])

    type t1 = z.input<typeof val>
    assertEqual<t1, [string]>(true)
    type t2 = z.output<typeof val>
    assertEqual<t2, [number]>(true)
    expect(val.parse(['1234'])).toEqual([4])
  })

  it('tuple with rest schema', () => {
    const myTuple = z.tuple([z.string(), z.number()]).rest(z.boolean())
    expect(myTuple.parse(['asdf', 1234, true, false, true])).toEqual([
      'asdf',
      1234,
      true,
      false,
      true,
    ])

    expect(myTuple.parse(['asdf', 1234])).toEqual(['asdf', 1234])

    expect(() => myTuple.parse(['asdf', 1234, 'asdf'])).toThrow()
    type t1 = z.output<typeof myTuple>

    assertEqual<t1, [string, number, ...boolean[]]>(true)
  })

  it('parse should fail given sparse array as tuple', () => {
    expect(() => testTuple.parse(new Array(3))).toThrow()
  })

  // it('tuple with optional elements', () => {
  //   const result = z
  //     .tuple([z.string(), z.number().optional()])
  //     .safeParse(['asdf']);
  //   expect(result).toEqual(['asdf']);
  // });
})
