import { it, expect } from 'vitest'
import { vStringInstance } from '../../src/types/string'

it('safeparse fail', () => {
  const safe = vStringInstance.safeParse(12)
  expect(safe[1]).toEqual(undefined)
  if (safe[0]) expect(safe[0].errors.length).toEqual(1)
})

it('safeparse pass', () => {
  const safe = vStringInstance.safeParse('12')
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
