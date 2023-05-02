import { it, expect } from 'vitest'
import { v } from '../../src'

it('passing validations', () => {
  const example1 = v.custom<number>((x) => typeof x === 'number')
  example1.parse(1234)
  expect(() => example1.parse({})).toThrow()
})

it('string params', () => {
  const example1 = v.custom<number>((x) => typeof x !== 'number', {
    invalidValueFn: () => 'customer',
  })
  const result = example1.safeParse(1234)
  expect(v.isResult(result)).toEqual(false)
  if (v.isError(result))
    expect(JSON.stringify(result[0].errors[0]).includes('customer')).toEqual(true)
})
