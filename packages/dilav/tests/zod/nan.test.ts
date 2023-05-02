import { it, expect } from 'vitest'
import { v } from '../../src'

it('passing validations', () => {
  v.NaN.parse(NaN)
  v.NaN.parse(Number('Not a number'))
})

it('failing validations', () => {
  expect(() => v.NaN.parse(5)).toThrow()
  expect(() => v.NaN.parse('John')).toThrow()
  expect(() => v.NaN.parse(true)).toThrow()
  expect(() => v.NaN.parse(null)).toThrow()
  expect(() => v.NaN.parse(undefined)).toThrow()
  expect(() => v.NaN.parse({})).toThrow()
  expect(() => v.NaN.parse([])).toThrow()
})
