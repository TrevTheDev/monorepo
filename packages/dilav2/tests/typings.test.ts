import { it, expect } from 'vitest'
import { v } from '../src/dilav2'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

it('typing tests', () => {
  const A = v.literal('A')
  const B = v.literal('B')
  const X = v.literal('X')
  const Y = v.literal('Y')
  const example = v.union.advanced({ _type: v.string }, [
    v.union.advanced({ _type: A, duration: v.never }, [
      v.union.advanced({ flag: v.true }, [
        v.union.advanced({ technique: X }, [
          v.object({
            _type: A,
            flag: v.true,
            technique: X,
            time: v.number,
            delay: v.number,
          }),
        ]),
        v.union.advanced({ technique: Y }, [
          v.object({
            _type: A,
            flag: v.true,
            technique: Y,
            time: v.array([v.number, v.number]),
            delay: v.number,
          }),
        ]),
      ]),
      v.union.advanced({ flag: v.false, technique: v.never, time: v.never }, [
        v.object({
          _type: A,
          flag: v.false,
          delay: v.number,
        }),
      ]),
    ]),
    v.union.advanced(
      {
        _type: B,
        flag: v.never,
        technique: v.never,
        time: v.never,
      },
      [
        v.object({
          _type: B,
          duration: v.number,
          delay: v.number,
        }),
      ],
    ),
  ])
  example.parse({ _type: 'A', delay: 1, flag: true, technique: 'X', time: 1 })
  example.parse({ _type: 'A', delay: 1, flag: true, technique: 'Y', time: [1, 1] })
  example.parse({ _type: 'A', delay: 1, flag: false })
  example.parse({ _type: 'B', duration: 1, delay: 1 })

  const x = v.union.advanced({ a: v.literal('a') }, [
    v.object({ a: v.literal('a'), b: v.literal('b') }),
    v.object({ a: v.literal('a'), c: v.literal('c') }),
    v.union.advanced({ d: v.literal('d') }, [
      v.object({ a: v.literal('a'), d: v.literal('d'), e: v.literal('e') }),
    ]),
  ])
  const x1 = x.safeParse({ a: 'a', c: 'c' })
  const x2 = x.safeParse({ a: 'a', d: 'd', e: 'e' })

  assertEqual<v.Infer<typeof v.string>, string>(true)
  expect(v.string.type).toBe('string')
  assertEqual<typeof v.string.type, 'string'>(true)

  assertEqual<v.Infer<typeof v.number>, number>(true)
  expect(v.number.type).toBe('number')
  assertEqual<typeof v.number.type, 'number'>(true)

  assertEqual<v.Infer<typeof v.bigInt>, bigint>(true)
  expect(v.bigInt.type).toBe('bigint')
  assertEqual<typeof v.bigInt.type, 'bigint'>(true)

  assertEqual<v.Infer<typeof v.boolean>, boolean>(true)
  expect(v.boolean.type).toBe('boolean')
  assertEqual<typeof v.boolean.type, 'boolean'>(true)

  assertEqual<v.Infer<typeof v.date>, Date>(true)
  expect(v.date.type).toBe('Date')
  assertEqual<typeof v.date.type, 'Date'>(true)

  assertEqual<v.Infer<typeof v.symbol>, symbol>(true)
  expect(v.symbol.type).toBe('symbol')
  assertEqual<typeof v.symbol.type, 'symbol'>(true)

  assertEqual<v.Infer<typeof v.undefined>, undefined>(true)
  expect(v.undefined.type).toBe('undefined')
  assertEqual<typeof v.undefined.type, 'undefined'>(true)

  assertEqual<v.Infer<typeof v.null>, null>(true)
  expect(v.null.type).toBe('null')
  assertEqual<typeof v.null.type, 'null'>(true)

  assertEqual<v.Infer<typeof v.NaN>, number>(true)
  expect(v.NaN.type).toBe('NaN')
  assertEqual<typeof v.NaN.type, 'NaN'>(true)

  assertEqual<v.Infer<typeof v.nullish>, null | undefined>(true)
  expect(v.nullish.type).toBe('null|undefined')
  assertEqual<typeof v.nullish.type, 'null|undefined'>(true)

  assertEqual<v.Infer<typeof v.void>, void>(true)
  expect(v.void.type).toBe('void')
  assertEqual<typeof v.void.type, 'void'>(true)

  assertEqual<v.Infer<typeof v.any>, any>(true)
  expect(v.any.type).toBe('any')
  assertEqual<typeof v.any.type, 'any'>(true)

  assertEqual<v.Infer<typeof v.unknown>, unknown>(true)
  expect(v.unknown.type).toBe('unknown')
  assertEqual<typeof v.unknown.type, 'unknown'>(true)

  assertEqual<v.Infer<typeof v.never>, never>(true)
  expect(v.never.type).toBe('never')
  assertEqual<typeof v.never.type, 'never'>(true)

  const litH = v.literal('hello')
  assertEqual<v.Infer<typeof litH>, 'hello'>(true)
  expect(litH.type).toBe('"hello"')
  assertEqual<typeof litH.type, string>(true)

  const litN = v.literal(1)
  assertEqual<v.Infer<typeof litN>, 1>(true)
  expect(litN.type).toBe('1')
  assertEqual<typeof litN.type, string>(true)

  const litO = v.literal({ a: 1 })
  assertEqual<v.Infer<typeof litO>, { readonly a: 1 }>(true)
  expect(litO.type).toBe('{"a":1}')
  assertEqual<typeof litO.type, string>(true)

  const dt = new Date()
  const litD = v.literal(dt)
  assertEqual<v.Infer<typeof litD>, Date>(true)
  expect(litD.type).toBe(`${JSON.stringify(dt)}`)
  assertEqual<typeof litD.type, string>(true)

  const animalTypes = v.enum(['Dog', 'Cat', 'Fish'])
  assertEqual<v.Infer<typeof animalTypes>, 'Dog' | 'Cat' | 'Fish'>(true)
  expect(animalTypes.type).toBe(`"Dog"|"Cat"|"Fish"`)
  assertEqual<typeof animalTypes.type, string>(true)

  // eslint-disable-next-line no-shadow
  enum fooEnum {
    Cat = 1,
    Dog,
  }

  const fooNum = v.enum(fooEnum)
  // const x = fooNum.parse(d)
  // assertEqual<v.Infer<typeof fooNum>, fooEnum>(true)
  expect(fooNum.type).toBe(`"Cat"|"Dog"|1|2`)
  assertEqual<typeof fooNum.type, string>(true)

  const constEnum = v.enum({
    Cat: 1,
    Dog: 2,
  })
  // const x = constEnum.parse({})
  assertEqual<v.Infer<typeof constEnum>, 1 | 2>(true)
  expect(constEnum.type).toBe(`1|2`)
  assertEqual<typeof constEnum.type, string>(true)
  const constEnum2 = v.enum(
    {
      Cat: 1,
      Dog: 2,
    },
    { matchType: 'either' },
  )
  // const x = constEnum.parse({})
  assertEqual<v.Infer<typeof constEnum2>, 1 | 2 | 'Cat' | 'Dog'>(true)
  expect(constEnum2.type).toBe(`1|2|"Cat"|"Dog"`)
  assertEqual<typeof constEnum2.type, string>(true)

  const optional = v.optional(v.string)
  assertEqual<v.Infer<typeof optional>, string | undefined>(true)
  expect(optional.type).toBe(`string|undefined`)
  assertEqual<typeof optional.type, string>(true)

  const nullable = v.nullable(v.string)
  assertEqual<v.Infer<typeof nullable>, string | null>(true)
  expect(nullable.type).toBe(`string|null`)
  assertEqual<typeof nullable.type, string>(true)

  const nullishable = v.nullishable(v.string)
  assertEqual<v.Infer<typeof nullishable>, string | null | undefined>(true)
  expect(nullishable.type).toBe(`string|null|undefined`)
  assertEqual<typeof nullishable.type, string>(true)

  const obj = v.object({ a: v.string, b: v.literal('A') })
  assertEqual<v.Infer<typeof obj>, { a: string; b: 'A' }>(true)
  expect(obj.type).toBe(`{a:string,b:"A"}`)
  assertEqual<typeof obj.type, string>(true)

  const obj2 = v.object({ a: v.string }, v.unknown)
  assertEqual<v.Infer<typeof obj2>, { a: string }>(true)
  expect(obj2.type).toBe(`{a:string}&{[K in PropertyKey]: unknown}`)
  assertEqual<typeof obj2.type, string>(true)

  const array1 = v.array(v.string)
  assertEqual<v.Infer<typeof array1>, string[]>(true)
  expect(array1.type).toBe(`string[]`)
  assertEqual<typeof array1.type, string>(true)

  const array2 = v.array([v.string, v.array(v.number).spread, v.boolean])
  assertEqual<v.Infer<typeof array2>, [string, ...number[], boolean]>(true)
  expect(array2.type).toBe(`[string,...number[],boolean]`)
  assertEqual<typeof array2.type, string>(true)

  const stringOrBool1 = v.union([v.string, v.boolean])
  assertEqual<v.Infer<typeof stringOrBool1>, string | boolean>(true)
  expect(stringOrBool1.type).toBe(`string|boolean`)
  assertEqual<typeof stringOrBool1.type, string>(true)

  const intersection = v.intersection([v.enum(['A', 'B']), v.enum(['B', 'C'])])
  assertEqual<v.Infer<typeof intersection>, 'B'>(true)
  expect(intersection.type).toBe(`("A"|"B")&("B"|"C")`)
  assertEqual<typeof intersection.type, string>(true)

  const fooPromiseSchema = v.promise(v.string)
  assertEqual<v.Infer<typeof fooPromiseSchema>, v.ValidatedPromise<string>>(true)
  expect(fooPromiseSchema.type).toBe(`ValidatedPromise<string>`)
  assertEqual<typeof fooPromiseSchema.type, string>(true)

  class Foo {
    prop: string
  }

  const instanceOf = v.instanceOf(Foo)
  assertEqual<v.Infer<typeof instanceOf>, Foo>(true)
  expect(instanceOf.type).toBe(`Foo`)
  assertEqual<typeof instanceOf.type, string>(true)

  const record = v.record(v.string, v.number)
  assertEqual<v.Infer<typeof record>, Record<string, number>>(true)
  expect(record.type).toBe(`Record<string,number>`)
  assertEqual<typeof record.type, string>(true)

  const vMap = v.map([v.string, v.number])
  assertEqual<v.Infer<typeof vMap>, Map<string, number>>(true)
  expect(vMap.type).toBe(`Map<string,number>`)
  assertEqual<typeof vMap.type, string>(true)

  const vSet = v.set(v.string)
  assertEqual<v.Infer<typeof vSet>, Set<string>>(true)
  expect(vSet.type).toBe(`Set<string>`)
  assertEqual<typeof vSet.type, string>(true)

  const lazy = v.lazy(() => v.string)
  assertEqual<v.Infer<typeof lazy>, unknown>(true)
  expect(lazy.type).toBe(`lazy`)
  assertEqual<typeof lazy.type, string>(true)

  const bar1 = v.function({ args: [v.string], returns: v.void })
  assertEqual<v.Infer<typeof bar1>, (...args: [string]) => void>(true)
  expect(bar1.type).toBe(`(...args:[string])=>void`)
  assertEqual<typeof bar1.type, string>(true)

  const pxSchema = v.custom<`${number}px`>((value) => /^\d+px$/.test(value as string))
  assertEqual<v.Infer<typeof pxSchema>, `${number}px`>(true)
  expect(pxSchema.type).toBe(`custom`)
  assertEqual<typeof pxSchema.type, string>(true)

  const vStringOptional = v.string.optional()
  assertEqual<v.Infer<typeof vStringOptional>, string | undefined>(true)
  expect(vStringOptional.type).toBe(`string|undefined`)
  assertEqual<typeof vStringOptional.type, string>(true)

  const obj1 = v.object({ a: v.never, b: v.literal('B') }, v.unknown)
  obj1.parse({ b: 'B', c: 'C' })
  expect(() => obj1.parse({ b: 'b', a: 'C' })).toThrow()

  const BaseAbstract = v.object(
    {
      duration: v.never,
      delay: v.never,
      flag: v.never,
      technique: v.never,
      time: v.never,
    },
    v.unknown,
  )

  const AAbstract = BaseAbstract.extends({
    _type: v.literal('A'),
    delay: v.number,
  })

  const AAbstractFlagTrue = AAbstract.extends({
    flag: v.boolean.beTrue(),
  })

  const union = v.union.key('_type', [
    AAbstractFlagTrue.extends({ technique: v.literal('X'), time: v.number }),
    AAbstractFlagTrue.extends({
      technique: v.literal('Y'),
      time: v.array([v.number, v.number]),
    }),
    AAbstract.extends({
      flag: v.boolean.beFalse(),
    }),
    BaseAbstract.extends({
      _type: v.literal('B'),
      duration: v.number,
      delay: v.number,
    }),
  ])
  union.parse({
    _type: 'A',
    delay: 1,
    flag: true,
    technique: 'X',
    time: 1,
  })
  union.parse({
    _type: 'A',
    delay: 1,
    flag: true,
    technique: 'Y',
    time: [1, 1],
  })
  union.parse({
    _type: 'A',
    delay: 1,
    flag: false,
  })
  union.parse({
    _type: 'B',
    duration: 1,
    delay: 1,
  })

  // type B = v.Infer<typeof B>

  // type X =
  //   | {
  //       _type: 'A'
  //       delay: number
  //       flag: boolean
  //       technique: 'X'
  //       time: number
  //     }
  //   | {
  //       _type: 'A'
  //       delay: number
  //       flag: boolean
  //       technique: 'X'
  //       time: [number, number]
  //     }
  //   | {
  //       _type: 'A'
  //       delay: number
  //       flag: boolean
  //     }
  //   | {
  //       _type: 'B'
  //       duration: number
  //       delay: number
  //     }
})
