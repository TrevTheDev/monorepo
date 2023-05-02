/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, expect } from 'vitest'
import { v } from '../../src'

const stringSchema = v.string

it('safeparse fail', () => {
  const safe = stringSchema.safeParse(12)
  expect(v.isResult(safe)).toEqual(false)
  expect((safe as any)[0].errors.length).toBe(1)
})

it('safeparse pass', () => {
  const safe = stringSchema.safeParse('12')
  expect(v.isResult(safe)).toEqual(true)
  expect((safe as any)[1]).toEqual('12')
})

it('safeparse unexpected error', () => {
  expect(() =>
    stringSchema
      .customValidation((data) => {
        throw new Error(data)
      })
      .safeParse('12'),
  ).toThrow()
})
