import { it, expect } from 'vitest'
import { v } from '../../src'

it('string to number pipeline', () => {
  const schema = v.string.transform(Number).pipe(v.number)
  expect(schema.parse('1234')).toEqual(1234)
})

it.skip('string to number pipeline async', async () => {
  const schema = v.string.transform(async (val) => Number(val)).pipe(v.number)
  expect(await schema.parseAsync('1234')).toEqual(1234)
})

it('break if dirty', () => {
  const schema = v.string
    .customValidation((c) => (c === '12345' ? undefined : 'string error'))
    .transform((val) => Number(val))
    .pipe(v.number.customValidation((v1) => (v1 < 100 ? undefined : 'number error')))
  const r1: any = schema.safeParse('12345')
  expect(r1[0].errors.length).toBe(1)
  const r2: any = schema.safeParse('3')
  expect(r2[0].errors.length).toBe(1)
})
