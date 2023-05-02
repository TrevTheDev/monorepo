/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { it, expect } from 'vitest'
import { v } from '../../src'

// TODO: consider custom coerce error messages

it('string coercion', () => {
  const schema = v.string.coerce
  expect(schema.parse('sup')).toEqual('sup')
  expect(schema.parse('')).toEqual('')
  expect(schema.parse(12)).toEqual('12')
  expect(schema.parse(0)).toEqual('0')
  expect(schema.parse(-12)).toEqual('-12')
  expect(schema.parse(3.14)).toEqual('3.14')
  expect(schema.parse(BigInt(15))).toEqual('15')
  expect(schema.parse(NaN)).toEqual('NaN')
  expect(schema.parse(Infinity)).toEqual('Infinity')
  expect(schema.parse(-Infinity)).toEqual('-Infinity')
  expect(schema.parse(true)).toEqual('true')
  expect(schema.parse(false)).toEqual('false')
  expect(schema.parse(null)).toEqual('null')
  expect(schema.parse(undefined)).toEqual('undefined')
  expect(schema.parse({ hello: 'world!' })).toEqual('[object Object]')
  expect(schema.parse(['item', 'another_item'])).toEqual('item,another_item')
  expect(schema.parse([])).toEqual('')
  expect(schema.parse(new Date('2022-01-01T00:00:00.000Z'))).toEqual(
    new Date('2022-01-01T00:00:00.000Z').toString(),
  )
})

it('number coercion', () => {
  const schema = v.number.coerce
  expect(schema.parse('12')).toEqual(12)
  expect(schema.parse('0')).toEqual(0)
  expect(schema.parse('-12')).toEqual(-12)
  expect(schema.parse('3.14')).toEqual(3.14)
  expect(schema.parse('')).toEqual(0)
  expect(() => schema.parse('NOT_A_NUMBER')).toThrow() // v.ZodError
  expect(schema.parse(12)).toEqual(12)
  expect(schema.parse(0)).toEqual(0)
  expect(schema.parse(-12)).toEqual(-12)
  expect(schema.parse(3.14)).toEqual(3.14)
  expect(schema.parse(BigInt(15))).toEqual(15)
  expect(() => schema.parse(NaN)).toThrow() // v.ZodError
  expect(schema.parse(Infinity)).toEqual(Infinity)
  expect(schema.parse(-Infinity)).toEqual(-Infinity)
  expect(schema.parse(true)).toEqual(1)
  expect(schema.parse(false)).toEqual(0)
  expect(schema.parse(null)).toEqual(0)
  expect(() => schema.parse(undefined)).toThrow() // v.ZodError
  expect(() => schema.parse({ hello: 'world!' })).toThrow() // v.ZodError
  expect(() => schema.parse(['item', 'another_item'])).toThrow() // v.ZodError
  expect(schema.parse([])).toEqual(0)
  expect(schema.parse(new Date(1670139203496))).toEqual(1670139203496)
})

it('boolean coercion', () => {
  const schema = v.boolean.coerce
  expect(schema.parse('true')).toEqual(true)
  expect(schema.parse('false')).toEqual(true)
  expect(schema.parse('0')).toEqual(true)
  expect(schema.parse('1')).toEqual(true)
  expect(schema.parse('')).toEqual(false)
  expect(schema.parse(1)).toEqual(true)
  expect(schema.parse(0)).toEqual(false)
  expect(schema.parse(-1)).toEqual(true)
  expect(schema.parse(3.14)).toEqual(true)
  expect(schema.parse(BigInt(15))).toEqual(true)
  expect(schema.parse(NaN)).toEqual(false)
  expect(schema.parse(Infinity)).toEqual(true)
  expect(schema.parse(-Infinity)).toEqual(true)
  expect(schema.parse(true)).toEqual(true)
  expect(schema.parse(false)).toEqual(false)
  expect(schema.parse(null)).toEqual(false)
  expect(schema.parse(undefined)).toEqual(false)
  expect(schema.parse({ hello: 'world!' })).toEqual(true)
  expect(schema.parse(['item', 'another_item'])).toEqual(true)
  expect(schema.parse([])).toEqual(true)
  expect(schema.parse(new Date(1670139203496))).toEqual(true)
})

