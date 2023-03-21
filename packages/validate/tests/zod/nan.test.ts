import { describe, it, expect } from 'vitest'
import { vNaN } from '../../src/types/init'

const schema = vNaN()
describe('adapted from zod nan', () => {
  it('passing validations', () => {
    schema.parse(NaN)
    schema.parse(Number('Not a number'))
  })

  it('failing validations', () => {
    expect(() => schema.parse(5)).toThrow()
    expect(() => schema.parse('John')).toThrow()
    expect(() => schema.parse(true)).toThrow()
    expect(() => schema.parse(null)).toThrow()
    expect(() => schema.parse(undefined)).toThrow()
    expect(() => schema.parse({})).toThrow()
    expect(() => schema.parse([])).toThrow()
  })
})
