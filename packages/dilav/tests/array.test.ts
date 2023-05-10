import { it, expect } from 'vitest'
import { v } from '../src'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const arrayTests = [
  {
    arr: [],
    passing: [[]],
    failing: [['a']],
    type: '[]',
  },
  {
    arr: [v.string],
    passing: [['a']],
    failing: [[1], [], ['a', 'a']],
    type: '[string]',
  },
  {
    arr: [v.string, v.number],
    passing: [['a', 1]],
    failing: [[1], [], ['a', 'a'], [1, 'a'], ['a', 1, undefined]],
    type: '[string,number]',
  },
  {
    arr: [v.string.optional()],
    passing: [['a'], [], [undefined]],
    failing: [[1], ['a', 'a']],
    type: '[string|undefined]',
  },
  {
    arr: [v.number, v.string.optional()],
    passing: [[1], [1, 'a'], [1, undefined]],
    failing: [[], ['a', 'a'], ['a', 1], [1, 'a', 2]],
    type: '[number,string|undefined]',
  },
  {
    arr: [v.array(v.number).spread],
    passing: [[], [1], [1, 2]],
    failing: [['a'], [1, 'a']],
    type: '[...number[]]',
  },
  {
    arr: [v.string, v.array(v.number).spread],
    passing: [['a'], ['a', 1], ['a', 1, 2]],
    failing: [[1], ['a', 'a'], ['a', 1, 2, 'a']],
    type: '[string,...number[]]',
  },
  {
    arr: [v.string, v.string.optional(), v.array(v.number).spread],
    passing: [['a'], ['a', undefined], ['a', 'a', 1, 2, 3]],
    failing: [
      ['a', 1],
      ['a', 'a', 'a'],
      ['a', 'a', 2, 'a'],
    ],
    type: '[string,string|undefined,...number[]]',
  },
  {
    arr: [v.array(v.number).spread, v.string],
    passing: [['a'], [1, 'a'], [1, 2, 'a']],
    failing: [[], ['a', 'a']],
    type: '[...number[],string]',
  },
  {
    arr: [v.string, v.string.optional(), v.array(v.number).spread, v.string],
    passing: [
      ['a', undefined, 'a'],
      ['a', undefined, 1, 1, 'a'],
      ['a', 'b', 1, 1, 'a'],
    ],
    failing: [[], ['a', 'a'], ['a', 'a', 1], ['a', 'a', 1, 1, 'a', 'a']],
    type: '[string,string|undefined,...number[],string]',
  },
  {
    arr: [v.string, v.array([v.number, v.array(v.boolean).spread]).spread, v.string],
    passing: [
      ['a', 1, 'a'],
      ['a', 1, true, true, 'a'],
    ],
    failing: [[], ['a', 'a'], ['a', 1, true], ['a', 1, true]],
    type: '[string,...[number,...boolean[]],string]',
  },
  {
    arr: [v.array([v.boolean, v.array([v.number, v.array(v.string).spread]).spread]).spread],
    passing: [
      [true, 1],
      [true, 1, 'a'],
      [true, 1, 'a', 'b'],
    ],
    failing: [[], [true, 1, 'a', 'b', 2]],
    type: '[...[boolean,...[number,...string[]]]]',
  },
  {
    arr: [
      v.array([v.boolean, v.array(v.number).spread]).spread,
      v.array([v.string, v.array([v.string, v.string]).spread]).spread,
    ],
    passing: [
      [true, 'a', 'a', 'a'],
      [true, 1, 'a', 'a', 'a'],
      [true, 1, 2, 'a', 'a', 'a'],
    ],
    failing: [
      [true, 'a', 'a'],
      [true, 'a', 'a', 'a', 'a'],
    ],
    type: '[...[boolean,...number[]],...[string,...[string,string]]]',
  },
] as any[]

const failingArrays = [
  [v.string.optional(), v.string],
  [v.string.optional(), v.string, v.string.optional()],
  [v.array(v.string).spread, v.string.optional()],
  [v.array(v.string).spread, v.array(v.string).spread],
  [v.array([v.string, v.array(v.string).spread]).spread, v.array(v.string).spread],
]

it('v.array Tests', () => {
  arrayTests.forEach((arrayTest) => {
    const t1 = v.array(arrayTest.arr)
    expect(t1.type).toEqual(arrayTest.type)
    arrayTest.passing.forEach((passTest) => {
      // debugger
      t1.parse(passTest)
    })
    arrayTest.failing.forEach((failTest) => {
      // debugger
      // t1.parse(failTest)
      expect(() => t1.parse(failTest)).toThrow()
    })
  })
})
it('v.array Tests', () => {
  failingArrays.forEach((arrayTest: any) => {
    expect(() => v.array(arrayTest)).toThrow()
  })
})
it('v.array Infinite', () => {
  const t1 = v.array(v.string)
  const arr = ['A', 'B']
  // t1.safeParse(arr)
  expect(JSON.stringify(t1.parse(arr))).toEqual(JSON.stringify(arr))
  expect(() => t1.parse(['A', 1, 2])).toThrow()
  expect(t1.type).toEqual('string[]')
  assertEqual<v.Infer<typeof t1>, string[]>(true)
})

it('v.array Finite1', () => {
  const t = [v.string, v.number] as const
  const t1 = v.array(t)
  const arr = ['a', 1]
  const r = t1.parse(arr)
  expect(JSON.stringify(r)).toEqual(JSON.stringify(arr))
})

