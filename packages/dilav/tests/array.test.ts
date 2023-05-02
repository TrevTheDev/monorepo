import { it, expect } from 'vitest'
import { vArray } from '../src/types/init'
import { vStringInstance } from '../src/types/string'
import { vNumberInstance } from '../src/types/number'
import { vBooleanInstance } from '../src/types/boolean'
import { VInfer } from '../src/types/base'

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
    arr: [vStringInstance],
    passing: [['a']],
    failing: [[1], [], ['a', 'a']],
    type: '[string]',
  },
  {
    arr: [vStringInstance, vNumberInstance],
    passing: [['a', 1]],
    failing: [[1], [], ['a', 'a'], [1, 'a'], ['a', 1, undefined]],
    type: '[string,number]',
  },
  {
    arr: [vStringInstance.optional()],
    passing: [['a'], [], [undefined]],
    failing: [[1], ['a', 'a']],
    type: '[string|undefined]',
  },
  {
    arr: [vNumberInstance, vStringInstance.optional()],
    passing: [[1], [1, 'a'], [1, undefined]],
    failing: [[], ['a', 'a'], ['a', 1], [1, 'a', 2]],
    type: '[number,string|undefined]',
  },
  {
    arr: [vArray(vNumberInstance).spread],
    passing: [[], [1], [1, 2]],
    failing: [['a'], [1, 'a']],
    type: '[...number[]]',
  },
  {
    arr: [vStringInstance, vArray(vNumberInstance).spread],
    passing: [['a'], ['a', 1], ['a', 1, 2]],
    failing: [[1], ['a', 'a'], ['a', 1, 2, 'a']],
    type: '[string,...number[]]',
  },
  {
    arr: [vStringInstance, vStringInstance.optional(), vArray(vNumberInstance).spread],
    passing: [['a'], ['a', undefined], ['a', 'a', 1, 2, 3]],
    failing: [
      ['a', 1],
      ['a', 'a', 'a'],
      ['a', 'a', 2, 'a'],
    ],
    type: '[string,string|undefined,...number[]]',
  },
  {
    arr: [vArray(vNumberInstance).spread, vStringInstance],
    passing: [['a'], [1, 'a'], [1, 2, 'a']],
    failing: [[], ['a', 'a']],
    type: '[...number[],string]',
  },
  {
    arr: [
      vStringInstance,
      vStringInstance.optional(),
      vArray(vNumberInstance).spread,
      vStringInstance,
    ],
    passing: [
      ['a', undefined, 'a'],
      ['a', undefined, 1, 1, 'a'],
      ['a', 'b', 1, 1, 'a'],
    ],
    failing: [[], ['a', 'a'], ['a', 'a', 1], ['a', 'a', 1, 1, 'a', 'a']],
    type: '[string,string|undefined,...number[],string]',
  },
  {
    arr: [
      vStringInstance,
      vArray([vNumberInstance, vArray(vBooleanInstance).spread]).spread,
      vStringInstance,
    ],
    passing: [
      ['a', 1, 'a'],
      ['a', 1, true, true, 'a'],
    ],
    failing: [[], ['a', 'a'], ['a', 1, true], ['a', 1, true]],
    type: '[string,...[number,...boolean[]],string]',
  },
  {
    arr: [
      vArray([vBooleanInstance, vArray([vNumberInstance, vArray(vStringInstance).spread]).spread])
        .spread,
    ],
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
      vArray([vBooleanInstance, vArray(vNumberInstance).spread]).spread,
      vArray([vStringInstance, vArray([vStringInstance, vStringInstance]).spread]).spread,
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
  [vStringInstance.optional(), vStringInstance],
  [vStringInstance.optional(), vStringInstance, vStringInstance.optional()],
  [vArray(vStringInstance).spread, vStringInstance.optional()],
  [vArray(vStringInstance).spread, vArray(vStringInstance).spread],
  [
    vArray([vStringInstance, vArray(vStringInstance).spread]).spread,
    vArray(vStringInstance).spread,
  ],
]

