/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, expect } from 'vitest'
import { isResult } from 'toolbelt'
import { vStringInstance } from '../../src/types/string'
import { vMap } from '../../src/types/map'
import { VInfer } from '../../src/types/base'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const stringMap = vMap([vStringInstance, vStringInstance], { breakOnFirstError: false })
type stringMap = VInfer<typeof stringMap>

it('type inference', () => {
  assertEqual<stringMap, Map<string, string>>(true)
})

it('valid parse', () => {
  const result = stringMap.safeParse(
    new Map([
      ['first', 'foo'],
      ['second', 'bar'],
    ]),
  )
  expect(isResult(result)).toEqual(true)
  if (isResult(result)) {
    expect(result[1].has('first')).toEqual(true)
    expect(result[1].has('second')).toEqual(true)
    expect(result[1].get('first')).toEqual('foo')
    expect(result[1].get('second')).toEqual('bar')
  }
})

// it('valid parse async', async () => {
//   const result = stringMap.spa(
//     new Map([
//       ['first', 'foo'],
//       ['second', 'bar'],
//     ]),
//   )
//   expect(isResult(result)).toEqual(true)
//   if (isResult(result)) {
//     expect(result[1].has('first')).toEqual(true)
//     expect(result[1].has('second')).toEqual(true)
//     expect(result[1].get('first')).toEqual('foo')
//     expect(result[1].get('second')).toEqual('bar')
//   }
// })

it('throws when a Set is given', () => {
  const result = stringMap.safeParse(new Set([]))
  expect(isResult(result)).toEqual(false)
  if (!isResult(result)) expect(result[0].errors.length).toEqual(1)
})

it('throws when the given map has invalid key and invalid input', () => {
  // eslint-disable-next-line symbol-description
  const result = stringMap.safeParse(new Map([[42, Symbol()]]))
  expect(isResult(result)).toEqual(false)
  if (!isResult(result)) expect(result[0].errors.length).toEqual(2)
})

it('throws when the given map has multiple invalid entries', () => {
  // const result = stringMap.safeParse(new Map([[42, Symbol()]]));

  const result = stringMap.safeParse(
    new Map([
      [1, 'foo'],
      ['bar', 2],
    ] as [any, any][]) as Map<any, any>,
  )

  // const result = stringMap.safeParse(new Map([[42, Symbol()]]));
  expect(isResult(result)).toEqual(false)
  if (!isResult(result)) expect(result[0].errors.length).toEqual(2)
})

// it('dirty', () => {
//   const map = z.map(
//     z.string().refine((val) => val === val.toUpperCase(), {
//       message: 'Keys must be uppercase',
//     }),
//     z.string(),
//   )
//   const result = await map.spa(
//     new Map([
//       ['first', 'foo'],
//       ['second', 'bar'],
//     ]),
//   )
//   expect(result.success).toEqual(false)
//   if (!result.success) {
//     expect(result.error.issues.length).toEqual(2)
//     expect(result.error.issues[0].code).toEqual(z.ZodIssueCode.custom)
//     expect(result.error.issues[0].message).toEqual('Keys must be uppercase')
//     expect(result.error.issues[1].code).toEqual(z.ZodIssueCode.custom)
//     expect(result.error.issues[1].message).toEqual('Keys must be uppercase')
//   }
// })
