import { it, expect } from 'vitest'
import { vStringInstance } from '../../src/types/string'
import { vArray } from '../../src/types/init'
import { vNumberInstance } from '../../src/types/number'
import { firstError } from '../../src/types/base'

it('array min', () => {
  try {
    vArray(vStringInstance).min(4).parse([])
  } catch (err) {
    expect(firstError(err)).toEqual('array contains 0 element(s) but must contain 4')
  }
})

it('array max', () => {
  try {
    vArray(vStringInstance).max(2).parse(['asdf', 'asdf', 'asdf'])
  } catch (err) {
    expect(firstError(err)).toEqual('array contains 3 element(s) but may only contain 2')
  }
})

it('array length', () => {
  try {
    vArray(vStringInstance).length(2).parse(['asdf', 'asdf', 'asdf'])
  } catch (err) {
    expect(firstError(err)).toEqual('array contains 3 element(s), but 2 are required')
  }

  try {
    vArray(vStringInstance).length(2).parse(['asdf'])
  } catch (err) {
    expect(firstError(err)).toEqual('array contains 1 element(s), but 2 are required')
  }
})

it('string length', () => {
  try {
    vStringInstance.length(4).parse('asd')
  } catch (err) {
    expect(firstError(err)).toEqual("'asd' must contain exactly exactly 4 character(s)")
  }

  try {
    vStringInstance.length(4).parse('asdaa')
  } catch (err) {
    expect(firstError(err)).toEqual("'asdaa' must contain exactly exactly 4 character(s)")
  }
})

it('string min', () => {
  try {
    vStringInstance.min(4).parse('asd')
  } catch (err) {
    expect(firstError(err)).toEqual("'asd' is shorter than 4 character(s)")
  }
})

it('string max', () => {
  try {
    vStringInstance.max(4).parse('aasdfsdfsd')
  } catch (err) {
    expect(firstError(err)).toEqual("'aasdfsdfsd' is longer than 4 character(s)")
  }
})

it('number min', () => {
  try {
    vNumberInstance.gte(3).parse(2)
  } catch (err) {
    expect(firstError(err)).toEqual('2 is not greater than or equal to 3')
  }
})

it('number max', () => {
  try {
    vNumberInstance.lte(3).parse(4)
  } catch (err) {
    expect(firstError(err)).toEqual('4 is not lesser than or equal to 3')
  }
})

it('number nonnegative', () => {
  try {
    vNumberInstance.nonnegative().parse(-1)
  } catch (err) {
    expect(firstError(err)).toEqual('-1 is not positive')
  }
})

it('number nonpositive', () => {
  try {
    vNumberInstance.nonpositive().parse(1)
  } catch (err) {
    expect(firstError(err)).toEqual('1 is not negative')
  }
})

it('number negative', () => {
  try {
    vNumberInstance.negative().parse(1)
  } catch (err) {
    expect(firstError(err)).toEqual('1 is not negative')
  }
})

it('number positive', () => {
  try {
    vNumberInstance.positive().parse(-1)
  } catch (err) {
    expect(firstError(err)).toEqual('-1 is not positive')
  }
})

it('instantiation', () => {
  vStringInstance.min(5)
  vStringInstance.max(5)
  vStringInstance.length(5)
  vStringInstance.email()
  vStringInstance.url()
  vStringInstance.uuid()
  vStringInstance.min(5, () => 'Must be 5 or more characters long')
  vStringInstance.max(5, () => 'Must be 5 or fewer characters long')
  vStringInstance.length(5, () => 'Must be exactly 5 characters long')
  vStringInstance.email(() => 'Invalid email address.')
  vStringInstance.url(() => 'Invalid url')
  vStringInstance.uuid(() => 'Invalid UUID')
})

it('int', () => {
  const int = vNumberInstance.int()
  int.parse(4)
  expect(() => int.parse(3.5)).toThrow()
})
