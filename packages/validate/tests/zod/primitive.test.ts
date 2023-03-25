import { it, expect } from 'vitest'

import { vStringInstance } from '../../src/types/string'
import { vNumberInstance } from '../../src/types/number'
import { vBooleanInstance } from '../../src/types/boolean'
import { vBigIntInstance } from '../../src/types/bigint'
import { vSymbolInstance } from '../../src/types/symbol'
import { vLiteral, vNullInstance, vUndefinedInstance } from '../../src/types/init'
import { Mocker } from './mocker'
import { vDateInstance } from '../../src/types/date'
import { firstError } from '../../src/types/base'

const literalStringSchema = vLiteral('asdf' as const)

const literalNumberSchema = vLiteral(12 as const)
const literalBooleanSchema = vLiteral(true as const)
const literalBigIntSchema = vLiteral(BigInt(42) as 42n)
const MySymbol = Symbol('stuff')
const literalSymbolSchema = vLiteral(MySymbol)
const stringSchema = vStringInstance
const numberSchema = vNumberInstance
const bigintSchema = vBigIntInstance
const booleanSchema = vBooleanInstance
const dateSchema = vDateInstance
const symbolSchema = vSymbolInstance

const nullSchema = vNullInstance
const undefinedSchema = vUndefinedInstance
const stringSchemaOptional = vStringInstance.optional()
const stringSchemaNullable = vStringInstance.nullable()
const numberSchemaOptional = vNumberInstance.optional()
const numberSchemaNullable = vNumberInstance.nullable()
const bigintSchemaOptional = vBigIntInstance.optional()
const bigintSchemaNullable = vBigIntInstance.nullable()
const booleanSchemaOptional = vBooleanInstance.optional()
const booleanSchemaNullable = vBooleanInstance.nullable()
const dateSchemaOptional = vDateInstance.optional()
const dateSchemaNullable = vDateInstance.nullable()
const symbolSchemaOptional = vSymbolInstance.optional()
const symbolSchemaNullable = vSymbolInstance.nullable()

const val = new Mocker()

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

it('literal string correct', () => {
  expect(literalStringSchema.parse('asdf')).toBe('asdf')
})

it('literal string incorrect', () => {
  const f = () => literalStringSchema.parse('not_asdf')
  expect(f).toThrow()
})

it('literal string number', () => {
  const f = () => literalStringSchema.parse(123)
  expect(f).toThrow()
})

it('literal string boolean', () => {
  const f = () => literalStringSchema.parse(true)
  expect(f).toThrow()
})

it('literal string boolean', () => {
  const f = () => literalStringSchema.parse(true)
  expect(f).toThrow()
})

it('literal string object', () => {
  const f = () => literalStringSchema.parse({})
  expect(f).toThrow()
})

it('literal number correct', () => {
  expect(literalNumberSchema.parse(12)).toBe(12)
})

it('literal number incorrect', () => {
  const f = () => literalNumberSchema.parse(13)
  expect(f).toThrow()
})

it('literal number number', () => {
  const f = () => literalNumberSchema.parse(val.string)
  expect(f).toThrow()
})

it('literal number boolean', () => {
  const f = () => literalNumberSchema.parse(val.boolean)
  expect(f).toThrow()
})

it('literal number object', () => {
  const f = () => literalStringSchema.parse({})
  expect(f).toThrow()
})

it('literal boolean correct', () => {
  expect(literalBooleanSchema.parse(true)).toBe(true)
})

it('literal boolean incorrect', () => {
  const f = () => literalBooleanSchema.parse(false)
  expect(f).toThrow()
})

it('literal boolean number', () => {
  const f = () => literalBooleanSchema.parse('asdf')
  expect(f).toThrow()
})

it('literal boolean boolean', () => {
  const f = () => literalBooleanSchema.parse(123)
  expect(f).toThrow()
})

it('literal boolean object', () => {
  const f = () => literalBooleanSchema.parse({})
  expect(f).toThrow()
})

it('literal bigint correct', () => {
  expect(literalBigIntSchema.parse(BigInt(42))).toBe(BigInt(42))
})

it('literal bigint incorrect', () => {
  const f = () => literalBigIntSchema.parse(BigInt(43))
  expect(f).toThrow()
})

it('literal bigint number', () => {
  const f = () => literalBigIntSchema.parse('asdf')
  expect(f).toThrow()
})

it('literal bigint boolean', () => {
  const f = () => literalBigIntSchema.parse(123)
  expect(f).toThrow()
})

it('literal bigint object', () => {
  const f = () => literalBigIntSchema.parse({})
  expect(f).toThrow()
})

