import { it, expect } from 'vitest'
import { vObject } from '../../src/types/object'
import { vStringInstance } from '../../src/types/string'
import { vNumberInstance } from '../../src/types/number'
import { vArray } from '../../src/types/init'

it('object augmentation', () => {
  const Animal = vObject({
    species: vStringInstance,
  }).extends({
    population: vNumberInstance,
  })
  // overwrites `species`
  const ModifiedAnimal = Animal.extends({
    species: vArray(vStringInstance),
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
