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
    a.nullable().parse(bad)
  } catch (error) {
    expect((error as any).formErrors).toEqual(expected)
  }
}

it('Should have error messages appropriate for the underlying type', () => {
  checkErrors(v.string.min(2), 1)
  v.string.min(2).nullable().parse(null)
  checkErrors(v.number.gte(2), 1)
  v.number.gte(2).nullable().parse(null)
  checkErrors(v.boolean, '')
  v.boolean.nullable().parse(null)
  checkErrors(v.null, null)
  v.null.nullable().parse(null)
  checkErrors(v.null, {})
  v.null.nullable().parse(null)
  checkErrors(v.object({}), 1)
  v.object({}).nullable().parse(null)
  checkErrors(v.array([]), 1)
  v.array([]).nullable().parse(null)
  checkErrors(v.unknown, 1)
  v.unknown.nullable().parse(null)
})

it('unwrap', () => {
  const unwrapped = v.string.nullable().definition.wrappedSchema
  expect(unwrapped.baseType).toBe('string')
})
