/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, expect } from 'vitest'
import { v } from '../../src'

it('object augmentation', () => {
  const Animal = v
    .object({
      species: v.string,
    })
    .extends({
      population: v.number,
    })
  // overwrites `species`
  const ModifiedAnimal = Animal.extends({
    species: v.array(v.string),
  })
  ModifiedAnimal.parse({
    species: ['asd'],
    population: 1324,
  })

  const bad = () =>
    ModifiedAnimal.parse({
      species: 'asdf',
      population: 1324,
    } as any)
  expect(bad).toThrow()
})
