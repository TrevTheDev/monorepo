import { it, expect } from 'vitest'
import { vBooleanInstance } from '../src/types/boolean'

it('default', () => {
  const p = vBooleanInstance.default(true)
  expect(p.parse('x')).toEqual(true)
})
