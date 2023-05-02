import { it, expect } from 'vitest'
import { v } from '../../src'

const beforeBenchmarkDate = new Date(2022, 10, 4)
const benchmarkDate = new Date(2022, 10, 5)
const afterBenchmarkDate = new Date(2022, 10, 6)

const minCheck = v.date.min(benchmarkDate)
const maxCheck = v.date.max(benchmarkDate)
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

it.skip('min max getters', () => {
  // expect(minCheck.minDate).toEqual(benchmarkDate)
  // expect(minCheck.min(afterBenchmarkDate).minDate).toEqual(afterBenchmarkDate)
  // expect(maxCheck.maxDate).toEqual(benchmarkDate)
  // expect(maxCheck.max(beforeBenchmarkDate).maxDate).toEqual(beforeBenchmarkDate)
})
