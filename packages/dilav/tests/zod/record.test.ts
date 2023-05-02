import { it, expect } from 'vitest'
import { v } from '../../src'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const booleanRecord = v.record(v.boolean)
type booleanRecord = v.Infer<typeof booleanRecord>

const recordWithEnumKeys = v.record(v.enum(['Tuna', 'Salmon']), v.string)
type recordWithEnumKeys = v.Infer<typeof recordWithEnumKeys>

const recordWithLiteralKeys = v.record(v.union([v.literal('Tuna'), v.literal('Salmon')]), v.string)
type recordWithLiteralKeys = v.Infer<typeof recordWithLiteralKeys>

it('type inference', () => {
  assertEqual<booleanRecord, Record<string, boolean>>(true)

  assertEqual<recordWithEnumKeys, Partial<Record<'Tuna' | 'Salmon', string>>>(true)

  assertEqual<recordWithLiteralKeys, Partial<Record<'Tuna' | 'Salmon', string>>>(true)
})

it('methods', () => {
  booleanRecord.optional()
  booleanRecord.nullable()
})

it('string record parse - pass', () => {
  booleanRecord.parse({
    k1: true,
    k2: false,
    1234: false,
  })
})

it('string record parse - fail', () => {
  const badCheck = () =>
    booleanRecord.parse({
      asdf: 1234,
    } as any)
  expect(badCheck).toThrow()

  expect(() => booleanRecord.parse('asdf')).toThrow()
})

it('string record parse - fail', () => {
  const badCheck = () =>
    booleanRecord.parse({
      asdf: {},
    } as any)
  expect(badCheck).toThrow()
})

it('string record parse - fail', () => {
  const badCheck = () =>
    booleanRecord.parse({
      asdf: [],
    } as any)
  expect(badCheck).toThrow()
})

it('key schema', () => {
  const result1 = recordWithEnumKeys.parse({
    Tuna: 'asdf',
    Salmon: 'asdf',
  })
  expect(result1).toEqual({
    Tuna: 'asdf',
    Salmon: 'asdf',
  })

  const result2 = recordWithLiteralKeys.parse({
    Tuna: 'asdf',
    Salmon: 'asdf',
  })
  expect(result2).toEqual({
    Tuna: 'asdf',
    Salmon: 'asdf',
  })

  // shouldn't require us to specify all props in record
  const result3 = recordWithEnumKeys.parse({
    Tuna: 'abcd',
  })
  expect(result3).toEqual({
    Tuna: 'abcd',
  })

  // shouldn't require us to specify all props in record
  const result4 = recordWithLiteralKeys.parse({
    Salmon: 'abcd',
  })
  expect(result4).toEqual({
    Salmon: 'abcd',
  })

  expect(() =>
    recordWithEnumKeys.parse({
      Tuna: 'asdf',
      Salmon: 'asdf',
      Trout: 'asdf',
    }),
  ).toThrow()

  expect(() =>
    recordWithLiteralKeys.parse({
      Tuna: 'asdf',
      Salmon: 'asdf',

      Trout: 'asdf',
    }),
  ).toThrow()
})

// it("record element", () => {
//   expect(booleanRecord.element).toBeInstanceOf(v.ZodBoolean);
// });

it('key and value getters', () => {
  const rec = v.record(v.string, v.number)

  rec.definition.keySchema.parse('asdf')
  rec.definition.valueSchema.parse(1234)
  // rec.element.parse(1234)
})