it('bigint coercion', () => {
  const schema = v.bigInt.coerce
  expect(schema.parse('5')).toEqual(BigInt(5))
  expect(schema.parse('0')).toEqual(BigInt(0))
  expect(schema.parse('-5')).toEqual(BigInt(-5))
  expect(() => schema.parse('3.14')).toThrow() // not a v.ZodError!
  expect(schema.parse('')).toEqual(BigInt(0))
  expect(() => schema.parse('NOT_A_NUMBER')).toThrow() // not a v.ZodError!
  expect(schema.parse(5)).toEqual(BigInt(5))
  expect(schema.parse(0)).toEqual(BigInt(0))
  expect(schema.parse(-5)).toEqual(BigInt(-5))
  expect(() => schema.parse(3.14)).toThrow() // not a v.ZodError!
  expect(schema.parse(BigInt(5))).toEqual(BigInt(5))
  expect(() => schema.parse(NaN)).toThrow() // not a v.ZodError!
  expect(() => schema.parse(Infinity)).toThrow() // not a v.ZodError!
  expect(() => schema.parse(-Infinity)).toThrow() // not a v.ZodError!
  expect(schema.parse(true)).toEqual(BigInt(1))
  expect(schema.parse(false)).toEqual(BigInt(0))
  expect(() => schema.parse(null as unknown as any)).toThrow() // not a v.ZodError!
  expect(() => schema.parse(undefined as unknown as any)).toThrow() // not a v.ZodError!
  expect(() => schema.parse({ hello: 'world!' } as unknown as any)).toThrow() // not a v.ZodError!
  expect(() => schema.parse(['item', 'another_item'] as unknown as any)).toThrow() // not a v.ZodError!
  expect(schema.parse([] as unknown as any)).toEqual(BigInt(0))
  expect(schema.parse(new Date(1670139203496) as unknown as any)).toEqual(BigInt(1670139203496))
})

it('date coercion', () => {
  const schema = v.date.coerce
  expect(schema.parse(new Date().toDateString())).toBeInstanceOf(Date)
  expect(schema.parse(new Date().toISOString())).toBeInstanceOf(Date)
  expect(schema.parse(new Date().toUTCString())).toBeInstanceOf(Date)
  expect(schema.parse('5')).toBeInstanceOf(Date)
  expect(schema.parse('0')).toBeInstanceOf(Date)
  expect(schema.parse('-5')).toBeInstanceOf(Date)
  expect(schema.parse('3.14')).toBeInstanceOf(Date)
  expect(() => schema.parse('')).toThrow() // v.ZodError
  expect(() => schema.parse('NOT_A_DATE')).toThrow() // v.ZodError
  expect(schema.parse(5)).toBeInstanceOf(Date)
  expect(schema.parse(0)).toBeInstanceOf(Date)
  expect(schema.parse(-5)).toBeInstanceOf(Date)
  expect(schema.parse(3.14)).toBeInstanceOf(Date)
  expect(() => schema.parse(BigInt(5) as unknown as any)).toThrow() // not a v.ZodError!
  expect(() => schema.parse(NaN)).toThrow() // v.ZodError
  expect(() => schema.parse(Infinity)).toThrow() // v.ZodError
  expect(() => schema.parse(-Infinity)).toThrow() // v.ZodError
  expect(schema.parse(true as unknown as any)).toBeInstanceOf(Date)
  expect(schema.parse(false as unknown as any)).toBeInstanceOf(Date)
  expect(schema.parse(null as unknown as any)).toBeInstanceOf(Date)
  expect(() => schema.parse(undefined as unknown as any)).toThrow() // v.ZodError
  expect(() => schema.parse({ hello: 'world!' } as unknown as any)).toThrow() // v.ZodError
  expect(() => schema.parse(['item', 'another_item'] as unknown as any)).toThrow() // v.ZodError
  expect(() => schema.parse([] as unknown as any)).toThrow() // v.ZodError
  expect(schema.parse(new Date())).toBeInstanceOf(Date)
})
