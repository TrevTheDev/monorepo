import { it, expect } from 'vitest'
import { vNaNInstance } from '../../src/types/init'

it('passing validations', () => {
  vNaNInstance.parse(NaN)
  vNaNInstance.parse(Number('Not a number'))
})

it('failing validations', () => {
  expect(() => vNaNInstance.parse(5)).toThrow()
  expect(() => vNaNInstance.parse('John')).toThrow()
  expect(() => vNaNInstance.parse(true)).toThrow()
  expect(() => vNaNInstance.parse(null)).toThrow()
  expect(() => vNaNInstance.parse(undefined)).toThrow()
  expect(() => vNaNInstance.parse({})).toThrow()
  expect(() => vNaNInstance.parse([])).toThrow()
})
