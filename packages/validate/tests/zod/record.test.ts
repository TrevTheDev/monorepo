import { it, expect } from 'vitest'
import { vStringInstance } from '../../src/types/string'
import { vRecord } from '../../src/types/record'
import { vBooleanInstance } from '../../src/types/boolean'
import { VInfer } from '../../src/types/base'
import { vLiteral, vUnion } from '../../src/types/init'
import { vNumberInstance } from '../../src/types/number'
import { vEnum } from '../../src/types/enum'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const booleanRecord = vRecord(vBooleanInstance)
type booleanRecord = VInfer<typeof booleanRecord>

const recordWithEnumKeys = vRecord(vEnum(['Tuna', 'Salmon']), vStringInstance)
type recordWithEnumKeys = VInfer<typeof recordWithEnumKeys>

const recordWithLiteralKeys = vRecord(
  vUnion([vLiteral('Tuna'), vLiteral('Salmon')] as const),
  vStringInstance,
)
type recordWithLiteralKeys = VInfer<typeof recordWithLiteralKeys>

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
//   expect(booleanRecord.element).toBeInstanceOf(z.ZodBoolean);
// });

it('key and value getters', () => {
  const rec = vRecord(vStringInstance, vNumberInstance)

  rec.definition.keyParser.parse('asdf')
  rec.definition.valueParser.parse(1234)
  //   rec.element.parse(1234)
})
