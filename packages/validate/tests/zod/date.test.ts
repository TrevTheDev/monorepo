import { it, expect } from 'vitest'
import { vDateInstance } from '../../src/types/date'

const beforeBenchmarkDate = new Date(2022, 10, 4)
const benchmarkDate = new Date(2022, 10, 5)
const afterBenchmarkDate = new Date(2022, 10, 6)

const minCheck = vDateInstance.min(benchmarkDate)
const maxCheck = vDateInstance.max(benchmarkDate)

it('passing validations', () => {
  minCheck.parse(benchmarkDate)
  minCheck.parse(afterBenchmarkDate)

  maxCheck.parse(benchmarkDate)
  maxCheck.parse(beforeBenchmarkDate)
})

it('failing validations', () => {
  expect(() => minCheck.parse(beforeBenchmarkDate)).toThrow()
  expect(() => maxCheck.parse(afterBenchmarkDate)).toThrow()
})

// it('min max getters', () => {
//   expect(minCheck.minDate).toEqual(benchmarkDate)
//   expect(minCheck.min(afterBenchmarkDate).minDate).toEqual(afterBenchmarkDate)

//   expect(maxCheck.maxDate).toEqual(benchmarkDate)
//   expect(maxCheck.max(beforeBenchmarkDate).maxDate).toEqual(beforeBenchmarkDate)
// })
