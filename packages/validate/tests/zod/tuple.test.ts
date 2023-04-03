import { it, expect } from 'vitest'
import { vStringInstance } from '../../src/types/string'
import { vNumberInstance } from '../../src/types/number'
import { vBooleanInstance } from '../../src/types/boolean'
import { vArray, vLiteral, vObject } from '../../src/types/init'
import { VInfer } from '../../src/types/base'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const t = [vStringInstance, vObject({ name: vLiteral('Rudy') }), vArray(vLiteral('blue'))] as const

const testTuple = vArray(t)

const testData = ['asdf', { name: 'Rudy' }, ['blue']]
const badData = [123, { name: 'Rudy2' }, ['blue', 'red']]

// it('tuple inference', () => {
//   const args1 = vArray([vStringInstance])
//   const returns1 = vNumberInstance
//   const func1 = z.function(args1, returns1)
//   type func1 = z.TypeOf<typeof func1>
//   assertEqual<func1, (k: string) => number>(true)
// })

it('successful validation', () => {
  const val = testTuple.parse(testData)
  expect(val).toEqual(['asdf', { name: 'Rudy' }, ['blue']])
})

// it('successful async validation', async () => {
//   const val = await testTuple.parseAsync(testData)
//   return expect(val).toEqual(testData)
// })

it('failed validation', () => {
  const checker = () => {
    testTuple.parse([123, { name: 'Rudy2' }, ['blue', 'red']] as any)
  }
  try {
    checker()
  } catch (err) {
    debugger
    if (err) expect(err.errors.length).toEqual(1)
  }
})

it('failed async validation', () => {
  const res = testTuple.safeParse(badData)
  debugger
  expect(res[1] === undefined).toEqual(true)
  if (res[1] === undefined) expect(res[0].errors.length).toEqual(1)

  // try {
  //   checker();
  // } catch (err) {
  //   if (err instanceof ZodError) {
  //     expect(err.issues.length).toEqual(3);
  //   }
  // }
})

// it('tuple with transformers', () => {
//   const stringToNumber = vStringInstance().transform((val) => val.length)
//   const val = vArray([stringToNumber])

//   type t1 = z.input<typeof val>
//   assertEqual<t1, [string]>(true)
//   type t2 = z.output<typeof val>
//   assertEqual<t2, [number]>(true)
//   expect(val.parse(['1234'])).toEqual([4])
// })

it('tuple with rest schema', () => {
  const myTuple = vArray([
    vStringInstance,
    vNumberInstance,
    vArray(vBooleanInstance).spread,
  ] as const)
  expect(myTuple.parse(['asdf', 1234, true, false, true])).toEqual([
    'asdf',
    1234,
    true,
    false,
    true,
  ])

  expect(myTuple.parse(['asdf', 1234])).toEqual(['asdf', 1234])

  expect(() => myTuple.parse(['asdf', 1234, 'asdf'])).toThrow()
  type t1 = VInfer<typeof myTuple>

  assertEqual<t1, [string, number, ...boolean[]]>(true)
})

it('parse should fail given sparse array as tuple', () => {
  expect(() => testTuple.parse(new Array(3))).toThrow()
})

// it('tuple with optional elements', () => {
//   const result = z
//     .tuple([vStringInstance(), vNumberInstance().optional()])
//     .safeParse(['asdf']);
//   expect(result).toEqual(['asdf']);
// });
