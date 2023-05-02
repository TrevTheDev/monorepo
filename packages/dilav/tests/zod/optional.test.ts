/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, expect } from 'vitest'
import { v } from '../../src'

function checkErrors(a: any, bad: any) {
  let expected
  try {
    a.parse(bad)
  } catch (error) {
    expected = (error as any).formErrors
  }
  try {
    a.optional().parse(bad)
  } catch (error) {
    expect((error as any).formErrors).toEqual(expected)
  }
}

it('Should have error messages appropriate for the underlying type', () => {
  checkErrors(v.string.min(2), 1)
  v.string.min(2).optional().parse(undefined)
  checkErrors(v.number.gte(2), 1)
  v.number.gte(2).optional().parse(undefined)
  checkErrors(v.boolean, '')
  v.boolean.optional().parse(undefined)
  checkErrors(v.undefined, null)
  v.undefined.optional().parse(undefined)
  checkErrors(v.null, {})
  v.null.optional().parse(undefined)
  checkErrors(v.object({}), 1)
  v.object({}).optional().parse(undefined)
  checkErrors(v.array([]), 1)
  v.array([]).optional().parse(undefined)
  checkErrors(v.unknown, 1)
  v.unknown.optional().parse(undefined)
})

it('unwrap', () => {
  const unwrapped = v.string.optional().definition.wrappedSchema
  expect(unwrapped.baseType).toBe('string')
})
