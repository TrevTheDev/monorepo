import { it, expect } from 'vitest'
import { v } from '../../src'

const literalTuna = v.literal('tuna')
const literalFortyTwo = v.literal(42)
const literalTrue = v.literal(true)

const terrificSymbol = Symbol('terrific')
const literalTerrificSymbol = v.literal(terrificSymbol)

it('passing validations', () => {
  literalTuna.parse('tuna')
  literalFortyTwo.parse(42)
  literalTrue.parse(true)
  literalTerrificSymbol.parse(terrificSymbol)
})

it('failing validations', () => {
  expect(() => literalTuna.parse('shark')).toThrow()
  expect(() => literalFortyTwo.parse(43)).toThrow()
  expect(() => literalTrue.parse(false)).toThrow()
  expect(() => literalTerrificSymbol.parse(Symbol('terrific'))).toThrow()
})

it('invalid_literal should have `received` field with data', () => {
  const data = 'shark'
  const result = literalTuna.safeParse(data)
  if (v.isError(result)) {
    expect(result[0].errors[0]).toBe(`"shark" is not identical to tuna`)
    expect(result[0].input).toBe(data)
  }
})