it('v.array Finite2', () => {
  const t = [v.string, v.number, v.array(v.string).spread] as const
  const t1 = v.array(t)
  expect(JSON.stringify(t1.parse(['A', 1, 'B', `C`, `D`]))).toEqual(
    JSON.stringify(['A', 1, 'B', `C`, `D`]),
  )
  expect(() => t1.parse(['A', 1, 'B', `C`, 2])).toThrow()
  expect(() => t1.parse(['A', 1, 2, `C`, `D`])).toThrow()
  expect(() => t1.parse(['A', '1', 'B', `C`, `D`])).toThrow()
  expect(() => t1.parse([1, 1, 'B', `C`, `D`])).toThrow()
  expect(t1.type).toEqual('[string,number,...string[]]')
  assertEqual<v.Infer<typeof t1>, [string, number, ...string[]]>(true)
})

it('throws on [...T[], T?]', () => {
  const t = [v.array(v.string).spread, v.string.optional()] as const
  expect(() => v.array(t)).toThrow()
  if ((true as boolean) === false) {
    const x = v.array(t).parse([])
    assertEqual<typeof x, never>(true)
  }
})
it('throws on [T, ...T[], ...T[]]', () => {
  const t = [v.string, v.array(v.string).spread, v.array(v.string).spread] as const
  expect(() => v.array(t)).toThrow()
  if ((true as boolean) === false) {
    const x = v.array(t).parse([])
    assertEqual<typeof x, never>(true)
  }
})
it('throws on [T?, T]', () => {
  const t = [v.string.optional(), v.string] as const
  expect(() => v.array(t)).toThrow()
  if ((true as boolean) === false) {
    const x = v.array(t).parse([])
    assertEqual<typeof x, never>(true)
  }
})
it('parses [T, T]', () => {
  const t = [v.string, v.string, v.number] as const
  expect(JSON.stringify(v.array(t).parse(['A', 'B', 1]))).toEqual(JSON.stringify(['A', 'B', 1]))
  if ((true as boolean) === false) {
    const x = v.array(t).parse([])
    assertEqual<typeof x, [string, string, number]>(true)
  }
})
it('parses [T, ...T[], T]', () => {
  // const t = [v.string, v.array(v.string).spread, v.number] as const
  // expect(JSON.stringify(v.array(t).parse(['A', 'B', 'C', 1]))).toEqual(
  //   JSON.stringify(['A', 'B', 'C', 1]),
  // )
  // expect(JSON.stringify(v.array(t).parse(['A', 1]))).toEqual(JSON.stringify(['A', 1]))
  // const t1 = [v.number, v.array(v.string).spread, v.number] as const
  // expect(JSON.stringify(v.array(t1).parse([1, 'A', 1]))).toEqual(JSON.stringify([1, 'A', 1]))
  // expect(JSON.stringify(v.array(t1).parse([1, 1]))).toEqual(JSON.stringify([1, 1]))
  // if ((true as boolean) === false) {
  //   const x = v.array(t)
  //   assertEqual<v.Infer<typeof x>, [string, ...string[], number]>(true)
  // }
  const arr = v.array([v.string, v.array([v.string, v.number]).spread, v.boolean])
  // debugger
  // const z = v.array(t2).spread
  expect(JSON.stringify(arr.parse(['A', 'B', 2, true]))).toEqual(
    JSON.stringify(['A', 'B', 2, true]),
  )
  if ((true as boolean) === false) {
    const res1 = arr.parse(['A', 'B', 2, true])
    assertEqual<typeof res1, [string, string, number, boolean]>(true)
  }
})
it('parses [T?, T?]', () => {
  const t = [v.string.optional(), v.string.optional()] as const
  expect(JSON.stringify(v.array(t).parse(['A', 'A']))).toEqual(JSON.stringify(['A', 'A']))
  expect(JSON.stringify(v.array(t).parse([undefined, 'A']))).toEqual(
    JSON.stringify([undefined, 'A']),
  )
  expect(JSON.stringify(v.array(t).parse([undefined, undefined]))).toEqual(
    JSON.stringify([undefined, undefined]),
  )
  expect(JSON.stringify(v.array(t).parse([undefined]))).toEqual(JSON.stringify([undefined]))
  expect(JSON.stringify(v.array(t).parse(['A']))).toEqual(JSON.stringify(['A']))
  expect(JSON.stringify(v.array(t).parse([]))).toEqual(JSON.stringify([]))
  expect(() => JSON.stringify(v.array(t).parse(['A', 'A', 'A']))).toThrow()
  if ((true as boolean) === false) {
    const x = v.array(t)
    assertEqual<v.Infer<typeof x>, [string?, string?]>(true)
  }
})
it('parses [T?, ...T[]]', () => {
  const t = [v.string.optional(), v.array(v.number).spread] as const
  expect(JSON.stringify(v.array(t).parse([undefined, 1, 2]))).toEqual(
    JSON.stringify([undefined, 1, 2]),
  )
  expect(JSON.stringify(v.array(t).parse(['A', 1]))).toEqual(JSON.stringify(['A', 1]))
  expect(JSON.stringify(v.array(t).parse([undefined, 1]))).toEqual(JSON.stringify([undefined, 1]))
  expect(JSON.stringify(v.array(t).parse([undefined]))).toEqual(JSON.stringify([undefined]))
  expect(JSON.stringify(v.array(t).parse(['A']))).toEqual(JSON.stringify(['A']))
  expect(JSON.stringify(v.array(t).parse([]))).toEqual(JSON.stringify([]))
  if ((true as boolean) === false) {
    const x = v.array(t).parse([])
    assertEqual<typeof x, [string?, ...number[]]>(true)
  }
})
