/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, expect } from 'vitest'
import { v } from '../../src'

it('parse strict object with unknown keys', () => {
  expect(() =>
    v
      .object({ name: v.string })
      .strict()
      .parse({ name: 'bill', unknownKey: 12 } as any),
  ).toThrow()
})

it('parse nonstrict object with unknown keys', () => {
  v.object({ name: v.string }).passThrough().parse({ name: 'bill', unknownKey: 12 })
})

it('invalid left side of intersection', () => {
  expect(() => v.intersection([v.string, v.number]).parse(12 as any)).toThrow()
})

it('invalid right side of intersection', () => {
  expect(() => v.intersection([v.string, v.number]).parse('12' as any)).toThrow()
})

it('parsing non-array in array schema', () => {
  expect(() => v.array([]).parse('12' as any)).toThrow()
})

it('incorrect num elements in array', () => {
  expect(() => v.array([]).parse(['asdf'] as any)).toThrow()
})

it('invalid enum value', () => {
  expect(() => v.enum(['Blue']).parse('Red' as any)).toThrow()
})

it('parsing unknown', () => {
  v.string.parse('Red' as unknown)
})