it('literal symbol', () => {
  assertEqual<ReturnType<typeof literalSymbolSchema.parse>, typeof MySymbol>(true)
  literalSymbolSchema.parse(MySymbol)
  expect(() => literalSymbolSchema.parse(Symbol('asdf'))).toThrow()
})

it('parse stringSchema string', () => {
  stringSchema.parse(val.string)
})

it('parse stringSchema number', () => {
  const f = () => stringSchema.parse(val.number)
  expect(f).toThrow()
})

it('parse stringSchema boolean', () => {
  const f = () => stringSchema.parse(val.boolean)
  expect(f).toThrow()
})

it('parse stringSchema undefined', () => {
  const f = () => stringSchema.parse(val.undefined)
  expect(f).toThrow()
})

it('parse stringSchema null', () => {
  const f = () => stringSchema.parse(val.null)
  expect(f).toThrow()
})

it('parse numberSchema string', () => {
  const f = () => numberSchema.parse(val.string)
  expect(f).toThrow()
})

it('parse numberSchema number', () => {
  numberSchema.parse(val.number)
})

it('parse numberSchema bigint', () => {
  const f = () => numberSchema.parse(val.bigint)
  expect(f).toThrow()
})

it('parse numberSchema boolean', () => {
  const f = () => numberSchema.parse(val.boolean)
  expect(f).toThrow()
})

it('parse numberSchema undefined', () => {
  const f = () => numberSchema.parse(val.undefined)
  expect(f).toThrow()
})

it('parse numberSchema null', () => {
  const f = () => numberSchema.parse(val.null)
  expect(f).toThrow()
})

it('parse bigintSchema string', () => {
  const f = () => bigintSchema.parse(val.string)
  expect(f).toThrow()
})

it('parse bigintSchema number', () => {
  const f = () => bigintSchema.parse(val.number)
  expect(f).toThrow()
})

it('parse bigintSchema bigint', () => {
  bigintSchema.parse(val.bigint)
})

it('parse bigintSchema boolean', () => {
  const f = () => bigintSchema.parse(val.boolean)
  expect(f).toThrow()
})

it('parse bigintSchema undefined', () => {
  const f = () => bigintSchema.parse(val.undefined)
  expect(f).toThrow()
})

it('parse bigintSchema null', () => {
  const f = () => bigintSchema.parse(val.null)
  expect(f).toThrow()
})

it('parse booleanSchema string', () => {
  const f = () => booleanSchema.parse(val.string)
  expect(f).toThrow()
})

it('parse booleanSchema number', () => {
  const f = () => booleanSchema.parse(val.number)
  expect(f).toThrow()
})

it('parse booleanSchema boolean', () => {
  booleanSchema.parse(val.boolean)
})

it('parse booleanSchema undefined', () => {
  const f = () => booleanSchema.parse(val.undefined)
  expect(f).toThrow()
})

it('parse booleanSchema null', () => {
  const f = () => booleanSchema.parse(val.null)
  expect(f).toThrow()
})

// ==============

it('parse dateSchema string', () => {
  const f = () => dateSchema.parse(val.string)
  expect(f).toThrow()
})

it('parse dateSchema number', () => {
  const f = () => dateSchema.parse(val.number)
  expect(f).toThrow()
})

it('parse dateSchema boolean', () => {
  const f = () => dateSchema.parse(val.boolean)
  expect(f).toThrow()
})

it('parse dateSchema date', () => {
  dateSchema.parse(val.date)
})

it('parse dateSchema undefined', () => {
  const f = () => dateSchema.parse(val.undefined)
  expect(f).toThrow()
})

it('parse dateSchema null', () => {
  const f = () => dateSchema.parse(val.null)
  expect(f).toThrow()
})

it('parse dateSchema invalid date', () => {
  try {
    dateSchema.parse(new Date('invalid'))
  } catch (err) {
    expect(firstError(err)).toEqual('ss')
  }
})
// // ==============

it('parse symbolSchema string', () => {
  const f = () => symbolSchema.parse(val.string)
  expect(f).toThrow()
})

it('parse symbolSchema number', () => {
  const f = () => symbolSchema.parse(val.number)
  expect(f).toThrow()
})

it('parse symbolSchema boolean', () => {
  const f = () => symbolSchema.parse(val.boolean)
  expect(f).toThrow()
})

it('parse symbolSchema date', () => {
  const f = () => symbolSchema.parse(val.date)
  expect(f).toThrow()
})

it('parse symbolSchema symbol', () => {
  symbolSchema.parse(val.symbol)
})

it('parse symbolSchema undefined', () => {
  const f = () => symbolSchema.parse(val.undefined)
  expect(f).toThrow()
})

it('parse symbolSchema null', () => {
  const f = () => symbolSchema.parse(val.null)
  expect(f).toThrow()
})

