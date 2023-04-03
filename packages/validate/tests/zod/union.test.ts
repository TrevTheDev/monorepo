import { it, expect } from 'vitest'
import { isResult } from 'toolbelt'
import { vNeverInstance, vUnion, vObject } from '../../src/types/init'
import { vStringInstance } from '../../src/types/string'
import { vNumberInstance } from '../../src/types/number'
import { firstErrorFromResultError } from '../../src/types/shared'

// import { firstErrorFromResultError } from '../../src/types/shared'

it('function parsing', () => {
  const schema = vUnion([vNeverInstance, vNeverInstance])
  const result = schema.safeParse('asdf')
  expect(isResult(result)).toEqual(false)
})

it('union 2', () => {
  const result = vUnion([vNumberInstance, vNeverInstance]).safeParse('a')
  expect(isResult(result)).toEqual(false)
})

it('return valid over invalid', () => {
  const schema = vUnion([
    vObject({
      email: vStringInstance.email(),
    }),
    vStringInstance,
  ])
  expect(schema.parse('asdf')).toEqual('asdf')
  expect(schema.parse({ email: 'asdlkjf@lkajsdf.com' })).toEqual({
    email: 'asdlkjf@lkajsdf.com',
  })
})

it('return dirty result over aborted', () => {
  const result = vUnion([vNumberInstance, vNeverInstance]).safeParse('a')
  expect(isResult(result)).toEqual(false)
  expect(firstErrorFromResultError(result)).toEqual('"a" is not a number')
})

it('options getter', () => {
  const union = vUnion([vStringInstance, vNumberInstance])
  union.definition.unionTypes[0].parse('asdf')
  union.definition.unionTypes[1].parse(1234)
})

it('readonly union', () => {
  const options = [vStringInstance, vNumberInstance] as const
  const union = vUnion(options)
  union.parse('asdf')
  union.parse(12)
})
