import { it, expect } from 'vitest'
import { isResult } from 'toolbelt'
import { vStringInstance } from '../../src/types/string'

const stringSchema = vStringInstance

it('safeparse fail', () => {
  const safe = stringSchema.safeParse(12)
  expect(isResult(safe)).toEqual(false)
  expect((safe[0] as any).errors.length).toBe(1)
})

it('safeparse pass', () => {
  const safe = stringSchema.safeParse('12')
  expect(isResult(safe)).toEqual(true)
  expect(safe[1] as any).toEqual('12')
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
