import { it, expect } from 'vitest'
import { v } from '../../src'
import { Mocker } from './mocker'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const literalStringSchema = v.literal('asdf')
const literalNumberSchema = v.literal(12)
const literalBooleanSchema = v.literal(true)
const literalBigIntSchema = v.literal(BigInt(42))
const MySymbol = Symbol('stuff')
const literalSymbolSchema = v.literal(MySymbol)
const stringSchema = v.string
const numberSchema = v.number
const bigintSchema = v.bigInt
const booleanSchema = v.boolean
const dateSchema = v.date
const symbolSchema = v.symbol

const nullSchema = v.null
const undefinedSchema = v.undefined
const stringSchemaOptional = v.string.optional()
const stringSchemaNullable = v.string.nullable()
const numberSchemaOptional = v.number.optional()
const numberSchemaNullable = v.number.nullable()
const bigintSchemaOptional = v.bigInt.optional()
const bigintSchemaNullable = v.bigInt.nullable()
const booleanSchemaOptional = v.boolean.optional()
const booleanSchemaNullable = v.boolean.nullable()
const dateSchemaOptional = v.date.optional()
const dateSchemaNullable = v.date.nullable()
const symbolSchemaOptional = v.symbol.optional()
const symbolSchemaNullable = v.symbol.nullable()

const val = new Mocker()

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
  assertEqual<v.Infer<typeof literalSymbolSchema>, typeof MySymbol>(true)
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

it('parse dateSchema invalid date', async () => {
  try {
    await dateSchema.parseAsync(new Date('invalid'))
  } catch (err) {
    expect((err as v.ValidationError).errors[0]).toEqual('"Invalid Date" is not a Date')
  }
})
// ==============

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

it('parse undefinedSchema undefined ', () => {
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
  assertEqual<v.Infer<typeof literalStringSchema>, 'asdf'>(true)
  assertEqual<v.Infer<typeof literalNumberSchema>, 12>(true)
  assertEqual<v.Infer<typeof literalBooleanSchema>, true>(true)
  assertEqual<v.Infer<typeof literalBigIntSchema>, bigint>(true)
  assertEqual<v.Infer<typeof stringSchema>, string>(true)
  assertEqual<v.Infer<typeof numberSchema>, number>(true)
  assertEqual<v.Infer<typeof bigintSchema>, bigint>(true)
  assertEqual<v.Infer<typeof booleanSchema>, boolean>(true)
  assertEqual<v.Infer<typeof dateSchema>, Date>(true)
  assertEqual<v.Infer<typeof symbolSchema>, symbol>(true)

  assertEqual<v.Infer<typeof nullSchema>, null>(true)
  assertEqual<v.Infer<typeof undefinedSchema>, undefined>(true)
  assertEqual<v.Infer<typeof stringSchemaOptional>, string | undefined>(true)
  assertEqual<v.Infer<typeof stringSchemaNullable>, string | null>(true)
  assertEqual<v.Infer<typeof numberSchemaOptional>, number | undefined>(true)
  assertEqual<v.Infer<typeof numberSchemaNullable>, number | null>(true)
  assertEqual<v.Infer<typeof bigintSchemaOptional>, bigint | undefined>(true)
  assertEqual<v.Infer<typeof bigintSchemaNullable>, bigint | null>(true)
  assertEqual<v.Infer<typeof booleanSchemaOptional>, boolean | undefined>(true)
  assertEqual<v.Infer<typeof booleanSchemaNullable>, boolean | null>(true)
  assertEqual<v.Infer<typeof dateSchemaOptional>, Date | undefined>(true)
  assertEqual<v.Infer<typeof dateSchemaNullable>, Date | null>(true)
  assertEqual<v.Infer<typeof symbolSchemaOptional>, symbol | undefined>(true)
  assertEqual<v.Infer<typeof symbolSchemaNullable>, symbol | null>(true)

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

it('get literal value', () => {
  expect(literalStringSchema.definition.literal).toEqual('asdf')
})

it.skip('optional convenience methd', () => {
  // v.ostring().parse(undefined
  // v.onumber().parse(undefined
  // v.oboolean().parse(undefined
})
