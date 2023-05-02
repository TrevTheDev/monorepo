import { it, expect } from 'vitest'
import { v } from '../../src'

it('function parsing', () => {
  const schema = v.union([
    v.string.customValidation(() => 'error'),
    v.number.customValidation(() => 'error'),
  ])
  const result = schema.safeParse('asdf')
  expect(v.isResult(result)).toEqual(false)
})

it('union 2', () => {
  const result = v.union([v.number, v.string.customValidation(() => 'error')]).safeParse('a')
  expect(v.isResult(result)).toEqual(false)
})

it('return valid over invalid', () => {
  const schema = v.union([
    v.object({
      email: v.string.email(),
    }),
    v.string,
  ])
  expect(schema.parse('asdf')).toEqual('asdf')
  expect(schema.parse({ email: 'asdlkjf@lkajsdf.com' })).toEqual({
    email: 'asdlkjf@lkajsdf.com',
  })
})

it('return dirty result over aborted', () => {
  const result = v.union([v.number, v.string.customValidation(() => 'error')]).safeParse('a')
  expect(v.isResult(result)).toEqual(false)
  if (v.isError(result)) expect(result[0].errors[0]).toEqual('"a" is not a number')
})

it('options getter', async () => {
  const union = v.union([v.string, v.number])
  union.definition.unionTypes[0].parse('asdf')
  union.definition.unionTypes[1].parse(1234)
  await union.definition.unionTypes[0].parseAsync('asdf')
  await union.definition.unionTypes[1].parseAsync(1234)
})

it('readonly union', async () => {
  const options = [v.string, v.number] as const
  const union = v.union(options)
  union.parse('asdf')
  union.parse(12)
})
