import { describe, it, expect } from 'vitest'
import { vBooleanInstance } from '../src/types/boolean'

describe('sundry tests', () => {
  it('default', () => {
    const p = vBooleanInstance.default(true)
    expect(p.parse('x')).toEqual(true)
  })
})
