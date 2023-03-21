import { describe, it, expect } from 'vitest'
import { vBigIntInstance } from '../../src/types/bigint'

const gtFive = vBigIntInstance.gt(BigInt(5))
const gteFive = vBigIntInstance.gte(BigInt(5))
const ltFive = vBigIntInstance.lt(BigInt(5))
const lteFive = vBigIntInstance.lte(BigInt(5))
const positive = vBigIntInstance.positive()
const negative = vBigIntInstance.negative()
const nonnegative = vBigIntInstance.nonnegative()
const nonpositive = vBigIntInstance.nonpositive()
// const multipleOfFive = vBigIntInstance.multipleOf(BigInt(5))
describe('adapted from zod bigint', () => {
  it('passing validations', () => {
    vBigIntInstance.parse(BigInt(1))
    vBigIntInstance.parse(BigInt(0))
    vBigIntInstance.parse(BigInt(-1))
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

  //   it('min max getters', () => {
  //     expect(vBigIntInstance.min(BigInt(5)).minValue).toEqual(BigInt(5))
  //     expect(vBigIntInstance.min(BigInt(5)).min(BigInt(10)).minValue).toEqual(BigInt(10))

  //     expect(vBigIntInstance.max(BigInt(5)).maxValue).toEqual(BigInt(5))
  //     expect(vBigIntInstance.max(BigInt(5)).max(BigInt(1)).maxValue).toEqual(BigInt(1))
  //   })
})