it('vArray Tests', () => {
  arrayTests.forEach((arrayTest) => {
    const t1 = vArray(arrayTest.arr)
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
it('vArray Tests', () => {
  failingArrays.forEach((arrayTest: any) => {
    expect(() => vArray(arrayTest)).toThrow()
  })
})
it('vArray Infinite', () => {
  const t1 = vArray(vStringInstance)
  const arr = ['A', 'B']
  // t1.safeParse(arr)
  expect(JSON.stringify(t1.parse(arr))).toEqual(JSON.stringify(arr))
  expect(() => t1.parse(['A', 1, 2])).toThrow()
  expect(t1.type).toEqual('string[]')
  assertEqual<VInfer<typeof t1>, string[]>(true)
})

it('vArray Finite1', () => {
  const t = [vStringInstance, vNumberInstance] as const
  const t1 = vArray(t)
  const arr = ['a', 1]
  const r = t1.parse(arr)
  expect(JSON.stringify(r)).toEqual(JSON.stringify(arr))
})

it('vArray Finite2', () => {
  const t = [vStringInstance, vNumberInstance, vArray(vStringInstance).spread] as const
  const t1 = vArray(t)
  expect(JSON.stringify(t1.parse(['A', 1, 'B', `C`, `D`]))).toEqual(
    JSON.stringify(['A', 1, 'B', `C`, `D`]),
  )
  expect(() => t1.parse(['A', 1, 'B', `C`, 2])).toThrow()
  expect(() => t1.parse(['A', 1, 2, `C`, `D`])).toThrow()
  expect(() => t1.parse(['A', '1', 'B', `C`, `D`])).toThrow()
  expect(() => t1.parse([1, 1, 'B', `C`, `D`])).toThrow()
  expect(t1.type).toEqual('[string,number,...string[]]')
  assertEqual<VInfer<typeof t1>, [string, number, ...string[]]>(true)
})

it('throws on [...T[], T?]', () => {
  const t = [vArray(vStringInstance).spread, vStringInstance.optional()] as const
  expect(() => vArray(t)).toThrow()
  if ((true as boolean) === false) {
    const x = vArray(t).parse([])
    assertEqual<typeof x, never>(true)
  }
})
it('throws on [T, ...T[], ...T[]]', () => {
  const t = [
    vStringInstance,
    vArray(vStringInstance).spread,
    vArray(vStringInstance).spread,
  ] as const
  expect(() => vArray(t)).toThrow()
  if ((true as boolean) === false) {
    const x = vArray(t).parse([])
    assertEqual<typeof x, never>(true)
  }
})
it('throws on [T?, T]', () => {
  const t = [vStringInstance.optional(), vStringInstance] as const
  expect(() => vArray(t)).toThrow()
  if ((true as boolean) === false) {
    const x = vArray(t).parse([])
    assertEqual<typeof x, never>(true)
  }
})
it('parses [T, T]', () => {
  const t = [vStringInstance, vStringInstance, vNumberInstance] as const
  expect(JSON.stringify(vArray(t).parse(['A', 'B', 1]))).toEqual(JSON.stringify(['A', 'B', 1]))
  if ((true as boolean) === false) {
    const x = vArray(t).parse([])
    assertEqual<typeof x, [string, string, number]>(true)
  }
})
it('parses [T, ...T[], T]', () => {
  // const t = [vStringInstance, vArray(vStringInstance).spread, vNumberInstance] as const
  // expect(JSON.stringify(vArray(t).parse(['A', 'B', 'C', 1]))).toEqual(
  //   JSON.stringify(['A', 'B', 'C', 1]),
  // )
  // expect(JSON.stringify(vArray(t).parse(['A', 1]))).toEqual(JSON.stringify(['A', 1]))
  // const t1 = [vNumberInstance, vArray(vStringInstance).spread, vNumberInstance] as const
  // expect(JSON.stringify(vArray(t1).parse([1, 'A', 1]))).toEqual(JSON.stringify([1, 'A', 1]))
  // expect(JSON.stringify(vArray(t1).parse([1, 1]))).toEqual(JSON.stringify([1, 1]))
  // if ((true as boolean) === false) {
  //   const x = vArray(t)
  //   assertEqual<VInfer<typeof x>, [string, ...string[], number]>(true)
  // }
  const t2 = [vStringInstance, vNumberInstance] as const
  // debugger
  // const z = vArray(t2).spread
  const t3 = [vStringInstance, vArray(t2).spread, vNumberInstance] as const
  expect(JSON.stringify(vArray(t3).parse(['A', 'B', 2, 1]))).toEqual(
    JSON.stringify(['A', 'B', 2, 1]),
  )
  if ((true as boolean) === false) {
    const res1 = vArray(t3).parse(['A', 'B', 2, 1])
    assertEqual<typeof res1, [string, string, number, number]>(true)
  }
})
it('parses [T?, T?]', () => {
  const t = [vStringInstance.optional(), vStringInstance.optional()] as const
  expect(JSON.stringify(vArray(t).parse(['A', 'A']))).toEqual(JSON.stringify(['A', 'A']))
  expect(JSON.stringify(vArray(t).parse([undefined, 'A']))).toEqual(
    JSON.stringify([undefined, 'A']),
  )
  expect(JSON.stringify(vArray(t).parse([undefined, undefined]))).toEqual(
    JSON.stringify([undefined, undefined]),
  )
  expect(JSON.stringify(vArray(t).parse([undefined]))).toEqual(JSON.stringify([undefined]))
  expect(JSON.stringify(vArray(t).parse(['A']))).toEqual(JSON.stringify(['A']))
  expect(JSON.stringify(vArray(t).parse([]))).toEqual(JSON.stringify([]))
  expect(() => JSON.stringify(vArray(t).parse(['A', 'A', 'A']))).toThrow()
  if ((true as boolean) === false) {
    const x = vArray(t)
    assertEqual<VInfer<typeof x>, [string?, string?]>(true)
  }
})
it('parses [T?, ...T[]]', () => {
  const t = [vStringInstance.optional(), vArray(vNumberInstance).spread] as const
  expect(JSON.stringify(vArray(t).parse([undefined, 1, 2]))).toEqual(
    JSON.stringify([undefined, 1, 2]),
  )
  expect(JSON.stringify(vArray(t).parse(['A', 1]))).toEqual(JSON.stringify(['A', 1]))
  expect(JSON.stringify(vArray(t).parse([undefined, 1]))).toEqual(JSON.stringify([undefined, 1]))
  expect(JSON.stringify(vArray(t).parse([undefined]))).toEqual(JSON.stringify([undefined]))
  expect(JSON.stringify(vArray(t).parse(['A']))).toEqual(JSON.stringify(['A']))
  expect(JSON.stringify(vArray(t).parse([]))).toEqual(JSON.stringify([]))
  if ((true as boolean) === false) {
    const x = vArray(t).parse([])
    assertEqual<typeof x, [string?, ...number[]]>(true)
  }
})
