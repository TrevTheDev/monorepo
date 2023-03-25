import { it, expect } from 'vitest'
import { vNumber } from '../../src/types/number'

const gtFive = vNumber().gt(5)
const gteFive = vNumber().gte(5)
const minFive = vNumber().min(5)
const ltFive = vNumber().lt(5)
const lteFive = vNumber().lte(5)
const maxFive = vNumber().max(5)
const intNum = vNumber().int()
const positive = vNumber().positive()
const negative = vNumber().negative()
const nonpositive = vNumber().nonpositive()
const nonnegative = vNumber().nonnegative()
const multipleOfFive = vNumber().multipleOf(5)
const multipleOfNegativeFive = vNumber().multipleOf(-5)
const finite = vNumber().finite()
const stepPointOne = vNumber().step(0.1)
const stepPointZeroZeroZeroOne = vNumber().step(0.0001)
const stepSixPointFour = vNumber().step(6.4)

it('passing validations', () => {
  vNumber().parse(1)
  vNumber().parse(1.5)
  vNumber().parse(0)
  vNumber().parse(-1.5)
  vNumber().parse(-1)
  vNumber().parse(Infinity)
  vNumber().parse(-Infinity)
  gtFive.parse(6)
  gtFive.parse(Infinity)
  gteFive.parse(5)
  gteFive.parse(Infinity)
  minFive.parse(5)
  minFive.parse(Infinity)
  ltFive.parse(4)
  ltFive.parse(-Infinity)
  lteFive.parse(5)
  lteFive.parse(-Infinity)
  maxFive.parse(5)
  maxFive.parse(-Infinity)
  intNum.parse(4)
  positive.parse(1)
  positive.parse(Infinity)
  negative.parse(-1)
  negative.parse(-Infinity)
  nonpositive.parse(0)
  nonpositive.parse(-1)
  nonpositive.parse(-Infinity)
  nonnegative.parse(0)
  nonnegative.parse(1)
  nonnegative.parse(Infinity)
  multipleOfFive.parse(15)
  multipleOfFive.parse(-15)
  multipleOfNegativeFive.parse(-15)
  multipleOfNegativeFive.parse(15)
  finite.parse(123)
  stepPointOne.parse(6)
  stepPointOne.parse(6.1)
  stepPointOne.parse(6.1)
  stepSixPointFour.parse(12.8)
  stepPointZeroZeroZeroOne.parse(3.01)
})

it('failing validations', () => {
  expect(() => ltFive.parse(5)).toThrow()
  expect(() => lteFive.parse(6)).toThrow()
  expect(() => maxFive.parse(6)).toThrow()
  expect(() => gtFive.parse(5)).toThrow()
  expect(() => gteFive.parse(4)).toThrow()
  expect(() => minFive.parse(4)).toThrow()
  expect(() => intNum.parse(3.14)).toThrow()
  expect(() => positive.parse(0)).toThrow()
  expect(() => positive.parse(-1)).toThrow()
  expect(() => negative.parse(0)).toThrow()
  expect(() => negative.parse(1)).toThrow()
  expect(() => nonpositive.parse(1)).toThrow()
  expect(() => nonnegative.parse(-1)).toThrow()
  expect(() => multipleOfFive.parse(7.5)).toThrow()
  expect(() => multipleOfFive.parse(-7.5)).toThrow()
  expect(() => multipleOfNegativeFive.parse(-7.5)).toThrow()
  expect(() => multipleOfNegativeFive.parse(7.5)).toThrow()
  expect(() => finite.parse(Infinity)).toThrow()
  expect(() => finite.parse(-Infinity)).toThrow()

  expect(() => stepPointOne.parse(6.11)).toThrow()
  expect(() => stepPointOne.parse(6.1000000001)).toThrow()
  expect(() => stepSixPointFour.parse(6.41)).toThrow()
})

it('parse NaN', () => {
  expect(() => vNumber().parse(NaN)).toThrow()
})

// it('min max getters', () => {
//   expect(vNumber().minValue).toBeNull
//   expect(ltFive.minValue).toBeNull
//   expect(lteFive.minValue).toBeNull
//   expect(maxFive.minValue).toBeNull
//   expect(negative.minValue).toBeNull
//   expect(nonpositive.minValue).toBeNull
//   expect(intNum.minValue).toBeNull
//   expect(multipleOfFive.minValue).toBeNull
//   expect(finite.minValue).toBeNull
//   expect(gtFive.minValue).toEqual(5)
//   expect(gteFive.minValue).toEqual(5)
//   expect(minFive.minValue).toEqual(5)
//   expect(minFive.min(10).minValue).toEqual(10)
//   expect(positive.minValue).toEqual(0)
//   expect(nonnegative.minValue).toEqual(0)

//   expect(vNumber().maxValue).toBeNull
//   expect(gtFive.maxValue).toBeNull
//   expect(gteFive.maxValue).toBeNull
//   expect(minFive.maxValue).toBeNull
//   expect(positive.maxValue).toBeNull
//   expect(nonnegative.maxValue).toBeNull
//   expect(intNum.minValue).toBeNull
//   expect(multipleOfFive.minValue).toBeNull
//   expect(finite.minValue).toBeNull
//   expect(ltFive.maxValue).toEqual(5)
//   expect(lteFive.maxValue).toEqual(5)
//   expect(maxFive.maxValue).toEqual(5)
//   expect(maxFive.max(1).maxValue).toEqual(1)
//   expect(negative.maxValue).toEqual(0)
//   expect(nonpositive.maxValue).toEqual(0)
// })

// it('int getter', () => {
//   expect(vNumber().isInt).toEqual(false)
//   expect(vNumber().multipleOf(1.5).isInt).toEqual(false)
//   expect(gtFive.isInt).toEqual(false)
//   expect(gteFive.isInt).toEqual(false)
//   expect(minFive.isInt).toEqual(false)
//   expect(positive.isInt).toEqual(false)
//   expect(nonnegative.isInt).toEqual(false)
//   expect(finite.isInt).toEqual(false)
//   expect(ltFive.isInt).toEqual(false)
//   expect(lteFive.isInt).toEqual(false)
//   expect(maxFive.isInt).toEqual(false)
//   expect(negative.isInt).toEqual(false)
//   expect(nonpositive.isInt).toEqual(false)

//   expect(intNum.isInt).toEqual(true)
//   expect(multipleOfFive.isInt).toEqual(true)
// })

// it('finite getter', () => {
//   expect(vNumber().isFinite).toEqual(false)
//   expect(gtFive.isFinite).toEqual(false)
//   expect(gteFive.isFinite).toEqual(false)
//   expect(minFive.isFinite).toEqual(false)
//   expect(positive.isFinite).toEqual(false)
//   expect(nonnegative.isFinite).toEqual(false)
//   expect(ltFive.isFinite).toEqual(false)
//   expect(lteFive.isFinite).toEqual(false)
//   expect(maxFive.isFinite).toEqual(false)
//   expect(negative.isFinite).toEqual(false)
//   expect(nonpositive.isFinite).toEqual(false)

//   expect(finite.isFinite).toEqual(true)
//   expect(intNum.isFinite).toEqual(true)
//   expect(multipleOfFive.isFinite).toEqual(true)
//   expect(vNumber().min(5).max(10).isFinite).toEqual(true)
// })