// ==============

it('parse undefinedSchema string', () => {
  const f = () => undefinedSchema.parse(val.string)
  expect(f).toThrow()
})

it('parse undefinedSchema number', () => {
  const f = () => undefinedSchema.parse(val.number)
  expect(f).toThrow()
})

it('parse undefinedSchema boolean', () => {
  const f = () => undefinedSchema.parse(val.boolean)
  expect(f).toThrow()
})

it('parse undefinedSchema undefined', () => {
  undefinedSchema.parse(val.undefined)
})

it('parse undefinedSchema null', () => {
  const f = () => undefinedSchema.parse(val.null)
  expect(f).toThrow()
})

it('parse nullSchema string', () => {
  const f = () => nullSchema.parse(val.string)
  expect(f).toThrow()
})

it('parse nullSchema number', () => {
  const f = () => nullSchema.parse(val.number)
  expect(f).toThrow()
})

it('parse nullSchema boolean', () => {
  const f = () => nullSchema.parse(val.boolean)
  expect(f).toThrow()
})

it('parse nullSchema undefined', () => {
  const f = () => nullSchema.parse(val.undefined)
  expect(f).toThrow()
})

it('parse nullSchema null', () => {
  nullSchema.parse(val.null)
})

it('primitive inference', () => {
  assertEqual<ReturnType<typeof literalStringSchema.parse>, 'asdf'>(true)
  assertEqual<ReturnType<typeof literalNumberSchema.parse>, 12>(true)
  assertEqual<ReturnType<typeof literalBooleanSchema.parse>, true>(true)
  assertEqual<ReturnType<typeof literalBigIntSchema.parse>, 42n>(true)
  assertEqual<ReturnType<typeof stringSchema.parse>, string>(true)
  assertEqual<ReturnType<typeof numberSchema.parse>, number>(true)
  assertEqual<ReturnType<typeof bigintSchema.parse>, bigint>(true)
  assertEqual<ReturnType<typeof booleanSchema.parse>, boolean>(true)
  assertEqual<ReturnType<typeof dateSchema.parse>, Date>(true)
  assertEqual<ReturnType<typeof symbolSchema.parse>, symbol>(true)

  assertEqual<ReturnType<typeof nullSchema.parse>, null>(true)
  assertEqual<ReturnType<typeof undefinedSchema.parse>, undefined>(true)
  assertEqual<ReturnType<typeof stringSchemaOptional.parse>, string | undefined>(true)
  assertEqual<ReturnType<typeof stringSchemaNullable.parse>, string | null>(true)
  assertEqual<ReturnType<typeof numberSchemaOptional.parse>, number | undefined>(true)
  assertEqual<ReturnType<typeof numberSchemaNullable.parse>, number | null>(true)
  assertEqual<ReturnType<typeof bigintSchemaOptional.parse>, bigint | undefined>(true)
  assertEqual<ReturnType<typeof bigintSchemaNullable.parse>, bigint | null>(true)
  assertEqual<ReturnType<typeof booleanSchemaOptional.parse>, boolean | undefined>(true)
  assertEqual<ReturnType<typeof booleanSchemaNullable.parse>, boolean | null>(true)
  assertEqual<ReturnType<typeof dateSchemaOptional.parse>, Date | undefined>(true)
  assertEqual<ReturnType<typeof dateSchemaNullable.parse>, Date | null>(true)
  assertEqual<ReturnType<typeof symbolSchemaOptional.parse>, symbol | undefined>(true)
  assertEqual<ReturnType<typeof symbolSchemaNullable.parse>, symbol | null>(true)

  // [
  //   literalStringSchemaTest,
  //   literalNumberSchemaTest,
  //   literalBooleanSchemaTest,
  //   literalBigIntSchemaTest,
  //   stringSchemaTest,
  //   numberSchemaTest,
  //   bigintSchemaTest,
  //   booleanSchemaTest,
  //   dateSchemaTest,
  //   symbolSchemaTest,

  //   nullSchemaTest,
  //   undefinedSchemaTest,
  //   stringSchemaOptionalTest,
  //   stringSchemaNullableTest,
  //   numberSchemaOptionalTest,
  //   numberSchemaNullableTest,
  //   bigintSchemaOptionalTest,
  //   bigintSchemaNullableTest,
  //   booleanSchemaOptionalTest,
  //   booleanSchemaNullableTest,
  //   dateSchemaOptionalTest,
  //   dateSchemaNullableTest,
  //   symbolSchemaOptionalTest,
  //   symbolSchemaNullableTest,

  // ];
})

// it('optional convenience method', () => {
//   z.ostring().parse(undefined)
//   z.onumber().parse(undefined)
//   z.oboolean().parse(undefined)
// })
