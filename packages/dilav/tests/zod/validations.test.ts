import { it, expect } from 'vitest'
import { v } from '../../src'

it('array min', async () => {
  try {
    await v.array(v.string).min(4).parseAsync([])
  } catch (err) {
    expect((err as v.ValidationError).errors[0]).toEqual(
      'array contains 0 element(s) but must contain 4',
    )
  }
})

it('array max', async () => {
  try {
    await v.array(v.string).max(2).parseAsync(['asdf', 'asdf', 'asdf'])
  } catch (err) {
    expect((err as v.ValidationError).errors[0]).toEqual(
      'array contains 3 element(s) but may only contain 2',
    )
  }
})

it('array length', async () => {
  try {
    await v.array(v.string).length(2).parseAsync(['asdf', 'asdf', 'asdf'])
  } catch (err) {
    expect((err as v.ValidationError).errors[0]).toEqual(
      'array contains 3 element(s), but 2 are required',
    )
  }

  try {
    await v.array(v.string).length(2).parseAsync(['asdf'])
  } catch (err) {
    expect((err as v.ValidationError).errors[0]).toEqual(
      'array contains 1 element(s), but 2 are required',
    )
  }
})

it('string length', async () => {
  try {
    await v.string.length(4).parseAsync('asd')
  } catch (err) {
    expect((err as v.ValidationError).errors[0]).toEqual(
      "'asd' must contain exactly exactly 4 character(s)",
    )
  }

  try {
    await v.string.length(4).parseAsync('asdaa')
  } catch (err) {
    expect((err as v.ValidationError).errors[0]).toEqual(
      "'asdaa' must contain exactly exactly 4 character(s)",
    )
  }
})

it('string min', async () => {
  try {
    await v.string.min(4).parseAsync('asd')
  } catch (err) {
    expect((err as v.ValidationError).errors[0]).toEqual("'asd' is shorter than 4 character(s)")
  }
})

it('string max', async () => {
  try {
    await v.string.max(4).parseAsync('aasdfsdfsd')
  } catch (err) {
    expect((err as v.ValidationError).errors[0]).toEqual(
      "'aasdfsdfsd' is longer than 4 character(s)",
    )
  }
})

it('number min', async () => {
  try {
    await v.number.gte(3).parseAsync(2)
  } catch (err) {
    expect((err as v.ValidationError).errors[0]).toEqual('2 is not greater than or equal to 3')
  }
})

it('number max', async () => {
  try {
    await v.number.lte(3).parseAsync(4)
  } catch (err) {
    expect((err as v.ValidationError).errors[0]).toEqual('4 is not lesser than or equal to 3')
  }
})

it('number nonnegative', async () => {
  try {
    await v.number.nonnegative().parseAsync(-1)
  } catch (err) {
    expect((err as v.ValidationError).errors[0]).toEqual('-1 is not positive')
  }
})

it('number nonpositive', async () => {
  try {
    await v.number.nonpositive().parseAsync(1)
  } catch (err) {
    expect((err as v.ValidationError).errors[0]).toEqual('1 is not negative')
  }
})

it('number negative', async () => {
  try {
    await v.number.negative().parseAsync(1)
  } catch (err) {
    expect((err as v.ValidationError).errors[0]).toEqual('1 is not negative')
  }
})

it('number positive', async () => {
  try {
    await v.number.positive().parseAsync(-1)
  } catch (err) {
    expect((err as v.ValidationError).errors[0]).toEqual('-1 is not positive')
  }
})

it('instantiation', () => {
  v.string.min(5)
  v.string.max(5)
  v.string.length(5)
  v.string.email()
  v.string.url()
  v.string.uuid()
  v.string.min(5, () => 'Must be 5 or more characters long')
  v.string.max(5, () => 'Must be 5 or fewer characters long')
  v.string.length(5, () => 'Must be exactly 5 characters long')
  v.string.email(() => 'Invalid email address.')
  v.string.url(() => 'Invalid url')
  v.string.uuid(() => 'Invalid UUID')
})

it('int', async () => {
  const int = v.number.int()
  int.parse(4)
  expect(() => int.parse(3.5)).toThrow()
})
