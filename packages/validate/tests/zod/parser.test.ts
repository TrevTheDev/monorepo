import { it, expect } from 'vitest'
import { vStringInstance } from '../../src/types/string'
import { vObject } from '../../src/types/object'
import { vArray, vIntersection, vUnion, vUnknownInstance } from '../../src/types/init'
import { vNumberInstance } from '../../src/types/number'

it('parse strict object with unknown keys', () => {
  expect(() =>
    vObject({ name: vStringInstance }).parse({ name: 'bill', unknownKey: 12 } as any),
  ).toThrow()
})

it('parse nonstrict object with unknown keys', () => {
  vObject({ name: vStringInstance }, vUnknownInstance).parse({ name: 'bill', unknownKey: 12 })
})

it('invalid left side of intersection', () => {
  expect(() => vIntersection([vStringInstance, vNumberInstance]).parse(12 as any)).toThrow()
})

it('invalid right side of intersection', () => {
  expect(() => vIntersection([vStringInstance, vNumberInstance]).parse('12' as any)).toThrow()
})

it('parsing non-array in tuple schema', () => {
  expect(() => vArray([]).parse('12' as any)).toThrow()
})

it('incorrect num elements in tuple', () => {
  expect(() => vArray([]).parse(['asdf'] as any)).toThrow()
})

it.skip('invalid enum value', () => {
  expect(() => vUnion(['Blue']).parse('Red' as any)).toThrow()
})

it('parsing unknown', () => {
  vStringInstance.parse('Red' as unknown)
})
