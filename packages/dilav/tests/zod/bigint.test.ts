import { it, expect } from 'vitest'
import { v } from '../../src'

const gtFive = v.bigInt.gt(BigInt(5))
const gteFive = v.bigInt.gte(BigInt(5))
const ltFive = v.bigInt.lt(BigInt(5))
const lteFive = v.bigInt.lte(BigInt(5))
const positive = v.bigInt.positive()
const negative = v.bigInt.negative()
const nonnegative = v.bigInt.nonNegative()
const nonpositive = v.bigInt.nonPositive()
// const multipleOfFive = v.bigInt.multipleOf(BigInt(5))

it('passing validations', () => {
  v.bigInt.parse(BigInt(1))
  v.bigInt.parse(BigInt(0))
  v.bigInt.parse(BigInt(-1))
  gtFive.parse(BigInt(6))
  gteFive.parse(BigInt(5))
  gteFive.parse(BigInt(6))
  ltFive.parse(BigInt(4))
  lteFive.parse(BigInt(5))
  lteFive.parse(BigInt(4))
  positive.parse(BigInt(3))
  negative.parse(BigInt(-2))
  nonnegative.parse(BigInt(0))
  nonnegative.parse(BigInt(7))
  nonpositive.parse(BigInt(0))
  nonpositive.parse(BigInt(-12))
  // multipleOfFive.parse(BigInt(15))
})

it('failing validations', () => {
  expect(() => gtFive.parse(BigInt(5))).toThrow()
  expect(() => gteFive.parse(BigInt(4))).toThrow()
  expect(() => ltFive.parse(BigInt(5))).toThrow()
  expect(() => lteFive.parse(BigInt(6))).toThrow()
  expect(() => positive.parse(BigInt(0))).toThrow()
  expect(() => positive.parse(BigInt(-2))).toThrow()
  expect(() => negative.parse(BigInt(0))).toThrow()
  expect(() => negative.parse(BigInt(3))).toThrow()
  expect(() => nonnegative.parse(BigInt(-1))).toThrow()
  expect(() => nonpositive.parse(BigInt(1))).toThrow()
  // expect(() => multipleOfFive.parse(BigInt(13))).toThrow()
})

// it('min max getters', () => {
//   expect(v.bigInt.min(BigInt(5)).minValue).toEqual(BigInt(5))
//   expect(v.bigInt.min(BigInt(5)).min(BigInt(10)).minValue).toEqual(BigInt(10))

//   expect(v.bigInt.max(BigInt(5)).maxValue).toEqual(BigInt(5))
//   expect(v.bigInt.max(BigInt(5)).max(BigInt(1)).maxValue).toEqual(BigInt(1))
// })
