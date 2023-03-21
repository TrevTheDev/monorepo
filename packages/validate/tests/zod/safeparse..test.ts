import { describe, it, expect } from 'vitest'
import { vString } from '../../src/types/string'

const stringSchema = vString()
describe('adapted from zod safeparse', () => {
  it('safeparse fail', () => {
    const safe = stringSchema.safeParse(12)
    expect(safe[1]).toEqual(undefined)
    if (safe[0]) expect(safe[0].errors.length).toEqual(1)
  })

  it('safeparse pass', () => {
    const safe = stringSchema.safeParse('12')
    expect(safe[1]).toEqual('12')
    expect(safe[0]).toEqual(undefined)
  })

  // it('safeparse unexpected error', () => {
  //   expect(() =>
  //     stringSchema
  //       .refine((data) => {
  //         throw new Error(data)
  //       })
  //       .safeParse('12'),
  //   ).toThrow()
  // })
})
